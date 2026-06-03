# Deployment Guide - Free Stuff @ Dartmouth

**Last Updated:** June 3, 2026
**Target Platform:** Vercel
**Status:** ✅ DEPLOYED AND LIVE

**Production URL:** https://freestuff-dartmouth-v2.vercel.app
**GitHub Repo:** https://github.com/ssskay/freestuff-dartmouth-v2
**Auto-Deploy:** Enabled (push to main = auto-deploy)

---

## ✅ Deployment Completed (June 3, 2026)

Deployment checklist - all items complete:

- [x] Application builds successfully (`npm run build`)
- [x] All pages render correctly in production
- [x] Supabase credentials configured in Vercel
- [x] All scenario pages showing correct resource counts
- [x] Interactive features tested (upvote, report, search, filter)
- [x] Responsive design verified on mobile
- [x] Deployed to Vercel with GitHub integration
- [x] Environment variables set in Vercel dashboard
- [x] Fixed production JavaScript module errors
- [x] Created resource_reports table in Supabase
- [x] Verified all features working in production
- [ ] Custom domain purchased (optional)
- [ ] Analytics configured (optional)

---

## Option 1: Deploy via Vercel Dashboard (Recommended for First Deploy)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended) or email
3. Complete account setup

### Step 2: Import Project

1. Click "Add New Project" in Vercel dashboard
2. Import Git Repository:
   - If code is on GitHub: Select repository
   - If code is local: Follow "Deploy without Git" instructions

### Step 3: Configure Project

**Framework Preset:** Astro
**Root Directory:** `./` (leave default)
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `dist` (auto-detected)
**Install Command:** `npm install` (auto-detected)

### Step 4: Set Environment Variables

Click "Environment Variables" and add:

```
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy "Project URL" → Use as `PUBLIC_SUPABASE_URL`
4. Copy "anon public" key → Use as `PUBLIC_SUPABASE_ANON_KEY`

### Step 5: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes for build to complete
3. Vercel will provide a URL: `https://your-project.vercel.app`

### Step 6: Verify Deployment

Visit your deployed URL and test:

- [x] Homepage loads with all 78 resources
- [x] Click a scenario page → Resources display correctly
- [x] Search works → Type "Bloomberg" → Results filter
- [x] Upvote works → Click pine tree → Count increments
- [x] Report works → Click flag → Dropdown opens
- [x] Mobile responsive → Resize browser window

---

## Option 2: Deploy via Vercel CLI (For Quick Iterations)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

**From project root:**

```bash
# Deploy to preview (for testing)
vercel

# Deploy to production
vercel --prod
```

**First time deploying?** Vercel will ask:

```
? Set up and deploy "~/freestuff-dartmouth-v2"? [Y/n] Y
? Which scope do you want to deploy to? [Your Username]
? Link to existing project? [y/N] N
? What's your project's name? freestuff-dartmouth
? In which directory is your code located? ./
```

### Step 4: Set Environment Variables (CLI)

```bash
# Add environment variables
vercel env add PUBLIC_SUPABASE_URL production
# Paste your Supabase URL when prompted

vercel env add PUBLIC_SUPABASE_ANON_KEY production
# Paste your Supabase anon key when prompted
```

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

---

## Option 3: Deploy via GitHub Integration (For Continuous Deployment)

### Step 1: Push Code to GitHub

```bash
# Create new repository on GitHub (if not already done)
git remote add origin https://github.com/yourusername/freestuff-dartmouth.git

# Push code
git add .
git commit -m "Ready for deployment"
git push -u origin main
```

### Step 2: Connect Repository to Vercel

1. Go to Vercel dashboard
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Click "Import"

### Step 3: Configure Build Settings

Vercel will auto-detect Astro settings. Verify:

- **Framework Preset:** Astro
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 4: Add Environment Variables

Same as Option 1, Step 4 above.

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Vercel will provide a production URL

### Step 6: Enable Continuous Deployment

Now, every time you push to `main` branch:
- Vercel will automatically build and deploy
- Preview deployments created for pull requests

---

## Custom Domain Setup (Optional)

### Option A: Use Vercel Subdomain

Vercel provides a free subdomain:
```
https://freestuff-dartmouth.vercel.app
```

No setup required, works immediately after deployment.

### Option B: Use Custom Domain

If you want `freestuff.dartmouth.edu`:

**Step 1: Purchase Domain**
- Contact Dartmouth IT to register subdomain
- OR purchase domain from Namecheap, Google Domains, etc.

**Step 2: Add Domain in Vercel**

```bash
# Via CLI
vercel domains add freestuff.dartmouth.edu

# Via Dashboard
# Project Settings → Domains → Add Domain
```

**Step 3: Update DNS Records**

Add these DNS records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Step 4: Wait for DNS Propagation**
- Usually takes 5-60 minutes
- Vercel will automatically issue SSL certificate

---

## Environment Variables Reference

### Required Variables

```bash
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables (Future)

```bash
# Analytics
PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags
PUBLIC_ENABLE_SUBMISSIONS=true
PUBLIC_ENABLE_COMMENTS=false

# Admin Contact
PUBLIC_ADMIN_EMAIL=admin@dartmouth.edu
```

---

## Deployment Verification Steps

After deployment, run through this checklist:

### Critical Path Testing

1. **Homepage**
   - [ ] Loads without errors
   - [ ] Displays all 78 resources
   - [ ] Total value shows $58,753
   - [ ] Hidden gems section visible
   - [ ] Scenario cards clickable

2. **Scenario Pages**
   - [ ] Grad School: 9 resources
   - [ ] Job Hunt: 7 resources
   - [ ] Data Analysis: 11 resources
   - [ ] Creative: 8 resources
   - [ ] Adventure: 5 resources
   - [ ] Save Money: 12 resources

3. **Search & Filter**
   - [ ] Search bar responds to input
   - [ ] Category filter works
   - [ ] Eligibility filter works
   - [ ] Sort options change order
   - [ ] Clear filters button resets

4. **Interactive Features**
   - [ ] Upvote button increments count
   - [ ] Upvote state persists on refresh
   - [ ] Report button opens dropdown
   - [ ] Report submission shows success message
   - [ ] Visit links open in new tab

5. **Mobile Responsive**
   - [ ] Homepage readable on phone
   - [ ] Navigation works on mobile
   - [ ] Cards stack vertically
   - [ ] Buttons large enough to tap
   - [ ] Text readable without zooming

6. **Database Connectivity**
   - [ ] Resources load from Supabase (not static JSON)
   - [ ] Upvotes save to database
   - [ ] Reports save to database
   - [ ] Check Supabase dashboard for new entries

### Performance Testing

```bash
# Lighthouse score (aim for 90+)
npx lighthouse https://your-site.vercel.app --view

# Check build size
du -sh dist/
# Should be under 5MB

# Check JavaScript bundle size
ls -lh dist/_astro/
# Main bundle should be under 100KB gzipped
```

---

## Monitoring & Logs

### View Deployment Logs

**Via CLI:**
```bash
vercel logs
vercel logs --follow  # Live tail
```

**Via Dashboard:**
1. Go to Vercel project
2. Click "Deployments"
3. Click on specific deployment
4. View build and runtime logs

### Check for Errors

**Common errors to watch for:**

1. **Build Errors**
   - Missing dependencies → Run `npm install`
   - TypeScript errors → Run `npm run build` locally first

2. **Runtime Errors**
   - Database connection failures → Check Supabase credentials
   - CORS errors → Verify Supabase URL is PUBLIC_ prefixed
   - 404 errors → Check Vercel routing configuration

3. **Environment Variable Issues**
   - Variables not loading → Make sure they're prefixed with `PUBLIC_`
   - Wrong Supabase URL → Double-check project ID

### Set Up Alerts (Optional)

In Vercel dashboard:
1. Project Settings → Notifications
2. Enable email alerts for:
   - Failed deployments
   - High error rates
   - Budget warnings

---

## Rollback Plan

### If Deployment Breaks

**Option 1: Rollback via Vercel Dashboard**
1. Go to project in Vercel
2. Click "Deployments"
3. Find last working deployment
4. Click "..." → "Promote to Production"

**Option 2: Rollback via CLI**
```bash
vercel rollback
```

**Option 3: Redeploy Previous Commit**
```bash
git log  # Find last working commit hash
git checkout <commit-hash>
vercel --prod
```

### If Database Issues

**Restore Supabase backup:**
1. Go to Supabase dashboard
2. Database → Backups
3. Restore from automatic backup (taken daily)

**OR use static JSON fallback:**
- App automatically falls back to `resources.json` if Supabase fails
- No action needed, already built into code

---

## Post-Deployment Tasks

### Immediate (Within 24 hours)

- [ ] Test all critical paths (see checklist above)
- [ ] Monitor Vercel logs for errors
- [ ] Check Supabase dashboard for database activity
- [ ] Share URL with initial beta testers (5-10 people)

### Short-term (Within 1 week)

- [ ] Set up analytics (Vercel Analytics or Plausible)
- [ ] Create feedback collection method
- [ ] Monitor for reported issues
- [ ] Fix any critical bugs immediately

### Medium-term (Within 1 month)

- [ ] Review beta tester feedback
- [ ] Update resources based on reports
- [ ] Fix non-critical bugs
- [ ] Optimize performance based on real usage
- [ ] Plan official launch strategy

---

## Continuous Deployment Workflow

Once GitHub integration is set up:

```bash
# Make changes locally
git add .
git commit -m "Update resource descriptions"
git push origin main

# Vercel automatically:
# 1. Detects push to main
# 2. Runs build
# 3. Deploys to production
# 4. Sends notification
```

**Preview Deployments:**
```bash
# Create feature branch
git checkout -b feature/new-scenario-page

# Make changes, commit, push
git push origin feature/new-scenario-page

# Vercel creates preview deployment
# Test at: https://freestuff-dartmouth-git-feature-new-scenario-page.vercel.app

# Merge to main when ready
git checkout main
git merge feature/new-scenario-page
git push origin main
# → Deploys to production
```

---

## Troubleshooting

### Build Fails with "Module not found"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Environment Variables Not Loading

**Check:**
1. Variables are prefixed with `PUBLIC_` (required for client-side access)
2. Variables are set in Vercel project settings, not just `.env` file
3. Redeploy after adding variables: `vercel --prod`

### Resources Not Loading from Database

**Debug:**
```bash
# Test Supabase connection locally
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);
client.from('resources').select('*').then(console.log);
"
```

**Check:**
1. Supabase project is not paused (free tier pauses after 1 week inactivity)
2. Row Level Security (RLS) policies allow public read access
3. `resources` table exists and has data

### Site Slow to Load

**Optimize:**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Reduce bundle size
# - Lazy load components
# - Remove unused dependencies
# - Compress images
```

---

## Security Best Practices

### Environment Variables

- ✅ **DO:** Prefix client-side variables with `PUBLIC_`
- ✅ **DO:** Use Vercel environment variables, not `.env` in git
- ✅ **DO:** Use Supabase Row Level Security (RLS) policies
- ❌ **DON'T:** Commit `.env` file to git (already in `.gitignore`)
- ❌ **DON'T:** Use service role key on client side
- ❌ **DON'T:** Expose database credentials publicly

### Supabase Security

**Enable Row Level Security (RLS):**

```sql
-- Allow public read access to resources
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON resources FOR SELECT
TO anon
USING (is_active = true);

-- Allow public upvotes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can vote"
ON votes FOR INSERT
TO anon
WITH CHECK (true);
```

### Content Security

- ✅ Validate all external links before adding resources
- ✅ Sanitize user input in report submissions
- ✅ Use `rel="noopener noreferrer"` on external links (already implemented)
- ✅ Implement rate limiting on report submissions (future improvement)

---

## Cost Estimate

### Vercel (Hobby Plan - Free Tier)

- **Cost:** $0/month
- **Includes:**
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Preview deployments
  - Serverless functions (limited)

**Upgrade to Pro ($20/month) if:**
- Traffic exceeds 100GB/month
- Need team collaboration
- Want Vercel Analytics
- Need faster build times

### Supabase (Free Tier)

- **Cost:** $0/month
- **Includes:**
  - 500MB database storage
  - 1GB file storage
  - 2GB bandwidth/month
  - 50,000 monthly active users

**Current usage:**
- Database: ~1MB (78 resources)
- Should stay under free tier for months

**Upgrade to Pro ($25/month) if:**
- Need more than 500MB storage
- Need daily backups
- Want higher bandwidth

### Total Monthly Cost

**Current:** $0/month (both free tiers)
**If scaling:** $20-45/month (Vercel Pro + Supabase Pro)

---

## Success Criteria

### Deployment Successful If:

- [x] Build completes without errors
- [x] Site loads at public URL
- [x] All pages render correctly
- [x] Database connection working
- [x] Interactive features functional
- [x] No console errors
- [x] Responsive on mobile

### Beta Testing Successful If:

- [ ] 10+ unique visitors in first week
- [ ] 5+ upvotes across resources
- [ ] 3+ issue reports submitted
- [ ] 0 critical bugs reported
- [ ] 80%+ positive feedback

### Ready for Official Launch If:

- [ ] 100+ unique visitors
- [ ] 50+ upvotes
- [ ] 10+ resource reports
- [ ] <5% broken links
- [ ] All beta tester feedback addressed

---

## Next Steps After Deployment

1. **Share with beta testers** → Get initial feedback
2. **Monitor logs** → Watch for errors
3. **Iterate quickly** → Fix issues as they arise
4. **Gather metrics** → Track usage patterns
5. **Plan official launch** → Based on beta success

---

## Support

**Questions about deployment?**
- Vercel Docs: https://vercel.com/docs
- Astro Deployment Guide: https://docs.astro.build/en/guides/deploy/vercel/
- Supabase Docs: https://supabase.com/docs

**Need help?**
- Vercel Support: https://vercel.com/support
- Astro Discord: https://astro.build/chat
- Supabase Discord: https://discord.supabase.com

---

**Document Version:** 1.0
**Last Updated:** June 1, 2026
**Next Review:** After first deployment
