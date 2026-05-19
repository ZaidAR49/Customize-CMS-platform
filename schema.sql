-- ==============================================================
-- schema.sql
-- Full portable schema — copy/paste to any PostgreSQL provider
-- Includes: enums, tables, indexes, functions, triggers
-- Languages supported: English (en), Arabic (ar)
-- ==============================================================
-- ==============================================================
-- EXTENSIONS
-- ==============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- provides gen_random_uuid()
-- ==============================================================
-- ENUMS
-- ==============================================================
CREATE TYPE lang_code AS ENUM ('en', 'ar');
CREATE TYPE post_type AS ENUM (
  'news',
  'posts',
  'activities',
  'top_employees',
  'program',
  'centers',
  'center'
);
-- ==============================================================
-- FUNCTIONS
-- ==============================================================
-- Automatically stamps updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$;
-- Called by Supabase Auth trigger to mirror auth.users → public.users
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
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
-- Purges rejected comments older than 1 month (call via pg_cron or manually)
CREATE OR REPLACE FUNCTION delete_old_rejected_comments() RETURNS void LANGUAGE plpgsql AS $$
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
-- ==============================================================
-- TABLES
-- ==============================================================
-- --------------------------------------------------------------
-- USERS
-- --------------------------------------------------------------
CREATE TABLE users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  avatar_url varchar,
  role varchar NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  provider varchar DEFAULT 'google',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email)
);
-- --------------------------------------------------------------
-- ORGANIZATION
-- --------------------------------------------------------------
CREATE TABLE organization (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  founded_year int4 DEFAULT 1992,
  logo_url varchar,
  phone varchar,
  email varchar,
  website_url varchar,
  social jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT organization_pkey PRIMARY KEY (id),
  CONSTRAINT fk_org_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);
CREATE TABLE organization_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  lang lang_code NOT NULL,
  name varchar NOT NULL,
  tagline varchar,
  about text,
  mission text,
  vision text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organization_translations_pkey PRIMARY KEY (id),
  CONSTRAINT organization_translations_org_id_lang_key UNIQUE (organization_id, lang),
  CONSTRAINT organization_translations_org_id_fkey FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE
);
-- --------------------------------------------------------------
-- ORGANIZATION STATS
-- --------------------------------------------------------------
CREATE TABLE organization_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  key varchar NOT NULL,
  value varchar NOT NULL DEFAULT '0',
  icon varchar,
  display_order int4 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT organization_stats_pkey PRIMARY KEY (id),
  CONSTRAINT organization_stats_organization_id_key_key UNIQUE (organization_id, key),
  CONSTRAINT organization_stats_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organization(id),
  CONSTRAINT organization_stats_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id)
);
CREATE TABLE organization_stats_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stat_id uuid NOT NULL,
  lang lang_code NOT NULL,
  label varchar NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organization_stats_translations_pkey PRIMARY KEY (id),
  CONSTRAINT organization_stats_translations_stat_id_lang_key UNIQUE (stat_id, lang),
  CONSTRAINT organization_stats_translations_stat_id_fkey FOREIGN KEY (stat_id) REFERENCES organization_stats(id) ON DELETE CASCADE
);
-- --------------------------------------------------------------
-- CATEGORIES
-- --------------------------------------------------------------
CREATE TABLE categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key varchar NOT NULL,
  icon varchar,
  display_order int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_key_key UNIQUE (key)
);
CREATE TABLE category_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  lang lang_code NOT NULL,
  label varchar NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT category_translations_pkey PRIMARY KEY (id),
  CONSTRAINT category_translations_category_id_lang_key UNIQUE (category_id, lang),
  CONSTRAINT category_translations_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
-- --------------------------------------------------------------
-- POSTS
-- --------------------------------------------------------------
CREATE TABLE posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type post_type NOT NULL,
  slug varchar NOT NULL,
  cover_image varchar,
  metadata jsonb NOT NULL DEFAULT '{}',
  published bool NOT NULL DEFAULT false,
  published_at timestamptz DEFAULT now(),
  author_id uuid NOT NULL,
  tags text [] NOT NULL DEFAULT '{}',
  category_id uuid,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_slug_key UNIQUE (slug),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id),
  CONSTRAINT posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE TABLE post_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  lang lang_code NOT NULL,
  title varchar NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_translations_pkey PRIMARY KEY (id),
  CONSTRAINT post_translations_post_id_lang_key UNIQUE (post_id, lang),
  CONSTRAINT post_translations_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
-- --------------------------------------------------------------
-- POST COMMENTS
-- --------------------------------------------------------------
CREATE TABLE post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_name text NOT NULL,
  author_email text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz,
  moderated_by uuid,
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id),
  CONSTRAINT post_comments_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES users(id)
);
-- ==============================================================
-- INDEXES
-- (PKs and UNIQUE constraints already create implicit indexes;
--  only additional performance indexes are listed here)
-- ==============================================================
-- posts
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_published_at ON posts(published, published_at DESC);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_tags ON posts USING gin(tags);
-- organization_stats
CREATE INDEX idx_organization_stats_org_id ON organization_stats(organization_id);
-- post_comments
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_status ON post_comments(status);
-- ==============================================================
-- TRIGGERS
-- ==============================================================
CREATE TRIGGER users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER organization_updated_at BEFORE
UPDATE ON organization FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- NOTE: add the trigger below on any provider that uses Supabase Auth.
-- On plain PostgreSQL without Supabase Auth, omit it.
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();