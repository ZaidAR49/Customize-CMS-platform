'use server'

import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
interface fetchImageParams {
    next_cursor?: string;
    max_results?: number;
}

export async function signin() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const allowed_formats = 'jpg,png,jpeg';
    const params_to_sign = {
        timestamp: timestamp,
        folder: process.env.CLOUDINARY_FILE,
        allowed_formats: allowed_formats,
    };
    const signature = cloudinary.utils.api_sign_request(
        params_to_sign,
        process.env.CLOUDINARY_API_SECRET || ""
    );

    return { signature, timestamp, cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, folderName: process.env.CLOUDINARY_FILE, allowed_formats: allowed_formats };
}

export async function fetchCloudinaryImages({ next_cursor, max_results = 10 }: fetchImageParams) {
    try {
        const response = await cloudinary.search.expression(`folder:"${process.env.CLOUDINARY_FILE}"`).sort_by("created_at", "desc").max_results(max_results).next_cursor(next_cursor || undefined).execute();
        return { success: true, data: response };
    } catch (err: any) {
        console.error(err);
        return { success: false, data: [], nextCursor: null, error: err.message || "faild to fetch images" };
    }
}

/** Server-side upload (e.g. avatars from data URLs). */
export async function uploadImage(file: string, subfolder?: string): Promise<string> {
    const baseFolder = process.env.CLOUDINARY_FILE || 'CMS';
    const folder = subfolder ? `${baseFolder}/${subfolder}` : baseFolder;
    const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    return result.secure_url;
}

export async function DeleteImages(imageIds: string[]) {
    if (!imageIds.length) {
        return { success: true, deleted: [] as string[], failed: [] as string[] };
    }
    try {
        const response = await cloudinary.api.delete_resources(imageIds);
        const deleted = Object.entries(response.deleted ?? {})
            .filter(([, status]) => status === 'deleted')
            .map(([id]) => id);
        const failed = imageIds.filter((id) => !deleted.includes(id));
        return { success: true, deleted, failed };
    } catch (err) {
        console.error(err);
        return { success: false, deleted: [] as string[], failed: imageIds };
    }
}
