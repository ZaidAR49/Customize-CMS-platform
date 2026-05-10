import Link from 'next/link'
import { Shield, Phone, Mail, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { organization } from '@/data/organization'

import { FaFacebook, FaXTwitter, FaYoutube, FaInstagram } from 'react-icons/fa6'

const quickLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'عن الجمعية', href: '/about' },
  { label: 'الأخبار والنشاطات', href: '/news' },
  { label: 'اتصل بنا', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="mt-16 bg-[var(--fcps-dark)] text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fcps-primary)] text-white">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">{organization.nameAr}</h3>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              تأسست عام {organization.foundedYear}
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              {organization.missionAr}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-[var(--fcps-primary-light)]">
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-[var(--fcps-primary-light)] hover:pr-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-[var(--fcps-primary-light)]">
              تواصل معنا
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <a href={`tel:${organization.phone}`} className="flex items-center gap-2 hover:text-[var(--fcps-primary-light)] transition-colors">
                <Phone className="h-4 w-4 text-[var(--fcps-primary-light)]" />
                <span dir="ltr">{organization.phone}</span>
              </a>
              <a href={`mailto:${organization.email}`} className="flex items-center gap-2 hover:text-[var(--fcps-primary-light)] transition-colors">
                <Mail className="h-4 w-4 text-[var(--fcps-primary-light)]" />
                {organization.email}
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--fcps-primary-light)]" />
                {organization.addressAr}
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-4 flex gap-3">
              <a
                href={organization.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-[var(--fcps-primary)] hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebook className="h-4 w-4" />
              </a>
              <a
                href={organization.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-[var(--fcps-primary)] hover:scale-110"
                aria-label="Twitter"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a
                href={organization.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-[var(--fcps-primary)] hover:scale-110"
                aria-label="YouTube"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
              {organization.instagram && (
                <a
                  href={organization.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-[var(--fcps-primary)] hover:scale-110"
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
          <p>© {new Date().getFullYear()} {organization.nameAr}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
