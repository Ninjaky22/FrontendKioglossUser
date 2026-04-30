import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import Breadcrumb from '../components/Breadcrumb';
import AccountSidebar from '../components/AccountSidebar';
import Swal from 'sweetalert2';

export default function Orders() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const ordersCount = orders.length;
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrollingTop, setIsScrollingTop] = useState(false);
    const scrollAnimationRef = useRef(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { navigate('/login'); return; }
        loadOrders();
    }, [isAuthenticated, authLoading, currentPage]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 240);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => () => {
        if (scrollAnimationRef.current) {
            window.cancelAnimationFrame(scrollAnimationRef.current);
        }
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await productService.getOrders(currentPage, 10);
            setOrders(data.content || data || []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir de tu cuenta?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-right-from-bracket mr-1"></i> Sí, salir',
            cancelButtonText: '<i class="fa-solid fa-xmark mr-1"></i> Cancelar',
            confirmButtonColor: '#610361',
            cancelButtonColor: '#9ca3af',
            customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
            },
        });
        if (result.isConfirmed) { logout(); navigate('/login'); }
    };

    const handleScrollTop = () => {
        const start = window.scrollY || 0;
        if (start === 0) return;
        setIsScrollingTop(true);
        if (scrollAnimationRef.current) {
            window.cancelAnimationFrame(scrollAnimationRef.current);
        }
        const duration = 900;
        const startTime = performance.now();
        const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - t, 3);
            window.scrollTo(0, Math.round(start * (1 - easeOut)));
            if (t < 1) {
                scrollAnimationRef.current = window.requestAnimationFrame(step);
                return;
            }
            scrollAnimationRef.current = null;
            setIsScrollingTop(false);
        };
        scrollAnimationRef.current = window.requestAnimationFrame(step);
    };

    const loadImageAsBase64 = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch { resolve(null); }
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    const downloadPDF = async (order) => {
        try {
        const { jsPDF } = await import('jspdf');
        const { autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF('p', 'pt');
        const purple = [97, 3, 97];
        const lightPurple = [243, 196, 255];
        const pageW = doc.internal.pageSize.getWidth();

        let logoLoaded = false;
        try {
            const logoBase64 = await loadImageAsBase64(window.location.origin + '/assets/images/logo.png');
            if (logoBase64) { doc.addImage(logoBase64, 'PNG', 40, 25, 120, 45); logoLoaded = true; }
        } catch { /* skip logo */ }
        if (!logoLoaded) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(...purple);
            doc.text('Kio Gloss', 40, 55);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Kio Gloss - Belleza & Cosméticos', 170, 40);
        doc.text('kiogloss@gmail.com', 170, 55);
        doc.text('+57 300 123 4567', 170, 70);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...purple);
        doc.text('FACTURA', pageW - 40, 42, { align: 'right' });
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text(`N° ${String(order.id).padStart(5, '0')}`, pageW - 40, 58, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(order.date || new Date().toLocaleDateString('es-CO'), pageW - 40, 73, { align: 'right' });

        doc.setDrawColor(...purple);
        doc.setLineWidth(2);
        doc.line(40, 88, pageW - 40, 88);

        autoTable(doc, {
            startY: 100,
            head: [['Facturar a']],
            body: [
                [user?.name || 'Cliente'],
                [user?.phoneNumber || ''],
                [user?.email || ''],
                [user?.account?.address || ''],
            ].filter(row => row[0]),
            headStyles: { fillColor: purple, fontSize: 10, font: 'helvetica' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 9, cellPadding: 4 },
            tableWidth: 200,
            margin: { left: 40 },
            theme: 'grid',
            styles: { lineColor: [220, 220, 220], lineWidth: 0.5 },
        });

        autoTable(doc, {
            startY: 100,
            head: [['Detalle del Pedido']],
            body: [
                [`Estado: ${order.status || 'PENDIENTE'}`],
            ],
            headStyles: { fillColor: purple, fontSize: 10, font: 'helvetica' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 9, cellPadding: 4 },
            tableWidth: 180,
            margin: { left: pageW - 220 },
            theme: 'grid',
            styles: { lineColor: [220, 220, 220], lineWidth: 0.5 },
        });

        const productsY = Math.max(doc.lastAutoTable?.finalY ?? 190, 190) + 20;
        const products = (order.shopping || []).map(item => ({
            descripcion: item.name || item.title || 'Producto',
            cantidad: item.quantity || 1,
            precioUnitario: `COP ${Number(item.price).toLocaleString('es-CO')}`,
            importe: `COP ${(Number(item.price) * (item.quantity || 1)).toLocaleString('es-CO')}`,
        }));

        autoTable(doc, {
            startY: productsY,
            columns: [
                { header: 'Descripción', dataKey: 'descripcion' },
                { header: 'Cant.', dataKey: 'cantidad' },
                { header: 'Precio Unitario', dataKey: 'precioUnitario' },
                { header: 'Importe', dataKey: 'importe' },
            ],
            body: products,
            headStyles: { fillColor: purple, fontSize: 10, font: 'helvetica', halign: 'center' },
            bodyStyles: { textColor: [30, 30, 30], fontSize: 9, cellPadding: 6 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { halign: 'center', cellWidth: 50 },
                2: { halign: 'right', cellWidth: 110 },
                3: { halign: 'right', cellWidth: 110 },
            },
            margin: { left: 40, right: 40 },
            theme: 'striped',
            alternateRowStyles: { fillColor: [252, 245, 255] },
            styles: { lineColor: [220, 220, 220], lineWidth: 0.3 },
        });

        const totalsY = (doc.lastAutoTable?.finalY ?? productsY) + 10;
        const subtotal = Number(order.amount) || 0;
        autoTable(doc, {
            startY: totalsY,
            body: [
                ['Subtotal', `COP ${subtotal.toLocaleString('es-CO')}`],
                ['Envío', 'Gratis'],
                ['TOTAL', `COP ${subtotal.toLocaleString('es-CO')}`],
            ],
            tableWidth: 220,
            margin: { left: pageW - 260 },
            theme: 'plain',
            columnStyles: {
                0: { halign: 'right', fontStyle: 'bold', fillColor: purple, textColor: [255, 255, 255], cellPadding: 6 },
                1: { halign: 'center', fillColor: lightPurple, textColor: [30, 30, 30], cellPadding: 6 },
            },
            styles: { fontSize: 10, lineColor: [220, 220, 220], lineWidth: 0.3 },
        });

        const footerY = doc.internal.pageSize.getHeight() - 60;
        doc.setDrawColor(...purple);
        doc.setLineWidth(1);
        doc.line(40, footerY, pageW - 40, footerY);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text('"La belleza comienza en el momento en que decides ser tú misma" — Coco Chanel', pageW / 2, footerY + 18, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...purple);
        doc.text('¡Gracias por tu compra! — Kio Gloss', pageW / 2, footerY + 35, { align: 'center' });

        doc.save(`factura-${order.id}.pdf`);
        } catch (err) {
            console.error('Error generando PDF:', err);
            alert('Error al generar la factura. Intenta de nuevo.');
        }
    };

    const getStatusColor = (status) => {
        const map = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            SHIPPED: 'bg-purple-100 text-purple-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return map[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const map = {
            PENDING: 'fa-solid fa-clock',
            PROCESSING: 'fa-solid fa-gear fa-spin',
            SHIPPED: 'fa-solid fa-truck',
            DELIVERED: 'fa-solid fa-circle-check',
            CANCELLED: 'fa-solid fa-circle-xmark',
        };
        return map[status?.toUpperCase()] || 'fa-solid fa-circle-question';
    };

    if (loading) return (
        <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_12%_-10%,#ffffff_0%,#f8e9ff_42%,#f3d6ff_100%)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/80 px-8 py-10 shadow-[0_24px_60px_rgba(97,3,97,0.18)] backdrop-blur">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#e9c9ff] border-t-[#610361]"></div>
                <p className="text-sm text-[#6b3b73]">Cargando tus pedidos...</p>
            </div>
        </div>
    );

    return (
        <div
            className="min-h-screen bg-[radial-gradient(1200px_circle_at_12%_-10%,#ffffff_0%,#f8e9ff_42%,#f3d6ff_100%)] font-winkySans"
            style={{ '--primary': '#610361', '--ink': '#3b0a3b', '--soft': '#f5e7ff', '--accent': '#ffe2f2' }}
        >

    
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Mis Pedidos' },
            ]} />
            <div className="container relative py-8 sm:py-10">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[280px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
                    <div className="hidden md:block">
                        <AccountSidebar
                            user={user}
                            allowPhotoUpload={false}
                            onLogout={handleLogout}
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_24px_60px_rgba(97,3,97,0.18)] backdrop-blur sm:p-8">
                            <div className="absolute -left-14 -top-16 h-36 w-36 rounded-full bg-(--soft) opacity-80 blur-3xl"></div>
                            <div className="absolute -right-12 top-10 h-28 w-28 rounded-full bg-(--accent) opacity-70 blur-3xl"></div>
                            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-[#9b4fa8]">Pedidos</p>
                                    <h2 className="mt-2 text-3xl font-bold text-(--primary) sm:text-4xl font-winkySans">
                                        <i className="fa-solid fa-bag-shopping mr-2"></i>Mis Pedidos
                                    </h2>
                                    <p className="mt-2 text-sm text-[#6b3b73] sm:text-base">
                                        Consulta el estado de tus compras y descarga tus facturas.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-(--soft) px-4 py-2 text-sm font-semibold text-(--primary) shadow-sm">
                                        <i className="fa-solid fa-box-archive"></i>
                                        {ordersCount} pedidos
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Empty state */}
                        {orders.length === 0 ? (
                            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-[0_30px_70px_rgba(97,3,97,0.18)] backdrop-blur">
                                <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-(--soft) opacity-70 blur-3xl"></div>
                                <div className="absolute -right-20 -bottom-10 h-52 w-52 rounded-full bg-(--accent) opacity-70 blur-3xl"></div>
                                <div className="relative">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-(--soft) text-4xl text-(--primary) shadow-lg">
                                        <i className="fa-solid fa-box-open"></i>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-(--ink)">Aún no tienes pedidos</h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm text-[#7a4b84]">
                                        Explora nuestra tienda y encuentra algo que te encante.
                                    </p>
                                    <Link
                                        to="/shop"
                                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-(--primary) px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4a024a]"
                                    >
                                        Comprar Ahora
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order, idx) => (
                                    <div key={order.id}
                                        className="group bg-white/75 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100/60 overflow-hidden"
                                        style={{ animationDelay: `${idx * 60}ms` }}>

                                        {/* Order header strip */}
                                        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3"
                                            style={{ background: 'linear-gradient(90deg, #faf0ff, #fdf4ff)' }}>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                {/* Order number badge */}
                                                <div className="px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold tracking-wider text-white bg-[#610361]">
                                                    
                                                    #{String(order.id).padStart(4, '0')}
                                                </div>

                                                {/* Status badge */}
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    <i className={`${getStatusIcon(order.status)} text-[10px]`}></i>
                                                    {order.status}
                                                </span>
                                            </div>

                                            {/* PDF button */}
                                            <button onClick={() => downloadPDF(order)}
                                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-winkySans font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                                                style={{ background: 'linear-gradient(135deg, #f3d5ff, #e9b8ff)', color: '#610361' }}>
                                                <i className="fa-solid fa-file-pdf"></i>
                                                Descargar PDF
                                            </button>
                                        </div>

                                        {/* Order body */}
                                        <div className="px-4 sm:px-6 pb-5 sm:pb-6">

                                            {/* Total */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-4 border-b border-purple-50">
                                                <span className="text-xs uppercase tracking-widest text-gray-400 font-winkySans">Total del pedido</span>
                                                <span className="text-lg sm:text-xl font-bold text-[#610361] font-winkySans">
                                                    COP {Number(order.amount).toLocaleString('es-CO')}
                                                </span>
                                            </div>

                                            {/* Products */}
                                            {order.shopping?.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    {order.shopping.map((item, i) => (
                                                        <div key={i}
                                                            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-2xl transition-colors duration-200 hover:bg-purple-50/50 group/item">

                                                            {/* Thumbnail */}
                                                            <Link to={`/product/${item.slug}`} className="shrink-0">
                                                                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-100 shadow-sm group-hover/item:shadow-md transition-shadow duration-200">
                                                                    <img
                                                                        src={item.image || '/assets/images/products/product1.jpg'}
                                                                        alt={item.title}
                                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }}
                                                                    />
                                                                </div>
                                                            </Link>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0 w-full">
                                                                <Link to={`/product/${item.slug}`}
                                                                    className="text-sm font-semibold text-[#610361] hover:text-[#a21caf] truncate block font-winkySans transition-colors duration-150">
                                                                    {item.title}
                                                                </Link>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {item.size && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-winkySans">
                                                                            <i className="fa-solid fa-ruler-horizontal text-[8px]"></i> {item.size}
                                                                        </span>
                                                                    )}
                                                                    {item.color && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 font-winkySans">
                                                                            <i className="fa-solid fa-palette text-[8px]"></i> {item.color}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Price & qty */}
                                                            <div className="text-right shrink-0 self-end sm:self-auto">
                                                                <div className="text-xs text-gray-400 font-winkySans mb-0.5">
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <i className="fa-solid fa-xmark text-[10px]"></i>
                                                                        {item.quantity || 1}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm font-bold text-gray-700 font-winkySans">
                                                                    COP {Number(item.price).toLocaleString('es-CO')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={handleScrollTop}
                className={`md:hidden fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-[#610361] text-white shadow-lg transition-all duration-300 hover:bg-[#4a024a] ${showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isScrollingTop ? 'animate-bounce scale-110 shadow-[0_18px_40px_rgba(97,3,97,0.35)]' : ''}`}
                aria-label="Volver arriba"
                title="Volver arriba"
                aria-hidden={!showScrollTop}
                tabIndex={showScrollTop ? 0 : -1}
            >
                <i className="fa-solid fa-arrow-up"></i>
            </button>
        </div>
    );
}