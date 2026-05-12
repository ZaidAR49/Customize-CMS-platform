'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateOrganizationAction } from '@/actions/organization.actions'
import type { OrganizationRow } from '@/types/organization'

function empty(v: string | null | undefined) {
  return v ?? ''
}

function buildInitial(org: OrganizationRow) {
  return {
    name_ar: org.name_ar,
    name_en: empty(org.name_en),
    tagline_ar: empty(org.tagline_ar),
    founded_year: org.founded_year != null ? String(org.founded_year) : '',
    logo_url: empty(org.logo_url),
    about_ar: empty(org.about_ar),
    mission_ar: empty(org.mission_ar),
    vision_ar: empty(org.vision_ar),
    phone: empty(org.phone),
    email: empty(org.email),
    address_ar: empty(org.address_ar),
    google_maps_url: empty(org.google_maps_url),
    facebook_url: empty(org.facebook_url),
    twitter_url: empty(org.twitter_url),
    youtube_url: empty(org.youtube_url),
    stat_families: org.stat_families != null ? String(org.stat_families) : '',
    stat_children: org.stat_children != null ? String(org.stat_children) : '',
    stat_women: org.stat_women != null ? String(org.stat_women) : '',
    stat_activities: org.stat_activities != null ? String(org.stat_activities) : '',
  }
}

type FormState = ReturnType<typeof buildInitial>

export function OrganizationSettingsForm({ organization }: { organization: OrganizationRow }) {
  const [form, setForm] = useState<FormState>(() => buildInitial(organization))
  const [pending, startTransition] = useTransition()

  const changed = useMemo(() => {
    const initial = buildInitial(organization)
    return JSON.stringify(form) !== JSON.stringify(initial)
  }, [form, organization])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function parseOptionalInt(raw: string): number | undefined {
    const t = raw.trim()
    if (t === '') return undefined
    const n = Number.parseInt(t, 10)
    return Number.isFinite(n) ? n : undefined
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const payload = {
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim(),
        tagline_ar: form.tagline_ar.trim(),
        founded_year: parseOptionalInt(form.founded_year),
        logo_url: form.logo_url.trim(),
        about_ar: form.about_ar.trim(),
        mission_ar: form.mission_ar.trim(),
        vision_ar: form.vision_ar.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address_ar: form.address_ar.trim(),
        google_maps_url: form.google_maps_url.trim(),
        facebook_url: form.facebook_url.trim(),
        twitter_url: form.twitter_url.trim(),
        youtube_url: form.youtube_url.trim(),
        stat_families: parseOptionalInt(form.stat_families),
        stat_children: parseOptionalInt(form.stat_children),
        stat_women: parseOptionalInt(form.stat_women),
        stat_activities: parseOptionalInt(form.stat_activities),
      }

      const result = await updateOrganizationAction(organization.id, payload)
      if (result.success && result.data) {
        toast.success('تم حفظ معلومات المنظمة')
        setForm(buildInitial(result.data as OrganizationRow))
      } else {
        toast.error(result.error ?? 'تعذر الحفظ')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>الهوية والظهور</CardTitle>
          <CardDescription>الاسم، الشعار، والسنة التأسيسية</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name_ar">الاسم بالعربية</Label>
            <Input
              id="name_ar"
              value={form.name_ar}
              onChange={(e) => update('name_ar', e.target.value)}
              required
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
            <Input
              id="name_en"
              value={form.name_en}
              onChange={(e) => update('name_en', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founded_year">سنة التأسيس</Label>
            <Input
              id="founded_year"
              type="number"
              inputMode="numeric"
              value={form.founded_year}
              onChange={(e) => update('founded_year', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tagline_ar">الشعار</Label>
            <Input
              id="tagline_ar"
              value={form.tagline_ar}
              onChange={(e) => update('tagline_ar', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="logo_url">رابط شعار المنظمة (URL)</Label>
            <Input
              id="logo_url"
              type="url"
              value={form.logo_url}
              onChange={(e) => update('logo_url', e.target.value)}
              placeholder="https://"
              dir="ltr"
              className="text-left"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>المحتوى</CardTitle>
          <CardDescription>نبذة، الرسالة، والرؤية</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="about_ar">عن الجمعية</Label>
            <Textarea
              id="about_ar"
              value={form.about_ar}
              onChange={(e) => update('about_ar', e.target.value)}
              rows={5}
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission_ar">الرسالة</Label>
            <Textarea
              id="mission_ar"
              value={form.mission_ar}
              onChange={(e) => update('mission_ar', e.target.value)}
              rows={4}
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vision_ar">الرؤية</Label>
            <Textarea
              id="vision_ar"
              value={form.vision_ar}
              onChange={(e) => update('vision_ar', e.target.value)}
              rows={3}
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>التواصل والموقع</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">الهاتف</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_ar">العنوان</Label>
            <Textarea
              id="address_ar"
              value={form.address_ar}
              onChange={(e) => update('address_ar', e.target.value)}
              rows={2}
              dir="rtl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="google_maps_url">رابط خرائط Google</Label>
            <Input
              id="google_maps_url"
              type="url"
              value={form.google_maps_url}
              onChange={(e) => update('google_maps_url', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>وسائل التواصل</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook</Label>
            <Input
              id="facebook_url"
              type="url"
              value={form.facebook_url}
              onChange={(e) => update('facebook_url', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter_url">Twitter / X</Label>
            <Input
              id="twitter_url"
              type="url"
              value={form.twitter_url}
              onChange={(e) => update('twitter_url', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="youtube_url">YouTube</Label>
            <Input
              id="youtube_url"
              type="url"
              value={form.youtube_url}
              onChange={(e) => update('youtube_url', e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>الإحصائيات المعروضة</CardTitle>
          <CardDescription>أرقام الواجهة العامة (الأسر، الأطفال، ...)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ['stat_families', 'أسر مستفيدة'],
              ['stat_children', 'أطفال'],
              ['stat_women', 'نساء'],
              ['stat_activities', 'أنشطة'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                inputMode="numeric"
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !changed}
          onClick={() => setForm(buildInitial(organization))}
        >
          إلغاء التعديلات
        </Button>
        <Button type="submit" disabled={pending || !changed} className="min-w-[120px]">
          {pending ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </form>
  )
}
