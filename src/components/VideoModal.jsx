import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoParser';

export default function VideoModal({ video, onClose }) {
    const parsed = parseVideoUrl(video.videoUrl);
    const videoRef = useRef(null);

    const platform    = parsed?.platform ?? 'unknown';
    const isDirect    = platform === 'direct';
    const isInstagram = platform === 'instagram';
    const isFacebook  = platform === 'facebook';
    // Posts de Instagram/Facebook tienen imagen cuadrada + UI; no son 9:16
    const isPostEmbed = isInstagram || isFacebook;

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const getEmbedUrl = () => {
        if (!parsed) return '';
        if (isPostEmbed) return parsed.embedUrl;
        let url = parsed.embedUrl;
        url = url.replace(/[?&]muted?=1/g, '').replace(/[?&]controls=0/g, '');
        url = url.replace(/\?&/, '?').replace(/&&+/, '&').replace(/[?&]$/, '');
        if (platform === 'youtube' && !url.includes('mute=')) {
            url += (url.includes('?') ? '&' : '?') + 'mute=0';
        }
        return url;
    };

    // Botón cerrar reutilizable (siempre dentro del contenedor para evitar overflow)
    const CloseBtn = () => (
        <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#610361] hover:scale-105 active:scale-95 transition-all z-20 border border-white/20"
        >
            <X size={20} />
        </button>
    );

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur z-9999 flex items-center justify-center p-3 sm:p-5 font-winkySans"
            onClick={onClose}
        >
            <div
                className={[
                    'relative w-full animate-[scaleIn_0.2s_ease-out] flex flex-col',
                    isPostEmbed
                        ? 'max-w-[420px] sm:max-w-[480px]'
                        : 'max-w-[280px] sm:max-w-[340px] md:max-w-[400px]',
                ].join(' ')}
                onClick={(e) => e.stopPropagation()}
            >
                {isPostEmbed ? (
                    // ── Instagram / Facebook ──────────────────────────────────
                    // No usar aspect-ratio: el post es imagen cuadrada + header + barra de acción.
                    // 700 px = header (≈56) + imagen cuadrada (≈480) + likes/acciones (≈50) + caption.
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-white">
                        <CloseBtn />
                        <iframe
                            src={getEmbedUrl()}
                            style={{ border: 0, width: '100%', height: '700px', display: 'block' }}
                            allow="encrypted-media; autoplay"
                            title={video.title ?? 'Post'}
                        />
                    </div>

                ) : isDirect ? (
                    // ── Archivo de video directo ──────────────────────────────
                    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
                        <CloseBtn />
                        <video
                            ref={videoRef}
                            src={parsed.embedUrl}
                            autoPlay
                            controls
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                        />
                    </div>

                ) : parsed ? (
                    // ── YouTube / TikTok / embed genérico (ratio 9:16) ────────
                    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
                        <CloseBtn />
                        <iframe
                            src={getEmbedUrl()}
                            style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
                            allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            title={video.title ?? 'Video'}
                        />
                    </div>

                ) : (
                    // ── Fallback: miniatura ───────────────────────────────────
                    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
                        <CloseBtn />
                        <img src={video.thumbnailUrl} alt="Video" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Hint de teclado */}
                <p className="hidden sm:block text-center text-white/50 text-xs mt-3 font-winkySans">
                    Presiona{' '}
                    <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd>
                    {' '}o toca fuera para cerrar
                </p>
            </div>
        </div>,
        document.body
    );
}
