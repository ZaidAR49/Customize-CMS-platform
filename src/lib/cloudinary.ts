import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_Secret || '',
})

const FOLDER = process.env.CLOUDINARY_FILE || 'CMS'

export async function uploadImage(file: string, subfolder?: string): Promise<string> {
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
