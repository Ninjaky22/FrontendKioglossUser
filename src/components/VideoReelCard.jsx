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
        <div className="w-[280px] md:w-[300px] flex-shrink-0 snap-start">
            <div
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer shadow-lg hover:shadow-2xl transition-shadow"
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

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none z-10" />

                {/* Play icon */}
                {parsed && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play size={24} className="text-white ml-1" fill="white" />
                        </div>
                    </div>
                )}

                {/* Username */}
                <div className="absolute bottom-4 left-4 right-16 z-20 pointer-events-none">
                    <span className="text-white text-sm font-medium drop-shadow-lg">{video.username}</span>
                </div>

                {/* Play indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20 pointer-events-none">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play size={14} className="text-white ml-0.5" fill="white" />
                    </div>
                </div>
            </div>

            {/* Product Info */}
            {video.productTitle && (
                <Link
                    to={`/product/${video.productSlug}`}
                    className="flex items-start gap-3 mt-4 px-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    {video.productImage && (
                        <img
                            src={video.productImage}
                            alt={video.productTitle}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="text-lg font-extrabold text-gray-900">${video.productPrice}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-tight">{video.productTitle}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                </Link>
            )}
        </div>
    );
}
