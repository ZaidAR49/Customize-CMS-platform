# Specialized CMS Platform

A high-performance, secure, and multilingual Content Management System (CMS) designed for organization settings, news publication, and program management. Built on **Next.js 16 (App Router)** and **Supabase (PostgreSQL)**, this platform implements advanced caching architectures, secure edge-routing middleware, and robust Role-Based Access Control (RBAC).

---

## 🚀 Key Architectural Features

### 1. Data Caching & Incremental Static Regeneration (ISR)
* **Pre-rendered Detail Pages:** Program, Center, and News detail pages are statically pre-rendered (SSG) at build time and cached at the edge. They utilize Incremental Static Regeneration (ISR) with a `revalidate` period of 1 hour, allowing high-availability page loads with sub-millisecond response times.
* **Service-Level Caching:** Layout dependencies (like navigation links, category headers, and organization settings displayed in the global footer) are cached using Next.js `unstable_cache` to eliminate redundant database roundtrips.
* **On-Mutation Cache Invalidation:** Server Actions automatically trigger targeted cache invalidation via `revalidateTag` and type-specific `revalidatePath` helper routines upon creation, modification, or deletion of content.

### 2. Multi-Tier Security & Role-Based Access Control (RBAC)
* **Edge Routing Interceptor:** Next.js `proxy.ts` acts as an edge-level firewall, intercepting incoming requests to secure areas (`/dashboard/*`) and redirecting unauthenticated traffic before rendering occurs.
* **Granular Role Hierarchy:** Integrates `NextAuth.js` to manage secure sessions, enforcing authorization checks on Server Actions and API endpoints based on user roles (`Admin`, `Editor`, `Viewer`).
* **Secured API Surfaces:** Administrative actions—such as social scrapers (`/api/apify`), database backup managers (`/api/data-management/*`), and draft-state posts—are guarded programmatically against data leakage and unauthorized consumption.

### 3. Native Multilingual Support (i18n)
* **Arabic & English Support:** Fully integrated with `next-intl` to support localized layouts (RTL for Arabic, LTR for English).
* **Database Translation Tables:** Employs a database translation schema (`post_translations`, `category_translations`, etc.) to separate core records from dynamic localized metadata, preventing redundancy and ensuring clean schema expansion.

### 4. Backup, Restore & Data Portability
* **Automated Data Export:** Administrator interface allowing full database state backups across all core and localization tables.
* **Referential-Integrity Restoration:** The restore engine handles complex table dependencies, utilizing defined order resolution (wipe and insert queues) to guarantee conflict-free database imports and prevent Foreign Key constraint violations.

### 5. Automated Media Pipelines
* **Facebook Content Importer:** Utilizes `Apify` scraping APIs to automatically parse and import external social posts.
* **Cloudinary Storage CDN:** Scraped media binaries are automatically uploaded to Cloudinary to provide persistent CDN image delivery, shielding layouts from expiring social CDN links.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 16.2 (Turbopack, Server Actions), React 19, TailwindCSS, TypeScript.
* **Backend Services:** Supabase PostgreSQL Client, Next-Auth (Google Provider).
* **Localization:** next-intl.
* **Validations & Linting:** Zod, ESLint.

---

## ⚙️ Getting Started & Local Development

### 1. Environment Configuration
Create a `.env.local` file in the root directory and configure the following parameters:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_jwt_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# External Integrations
APIFY_TOKEN=your_apify_api_token
CLOUDINARY_URL=your_cloudinary_connection_string
```

### 2. Installation
Install the project dependencies:
```bash
npm install
```

### 3. Spin Up Development Server
Run the local dev server using Next.js compiler:
```bash
npm run dev
```

### 4. Build for Production
Verify types, linting, and compile the optimized static production bundle:
```bash
npm run build
```
