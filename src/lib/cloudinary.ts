import { v2 as cloudinary } from 'cloudinary'

/** Loads `cloud_name` / `api_key` / `api_secret` from `process.env.CLOUDINARY_URL`. */
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

const FOLDER = process.env.CLOUDINARY_FILE || 'CMS'

export async function uploadImage(file: string, subfolder?: string): Promise<string> {
  const envUrl = process.env.CLOUDINARY_URL?.trim()
  if (!envUrl?.toLowerCase().startsWith('cloudinary://')) {
    throw new Error(
      'Missing or invalid CLOUDINARY_URL. Use cloudinary://API_KEY:API_SECRET@CLOUD_NAME from your Cloudinary dashboard.'
    )
  }

  const folder = subfolder ? `${FOLDER}/${subfolder}` : FOLDER
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ]
  })
  return result.secure_url
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export { cloudinary }
