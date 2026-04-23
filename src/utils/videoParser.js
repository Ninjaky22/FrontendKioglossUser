/**
 * Detects the video platform and returns an embeddable URL with autoplay.
 */

export function parseVideoUrl(url) {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();

    // YouTube
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return {
            platform: 'youtube',
            videoId: ytMatch[1],
            embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytMatch[1]}&modestbranding=1&rel=0&showinfo=0`
        };
    }

    // TikTok
    const ttMatch = trimmed.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (ttMatch) {
        return {
            platform: 'tiktok',
            videoId: ttMatch[1],
            embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}?autoplay=1`
        };
    }

    // Facebook
    const fbMatch = trimmed.match(/facebook\.com\/(?:watch\/?\?v=|.*\/videos\/|reel\/)(\d+)/);
    if (fbMatch) {
        return {
            platform: 'facebook',
            videoId: fbMatch[1],
            embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&autoplay=true&mute=true&show_text=false`
        };
    }

    // Instagram
    const igMatch = trimmed.match(/instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/);
    if (igMatch) {
        return {
            platform: 'instagram',
            videoId: igMatch[1],
            embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed/?autoplay=1`
        };
    }

    // Direct video file
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed) || trimmed.includes('/uploads/')) {
        return {
            platform: 'direct',
            videoId: '',
            embedUrl: trimmed
        };
    }

    // Already an embed URL
    if (trimmed.includes('embed') || trimmed.includes('plugins/video')) {
        return {
            platform: 'unknown',
            videoId: '',
            embedUrl: trimmed.includes('autoplay') ? trimmed : `${trimmed}${trimmed.includes('?') ? '&' : '?'}autoplay=1&mute=1`
        };
    }

    return null;
}
