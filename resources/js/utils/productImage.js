export const DEFAULT_PRODUCT_PLACEHOLDER = '/images/defaults/product-placeholder.png';

/**
 * Resolves a full, safe URL for a product image path or product object.
 *
 * @param {Object|Array|string|null} productOrPath - Product object, images array, or image path string
 * @param {string} fallback - Fallback URL if image is missing or invalid
 * @returns {string} Fully resolved image URL
 */
export function getProductImageUrl(productOrPath, fallback = DEFAULT_PRODUCT_PLACEHOLDER) {
    if (!productOrPath) {
        return fallback;
    }

    let path = null;

    if (typeof productOrPath === 'string') {
        path = productOrPath;
    } else if (Array.isArray(productOrPath)) {
        const primary = productOrPath.find(img => img?.is_primary);
        path = primary?.image_path || primary?.url || productOrPath[0]?.image_path || productOrPath[0]?.url || null;
    } else if (typeof productOrPath === 'object') {
        if (Array.isArray(productOrPath.images) && productOrPath.images.length > 0) {
            const primary = productOrPath.images.find(img => img?.is_primary);
            path = primary?.image_path || primary?.url || productOrPath.images[0]?.image_path || productOrPath.images[0]?.url || null;
        }

        if (!path) {
            path = productOrPath.image_path || productOrPath.image_url || productOrPath.image || null;
        }
    }

    if (!path || typeof path !== 'string' || path.trim() === '') {
        return fallback;
    }

    path = path.trim();

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }

    if (path.startsWith('/images/')) {
        return path;
    }

    if (path.startsWith('images/')) {
        return `/${path}`;
    }

    if (path.startsWith('/storage/')) {
        return path;
    }

    if (path.startsWith('storage/')) {
        return `/${path}`;
    }

    if (path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}

/**
 * Image onError handler to replace broken images with the fallback placeholder.
 */
export function handleImageError(e, fallback = DEFAULT_PRODUCT_PLACEHOLDER) {
    if (e && e.target && e.target.src !== window.location.origin + fallback && e.target.src !== fallback) {
        e.target.onerror = null;
        e.target.src = fallback;
    }
}
