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
        <div className="col-span-1 bg-white px-4 pb-6 shadow rounded overflow-hidden hidden md:block">
            <div className="divide-y divide-gray-200 space-y-5">
                {selected.length > 0 && (
                    <div className="pt-4">
                        <button onClick={clear}
                            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm font-winkySans">
                            Limpiar filtros
                        </button>
                    </div>
                )}
                <div>
                    <h3 className="text-xl text-gray-800 mb-3 uppercase font-medium font-winkySans">Categorías</h3>
                    {loading ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ) : tags.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {tags.map(tag => (
                                <div key={tag.id} className="flex items-center">
                                    <input type="checkbox" id={`tag-${tag.id}`}
                                        checked={selected.includes(tag.id)}
                                        onChange={() => toggle(tag.id)}
                                        className="text-[#610361] focus:ring-[#610361] rounded-sm cursor-pointer" />
                                    <label htmlFor={`tag-${tag.id}`}
                                        className="text-gray-600 ml-3 cursor-pointer capitalize font-winkySans">
                                        {tag.name || tag.slug}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm font-winkySans">No hay categorías disponibles</p>
                    )}
                </div>
            </div>
        </div>
    );
}
