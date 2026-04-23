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
    const [selectedOptions, setSelectedOptions] = useState({}); // { "Color": "Rojo", "Modelo": "GTX 1060" }
    const [lastSelectedType, setLastSelectedType] = useState(null); // último tipo seleccionado

    // Derive available variant types and their unique options from product.variants
    const variantTypes = useMemo(() => {
        if (!product?.variants) return {};
        const types = {};
        product.variants.forEach(variant => {
            variant.options?.forEach(opt => {
                if (!types[opt.typeName]) {
                    types[opt.typeName] = new Map();
                }
                if (!types[opt.typeName].has(opt.value)) {
                    types[opt.typeName].set(opt.value, opt);
                }
            });
        });
        // Convert Maps to Arrays
        const result = {};
        for (const key in types) {
            result[key] = Array.from(types[key].values());
        }
        return result;
    }, [product]);

    // Find the variant that matches the last selected option type
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

    // Derived stock based on selected variant, or fallback to total stock
    const displayStock = currentVariant ? currentVariant.stock : product?.stock;
    const availableStock = displayStock;

    // Calculate current items in cart for stock validation
    const cartItem = cart?.find(i => i.variantId === currentVariant?.id) 
                  || cart?.find(i => i.id === product?.id && !i.variantId); // Fallback for old carts
    const cartQty = cartItem?.quantity || 0;

    const images = product?.images?.length > 0 ? product.images : ['/assets/images/products/product1.jpg'];

    useEffect(() => {
        setLoading(true);
        productService.getProductBySlug(slug)
            .then(data => {
                setProduct(data);

                // Do not auto-select variants to allow full gallery view initially
                setSelectedOptions({});
                setLastSelectedType(null);
                setMainImage(data.images?.[0] || '/assets/images/products/product1.jpg');
                setImageIndex(0);
                setQty(1);

                // Fetch related products
                if (data?.tags?.length > 0) {                    const tagNames = data.tags.map(t => typeof t === 'object' ? t.name : t);
                    productService.getAllProducts(0, 5, '', tagNames).then(res => {
                        if (res && res.content) {
                            setRelatedProducts(res.content.filter(p => p.id !== data.id).slice(0, 4));
                        }
                    }).catch(console.error);
                } else {
                    productService.getAllProducts(0, 5).then(res => {
                        if (res && res.content) {
                            setRelatedProducts(res.content.filter(p => p.id !== data.id).slice(0, 4));
                        }
                    }).catch(console.error);
                }
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [slug]);

    // Handle Option Click
    const handleOptionSelect = (typeName, value, metaValue) => {
        setSelectedOptions(prev => ({ ...prev, [typeName]: value }));
        setLastSelectedType(typeName);
    };

    // Sync image & carousel index when currentVariant changes
    useEffect(() => {
        if (currentVariant?.imageUrl) {
            setMainImage(currentVariant.imageUrl);
            // Find matching index in the images array to sync thumbnails & counter
            const idx = images.indexOf(currentVariant.imageUrl);
            if (idx >= 0) {
                setImageIndex(idx);
            }
        }
    }, [currentVariant, images]);

    // Sync favorited state from context without re-fetching the product
    useEffect(() => {
        if (product?.id) setFavorited(favoriteIds.includes(product.id));
    }, [favoriteIds, product?.id]);

    const handleAddToCart = () => {
        if (!product) return;

        if (!currentVariant && product.variants?.length > 0) {
             Swal.fire({
                toast: true, position: 'top-end', icon: 'warning',
                title: 'Selecciona una variante antes de agregar', showConfirmButton: false, timer: 2500,
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
                showConfirmButton: false,
                timer: 3000,
            });
            return;
        }

        // Pass variantId to cart
        const productToAdd = {
            ...product,
            variantId: currentVariant?.id,
            variantDetails: currentVariant ? currentVariant.options.map(o => o.value).join(', ') : '',
        };

        // We no longer send selectedSize/selectedColor directly, the variantId encapsulates it
        addToCart(productToAdd, qty, null, null);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Producto agregado al carrito',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
    };
    const handleAddToWishlist = async () => {
        if (!isAuthenticated || !accountId) {
            navigate('/login');
            return;
        }
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
        }
    };

    const goToImage = useCallback((idx) => {
        const clamped = ((idx % images.length) + images.length) % images.length;
        setImageIndex(clamped);
        setMainImage(images[clamped]);
    }, [images]);

    const prevImage = () => goToImage(imageIndex - 1);
    const nextImage = () => goToImage(imageIndex + 1);

    if (loading) return (
        <div className="bg-[#F7E6FE] flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#610361]"></div>
        </div>
    );

    if (!product) return (
        <div className="bg-[#F7E6FE] py-20 text-center">
            <h2 className="text-2xl text-gray-600">Producto no encontrado</h2>
            <Link to="/shop" className="mt-4 inline-block text-[#610361] hover:underline">Volver a la tienda</Link>
        </div>
    );

    return (
        <div className="bg-[#F7E6FE]">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Productos', path: '/shop' },
                { label: product.title || product.name },
            ]} />
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-10 py-8">
                {/* Image Viewer */}
                <div className="space-y-4">
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm group">
                        <img src={mainImage} alt={product.title || product.name}
                            className="w-full h-[420px] object-contain p-4"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/products/product1.jpg'; }} />

                        {/* Navigation arrows */}
                        {images.length > 1 && (
                            <>
                                <button onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-[#9b30a0] transition opacity-0 group-hover:opacity-100">
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <button onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-[#9b30a0] transition opacity-0 group-hover:opacity-100">
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </>
                        )}

                        {/* Zoom button */}
                        <button onClick={() => setZoomOpen(true)}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-[#9b30a0] transition opacity-0 group-hover:opacity-100"
                            title="Ver imagen completa">
                            <i className="fa-solid fa-expand"></i>
                        </button>

                        {/* Image counter */}
                        {images.length > 1 && (
                            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                                {imageIndex + 1} / {images.length}
                            </span>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, i) => (
                                <button key={i} onClick={() => goToImage(i)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${imageIndex === i ? 'border-[#9b30a0] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                    <img src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Zoom Modal */}
                {zoomOpen && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                        onClick={() => setZoomOpen(false)}>
                        <button className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition z-10"
                            onClick={() => setZoomOpen(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        {images.length > 1 && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition z-10">
                                    <i className="fa-solid fa-chevron-left text-xl"></i>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition z-10">
                                    <i className="fa-solid fa-chevron-right text-xl"></i>
                                </button>
                            </>
                        )}
                        <img src={mainImage} alt="Zoom"
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()} />
                    </div>
                )}

                {/* Product Details */}
                <div>
                    <div className="max-w-lg">
                        <h2 className="text-3xl font-medium font-swash text-[#610361] mb-2">{product.title || product.name}</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600 font-winkySans space-x-2">
                                <span>Disponibilidad: </span>
                                {displayStock != null && displayStock <= 0 ? (
                                    <span className="text-red-600 font-semibold">Agotado</span>
                                ) : displayStock != null && displayStock <= 3 ? (
                                    <span className="text-amber-500 font-semibold">¡Últimas {displayStock} unidades!</span>
                                ) : displayStock != null ? (
                                    <span className="text-green-600 font-semibold">En Stock ({displayStock} disponibles)</span>
                                ) : (
                                    <span className="text-green-600 font-semibold">En Stock</span>
                                )}
                            </p>
                        </div>
                        <div className="text-3xl text-[#9b30a0] font-bold mt-4 font-winkySans">COP {Number(product.price).toLocaleString()}</div>
                        
                        {/* Ficha Técnica */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="mt-5">
                                <h3 className="text-sm font-bold text-[#610361] font-winkySans mb-2">Especificaciones Técnicas:</h3>
                                <div className="rounded-lg border border-gray-200 overflow-hidden text-sm font-winkySans">
                                    <table className="w-full text-left border-collapse">
                                        <tbody>
                                            {Object.entries(product.attributes).map(([key, value], idx) => (
                                                <tr key={key} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                    <th className="py-2 px-4 font-medium text-gray-700 border-r border-gray-200 w-2/5 align-top">
                                                        {key}
                                                    </th>
                                                    <td className="py-2 px-4 text-gray-600 break-words">
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
                        {Object.keys(variantTypes).length > 0 && Object.entries(variantTypes).map(([typeName, options], idx) => {
                            const isColor = options.some(o => o.metaValue && o.metaValue.startsWith('#'));
                            
                            return (
                                <div key={typeName} className="mt-5">
                                    <h3 className="text-sm text-gray-500 font-winkySans mb-2">
                                        {typeName}: <span className="text-[#610361] font-semibold">{selectedOptions[typeName]}</span>
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {options.map((opt, i) => {
                                            const isSelected = selectedOptions[typeName] === opt.value;
                                            
                                            if (isColor) {
                                                return (
                                                    <button key={opt.id} 
                                                        onClick={() => handleOptionSelect(typeName, opt.value, opt.metaValue)}
                                                        className={`w-8 h-8 rounded-full border-2 transition shadow-sm ${isSelected ? 'border-[#9b30a0] ring-2 ring-[#9b30a0] ring-offset-2' : 'border-gray-200 hover:border-[#9b30a0]'}`}
                                                        style={{ backgroundColor: opt.metaValue || '#ccc' }}
                                                        title={opt.value} />
                                                );
                                            } else {
                                                return (
                                                    <button key={opt.id} 
                                                        onClick={() => handleOptionSelect(typeName, opt.value, opt.metaValue)}
                                                        className={`px-4 py-1.5 rounded-lg text-sm font-winkySans border-2 transition ${isSelected ? 'border-[#9b30a0] bg-[#9b30a0] text-white' : 'border-gray-200 text-gray-600 hover:border-[#9b30a0]'}`}>
                                                        {opt.value}
                                                    </button>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-8 flex flex-col gap-3">
                            {displayStock != null && displayStock <= 0 ? (
                                <span className="bg-red-100 text-red-600 font-semibold px-6 py-3 rounded-lg font-winkySans text-center w-full shadow-sm">
                                    <i className="fa-solid fa-ban mr-2"></i>Producto agotado
                                </span>
                            ) : (
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between w-full">
                                <div className="flex border border-[#9b30a0] rounded-lg text-[#610361] divide-x divide-[#9b30a0] bg-transparent overflow-hidden h-12 shrink-0">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="h-full w-12 text-xl flex items-center justify-center cursor-pointer select-none hover:bg-[#9b30a0] hover:text-white transition bg-transparent">−</button>
                                    <div className="h-full w-10 flex items-center justify-center font-medium bg-transparent">{qty}</div>
                                    <button onClick={() => setQty(q => availableStock != null ? Math.min(availableStock, q + 1) : q + 1)}
                                        className={`h-full w-12 text-xl flex items-center justify-center cursor-pointer select-none transition bg-transparent ${availableStock != null && qty >= availableStock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#9b30a0] hover:text-white'}`}
                                        disabled={availableStock != null && qty >= availableStock}>+</button>
                                </div>
                                
                                <div className="flex gap-2 flex-1 h-12">
                                    <button onClick={handleAddToCart}
                                        disabled={availableStock != null && (qty + cartQty) > availableStock}
                                        className={`flex-1 bg-white text-[#9b30a0] border border-[#9b30a0] px-2 font-medium rounded-lg hover:bg-[#fdf5ff] transition flex items-center justify-center gap-2 shadow-sm ${availableStock != null && (qty + cartQty) > availableStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <i className="fa-solid fa-cart-plus"></i> <span className="hidden xl:inline">Al carrito</span><span className="xl:hidden">Agregar</span>
                                    </button>
                                    
                                    <button onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                                        disabled={availableStock != null && (qty + cartQty) > availableStock}
                                        className={`flex-1 bg-[#9b30a0] text-white px-2 font-medium rounded-lg hover:bg-[#7b2585] transition flex items-center justify-center gap-2 shadow-sm ${availableStock != null && (qty + cartQty) > availableStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <i className="fa-solid fa-bag-shopping"></i> Comprar
                                    </button>
                                    
                                    <button onClick={handleAddToWishlist}
                                        className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center border transition shadow-sm ${favorited ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-500'}`}>
                                        <i className="fa-solid fa-heart"></i>
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                        {product.tags?.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm text-gray-500 font-winkySans mb-2">Categorías:</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {product.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-[#f3d5ff] text-[#610361] rounded-full text-xs font-winkySans capitalize border border-[#e6affc]">
                                            {tag.name || tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Descripción (Detailed full-width card below) */}
            <div className="container pb-12">
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
                    <h3 className="text-xl font-bold text-[#610361] font-swash mb-6 border-b border-purple-50 pb-4">
                        <i className="fa-solid fa-circle-info mr-2"></i>Descripción del Producto
                    </h3>
                    <div 
                        className="text-gray-700 font-winkySans leading-relaxed quill-content max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.description || '' }}
                    />
                </div>

                {/* Productos Relacionados */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-[#610361] font-swash mb-6 border-l-4 border-[#9b30a0] pl-3">
                            También te podría interesar
                        </h2>
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
