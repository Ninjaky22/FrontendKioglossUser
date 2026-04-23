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

    // Sync URL → state (runs when URL or tags list changes)
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

    // Load products whenever filters change
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

    // Sync state → URL
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

    return (
        <div className="bg-[#F7E6FE]">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Productos' }
            ]} />
            <div className="container grid md:grid-cols-4 grid-cols-2 gap-6 pt-4 pb-16 items-start">
                <Sidebar onFilterChange={handleFilterChange}
                    selectedTags={selectedTagNames.map(n => tags.find(t => t.name === n)?.id).filter(Boolean)} />
                <div className="col-span-3">
                    <div className="flex items-center mb-4 flex-wrap gap-2">
                        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}
                            className="w-60 text-sm text-[#610361] py-3 px-4 border-[#e6affc] bg-[#f3d5ff] shadow-sm rounded-lg font-winkySans focus:ring-[#9b30a0] focus:border-[#9b30a0]">
                            <option value="">Configuración predeterminada</option>
                            <option value="price-low">Precio: menor a mayor</option>
                            <option value="price-high">Precio: mayor a menor</option>
                            <option value="latest">Últimos productos</option>
                        </select>
                        {products.some(p => p.stock != null && p.stock <= 0) && (
                        <button onClick={() => setShowOutOfStock(v => !v)}
                            className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg font-winkySans transition-all ${showOutOfStock ? 'bg-[#610361] text-white shadow-md' : 'bg-[#f3d5ff] text-[#610361] hover:bg-[#ebbaff]'}`}>
                            <i className={`fa-solid ${showOutOfStock ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                            {showOutOfStock ? 'Viendo agotados' : 'Mostrar agotados'}
                        </button>
                        )}
                        {(searchQuery || selectedTagNames.length > 0) && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {selectedTagNames.map(name => (
                                    <span key={name} className="inline-flex items-center px-3 py-1 bg-[#ebbaff] text-[#610361] text-sm rounded-full font-winkySans">
                                        {name}
                                        <button onClick={() => {
                                            const next = selectedTagNames.filter(n => n !== name);
                                            setSelectedTagNames(next);
                                            setCurrentPage(0);
                                            updateURL(next, searchQuery);
                                        }} className="ml-1.5 hover:text-red-600 font-bold">×</button>
                                    </span>
                                ))}
                                {searchQuery && (
                                    <span className="inline-flex items-center px-3 py-1 bg-[#ebbaff] text-[#610361] text-sm rounded-full font-winkySans">
                                        "{searchQuery}"
                                        <button onClick={clearAll} className="ml-1.5 hover:text-red-600 font-bold">×</button>
                                    </span>
                                )}
                                {(selectedTagNames.length > 1 || (selectedTagNames.length > 0 && searchQuery)) && (
                                    <button onClick={clearAll} className="text-xs text-gray-500 hover:text-red-600 font-winkySans underline">
                                        Limpiar todo
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#610361]"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-3 grid-cols-2 gap-6">
                                {(() => {
                                    const filtered = showOutOfStock ? products : products.filter(p => p.stock == null || p.stock > 0);
                                    return filtered.length > 0
                                        ? filtered.map(p => <ProductCard key={p.id} product={p} />)
                                        : <div className="col-span-3 text-center py-20 text-gray-600 font-winkySans">No se encontraron productos</div>;
                                })()}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-8 gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                                        className="px-4 py-2 bg-[#f3d5ff] text-[#610361] rounded-lg hover:bg-[#ebbaff] transition disabled:opacity-40 font-winkySans">
                                        <i className="fa-solid fa-chevron-left"></i> Anterior
                                    </button>
                                    <span className="px-4 py-2 text-[#610361] font-winkySans">
                                        Página {currentPage + 1} de {totalPages}
                                    </span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                                        className="px-4 py-2 bg-[#f3d5ff] text-[#610361] rounded-lg hover:bg-[#ebbaff] transition disabled:opacity-40 font-winkySans">
                                        Siguiente <i className="fa-solid fa-chevron-right"></i>
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
