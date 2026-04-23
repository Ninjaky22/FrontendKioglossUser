import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import authService from '../services/authService';
import productService from '../services/productService';
import Breadcrumb from '../components/Breadcrumb';

export default function Wishlist() {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, removeFavoriteId } = useAuth();
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch fresh user data directly from API (like restaurante_fe getData)
            const userData = await authService.getUserData();
            // account.favorite can be array, string, or null — guard with Array.isArray
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

    const handleRemove = async (idFa, productId) => {
        if (!idFa) return;
        try {
            await productService.removeFavorite(idFa);
            setFavorites(prev => prev.filter(f => f.idFa !== idFa));
            removeFavoriteId(productId);
        } catch {
            alert('Error al eliminar de favoritos');
            loadFavorites();
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        navigate('/cart');
    };

    if (authLoading || loading) return (
        <div className="bg-[#F7E6FE] flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#610361]"></div>
        </div>
    );

    return (
        <div className="bg-[#F7E6FE]">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Lista de Deseados' },
            ]} />
            <div className="container py-8">
                <h2 className="text-3xl font-bold text-[#610361] font-winkySans mb-6">
                    <i className="fa-regular fa-heart mr-2"></i>Mi Lista de Deseados
                </h2>
                {favorites.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <i className="fa-regular fa-heart text-6xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl text-gray-600 font-winkySans">Tu lista de deseados está vacía</h3>
                        <p className="text-gray-400 mt-2 font-winkySans">Explora nuestros productos y agrega tus favoritos.</p>
                        <Link to="/shop" className="mt-6 inline-block px-8 py-3 bg-[#610361] text-white rounded-lg hover:bg-[#500250] transition font-winkySans">
                            Explorar Productos
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#f3d5ff] font-medium text-[#610361] font-winkySans">
                            <div className="col-span-5">Producto</div>
                            <div className="col-span-2 text-center">Precio</div>
                            <div className="col-span-3 text-center">Acciones</div>
                            <div className="col-span-2 text-center">Eliminar</div>
                        </div>
                        {favorites.map((fav) => (
                            <div key={fav.idFa || fav.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-[#fdf5ff] transition">
                                <div className="md:col-span-5 flex items-center gap-4">
                                    <img src={fav.images?.[0] || '/assets/images/products/product1.jpg'} alt={fav.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }} />
                                    <div>
                                        <Link to={`/product/${fav.slug}`} className="text-[#610361] font-medium hover:underline font-winkySans">
                                            {fav.title || fav.name}
                                        </Link>
                                    </div>
                                </div>
                                <div className="md:col-span-2 text-center text-gray-700 font-semibold font-winkySans">
                                    COP {fav.price}
                                </div>
                                <div className="md:col-span-3 text-center">
                                    <button onClick={() => handleAddToCart(fav)}
                                        className="px-4 py-2 bg-[#610361] text-white text-sm rounded-lg hover:bg-[#500250] transition font-winkySans">
                                        <i className="fa-solid fa-cart-shopping mr-1"></i> Al Carrito
                                    </button>
                                </div>
                                <div className="md:col-span-2 text-center">
                                    <button onClick={() => handleRemove(fav.idFa, fav.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition">
                                        <i className="fa-solid fa-trash text-lg"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
