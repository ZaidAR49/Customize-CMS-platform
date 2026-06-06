-- =============================================================================
-- CMS — Full Database Schema
-- Project : uzihedieuzkjaeabggxi
-- Generated: 2026-05-20
-- =============================================================================
-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
-- =============================================================================
-- ENUM TYPES
-- =============================================================================
CREATE TYPE public.lang_code AS ENUM ('en', 'ar');
CREATE TYPE public.post_type AS ENUM (
  'news',
  'posts',
  'activities',
  'top_employees',
  'program',
  'centers',
  'center'
);
-- =============================================================================
-- TABLES
-- =============================================================================
-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar_url varchar,
  role varchar NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  provider varchar DEFAULT 'google',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- -----------------------------------------------------------------------------
-- organization  (singleton row)
-- -----------------------------------------------------------------------------
CREATE TABLE public.organization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founded_year int4,
  logo_url varchar,
  phone varchar,
  email varchar,
  website_url varchar,
  social jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.users (id)
);
-- -----------------------------------------------------------------------------
-- organization_translations
-- -----------------------------------------------------------------------------
CREATE TABLE public.organization_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organization (id),
  lang public.lang_code NOT NULL,
  name varchar NOT NULL,
  tagline varchar,
  about text,
  mission text,
  vision text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, lang)
);
-- -----------------------------------------------------------------------------
-- organization_stats
-- -----------------------------------------------------------------------------
CREATE TABLE public.organization_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organization (id),
  key varchar NOT NULL,
  value varchar NOT NULL DEFAULT '0',
  icon varchar,
  display_order int4 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.users (id),
  UNIQUE (organization_id, key)
);
-- -----------------------------------------------------------------------------
-- organization_stats_translations
-- -----------------------------------------------------------------------------
CREATE TABLE public.organization_stats_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_id uuid NOT NULL REFERENCES public.organization_stats (id),
  lang public.lang_code NOT NULL,
  label varchar NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stat_id, lang)
);
-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar NOT NULL UNIQUE,
  display_order int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- -----------------------------------------------------------------------------
-- category_translations
-- -----------------------------------------------------------------------------
CREATE TABLE public.category_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories (id),
  lang public.lang_code NOT NULL,
  label varchar NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, lang)
);
-- -----------------------------------------------------------------------------
-- posts
-- -----------------------------------------------------------------------------
CREATE TABLE public.posts (
    id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type             post_type   NOT NULL DEFAULT 'posts',  -- enum: 'news','posts','activities','top_employees','program','centers','center'
    metadata         JSONB       NULL     DEFAULT '{}',
    published        BOOLEAN     NULL     DEFAULT false,
    published_at     TIMESTAMPTZ NULL     DEFAULT now(),
    author_id        UUID        NULL     REFERENCES public.users(id),
    tags             TEXT[]      NULL     DEFAULT '{}',
    category_id      UUID        NULL     REFERENCES public.categories(id),
    is_bot_generated BOOLEAN     NOT NULL DEFAULT false
);
-- -----------------------------------------------------------------------------
-- post_translations
-- -----------------------------------------------------------------------------
CREATE TABLE public.post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts (id),
  lang public.lang_code NOT NULL,
  slug varchar UNIQUE,
  title varchar NOT NULL,
  description text,
  excerpt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, lang)
);
-- -----------------------------------------------------------------------------
-- post_comments
-- -----------------------------------------------------------------------------
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts (id),
  author_name text NOT NULL,
  author_email text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz,
  moderated_by uuid REFERENCES public.users (id)
);
-- =============================================================================
-- INDEXES  (non-PK / non-unique-constraint indexes only)
-- =============================================================================
-- categories
CREATE INDEX idx_categories_key ON public.categories (key);
-- organization
CREATE INDEX idx_org_updated_by ON public.organization (updated_by);
-- organization_stats
CREATE INDEX idx_org_stats_org_id ON public.organization_stats (organization_id);
-- posts
CREATE INDEX idx_posts_type ON public.posts (type);
CREATE INDEX idx_posts_author_id ON public.posts (author_id);
CREATE INDEX idx_posts_category_id ON public.posts (category_id);
CREATE INDEX idx_posts_published_at ON public.posts (published, published_at DESC);
CREATE INDEX idx_posts_latest_published ON public.posts (published_at DESC)
WHERE published = true;
CREATE INDEX idx_posts_tags ON public.posts USING gin (tags);
CREATE INDEX idx_posts_metadata_category ON public.posts ((metadata->>'category'))
WHERE (metadata->>'category') IS NOT NULL;
-- post_comments
CREATE INDEX idx_post_comments_post_id ON public.post_comments (post_id);
CREATE INDEX idx_post_comments_status ON public.post_comments (status);
-- =============================================================================
-- FUNCTIONS
-- =============================================================================
-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$;
-- Sync new Supabase Auth users into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
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
-- Hard-delete rejected comments older than 1 month (called by pg_cron job)
CREATE OR REPLACE FUNCTION public.delete_old_rejected_comments() RETURNS void LANGUAGE plpgsql AS $$
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
-- Increment post likes  (NOTE: posts table has no `likes` column yet — dead code)
CREATE OR REPLACE FUNCTION public.increment_likes(post_id uuid) RETURNS void LANGUAGE sql AS $$
UPDATE posts
SET likes = likes + 1
WHERE id = post_id;
$$;
-- =============================================================================
-- TRIGGERS
-- =============================================================================
-- updated_at on users
CREATE TRIGGER users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- updated_at on organization
CREATE TRIGGER organization_updated_at BEFORE
UPDATE ON public.organization FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Auth hook: mirror new auth.users → public.users
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- =============================================================================
-- ROW-LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_stats_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
-- Helper: is the caller an admin?
-- (inline subquery used directly in policies — no helper function needed)
-- ── users ────────────────────────────────────────────────────────────────────
CREATE POLICY "Users read own row" ON public.users FOR
SELECT USING (id::text = auth.uid()::text);
CREATE POLICY "Admins read all users" ON public.users FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );
-- ── organization ─────────────────────────────────────────────────────────────
CREATE POLICY "Public read org" ON public.organization FOR
SELECT USING (true);
CREATE POLICY "Admins update org" ON public.organization FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
-- ── organization_stats ───────────────────────────────────────────────────────
CREATE POLICY "Public read org stats" ON public.organization_stats FOR
SELECT USING (true);
CREATE POLICY "Admins manage org stats" ON public.organization_stats FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- ── categories ───────────────────────────────────────────────────────────────
CREATE POLICY "Public read categories" ON public.categories FOR
SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- ── posts ────────────────────────────────────────────────────────────────────
CREATE POLICY "Public read published posts" ON public.posts FOR
SELECT USING (published = true);
CREATE POLICY "Editors read all posts" ON public.posts FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = ANY(ARRAY ['admin','editor'])
    )
  );
CREATE POLICY "Editors insert posts" ON public.posts FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = ANY(ARRAY ['admin','editor'])
    )
  );
CREATE POLICY "Editors update posts" ON public.posts FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = ANY(ARRAY ['admin','editor'])
    )
  );
CREATE POLICY "Admins delete posts" ON public.posts FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- ── post_comments ────────────────────────────────────────────────────────────
CREATE POLICY "Public read approved comments" ON public.post_comments FOR
SELECT USING (status = 'approved');
CREATE POLICY "Editors read all comments" ON public.post_comments FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = ANY(ARRAY ['admin','editor'])
    )
  );
CREATE POLICY "Anyone submit comment" ON public.post_comments FOR
INSERT WITH CHECK (true);
CREATE POLICY "Editors moderate comments" ON public.post_comments FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = ANY(ARRAY ['admin','editor'])
    )
  );
CREATE POLICY "Admins delete comments" ON public.post_comments FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);