# FT Agri-Tech Solutions

Technology-driven agriculture platform for Ethiopia.

**Live:** [ft-agri-tech.systems](https://ft-agri-tech.systems) (Next.js on Vercel + custom domain)

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Supabase** (Google OAuth, quote requests, problem reports, custom R&D, profiles, admin action history)

---

## Local development

```bash
git clone https://github.com/hiyabteklu/ft-agritech-solutions.git
cd ft-agritech-solutions
npm install

# Copy env
cp .env.local.example .env.local
# Edit .env.local (Supabase URL + anon key, optional admin emails)

# Copy media into public/ so Next can serve images & video
npm run setup:public

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Important: `public/` assets

Next.js serves static files from **`public/`** only.

`npm run setup:public` copies logos, partner images (`GridArt_*.png`), `assets/`, and `yorda.mp4` into `public/` so paths like `/assets/images/cat1.jpg` and `/yorda.mp4` work.

On Vercel, set the **Build Command** to:

```bash
npm run setup:public && next build
```

---

## Supabase setup (required for people dashboard)

Run these in **Supabase → SQL Editor** (in order):

1. `supabase-tables.sql` — core request tables
2. `supabase-admin-users.sql` — **profiles** + **admin_actions** (users list, admins, history)

Without step 2, `/admin/people` still shows users derived from submissions, but full profiles and action history need the migration.

---

## Deploy (Vercel)

1. Import this repo in [Vercel](https://vercel.com).
2. Framework preset: **Next.js**.
3. Environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAILS` (optional, comma-separated)
4. Build Command: `npm run setup:public && next build`
5. In Supabase → Authentication → URL configuration, add your production URL to **Redirect URLs** (e.g. `https://ft-agri-tech.systems/**`).
6. Point the custom domain at the Vercel project (already done for production).

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage (navbar, hero, identity, solutions, framework, partners, footer) |
| `/category/[slug]` | Sector dashboard + product catalogs (`apiculture`, `aviculture`, …) |
| `/contact` | Contact form |
| `/account` | User profile, quotes, requests |
| `/admin` | Admin inbox (admin emails only) |
| `/admin/people` | Registered users, active admins, admin action history |
| `/admin/catalog` | Product / category catalog manager |

### Auth-gated actions

- **Report New Problem**, **Request Custom Design**, and **Configure & Order** require Google sign-in.
- Submissions go to Supabase tables `problems`, `custom_requests`, and `quote_requests`.
- Signed-in users are upserted into `profiles` (for the admin people list).

---

## Mission

> We don't invent technology and search for a use.  
> We find the problem first, then build exactly what the situation demands.

---

## Contact

- Telegram: [t.me/FT_Agri_Tech](https://t.me/FT_Agri_Tech)
- LinkedIn: [FT Agri-Tech Solutions](https://www.linkedin.com/company/ft-agritech-solutions/)
