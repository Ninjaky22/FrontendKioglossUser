import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import authService from '../services/authService';
import productService from '../services/productService';
import Breadcrumb from '../components/Breadcrumb';
import AccountSidebar from '../components/AccountSidebar';
import Swal from 'sweetalert2';

export default function Wishlist() {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, user, logout, removeFavoriteId } = useAuth();
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const favoritesCount = favorites.length;
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrollingTop, setIsScrollingTop] = useState(false);
    const scrollAnimationRef = useRef(null);

    const loadFavorites = useCallback(async () => {
        setLoading(true);
        try {
            const userData = await authService.getUserData();
            const rawFavs = userData?.account?.favorite;
            setFavorites(Array.isArray(rawFavs) ? rawFavs : []);
        } catch {
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { navigate('/login'); return; }
        loadFavorites();
    }, [isAuthenticated, authLoading, navigate, loadFavorites]);

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

    const handleRemove = async (idFa, productId, productName) => {
        if (!idFa) return;

        const result = await Swal.fire({
            title: '¿Eliminar de favoritos?',
            text: `"${productName}" será quitado de tu lista de deseados.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#610361',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: '<i class="fa-solid fa-trash mr-1"></i> Sí, eliminar',
            cancelButtonText: 'Cancelar',
            borderRadius: '1rem',
            customClass: {
                popup: 'font-winkySans rounded-2xl',
                title: 'text-[#610361] font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',        
            },
        });

        if (!result.isConfirmed) return;

        try {
            await productService.removeFavorite(idFa);
            setFavorites(prev => prev.filter(f => f.idFa !== idFa));
            removeFavoriteId(productId);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: 'Eliminado de favoritos',
                showConfirmButton: false, timer: 2000, timerProgressBar: true,
                customClass: {
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    cancelButton: 'font-winkySans',
                },
            });
        } catch {
            Swal.fire({
                toast: true, position: 'top-end', icon: 'error',
                title: 'Error al eliminar de favoritos',
                showConfirmButton: false, timer: 3000, timerProgressBar: true,
                customClass: {
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    cancelButton: 'font-winkySans',
                },
            });
            loadFavorites();
        }
    };

    const handleAddToCart = async (fav) => {
        // Los productos con variantes deben ir a la página del producto
        if (fav.hasVariants && !fav.defaultVariantId) {
            navigate(`/product/${fav.slug}`);
            return;
        }
        try {
            const variantId = fav.defaultVariantId || fav.variantId || null;
            await addToCart({ ...fav, variantId }, 1);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: '¡Agregado al carrito!',
                showConfirmButton: false, timer: 2000, timerProgressBar: true,
                customClass: { title: 'font-winkySans', htmlContainer: 'font-winkySans' },
            });
        } catch {
            Swal.fire({
                toast: true, position: 'top-end', icon: 'error',
                title: 'Error al agregar al carrito',
                showConfirmButton: false, timer: 2500, timerProgressBar: true,
                customClass: { title: 'font-winkySans', htmlContainer: 'font-winkySans' },
            });
        }
    };

    if (authLoading || loading) return (
        <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_12%_-10%,#ffffff_0%,#f8e9ff_42%,#f3d6ff_100%)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/80 px-8 py-10 shadow-[0_24px_60px_rgba(97,3,97,0.18)] backdrop-blur">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#e9c9ff] border-t-[#610361]"></div>
                <p className="text-sm text-[#6b3b73]">Cargando tu lista de deseados...</p>
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
                { label: 'Lista de Deseados' },
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
                                    <p className="text-xs uppercase tracking-[0.35em] text-[#9b4fa8]">Favoritos</p>
                                    <h2 className="mt-2 text-3xl font-bold text-(--primary) sm:text-4xl font-winkySans">
                                        <i className="fa-regular fa-heart mr-2"></i>Mi Lista de Deseados
                                    </h2>
                                    <p className="mt-2 text-sm text-[#6b3b73] sm:text-base">
                                        Guarda tus esenciales y agrégalos al carrito cuando quieras.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-(--soft) px-4 py-2 text-sm font-semibold text-(--primary) shadow-sm">
                                        <i className="fa-solid fa-heart"></i>
                                        {favoritesCount} favoritos
                                    </div>
                                </div>
                            </div>
                        </div>
                        {favorites.length === 0 ? (
                            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-[0_30px_70px_rgba(97,3,97,0.18)] backdrop-blur">
                                <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-(--soft) opacity-70 blur-3xl"></div>
                                <div className="absolute -right-20 -bottom-10 h-52 w-52 rounded-full bg-(--accent) opacity-70 blur-3xl"></div>
                                <div className="relative">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-(--soft) text-4xl text-(--primary) shadow-lg">
                                        <i className="fa-regular fa-heart"></i>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-(--ink) font-winky-sans">Tu lista de deseados está vacía</h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm text-[#7a4b84]">
                                        Explora nuestros productos y crea una selección personalizada para tu rutina.
                                    </p>
                                    <Link
                                        to="/shop"
                                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-(--primary) px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4a024a]"
                                    >
                                        Explorar Productos
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                                {favorites.map((fav) => (
                                    <div
                                        key={fav.idFa || fav.id}
                                        className="group relative overflow-hidden rounded-2xl border border-[#f1d4ff] bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(97,3,97,0.18)] sm:p-5 motion-safe:animate-[scaleIn_.5s_ease]"
                                    >
                                        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-(--soft) opacity-70 blur-3xl"></div>
                                        <div className="relative flex flex-col gap-3 sm:gap-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                <img
                                                    src={fav.images?.[0] || '/assets/images/products/product1.jpg'}
                                                    alt={fav.name}
                                                    className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[#f0d3ff] sm:h-24 sm:w-24"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }}
                                                />
                                                <div className="space-y-2">
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0f7] px-3 py-1 text-[10px] font-semibold text-[#a24a8a] sm:text-xs">
                                                        <i className="fa-solid fa-heart"></i>
                                                        Favorito guardado
                                                    </span>
                                                    <Link
                                                        to={`/product/${fav.slug}`}
                                                        className="block text-base font-semibold text-(--primary) transition hover:text-[#4a024a] sm:text-lg"
                                                    >
                                                        {fav.title || fav.name}
                                                    </Link>
                                                    <p className="hidden text-sm text-[#7a4b84] sm:block">Tu favorito listo para el carrito.</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f0d3ff] bg-[linear-gradient(135deg,#f7e9ff_0%,#ffffff_45%,#fdeaff_100%)] px-3 py-2 sm:px-4 sm:py-3">
                                                <div>
                                                    <p className="text-xs text-[#8a5a93]">Precio</p>
                                                    <p className="text-base font-bold text-(--ink) sm:text-lg">COP {fav.price}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => handleRemove(fav.idFa, fav.id, fav.title || fav.name)}
                                                        className="inline-flex items-center gap-2 rounded-full border border-red-100 px-3 py-2 text-[11px] font-semibold text-red-500 transition hover:bg-red-200 sm:px-4 sm:text-xs"
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
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