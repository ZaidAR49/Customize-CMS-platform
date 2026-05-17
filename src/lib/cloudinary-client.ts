import {
  signin as cloudinaryUth,
  fetchCloudinaryImages as fetchCloudinaryImagesAction,
  DeleteImages,
} from '@/actions/cloudinary.actions'
import { toast } from 'sonner';

export interface ImageResource {
  public_id: string
  secure_url: string
  format: string
  bytes: number
  width?: number
  height?: number
}

export type CloudinaryFetchResult = {
  images: ImageResource[]
  nextCursor: string | null
}

export type CloudinaryUploadResult = {
  uploaded: ImageResource[]
  failed: { fileName: string; error: string }[]
}

export type CloudinaryDeleteResult = {
  deleted: string[]
  failed: string[]
}

const PAGE_SIZE = 10

export async function fetchCloudinaryImages(
  nextCursor?: string
): Promise<CloudinaryFetchResult> {
  const result = await fetchCloudinaryImagesAction({ next_cursor: nextCursor, max_results: PAGE_SIZE });
  if (!result.success || !result.data || !result.data.resources) {
    toast.error("فشل في تحميل الصور");
    return { images: [], nextCursor: null };
  }
  //map result.data.resources to ImageResource
  const images: ImageResource[] = (result.data.resources || []).map((image: ImageResource) => ({
    public_id: image.public_id,
    secure_url: image.secure_url,
    format: image.format,
    bytes: image.bytes,
    width: image.width,
    height: image.height,
  }));
  return { images: images, nextCursor: result.data.next_cursor };
}

/** Upload staged files to Cloudinary using signed upload sequentially/concurrently. */
export async function uploadImagesToCloudinary(
  files: File[]
): Promise<CloudinaryUploadResult> {
  const result: CloudinaryUploadResult = { uploaded: [], failed: [] };

  if (!files || files.length === 0) return result;

  try {
    const auth = await cloudinaryUth();

    if (!auth || !auth.api_key || !auth.timestamp || !auth.signature || !auth.cloud_name || !auth.folderName || !auth.allowed_formats) {
      toast.error("فشل الحصول على صلاحيات الرفع");
      return result;
    }

    const { signature, timestamp, cloud_name, api_key, folderName, allowed_formats } = auth;
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

    // Map each file to an individual promise request
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();

      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folderName);
      formData.append('allowed_formats', allowed_formats);

      try {
        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Unknown error');
        }

        return { success: true, data: data as ImageResource };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, fileName: file.name, error: message };
      }
    });

    // Execute all uploads concurrently
    const responses = await Promise.all(uploadPromises);

    // Group results into uploaded and failed categories
    responses.forEach((res) => {
      if (res.success && res.data) {
        result.uploaded.push(res.data);
      } else if (!res.success) {
        result.failed.push({ fileName: res.fileName!, error: res.error! });
      }
    });

  } catch (globalError) {
    console.error("Cloudinary upload initial phase failed:", globalError);
    toast.error("حدث خطأ أثناء الاتصال بالخادم");
  }

  return result;
}

export async function deleteImagesFromCloudinary(
  publicIds: string[]
): Promise<CloudinaryDeleteResult> {
  if (!publicIds.length) {
    return { deleted: [], failed: [] };
  }

  try {
    const result = await DeleteImages(publicIds);

    if (!result.success) {
      toast.error('فشل في حذف الصور');
      return { deleted: [], failed: publicIds };
    }

    if (result.failed.length > 0) {
      toast.error(`فشل حذف ${result.failed.length} صورة`);
    }

    return { deleted: result.deleted, failed: result.failed };
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    toast.error('حدث خطأ أثناء الحذف');
    return { deleted: [], failed: publicIds };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت'
  const k = 1024
  const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب']
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  )
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}