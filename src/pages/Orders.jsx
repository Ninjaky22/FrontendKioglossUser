import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import Breadcrumb from '../components/Breadcrumb';

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
        const purple = [97, 3, 97];       // #610361
        const lightPurple = [243, 196, 255];
        const pageW = doc.internal.pageSize.getWidth();

        // --- Logo ---
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

        // --- Company info ---
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Kio Gloss - Belleza & Cosméticos', 170, 40);
        doc.text('kiogloss@gmail.com', 170, 55);
        doc.text('+57 300 123 4567', 170, 70);

        // --- Invoice title & number ---
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

        // --- Separator line ---
        doc.setDrawColor(...purple);
        doc.setLineWidth(2);
        doc.line(40, 88, pageW - 40, 88);

        // --- Bill to ---
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

        // --- Order status ---
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

        // --- Products table ---
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

        // --- Totals table ---
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

        // --- Footer ---
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

    if (loading) return (
        <div className="bg-[#F7E6FE] flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#610361]"></div>
        </div>
    );

    return (
        <div className="bg-[#F7E6FE]">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Mis Pedidos' },
            ]} />
            <div className="container py-8">
                <h2 className="text-3xl font-bold text-[#610361] font-winkySans mb-6">
                    <i className="fa-solid fa-box mr-2"></i>Mis Pedidos
                </h2>
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl text-gray-600 font-winkySans">No tienes pedidos aún</h3>
                        <Link to="/shop" className="mt-6 inline-block px-8 py-3 bg-[#610361] text-white rounded-lg hover:bg-[#500250] transition font-winkySans">
                            Comprar Ahora
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl shadow p-6">
                                <div className="flex flex-wrap justify-between items-center mb-4">
                                    <div>
                                        <span className="text-lg font-bold text-[#610361] font-winkySans">Pedido #{order.id}</span>
                                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
                                    </div>
                                    <div className="flex gap-2 mt-2 md:mt-0">
                                        <button onClick={() => downloadPDF(order)}
                                            className="px-4 py-2 bg-[#f3d5ff] text-[#610361] rounded-lg hover:bg-[#ebbaff] transition text-sm font-winkySans">
                                            <i className="fa-solid fa-file-pdf mr-1"></i> PDF
                                        </button>
                                    </div>
                                </div>
                                <div className="text-lg font-semibold text-gray-800 font-winkySans">Total: COP {order.amount}</div>
                                {order.shopping?.length > 0 && (
                                    <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                                        {order.shopping.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                                <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                                                    <img 
                                                        src={item.image || '/assets/images/products/product1.jpg'} 
                                                        alt={item.title} 
                                                        className="w-16 h-16 object-cover rounded-md border border-gray-200 hover:opacity-80 transition"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }}
                                                    />
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <Link to={`/product/${item.slug}`} className="text-sm font-semibold text-[#610361] hover:underline truncate block font-winkySans">
                                                        {item.title}
                                                    </Link>
                                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                        {item.size && <span>Talla: {item.size}</span>}
                                                        {item.color && <span>Color: {item.color}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-winkySans">x{item.quantity || 1}</div>
                                                    <div className="text-sm font-semibold text-gray-800">COP {item.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
