'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { submitContactFormAction } from '@/actions/malis.actions'
import type { OrganizationRow } from '@/types/organization'
import { useTranslations, useLocale } from 'next-intl'
import posthog from 'posthog-js'

interface ContactClientProps {
  org: OrganizationRow | null;
}

export default function ContactClient({ org }: ContactClientProps) {
  const t = useTranslations('contactPage')
  const locale = useLocale()

  const contactSchema = z.object({
    name: z.string().min(2, t('validation.nameRequired')),
    email: z.string().email(t('validation.emailInvalid')),
    subject: z.string().min(3, t('validation.subjectRequired')),
    message: z.string().min(10, t('validation.messageMinLength')),
  })

  type ContactForm = z.infer<typeof contactSchema>

  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setSubmitError(null)
    const result = await submitContactFormAction(data)
    if (!result.success) {
      setSubmitError(result.error ?? t('form.error'))
      return
    }
    posthog.capture('contact_form_submitted', {
      subject: data.subject,
    })
    setSubmitted(true)
    reset()
    setTimeout(() => setSubmitted(false), 4000)
  }

  const defaultAddress = locale === 'ar' ? 'إربد، المملكة الأردنية الهاشمية' : 'Irbid, Hashemite Kingdom of Jordan'
  const address = locale === 'ar' 
    ? ((org?.metadata as Record<string, string>)?.address_ar || defaultAddress)
    : ((org?.metadata as Record<string, string>)?.address_en || defaultAddress)

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-l from-[#1b5e20] via-[#2e7d32] to-[#00695c] py-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-white/80">{t('hero.subtitle')}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-(--fcps-primary-dark) mb-6">{t('info.title')}</h2>
              <p className="mb-8 text-(--fcps-gray-text) leading-relaxed">
                {t('info.description')}
              </p>

              <div className="space-y-4">
                <Card className="border-none shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--fcps-primary) text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-(--fcps-gray-text)">{t('info.phone')}</p>
                      <p className="font-medium" dir="ltr">{org?.phone}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--fcps-primary-light) text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-(--fcps-gray-text)">{t('info.email')}</p>
                      <p className="font-medium">{org?.email}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--fcps-accent) text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-(--fcps-gray-text)">{t('info.address')}</p>
                      <p className="font-medium">{address}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-(--fcps-primary-dark) mb-6">{t('form.title')}</h2>

                  {submitError ? (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                      {submitError}
                    </div>
                  ) : null}

                  {submitted ? (
                    <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-700">
                      <CheckCircle className="h-5 w-5" />
                      <p className="text-sm font-medium">{t('form.success')}</p>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="mb-2 block text-sm font-medium">{t('form.nameLabel')}</Label>
                      <Input
                        id="name"
                        placeholder={t('form.namePlaceholder')}
                        {...register('name')}
                        className="bg-(--fcps-bg-soft) border-none"
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email" className="mb-2 block text-sm font-medium">{t('form.emailLabel')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('form.emailPlaceholder')}
                        dir="ltr"
                        {...register('email')}
                        className="bg-(--fcps-bg-soft) border-none text-left"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="subject" className="mb-2 block text-sm font-medium">{t('form.subjectLabel')}</Label>
                      <Input
                        id="subject"
                        placeholder={t('form.subjectPlaceholder')}
                        {...register('subject')}
                        className="bg-(--fcps-bg-soft) border-none"
                      />
                      {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="message" className="mb-2 block text-sm font-medium">{t('form.messageLabel')}</Label>
                      <Textarea
                        id="message"
                        placeholder={t('form.messagePlaceholder')}
                        rows={5}
                        {...register('message')}
                        className="bg-(--fcps-bg-soft) border-none resize-none"
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2 justify-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            {t('form.sending')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            <Send className="h-4 w-4" />
                            {t('form.sendMessage')}
                          </span>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowConfirmClear(true)}
                        disabled={isSubmitting}
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        {t('form.clear')}
                      </Button>
                    </div>
                  </form>

                  <ConfirmDialog
                    open={showConfirmClear}
                    onOpenChange={setShowConfirmClear}
                    title={t('confirmDialog.title')}
                    description={t('confirmDialog.description')}
                    confirmText={t('confirmDialog.confirm')}
                    onConfirm={reset}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
