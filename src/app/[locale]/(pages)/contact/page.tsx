import { organizationService } from '@/lib/services/organization.service'
import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import ContactClient from './ContactClient'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'contactPage' })
  return { 
    title: t('metaTitle'),
    description: t('hero.subtitle')
  }
}

export default async function ContactPage() {
  const org = await organizationService.getOrganization()

  return <ContactClient org={org} />
}
