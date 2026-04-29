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

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return undefined;

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => checkScroll());
            resizeObserver.observe(el);
        }

        const handleResize = () => checkScroll();
        window.addEventListener('resize', handleResize);

        requestAnimationFrame(checkScroll);

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [videos]);

    if (videos.length === 0) return null;

    return (
        <section className="py-16 bg-linear-to-b from-[#fdf4ff] to-white relative overflow-hidden font-winkySans">
            
            <div className="container mx-auto px-6 relative">

                {/* ── Encabezado ── */}
                <div className="mb-8 md:mb-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-4 text-center md:text-left">
                    <div>
                        <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-[#610361] border border-[#f1d7ff]">
                            Comunidad
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#610361] font-swash leading-tight">
                            Destacados en <span className="text-[#9b30a0] italic">videos</span>
                        </h2>
                        <p className="text-gray-600 mt-2 font-winkySans text-sm sm:text-base">
                            Mira lo que nuestros clientes están compartiendo
                        </p>
                    </div>
                </div>

                {/* ── Carrusel ── */}
                <div className="relative flex items-center md:gap-3">

                    {/* Botón izquierda */}
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className="hidden md:flex shrink-0 w-10 h-10 rounded-xl border-2 border-[#610361] items-center justify-center text-[#610361] hover:bg-[#610361] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Carrusel */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory flex-1 pt-2"
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
                        className="hidden md:flex shrink-0 w-10 h-10 rounded-xl border-2 border-[#610361] items-center justify-center text-[#610361] hover:bg-[#610361] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
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