import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoParser';

export default function VideoReelCard({ video, onVideoClick }) {
    const [showVideo, setShowVideo] = useState(false);
    const hoverTimerRef = useRef(null);
    const videoRef = useRef(null);

    const parsed = parseVideoUrl(video.videoUrl);

    const handleMouseEnter = () => {
        if (!parsed) return;
        hoverTimerRef.current = setTimeout(() => {
            setShowVideo(true);
        }, 400);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        setShowVideo(false);
    };

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, []);

    const isDirect = parsed?.platform === 'direct';

    return (
        <div className="w-[260px] md:w-[280px] shrink-0 snap-start font-winkySans">

            {/* ── Video card ── */}
            <div
                className="relative aspect-9/16 rounded-3xl overflow-hidden bg-gray-900 group cursor-pointer shadow-md hover:shadow-2xl hover:shadow-[#61036130] hover:-translate-y-1 transition-all duration-300"
                onClick={onVideoClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Thumbnail */}
                <img
                    src={video.thumbnailUrl}
                    alt={`Video de ${video.username}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Video Player */}
                {showVideo && parsed && (
                    isDirect ? (
                        <video
                            ref={videoRef}
                            src={parsed.embedUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <iframe
                            src={parsed.embedUrl}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ border: 0 }}
                            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                            loading="lazy"
                        />
                    )
                )}

                {/* Gradient overlay más pronunciado abajo */}
                <div className="absolute inset-0 bg-linear-to-t from-[#000000]/80 via-black/10 to-transparent pointer-events-none z-10" />

                {/* Borde sutil en hover */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#9b30a0]/60 transition-all duration-300 z-20 pointer-events-none" />

                {/* Play button central */}
                {parsed && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                            <Play size={26} className="text-white ml-1" fill="white" />
                        </div>
                    </div>
                )}

                {/* Username badge */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white text-xs font-winkySans font-semibold px-2.5 py-1.5 rounded-full border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e6affc] inline-block"></span>
                        {video.username}
                    </span>
                </div>

                {/* Play indicator esquina */}
                <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                    <div className="w-9 h-9 bg-[#610361]/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[#9b30a0] transition-colors duration-300">
                        <Play size={13} className="text-white ml-0.5" fill="white" />
                    </div>
                </div>
            </div>

            {/* ── Producto asociado ── */}
            {video.productTitle && (
                <Link
                    to={`/product/${video.productSlug}`}
                    className="flex items-center gap-3 mt-3.5 px-2 py-2.5 rounded-2xl hover:bg-[#f5eaff] border border-transparent hover:border-[#e8d5e8] transition-all duration-200 group/link"
                    onClick={(e) => e.stopPropagation()}
                >
                    {video.productImage && (
                        <img
                            src={video.productImage}
                            alt={video.productTitle}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e8d5e8] shrink-0 group-hover/link:border-[#9b30a0] transition-colors"
                        />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-[#610361] font-winkySans leading-tight">
                            ${Number(video.productPrice).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-snug font-winkySans mt-0.5">
                            {video.productTitle}
                        </p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#f3e6f3] flex items-center justify-center shrink-0 group-hover/link:bg-[#610361] transition-colors">
                        <ArrowRight size={13} className="text-[#610361] group-hover/link:text-white transition-colors" />
                    </div>
                </Link>
            )}
        </div>
    );
}