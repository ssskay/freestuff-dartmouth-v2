# Quick Start: Free Stuff at Big Green

**Status:** Phase 1 & 2 Complete - Production Ready
**Time to deploy:** 15 minutes

---

## TL;DR

```bash
# 1. Create Supabase project → Run supabase/schema.sql
# 2. Copy .env.example to .env → Fill in API keys
# 3. Seed database
npm run seed

# 4. Test locally
npm run dev

# 5. Deploy (Vercel auto-deploys on git push)
git add .
git commit -m "Add Phase 1 & 2: Supabase backend"
git push
```

---

## What Got Built

### Features
- ✅ Upvote system (no login required)
- ✅ Community submission form
- ✅ Live database (Supabase)
- ✅ Fallback to static JSON if DB unavailable

### Files Created
```
supabase/schema.sql         # Run this in Supabase SQL Editor
src/lib/supabase.ts         # Database client
src/lib/fingerprint.ts      # Vote deduplication
src/pages/submit.astro      # Submission form
scripts/seed-supabase.js    # Migration script
```

### Files Modified
```
src/components/ResourceCard.astro  # Added upvote button
src/pages/index.astro              # Fetch from Supabase
src/layouts/BaseLayout.astro       # Added Submit link
astro.config.mjs                   # Astro 5 compatibility
```

---

## Setup (5 Steps)

### 1. Supabase Project

Go to [supabase.com](https://supabase.com) → Create Project

**Project Settings:**
- Name: freestuff-dartmouth
- Database password: (pick a strong one)
- Region: US East

Wait 2 minutes for provisioning.

### 2. Run Database Schema

In Supabase dashboard:
1. Go to **SQL Editor**
2. Open `/Users/sarakay/freestuff-dartmouth-v2/supabase/schema.sql`
3. Copy entire file
4. Paste into SQL Editor
5. Click **Run**
6. Should see "Success. No rows returned"

This creates:
- 3 tables (resources, votes, pending_resources)
- 2 functions (upvote_resource, remove_upvote)
- Security policies (RLS)

### 3. Get API Keys

In Supabase:
1. Go to **Settings** → **API**
2. Copy these three values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (another long string)

### 4. Configure Environment

```bash
cd /Users/sarakay/freestuff-dartmouth-v2
cp .env.example .env
```

Edit `.env` and paste your keys:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

**Important:** Don't commit `.env` to git (already in .gitignore)

### 5. Seed & Test

```bash
# Migrate resources.json to Supabase
npm run seed

# Expected output:
# ✅ Success: 56 resources
# 📈 Total resources in database: 56

# Test locally
npm run dev
# Visit http://localhost:4321
```

**Test checklist:**
- [ ] Resources load from database
- [ ] Upvote button appears on cards
- [ ] Click upvote → count increments
- [ ] Click again → count decrements
- [ ] Refresh page → vote state persists
- [ ] Go to `/submit` → form works
- [ ] Fill out form → submits successfully
- [ ] Check Supabase dashboard → submission appears in `pending_resources`

---

## Deploy to Vercel

### First Time Setup

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Add Phase 1 & 2: Supabase backend"
   git push
   ```

2. In Vercel dashboard:
   - Go to your project → **Settings** → **Environment Variables**
   - Add all three from your `.env`:
     - `PUBLIC_SUPABASE_URL`
     - `PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`

3. Redeploy (Vercel auto-deploys on push)

4. Visit your live URL → Test upvotes

### Subsequent Deployments

Just push to GitHub:
```bash
git push
```

Vercel auto-deploys in ~2 minutes.

---

## Troubleshooting

### "Missing Supabase environment variables"

**Problem:** Site shows error about missing env vars

**Fix:**
1. Check `.env` exists in project root
2. Verify all three variables are set
3. Restart dev server: `npm run dev`

### Resources not loading

**Problem:** Page shows empty state or 0 resources

**Fix:**
1. Check browser console for errors
2. Verify Supabase URL and anon key are correct
3. Run seed script: `npm run seed`
4. Check Supabase dashboard → Table Editor → resources table has data

### Upvotes not working

**Problem:** Clicking upvote button does nothing

**Fix:**
1. Open browser DevTools → Console
2. Look for errors
3. Check Network tab → should see request to Supabase
4. Verify RLS policies in Supabase (Settings → Database → Policies)

### Build fails

**Problem:** `npm run build` shows errors

**Fix:**
1. Check TypeScript errors: Look for red squiggly lines
2. Verify all imports are correct
3. Try `npm install` to refresh dependencies

---

## What's Next?

Phase 1 & 2 are done. What's left:

### Phase 3: Admin Moderation View (Not Built Yet)

**Route:** `/admin`
**Purpose:** Review and approve community submissions
**Effort:** ~4-6 hours

### Phase 4: Agent Write-Back (Not Built Yet)

**Purpose:** Update verify/discover/draft agents to write to Supabase instead of GitHub PRs
**Effort:** ~6-8 hours

---

## Architecture Overview

### How It Works

**Static Pages:**
- `/about` - Pre-rendered at build time
- Navigation, footer - Static HTML

**Dynamic Data:**
- Resources fetched from Supabase at runtime
- Upvotes updated in real-time
- Fallback to `resources.json` if DB unavailable

**Vote Tracking:**
- Fingerprint generated from browser properties
- Stored in localStorage for persistence
- Checked against `votes` table to prevent double-voting

**Submission Flow:**
1. User fills out `/submit` form
2. Client-side validation
3. POST to Supabase `pending_resources` table
4. Admin reviews in Phase 3 (not built yet)
5. Approved → moves to `resources` table

### Database Schema

**resources** - Live catalog
- `id`, `name`, `description`, `url`, `category`
- `eligibility[]`, `upvotes`, `is_active`
- Indexed on category, eligibility, upvotes

**votes** - Upvote tracking
- `resource_id`, `fingerprint`, `voted_at`
- Unique constraint prevents double-voting

**pending_resources** - Moderation queue
- Same fields as resources
- `status`: pending | approved | rejected
- `agent_source`: verify | discover | draft | null

### Security

**Public Access (RLS enabled):**
- ✅ Read active resources
- ✅ Insert into pending_resources
- ✅ Vote/unvote via functions

**Admin Access (Phase 3):**
- 🔒 Approve/reject submissions
- 🔒 Manage resources

---

## File Reference

### Configuration
- `.env` - Your secrets (not in git)
- `.env.example` - Template
- `astro.config.mjs` - Astro settings

### Database
- `supabase/schema.sql` - Schema + RLS
- `src/lib/supabase.ts` - Client + helpers
- `src/lib/database.types.ts` - TypeScript types

### Scripts
- `scripts/seed-supabase.js` - Migration script
- `npm run seed` - Run migration

### Frontend
- `src/pages/index.astro` - Home (catalog)
- `src/pages/submit.astro` - Submission form
- `src/components/ResourceCard.astro` - Card with upvote

---

## Support

**Detailed setup:** See `SETUP.md`
**Technical details:** See `PHASE1-2-SUMMARY.md`
**Implementation report:** See `IMPLEMENTATION-REPORT.md`

**Supabase docs:** https://supabase.com/docs
**Astro docs:** https://docs.astro.build

---

**Built by Construct for Sara Kay**
**May 2026**
