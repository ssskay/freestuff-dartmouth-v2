# Free Stuff @ Dartmouth — Architecture

## Design principles

1. Static-first. No database, no backend, no auth. The whole site is files in a git repo. This is cheaper, faster, and dramatically more reliable than anything with moving parts.
2. Git as the audit log. Every change to the catalog is a commit. Every agent-discovered addition is a PR. The history of the site IS the history of the catalog.
3. JSON as the source of truth. A single resources.json file holds all entries. The frontend reads from it at build time. The agents edit it via PR.
4. The agent doesn't deploy. Agents propose changes; humans merge. This keeps a wrong autoflag from breaking the site.
5. Fork-friendly. The architecture should make it trivial for Brown or Williams or Bowdoin alumni to copy the repo, swap the source URLs, and have their own version.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Site framework | Astro | Static-first, fast, content-collection support, low ceremony |
| Styling | Tailwind | Already in muscle memory, easy to theme later (Dartmouth green dark mode) |
| Content store | src/content/resources.json | One file, one schema, version-controlled |
| Hosting | Vercel (or Netlify) | Free tier, deploys from GitHub on push |
| Agent runtime | GitHub Actions on cron | Free for public repos, runs anywhere, PRs are the output |
| Agent language | Python (3.11+) | Anthropic SDK ergonomics, easy regex/parsing |
| AI model | Claude Sonnet 4.5 via API | Default for all agent reasoning |

## Data model

Single file: src/content/resources.json. Array of entries with this schema:

- id (slug)
- name
- category (software, news, library, outdoor, money, health, career, campus-life, alumni-only, tuck)
- description (1-2 sentences max)
- link (the perk URL)
- eligibility (array: student, alumni, faculty, staff, both, any-edu-email)
- source (where the agent or human found this perk)
- last_verified (YYYY-MM-DD)
- status (active, needs_verification, broken, removed)
- notes (optional caveats)
- added_at (YYYY-MM-DD)
- added_by (agent or human)

## Repository structurefreestuff-dartmouth-v2/
├── src/
│   ├── content/resources.json    # source of truth
│   ├── pages/                    # Astro pages
│   ├── components/               # ResourceCard, FilterBar, SearchBox
│   └── layouts/
├── agents/
│   ├── verify.py
│   ├── discover.py
│   ├── draft_entry.py
│   ├── shared/                   # claude client, io, logging
│   └── pending/                  # draft entries awaiting review
├── .github/workflows/
│   ├── verify.yml                # weekly cron
│   ├── discover.yml              # monthly cron
│   └── deploy.yml                # on push to main
└── public/

## The review loop

Agent runs on cron → opens a PR with proposed changes → human reviews PR → merges or closes → on merge, Vercel rebuilds → site updates.

The PR review is the only human-in-the-loop step. Everything else is automatic.

## Things explicitly out of scope for v1

- User accounts
- Submissions form (spam risk too high without moderation infrastructure)
- Notification system
- Comparison with other schools
- Mobile app
- Analytics beyond Vercel's built-in
