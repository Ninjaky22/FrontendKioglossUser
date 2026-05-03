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
                        showConfirmButton: false, timer: 1500, timerProgressBar: true,
                        customClass: {
                            title: 'font-winkySans',
                            htmlContainer: 'font-winkySans',
                            confirmButton: 'font-winkySans',
                            cancelButton: 'font-winkySans'
                        }
                    });
                }
            } else {
                await productService.addFavorite(accountId, product.id);
                addFavoriteId(product.id);
                setFavorited(true);
                Swal.fire({ toast: true, 
                    position: 'top-end', icon: 'success', 
                    title: '¡Agregado a favoritos!',
                    showConfirmButton: false, timer: 1500, timerProgressBar: true,
                    customClass: {
                        title: 'font-winkySans',
                        htmlContainer: 'font-winkySans',
                        confirmButton: 'font-winkySans',
                        cancelButton: 'font-winkySans'
                    }
                });
            }
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden group shadow-[0_2px_16px_-4px_rgba(155,48,160,0.12)] hover:shadow-[0_8px_32px_-8px_rgba(155,48,160,0.28)] hover:-translate-y-1 transition-all duration-300 border border-purple-100/60 flex flex-col">

            {/* ── Imagen ── */}
            {/*
                FIX CLAVE: aspect-square + object-cover
                Cualquier imagen (vertical u horizontal) se recorta para llenar
                el cuadrado perfectamente, sin espacios vacíos ni deformación.
                El fondo rosa suave (bg-pink-50) evita el vacío blanco si la
                imagen tiene zonas transparentes.
            */}
            <div className="relative aspect-square overflow-hidden bg-pink-50/60">
                <img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 ${outOfStock ? 'opacity-40 grayscale' : ''}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }}
                />

                {/* Overlay agotado */}
                {outOfStock ? (
                    <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-3">
                        <span className="bg-red-600 text-white font-bold text-sm px-5 py-2 rounded-full font-winkySans shadow-lg tracking-wide">
                            Agotado
                        </span>
                        <Link
                            to={`/product/${slug}`}
                            className="inline-flex items-center gap-2 bg-white/95 text-[#9b30a0] text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:bg-[#9b30a0] hover:text-white transition-all"
                            title="Ver detalles"
                        >
                            <i className="fa-solid fa-magnifying-glass text-[10px]"></i>
                            Ver detalles
                        </Link>
                    </div>
                ) : (
                    /* Overlay acciones */
                    <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent flex items-end justify-center pb-3 lg:pb-4 gap-2 lg:gap-2.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                        <Link
                            to={`/product/${slug}`}
                            className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-[#9b30a0] hover:bg-[#9b30a0] hover:text-white hover:scale-110 transition-all duration-200 shadow-md"
                            title="Ver producto"
                        >
                            <i className="fa-solid fa-magnifying-glass text-[9px] lg:text-xs"></i>
                        </Link>
                        <button
                            onClick={handleFavorite}
                            className={`w-7 h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md ${
                                favorited
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/95 backdrop-blur-sm text-[#9b30a0] hover:bg-red-500 hover:text-white'
                            }`}
                            title={favorited ? 'Quitar de favoritos' : 'Agregar a lista de deseados'}
                        >
                            <i className={`${favorited ? 'fa-solid' : 'fa-regular'} fa-heart text-[9px] lg:text-xs`}></i>
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className={`w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-[#9b30a0] hover:bg-[#9b30a0] hover:text-white hover:scale-110 transition-all duration-200 shadow-md ${
                                stock !== null && cartQty >= stock ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                            title="Agregar al carrito"
                            disabled={stock !== null && cartQty >= stock}
                        >
                            <i className="fa-solid fa-cart-shopping text-[9px] lg:text-xs"></i>
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
            <div className="p-3 lg:p-4 flex flex-col flex-1 gap-2.5">

                {/* Nombre */}
                <Link to={`/product/${slug}`}>
                    <h4 className="font-semibold text-[13px] lg:text-[14px] leading-snug text-gray-800 hover:text-[#9b30a0] transition-colors duration-200 line-clamp-2 font-winkySans">
                        {name}
                    </h4>
                </Link>

                {/* Separador decorativo */}
                <div className="h-px bg-linear-to-r from-purple-100 via-pink-100 to-transparent" />

                {/* Precio + Acción */}
                <div className="flex items-center justify-between gap-2 mt-auto">
                    <p className="text-[15px] lg:text-[17px] font-bold text-[#9b30a0] font-winkySans tracking-tight leading-none">
                        COP {Number(price).toLocaleString()}
                    </p>

                    <div className="shrink-0">
                    {outOfStock ? (
                        <span className="text-[10px] lg:text-xs text-red-500 font-semibold font-winkySans bg-red-50 border border-red-100 px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg text-center block">
                            Sin stock
                        </span>
                    ) : product.hasVariants ? (
                        <Link
                            to={`/product/${slug}`}
                            className="flex items-center justify-center gap-1.5 bg-[#9b30a0] text-white text-[11px] lg:text-xs px-3 py-1.5 lg:py-2 rounded-xl hover:bg-[#7b2585] transition-all duration-200 active:scale-95 shadow-sm font-winkySans font-medium"
                        >
                            <span>Opciones</span>
                            <i className="fa-solid fa-list text-[9px] lg:text-[10px]"></i>
                        </Link>
                    ) : cartQty > 0 ? (
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-1.5 py-1 shadow-sm">
                            <button
                                onClick={handleRemoveFromCart}
                                className="w-6 h-6 rounded-full bg-white text-[#610361] hover:bg-red-50 hover:text-red-600 transition-colors duration-150 active:scale-95 text-[10px] font-bold shadow-sm"
                            >
                                {cartQty === 1 ? <i className="fa-solid fa-trash-can text-[9px]"></i> : '−'}
                            </button>
                            <span className="min-w-6 h-6 px-1.5 rounded-full bg-[#9b30a0] text-white text-[10px] font-bold flex items-center justify-center">
                                {cartQty}
                            </span>
                            <button
                                onClick={handleAddToCart}
                                className={`w-6 h-6 rounded-full bg-white text-[#610361] transition-colors duration-150 active:scale-95 text-[10px] font-bold shadow-sm ${
                                    stock !== null && cartQty >= stock
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'hover:bg-[#f3d7ff] hover:text-[#9b30a0]'
                                }`}
                                disabled={stock !== null && cartQty >= stock}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="flex items-center justify-center gap-1.5 bg-[#9b30a0] text-white text-[11px] lg:text-xs px-3 py-1.5 lg:py-2 rounded-xl hover:bg-[#7b2585] transition-all duration-200 active:scale-95 shadow-sm font-winkySans font-medium"
                        >
                            <i className="fa-solid fa-cart-shopping text-[9px] lg:text-[10px]"></i>
                            <span>Agregar</span>
                        </button>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}