import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import Swal from 'sweetalert2';

export default function Cart() {
    const navigate = useNavigate();
    const { cart, updateQty, removeItem, clearCart } = useCart();
    const { isAuthenticated } = useAuth();

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleRemoveItem = async (item) => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: `"${item.name}" será eliminado del carrito.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-trash mr-1"></i> Sí, eliminar',
            cancelButtonText: '<i class="fa-solid fa-xmark mr-1"></i> Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#9ca3af',
            customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
            },
        });
        if (result.isConfirmed) removeItem(item);
    };

    const handleClearCart = async () => {
        const result = await Swal.fire({
            title: '¿Vaciar carrito?',
            text: 'Se eliminarán todos los productos del carrito.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-trash mr-1"></i> Sí, vaciar todo',
            cancelButtonText: '<i class="fa-solid fa-xmark mr-1"></i> Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#9ca3af',
            customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
            },
        });
        if (result.isConfirmed) {
            clearCart();
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: 'Carrito vaciado',
                showConfirmButton: false, timer: 2000, timerProgressBar: true,
                customClass: { title: 'font-winkySans' },
            });
        }
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            await Swal.fire({
                icon: 'warning',
                title: 'Inicia sesión',
                text: 'Inicia sesión para terminar la compra.',
                confirmButtonText: 'Ir al login',
                confirmButtonColor: '#610361',
                customClass: {
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                },
            });
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(1100px_circle_at_10%_-10%,#ffffff_0%,#f9edff_45%,#f4e0ff_100%)] font-winkySans">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Carrito' },
            ]} />
            <div className="container py-8 sm:py-10">
                <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_24px_60px_rgba(97,3,97,0.18)] backdrop-blur sm:p-8">
                    <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-[#f1d6ff] opacity-70 blur-3xl"></div>
                    <div className="absolute -right-10 top-8 h-28 w-28 rounded-full bg-[#ffe2f4] opacity-70 blur-3xl"></div>
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-[#9b4fa8]">Carrito</p>
                            <h2 className="mt-2 text-3xl font-bold text-[#610361] sm:text-4xl font-winkySans">
                                <i className="fa-solid fa-cart-shopping mr-2"></i>Mi Carrito
                            </h2>
                            <p className="mt-2 text-sm text-[#6b3b73] sm:text-base">
                                Revisa tus productos favoritos y finaliza tu compra en segundos.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#f3e3ff] px-4 py-2 text-sm font-semibold text-[#610361] shadow-sm">
                                <i className="fa-solid fa-bag-shopping"></i>
                                {itemsCount} items
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#f1d4ff] bg-white/80 px-4 py-2 text-xs text-[#7a4b84]">
                                <i className="fa-solid fa-lock"></i>
                                Pago seguro
                            </div>
                        </div>
                    </div>
                </div>
                {cart.length === 0 ? (
                    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-[0_30px_70px_rgba(97,3,97,0.18)] backdrop-blur">
                        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-[#f6dcff] opacity-70 blur-3xl"></div>
                        <div className="absolute -right-20 -bottom-10 h-52 w-52 rounded-full bg-[#ffe1f5] opacity-70 blur-3xl"></div>
                        <div className="relative">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f3e3ff] text-4xl text-[#610361] shadow-lg">
                                <i className="fa-solid fa-cart-shopping"></i>
                            </div>
                            <h3 className="text-2xl font-semibold text-[#4f1657]">Tu carrito está vacío</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm text-[#7a4b84]">
                                Descubre fórmulas que realzan tu brillo natural y selecciona tus esenciales favoritos.
                            </p>
                            <Link
                                to="/shop"
                                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#610361] px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4a024a]"
                            >
                                Explorar Productos
                                <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item, index) => (
                                <div
                                    key={item.cartItemId || item.id || index}
                                    className="group relative overflow-hidden rounded-2xl border border-[#f1d4ff] bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(97,3,97,0.18)] sm:p-5"
                                >
                                    <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#f7e6fe] opacity-70 blur-3xl"></div>
                                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <div className="flex items-center gap-4 sm:flex-1">
                                            <div className="relative">
                                                <img
                                                    src={item.image || '/assets/images/products/product1.jpg'}
                                                    alt={item.name}
                                                    className="h-24 w-24 rounded-2xl object-cover ring-1 ring-[#f0d3ff] sm:h-28 sm:w-28"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/assets/images/products/product1.jpg';
                                                    }}
                                                />
                                                <span className="absolute -bottom-2 -right-2 rounded-full bg-[#610361] px-2 py-1 text-xs font-semibold text-white shadow">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <Link
                                                    to={`/product/${item.slug}`}
                                                    className="text-lg font-semibold text-[#610361] transition hover:text-[#4a024a]"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="text-sm text-[#7a4b84]">COP {item.price}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8a5a93]">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0f7] px-3 py-1">
                                                        <i className="fa-solid fa-truck-fast"></i>
                                                        Envío gratis
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 sm:items-end">
                                            <div className="flex items-center gap-2 text-xs text-[#8a5a93]">
                                                <span>Cantidad</span>
                                                <div className="flex items-center overflow-hidden rounded-full border border-[#e9c9ff] bg-[#faf5ff]">
                                                    <button
                                                        onClick={() => updateQty(item, -1)}
                                                        className="flex h-9 w-9 items-center justify-center text-[#6b3b73] transition hover:bg-white hover:text-[#610361]"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="flex h-9 w-10 items-center justify-center text-sm font-semibold text-[#4f1657]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQty(item, 1)}
                                                        className="flex h-9 w-9 items-center justify-center text-[#6b3b73] transition hover:bg-white hover:text-[#610361]"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-[#8a5a93]">
                                                <span>Total</span>
                                                <span className="text-lg font-bold text-[#3b0a3b]">COP {item.price * item.quantity}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item)}
                                                className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 transition hover:text-red-700"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#f1d4ff] bg-white/80 px-6 py-4 text-sm text-[#7a4b84] sm:flex-row sm:items-center">
                                <span>¿Quieres seguir explorando? Encuentra más favoritos en la tienda.</span>
                                <Link
                                    to="/shop"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#f3e3ff] px-4 py-2 text-xs font-semibold text-[#610361] transition hover:bg-[#ead3ff]"
                                >
                                    Seguir comprando
                                    <i className="fa-solid fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="lg:sticky lg:top-6">
                            <div className="rounded-2xl border border-[#eed2ff] bg-white/90 p-6 shadow-[0_24px_60px_rgba(97,3,97,0.16)]">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-bold text-[#610361] font-winky-sans">Resumen del Pedido</h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f3e3ff] px-3 py-1 text-xs font-semibold text-[#610361]">
                                        <i className="fa-solid fa-sparkles"></i>
                                        Beneficios
                                    </span>
                                </div>
                                <div className="mt-5 space-y-3 border-b border-[#f0d3ff] pb-4 text-sm">
                                    <div className="flex justify-between text-[#6b3b73]">
                                        <span>Subtotal ({itemsCount} items)</span>
                                        <span>COP {total}</span>
                                    </div>
                                    <div className="flex justify-between text-[#6b3b73]">
                                        <span>Envío</span>
                                        <span className="font-semibold text-green-600">Gratis</span>
                                    </div>
                                </div>
                                <div className="mt-4 rounded-2xl border border-[#f0d3ff] bg-[linear-gradient(135deg,#f6e6ff_0%,#ffffff_45%,#fdeaff_100%)] p-4">
                                    <div className="flex items-center justify-between text-base font-semibold text-[#610361]">
                                        <span>Total</span>
                                        <span className="text-xl">COP {total}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-[#8a5a93]">Impuestos incluidos.</p>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="mt-5 w-full rounded-xl bg-[#610361] py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4a024a]"
                                >
                                    Proceder al Pago
                                </button>
                                <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-[#7a4b84] sm:grid-cols-2">
                                    <div className="flex items-center gap-2 rounded-lg border border-[#f0d3ff] bg-[#faf5ff] px-3 py-2">
                                        <i className="fa-solid fa-lock"></i>
                                        Pago protegido
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border border-[#f0d3ff] bg-[#faf5ff] px-3 py-2">
                                        <i className="fa-solid fa-shield-halved"></i>
                                        Compra segura
                                    </div>
                                </div>
                                <button
                                    onClick={handleClearCart}
                                    className="mt-4 w-full rounded-xl border border-red-100 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-300"
                                >
                                    Vaciar Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}