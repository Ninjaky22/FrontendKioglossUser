import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const { cart, cartCount, removeItem } = useCart();
    const [cartOpen, setCartOpen] = useState(false);

    const cartTotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    const handleSearch = (e) => {

        e.preventDefault();
        navigate(searchQuery.trim() ? `/shop?search=${encodeURIComponent(searchQuery.trim())}` : '/shop');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <header className="py-4 bg-white shadow-sm">
                <div className="container flex items-center justify-between">
                    <Link to="/"><img src="/assets/images/logo.png" alt="Logo" className="w-48" /></Link>

                    <div className="w-full max-w-xl relative flex">
                        <span className="absolute left-4 top-3 text-lg text-gray-400">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input type="text" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="w-full border border-gray-200 border-r-0 pl-12 py-3 pr-3 rounded-l-md focus:outline-none focus:border-[#9b30a0] hidden md:flex font-winkySans"
                            placeholder="Buscar productos" />
                        <button onClick={handleSearch}
                            className="bg-[#9b30a0] text-white px-8 rounded-r-md md:flex items-center cursor-pointer font-swash hover:bg-[#7b2585] transition">
                            Buscar
                        </button>
                    </div>

                    <div className="flex items-center space-x-5">
                        {isAuthenticated && (
                            <Link to="/wishlist" className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-swash">
                                <div className="text-2xl"><i className="fa-regular fa-heart"></i></div>
                                <div className="text-xs leading-3">Deseados</div>
                            </Link>
                        )}
                        <div className="relative"
                            onMouseEnter={() => setCartOpen(true)}
                            onMouseLeave={() => setCartOpen(false)}>
                            <Link to="/cart" className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-swash block">
                                <div className="text-2xl relative inline-block">
                                    <i className="fa-solid fa-bag-shopping"></i>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-[20px] h-[20px] rounded-full flex items-center justify-center leading-none ring-2 ring-white">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs leading-3">Carrito</div>
                            </Link>

                            {/* Cart Preview Dropdown */}
                            {cartOpen && (
                                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                    {cart.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400 font-winkySans">
                                            <i className="fa-solid fa-cart-shopping text-3xl mb-2"></i>
                                            <p className="text-sm">Tu carrito está vacío</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                                                {cart.slice(0, 5).map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition">
                                                        <img src={item.image || '/assets/images/products/product1.jpg'} alt={item.name}
                                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-800 font-winkySans truncate">{item.name}</p>
                                                            <p className="text-xs text-gray-400 font-winkySans">{item.quantity} × COP {Number(item.price).toLocaleString()}</p>
                                                        </div>
                                                        <button onClick={(e) => { e.preventDefault(); removeItem(item); }}
                                                            className="text-gray-300 hover:text-red-500 transition p-1 flex-shrink-0">
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {cart.length > 5 && (
                                                <p className="text-center text-xs text-gray-400 py-1 font-winkySans">y {cart.length - 5} más...</p>
                                            )}
                                            <div className="border-t border-gray-100 p-3">
                                                <div className="flex justify-between mb-3">
                                                    <span className="text-sm font-semibold text-gray-600 font-winkySans">Total</span>
                                                    <span className="text-sm font-bold text-[#9b30a0] font-winkySans">COP {cartTotal.toLocaleString()}</span>
                                                </div>
                                                <Link to="/cart" onClick={() => setCartOpen(false)}
                                                    className="block w-full text-center py-2 bg-[#9b30a0] text-white rounded-lg hover:bg-[#7b2585] transition text-sm font-winkySans font-medium">
                                                    Ver Carrito
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        {isAuthenticated ? (
                            <Link to="/account" className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-swash">
                                <div className="text-2xl"><i className="fa-regular fa-user"></i></div>
                                <div className="text-xs leading-3">Cuenta</div>
                            </Link>
                        ) : (
                            <Link to="/login" className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-swash">
                                <div className="text-2xl"><i className="fa-solid fa-right-to-bracket"></i></div>
                                <div className="text-xs leading-3">Ingresar</div>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <nav className="bg-[#610361]">
                <div className="container flex">
                    <div className="flex items-center justify-between grow md:pl-12 py-4 text-lg">
                        <div className="flex items-center space-x-6 capitalize">
                            <Link to="/" className="text-white/80 hover:text-white hover:-translate-y-0.5 transition-all duration-300 font-swash">Inicio</Link>
                            <Link to="/shop" className="text-white/80 hover:text-white hover:-translate-y-0.5 transition-all duration-300 font-swash">Productos</Link>
                            <Link to="/about" className="text-white/80 hover:text-white hover:-translate-y-0.5 transition-all duration-300 font-swash">Sobre Nosotros</Link>
                            <Link to="/contact" className="text-white/80 hover:text-white hover:-translate-y-0.5 transition-all duration-300 font-swash">Contáctanos</Link>
                        </div>
                        {isAuthenticated ? (
                            <button onClick={handleLogout}
                                className="text-white/80 hover:text-white hover:-translate-y-0.5 transition-all duration-300 font-swash cursor-pointer">
                                Cerrar Sesión
                            </button>
                        ) : (
                            <Link to="/login" className="text-white/80 hover:text-white hover:-translate-y-0.5 transition-all duration-300 font-swash">Iniciar Sesión</Link>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
