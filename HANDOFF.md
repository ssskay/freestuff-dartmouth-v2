# Free Stuff @ Dartmouth - Project Handoff Documentation

**Last Updated:** June 1, 2026
**Version:** 2.0
**Status:** Production-Ready (Pending Deployment)

---

## Project Overview

Free Stuff @ Dartmouth is a curated directory of free and discounted resources available to the Dartmouth community. The site helps students, alumni, faculty, and staff discover the $58,753+ worth of resources they're already paying for but might not know about.

**Live Site:** TBD (Pending deployment)
**Tech Stack:** Astro 5.18.2, Supabase (PostgreSQL), Vercel (deployment target)

---

## Current System State

### Overall Health: 🟢 GREEN - Production Ready

All core functionality is working correctly:
- ✅ Database connectivity with Supabase (78 active resources)
- ✅ All 11 pages rendering correctly
- ✅ Interactive features operational (upvote, report, search, filtering)
- ✅ Responsive design polished
- ✅ Build process successful (2.1s build time)

### What Works

**Pages (11 total):**
- Homepage with full resource directory (78 resources)
- 6 scenario-based landing pages (grad-school, job-hunt, data-analysis, creative, adventure, save-money)
- 4 static pages (about, for-students, for-alumni, submit)

**Core Features:**
- Real-time search across resources
- Category and eligibility filtering
- Multiple sort options (name, popular, value, recent)
- Upvote system with browser fingerprinting
- Issue reporting with optional email collection
- Responsive 3-column grid (mobile: 1-column)

**Database Integration:**
- Supabase PostgreSQL for resource storage
- Real-time upvote tracking
- Issue report collection
- Fallback to static JSON if database unavailable

---

## Architecture

### Directory Structure

```
freestuff-dartmouth-v2/
├── src/
│   ├── pages/
│   │   ├── index.astro                    # Homepage with full directory
│   │   ├── about.astro                    # About the project
│   │   ├── for-students.astro             # Student resources info
│   │   ├── for-alumni.astro               # Alumni resources info
│   │   ├── submit.astro                   # Submit new resource form
│   │   └── scenarios/
│   │       ├── grad-school.astro          # Grad school scenario (9 resources)
│   │       ├── job-hunt.astro             # Job hunting scenario (7 resources)
│   │       ├── data-analysis.astro        # Data analysis scenario (11 resources)
│   │       ├── creative.astro             # Creative work scenario (8 resources)
│   │       ├── adventure.astro            # Outdoor adventure scenario (5 resources)
│   │       └── save-money.astro           # Budget-conscious scenario (12 resources)
│   ├── components/
│   │   └── ResourceCard.astro             # Reusable resource card component
│   ├── layouts/
│   │   └── BaseLayout.astro               # Main layout wrapper
│   ├── lib/
│   │   ├── supabase.ts                    # Supabase client & helper functions
│   │   ├── fingerprint.ts                 # Browser fingerprinting for votes
│   │   └── database.types.ts              # TypeScript types for database
│   └── content/
│       ├── resources.json                 # Static fallback resource data
│       └── resources-verified.json        # Verified resource backup
├── public/
│   └── tokens.css                         # Design system tokens (Hallmark)
├── scripts/
│   └── seed-supabase.js                   # Database seeding script
├── .env                                   # Environment variables (not in git)
└── vercel.json                            # Vercel deployment config
```

### Data Flow

1. **Page Load:** Astro SSG pre-renders pages at build time
2. **Data Fetch:** `getAllResources()` queries Supabase, falls back to static JSON
3. **Filtering:** Client-side JavaScript filters resources by scenario/category/eligibility
4. **Interactions:** Browser fingerprinting tracks votes, submits reports to Supabase
5. **State Persistence:** localStorage saves user vote state

### Database Schema

**Supabase Tables:**

```sql
-- resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  eligibility TEXT[] NOT NULL,
  last_verified TIMESTAMP,
  status TEXT DEFAULT 'active',
  notes TEXT,
  upvotes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  added_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(resource_id, fingerprint)
);

-- resource_reports table
CREATE TABLE resource_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id),
  issue_type TEXT NOT NULL,
  details TEXT,
  email TEXT,
  reported_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- Database functions
CREATE OR REPLACE FUNCTION upvote_resource(p_resource_id UUID, p_fingerprint TEXT)
RETURNS TABLE(upvotes INTEGER, success BOOLEAN);

CREATE OR REPLACE FUNCTION remove_upvote(p_resource_id UUID, p_fingerprint TEXT)
RETURNS TABLE(upvotes INTEGER, success BOOLEAN);
```

---

## Recent Work Completed

### Session Date: June 1, 2026

**Major Issues Resolved:**

1. **UUID vs ID Filtering Bug (CRITICAL FIX)**
   - **Problem:** Scenario pages only showing 2 resources instead of expected 7-12
   - **Root Cause:** Supabase converts human-readable IDs to UUIDs during seeding, breaking `r.id?.includes()` filters
   - **Solution:** Changed all scenario page filters from ID-based to name-based matching
   - **Files Modified:** All 6 scenario pages in `src/pages/scenarios/`
   - **Impact:** Job-hunt page now shows 7 resources (was 2), all scenarios working correctly

2. **UI/UX Improvements**
   - Changed report icon from star to flag (better semantic meaning)
   - Fixed visit link overflow issue (added `flex-shrink: 0`)
   - Changed grid from 4 columns to 3 columns per row
   - Fixed upvote button functionality on scenario pages (added missing JavaScript)

3. **Content Updates**
   - Updated homepage scenario descriptions to match reality (removed references to non-existent resources)
   - Expanded job-hunt page to include Bloomberg Terminal, news subscriptions, technical skills, printing
   - Verified all scenario page resource lists align with benefits mentioned

**Commits to Make:**
```bash
# Changes ready for commit:
- All scenario page filter updates (6 files)
- ResourceCard.astro icon and styling fixes
- Homepage grid and description updates
```

---

## Known Issues & Limitations

### TypeScript Warnings (Non-blocking)

**Severity:** Low - Build succeeds, no runtime impact

**Issues:**
- Missing type declaration for `ws` module
- Some Supabase database types need regeneration
- `resource_reports` table type not fully defined

**Fix (Optional):**
```bash
npm install --save-dev @types/ws
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

### Missing Optional Fields

The database schema doesn't include:
- `hidden_gem` (boolean)
- `annual_value` (number)
- `date_added` (timestamp)

**Current Workaround:** These fields exist in static JSON fallback, app reads them correctly

**Future Fix:** Add columns to Supabase `resources` table if you want to manage these in the database

---

## Environment Setup

### Prerequisites

- Node.js 18+ (currently using v18.x)
- npm or pnpm
- Supabase account with project set up
- Vercel account (for deployment)

### Environment Variables

Create `.env` file in root:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Security Note:** Never commit `.env` to git (already in `.gitignore`)

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:4321

# Build for production
npm run build

# Preview production build
npm run preview

# Seed database (one-time setup)
node scripts/seed-supabase.js
```

---

## Deployment Checklist

### Pre-Deployment Tasks

- [x] Fix UUID filtering bug (completed June 1)
- [x] Verify all pages load correctly
- [x] Test interactive features (upvote, report, search)
- [x] Run build successfully (`npm run build`)
- [x] Verify responsive design on mobile
- [ ] Test with real Dartmouth community members (beta testing)
- [ ] Set up analytics (optional)
- [ ] Configure custom domain (if desired)

### Vercel Deployment Steps

**Option 1: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Option 2: Deploy via Git Integration**

1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Set environment variables in Vercel project settings:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automatically on push to main branch

**Option 3: Manual Deploy (Quick Start)**

```bash
# Build static files
npm run build

# Upload dist/ folder to Vercel
vercel --prod ./dist
```

### Post-Deployment Verification

After deployment, test these critical paths:

1. **Homepage loads** → All 78 resources display
2. **Scenario pages load** → Each shows correct resource count
3. **Search works** → Type "Bloomberg" → Results filter
4. **Upvote works** → Click pine tree → Count increments
5. **Report works** → Click flag → Dropdown opens → Submit
6. **Mobile responsive** → Test on phone screen
7. **Database connectivity** → Resources load from Supabase (not fallback JSON)

### Rollback Plan

If deployment fails:

```bash
# Revert to previous Vercel deployment
vercel rollback

# OR rebuild from last known good commit
git revert HEAD
npm run build
vercel --prod
```

---

## Beta Testing Plan

### Goals

1. Validate resource accuracy (are the descriptions/links correct?)
2. Discover missing resources (what did we forget?)
3. Test user flow (can people find what they need?)
4. Gather feedback on design/UX

### Recommended Beta Testers

**Target Audiences:**
- Current students (undergrad and grad)
- Recent alumni (0-5 years out)
- Faculty/staff who advise students
- DOC officers, library staff, career counselors

**Sample Size:** 10-20 people across different user types

### Feedback Collection

**Create feedback channels:**

1. **In-app reporting** (already built)
   - Users can flag incorrect info via "Report" button
   - Email collection incentivized with sticker offer

2. **Feedback form** (add to `/submit` page)
   - What resources are missing?
   - What's confusing?
   - What works well?

3. **Usage analytics** (optional)
   - Vercel Analytics (free tier available)
   - Track: page views, popular resources, search queries

### Key Metrics to Track

- **Most upvoted resources** → What's genuinely useful?
- **Most reported resources** → What needs fixing?
- **Scenario page traffic** → Which use cases resonate?
- **Search queries** → What are people looking for?
- **Bounce rate** → Are people finding value?

---

## What's Next

### Immediate (Week 1)

**Priority: Get Beta Testers Using the Site**

1. **Deploy to Vercel**
   - [ ] Set up Vercel project
   - [ ] Configure environment variables
   - [ ] Deploy from main branch
   - [ ] Verify all features work in production
   - **Time estimate:** 1-2 hours

2. **Share with Initial Beta Testers**
   - [ ] Recruit 5-10 initial testers
   - [ ] Share URL: `freestuff-dartmouth.vercel.app` (or custom domain)
   - [ ] Ask for feedback within 1 week
   - **Time estimate:** 30 minutes

3. **Monitor for Critical Issues**
   - [ ] Check Vercel logs for errors
   - [ ] Watch for report submissions
   - [ ] Quick fixes if anything breaks
   - **Time estimate:** 30 min/day for first week

### Short-term (Weeks 2-4)

**Priority: Iterate Based on Beta Feedback**

1. **Content Updates**
   - [ ] Add missing resources based on feedback
   - [ ] Fix incorrect links/descriptions
   - [ ] Update resource descriptions for clarity
   - [ ] Add more scenario pages if needed

2. **Feature Improvements**
   - [ ] Analytics integration (Vercel Analytics or Plausible)
   - [ ] Add "suggest a resource" form to `/submit` page
   - [ ] Email notifications for new resources (optional)
   - [ ] Admin dashboard for managing reports (optional)

3. **SEO & Discovery**
   - [ ] Add meta descriptions to all pages
   - [ ] Submit sitemap to Google
   - [ ] Share on Dartmouth subreddit, class pages, Facebook groups
   - [ ] Reach out to Dartmouth IT/library for official endorsement

### Medium-term (Months 2-3)

**Priority: Scale to Full Dartmouth Community**

1. **Official Launch**
   - [ ] Announce via Dartmouth email lists
   - [ ] Partner with campus organizations (DOC, Library, Career Services)
   - [ ] Get featured in The Dartmouth (student newspaper)
   - [ ] Present at student org meetings

2. **Content Expansion**
   - [ ] Add 20-30 more resources (aiming for 100+ total)
   - [ ] Create more scenario pages (internship hunting, thesis writing, etc.)
   - [ ] Add resource categories (housing, food, transportation?)
   - [ ] Highlight seasonal resources (tax prep, winter gear lending)

3. **Community Features**
   - [ ] User-submitted resources (with moderation)
   - [ ] Comments or reviews on resources
   - [ ] "Share this resource" social buttons
   - [ ] Newsletter signup for new resource alerts

### Long-term (Months 4-6+)

**Priority: Sustainability & Growth**

1. **Expand to Other Schools**
   - Template the codebase for other universities
   - "Free Stuff @ [Your School]" as a franchise
   - Open-source the project for other students to fork

2. **Monetization (Optional)**
   - Partner with Dartmouth for official support/hosting
   - Sponsored resources from vendors
   - Consultation services for other schools

3. **Advanced Features**
   - Mobile app (React Native wrapper)
   - Browser extension (quick search from any page)
   - API for third-party integrations
   - AI-powered resource recommendations

---

## Critical Deployment Commands

### Quick Reference

```bash
# BEFORE DEPLOYMENT
npm run build              # Verify build works
npm run preview            # Test production build locally

# DEPLOY TO VERCEL
vercel --prod              # Deploy to production
vercel domains add freestuff.dartmouth.edu  # Optional: custom domain

# POST-DEPLOYMENT
vercel logs                # View production logs
vercel inspect             # Check deployment details

# EMERGENCY ROLLBACK
vercel rollback            # Revert to previous version
```

### Environment Variables (Vercel Dashboard)

Navigate to: Project Settings → Environment Variables

Add:
- `PUBLIC_SUPABASE_URL` → Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` → Your Supabase anon key

---

## Support & Maintenance

### Regular Maintenance Tasks

**Monthly:**
- [ ] Verify all resource links still work (manual spot-check)
- [ ] Update `last_verified` dates for checked resources
- [ ] Review and resolve reported issues
- [ ] Check for new resources to add

**Quarterly:**
- [ ] Update annual values if pricing changes
- [ ] Archive outdated resources
- [ ] Survey users for feedback
- [ ] Review analytics and adjust content accordingly

**Annually:**
- [ ] Full resource audit (check every single link)
- [ ] Update eligibility criteria if policies change
- [ ] Refresh content and descriptions
- [ ] Consider feature additions based on user requests

### Who to Contact

**Technical Issues:**
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Astro Discord: https://astro.build/chat

**Resource Questions:**
- Dartmouth Library: library@dartmouth.edu
- Dartmouth IT: help@dartmouth.edu
- Student Life: student.life@dartmouth.edu

---

## Success Metrics

**Define success for beta testing:**

1. **Usage Metrics**
   - Goal: 100+ unique visitors in first month
   - Goal: 50+ upvotes across all resources
   - Goal: 10+ resource reports submitted

2. **Feedback Quality**
   - Goal: 5+ new resource suggestions
   - Goal: 80%+ positive feedback from beta testers
   - Goal: <5 critical bugs reported

3. **Content Accuracy**
   - Goal: <10% of resources need corrections
   - Goal: All category pages have 5+ resources
   - Goal: 90%+ of links work correctly

**Measure these after 2-4 weeks of beta testing before full launch.**

---

## Repository & Documentation

**GitHub Repository:** TBD (recommend creating public repo)

**Additional Documentation:**
- `README.md` - Quick start guide for developers
- `HANDOFF.md` - This document
- `CHANGELOG.md` - Track version history
- `CONTRIBUTING.md` - Guidelines for contributors (if open-sourcing)

---

## Questions for Next Session

1. **Domain:** Do you want to register `freestuff.dartmouth.edu` or use `freestuff-dartmouth.vercel.app`?
2. **Beta Testers:** Do you have specific people in mind, or should we crowdsource?
3. **Analytics:** Do you want to track user behavior (privacy-friendly options available)?
4. **Open Source:** Should this be a public GitHub repo for other schools to use?
5. **Monetization:** Is this a passion project or do you want to explore sustainability funding?

---

## Final Notes

**Current Status:** All systems green. Ready for deployment.

**Biggest Win:** Fixed the UUID filtering bug that was preventing scenario pages from showing resources. All 6 scenario pages now work correctly.

**Biggest Risk:** Resource accuracy. Make sure beta testers validate that links/descriptions are correct and resources are actually available as claimed.

**Next Immediate Action:** Deploy to Vercel and get the first 5 beta testers using it by end of week.

---

**Document Version:** 1.0
**Last Updated:** June 1, 2026
**Author:** Claude (with Sara Kay)
**Next Review Date:** After beta testing (2-4 weeks)
