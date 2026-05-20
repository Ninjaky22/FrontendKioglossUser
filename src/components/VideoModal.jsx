import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoParser';

export default function VideoModal({ video, onClose }) {
    const parsed = parseVideoUrl(video.videoUrl);
    const videoRef = useRef(null);

    const platform    = parsed?.platform ?? 'unknown';
    const isDirect    = platform === 'direct';
    const isInstagram = platform === 'instagram';
    const isYoutube   = platform === 'youtube';
    const isTikTok    = platform === 'tiktok';
    const isFacebook  = platform === 'facebook';

    // YouTube Shorts son verticales, videos normales son 16:9
    const isYtShort = isYoutube && !!video.videoUrl?.includes('/shorts/');
    // Facebook Reels son verticales, videos/watch son 16:9
    const isFbReel  = isFacebook && !!video.videoUrl?.includes('/reel/');

    // Aspecto horizontal 16:9
    const isLandscape = (isYoutube && !isYtShort) || (isFacebook && !isFbReel);
    // Aspecto vertical 9:16
    const isPortrait  = isTikTok || isDirect || isYtShort || isFbReel;

    // Label para el botón "Ver en…"
    const platformLabel = isYoutube ? 'YouTube' : isTikTok ? 'TikTok' : isFacebook ? 'Facebook' : null;

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
        if (isInstagram) return parsed.embedUrl;

        let url = parsed.embedUrl;
        // Quitar silencio y controles ocultos para el modal
        url = url.replace(/[?&]muted?=1/g, '');
        url = url.replace(/[?&]mute=true/g, '');
        url = url.replace(/[?&]controls=0/g, '');
        url = url.replace(/\?&/, '?').replace(/&&+/, '&').replace(/[?&]$/, '');
        // YouTube: activar audio explícitamente
        if (isYoutube && !url.includes('mute=')) {
            url += (url.includes('?') ? '&' : '?') + 'mute=0';
        }
        return url;
    };

    /* ── Botón cerrar ── */
    const CloseBtn = () => (
        <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#610361] hover:scale-105 active:scale-95 transition-all z-20 border border-white/20"
        >
            <X size={20} />
        </button>
    );

    /* ── Botón abrir plataforma (YouTube / TikTok / Facebook) ── */
    const PlatformBtn = () => platformLabel ? (
        <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold font-winkySans px-3 py-1.5 rounded-full border border-white/20 hover:bg-black/75 hover:scale-105 active:scale-95 transition-all z-20"
        >
            <ExternalLink size={13} />
            Ver en {platformLabel}
        </a>
    ) : null;

    /*
     * PADDING-HACK: técnica confiable para que iframes respeten la relación de aspecto.
     * paddingTop en % se calcula sobre el ANCHO del elemento, creando la altura deseada.
     * El iframe se posiciona absolute inset-0 para llenar el espacio generado.
     *   16:9  → paddingTop: 56.25%  (9/16 = 0.5625)
     *   9:16  → paddingTop: 177.78% (16/9 = 1.7778)
     */
    const iframeStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0,
        display: 'block',
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur z-9999 flex items-center justify-center p-3 sm:p-5 font-winkySans"
            onClick={onClose}
        >
            <div
                className={[
                    'relative w-full animate-[scaleIn_0.2s_ease-out] flex flex-col',
                    isInstagram
                        ? 'max-w-[420px] sm:max-w-[480px]'
                        : isLandscape
                        ? 'max-w-[560px] sm:max-w-[800px] md:max-w-[960px]'
                        : 'max-w-[320px] sm:max-w-[360px]',
                ].join(' ')}
                onClick={(e) => e.stopPropagation()}
            >

                {isInstagram ? (
                    /* ── Instagram: post cuadrado con interfaz completa ── */
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
                    /* ── mp4 directo: controles nativos, sin botón de plataforma ── */
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black"
                         style={{ paddingTop: '177.78%' }}>
                        <CloseBtn />
                        <video
                            ref={videoRef}
                            src={parsed.embedUrl}
                            autoPlay
                            controls
                            loop
                            playsInline
                            style={{ ...iframeStyle, objectFit: 'contain' }}
                        />
                    </div>

                ) : isLandscape ? (
                    /* ── YouTube / Facebook regular: 16:9 horizontal ── */
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black"
                         style={{ paddingTop: '56.25%' }}>
                        <CloseBtn />
                        <PlatformBtn />
                        <iframe
                            src={getEmbedUrl()}
                            style={iframeStyle}
                            allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            title={video.title ?? 'Video'}
                        />
                    </div>

                ) : isPortrait ? (
                    /* ── TikTok / YouTube Short / Facebook Reel: 9:16 vertical ── */
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black"
                         style={{ paddingTop: '177.78%' }}>
                        <CloseBtn />
                        <PlatformBtn />
                        <iframe
                            src={getEmbedUrl()}
                            style={iframeStyle}
                            allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            title={video.title ?? 'Video'}
                        />
                    </div>

                ) : (
                    /* ── Fallback: miniatura ── */
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black"
                         style={{ paddingTop: '177.78%' }}>
                        <CloseBtn />
                        <img
                            src={video.thumbnailUrl}
                            alt="Video"
                            style={{ ...iframeStyle, objectFit: 'cover' }}
                        />
                    </div>
                )}

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
