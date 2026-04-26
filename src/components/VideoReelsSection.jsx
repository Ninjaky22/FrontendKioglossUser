import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VideoReelCard from './VideoReelCard';
import VideoModal from './VideoModal';
import videoService from '../services/videoService';

export default function VideoReelsSection() {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        videoService.getAllVideos()
            .then(data => setVideos(data || []))
            .catch(() => {});
    }, []);

    const checkScroll = () => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 0);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        const el = scrollContainerRef.current;
        if (el) {
            const amount = 320;
            el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
            setTimeout(checkScroll, 400);
        }
    };

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            checkScroll();
            return () => el.removeEventListener('scroll', checkScroll);
        }
    }, [videos]);

    if (videos.length === 0) return null;

    return (
        <section className="py-16 bg-linear-to-b from-[#fdf4ff] to-white relative overflow-hidden font-winkySans">
            
            <div className="container mx-auto px-6 relative">

                {/* ── Encabezado ── */}
                <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-s font-bold text-[#9b30a0] uppercase tracking-widest mb-1">Comunidad</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#610361] font-swash leading-tight text-center">
                            Destacados en <span className="text-[#9b30a0] italic">videos</span>
                        </h2>
                        <p className="text-gray-600 mt-2 font-winkySans text-s">
                            Mira lo que nuestros clientes están compartiendo
                        </p>
                    </div>
                </div>

                {/* ── Carrusel ── */}
                <div className="relative flex items-center gap-3">

                    {/* Botón izquierda */}
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className="shrink-0 w-10 h-10 rounded-xl border-2 border-[#610361] flex items-center justify-center text-[#610361] hover:bg-[#610361] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Carrusel */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory flex-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {videos.map((video) => (
                            <VideoReelCard key={video.id} video={video} onVideoClick={() => setSelectedVideo(video)} />
                        ))}
                    </div>

                    {/* Botón derecha */}
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className="shrink-0 w-10 h-10 rounded-xl border-2 border-[#610361] flex items-center justify-center text-[#610361] hover:bg-[#610361] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={18} />
                    </button>

                </div>
            </div>

            {selectedVideo && (
                <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
            )}
        </section>
    );
}