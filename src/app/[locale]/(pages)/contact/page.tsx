import { organizationService } from '@/lib/services/organization.service'
import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'اتصل بنا',
  description: 'نسعد بتواصلكم معنا',
}

export default async function ContactPage() {
  const org = await organizationService.getOrganization()

  return <ContactClient org={org} />
}
