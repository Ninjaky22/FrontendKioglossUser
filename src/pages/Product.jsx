import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import Swal from 'sweetalert2';

export default function Product() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, accountId, favoriteIds, addFavoriteId, removeFavoriteId, getFavoriteIdFa } = useAuth();
    const { addToCart, cart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [imageIndex, setImageIndex] = useState(0);
    const [favorited, setFavorited] = useState(false);
    const [zoomOpen, setZoomOpen] = useState(false);

    // Dynamic Variants State
    const [selectedOptions, setSelectedOptions] = useState({});
    const [lastSelectedType, setLastSelectedType] = useState(null);

    const variantTypes = useMemo(() => {
        if (!product?.variants) return {};
        const types = {};
        product.variants.forEach(variant => {
            variant.options?.forEach(opt => {
                if (!types[opt.typeName]) types[opt.typeName] = new Map();
                if (!types[opt.typeName].has(opt.value)) types[opt.typeName].set(opt.value, opt);
            });
        });
        const result = {};
        for (const key in types) result[key] = Array.from(types[key].values());
        return result;
    }, [product]);

    const currentVariant = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return null;
        if (Object.keys(variantTypes).length === 0) return product.variants[0];
        if (!lastSelectedType || !selectedOptions[lastSelectedType]) return null;
        const targetValue = selectedOptions[lastSelectedType];
        const matched = product.variants.find(v => {
            if (!v.options) return false;
            return v.options.some(opt => opt.typeName === lastSelectedType && opt.value === targetValue);
        });
        return matched || null;
    }, [product, selectedOptions, lastSelectedType, variantTypes]);

    const displayStock = currentVariant ? currentVariant.stock : product?.stock;
    const availableStock = displayStock;

    const cartItem = cart?.find(i => i.variantId === currentVariant?.id)
                  || cart?.find(i => i.id === product?.id && !i.variantId);
    const cartQty = cartItem?.quantity || 0;

    const images = product?.images?.length > 0 ? product.images : ['/assets/images/products/product1.jpg'];

    useEffect(() => {
        setLoading(true);
        productService.getProductBySlug(slug)
            .then(data => {
                setProduct(data);
                setSelectedOptions({});
                setLastSelectedType(null);
                setMainImage(data.images?.[0] || '/assets/images/products/product1.jpg');
                setImageIndex(0);
                setQty(1);
                if (data?.tags?.length > 0) {
                    const tagNames = data.tags.map(t => typeof t === 'object' ? t.name : t);
                    productService.getAllProducts(0, 5, '', tagNames).then(res => {
                        if (res && res.content) setRelatedProducts(res.content.filter(p => p.id !== data.id).slice(0, 4));
                    }).catch(console.error);
                } else {
                    productService.getAllProducts(0, 5).then(res => {
                        if (res && res.content) setRelatedProducts(res.content.filter(p => p.id !== data.id).slice(0, 4));
                    }).catch(console.error);
                }
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [slug]);

    const handleOptionSelect = (typeName, value, metaValue) => {
        setSelectedOptions(prev => ({ ...prev, [typeName]: value }));
        setLastSelectedType(typeName);
    };

    useEffect(() => {
        if (currentVariant?.imageUrl) {
            setMainImage(currentVariant.imageUrl);
            const idx = images.indexOf(currentVariant.imageUrl);
            if (idx >= 0) setImageIndex(idx);
        }
    }, [currentVariant, images]);

    useEffect(() => {
        if (product?.id) setFavorited(favoriteIds.includes(product.id));
    }, [favoriteIds, product?.id]);

    const handleAddToCart = () => {
        if (!product) return;
        if (!currentVariant && product.variants?.length > 0) {
            Swal.fire({
                toast: true, 
                position: 'top-end', 
                icon: 'warning',
                title: 'Selecciona una variante antes de agregar', 
                showConfirmButton: false, 
                timer: 2500,
            });
            return;
        }
        if (availableStock != null && (qty + cartQty) > availableStock) {
            Swal.fire({
                toast: true, 
                position: 'top-end', 
                icon: 'error',
                title: 'Stock insuficiente',
                text: cartQty > 0 ? `Ya tienes ${cartQty} en el carrito y el stock máximo es ${availableStock}` : 'Supera el stock disponible',
                showConfirmButton: false, timer: 3000,
            });
            return;
        }
        const productToAdd = {
            ...product,
            variantId: currentVariant?.id,
            variantDetails: currentVariant ? currentVariant.options.map(o => o.value).join(', ') : '',
        };
        addToCart(productToAdd, qty, null, null);
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: 'Producto agregado al carrito', 
            showConfirmButton: false, 
            timer: 2000, 
            timerProgressBar: true,
                customClass: {
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                }
        });
    };

    const handleAddToWishlist = async () => {
        if (!isAuthenticated || !accountId) { navigate('/login'); return; }
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
        } catch (e) { console.error('Error toggling favorite', e); }
    };

    const goToImage = useCallback((idx) => {
        const clamped = ((idx % images.length) + images.length) % images.length;
        setImageIndex(clamped);
        setMainImage(images[clamped]);
    }, [images]);

    const prevImage = () => goToImage(imageIndex - 1);
    const nextImage = () => goToImage(imageIndex + 1);

    // ── Loading ──────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-linear-to-b from-[#f3e8ff] to-[#fdf4ff] flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-[#e6affc] border-t-[#9b30a0] animate-spin"></div>
            <p className="text-[#9b30a0] font-winkySans text-sm">Cargando producto…</p>
        </div>
    );

    // ── Not found ────────────────────────────────────────────
    if (!product) return (
        <div className="min-h-screen bg-linear-to-b from-[#f3e8ff] to-[#fdf4ff] flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <i className="fa-solid fa-box-open text-3xl text-[#9b30a0]"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 font-winkySans">Producto no encontrado</h2>
            <Link to="/shop" className="mt-2 inline-flex items-center gap-2 bg-[#9b30a0] text-white px-5 py-2.5 rounded-xl font-winkySans hover:bg-[#7b2585] transition-all">
                <i className="fa-solid fa-arrow-left text-sm"></i> Volver a la tienda
            </Link>
        </div>
    );

    // Stock badge helper 
    const StockBadge = () => {
        if (displayStock != null && displayStock <= 0)
            return <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-50 border border-red-200 text-red-600 px-3 py-1 rounded-full"><i className="fa-solid fa-circle-xmark"></i> Agotado</span>;
        if (displayStock != null && displayStock <= 3)
            return <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1 rounded-full animate-pulse"><i className="fa-solid fa-fire"></i> ¡Últimas {displayStock} unidades!</span>;
        if (displayStock != null)
            return <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 border border-green-200 text-green-600 px-3 py-1 rounded-full"><i className="fa-solid fa-circle-check"></i> En Stock ({displayStock} disponibles)</span>;
        return <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 border border-green-200 text-green-600 px-3 py-1 rounded-full"><i className="fa-solid fa-circle-check"></i> En Stock</span>;
    };

    return (
        <div className="bg-linear-to-b from-[#f5eaff] to-[#fdf4ff] min-h-screen font-winkySans">

            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { 
                label: <span className="text-[#4a577e]">Productos</span>, 
                path: '/shop'
                },
                { label: product.title || product.name },
            ]} />

            {/* ── Main product grid ── */}
            <div className="container py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-sm border border-purple-100/60 p-6 md:p-10">

                    {/* ── Left: Image gallery ── */}
                    <div className="space-y-4">

                        {/* Main image */}
                        <div className="relative bg-gray-50 rounded-2xl overflow-hidden group border border-gray-100">
                            <img
                                src={mainImage}
                                alt={product.title || product.name}
                                className="w-full h-[420px] object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }}
                            />

                            {/* Nav arrows */}
                            {images.length > 1 && (
                                <>
                                    <button onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-[#9b30a0] hover:shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                        <i className="fa-solid fa-chevron-left text-sm"></i>
                                    </button>
                                    <button onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-[#9b30a0] hover:shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                        <i className="fa-solid fa-chevron-right text-sm"></i>
                                    </button>
                                </>
                            )}

                            {/* Zoom button */}
                            <button onClick={() => setZoomOpen(true)}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[#9b30a0] transition-all opacity-0 group-hover:opacity-100"
                                title="Ver imagen completa">
                                <i className="fa-solid fa-expand text-sm"></i>
                            </button>

                            {/* Counter pill */}
                            {images.length > 1 && (
                                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                                    {imageIndex + 1} / {images.length}
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => goToImage(i)}
                                        className={`shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                            imageIndex === i
                                                ? 'border-[#9b30a0] shadow-md shadow-purple-200 scale-105'
                                                : 'border-transparent opacity-50 hover:opacity-90 hover:border-purple-200'
                                        }`}>
                                        <img src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Zoom Modal ── */}
                    {zoomOpen && (
                        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
                            onClick={() => setZoomOpen(false)}>
                            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition z-10"
                                onClick={() => setZoomOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            {images.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition z-10">
                                        <i className="fa-solid fa-chevron-left text-xl"></i>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition z-10">
                                        <i className="fa-solid fa-chevron-right text-xl"></i>
                                    </button>
                                </>
                            )}
                            <img src={mainImage} alt="Zoom"
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                                onClick={(e) => e.stopPropagation()} />
                        </div>
                    )}

                    {/* ── Right: Product details ── */}
                    <div className="flex flex-col gap-5">

                        {/* Title + stock */}
                        <div>
                            <h2 className="text-3xl font-semibold font-winkySans text-[#610361] leading-tight mb-3">
                                {product.title || product.name}
                            </h2>
                            <StockBadge />
                        </div>

                        {/* Price */}
                        <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4">
                            <p className="text-xs text-gray-400 font-winkySans mb-0.5">Precio</p>
                            <p className="text-4xl font-bold text-[#9b30a0] font-winkySans tracking-tight">
                                COP {Number(product.price).toLocaleString()}
                            </p>
                        </div>

                        {/* Ficha Técnica */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Especificaciones
                                </h3>
                                <div className="rounded-xl border border-gray-100 overflow-hidden text-sm">
                                    <table className="w-full text-left border-collapse">
                                        <tbody>
                                            {Object.entries(product.attributes).map(([key, value], idx) => (
                                                <tr key={key} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}`}>
                                                    <th className="py-2.5 px-4 font-semibold text-gray-500 border-r border-gray-100 w-2/5 align-top text-xs uppercase tracking-wide">
                                                        {key}
                                                    </th>
                                                    <td className="py-2.5 px-4 text-gray-700 wrap-break-word font-winkySans">
                                                        {value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Variants */}
                        {Object.keys(variantTypes).length > 0 && Object.entries(variantTypes).map(([typeName, options]) => {
                            const isColor = options.some(o => o.metaValue && o.metaValue.startsWith('#'));
                            return (
                                <div key={typeName}>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                                        {typeName}
                                        {selectedOptions[typeName] && (
                                            <span className="ml-2 text-[#9b30a0] normal-case tracking-normal font-semibold font-winkySans">
                                                — {selectedOptions[typeName]}
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {options.map((opt) => {
                                            const isSelected = selectedOptions[typeName] === opt.value;
                                            if (isColor) {
                                                return (
                                                    <button key={opt.id}
                                                        onClick={() => handleOptionSelect(typeName, opt.value, opt.metaValue)}
                                                        className={`w-9 h-9 rounded-full border-2 transition-all shadow-sm ${isSelected ? 'border-[#9b30a0] ring-2 ring-[#9b30a0] ring-offset-2 scale-110' : 'border-gray-200 hover:border-[#9b30a0] hover:scale-105'}`}
                                                        style={{ backgroundColor: opt.metaValue || '#ccc' }}
                                                        title={opt.value} />
                                                );
                                            }
                                            return (
                                                <button key={opt.id}
                                                    onClick={() => handleOptionSelect(typeName, opt.value, opt.metaValue)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-winkySans border-2 transition-all ${isSelected ? 'border-[#9b30a0] bg-[#9b30a0] text-white shadow-md shadow-purple-200' : 'border-gray-200 text-gray-600 hover:border-[#9b30a0] hover:text-[#9b30a0]'}`}>
                                                    {opt.value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Actions */}
                        <div className="pt-2">
                            {displayStock != null && displayStock <= 0 ? (
                                <div className="flex items-center justify-center gap-3 bg-red-50 border border-red-100 text-red-500 font-semibold px-6 py-4 rounded-xl font-winkySans">
                                    <i className="fa-solid fa-ban text-lg"></i> Producto agotado
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                                    {/* Qty stepper */}
                                    <div className="flex border-2 border-[#9b30a0] rounded-xl text-[#610361] divide-x-2 divide-[#9b30a0] overflow-hidden h-12 shrink-0 shadow-sm">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                            className="h-full w-12 text-xl flex items-center justify-center hover:bg-[#9b30a0] hover:text-white transition-colors select-none">−</button>
                                        <div className="h-full w-11 flex items-center justify-center font-bold text-[#9b30a0]">{qty}</div>
                                        <button onClick={() => setQty(q => availableStock != null ? Math.min(availableStock, q + 1) : q + 1)}
                                            className={`h-full w-12 text-xl flex items-center justify-center transition-colors select-none ${availableStock != null && qty >= availableStock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#9b30a0] hover:text-white'}`}
                                            disabled={availableStock != null && qty >= availableStock}>+</button>
                                    </div>

                                    {/* CTA buttons */}
                                    <div className="flex gap-2 flex-1 h-12">
                                        <button onClick={handleAddToCart}
                                            disabled={availableStock != null && (qty + cartQty) > availableStock}
                                            className={`flex-1 bg-white text-[#9b30a0] border-2 border-[#9b30a0] font-semibold rounded-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${availableStock != null && (qty + cartQty) > availableStock ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <i className="fa-solid fa-cart-plus text-sm"></i>
                                            <span className="hidden xl:inline text-sm">Al carrito</span>
                                            <span className="xl:hidden text-sm">Agregar</span>
                                        </button>

                                        <button onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                                            disabled={availableStock != null && (qty + cartQty) > availableStock}
                                            className={`flex-1 bg-[#9b30a0] text-white font-semibold rounded-xl hover:bg-[#7b2585] transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-200 active:scale-95 ${availableStock != null && (qty + cartQty) > availableStock ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <i className="fa-solid fa-bag-shopping text-sm"></i>
                                            <span className="text-sm">Comprar</span>
                                        </button>

                                        <button onClick={handleAddToWishlist}
                                            className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm active:scale-95 ${favorited ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-100' : 'bg-white text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-400'}`}>
                                            <i className="fa-solid fa-heart"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div className="pt-1 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Categorías</p>
                                <div className="flex gap-2 flex-wrap">
                                    {product.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-50 text-[#7b2585] rounded-full text-xs font-winkySans capitalize border border-purple-100 hover:bg-purple-100 transition-colors">
                                            {tag.name || tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Descripción ── */}
                <div className="mt-8 bg-white rounded-3xl shadow-sm border border-purple-100/60 p-8">
                    <h3 className="flex items-center gap-2.5 text-lg font-bold text-[#610361] font-winkySans mb-5 pb-4 border-b border-purple-50">
                        <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center ">
                            <i className="fa-solid fa-circle-info text-[#9b30a0] text-sm"></i>
                        </span>
                        Descripción del Producto
                    </h3>
                    <div
                        className="text-gray-700 font-winkySans leading-relaxed quill-content max-w-none overflow-hidden wrap-break-word [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:overflow-x-auto [&_iframe]:max-w-full"
                        dangerouslySetInnerHTML={{ __html: product.description || '' }}
                    />
                </div>

                {/* ── Productos Relacionados ── */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-7 bg-[#9b30a0] rounded-full"></div>
                            <h2 className="text-2xl font-bold text-[#610361] font-winkySans">
                                También te podría interesar
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(relProduct => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}