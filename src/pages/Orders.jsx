import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import Breadcrumb from '../components/Breadcrumb';
import Swal from 'sweetalert2';

export default function Orders() {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { navigate('/login'); return; }
        loadOrders();
    }, [isAuthenticated, authLoading, currentPage]);

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
        <div className="min-h-screen flex flex-col items-center justify-center gap-4"
            style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 50%, #fce7f3 100%)' }}>
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#f3d5ff] border-t-[#610361] animate-spin"></div>
                <i className="fa-solid fa-bag-shopping absolute inset-0 flex items-center justify-center text-[#610361] text-lg"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
            </div>
            <p className="text-[#610361] font-winkySans text-sm tracking-widest uppercase opacity-70">Cargando pedidos…</p>
        </div>
    );

    return (
        <div className="font-winkySans min-h-screen"
            style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #f5e8ff 40%, #fce7f3 100%)' }}>

            {/* Decorative blobs */}
            <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #9333ea, transparent)', transform: 'translate(-40%, 40%)' }} />

            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Mis Pedidos' },
            ]} />

            <div className="container py-10 px-4 max-w-4xl mx-auto relative">

                {/* Header */}
                <div className="mb-10 flex items-end gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                        style={{ background: 'linear-gradient(135deg, #610361, #a21caf)' }}>
                        <i className="fa-solid fa-bag-shopping text-white text-xl"></i>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#a21caf] opacity-70 mb-0.5">Tu historial</p>
                        <h2 className="text-4xl font-bold text-[#610361] font-winkySans leading-none">Mis Pedidos</h2>
                    </div>
                </div>

                {/* Empty state */}
                {orders.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-purple-100">
                        <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #f3d5ff, #fce7f3)' }}>
                            <i className="fa-solid fa-box-open text-4xl text-[#c084fc]"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-[#610361] font-winkySans mb-2">Aún no tienes pedidos</h3>
                        <p className="text-gray-400 font-winkySans text-sm mb-8">¡Explora nuestra tienda y encuentra algo que te encante!</p>
                        <Link to="/shop"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl text-white font-winkySans font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                            style={{ background: 'linear-gradient(135deg, #610361, #a21caf)' }}>
                            <i className="fa-solid fa-sparkles"></i>
                            Comprar Ahora
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, idx) => (
                            <div key={order.id}
                                className="group bg-white/75 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100/60 overflow-hidden"
                                style={{ animationDelay: `${idx * 60}ms` }}>

                                {/* Order header strip */}
                                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
                                    style={{ background: 'linear-gradient(90deg, #faf0ff, #fdf4ff)' }}>
                                    <div className="flex items-center gap-3">
                                        {/* Order number badge */}
                                        <div className="px-3 py-1 rounded-xl text-xs font-bold tracking-wider text-white"
                                            style={{ background: 'linear-gradient(135deg, #610361, #a21caf)' }}>
                                            #{String(order.id).padStart(4, '0')}
                                        </div>

                                        {/* Status badge */}
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            <i className={`${getStatusIcon(order.status)} text-[10px]`}></i>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* PDF button */}
                                    <button onClick={() => downloadPDF(order)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-winkySans font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                                        style={{ background: 'linear-gradient(135deg, #f3d5ff, #e9b8ff)', color: '#610361' }}>
                                        <i className="fa-solid fa-file-pdf"></i>
                                        Descargar PDF
                                    </button>
                                </div>

                                {/* Order body */}
                                <div className="px-6 pb-6">

                                    {/* Total */}
                                    <div className="flex items-center justify-between py-4 border-b border-purple-50">
                                        <span className="text-xs uppercase tracking-widest text-gray-400 font-winkySans">Total del pedido</span>
                                        <span className="text-xl font-bold text-[#610361] font-winkySans">
                                            COP {Number(order.amount).toLocaleString('es-CO')}
                                        </span>
                                    </div>

                                    {/* Products */}
                                    {order.shopping?.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            {order.shopping.map((item, i) => (
                                                <div key={i}
                                                    className="flex items-center gap-4 p-3 rounded-2xl transition-colors duration-200 hover:bg-purple-50/50 group/item">

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
                                                    <div className="flex-1 min-w-0">
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
                                                    <div className="text-right shrink-0">
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
    );
}