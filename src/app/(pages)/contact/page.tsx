'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { organization } from '@/data/organization'
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { submitContactFormAction } from '@/actions/malis.actions'

const contactSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  subject: z.string().min(3, 'الموضوع مطلوب'),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
})

type ContactForm = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
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
      setSubmitError(result.error ?? 'تعذّر إرسال الرسالة. يُرجى المحاولة لاحقاً.')
      return
    }
    setSubmitted(true)
    reset()
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-l from-[#1b5e20] via-[#2e7d32] to-[#00695c] py-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">اتصل بنا</h1>
          <p className="text-lg text-white/80">نسعد بتواصلكم معنا</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-(--fcps-primary-dark) mb-6">معلومات التواصل</h2>
              <p className="mb-8 text-(--fcps-gray-text) leading-relaxed">
                يمكنكم التواصل معنا عبر أي من الوسائل التالية أو من خلال تعبئة نموذج التواصل.
              </p>

              <div className="space-y-4">
                <Card className="border-none shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--fcps-primary) text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-(--fcps-gray-text)">الهاتف</p>
                      <p className="font-medium" dir="ltr">{organization.phone}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--fcps-primary-light) text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-(--fcps-gray-text)">البريد الإلكتروني</p>
                      <p className="font-medium">{organization.email}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--fcps-accent) text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-(--fcps-gray-text)">العنوان</p>
                      <p className="font-medium">{organization.addressAr}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-(--fcps-primary-dark) mb-6">أرسل رسالة</h2>

                  {submitError ? (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                      {submitError}
                    </div>
                  ) : null}

                  {submitted ? (
                    <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-700">
                      <CheckCircle className="h-5 w-5" />
                      <p className="text-sm font-medium">تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.</p>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="mb-2 block text-sm font-medium">الاسم</Label>
                      <Input
                        id="name"
                        placeholder="أدخل اسمك الكامل"
                        {...register('name')}
                        className="bg-(--fcps-bg-soft) border-none"
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email" className="mb-2 block text-sm font-medium">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        dir="ltr"
                        {...register('email')}
                        className="bg-(--fcps-bg-soft) border-none text-left"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="subject" className="mb-2 block text-sm font-medium">الموضوع</Label>
                      <Input
                        id="subject"
                        placeholder="موضوع الرسالة"
                        {...register('subject')}
                        className="bg-(--fcps-bg-soft) border-none"
                      />
                      {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="message" className="mb-2 block text-sm font-medium">الرسالة</Label>
                      <Textarea
                        id="message"
                        placeholder="اكتب رسالتك هنا..."
                        rows={5}
                        {...register('message')}
                        className="bg-(--fcps-bg-soft) border-none resize-none"
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          إرسال الرسالة
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
