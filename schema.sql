-- 1. Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  provider TEXT DEFAULT 'google',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE posts (
  -- Core (Always present, indexed)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE
  SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT now()
);
-- 3. Organization table
CREATE TABLE organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  tagline_ar TEXT,
  founded_year INTEGER DEFAULT 1992,
  logo_url TEXT,
  about_ar TEXT,
  mission_ar TEXT,
  vision_ar TEXT,
  phone TEXT,
  email TEXT,
  address_ar TEXT,
  google_maps_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  stat_families INTEGER DEFAULT 920,
  stat_children INTEGER DEFAULT 8766,
  stat_women INTEGER DEFAULT 6560,
  stat_activities INTEGER DEFAULT 230,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES users(id) ON DELETE
  SET NULL
);
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES users(id) ON DELETE
  SET NULL
);
-- 4. Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER posts_updated_at BEFORE
UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER organization_updated_at BEFORE
UPDATE ON organization FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- 5. Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON posts FOR
SELECT USING (published = true);
CREATE POLICY "Admins manage all posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own row" ON users FOR
SELECT USING (id::text = auth.uid()::text);
CREATE POLICY "Admins read all users" ON users FOR
SELECT USING (auth.role() = 'authenticated');
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read org" ON organization FOR
SELECT USING (true);
CREATE POLICY "Admins update org" ON organization FOR
UPDATE USING (auth.role() = 'authenticated');
-- 6. Seed organization row
INSERT INTO organization (
    name_ar,
    tagline_ar,
    founded_year,
    mission_ar,
    vision_ar,
    phone,
    email,
    address_ar
  )
VALUES (
    'جمعية حماية الأسرة والطفولة',
    'الطفولة والبراءة والامل بالبقاء',
    1992,
    'تقديم يد العون والمساعدة لكافة الفئات المستهدفة من خلال برامج مبنية على أسس علمية.',
    'نحو طفولة آمنة ومجتمع خالٍ من العنف',
    '+962 2 000 0000',
    'info@fcpsjo.org',
    'إربد، المملكة الأردنية الهاشمية'
  );
-- 7. Increment Likes Function
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID) RETURNS void AS $$
UPDATE posts
SET likes = likes + 1
WHERE id = post_id;
$$ LANGUAGE sql;
-- 8. Indexes
CREATE INDEX idx_posts_latest_published ON posts (published_at DESC)
WHERE published = true;
CREATE INDEX idx_posts_slug ON posts (slug);
CREATE INDEX idx_posts_metadata_category ON posts ((metadata->>'category'))
WHERE (metadata->>'category') IS NOT NULL;
CREATE INDEX idx_posts_metadata_tags ON posts USING GIN ((metadata->'tags'));
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_post_type ON posts (type);