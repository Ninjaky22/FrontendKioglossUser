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
        <div className="bg-[#F7E6FE]">
            <div className="bg-cover bg-no-repeat bg-center py-36" style={{ backgroundImage: "url('/assets/images/banner-bg.jpeg')" }}>
                <div className="container">
                    <h1 className="text-6xl text-gray-800 font-medium mb-4 capitalize font-swash">
                        Las mejores colecciones <br /> de Belleza
                    </h1>
                    <div className="mt-12">
                        <Link to="/shop" className="bg-[#9b30a0] text-white hover:-translate-y-1 transition-transform duration-300 px-8 py-3 font-medium rounded-md font-swash shadow-lg hover:shadow-xl">Compra Ahora</Link>
                    </div>
                </div>
            </div>

            <div className="container py-8">
                <div className="w-10/12 grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto justify-center">
                    {[
                        { img: '/assets/images/icons/delivery-van.svg', title: 'Envíos a todo el país', sub: '' },
                        { img: '/assets/images/icons/money-back.svg', title: 'Reembolso', sub: '30 días de devolución de dinero' },
                        { img: '/assets/images/icons/service-hours.svg', title: 'Soporte 24/7', sub: 'Atención al cliente' },
                    ].map((f, i) => (
                        <div key={i} className="border border-white bg-white rounded-xl px-3 py-6 flex justify-center items-center gap-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                            <img src={f.img} alt={f.title} className="w-12 h-12 object-contain" />
                            <div>
                                <h4 className="font-medium font-winkySans capitalize text-lg text-gray-800">{f.title}</h4>
                                {f.sub && <p className="text-gray-500 font-winkySans text-sm">{f.sub}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container pb-8">
                <h2 className="text-5xl font-medium text-[#610361] font-swash mb-8 text-center">Comprar por categoria</h2>
                {tags.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {tags.map((tag) => (
                            <div key={tag.id} className="relative rounded-sm overflow-hidden group">
                                <img src={tag.imageURL || defaultImg} alt={tag.name}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImg; }} />
                                <Link to={`/shop?categories=${encodeURIComponent(tag.name)}`}
                                    className="absolute inset-0 bg-black/30 hover:bg-black/60 flex items-center justify-center text-xl text-white font-surfer font-medium transition capitalize">
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
