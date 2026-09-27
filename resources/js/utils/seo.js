const APP_NAME = 'PenePene';
const DEFAULT_LOCALE = 'fr';

function getOrigin() {
    if (typeof window !== 'undefined' && window.location) {
        return window.location.origin;
    }
    return typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL
        ? import.meta.env.VITE_APP_URL.replace(/\/$/, '')
        : '';
}

export function absoluteUrl(path = '/') {
    if (!path) return getOrigin() || '/';
    if (/^https?:\/\//.test(path)) return path;
    const origin = getOrigin();
    if (!origin) return path;
    return origin + (path.startsWith('/') ? path : '/' + path);
}

export function truncateDescription(text, limit = 155) {
    if (!text) return '';
    const trimmed = String(text).replace(/\s+/g, ' ').trim();
    if (trimmed.length <= limit) return trimmed;
    const cut = trimmed.slice(0, limit);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 0) {
        return cut.slice(0, lastSpace) + '…';
    }
    return cut + '…';
}

export function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function toAbsoluteImageUrl(relativeOrAbsolute) {
    if (!relativeOrAbsolute) return '';
    if (/^https?:\/\//.test(relativeOrAbsolute)) return relativeOrAbsolute;
    return absoluteUrl(relativeOrAbsolute);
}

export { APP_NAME, DEFAULT_LOCALE };
