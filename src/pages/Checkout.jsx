import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import cartService from '../services/cartService';
import Breadcrumb from '../components/Breadcrumb';
import PayPalButton from '../components/PayPalButton';
import Swal from 'sweetalert2';

// ── Toast mixin: esquina superior derecha, sin botón de confirmación, fuente winkySans ──
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: { popup: 'font-winkySans' },
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});

export default function Checkout() {
    const navigate = useNavigate();
    const { isAuthenticated, user, accountId } = useAuth();
    const { cart, cartTotalItems, cartGrandTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (cartTotalItems === 0 && cart.length === 0) { navigate('/cart'); return; }
    }, [isAuthenticated, cartTotalItems, cart.length, navigate]);

    const processOrder = async (orderStatus = 'PENDING', paypalData = null) => {
        if (!accountId) {
            setError('No se pudo obtener la cuenta. Inicia sesión de nuevo.');
            Toast.fire({
                icon: 'error',
                title: 'Sesión requerida',
                text: 'No se pudo obtener la cuenta. Inicia sesión de nuevo.',
            });
            return;
        }
        setLoading(true); setError('');
        try {
            const allItems = isAuthenticated ? await cartService.getAllCartItems() : cart;
            const shopping = allItems.map(item => ({
                product: item.variantId,
                quantity: item.quantity,
                price: item.price,
            }));
            await productService.createOrder({
                account: accountId,
                shopping,
                amount: cartGrandTotal,
                status: orderStatus,
            });
            await clearCart();
            await Toast.fire({
                icon: 'success',
                title: '¡Enhorabuena!',
                text: orderStatus === 'PROCESSING'
                    ? 'Tu pago fue procesado y el pedido ha sido creado.'
                    : 'Pedido realizado correctamente.',
            });
            navigate('/orders');
        } catch (err) {
            console.error('Error creating order', err);
            const msg = err?.response?.data?.message || err?.message || '';
            if (msg.includes('Stock insuficiente')) {
                setError(msg);
                Toast.fire({
                    icon: 'warning',
                    title: 'Stock insuficiente',
                    text: msg,
                });
            } else {
                setError('Error al procesar el pedido. Intenta de nuevo.');
                Toast.fire({
                    icon: 'error',
                    title: 'Error al procesar',
                    text: 'No se pudo crear el pedido. Por favor intenta de nuevo.',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayPalSuccess = (paypalOrder) => processOrder('PROCESSING', paypalOrder);
    const handlePayPalError = (err) => {
        Toast.fire({
            icon: 'error',
            title: 'Error con PayPal',
            text: 'Hubo un error con el pago. Por favor intenta de nuevo.',
        });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#fdf6ff] via-[#f8edf8] to-[#fff5fb] font-winkySans">

            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: <span className="text-[#4a577e]">Carrito</span>, path: '/cart' },
                { label: 'Checkout' },
            ]} />

            <div className="max-w-[1160px] mx-auto px-6 pt-8 pb-16">

                {/* ── Título ── */}
                <h1 className="text-3xl font-semibold text-[#610361] font-winkySans mb-7 flex items-center gap-3">
                    <span className="w-11 h-11 bg-[#610361] rounded-xl flex items-center justify-center text-white text-lg shrink-0">
                        <i className="fa-solid fa-bag-shopping"></i>
                    </span>
                    Finalizar Compra
                </h1>

                {/* ── Error ── */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                        <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                        {error}
                    </div>
                )}

                {/* ── Grid principal ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-start">

                    {/* ── Columna izquierda ── */}
                    <div className="space-y-5">

                        {/* Datos de envío */}
                        <div className="bg-white rounded-2xl border border-[#e8d5e8] shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#e8d5e8] flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#f3e6f3] flex items-center justify-center text-[#610361] text-sm">
                                    <i className="fa-solid fa-location-dot"></i>
                                </div>
                                <h3 className="text-base font-semibold text-[#1a1a2e] font-winkySans">Información de Envío</h3>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                            Nombre
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-[#610361] opacity-50 text-xs pointer-events-none"></i>
                                            <input type="text" value={user?.name || ''} readOnly
                                                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#e8d5e8] bg-[#faf0fa] text-sm text-[#1a1a2e] focus:outline-none focus:border-[#610361] transition-colors" />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[#610361] opacity-50 text-xs pointer-events-none"></i>
                                            <input type="text" value={user?.email || ''} readOnly
                                                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#e8d5e8] bg-[#faf0fa] text-sm text-[#1a1a2e] focus:outline-none focus:border-[#610361] transition-colors" />
                                        </div>
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                            Teléfono
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-[#610361] opacity-50 text-xs pointer-events-none"></i>
                                            <input type="text" value={user?.phoneNumber || ''} readOnly
                                                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#e8d5e8] bg-[#faf0fa] text-sm text-[#1a1a2e] focus:outline-none focus:border-[#610361] transition-colors" />
                                        </div>
                                    </div>

                                    {/* Dirección */}
                                    <div>
                                        <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                            Dirección
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-map-pin absolute left-3 top-1/2 -translate-y-1/2 text-[#610361] opacity-50 text-xs pointer-events-none"></i>
                                            <input type="text" value={user?.account?.address || ''} readOnly
                                                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#e8d5e8] bg-[#faf0fa] text-sm text-[#1a1a2e] focus:outline-none focus:border-[#610361] transition-colors" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Método de pago */}
                        <div className="bg-white rounded-2xl border border-[#e8d5e8] shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#e8d5e8] flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#f3e6f3] flex items-center justify-center text-[#610361] text-sm">
                                    <i className="fa-brands fa-paypal"></i>
                                </div>
                                <h3 className="text-base font-semibold text-[#1a1a2e] font-winkySans">Método de Pago</h3>
                            </div>

                            {/* PayPal section */}
                            <div className="px-6 pt-5 pb-5">
                                {/* Label con líneas decorativas */}
                                <div className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-widest text-gray-400 mb-3.5">
                                    <span className="flex-1 h-px bg-[#e8d5e8]"></span>
                                    Pagar de forma segura con PayPal
                                    <span className="flex-1 h-px bg-[#e8d5e8]"></span>
                                </div>
                                <PayPalButton
                                    amount={cartGrandTotal}
                                    onSuccess={handlePayPalSuccess}
                                    onError={handlePayPalError}
                                    description={`Pedido de ${user?.name} - Kiogloss`}
                                />
                            </div>

                            {/* Footer PayPal */}
                            <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#e8d5e8] gap-3 flex-wrap">
                                <span className="flex items-center gap-1.5 text-[0.72rem] text-gray-400 italic">
                                    <i className="fa-solid fa-circle-info"></i>
                                    El total se convertirá a USD para procesar con PayPal
                                </span>
                                <button
                                    onClick={() => processOrder('PENDING')}
                                    disabled={loading}
                                    className="text-[0.72rem] font-bold uppercase tracking-wider text-[#610361] border border-[#610361] rounded-lg px-3.5 py-1.5 hover:bg-[#610361] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {loading ? 'Procesando...' : 'Pagar después'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Columna derecha – Resumen ── */}
                    <div className="lg:sticky lg:top-6 space-y-4">

                        <div className="bg-white rounded-2xl border border-[#e8d5e8] shadow-sm overflow-hidden">

                            {/* Header resumen */}
                            <div className="px-6 py-4 border-b border-[#e8d5e8] flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#f3e6f3] flex items-center justify-center text-[#610361] text-sm">
                                        <i className="fa-solid fa-receipt"></i>
                                    </div>
                                    <h3 className="text-base font-semibold text-[#1a1a2e] font-winkySans">Resumen del Pedido</h3>
                                </div>
                                <span className="text-[0.65rem] font-bold bg-[#610361] text-white rounded-full px-2 py-0.5 uppercase tracking-wider">
                                    {cartTotalItems} items
                                </span>
                            </div>

                            {/* Items */}
                            <div className="px-6 max-h-[280px] overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.variantId || item.id}
                                        className="flex items-start justify-between gap-3 py-3 border-b border-dashed border-[#e8d5e8] last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[0.82rem] font-medium text-[#1a1a2e] truncate mb-0.5">{item.name}</p>
                                            <span className="text-[0.7rem] text-gray-400">
                                                {item.variantDetails && `${item.variantDetails} · `}
                                                <span className="inline-flex items-center justify-center bg-[#f3e6f3] text-[#610361] text-[0.65rem] font-bold rounded-md px-1.5 py-0.5 ml-1">
                                                    ×{item.quantity}
                                                </span>
                                            </span>
                                        </div>
                                        <span className="text-[0.82rem] font-semibold text-[#610361] whitespace-nowrap">
                                            COP {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totales */}
                            <div className="px-6 pt-4 pb-5 border-t border-[#e8d5e8]">
                                <div className="flex justify-between items-center mb-2.5">
                                    <span className="text-xs text-gray-400">Subtotal</span>
                                    <span className="text-xs text-[#1a1a2e] font-medium">COP {cartGrandTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2.5">
                                    <span className="text-xs text-gray-400">Envío</span>
                                    <span className="bg-green-100 text-green-700 text-[0.68rem] font-bold px-2 py-0.5 rounded-full">Gratis</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-[#e8d5e8] pt-3 mt-1">
                                    <span className="text-base font-semibold text-[#1a1a2e] font-winkySans">Total</span>
                                    <span className="text-lg font-semibold text-[#610361] font-winkySans">COP {cartGrandTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust badge */}
                        <div className="bg-linear-to-br from-[#f3e6f3] to-white border border-[#e8d5e8] rounded-2xl p-4 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#610361] text-white flex items-center justify-center text-sm shrink-0 mt-0.5">
                                <i className="fa-solid fa-shield-halved"></i>
                            </div>
                            <p className="text-[0.72rem] text-gray-400 leading-relaxed">
                                <strong className="block text-[0.8rem] text-[#1a1a2e] mb-0.5 font-semibold">Compra 100% segura</strong>
                                Tu información está protegida. Al realizar el pedido aceptas nuestros términos y condiciones de servicio.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}