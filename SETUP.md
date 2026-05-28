# Free Stuff at Big Green - Setup Guide

This guide walks you through setting up the Supabase backend for Phase 1 & 2 of the static → hybrid migration.

## What You're Building

Phase 1 & 2 adds:
- **Upvotes** - Users can upvote resources (localStorage + fingerprint deduplication)
- **Community submissions** - Submit form that goes into a moderation queue
- **Live database** - Resources served from Supabase with fallback to static JSON

## Prerequisites

- Node.js 20+ installed
- A Supabase account (free tier works)
- Git (for version control)

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose a name (e.g., "freestuff-dartmouth")
4. Set a strong database password (save this!)
5. Choose a region close to your users (US East for Dartmouth)
6. Wait for the project to finish provisioning (~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project, go to the **SQL Editor**
2. Open the file `/Users/sarakay/freestuff-dartmouth-v2/supabase/schema.sql`
3. Copy the entire contents
4. Paste it into the SQL Editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned" - this is correct!

This creates:
- `resources` table (main catalog)
- `votes` table (upvote tracking)
- `pending_resources` table (moderation queue)
- Two functions: `upvote_resource()` and `remove_upvote()`
- Row Level Security (RLS) policies for public access

## Step 3: Get Your API Keys

1. In Supabase, go to **Settings** → **API**
2. You'll see three important values:

   - **Project URL** (starts with `https://`)
   - **anon/public key** (long string starting with `eyJ...`)
   - **service_role key** (another long string)

3. Copy these - you'll need them next

## Step 4: Set Up Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and fill in the values:
   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Important:** Add `.env` to `.gitignore` if it's not already there:
   ```bash
   echo ".env" >> .gitignore
   ```

## Step 5: Seed the Database

Now we'll populate Supabase with the existing resources from `resources.json`:

```bash
node scripts/seed-supabase.js
```

You should see:
```
📖 Read 56 resources from resources.json
🌱 Starting database seed...
📦 Processing batch 1 (50 resources)...
✅ Inserted 50 resources
📦 Processing batch 2 (6 resources)...
✅ Inserted 6 resources

📊 Seeding complete!
   ✅ Success: 56 resources

📈 Total resources in database: 56

✨ All done!
```

## Step 6: Test Locally

Start the dev server:
```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

**Test checklist:**
- [ ] Resources load from database
- [ ] Upvote button appears on each card
- [ ] Clicking upvote increments the count
- [ ] Clicking again removes the upvote
- [ ] Upvote state persists after page refresh
- [ ] Navigate to `/submit`
- [ ] Fill out the form and submit
- [ ] Check Supabase dashboard → Table Editor → `pending_resources`
- [ ] Your submission should appear there with status = 'pending'

## Step 7: Deploy to Vercel

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase backend (Phase 1 & 2)"
   git push
   ```

2. In Vercel dashboard:
   - Go to your project settings
   - Navigate to **Environment Variables**
   - Add the three variables from your `.env` file:
     - `PUBLIC_SUPABASE_URL`
     - `PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`

3. Redeploy your site (Vercel does this automatically on push)

4. Visit your live site and test upvotes/submissions

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` exists and has all three variables set
- Restart your dev server after creating `.env`

### Resources not loading
- Check the browser console for errors
- Verify your `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are correct
- Make sure you ran the schema SQL in Supabase
- The site will fall back to static JSON if Supabase fails

### Upvotes not working
- Open browser DevTools → Network tab
- Click an upvote button
- Look for a request to `upvote_resource` or `remove_upvote`
- If you see a 401 error, check your RLS policies in Supabase

### Seed script fails
- Make sure you're using the **service_role key**, not the anon key
- Check that `resources.json` exists at `src/content/resources.json`
- Verify the JSON is valid (no trailing commas, proper quotes)

## What's Next?

Phase 1 & 2 are now complete! Here's what's built:

- ✅ Supabase database with three tables
- ✅ Upvote functionality with fingerprint deduplication
- ✅ Community submission form
- ✅ Hybrid rendering (static + dynamic)
- ✅ Fallback to static data if Supabase is unavailable

**Phase 3 (next):** Admin moderation view at `/admin`
**Phase 4 (after that):** Update maintenance agents to write to Supabase

## Architecture Notes

### Why hybrid rendering?
- Most pages are static (fast, cacheable)
- Only the data (upvotes, resources) is dynamic
- Astro fetches from Supabase at build time + runtime

### Why fingerprinting instead of auth?
- Lower barrier to entry - users don't need to log in
- Sufficient for preventing casual spam
- Can always add auth later if needed

### Why the fallback to static JSON?
- Ensures the site works even if Supabase is down
- Allows local development without Supabase configured
- Keeps `resources.json` as the source of truth / backup

## Database Schema Reference

### `resources`
Main catalog of free resources. Public read access (RLS enabled).

### `votes`
Tracks upvotes with fingerprint deduplication. Users can vote/unvote.

### `pending_resources`
Moderation queue for community and agent submissions. Public can insert (submit).

### Functions
- `upvote_resource(resource_id, fingerprint)` - Atomically add vote + increment counter
- `remove_upvote(resource_id, fingerprint)` - Atomically remove vote + decrement counter

## Support

Questions? Check:
- [Supabase Documentation](https://supabase.com/docs)
- [Astro Documentation](https://docs.astro.build)
- The brief at `/construct_guide.md`
