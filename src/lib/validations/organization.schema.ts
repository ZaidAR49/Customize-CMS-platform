import { z } from 'zod';
import type { ZodError } from 'zod';
import { SOCIAL_PLATFORM_KEYS } from '@/types/organization';

const MAX_NAME = 100;
const MAX_TAGLINE = 300;
const MAX_LONG_TEXT = 20000;
const MAX_METADATA_VALUE = 10000;
const MAX_PHONE_LEN = 25;

/** Metadata keys: Latin letters, digits, underscore; must start with letter or underscore */
export const METADATA_KEY_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

const emptyOrUrl = z.union([z.literal(''), z.string().url('رابط غير صالح')]);

const socialShape = Object.fromEntries(
  SOCIAL_PLATFORM_KEYS.map((k) => [k, emptyOrUrl.optional()])
) as Record<
  (typeof SOCIAL_PLATFORM_KEYS)[number],
  z.ZodOptional<typeof emptyOrUrl>
>;

export const organizationSocialSchema = z.object(socialShape);

/** Optional English / optional Arabic text: empty allowed, otherwise max length */
const optionalEnName = z
  .string()
  .max(MAX_NAME, `يجب ألا يتجاوز الاسم الإنجليزي ${MAX_NAME} حرفًا`);

const optionalEnTagline = z
  .string()
  .max(MAX_TAGLINE, `يجب ألا يتجاوز الشعار الإنجليزي ${MAX_TAGLINE} حرفًا`);

const optionalEnLong = z
  .string()
  .max(MAX_LONG_TEXT, `النص الإنجليزي طويل جدًا (الحد ${MAX_LONG_TEXT} حرفًا)`);

const optionalArTagline = z
  .string()
  .max(MAX_TAGLINE, `يجب ألا يتجاوز الشعار العربي ${MAX_TAGLINE} حرفًا`);

const optionalArLong = z
  .string()
  .max(MAX_LONG_TEXT, `النص العربي طويل جدًا (الحد ${MAX_LONG_TEXT} حرفًا)`);

const phoneSchema = z.union([
  z.literal(''),
  z
    .string()
    .min(6, 'رقم الهاتف قصير جدًا')
    .max(MAX_PHONE_LEN, `يجب ألا يتجاوز الهاتف ${MAX_PHONE_LEN} حرفًا`)
    .regex(/^[\d+\s().-]+$/, 'يُسمح بالأرقام والمسافات و + ( ) . - فقط'),
]);

const emailSchema = z.union([z.literal(''), z.string().email('بريد إلكتروني غير صالح')]);

const currentYear = new Date().getFullYear();

const foundedYearSchema = z
  .number()
  .int('سنة غير صحيحة')
  .min(100, 'يجب أن تكون سنة التأسيس أكبر من 100')
  .max(currentYear, `يجب أن تكون سنة التأسيس أقل من أو تساوي ${currentYear}`)
  .optional();

export const updateOrganizationSchema = z.object({
  name_ar: z
    .string()
    .min(1, 'أدخل الاسم بالعربية')
    .max(MAX_NAME, `يجب ألا يتجاوز الاسم العربي ${MAX_NAME} حرفًا`),
  /** All English fields optional (empty allowed) */
  name_en: optionalEnName,
  tagline_ar: optionalArTagline,
  tagline_en: optionalEnTagline,
  about_ar: optionalArLong,
  about_en: optionalEnLong,
  mission_ar: optionalArLong,
  mission_en: optionalEnLong,
  vision_ar: optionalArLong,
  vision_en: optionalEnLong,
  founded_year: foundedYearSchema,
  phone: phoneSchema,
  email: emailSchema,
  social: organizationSocialSchema.optional(),
  metadata: z
    .record(
      z
        .string()
        .regex(
          METADATA_KEY_REGEX,
          'المفتاح: حروف لاتينية وأرقام و _ فقط، ويبدأ بحرف أو _'
        ),
      z
        .string()
        .max(MAX_METADATA_VALUE, `القيمة طويلة جدًا (الحد ${MAX_METADATA_VALUE} حرفًا)`)
    )
    .optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export function zodErrorToFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.length ? issue.path.join('.') : '_form';
    if (!out[path]) out[path] = issue.message;
  }
  return out;
}

export type MetadataRowInput = { clientId: string; key: string; value: string };

/** Row-level metadata checks (duplicates, half-filled rows, key format). Paths: metadata.<clientId>.key|value */
export function validateMetadataRows(rows: MetadataRowInput[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const keyToClientIds = new Map<string, string[]>();

  for (const row of rows) {
    const k = row.key.trim();
    const v = row.value.trim();
    if (k === '' && v === '') continue;

    if (k === '' && v !== '') {
      errors[`metadata.${row.clientId}.key`] = 'أدخل المفتاح لهذه القيمة';
      continue;
    }

    if (!METADATA_KEY_REGEX.test(k)) {
      errors[`metadata.${row.clientId}.key`] =
        'المفتاح: حروف لاتينية وأرقام و _ فقط، ويبدأ بحرف أو _';
      continue;
    }

    if (v.length > MAX_METADATA_VALUE) {
      errors[`metadata.${row.clientId}.value`] = `القيمة طويلة جدًا (الحد ${MAX_METADATA_VALUE} حرفًا)`;
    }

    const list = keyToClientIds.get(k) ?? [];
    list.push(row.clientId);
    keyToClientIds.set(k, list);
  }

  for (const [, ids] of keyToClientIds) {
    if (ids.length > 1) {
      for (const id of ids) {
        errors[`metadata.${id}.key`] = 'هذا المفتاح مكرر في أكثر من صف';
      }
    }
  }

  return errors;
}
