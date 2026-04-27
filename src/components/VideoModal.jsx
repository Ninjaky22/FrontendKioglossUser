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

    // Altura extra para empujar la barra blanca de Instagram fuera del recorte.
    // La barra de likes/comentarios mide ~160px en embeds de Instagram.
    const INSTAGRAM_BAR_HEIGHT = 160;
    const isInstagram = parsed?.platform === 'instagram';

    return createPortal(
        <div
            className="fixed inset-0 bg-black/25 backdrop-blur-md z-9999 flex items-center justify-center p-2 sm:p-4 font-winkySans"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[420px] max-h-[90vh] sm:max-h-[85vh] animate-[scaleIn_0.2s_ease-out] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Contenedor del video ── */}
                <div className="relative w-full aspect-9/16 rounded-2xl md:rounded-3xl overflow-hidden bg-black  shadow-2xl shrink-0">

                    {/* Botón cerrar — dentro del frame, esquina superior derecha */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#610361] hover:scale-105 active:scale-95 transition-all z-20 border border-white/20"
                    >
                        <X size={20} className="sm:hidden" />
                        <X size={22} className="hidden sm:block" />
                    </button>                    

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
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={isInstagram ? { paddingBottom: 0 } : {}}
                            >
                                <iframe
                                    src={getModalEmbedUrl()}
                                    style={{
                                        border: 0,
                                        width: '100%',
                                        height: isInstagram
                                            ? `calc(100% + ${INSTAGRAM_BAR_HEIGHT}px)`
                                            : '80%',
                                        display: 'block',
                                    }}
                                    allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                    allowFullScreen
                                />
                            </div>
                        )
                    ) : (
                        <img src={video.thumbnailUrl} alt="Video" className="w-full h-full object-cover" />
                    )}
                </div>

                {/* Hint */}
                <p className="hidden sm:block text-center text-white/30 text-xs mt-3 font-winkySans">
                    Presiona <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> o toca fuera para cerrar
                </p>
            </div>
        </div>,
        document.body
    );
}