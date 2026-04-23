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
        <section className="py-16 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="mb-10">
                    <h2 className="text-4xl md:text-5xl font-medium text-[#610361] font-swash">
                        Destacados en <span className="text-[#9b30a0]">videos</span>
                    </h2>
                    <p className="text-gray-500 mt-2 font-winkySans">
                        Mira lo que nuestros clientes están compartiendo
                    </p>
                </div>

                <div className="relative">
                    {/* Scroll Left */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                        >
                            <ChevronLeft size={24} className="text-gray-700" />
                        </button>
                    )}
                    {/* Scroll Right */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                        >
                            <ChevronRight size={24} className="text-gray-700" />
                        </button>
                    )}

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {videos.map((video) => (
                            <VideoReelCard key={video.id} video={video} onVideoClick={() => setSelectedVideo(video)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
            )}
        </section>
    );
}
