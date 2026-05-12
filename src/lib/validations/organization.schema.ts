import { z } from 'zod';

const emptyOrUrl = z.union([z.literal(''), z.string().url('رابط غير صالح')]);

export const updateOrganizationSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required'),
  name_en: z.string().optional().or(z.literal('')),
  tagline_ar: z.string().optional().or(z.literal('')),
  founded_year: z.number().int().optional(),
  logo_url: emptyOrUrl.optional(),
  about_ar: z.string().optional().or(z.literal('')),
  mission_ar: z.string().optional().or(z.literal('')),
  vision_ar: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.union([z.literal(''), z.string().email('بريد غير صالح')]).optional(),
  address_ar: z.string().optional().or(z.literal('')),
  google_maps_url: emptyOrUrl.optional(),
  facebook_url: emptyOrUrl.optional(),
  twitter_url: emptyOrUrl.optional(),
  youtube_url: emptyOrUrl.optional(),
  stat_families: z.number().int().optional(),
  stat_children: z.number().int().optional(),
  stat_women: z.number().int().optional(),
  stat_activities: z.number().int().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
