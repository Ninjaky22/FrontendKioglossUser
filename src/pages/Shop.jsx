import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedTagNames, setSelectedTagNames] = useState([]);
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        productService.getAllTags().then(d => setTags(d || [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (tags.length === 0) return;
        const search = searchParams.get('search') || '';
        const catParam = searchParams.get('categories') || searchParams.get('category') || '';
        setSearchQuery(search);
        if (catParam) {
            const catNames = catParam.split(',').map(c => decodeURIComponent(c.trim()));
            const matched = catNames.filter(cn => tags.some(t => t.name?.toLowerCase() === cn.toLowerCase()));
            setSelectedTagNames(matched.length > 0 ? matched : []);
        } else {
            setSelectedTagNames([]);
        }
    }, [searchParams, tags]);

    useEffect(() => {
        loadProducts();
    }, [currentPage, searchQuery, selectedTagNames, sortBy]);

    const loadProducts = async () => {
        try {
            setLoading(true); setError(null);
            const data = await productService.getAllProducts(currentPage, 12, searchQuery, selectedTagNames, sortBy);
            setProducts(data.content || data || []);
            setTotalPages(data.totalPages || 1);
        } catch {
            setError('Error al cargar los productos.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const updateURL = (names, search) => {
        const params = {};
        if (names.length > 0) params.categories = names.join(',');
        if (search) params.search = search;
        setSearchParams(params, { replace: true });
    };

    const handleFilterChange = ({ tags: tagIds }) => {
        const names = tagIds.map(id => tags.find(t => t.id === id)?.name).filter(Boolean);
        setSelectedTagNames(names);
        setCurrentPage(0);
        setShowOutOfStock(false);
        updateURL(names, searchQuery);
    };

    const clearAll = () => {
        setSearchQuery('');
        setSelectedTagNames([]);
        setSearchParams({}, { replace: true });
        setCurrentPage(0);
        setShowOutOfStock(false);
    };

    const hasActiveFilters = searchQuery || selectedTagNames.length > 0;

    return (
        <div className="bg-linear-to-b from-[#f5eaff] to-[#fdf4ff] min-h-screen font-winkySans">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Productos' }
            ]} />

            <div className="container grid md:grid-cols-4 grid-cols-2 gap-6 pt-6 pb-16 items-start">
                <Sidebar
                    onFilterChange={handleFilterChange}
                    selectedTags={selectedTagNames.map(n => tags.find(t => t.name === n)?.id).filter(Boolean)}
                />

                <div className="col-span-3">

                    {/* ── Barra de filtros ── */}
                    <div className="bg-white rounded-2xl border border-purple-100/70 shadow-sm px-4 py-3 mb-6 flex flex-wrap items-center gap-3">

                        {/* Sort select */}
                        <div className="relative">
                            <select
                                onChange={(e) => setSortBy(e.target.value)}
                                value={sortBy}
                                className="appearance-none pl-4 pr-9 py-2.5 text-sm text-[#610361] bg-purple-50 border border-purple-200 rounded-xl font-winkySans focus:outline-none focus:ring-2 focus:ring-[#9b30a0]/30 focus:border-[#9b30a0] cursor-pointer transition-all hover:bg-purple-100"
                            >
                                <option value="">Configuración predeterminada</option>
                                <option value="price-low">Precio: menor a mayor</option>
                                <option value="price-high">Precio: mayor a menor</option>
                                <option value="latest">Últimos productos</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[#9b30a0] text-xs pointer-events-none"></i>
                        </div>

                        {/* Divider */}
                        {(products.some(p => p.stock != null && p.stock <= 0) || hasActiveFilters) && (
                            <div className="w-px h-6 bg-purple-100 hidden sm:block"></div>
                        )}

                        {/* Mostrar agotados */}
                        {products.some(p => p.stock != null && p.stock <= 0) && (
                            <button
                                onClick={() => setShowOutOfStock(v => !v)}
                                className={`inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-winkySans transition-all border ${
                                    showOutOfStock
                                        ? 'bg-[#610361] text-white border-[#610361] shadow-md shadow-purple-200'
                                        : 'bg-purple-50 text-[#610361] border-purple-200 hover:bg-purple-100'
                                }`}
                            >
                                <i className={`fa-solid ${showOutOfStock ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                                {showOutOfStock ? 'Viendo agotados' : 'Mostrar agotados'}
                            </button>
                        )}

                        {/* Active filter chips */}
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {selectedTagNames.map(name => (
                                    <span
                                        key={name}
                                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-[#9b30a0] text-white text-xs rounded-full font-winkySans shadow-sm"
                                    >
                                        <i className="fa-solid fa-tag text-[10px] opacity-70"></i>
                                        {name}
                                        <button
                                            onClick={() => {
                                                const next = selectedTagNames.filter(n => n !== name);
                                                setSelectedTagNames(next);
                                                setCurrentPage(0);
                                                updateURL(next, searchQuery);
                                            }}
                                            className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors ml-0.5"
                                        >
                                            <i className="fa-solid fa-xmark text-[9px]"></i>
                                        </button>
                                    </span>
                                ))}

                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-[#9b30a0] text-white text-xs rounded-full font-winkySans shadow-sm">
                                        <i className="fa-solid fa-magnifying-glass text-[10px] opacity-70"></i>
                                        "{searchQuery}"
                                        <button
                                            onClick={clearAll}
                                            className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors ml-0.5"
                                        >
                                            <i className="fa-solid fa-xmark text-[9px]"></i>
                                        </button>
                                    </span>
                                )}

                                {(selectedTagNames.length > 1 || (selectedTagNames.length > 0 && searchQuery)) && (
                                    <button
                                        onClick={clearAll}
                                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-winkySans transition-colors"
                                    >
                                        <i className="fa-solid fa-circle-xmark text-sm"></i>
                                        Limpiar todo
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Grid de productos ── */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-[#9b30a0] animate-spin"></div>
                            <p className="text-sm text-[#9b30a0] font-winkySans">Cargando productos…</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl font-winkySans text-sm">
                            <i className="fa-solid fa-circle-exclamation text-lg"></i>
                            {error}
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-3 grid-cols-2 gap-6">
                                {(() => {
                                    const filtered = showOutOfStock ? products : products.filter(p => p.stock == null || p.stock > 0);
                                    return filtered.length > 0
                                        ? filtered.map(p => <ProductCard key={p.id} product={p} />)
                                        : (
                                            <div className="col-span-3 flex flex-col items-center justify-center py-24 gap-3 text-gray-400 font-winkySans">
                                                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-1">
                                                    <i className="fa-solid fa-box-open text-2xl text-purple-300"></i>
                                                </div>
                                                <p className="text-base font-medium text-gray-500">No se encontraron productos</p>
                                                {hasActiveFilters && (
                                                    <button onClick={clearAll} className="text-sm text-[#9b30a0] hover:underline transition-all">
                                                        Limpiar filtros
                                                    </button>
                                                )}
                                            </div>
                                        );
                                })()}
                            </div>

                            {/* ── Paginación ── */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-10 gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-[#610361] rounded-xl text-sm font-winkySans hover:bg-purple-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <i className="fa-solid fa-chevron-left text-xs"></i> Anterior
                                    </button>

                                    <div className="px-5 py-2.5 bg-[#9b30a0] text-white rounded-xl text-sm font-winkySans shadow-sm">
                                        {currentPage + 1} <span className="opacity-60">/ {totalPages}</span>
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-[#610361] rounded-xl text-sm font-winkySans hover:bg-purple-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        Siguiente <i className="fa-solid fa-chevron-right text-xs"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}