import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required'),
  name_en: z.string().optional().or(z.literal('')),
  tagline_ar: z.string().optional().or(z.literal('')),
  founded_year: z.number().int().optional(),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  about_ar: z.string().optional().or(z.literal('')),
  mission_ar: z.string().optional().or(z.literal('')),
  vision_ar: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address_ar: z.string().optional().or(z.literal('')),
  google_maps_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  youtube_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  stat_families: z.number().int().optional(),
  stat_children: z.number().int().optional(),
  stat_women: z.number().int().optional(),
  stat_activities: z.number().int().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
