import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import Swal from 'sweetalert2';

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
            Swal.fire({ toast: true, 
                position: 'top-end', 
                icon: 'info', 
                title: 'Selecciona una opción', 
                text: 'Este producto tiene variantes disponibles', 
                showConfirmButton: false, 
                timer: 2000, 
                timerProgressBar: true,
                    customClass: {
                        title: 'font-winkySans',
                        htmlContainer: 'font-winkySans',
                        confirmButton: 'font-winkySans',
                        cancelButton: 'font-winkySans',
                        title: 'font-winkySans',
                        htmlContainer: 'font-winkySans',
                        confirmButton: 'font-winkySans',
                        cancelButton: 'font-winkySans'
            }});
            navigate(`/product/${slug}`);
            return;
        }
        if (stock !== null && cartQty >= stock) {
            Swal.fire({ toast: true, 
                position: 'top-end', 
                icon: 'warning', title: '¡Stock máximo alcanzado!', 
                text: `Solo hay ${stock} unidades disponibles`, 
                showConfirmButton: false, 
                timer: 2500, 
                timerProgressBar: true, 
                    customClass: {
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    cancelButton: 'font-winkySans',
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    cancelButton: 'font-winkySans'
                }});
            return;
        }
        addToCart({ ...product, variantId: product.defaultVariantId }, 1);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: '¡Producto agregado!',
            text: isAuthenticated ? '' : 'Inicia sesión para completar tu compra!',
            showConfirmButton: false,
            timer: isAuthenticated ? 1800 : 3500,
            timerProgressBar: true,
             customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans'
            }
        });
    };

    const handleRemoveFromCart = () => {
        if (!cartItem) return;
        if (cartItem.quantity > 1) {
            updateQty(cartItem, -1);
        } else {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'Producto eliminado',
                showConfirmButton: false,
                timer: 1800,
                timerProgressBar: true,
                customClass: {
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    cancelButton: 'font-winkySans',
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    cancelButton: 'font-winkySans'
                }
            });
            removeItem(cartItem);
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated || !accountId ) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Inicia sesión para agregar a favoritos', showConfirmButton: false, timer: 1500, timerProgressBar: true, customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans'
            } });
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
                    Swal.fire({ toast: true, 
                        position: 'top-end', icon: 'info', 
                        title: 'Eliminado de favoritos', 
                        showConfirmButton: false, 
                        timer: 2000, timerProgressBar: true,
                        customClass: {
                            title: 'font-winkySans',
                            htmlContainer: 'font-winkySans',
                            confirmButton: 'font-winkySans',
                            cancelButton: 'font-winkySans',
                            title: 'font-winkySans',
                            htmlContainer: 'font-winkySans',
                            confirmButton: 'font-winkySans',
                            cancelButton: 'font-winkySans'
                        }});
                }
            } else {
                const data = await productService.addFavorite(accountId, product.id);
                setFavorited(true);
                addFavoriteId(product.id, data?.idFa);
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '¡Agregado a favoritos!', showConfirmButton: false, timer: 2000, timerProgressBar: true,customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans'
            } });
            }
        } catch (e) {
            console.error('Error toggling favorite', e);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100/80 flex flex-col">

            {/* ── Imagen ── */}
            <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
                <img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-40 grayscale' : ''}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }}
                />

                {/* Overlay agotado */}
                {outOfStock ? (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-bold text-sm px-5 py-2 rounded-full font-winkySans shadow-lg tracking-wide">
                            Agotado
                        </span>
                    </div>
                ) : (
                    /* Overlay acciones */
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-3 lg:pb-6 gap-2 lg:gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                        <Link
                            to={`/product/${slug}`}
                            className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#9b30a0] hover:bg-[#9b30a0] hover:text-white hover:scale-110 transition-all duration-200 shadow"
                            title="Ver producto"
                        >
                            <i className="fa-solid fa-magnifying-glass text-[9px] lg:text-sm"></i>
                        </Link>
                        <button
                            onClick={handleFavorite}
                            className={`w-6 h-6 lg:w-10 lg:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow ${
                                favorited
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/90 backdrop-blur-sm text-[#9b30a0] hover:bg-red-500 hover:text-white'
                            }`}
                            title={favorited ? 'Quitar de favoritos' : 'Agregar a lista de deseados'}
                        >
                            <i className={`${favorited ? 'fa-solid' : 'fa-regular'} fa-heart text-[9px] lg:text-sm`}></i>
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className={`w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#9b30a0] hover:bg-[#9b30a0] hover:text-white hover:scale-110 transition-all duration-200 shadow ${
                                stock !== null && cartQty >= stock ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                            title="Agregar al carrito"
                            disabled={stock !== null && cartQty >= stock}
                        >
                            <i className="fa-solid fa-cart-shopping text-[9px] lg:text-sm"></i>
                        </button>
                    </div>
                )}

                {/* Badge: favorito */}
                {favorited && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 lg:w-7 lg:h-7 bg-white rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-110">
                        <i className="fa-solid fa-heart text-red-500 text-[10px] lg:text-sm"></i>
                    </span>
                )}

                {/* Badge: cantidad en carrito */}
                {cartQty > 0 && (
                    <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-[#9b30a0] text-white text-[7px] sm:text-[9px] lg:text-[10px] font-bold px-0.5 py-px sm:px-1.5 sm:py-0.5 lg:px-2 lg:py-1 rounded-full flex items-center gap-0.5 shadow-md">
                        <i className="fa-solid fa-cart-shopping text-[6px] sm:text-[8px] lg:text-[9px]"></i>
                        {cartQty}
                    </span>
                )}

                {/* Badge: últimas unidades */}
                {lowStock && !outOfStock && (
                    <span className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full shadow font-winkySans animate-pulse">
                        ¡Últimas {stock}!
                    </span>
                )}
            </div>

            {/* ── Info ── */}
            <div className="p-2.5 lg:p-4 flex flex-col flex-1 gap-2 lg:gap-3">

                {/* Nombre */}
                <Link to={`/product/${slug}`}>
                    <h4 className="font-semibold text-[13px] lg:text-[15px] leading-snug text-gray-800 hover:text-[#9b30a0] transition-colors duration-200 line-clamp-2 font-winkySans">
                        {name}
                    </h4>
                </Link>

                {/* Precio + Acción */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-2 mt-auto pt-2 border-t border-gray-100">
                    <p className="text-[14px] lg:text-lg font-bold text-[#9b30a0] font-winkySans tracking-tight">
                        COP {Number(price).toLocaleString()}
                    </p>

                    <div className="w-full sm:w-auto">
                    {outOfStock ? (
                        <span className="text-[10px] lg:text-xs text-red-500 font-semibold font-winkySans bg-red-50 border border-red-100 px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg w-full sm:w-auto text-center block sm:inline-block">
                            Sin stock
                        </span>
                    ) : product.hasVariants ? (
                        <Link
                            to={`/product/${slug}`}
                            className="flex items-center justify-center sm:justify-start gap-1 bg-[#9b30a0] text-white text-[11px] lg:text-sm px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg hover:bg-[#7b2585] transition-all duration-200 active:scale-95 shadow-sm w-full sm:w-auto"
                        >
                            <span>Opciones</span>
                            <i className="fa-solid fa-list text-[9px] lg:text-xs"></i>
                        </Link>
                    ) : cartQty > 0 ? (
                        <div className="flex items-center justify-between sm:justify-center gap-0.5 shadow-sm rounded-lg overflow-hidden border border-gray-200 w-full sm:w-auto h-5 sm:h-7 lg:h-9">
                            <button
                                onClick={handleRemoveFromCart}
                                className="flex-1 sm:w-7 lg:w-8 h-full flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors duration-150 active:scale-95 text-[9px] sm:text-[11px] lg:text-sm font-bold"
                            >
                                {cartQty === 1 ? <i className="fa-solid fa-trash-can text-[7px] sm:text-[9px] lg:text-xs"></i> : '−'}
                            </button>
                            <span className="w-6 sm:w-6 lg:w-8 h-full flex items-center justify-center bg-[#9b30a0] text-white text-[9px] sm:text-[11px] lg:text-sm font-bold">
                                {cartQty}
                            </span>
                            <button
                                onClick={handleAddToCart}
                                className={`flex-1 sm:w-7 lg:w-8 h-full flex items-center justify-center bg-gray-50 text-gray-500 transition-colors duration-150 active:scale-95 text-[9px] sm:text-[11px] lg:text-sm font-bold ${
                                    stock !== null && cartQty >= stock
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'hover:bg-purple-50 hover:text-[#9b30a0]'
                                }`}
                                disabled={stock !== null && cartQty >= stock}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="flex items-center justify-center sm:justify-start gap-1 bg-[#9b30a0] text-white text-[11px] lg:text-sm px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg hover:bg-[#7b2585] transition-all duration-200 active:scale-95 shadow-sm w-full sm:w-auto h-7 lg:h-9"
                        >
                            <i className="fa-solid fa-cart-shopping text-[9px] lg:text-xs"></i>
                            <span className="font-medium">Agregar</span>
                        </button>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}