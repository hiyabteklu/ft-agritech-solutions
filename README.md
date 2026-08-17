# FT Agri-Tech Solutions

Technology-driven agriculture platform for Ethiopia.

This repository currently holds **two parallel frontends**:

| Layer | What it is | Live today |
|--------|------------|------------|
| **Static site** | `index.html`, `category.html`, `style.css` | Yes — [ft-agri-tech.systems](https://ft-agri-tech.systems) via GitHub Pages |
| **Next.js app** | `src/` (App Router + TypeScript + Tailwind + Supabase) | Preview / deploy separately (Vercel recommended) |

The Next.js version is the long-term product shell. The static site stays public until you cut over.

---

## Stack (Next.js)

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Supabase** (Google OAuth, problem reports, custom R&D requests)

---

## Local development

```bash
git clone https://github.com/hiyabteklu/ft-agritech-solutions.git
cd ft-agritech-solutions
npm install

# Copy env
cp .env.local.example .env.local
# Edit .env.local if needed (Supabase URL + anon key)

# Copy static media into public/ so Next can serve images & video
npm run setup:public

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Important: `public/` assets

GitHub Pages serves files from the repo root. Next.js serves static files from **`public/`** only.

`npm run setup:public` copies logos, partner images, `assets/`, and `yorda.mp4` into `public/` so paths like `/assets/images/cat1.jpg` work in the Next app.

---

## Deploy Next.js on Vercel (recommended preview)

1. Import this repo in [Vercel](https://vercel.com).
2. Framework preset: **Next.js**.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In **Build Command**, use:
   ```bash
   npm run setup:public && next build
   ```
   (or set Install → Build to run setup before build).
5. In Supabase → Authentication → URL configuration, add your Vercel URL to **Redirect URLs** (e.g. `https://your-app.vercel.app/**`).
6. Deploy. Keep the custom domain on GitHub Pages until you are ready to switch DNS.

---

## Routes (Next.js)

| Path | Description |
|------|-------------|
| `/` | Homepage (navbar, hero, identity, solutions, framework, partners, footer) |
| `/category/[slug]` | Sector dashboard + product catalogs (`apiculture`, `aviculture`, …) |

### Auth-gated actions

- **Report New Problem** and **Request Custom Design** require Google sign-in.
- Submissions go to Supabase tables `problems` and `custom_requests` (optional `user_email` column).

---

## Mission reminder

> We don't invent technology and search for a use.  
> We find the problem first, then build exactly what the situation demands.

---

## Contact

- Telegram: [t.me/FT_Agri_Tech](https://t.me/FT_Agri_Tech)
- LinkedIn: [FT Agri-Tech Solutions](https://www.linkedin.com/company/ft-agritech-solutions/)
