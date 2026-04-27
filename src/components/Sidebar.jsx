import { useState, useEffect } from 'react';
import productService from '../services/productService';

export default function Sidebar({ onFilterChange, selectedTags = [] }) {
    const [tags, setTags] = useState([]);
    const [selected, setSelected] = useState(selectedTags);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productService.getAllTags()
            .then(data => setTags(data || []))
            .catch(() => setTags([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => setSelected(selectedTags), [selectedTags]);

    const toggle = (tagId) => {
        const next = selected.includes(tagId)
            ? selected.filter(id => id !== tagId)
            : [...selected, tagId];
        setSelected(next);
        onFilterChange?.({ tags: next });
    };

    const clear = () => {
        setSelected([]);
        onFilterChange?.({ tags: [] });
    };

    return (
        <div className="w-full md:col-span-1 drop-shadow-sm transition-all duration-300">
            <style>{`
                .sidebar-tag-check { display: none; }
                .sidebar-tag-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.18s, color 0.18s;
                    font-family: 'Winky Sans', sans-serif;
                    color: #4b5563;
                    font-size: 0.95rem;
                    user-select: none;
                    border: 1.5px solid transparent;
                }
                .sidebar-tag-label:hover {
                    background: #f3d5ff;
                    color: #610361;
                    border-color: #e6affc;
                }
                .sidebar-tag-check:checked + .sidebar-tag-label {
                    background: linear-gradient(135deg, #f3d5ff 0%, #ead5fb 100%);
                    color: #610361;
                    font-weight: 600;
                    border-color: #c97de0;
                }
                .sidebar-tag-indicator {
                    width: 18px;
                    height: 18px;
                    border-radius: 5px;
                    border: 2px solid #d1bfe8;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.18s;
                }
                .sidebar-tag-check:checked + .sidebar-tag-label .sidebar-tag-indicator {
                    background: #610361;
                    border-color: #610361;
                }
                .sidebar-tag-check:checked + .sidebar-tag-label .sidebar-tag-indicator::after {
                    content: '';
                    display: block;
                    width: 5px;
                    height: 9px;
                    border: 2px solid white;
                    border-top: none;
                    border-left: none;
                    transform: rotate(45deg) translateY(-1px);
                }
                .sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .sidebar-scroll::-webkit-scrollbar-track { background: #f3e8ff; border-radius: 4px; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: #c97de0; border-radius: 4px; }
                .clear-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    width: 100%;
                    padding: 8px 16px;
                    background: white;
                    color: #610361;
                    border: 1.5px solid #e6affc;
                    border-radius: 10px;
                    font-family: 'Winky Sans', sans-serif;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.18s;
                }
                .clear-btn:hover {
                    background: #fce4ff;
                    border-color: #c97de0;
                }
            `}</style>

            <div className="bg-white rounded-2xl shadow-sm border border-[#f0d6fb] overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r bg-[#610361] px-5 py-4">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-white/80 text-sm"></i>
                        <h3 className="text-white font-bold text-base uppercase tracking-widest font-winkySans">
                            Filtros
                        </h3>
                    </div>
                </div>

                <div className="px-4 pb-5 pt-4 space-y-4">

                    {/* Categorías */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-[#610361] uppercase tracking-widest font-winkySans">
                                Categorías
                            </span>
                            {selected.length > 0 && (
                                <span className="bg-[#610361] text-white text-[11px] font-bold font-winkySans px-2 py-0.5 rounded-full">
                                    {selected.length}
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 md:gap-1 animate-pulse">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-9 md:h-10 bg-[#f3e8ff] rounded-xl w-full"></div>
                                ))}
                            </div>
                        ) : tags.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 md:gap-1 max-h-64 md:max-h-88 overflow-y-auto sidebar-scroll pr-1 pb-1">
                                {tags.map(tag => (
                                    <div key={tag.id} className="w-full">
                                        <input
                                            type="checkbox"
                                            id={`tag-${tag.id}`}
                                            className="sidebar-tag-check"
                                            checked={selected.includes(tag.id)}
                                            onChange={() => toggle(tag.id)}
                                        />
                                        <label htmlFor={`tag-${tag.id}`} className="sidebar-tag-label w-full whitespace-nowrap overflow-hidden text-ellipsis md:whitespace-normal h-full">
                                            <span className="sidebar-tag-indicator"></span>
                                            <span className="capitalize truncate leading-tight">{tag.name || tag.slug}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm font-winkySans text-center py-4">
                                <i className="fa-solid fa-tag mr-1 opacity-40"></i>
                                No hay categorías disponibles
                            </p>
                        )}
                    </div>

                    {/* Limpiar filtros */}
                    {selected.length > 0 && (
                        <div className="pt-1 border-t border-[#f0d6fb]">
                            <button onClick={clear} className="clear-btn">
                                <i className="fa-solid fa-filter-circle-xmark text-xs"></i>
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}