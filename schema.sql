-- =============================================================
-- CMS Database Schema
-- PostgreSQL 17 · Supabase
-- Run this in a fresh Supabase project SQL editor to replicate
-- the full database: tables, types, indexes, RLS, functions,
-- and triggers.
-- =============================================================
-- =============================================================
-- 0. EXTENSIONS (enabled by default in Supabase, safe to re-run)
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- =============================================================
-- 1. ENUM TYPES
-- =============================================================
CREATE TYPE public.post_type AS ENUM (
  'news',
  'posts',
  'activities',
  'top_employees',
  'program',
  'center'
);
-- =============================================================
-- 2. TABLES
-- =============================================================
-- -------------------------------------------------------------
-- 2.1 users
-- Synced from auth.users via trigger on signup.
-- -------------------------------------------------------------
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(10) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  provider VARCHAR(20) DEFAULT 'google',
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- -------------------------------------------------------------
-- 2.2 categories
-- Standalone categories. Posts reference via category_id FK.
-- Allows empty categories, ordering, and bilingual labels.
-- -------------------------------------------------------------
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL UNIQUE,
  label_ar VARCHAR(100) NOT NULL,
  label_en VARCHAR(100),
  description_ar TEXT,
  description_en TEXT,
  icon VARCHAR(100),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_key ON public.categories(key);
-- -------------------------------------------------------------
-- 2.3 posts
-- Core content table. Every content type is a post.
--
-- metadata jsonb shape by type:
--   news / posts / activities:
--     { "excerpt": "", "likes": 0, "gallery": [] }
--   top_employees:
--     { "job_title": "", "department": "", "bio": "", "phone": "" }
-- -------------------------------------------------------------
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.post_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  cover_image VARCHAR(500),
  tags TEXT [] DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) ON DELETE
  SET NULL,
    metadata JSONB DEFAULT '{}',
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT now(),
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    description TEXT,
    descripcion TEXT
);
-- -------------------------------------------------------------
-- 2.4 post_comments
-- Public-submittable comments with moderation workflow.
-- -------------------------------------------------------------
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES public.users(id) ON DELETE
  SET NULL
);
-- -------------------------------------------------------------
-- 2.5 organization
-- Single-row table for org branding and identity.
--
-- social jsonb shape:
--   { "facebook": "", "twitter": "", "instagram": "",
--     "youtube": "", "linkedin": "", "tiktok": "", "whatsapp": "" }
--
-- metadata jsonb shape (fully dynamic):
--   { "registration_number": "", "tax_id": "", "accreditations": [] }
-- -------------------------------------------------------------
CREATE TABLE public.organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  tagline_ar VARCHAR(300),
  tagline_en VARCHAR(300),
  about_ar TEXT,
  about_en TEXT,
  mission_ar TEXT,
  mission_en TEXT,
  vision_ar TEXT,
  vision_en TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(150),
  founded_year INTEGER DEFAULT 1992,
  social JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users(id) ON DELETE
  SET NULL
);
-- -------------------------------------------------------------
-- 2.6 organization_stats
-- Dynamic key-value stats (families served, activities, etc.)
-- Each stat is a row — add/remove/reorder without schema changes.
-- -------------------------------------------------------------
CREATE TABLE public.organization_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  label_ar VARCHAR(100) NOT NULL,
  label_en VARCHAR(100),
  value VARCHAR(20) NOT NULL DEFAULT '0',
  icon VARCHAR(100),
  display_order INTEGER NOT NULL DEFAULT 0,
  description_ar TEXT,
  description_en TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users(id) ON DELETE
  SET NULL,
    UNIQUE (organization_id, key)
);
-- =============================================================
-- 3. INDEXES
-- =============================================================
-- users
-- (users_email_key unique index is created automatically by UNIQUE constraint)
-- categories
-- (categories_key_key unique index is created automatically by UNIQUE constraint)
-- posts
CREATE INDEX idx_posts_tags ON public.posts USING GIN (tags);
CREATE INDEX idx_posts_category_id ON public.posts USING BTREE (category_id);
CREATE INDEX idx_post_type ON public.posts USING BTREE (type);
CREATE INDEX idx_posts_author_id ON public.posts USING BTREE (author_id);
CREATE INDEX idx_posts_latest_published ON public.posts USING BTREE (published_at DESC)
WHERE published = true;
CREATE INDEX idx_posts_metadata_category ON public.posts USING BTREE ((metadata->>'category'))
WHERE (metadata->>'category') IS NOT NULL;
-- post_comments
CREATE INDEX idx_comments_post_id ON public.post_comments USING BTREE (post_id);
-- organization
CREATE INDEX idx_org_updated_by ON public.organization USING BTREE (updated_by);
-- organization_stats
CREATE INDEX idx_org_stats_org_id ON public.organization_stats USING BTREE (organization_id);
-- (organization_stats_organization_id_key_key unique index is
--  created automatically by the UNIQUE constraint above)
-- =============================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_stats ENABLE ROW LEVEL SECURITY;
-- -------------------------------------------------------------
-- 4.1 categories policies
-- -------------------------------------------------------------
CREATE POLICY "Public read categories" ON public.categories FOR
SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- -------------------------------------------------------------
-- 4.2 users policies
-- -------------------------------------------------------------
CREATE POLICY "Users read own row" ON public.users FOR
SELECT USING (id = auth.uid());
CREATE POLICY "Admins read all users" ON public.users FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );
-- -------------------------------------------------------------
-- 4.3 posts policies
-- -------------------------------------------------------------
CREATE POLICY "Public read published posts" ON public.posts FOR
SELECT USING (published = true);
CREATE POLICY "Editors read all posts" ON public.posts FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Editors insert posts" ON public.posts FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Editors update posts" ON public.posts FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Admins delete posts" ON public.posts FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- -------------------------------------------------------------
-- 4.4 post_comments policies
-- -------------------------------------------------------------
CREATE POLICY "Public read approved comments" ON public.post_comments FOR
SELECT USING (status = 'approved');
CREATE POLICY "Editors read all comments" ON public.post_comments FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Anyone submit comment" ON public.post_comments FOR
INSERT WITH CHECK (true);
CREATE POLICY "Editors moderate comments" ON public.post_comments FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );
CREATE POLICY "Admins delete comments" ON public.post_comments FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- -------------------------------------------------------------
-- 4.5 organization policies
-- -------------------------------------------------------------
CREATE POLICY "Public read org" ON public.organization FOR
SELECT USING (true);
CREATE POLICY "Admins update org" ON public.organization FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
-- -------------------------------------------------------------
-- 4.6 organization_stats policies
-- -------------------------------------------------------------
CREATE POLICY "Public read org stats" ON public.organization_stats FOR
SELECT USING (true);
CREATE POLICY "Admins manage org stats" ON public.organization_stats FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- =============================================================
-- 5. FUNCTIONS & TRIGGERS
-- =============================================================
-- -------------------------------------------------------------
-- 5.1 Auto-create public.users row on Supabase Auth signup
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
INSERT INTO public.users (id, email, name, avatar_url, provider)
VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'provider', 'google')
  ) ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- =============================================================
-- 6. EXTENSIONS FOR SCHEDULING
-- =============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- =============================================================
-- 7. SCHEDULED JOBS
-- =============================================================
-- -------------------------------------------------------------
-- 7.1 Delete rejected comments older than 1 month
-- Runs at 00:00 on the 1st of every month (cron: '0 0 1 * *')
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_old_rejected_comments() RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE deleted_count INTEGER;
BEGIN
DELETE FROM public.post_comments
WHERE status = 'rejected'
  AND moderated_at < now() - INTERVAL '1 month';
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RAISE LOG 'delete_old_rejected_comments: deleted % rows at %',
deleted_count,
now();
END;
$$;
SELECT cron.schedule(
    'delete-rejected-comments-monthly',
    '0 0 1 * *',
    $$
    SELECT public.delete_old_rejected_comments();
$$
);