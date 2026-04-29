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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#ffffff,transparent_55%)]"></div>
                
                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    <div className="max-w-2xl text-center md:text-left">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#610361] font-winkySans">
                            Belleza elevada
                        </span>
                        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-7xl leading-tight text-[#610361] font-extrabold mb-4 capitalize font-swash tracking-tight">
                            Las mejores colecciones <br className="hidden sm:block" /> de Belleza
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg text-[#6d3a6f] font-winkySans max-w-xl mx-auto md:mx-0">
                            Ritualiza tu rutina con productos seleccionados, aromas suaves y acabados luminosos.
                        </p>
                        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center md:items-start gap-3 sm:gap-4 md:text-left">
                            <Link
                              to="/shop"
                              className="bg-[#610361] text-white px-8 py-3.5 md:px-10 md:py-4 font-bold rounded-xl font-winkySans tracking-wide
                                         shadow-[0_8px_20px_rgba(97,3,97,0.3)] transition-all duration-300 ease-out border border-[#610361]
                                         hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_25px_rgba(97,3,97,0.4)] hover:bg-[#9b30a0] hover:border-[#9b30a0]
                                         inline-block text-sm md:text-base"
                            >
                              ¡Comprar Ahora!
                            </Link>
                            <Link
                              to="/shop"
                              className="bg-white/80 text-[#610361] px-7 py-3 md:px-9 md:py-4 font-semibold rounded-xl font-winkySans tracking-wide
                                         border border-[#e6b7ff] shadow-[0_6px_18px_rgba(97,3,97,0.12)] transition-all duration-300
                                         hover:-translate-y-1 hover:bg-white hover:border-[#c66be0]"
                            >
                              Ver novedades
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#610361] font-swash">Una experiencia de compra cuidada</h2>
                    <p className="text-sm sm:text-base text-[#6d3a6f] font-winkySans mt-2 max-w-2xl">
                        Envío rápido, soporte real y devoluciones claras para que disfrutes tu rutina sin preocupaciones.
                    </p>
                </div>
                <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-[#e6b7ff] px-5 py-2 text-xs sm:text-sm font-semibold text-[#610361] font-winkySans bg-white/70
                               shadow-[0_8px_20px_rgba(97,3,97,0.1)] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                >
                    Habla con nosotros
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                    { img: '/assets/images/icons/delivery-van.svg', title: 'Envíos a todo el país', sub: 'Entregas seguras' },
                    { img: '/assets/images/icons/money-back.svg', title: 'Reembolso', sub: '30 días de devolución de dinero' },
                    { img: '/assets/images/icons/service-hours.svg', title: 'Soporte 24/7', sub: 'Atención al cliente cercana' },
                ].map((f, i) => (
                    <div
                        key={i}
                        className="group border border-[#f4d7ff] bg-white/80 rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col gap-4
                                transition-all duration-300 cursor-pointer
                                shadow-[0_14px_35px_rgba(97,3,97,0.08)]
                                hover:-translate-y-1 hover:border-[#d7a2f0] hover:shadow-[0_18px_45px_rgba(97,3,97,0.16)]"
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-12 w-12 rounded-2xl bg-[#f7e4ff] flex items-center justify-center">
                                <img src={f.img} alt={f.title} className="w-7 h-7 object-contain" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.35em] text-[#a05aa0] font-bold font-winkySans">Beneficio</span>
                        </div>
                        <div>
                            <h4 className="font-semibold font-winkySans capitalize text-base md:text-lg text-[#610361]">{f.title}</h4>
                            {f.sub && <p className="text-[#7a4a7a] font-winkySans text-xs md:text-sm mt-2">{f.sub}</p>}
                        </div>
                        <div className="h-px w-full bg-linear-to-r from-transparent via-[#f1c8ff] to-transparent"></div>
                        <span className="text-xs font-semibold text-[#610361] font-winkySans">Confianza KioGloss</span>
                    </div>
                ))}
            </div>
        </div>

            <div className="container mx-auto px-4 pb-8 md:pb-12">
                <div className="relative overflow-hidden rounded-3xl border border-[#f1d7ff] bg-white/70 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 shadow-[0_20px_60px_rgba(97,3,97,0.08)]">
                    <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,#f8d8ff,transparent_70%)] opacity-80"></div>
                    <div className="absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,#ffe5f5,transparent_70%)] opacity-70"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col items-center text-center gap-3 mb-7 md:mb-10">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#610361]/10 px-4 py-1 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#610361] font-winkySans">
                                Comprar por categoría
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#610361] font-swash font-winkySans">Explora lo mejor para tu rutina</h2>                       
                        </div>

                        {tags.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                                {tags.map((tag) => (
                                    <Link
                                        key={tag.id}
                                        to={`/shop?categories=${encodeURIComponent(tag.name)}`}
                                        className="group relative overflow-hidden rounded-2xl border border-[#f6d9ff] bg-white/80 shadow-[0_12px_35px_rgba(97,3,97,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(97,3,97,0.2)]"
                                    >
                                        <div className="relative h-56 sm:h-64 lg:h-72">
                                            <img
                                                src={tag.imageURL || defaultImg}
                                                alt={tag.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => { e.target.onerror = null; e.target.src = defaultImg; }}
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-[#3d043d]/85 via-[#3d043d]/35 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                                            <div className="flex items-center justify-between gap-3 font-winkySans">
                                                <div>
                                                    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#610361]">
                                                        Colección
                                                    </span>
                                                    <h3 className="mt-3 text-xl sm:text-2xl text-white font-surfer font-medium capitalize font-winkySans">
                                                        {tag.name}
                                                    </h3>
                                                </div>
                                                <span className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/10 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-300 group-hover:bg-white group-hover:text-[#610361] font-winkySans">
                                                    Ver productos
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#610361]"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <VideoReelsSection />
        </div>
    );
}
