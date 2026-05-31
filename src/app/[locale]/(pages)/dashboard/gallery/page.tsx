import { GalleryManager } from '@/components/dashboard/gallery/GalleryManager'
import { fetchCloudinaryImages } from '@/actions/cloudinary.actions'
import type { ImageResource } from '@/lib/cloudinary-client'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function DashboardGalleryPage() {
  let initialImages: ImageResource[] = []
  let initialNextCursor: string | null = null

  try {
    const result = await fetchCloudinaryImages({ max_results: PAGE_SIZE })
    if (result.success && result.data?.resources) {
      initialImages = result.data.resources.map((image: ImageResource) => ({
        public_id: image.public_id,
        secure_url: image.secure_url,
        format: image.format,
        bytes: image.bytes,
        width: image.width,
        height: image.height,
      }))
      initialNextCursor = result.data.next_cursor ?? null
    }
  } catch (e) {
    console.error(e)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">معرض الصور</h2>
        <p className="mt-1 text-sm text-(--fcps-gray-text)">
          إدارة صور Cloudinary: عرض، رفع، وحذف الصور المستخدمة في المحتوى.
        </p>
      </div>
      <GalleryManager
        initialImages={initialImages}
        initialNextCursor={initialNextCursor}
      />
    </div>
  )
}
