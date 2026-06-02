# Construct Brief: Free Stuff at Big Green — What's Next?

**Project:** Free Stuff at Big Green (freestuff-dartmouth-v2)
**Date:** May 28, 2026
**Author:** Sara Kay
**Status:** v1 feature-complete, not yet deployed

---

## What this project is

A utility site cataloging free perks available to Dartmouth students and
alumni — software licenses, library resources, gym access, NYT
subscriptions, alumni benefits, etc. Built by a Dartmouth alum. Not
official. Intentionally slightly cheeky in tone ("your friend who actually
read the fine print").

This is also a Construct validation exercise. The goal is to test whether
Construct can reason across a full real-world project — not just write code,
but help think through product strategy, data ops, and outreach alongside
the engineering work.

---

## Current state

**Tech stack:**
- Astro + TypeScript + Tailwind frontend
- Supabase backend (Postgres, REST API, auth)
- Vercel hosting (free tier, not yet deployed)
- 78 verified resources across 9 categories

**What's built and working:**
- Full resource catalog with search + filter by category and eligibility
- Color-coded category cards (ResourceCard.astro)
- Report Issue feature — users can flag broken/outdated resources, optionally
  leave email for a sticker reward
- Supabase schema: resources table, resource_reports table
- seed-supabase.js script, check-reports verification script
- REPORT-FEATURE.md documentation

**What's NOT built yet:**
- Deployed to Vercel (one-time setup remaining: run Supabase SQL migration
  for reports table, then deploy)
- No automated agents for verification or discovery
- No submission flow for users to suggest new resources
- No marketing or outreach strategy
- No admin/moderation view for reviewing reports

---

## The three problems I want help thinking through

### 1. Marketing and outreach

The site has no users yet. I want to reach Dartmouth students and alumni
who would actually benefit from this. I don't have an existing audience
there — I graduated a few years ago.

Questions I want Construct to help answer:
- What's the realistic distribution strategy for a site like this? Where do
  Dartmouth students and alumni actually hang out online?
- What's the right tone and framing for outreach that doesn't feel spammy?
- Is there a content angle that makes this more shareable (e.g. "most
  overlooked perk" posts, a newsletter, social content)?
- Should I try to get institutional buy-in from Dartmouth (alumni relations,
  libraries, student orgs) or stay independent?
- What does a realistic 90-day launch plan look like?

### 2. Data freshness and verification

I have 78 resources. Some will go stale — links die, prices change,
eligibility criteria shift. I can't manually check 78 resources every week.

I want an automated verification process, but I'm open to how it's
structured. Options I've considered:
- GitHub Actions cron job running a verify.py agent weekly
- Supabase-native scheduled function
- Manual review queue surfaced in an admin dashboard, populated by the
  report feature

The report feature (users flagging issues) is already built — that's one
input. But I need proactive checking too.

Questions I want Construct to help answer:
- What's the right architecture for a verification agent given this stack
  (Astro + Supabase + Vercel)?
- How should verified/unverified state be represented in the database and
  surfaced to users?
- Is a GitHub Actions cron the right runner, or is there a better fit?
- What does the agent actually check? (HTTP status? Page content drift?
  Something else?)

### 3. Site functionality gaps

The site works but it's v1. I want to know what would make it actually more
useful before I invest in growing the audience.

Questions I want Construct to help answer:
- What's missing from the resource card that users would want to see?
- Should there be a user submission flow (suggest a new resource)? If so,
  what does the moderation queue look like?
- Is the current search/filter sufficient or does it need improvement?
- What's the admin experience for reviewing reports and submissions?
- Any quick wins on the frontend that would meaningfully improve usability?

---

## Constraints

- Solo developer, limited time. I'm not trying to build a startup, I'm
  trying to build something useful and low-maintenance.
- $0/month target at v1. Paid tools only if clearly worth it.
- I want this deployed within the next week or two.
- Long-term goal (2+ years out): pitch to Dartmouth for institutional
  support. Keep the code clean and data portable with that in mind.

---

## What I want from Construct

Don't just give me an engineering task list. I want:

1. A prioritized view of what actually matters next across all three tracks
   (marketing, data ops, functionality) — not just the technical work
2. Honest assessment of what I should do myself vs. what Construct can help
   build
3. A realistic sequencing recommendation: what do I do before launch, what
   do I do after launch once I have real users?
4. Flag anything that looks risky or underspecified before I build it

Read the codebase before responding. Key files:
- src/content/ — resource schema and data
- src/components/ResourceCard.astro — the main UI component
- src/lib/supabase.ts — backend functions
- supabase/ — schema and migrations
- package.json — available scripts

---

*Drop this in .cx/inbox/ and address @construct in Claude Code.*
