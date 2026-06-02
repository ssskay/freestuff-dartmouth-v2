# Changelog

All notable changes to Free Stuff @ Dartmouth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### To Deploy
- Vercel production deployment
- Beta testing with 10-20 users
- Analytics integration

---

## [2.0.0] - 2026-06-01

### Major Changes

#### Fixed
- **CRITICAL:** Fixed UUID filtering bug affecting all scenario pages
  - Changed from `r.id?.includes(kw)` to `r.name.includes('Keyword')`
  - Job-hunt page now shows 7 resources (was 2)
  - All scenario pages now display correct resource counts
  - Files: `src/pages/scenarios/*.astro` (all 6 scenario pages)

#### Changed
- Updated ResourceCard report icon from star to flag for better semantic meaning
- Changed resource grid from 4 columns to 3 columns per row (better visual balance)
- Fixed visit link overflow issue with `flex-shrink: 0` styling
- Updated homepage scenario descriptions to match actual available resources
- Expanded job-hunt page to include Bloomberg Terminal, news subscriptions, technical skills, printing credit

#### Added
- Comprehensive JavaScript for upvote/report functionality on all scenario pages
- Better error handling in Supabase client
- Fallback to static JSON if database unavailable

### Scenario Pages

All scenario pages now working correctly with name-based filtering:

| Page | Resources | Categories Included |
|------|-----------|-------------------|
| Grad School | 9 | JSTOR, ProQuest, Interlibrary Loan, O'Reilly, Counseling, Web of Science, Scopus, Rauner, Overleaf |
| Job Hunt | 7 | Career services, Bloomberg Terminal, news subscriptions, Python, MATLAB, printing |
| Data Analysis | 11 | Bloomberg, MATLAB, SPSS, SAS, JMP, WRDS, Qualtrics, Statista, Python, Jupyter, RStudio, Mathematica |
| Creative | 8 | Adobe Creative Cloud, Canva, Hopkins Center, Hood Museum, woodworking, ceramics |
| Adventure | 5 | DOC resources, Ledyard Canoe Club, outdoor gear, climbing |
| Save Money | 12 | Printing, clothing, news, gym, athletic events, Hopkins, film, programming board |

### Technical Details

**Database:**
- 78 active resources in Supabase
- Total annual value: $58,753
- UUID-based primary keys (human-readable IDs converted during seeding)

**Build:**
- Astro 5.18.2
- Build time: 2.1 seconds
- 11 pages generated successfully

**Performance:**
- Page load: <1 second for static pages
- JavaScript bundle: ~210KB (55KB gzipped)
- All interactive features operational

---

## [1.0.0] - 2026-05-XX

### Initial Release

#### Added
- Homepage with full resource directory (78 resources)
- 6 scenario-based landing pages
- 4 static informational pages (about, for-students, for-alumni, submit)
- Resource filtering by category and eligibility
- Search functionality across all resource fields
- Sort options (name, popular, value, recent)
- Upvote system with browser fingerprinting
- Issue reporting with dropdown menu (5 issue types)
- Responsive design (mobile-first approach)
- Supabase integration for data storage
- Hidden gems section highlighting lesser-known resources
- Value banner showing total annual value ($58,753)

#### Components
- `ResourceCard.astro` - Reusable resource card with upvote/report
- `BaseLayout.astro` - Main layout wrapper with navigation and footer

#### Database
- Supabase PostgreSQL backend
- Tables: resources, votes, resource_reports
- Database functions: `upvote_resource()`, `remove_upvote()`

#### Design System
- Hallmark Catalogue macrostructure
- OKLCH color palette with Dartmouth green accent
- Newsreader display font, system sans body font
- Responsive grid layout (3-column desktop, 1-column mobile)
- Custom design tokens in `public/tokens.css`

---

## Version History

### [2.0.0] - 2026-06-01
- **Status:** Production-ready, pending deployment
- **Key Change:** UUID filtering fix for scenario pages
- **Health:** 🟢 GREEN - All systems operational

### [1.0.0] - 2026-05-XX
- **Status:** Initial development complete
- **Key Features:** Full resource directory, scenario pages, Supabase integration
- **Health:** 🟡 YELLOW - UUID filtering bug affecting scenario pages

---

## Upgrade Notes

### Migrating from 1.0.0 to 2.0.0

**Breaking Changes:**
- None (internal filtering logic updated only)

**Database Changes:**
- None required

**Code Changes:**
- All scenario page filters now use name-based matching
- No action required for existing deployments

**Required Actions:**
1. Pull latest code from repository
2. Rebuild: `npm run build`
3. Redeploy to production

---

## Known Issues

### TypeScript Warnings (Non-blocking)
- Missing type declaration for `ws` module
- Some Supabase types need regeneration
- Fix: `npm install --save-dev @types/ws`

### Missing Database Fields
- `hidden_gem`, `annual_value`, `date_added` not in Supabase schema
- Currently using static JSON fallback for these fields
- No runtime impact, data displays correctly

---

## Future Roadmap

### v2.1.0 (Planned)
- Analytics integration (Vercel Analytics or Plausible)
- User-submitted resources form
- Admin dashboard for managing reports
- SEO improvements (meta descriptions, sitemap)

### v2.2.0 (Planned)
- Email notifications for new resources
- Newsletter signup
- Social sharing buttons
- Comments/reviews on resources

### v3.0.0 (Vision)
- Mobile app (React Native)
- Browser extension
- API for third-party integrations
- Multi-school support (template for other universities)

---

**Maintained by:** Sara Kay
**Contact:** TBD
**Repository:** TBD
**License:** TBD
