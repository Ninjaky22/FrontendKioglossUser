import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import Swal from 'sweetalert2';

export default function Cart() {
    const navigate = useNavigate();
    const { cart, updateQty, removeItem, clearCart } = useCart();

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

    return (
        <div className="bg-[#F7E6FE] font-winkySans">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Carrito' },
            ]} />
            <div className="container py-8">
                <h2 className="text-3xl font-bold text-[#610361] font-winkySans mb-6">
                    <i className="fa-solid fa-cart-shopping mr-2"></i>Mi Carrito
                </h2>
                {cart.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl text-gray-600 font-winkySans">Tu carrito está vacío</h3>
                        <Link to="/shop" className="mt-6 inline-block px-8 py-3 bg-[#610361] text-white rounded-lg hover:bg-[#500250] transition font-winkySans">
                            Explorar Productos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white rounded-xl shadow overflow-hidden">
                            {cart.map((item, index) => (
                                <div key={item.cartItemId || item.id || index} className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-[#fdf5ff] transition">
                                    <img src={item.image || '/assets/images/products/product1.jpg'} alt={item.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }} />
                                    <div className="flex-1">
                                        <Link to={`/product/${item.slug}`} className="text-[#610361] font-medium hover:underline font-winkySans">{item.name}</Link>
                                        <p className="text-gray-500 text-sm font-winkySans">COP {item.price}</p>
                                    </div>
                                    <div className="flex items-center border border-[#e6affc] rounded-lg divide-x divide-[#e6affc]">
                                        <button onClick={() => updateQty(item, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#610361]">−</button>
                                        <span className="w-8 h-8 flex items-center justify-center text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQty(item, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#610361]">+</button>
                                    </div>
                                    <span className="font-semibold text-gray-800 min-w-[90px] text-right font-winkySans">COP {item.price * item.quantity}</span>
                                    <button onClick={() => handleRemoveItem(item)} className="text-red-400 hover:text-red-600 p-2"><i className="fa-solid fa-trash"></i></button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-xl shadow p-6 h-fit">
                            <h3 className="text-lg font-bold text-[#610361] mb-4 font-winkySans">Resumen del Pedido</h3>
                            <div className="space-y-3 border-b border-gray-200 pb-4">
                                <div className="flex justify-between text-gray-600 font-winkySans">
                                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                    <span>COP {total}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-winkySans">
                                    <span>Envío</span>
                                    <span className="text-green-600">Gratis</span>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 text-xl font-bold text-[#610361] font-winkySans">
                                <span>Total</span>
                                <span>COP {total}</span>
                            </div>
                            <button onClick={() => navigate('/checkout')}
                                className="w-full mt-6 py-3 bg-[#610361] text-white rounded-lg hover:bg-[#500250] transition font-semibold font-winkySans">
                                Proceder al Pago
                            </button>
                            <button onClick={handleClearCart}
                                className="w-full mt-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm font-winkySans">
                                Vaciar Carrito
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}