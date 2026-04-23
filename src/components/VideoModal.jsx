import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoParser';

export default function VideoModal({ video, onClose }) {
    const parsed = parseVideoUrl(video.videoUrl);
    const videoRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const getModalEmbedUrl = () => {
        if (!parsed) return '';
        let url = parsed.embedUrl;
        url = url.replace(/[?&]mute=1/g, '').replace(/[?&]muted=1/g, '');
        url = url.replace(/\?&/, '?').replace(/&&/, '&');
        if (!url.includes('mute=0') && parsed.platform === 'youtube') {
            url += (url.includes('?') ? '&' : '?') + 'mute=0';
        }
        url = url.replace(/[?&]controls=0/g, '');
        return url;
    };

    const isDirect = parsed?.platform === 'direct';

    return createPortal(
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg animate-[scaleIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    {/* Username */}
                    <div className="absolute top-3 left-4 z-20">
                        <span className="text-white font-medium text-sm drop-shadow-lg">{video.username}</span>
                    </div>

                    {parsed ? (
                        isDirect ? (
                            <video
                                ref={videoRef}
                                src={parsed.embedUrl}
                                autoPlay
                                controls
                                loop
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <iframe
                                src={getModalEmbedUrl()}
                                className="w-full h-full"
                                style={{ border: 0 }}
                                allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                            />
                        )
                    ) : (
                        <img src={video.thumbnailUrl} alt="Video" className="w-full h-full object-cover" />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
