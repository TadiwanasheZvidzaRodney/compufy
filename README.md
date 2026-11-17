# Compufy Investments

Responsive IT services website and product catalogue, with a protected staff workspace.
Built with React, TypeScript, Vite, Tailwind, shadcn/ui and Supabase.

## Local development

Requires Node.js 20+ and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your Supabase project.
Use only the public publishable key in the frontend. Never use a service-role or secret key.

```sh
npm run typecheck
npm test
npm run lint
npm run build
npm run preview
```

## Backend setup (required)

The frontend does not automatically modify a hosted database.

For the existing project, apply `supabase/migrations/20261117090000_compufy_catalogue.sql`
through your Supabase SQL editor or linked Supabase CLI (`supabase db push`).
For a new project, apply all migrations in timestamp order.
The catalogue migration is additive: historical school tables and records are preserved,
but the old school screens are no longer part of the application.

This creates:
- `categories`: managed categories.
- `products`: prices in USD, SKU, specifications, image, stock status, draft/published and featured flags.
- `inquiries`: private customer requests with workflow status.
- `product-images`: public image bucket, administrator-only uploads, max 5 MB (JPEG/PNG/WebP).
- Row-level security: public visitors see only published products; only administrators can manage business data.

No products are seeded or invented. Until setup is complete, the website displays an honest
unavailable state with direct contact options. Failed inquiry submissions are not reported as sent.
There is no browser-only data fallback.

`npm test` runs all migrations in an isolated in-memory PostgreSQL instance (PGlite) and
checks anonymous, non-admin and administrator access, draft visibility, inquiry submission,
status injection prevention, product CRUD, history preservation and validation constraints.
It does not access or change your hosted Supabase project.

### Create an administrator

1. Create a user in **Supabase Dashboard → Authentication → Users**.
2. Use their UUID in the SQL editor:

```sql
insert into public.user_roles(user_id, role)
values ('REPLACE_WITH_USER_UUID', 'admin')
on conflict (user_id, role) do nothing;
```

3. Sign in at `/admin/login`. There is intentionally no public staff registration.
   The site owner can send password resets from Supabase.
4. At `/admin/products`, add categories and products, upload images, and enable **Published**.
   Featured products appear on the home page.
5. Customer requests appear at `/admin/inquiries`. Reply by email and track status.
   Requests are stored, not automatically emailed; no email provider is configured.

## Deployment

Deploy `dist/` to a static host with HTTPS. Set the public environment variables before building.
Configure SPA rewrites (`/*` → `/index.html`) so direct product/admin links work.
`public/_redirects` supplies this rule for Netlify-compatible hosts.
Configure your production URL in Supabase Authentication URL settings.

Before public launch:
- Add real product content and confirm business contact details/hours.
- Verify anonymous, authenticated non-admin and admin RLS access against the deployed project.
- Add server-side rate limiting and CAPTCHA verification to public inquiry submissions;
  the client honeypot is not a substitute for server-side abuse prevention.
- Set up backups, privacy/retention requirements and optional email notifications.
- Replace the SVG social-card placeholder with a hosted PNG/JPEG and use its absolute HTTPS URL
  in `index.html` for reliable social previews.

## Routes

`/`, `/services`, `/products`, `/products/:slug`, `/about`, `/contact`,
`/admin/login`, `/admin`, `/admin/products`, `/admin/inquiries`.
