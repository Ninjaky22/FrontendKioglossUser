import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import Swal from 'sweetalert2';
import NotificationBell from './NotificationBell';

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

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const { cart, cartCount, removeItem } = useCart();
    const [cartOpen, setCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ── Autocomplete ──
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const cartTotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    // ── Cerrar sugerencias al hacer clic fuera ──
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Debounce: buscar sugerencias al escribir 3+ caracteres ──
    useEffect(() => {
        const q = searchQuery.trim();
        if (q.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSuggestionsLoading(true);
            try {
                const data = await productService.getAllProducts(0, 6, q);
                // Normalizar distintas formas de respuesta de la API
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.content) ? data.content
                    : Array.isArray(data?.data) ? data.data
                    : Array.isArray(data?.products) ? data.products
                    : [];
                setSuggestions(list.slice(0, 6));
                setShowSuggestions(list.length > 0);
            } catch {
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ── Buscar con validación ──
    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();

        if (!q) {
            Toast.fire({
                icon: 'info',
                title: 'Escribe algo para buscar',
                text: 'El campo de búsqueda está vacío.',
            });
            return;
        }
        if (q.length < 3) {
            Toast.fire({
                icon: 'warning',
                title: 'Búsqueda muy corta',
                text: 'Ingresa mínimo 3 caracteres para buscar.',
            });
            return;
        }

        setShowSuggestions(false);
        navigate(`/shop?search=${encodeURIComponent(q)}`);
    };

    // ── Seleccionar una sugerencia ──
    const handleSuggestionClick = (productName) => {
        setSearchQuery(productName);
        setShowSuggestions(false);
        navigate(`/shop?search=${encodeURIComponent(productName)}`);
    };

    // ── Logout (lógica intacta, confirmación requiere botón) ──
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
        if (result.isConfirmed) {
            logout();
            navigate('/login');
        }
    };

    return (
        <>
            <header className="py-4 bg-white shadow-sm relative z-40">
                <div className="container flex flex-wrap items-center justify-between gap-y-3">
                    <Link to="/" className="w-1/2 md:w-auto order-1 shrink-0"><img src="/assets/images/logoPag.png" alt="Logo" className="w-32 md:w-48" /></Link>

                    {/* ── Barra de búsqueda con autocomplete ── */}
                    <div className="order-3 w-full md:max-w-xl relative flex md:order-2 mt-1 md:mt-0" ref={searchRef}>
                        <span className="absolute left-4 top-3 text-lg text-gray-400 z-10">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <div className="flex w-full relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                className="w-full border border-gray-200 border-r-0 pl-12 py-3 pr-3 rounded-l-md focus:outline-none focus:border-[#610361] focus:ring-2 focus:ring-[#610361]/30 font-winkySans hover:bg-[#FFFF] transition-all text-sm md:text-base"
                                placeholder="Buscar productos"
                                autoComplete="off"
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-[#610361] text-white px-4 md:px-8 rounded-r-md flex items-center justify-center cursor-pointer font-winkySans hover:bg-[#4a024a] focus:ring-2 focus:ring-[#610361]/30 transition-all text-sm md:text-base"
                            >
                                Buscar
                            </button>

                            {/* ── Dropdown de sugerencias ── */}
                            {showSuggestions && (
                                <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                    {suggestionsLoading ? (
                                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 font-winkySans">
                                            <i className="fa-solid fa-spinner animate-spin text-[#610361]"></i>
                                            Buscando productos...
                                        </div>
                                    ) : (
                                        <>
                                            <p className="px-4 pt-3 pb-1 text-[0.65rem] font-bold uppercase tracking-widest text-gray-300 font-winkySans">
                                                Sugerencias
                                            </p>
                                            {suggestions.map((product) => (
                                                <button
                                                    key={product.id || product._id}
                                                    onMouseDown={() => handleSuggestionClick(product.title)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#faf0fa] transition text-left group"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-[#f3e6f3] flex items-center justify-center shrink-0">
                                                        <i className="fa-solid fa-magnifying-glass text-[#610361] text-xs"></i>
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-winkySans group-hover:text-[#610361] transition truncate">
                                                        {product.title}
                                                    </span>
                                                    <i className="fa-solid fa-arrow-up-left text-gray-200 group-hover:text-[#610361] text-xs ml-auto transition"></i>
                                                </button>
                                            ))}
                                            <button
                                                onMouseDown={() => handleSuggestionClick(searchQuery.trim())}
                                                className="w-full flex items-center gap-3 px-4 py-3 border-t border-gray-50 hover:bg-[#faf0fa] transition text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-[#610361] flex items-center justify-center shrink-0">
                                                    <i className="fa-solid fa-magnifying-glass text-white text-xs"></i>
                                                </div>
                                                <span className="text-sm font-medium text-[#610361] font-winkySans truncate">
                                                    Ver todos los resultados de &ldquo;{searchQuery.trim()}&rdquo;
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="order-2 w-1/2 md:w-auto flex justify-end items-center space-x-3 md:space-x-5 md:order-3">
                        {isAuthenticated && (
                            <Link to="/wishlist" className="hidden sm:block text-center text-gray-600 hover:text-[#9b30a0] transition relative font-winkySans font-medium">
                                <div className="text-[22px] md:text-2xl"><i className="fa-regular fa-heart"></i></div>
                                <div className="text-[10px] md:text-xs leading-3 mt-1 hidden sm:block">Deseados</div>
                            </Link>
                        )}
                        <div className="relative group"
                            onMouseEnter={() => setCartOpen(true)}
                            onMouseLeave={() => setCartOpen(false)}>
                            <Link to="/cart" className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-winkySans font-medium block cursor-pointer">
                                <div className="text-[22px] md:text-2xl relative inline-block">
                                    <i className="fa-solid fa-bag-shopping"></i>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 md:-top-2 md:-right-3 bg-red-500 text-white text-[10px] md:text-[12px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center leading-none ring-2 ring-white">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </div>
                                <div className="text-[10px] md:text-xs leading-3 mt-1 hidden sm:block">Carrito</div>
                            </Link>

                            {/* Cart Preview Dropdown */}
                            {cartOpen && (
                                <div className="hidden lg:block absolute right-0 top-full mt-2 w-[280px] md:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200">
                                    {cart.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400 font-winkySans font-medium">
                                            <i className="fa-solid fa-cart-shopping text-3xl mb-2"></i>
                                            <p className="text-sm">Tu carrito está vacío</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                                                {cart.slice(0, 5).map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition">
                                                        <img src={item.image || '/assets/images/products/product1.jpg'} alt={item.name}
                                                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-800 font-winkySans font-medium truncate">{item.name}</p>
                                                            <p className="text-xs text-gray-400 font-winkySans font-medium">{item.quantity} × COP {Number(item.price).toLocaleString()}</p>
                                                        </div>
                                                        <button onClick={(e) => { e.preventDefault(); removeItem(item); }}
                                                            className="text-gray-300 hover:text-red-500 transition p-1 shrink-0">
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
                        {isAuthenticated && <NotificationBell />}
                        {isAuthenticated ? (
                            <Link to="/account" className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-winkySans font-medium">
                                <div className="text-xl md:text-2xl"><i className="fa-regular fa-user"></i></div>
                                <div className="text-[10px] md:text-xs leading-3 hidden sm:block">Cuenta</div>
                            </Link>
                        ) : (
                            <Link to="/login" className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-winkySans font-medium">
                                <div className="text-xl md:text-2xl"><i className="fa-solid fa-right-to-bracket"></i></div>
                                <div className="text-[10px] md:text-xs leading-3 hidden sm:block">Ingresar</div>
                            </Link>
                        )}
                        
                        {/* Hamburger Button */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="md:hidden text-2xl text-gray-600 hover:text-[#9b30a0] transition ml-2"
                        >
                            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                        </button>
                    </div>
                </div>
            </header>

            <nav className={`bg-[#610361] overflow-hidden transition-all duration-400 ease-in-out ${isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[500px] md:opacity-100 md:overflow-visible'}`}>
                <div className="container">
                    <div className="flex flex-col md:flex-row items-center justify-between grow md:pl-12 py-4 text-base md:text-lg gap-4 md:gap-0">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:space-x-6 capitalize w-full md:w-auto">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-white/80 hover:-translate-y-0.5 transition-all duration-300 font-winkySans font-medium">Inicio</Link>
                            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-white/80 hover:-translate-y-0.5 transition-all duration-300 font-winkySans font-medium">Productos</Link>
                            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-white/80 hover:-translate-y-0.5 transition-all duration-300 font-winkySans font-medium">Sobre Nosotros</Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-white/80 hover:-translate-y-0.5 transition-all duration-300 font-winkySans font-medium">Contáctanos</Link>
                        </div>
                        <div className="w-full md:w-auto border-t border-white/20 pt-4 md:border-none md:pt-0 flex justify-center">
                            {isAuthenticated ? (
                                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="text-white hover:text-white/80 hover:-translate-y-0.5 transition-all duration-300 font-winkySans font-medium cursor-pointer text-sm md:text-lg">
                                    Cerrar Sesión
                                </button>
                            ) : (
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-white/80 hover:-translate-y-0.5 transition-all duration-300 font-winkySans font-medium text-sm md:text-lg">Iniciar Sesión</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}