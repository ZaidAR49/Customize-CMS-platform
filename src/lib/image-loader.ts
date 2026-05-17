'use client'

export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // Check if it's already a Cloudinary URL
    if (src.includes('res.cloudinary.com')) {
        // Split the URL to inject Cloudinary transformation parameters
        // Changes .../upload/v1779... to .../upload/w_640,q_75,f_auto/v1779...
        const urlParts = src.split('/upload/');

        if (urlParts.length === 2) {
            return `${urlParts[0]}/upload/w_${width},q_${quality || 'auto'},f_auto/${urlParts[1]}`;
        }
    }

    return src;
}