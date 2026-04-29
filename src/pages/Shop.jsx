import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
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
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobileSortDropdownOpen, setIsMobileSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    const mobileSortDropdownRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
            if (mobileSortDropdownRef.current && !mobileSortDropdownRef.current.contains(event.target)) {
                setIsMobileSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

            <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6 pb-16 items-start">
                
                {/* Overlay móvil para el sidebar */}
                {isMobileSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    ></div>
                )}

                {/* Contenedor del Sidebar (Drawer en móvil, grid normal en PC) */}
                <div className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:w-auto lg:bg-transparent lg:shadow-none lg:z-auto lg:transform-none lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full overflow-y-auto lg:overflow-visible">
                        <div className="p-4 lg:hidden flex items-center justify-between border-b border-purple-100">
                            <h2 className="text-lg font-bold text-[#610361] font-winkySans flex items-center gap-2">
                                <i className="fa-solid fa-filter"></i> Filtros
                            </h2>
                            <button 
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="w-8 h-8 rounded-full bg-purple-50 text-[#9b30a0] flex items-center justify-center hover:bg-purple-100 transition-colors"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        {/* Controles extra en móvil */}
                        <div className="p-4 lg:hidden flex flex-col gap-3 border-b border-purple-100 bg-purple-50/30 overflow-visible">
                            <div className="relative w-full" ref={mobileSortDropdownRef}>
                                <button
                                    onClick={() => setIsMobileSortDropdownOpen(!isMobileSortDropdownOpen)}
                                    className="w-full appearance-none flex items-center justify-between pl-4 pr-3 py-2.5 text-sm text-[#610361] bg-white border border-purple-200 rounded-xl font-winkySans focus:outline-none shadow-sm cursor-pointer transition-all"
                                >
                                    <span className="truncate pr-2">
                                        {sortBy === 'price-low' ? 'Precio: menor a mayor' : 
                                         sortBy === 'price-high' ? 'Precio: mayor a menor' : 
                                         sortBy === 'latest' ? 'Últimos productos' : 
                                         'Configuración predeterminada'}
                                    </span>
                                    <i className={`fa-solid fa-chevron-down text-[#9b30a0] text-xs transition-transform duration-200 ${isMobileSortDropdownOpen ? 'rotate-180' : ''}`}></i>
                                </button>
                                
                                {isMobileSortDropdownOpen && (
                                    <ul className="absolute z-50 w-full mt-1.5 py-1 bg-white border border-purple-100 shadow-[0_4px_20px_-4px_rgba(155,48,160,0.15)] rounded-xl overflow-hidden font-winkySans text-sm transform origin-top transition-all">
                                        {[
                                            { value: '', label: 'Configuración predeterminada' },
                                            { value: 'price-low', label: 'Precio: menor a mayor' },
                                            { value: 'price-high', label: 'Precio: mayor a menor' },
                                            { value: 'latest', label: 'Últimos productos' },
                                        ].map((option) => (
                                            <li key={option.value}>
                                                <button
                                                    onClick={() => {
                                                        setSortBy(option.value);
                                                        setIsMobileSortDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 hover:bg-[#fce4ff] transition-colors ${sortBy === option.value ? 'text-[#9b30a0] font-bold bg-purple-50/50' : 'text-[#610361]'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {products.some(p => p.stock != null && p.stock <= 0) && (
                                <button
                                    onClick={() => setShowOutOfStock(v => !v)}
                                    className={`w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl font-winkySans transition-all border ${
                                        showOutOfStock
                                            ? 'bg-[#610361] text-white border-[#610361] shadow-md shadow-purple-200'
                                            : 'bg-white text-[#610361] border-purple-200 hover:bg-purple-100'
                                    }`}
                                >
                                    <i className={`fa-solid ${showOutOfStock ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                                    {showOutOfStock ? 'Viendo agotados' : 'Mostrar agotados'}
                                </button>
                            )}
                        </div>

                        <div className="p-4 lg:p-0">
                            <Sidebar
                                onFilterChange={handleFilterChange}
                                selectedTags={selectedTagNames.map(n => tags.find(t => t.name === n)?.id).filter(Boolean)}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-3">

                    {/* ── Barra de filtros ── */}
                    <div className="bg-white rounded-2xl border border-purple-100/70 shadow-sm px-3 sm:px-4 py-3 mb-4 sm:mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">

                        {/* Botón Filtros Móvil */}
                        <button 
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="w-full sm:w-auto lg:hidden appearance-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white bg-[#610361] hover:bg-[#9b30a0] rounded-xl font-winkySans focus:outline-none shadow-md shadow-purple-200 transition-all font-bold"
                        >
                            <i className="fa-solid fa-sliders"></i>
                            Filtrar Productos
                            {(selectedTagNames.length > 0) && (
                                <span className="bg-white text-[#610361] text-xs px-1.5 py-0.5 rounded-md ml-1 font-bold">
                                    {selectedTagNames.length}
                                </span>
                            )}
                        </button>

                        {/* Sort select */}
                        <div className="relative w-full sm:w-auto hidden lg:block" ref={sortDropdownRef}>
                            <button
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                className="w-full sm:w-auto appearance-none flex items-center justify-between sm:min-w-60 pl-4 pr-3 py-2.5 text-sm text-[#610361] bg-purple-50 border border-purple-200 rounded-xl font-winkySans focus:outline-none focus:ring-2 focus:ring-[#9b30a0]/30 focus:border-[#9b30a0] cursor-pointer transition-all hover:bg-purple-100"
                            >
                                <span className="truncate pr-2">
                                    {sortBy === 'price-low' ? 'Precio: menor a mayor' : 
                                     sortBy === 'price-high' ? 'Precio: mayor a menor' : 
                                     sortBy === 'latest' ? 'Últimos productos' : 
                                     'Configuración predeterminada'}
                                </span>
                                <i className={`fa-solid fa-chevron-down text-[#9b30a0] text-xs transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`}></i>
                            </button>
                            
                            {isSortDropdownOpen && (
                                <ul className="absolute z-50 w-full mt-1.5 py-1 bg-white border border-purple-100 shadow-[0_4px_20px_-4px_rgba(155,48,160,0.15)] rounded-xl overflow-hidden font-winkySans text-sm transform origin-top transition-all">
                                    {[
                                        { value: '', label: 'Configuración predeterminada' },
                                        { value: 'price-low', label: 'Precio: menor a mayor' },
                                        { value: 'price-high', label: 'Precio: mayor a menor' },
                                        { value: 'latest', label: 'Últimos productos' },
                                    ].map((option) => (
                                        <li key={option.value}>
                                            <button
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 hover:bg-[#fce4ff] transition-colors ${sortBy === option.value ? 'text-[#9b30a0] font-bold bg-purple-50/50' : 'text-[#610361]'}`}
                                            >
                                                {option.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Divider */}
                        {(products.some(p => p.stock != null && p.stock <= 0) || hasActiveFilters) && (
                            <div className="w-px h-6 bg-purple-100 hidden sm:block"></div>
                        )}

                        {/* Mostrar agotados */}
                        {products.some(p => p.stock != null && p.stock <= 0) && (
                            <button
                                onClick={() => setShowOutOfStock(v => !v)}
                                className={`hidden lg:inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl font-winkySans transition-all border ${
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {(() => {
                                    const filtered = showOutOfStock ? products : products.filter(p => p.stock == null || p.stock > 0);
                                    return filtered.length > 0
                                        ? filtered.map(p => <ProductCard key={p.id} product={p} />)
                                        : (
                                            <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-24 gap-3 text-gray-400 font-winkySans">
                                                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-1">
                                                    <i className="fa-solid fa-box-open text-2xl text-purple-300"></i>
                                                </div>
                                                <p className="text-base font-medium text-gray-500 text-center px-4">No se encontraron productos</p>
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
                                <div className="flex flex-wrap justify-center items-center mt-10 gap-2 sm:gap-4 px-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 bg-white border border-purple-200 text-[#610361] rounded-xl text-xs sm:text-sm font-winkySans hover:bg-purple-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <i className="fa-solid fa-chevron-left text-[10px] sm:text-xs"></i> <span className="hidden sm:inline">Anterior</span>
                                    </button>

                                    <div className="px-4 sm:px-5 py-2.5 bg-[#9b30a0] text-white rounded-xl text-xs sm:text-sm font-winkySans shadow-sm font-medium">
                                        {currentPage + 1} <span className="opacity-60 font-normal mx-1">de</span> {totalPages}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 bg-white border border-purple-200 text-[#610361] rounded-xl text-xs sm:text-sm font-winkySans hover:bg-purple-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <span className="hidden sm:inline">Siguiente</span> <i className="fa-solid fa-chevron-right text-[10px] sm:text-xs"></i>
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