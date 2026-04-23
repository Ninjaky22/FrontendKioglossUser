import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';

export default function ProductCard({ product }) {
    const { accountId, isAuthenticated, favoriteIds, addFavoriteId, removeFavoriteId, getFavoriteIdFa } = useAuth();
    const { cart, addToCart, updateQty, removeItem } = useCart();
    const navigate = useNavigate();
    
    const isFav = favoriteIds.includes(product?.id);
    const [favorited, setFavorited] = useState(isFav);
    const [adding, setAdding] = useState(false);

    useEffect(() => setFavorited(favoriteIds.includes(product?.id)), [favoriteIds, product?.id]);

    const cartItem = cart.find(i => i.variantId === product?.defaultVariantId) || cart.find(i => i.id === product?.id);
    const cartQty = cartItem?.quantity || 0;

    const name  = product?.title || product?.name || 'Producto';
    const slug  = product?.slug;
    const price = product?.price;
    const image = product?.images?.[0] || product?.image || '/assets/images/products/product1.jpg';
    const stock = product?.stock ?? null;
    const outOfStock = stock !== null && stock <= 0;
    const lowStock = stock !== null && stock > 0 && stock <= 3;

    const handleAddToCart = () => {
        if (!product || outOfStock) return;
        if (product.hasVariants) {
            navigate(`/product/${slug}`);
            return;
        }
        if (stock !== null && cartQty >= stock) return;
        // Product without real variants — use defaultVariantId
        addToCart({ ...product, variantId: product.defaultVariantId }, 1);
    };

    const handleRemoveFromCart = () => {
        if (!cartItem) return;
        if (cartItem.quantity > 1) {
            updateQty(cartItem, -1);
        } else {
            removeItem(cartItem);
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated || !accountId) {
            alert('Inicia sesión para agregar a favoritos');
            return;
        }
        if (adding) return;
        setAdding(true);
        try {
            if (favorited) {
                const idFa = getFavoriteIdFa(product.id);
                if (idFa) {
                    await productService.removeFavorite(idFa);
                    removeFavoriteId(product.id);
                    setFavorited(false);
                }
            } else {
                const data = await productService.addFavorite(accountId, product.id);
                setFavorited(true);
                addFavoriteId(product.id, data?.idFa);
            }
        } catch (e) {
            console.error('Error toggling favorite', e);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300">
            <div className="relative">
                <img src={image} alt={name} className={`w-full h-64 object-cover ${outOfStock ? 'opacity-50 grayscale' : ''}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }} />
                {outOfStock ? (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-full font-winkySans shadow-lg">
                            Agotado
                        </span>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link to={`/product/${slug}`}
                        className="text-white text-lg w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-[#9b30a0] hover:scale-110 transition-all duration-200"
                        title="Ver producto">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </Link>
                    <button onClick={handleFavorite}
                        className={`text-lg w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 ${favorited ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-[#9b30a0]'}`}
                        title={favorited ? 'Quitar de favoritos' : 'Agregar a lista de deseados'}>
                        <i className={favorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                    </button>
                    <button onClick={handleAddToCart}
                        className={`text-white text-lg w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-[#9b30a0] hover:scale-110 transition-all duration-200 relative ${stock !== null && cartQty >= stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Agregar al carrito"
                        disabled={stock !== null && cartQty >= stock}>
                        <i className="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
                )}
                {favorited && (
                    <span className="absolute top-2 right-2 text-red-500 text-lg drop-shadow">
                        <i className="fa-solid fa-heart"></i>
                    </span>
                )}
                {cartQty > 0 && (
                    <span className="absolute top-2 left-2 bg-[#9b30a0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <i className="fa-solid fa-cart-shopping text-[9px]"></i> {cartQty}
                    </span>
                )}
                {lowStock && !outOfStock && (
                    <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow font-winkySans animate-pulse">
                        ¡Últimas {stock} unidades!
                    </span>
                )}
            </div>
            <div className="p-4">
                <Link to={`/product/${slug}`}>
                    <h4 className="font-medium text-base mb-1 text-gray-800 hover:text-[#9b30a0] transition line-clamp-2 font-winkySans">{name}</h4>
                </Link>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-lg text-[#9b30a0] font-bold font-winkySans">COP {Number(price).toLocaleString()}</p>
                    {outOfStock ? (
                        <span className="text-xs text-red-500 font-semibold font-winkySans bg-red-50 px-3 py-1.5 rounded-lg">
                            Sin stock
                        </span>
                    ) : product.hasVariants ? (
                        <Link to={`/product/${slug}`}
                            className="flex items-center gap-1.5 bg-[#9b30a0] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#7b2585] transition-all active:scale-95">
                            <i className="fa-solid fa-list text-xs"></i>
                            <span>Ver opciones</span>
                        </Link>
                    ) : cartQty > 0 ? (
                        <div className="flex items-center gap-0.5">
                            <button onClick={handleRemoveFromCart}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-l-lg hover:bg-red-100 hover:text-red-500 transition active:scale-95 text-sm font-bold">
                                {cartQty === 1 ? <i className="fa-solid fa-trash-can text-xs"></i> : '−'}
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center bg-[#9b30a0] text-white text-sm font-bold">{cartQty}</span>
                            <button onClick={handleAddToCart}
                                className={`w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-r-lg transition active:scale-95 text-sm font-bold ${stock !== null && cartQty >= stock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#f3d5ff] hover:text-[#9b30a0]'}`}
                                disabled={stock !== null && cartQty >= stock}>
                                +
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleAddToCart}
                            className="flex items-center gap-1.5 bg-[#9b30a0] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#7b2585] transition-all active:scale-95">
                            <i className="fa-solid fa-cart-shopping text-xs"></i>
                            <span>Agregar</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
