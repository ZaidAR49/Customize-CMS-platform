'use server';
import { ApifyClient } from 'apify-client';
const apify = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function importFacebookPost(postUrl: string) {
    try {
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
        // parpar date
        const savedPost = {
            descripcion: isArabic ? post.text : "",
            descripcion_en: !isArabic ? post.text : "",
            cover_image: post.images?.[0]?.link || "",
            type: "news",
            published: true,
        }
        return { success: true, post: savedPost };

    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, error: 'Failed to process post' };
    }
}


export function isArabicPost(text: string): boolean {
    if (!text) return false;
    const cleanText = text.replace(/[0-9_\s\W]/g, '');
    if (!cleanText) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const arabicMatches = cleanText.match(new RegExp(arabicRegex, 'g')) || [];
    return (arabicMatches.length / cleanText.length) > 0.2;
}