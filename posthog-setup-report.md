<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the جمعية حماية الأسرة والطفولة CMS. The integration covers both client-side and server-side tracking, user identification, a reverse proxy for reliable event ingestion, and a pre-built analytics dashboard.

## What was set up

### Infrastructure
- **`instrumentation-client.ts`** — Initialises `posthog-js` at app startup using Next.js 16's `instrumentation-client` hook (the correct approach for Next.js ≥ 15.3). Enables automatic exception capture and routes all events through the `/ingest` reverse proxy.
- **`src/lib/posthog-server.ts`** — Singleton `posthog-node` client for server-side event capture in Server Actions and API routes.
- **`next.config.ts`** — Added reverse-proxy rewrites: `/ingest/*` → `eu.i.posthog.com`, `/ingest/static/*` and `/ingest/array/*` → `eu-assets.i.posthog.com`. Also set `skipTrailingSlashRedirect: true` as required by PostHog.
- **`.env.local`** — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` written with correct values.
- **`src/components/providers/PostHogIdentifier.tsx`** — Client component (placed in root layout) that calls `posthog.identify()` when a NextAuth session is active and `posthog.reset()` on sign-out, correlating user identities across client and server events.

## Events instrumented

| Event | Description | File |
|-------|-------------|------|
| `contact_form_submitted` | Visitor successfully submits the public contact form | `src/app/[locale]/(pages)/contact/ContactClient.tsx` |
| `post_liked` | Visitor clicks the like/heart button on a news article | `src/components/news/post-detail/PostShareBar.tsx` |
| `facebook_post_imported` | Editor imports a post from Facebook via the Apify integration | `src/components/dashboard/PostForm.tsx` |
| `comment_submitted` | Visitor submits a comment (server-side, pending moderation) | `src/app/api/comments/route.ts` |
| `post_created` | Editor/admin creates a new post (news, activity, program, center) | `src/actions/posts.actions.ts` |
| `post_deleted` | Editor/admin deletes a post | `src/actions/posts.actions.ts` |
| `post_published` | Editor/admin publishes a previously-draft post | `src/actions/posts.actions.ts` |
| `user_created` | Admin adds a new CMS user account | `src/actions/users.actions.ts` |

## Next steps

We've built an analytics dashboard and five insights to monitor user behaviour and editorial activity based on the events above:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/199589/dashboard/740974)
- [Public engagement over time](https://eu.posthog.com/project/199589/insights/FfMt5kAE) — post likes, comments, and contact form submissions per day
- [Content publishing activity](https://eu.posthog.com/project/199589/insights/Gw0LJU5B) — posts created, published, and deleted per day
- [Post creation to publication funnel](https://eu.posthog.com/project/199589/insights/3PM1JuHB) — % of created posts that are eventually published (draft → live conversion)
- [Facebook content imports](https://eu.posthog.com/project/199589/insights/DJz8qSBX) — frequency of Facebook auto-import usage by editors
- [New CMS users added](https://eu.posthog.com/project/199589/insights/SgI5yJLr) — staff/volunteer account creation over time

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
