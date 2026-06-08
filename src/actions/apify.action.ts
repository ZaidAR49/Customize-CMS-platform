'use server';
import { ApifyClient } from 'apify-client';
import { uploadImagesToCloudinary } from '@/actions/cloudinary.actions';
import { requireEditor } from '@/lib/auth';
const apify = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function importFacebookPost(postUrl: string) {
    try {
        await requireEditor();
        const run = await apify.actor('apify/facebook-posts-scraper').call({
            startUrls: [{ url: postUrl }],
            maxPosts: 1
        });

        const { items } = await apify.dataset(run.defaultDatasetId).listItems();
        if (!items.length) return { success: false, error: 'No posts found' };

        const post = items[0] as Record<string, any>;
        // dectect post language
        let isArabic = false;
        if (post.text) {
            isArabic = isArabicPost(post.text as string);
        }

        // Robustly collect images from multiple possible Apify output formats
        const allImages: string[] = [];

        // Format 1: post.media array with Photo __typename
        if (Array.isArray(post.media)) {
            for (const m of post.media) {
                const url =
                    (m.__typename === 'Photo' && m.image?.uri) ? m.image.uri :
                    m.url ?? m.link ?? m.imageUrl ?? null;
                if (url && typeof url === 'string') allImages.push(url);
            }
        }

        // Format 2: top-level post.image (string URL)
        if (post.image && typeof post.image === 'string') {
            allImages.push(post.image);
        }

        // Format 3: post.images array (each item may be a string or object { link, url })
        if (Array.isArray(post.images)) {
            for (const img of post.images) {
                const url = typeof img === 'string' ? img : (img?.link ?? img?.url ?? null);
                if (url && typeof url === 'string') allImages.push(url);
            }
        }

        // Format 4: post.attachments array
        if (Array.isArray(post.attachments)) {
            for (const att of post.attachments) {
                const url = att?.image?.uri ?? att?.url ?? att?.link ?? null;
                if (url && typeof url === 'string') allImages.push(url);
            }
        }

        // Deduplicate
        const uniqueImages = [...new Set(allImages)];

        // Upload all Facebook images to Cloudinary for permanent storage
        // (Facebook CDN links expire; Cloudinary URLs are permanent)
        const cloudinaryImages = uniqueImages.length > 0
            ? await uploadImagesToCloudinary(uniqueImages)
            : [];

        const coverImage = cloudinaryImages[0] || '';

        const savedPost = {
            descripcion: isArabic ? post.text : "",
            descripcion_en: !isArabic ? post.text : "",
            cover_image: coverImage,
            images: cloudinaryImages,
            type: "news",
            isArabic: isArabic,
            published: true,
        }
        return { success: true, post: savedPost };

    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, error: 'Failed to process post' };
    }
}

function isArabicPost(text: string): boolean {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    // ❌ Don't strip with \W — it removes Arabic chars
    // ✅ Just count Arabic vs total non-whitespace chars
    const totalChars = text.replace(/\s/g, '').length;
    if (!totalChars) return false;
    const arabicMatches = text.match(arabicRegex) || [];
    return (arabicMatches.length / totalChars) > 0.2;
}