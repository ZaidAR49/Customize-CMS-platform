import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { organizationService } from '@/lib/services/organization.service'

import { FaFacebook, FaXTwitter, FaYoutube, FaInstagram } from 'react-icons/fa6'

const quickLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'عن الجمعية', href: '/about' },
  { label: 'الأخبار والنشاطات', href: '/news' },
  { label: 'اتصل بنا', href: '/contact' },
]

export async function Footer() {
  const org = await organizationService.getOrganization()

  // Safely extract social URLs from JSONB
  const social = (org?.social ?? {}) as Record<string, string>

  return (
    <footer className="mt-16 bg-(--fcps-dark) text-white py-12">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white overflow-hidden border border-(--fcps-bg-soft) shadow-sm">
                <img src="/images/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              </div>
              <h3 className="text-lg font-bold">{org?.name_ar}</h3>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              تأسست عام {org?.founded_year}
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              {org?.mission_ar}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-(--fcps-primary-light)">
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-(--fcps-primary-light) hover:pr-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-(--fcps-primary-light)">
              تواصل معنا
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <a href={`tel:${org?.phone}`} className="flex items-center gap-2 hover:text-(--fcps-primary-light) transition-colors">
                <Phone className="h-4 w-4 text-(--fcps-primary-light)" />
                <span dir="ltr">{org?.phone}</span>
              </a>
              <a href={`mailto:${org?.email}`} className="flex items-center gap-2 hover:text-(--fcps-primary-light) transition-colors">
                <Mail className="h-4 w-4 text-(--fcps-primary-light)" />
                {org?.email}
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-(--fcps-primary-light)" />
                {(org?.metadata as Record<string, string>)?.address_ar || 'إربد، المملكة الأردنية الهاشمية'}
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-4 flex gap-3">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-(--fcps-primary) hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-4 w-4" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-(--fcps-primary) hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaXTwitter className="h-4 w-4" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-(--fcps-primary) hover:scale-110"
                  aria-label="YouTube"
                >
                  <FaYoutube className="h-4 w-4" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-(--fcps-primary) hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {org?.name_ar}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
