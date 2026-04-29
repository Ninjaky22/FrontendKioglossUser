import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import VideoReelsSection from '../components/VideoReelsSection';
import productService from '../services/productService';

export default function Home() {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        productService.getAllTags().then(d => setTags(d || [])).catch(() => {});
    }, []);

    const defaultImg = '/assets/images/category/category-1.jpg';

    return (
        <div className="bg-[#fdf4ff]">
            <div className="bg-cover bg-no-repeat bg-center py-24 sm:py-32 lg:py-40 relative" style={{ backgroundImage: "url('/assets/images/banner-bg.jpeg')" }}>
                {/* Gradiente blanco fluido para texto oscuro legible */}
                <div className="absolute inset-0 bg-linear-to-r from-[#fdf4ff]/95 via-[#fdf4ff]/70 to-transparent"></div>
                
                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    <div className="max-w-2xl text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl leading-tight text-[#610361] font-extrabold mb-4 capitalize font-swash tracking-tight">
                            Las mejores colecciones <br className="hidden sm:block" /> de Belleza
                        </h1>
                        <div className="mt-8 md:mt-10 md:text-left">
                            <Link 
                              to="/shop" 
                              className="bg-[#610361] text-white px-8 py-3.5 md:px-10 md:py-4 font-bold rounded-xl font-winkySans tracking-wide
                                         shadow-[0_8px_20px_rgba(97,3,97,0.3)] transition-all duration-300 ease-out border border-[#610361]
                                         hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_25px_rgba(97,3,97,0.4)] hover:bg-[#9b30a0] hover:border-[#9b30a0] 
                                         inline-block text-sm md:text-base"
                            >
                              ¡Comprar Ahora!
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="w-full sm:w-11/12 lg:w-10/12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mx-auto justify-center">
                {[
                    { img: '/assets/images/icons/delivery-van.svg', title: 'Envíos a todo el país', sub: '' },
                    { img: '/assets/images/icons/money-back.svg', title: 'Reembolso', sub: '30 días de devolución de dinero' },
                    { img: '/assets/images/icons/service-hours.svg', title: 'Soporte 24/7', sub: 'Atención al cliente' },
                ].map((f, i) => (
                    <div 
                        key={i} 
                        className="border border-[#f8e5ff] bg-white rounded-2xl p-4 sm:p-5 lg:px-6 lg:py-6 flex flex-col sm:flex-row justify-center items-center gap-4 text-center sm:text-left
                                transition-all duration-300 cursor-pointer
                                shadow-[0_10px_30px_rgba(97,3,97,0.06)] 
                                hover:-translate-y-1 
                                hover:border-[#e6affc]
                                hover:shadow-[0_15px_40px_rgba(97,3,97,0.12)]"
                    >
                        <img src={f.img} alt={f.title} className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0" />
                        <div>
                            <h4 className="font-medium font-winkySans capitalize text-base md:text-lg text-[#610361]">{f.title}</h4>
                            {f.sub && <p className="text-gray-500 font-winkySans text-xs md:text-sm mt-1 sm:mt-0">{f.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>

            <div className="container mx-auto px-4 pb-8 md:pb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#610361] font-swash mb-6 md:mb-8 text-center">Comprar por categoría</h2>
                {tags.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {tags.map((tag) => (
                            <div key={tag.id} className="relative rounded-sm overflow-hidden group 
                                transition-all duration-500 cursor-pointer
                                shadow-[0_0_15px_rgba(0,0,0,0.05)] 
                                hover:scale-[1.01] 
                                hover:shadow-[0_0_25px_rgba(0,0,0,0.1)]">
                                <img src={tag.imageURL || defaultImg} alt={tag.name}
                                    className="w-full h-56 sm:h-64 lg:h-72 object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImg; }} />
                                <Link to={`/shop?categories=${encodeURIComponent(tag.name)}`}
                                    className="absolute inset-0 bg-black/30 hover:bg-black/60 flex items-center justify-center text-xl sm:text-2xl text-white font-surfer font-medium transition-colors duration-300 capitalize font-winkySans">
                                    {tag.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#610361]"></div>
                    </div>
                )}
            </div>

            <VideoReelsSection />
        </div>
    );
}
