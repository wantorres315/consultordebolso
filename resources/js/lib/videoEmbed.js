export function getVideoEmbedUrl(url) {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (parsed.pathname === '/watch') {
                return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`;
            }
            if (parsed.pathname.startsWith('/embed/')) {
                return url;
            }
            if (parsed.pathname.startsWith('/shorts/')) {
                return `https://www.youtube.com/embed/${parsed.pathname.split('/')[2]}`;
            }
        }

        if (host === 'vimeo.com') {
            const id = parsed.pathname.split('/').filter(Boolean)[0];
            return id ? `https://player.vimeo.com/video/${id}` : url;
        }

        if (host === 'player.vimeo.com') {
            return url;
        }

        return url;
    } catch {
        return null;
    }
}
