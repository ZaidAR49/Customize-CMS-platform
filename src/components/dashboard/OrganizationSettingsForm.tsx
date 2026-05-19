'use client'

import { useMemo, useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import { Plus, Trash2 } from 'lucide-react'
import { createOrganizationAction, updateOrganizationAction } from '@/actions/organization.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  updateOrganizationSchema,
  validateMetadataRows,
  zodErrorToFieldErrors,
  METADATA_KEY_REGEX,
} from '@/lib/validations/organization.schema'
import { cn } from '@/lib/utils'
import type { OrganizationRow, SocialPlatformKey } from '@/types/organization'
import { SOCIAL_PLATFORM_KEYS } from '@/types/organization'
import { ReadOnlyField } from '@/components/dashboard/ReadOnlyField'

function empty(v: string | null | undefined) {
  return v ?? ''
}

function valueToMetadataString(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function parseSocialFromRow(raw: unknown): Partial<Record<SocialPlatformKey, string>> {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const out: Partial<Record<SocialPlatformKey, string>> = {}
  for (const key of SOCIAL_PLATFORM_KEYS) {
    const v = o[key]
    if (typeof v === 'string') out[key] = v
  }
  return out
}

type MetadataRow = { clientId: string; key: string; value: string }

function metadataToRows(metadata: unknown): MetadataRow[] {
  if (!metadata || typeof metadata !== 'object') return []
  return Object.entries(metadata as Record<string, unknown>).map(([key, val]) => ({
    clientId: crypto.randomUUID(),
    key,
    value: valueToMetadataString(val),
  }))
}

const SOCIAL_ICONS: Record<SocialPlatformKey, ReactNode> = {
  facebook: <FaFacebook className="size-6" />,
  twitter: <FaXTwitter className="size-6" />,
  instagram: <FaInstagram className="size-6" />,
  youtube: <FaYoutube className="size-6" />,
  linkedin: <FaLinkedin className="size-6" />,
  tiktok: <FaTiktok className="size-6" />,
  whatsapp: <FaWhatsapp className="size-6" />,
}

const SOCIAL_LABELS: Record<SocialPlatformKey, string> = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
}

function emptySocialFlags(): Record<SocialPlatformKey, boolean> {
  return Object.fromEntries(SOCIAL_PLATFORM_KEYS.map((k) => [k, false])) as Record<
    SocialPlatformKey,
    boolean
  >
}

function emptySocialUrls(): Record<SocialPlatformKey, string> {
  return Object.fromEntries(SOCIAL_PLATFORM_KEYS.map((k) => [k, ''])) as Record<
    SocialPlatformKey,
    string
  >
}

function buildInitial(org: OrganizationRow | null) {
  const social = org ? parseSocialFromRow(org.social) : {}
  const socialEnabled = emptySocialFlags()
  const socialUrls = emptySocialUrls()
  for (const key of SOCIAL_PLATFORM_KEYS) {
    const u = social[key]?.trim()
    if (u) {
      socialEnabled[key] = true
      socialUrls[key] = u
    }
  }

  return {
    name_ar: org?.name_ar ?? '',
    name_en: empty(org?.name_en),
    tagline_ar: empty(org?.tagline_ar),
    tagline_en: empty(org?.tagline_en),
    founded_year: org?.founded_year != null ? String(org.founded_year) : '',
    about_ar: empty(org?.about_ar),
    about_en: empty(org?.about_en),
    mission_ar: empty(org?.mission_ar),
    mission_en: empty(org?.mission_en),
    vision_ar: empty(org?.vision_ar),
    vision_en: empty(org?.vision_en),
    phone: empty(org?.phone),
    email: empty(org?.email),
    socialEnabled,
    socialUrls,
    metadataRows: org ? metadataToRows(org.metadata) : [],
  }
}

type FormState = ReturnType<typeof buildInitial>

function serializeForm(form: FormState) {
  return JSON.stringify(form)
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-right text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}



export function OrganizationSettingsForm({
  organization,
}: {
  organization: OrganizationRow | null
}) {
  const router = useRouter()
  const isCreate = organization == null
  const [form, setForm] = useState<FormState>(() => buildInitial(organization))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  const baseline = useMemo(() => serializeForm(buildInitial(organization)), [organization])
  const changed = useMemo(() => serializeForm(form) !== baseline, [form, baseline])

  function removeErrorKeys(keys: string[]) {
    if (keys.length === 0) return
    setErrors((prev) => {
      const next = { ...prev }
      for (const k of keys) delete next[k]
      return next
    })
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    removeErrorKeys([String(key)])
  }

  function parseOptionalInt(raw: string): number | undefined {
    const t = raw.trim()
    if (t === '') return undefined
    if (!/^\d+$/.test(t)) return undefined
    const n = Number.parseInt(t, 10)
    return Number.isFinite(n) ? n : undefined
  }

  function toggleSocial(key: SocialPlatformKey) {
    setForm((prev) => {
      const next = !prev.socialEnabled[key]
      return {
        ...prev,
        socialEnabled: { ...prev.socialEnabled, [key]: next },
        socialUrls: next ? prev.socialUrls : { ...prev.socialUrls, [key]: '' },
      }
    })
    removeErrorKeys([`social.${key}`])
  }

  function addMetadataRow() {
    setForm((prev) => ({
      ...prev,
      metadataRows: [...prev.metadataRows, { clientId: crypto.randomUUID(), key: '', value: '' }],
    }))
  }

  function updateMetadataRow(clientId: string, patch: Partial<Pick<MetadataRow, 'key' | 'value'>>) {
    setForm((prev) => ({
      ...prev,
      metadataRows: prev.metadataRows.map((r) => (r.clientId === clientId ? { ...r, ...patch } : r)),
    }))
    removeErrorKeys([`metadata.${clientId}.key`, `metadata.${clientId}.value`])
  }

  function removeMetadataRow(clientId: string) {
    setForm((prev) => ({
      ...prev,
      metadataRows: prev.metadataRows.filter((r) => r.clientId !== clientId),
    }))
    removeErrorKeys([`metadata.${clientId}.key`, `metadata.${clientId}.value`])
  }

  function setSocialUrl(key: SocialPlatformKey, value: string) {
    setForm((prev) => ({
      ...prev,
      socialUrls: { ...prev.socialUrls, [key]: value },
    }))
    removeErrorKeys([`social.${key}`])
  }

  function scrollFirstInvalidIntoView() {
    requestAnimationFrame(() => {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const social: Partial<Record<SocialPlatformKey, string>> = {}
    for (const key of SOCIAL_PLATFORM_KEYS) {
      if (!form.socialEnabled[key]) continue
      social[key] = form.socialUrls[key].trim()
    }

    const metadata: Record<string, string> = {}
    for (const row of form.metadataRows) {
      const k = row.key.trim()
      if (!k || !METADATA_KEY_REGEX.test(k)) continue
      metadata[k] = row.value
    }

    const foundedRaw = form.founded_year.trim()
    let founded_year = parseOptionalInt(form.founded_year)
    const foundedFieldErrors: Record<string, string> = {}
    if (foundedRaw !== '' && founded_year === undefined) {
      foundedFieldErrors.founded_year = 'أدخل سنة تأسيس صحيحة (أرقام فقط)'
    }

    const payload = {
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim(),
      tagline_ar: form.tagline_ar.trim(),
      tagline_en: form.tagline_en.trim(),
      founded_year,
      about_ar: form.about_ar.trim(),
      about_en: form.about_en.trim(),
      mission_ar: form.mission_ar.trim(),
      mission_en: form.mission_en.trim(),
      vision_ar: form.vision_ar.trim(),
      vision_en: form.vision_en.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      social,
      metadata,
    }

    const merged: Record<string, string> = {
      ...validateMetadataRows(form.metadataRows),
      ...foundedFieldErrors,
    }

    const parsed = updateOrganizationSchema.safeParse(payload)
    if (!parsed.success) {
      Object.assign(merged, zodErrorToFieldErrors(parsed.error))
    }

    if (Object.keys(merged).length > 0) {
      setErrors(merged)
      scrollFirstInvalidIntoView()
      return
    }

    startTransition(async () => {
      if (isCreate) {
        const result = await createOrganizationAction(payload)
        if (result.success && result.data) {
          setErrors({})
          toast.success('تم إنشاء سجل المنظمة')
          router.refresh()
        } else {
          toast.error(result.error ?? 'تعذر الإنشاء')
          if ('fieldErrors' in result && result.fieldErrors) setErrors(result.fieldErrors)
        }
        return
      }

      const result = await updateOrganizationAction(organization.id, payload)
      if (result.success && result.data) {
        setErrors({})
        toast.success('تم حفظ معلومات المنظمة')
        setForm(buildInitial(result.data as OrganizationRow))
      } else {
        toast.error(result.error ?? 'تعذر الحفظ')
        if ('fieldErrors' in result && result.fieldErrors) setErrors(result.fieldErrors)
      }
    })
  }

  const e = errors

  const lastUpdatedBy =
    organization?.updatedByName?.trim() || (organization?.updated_by ? 'مستخدم محذوف' : '')

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {!isCreate && lastUpdatedBy ? (
        <ReadOnlyField id="org-updated-by" label="آخر تحديث بواسطة" value={lastUpdatedBy} />
      ) : null}

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>الهوية والظهور</CardTitle>
          <CardDescription>الاسم، الشعارات، وسنة التأسيس</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="name_ar">الاسم بالعربية</Label>
            <Input
              id="name_ar"
              value={form.name_ar}
              onChange={(ev) => update('name_ar', ev.target.value)}
              placeholder="مثال: جمعية حماية الأسرة والطفولة"
              dir="rtl"
              aria-invalid={!!e.name_ar}
              className={cn(e.name_ar && 'border-destructive')}
            />
            <FieldError message={e.name_ar} />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
            <Input
              id="name_en"
              value={form.name_en}
              onChange={(ev) => update('name_en', ev.target.value)}
              placeholder="Example: Family and Childhood Protection Society"
              dir="ltr"
              aria-invalid={!!e.name_en}
              className={cn('text-left', e.name_en && 'border-destructive')}
            />
            <FieldError message={e.name_en} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founded_year">سنة التأسيس</Label>
            <Input
              id="founded_year"
              type="text"
              inputMode="numeric"
              value={form.founded_year}
              onChange={(ev) => update('founded_year', ev.target.value)}
              placeholder="مثال: 1990"
              dir="ltr"
              className={cn('text-left', e.founded_year && 'border-destructive')}
              aria-invalid={!!e.founded_year}
            />
            <FieldError message={e.founded_year} />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="tagline_ar">الشعار بالعربية</Label>
            <Input
              id="tagline_ar"
              value={form.tagline_ar}
              onChange={(ev) => update('tagline_ar', ev.target.value)}
              placeholder="عبارة ترويجية أو شعار قصير..."
              dir="rtl"
              aria-invalid={!!e.tagline_ar}
              className={cn(e.tagline_ar && 'border-destructive')}
            />
            <FieldError message={e.tagline_ar} />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="tagline_en">الشعار بالإنجليزية</Label>
            <Input
              id="tagline_en"
              value={form.tagline_en}
              onChange={(ev) => update('tagline_en', ev.target.value)}
              placeholder="Short tagline or promotional phrase..."
              dir="ltr"
              aria-invalid={!!e.tagline_en}
              className={cn('text-left', e.tagline_en && 'border-destructive')}
            />
            <FieldError message={e.tagline_en} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>المحتوى</CardTitle>
          <CardDescription>نبذة، الرسالة، والرؤية</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="about_ar">عن المنظمة (بالعربية)</Label>
              <Textarea
                id="about_ar"
                value={form.about_ar}
                onChange={(ev) => update('about_ar', ev.target.value)}
                placeholder="نبذة تعريفية شاملة عن المنظمة، أهدافها، وتاريخها..."
                rows={5}
                dir="rtl"
                aria-invalid={!!e.about_ar}
                className={cn(e.about_ar && 'border-destructive')}
              />
              <FieldError message={e.about_ar} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about_en">عن المنظمة (بالإنجليزية)</Label>
              <Textarea
                id="about_en"
                value={form.about_en}
                onChange={(ev) => update('about_en', ev.target.value)}
                placeholder="Comprehensive overview of the organization, its goals, and history..."
                rows={5}
                dir="ltr"
                aria-invalid={!!e.about_en}
                className={cn('text-left', e.about_en && 'border-destructive')}
              />
              <FieldError message={e.about_en} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mission_ar">الرسالة (بالعربية)</Label>
              <Textarea
                id="mission_ar"
                value={form.mission_ar}
                onChange={(ev) => update('mission_ar', ev.target.value)}
                placeholder="رسالة المنظمة التي تسعى لتحقيقها في المجتمع..."
                rows={4}
                dir="rtl"
                aria-invalid={!!e.mission_ar}
                className={cn(e.mission_ar && 'border-destructive')}
              />
              <FieldError message={e.mission_ar} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mission_en">الرسالة (بالإنجليزية)</Label>
              <Textarea
                id="mission_en"
                value={form.mission_en}
                onChange={(ev) => update('mission_en', ev.target.value)}
                placeholder="The organization's mission in society..."
                rows={4}
                dir="ltr"
                aria-invalid={!!e.mission_en}
                className={cn('text-left', e.mission_en && 'border-destructive')}
              />
              <FieldError message={e.mission_en} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vision_ar">الرؤية (بالعربية)</Label>
              <Textarea
                id="vision_ar"
                value={form.vision_ar}
                onChange={(ev) => update('vision_ar', ev.target.value)}
                placeholder="الرؤية المستقبلية والغاية الكبرى للمنظمة..."
                rows={3}
                dir="rtl"
                aria-invalid={!!e.vision_ar}
                className={cn(e.vision_ar && 'border-destructive')}
              />
              <FieldError message={e.vision_ar} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vision_en">الرؤية (بالإنجليزية)</Label>
              <Textarea
                id="vision_en"
                value={form.vision_en}
                onChange={(ev) => update('vision_en', ev.target.value)}
                placeholder="The future vision and ultimate goal of the organization..."
                rows={3}
                dir="ltr"
                aria-invalid={!!e.vision_en}
                className={cn('text-left', e.vision_en && 'border-destructive')}
              />
              <FieldError message={e.vision_en} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>التواصل</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">الهاتف</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(ev) => update('phone', ev.target.value)}
              placeholder="مثال: +962790000000"
              dir="rtl"
              className={cn('text-left', e.phone && 'border-destructive')}
              aria-invalid={!!e.phone}
            />
            <FieldError message={e.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(ev) => update('email', ev.target.value)}
              placeholder="مثال: info@example.com"
              dir="ltr"
              className={cn('text-left', e.email && 'border-destructive')}
              aria-invalid={!!e.email}
            />
            <FieldError message={e.email} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="text-right">
          <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
          <CardDescription>اختر المنصات التي تريد عرضها ثم أدخل الرابط لكل منها</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap justify-end gap-2">
            {SOCIAL_PLATFORM_KEYS.map((key) => {
              const active = form.socialEnabled[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSocial(key)}
                  title={SOCIAL_LABELS[key]}
                  className={
                    'flex flex-col items-center gap-1 rounded-xl border px-3 py-2 transition-colors ' +
                    (active
                      ? 'border-(--fcps-primary) bg-(--fcps-primary)/10 text-(--fcps-dark)'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted')
                  }
                >
                  {SOCIAL_ICONS[key]}
                  <span className="max-w-22 truncate text-center text-[10px] font-medium leading-tight">
                    {SOCIAL_LABELS[key]}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="grid gap-4">
            {SOCIAL_PLATFORM_KEYS.filter((k) => form.socialEnabled[k]).map((key) => {
              const path = `social.${key}`
              const msg = e[path]
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`social_${key}`} className="flex items-center gap-2">
                    <span className="text-muted-foreground">{SOCIAL_ICONS[key]}</span>
                    {SOCIAL_LABELS[key]}
                  </Label>
                  <Input
                    id={`social_${key}`}
                    type="url"
                    value={form.socialUrls[key]}
                    onChange={(ev) => setSocialUrl(key, ev.target.value)}
                    placeholder={`https://${key}.com/your-page`}
                    dir="ltr"
                    className={cn('text-left', msg && 'border-destructive')}
                    aria-invalid={!!msg}
                  />
                  <FieldError message={msg} />
                </div>
              )
            })}
            {SOCIAL_PLATFORM_KEYS.every((k) => !form.socialEnabled[k]) && (
              <p className="text-right text-sm text-muted-foreground">
                لم يتم اختيار أي منصة. اضغط على أيقونة أعلاه لإظهار حقل الرابط.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col gap-2 text-right sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>البيانات الوصفية (Metadata)</CardTitle>
            <CardDescription>أزواج مفتاح وقيمة تُخزَّن في حقل JSONB</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1 self-end sm:self-auto" onClick={addMetadataRow}>
            <Plus className="size-4" />
            إضافة حقل
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.metadataRows.length === 0 ? (
            <p className="text-right text-sm text-muted-foreground">لا توجد حقول. استخدم «إضافة حقل».</p>
          ) : (
            form.metadataRows.map((row) => {
              const errKey = e[`metadata.${row.clientId}.key`]
              const errVal = e[`metadata.${row.clientId}.value`]
              return (
                <div
                  key={row.clientId}
                  className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <div className="space-y-2 sm:col-span-1">
                    <Label className="text-right">المفتاح</Label>
                    <Input
                      value={row.key}
                      onChange={(ev) => updateMetadataRow(row.clientId, { key: ev.target.value })}
                      placeholder="مثال: tax_number (لغة إنجليزية فقط)"
                      dir="ltr"
                      className={cn('text-left font-mono text-sm', errKey && 'border-destructive')}
                      aria-invalid={!!errKey}
                    />
                    <FieldError message={errKey} />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label className="text-right">القيمة</Label>
                    <Input
                      value={row.value}
                      onChange={(ev) => updateMetadataRow(row.clientId, { value: ev.target.value })}
                      placeholder='نص عادي أو كود JSON مثل: ["أ", "ب"]'
                      dir="ltr"
                      className={cn('text-left', errVal && 'border-destructive')}
                      aria-invalid={!!errVal}
                    />
                    <FieldError message={errVal} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeMetadataRow(row.clientId)}
                    aria-label="حذف الحقل"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !changed}
          onClick={() => {
            setForm(buildInitial(organization))
            setErrors({})
          }}
        >
          إلغاء التعديلات
        </Button>
        <Button type="submit" disabled={pending || (!isCreate && !changed)} className="min-w-[120px]">
          {pending ? 'جاري الحفظ...' : isCreate ? 'إنشاء السجل' : 'حفظ'}
        </Button>
      </div>
    </form>
  )
}
