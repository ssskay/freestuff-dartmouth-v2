# Construct Review — Free Stuff @ Dartmouth v2

**Date:** 2026-06-03
**Reviewers:** Construct, routing the Architect, Code Reviewer, Security, and QA specialists
**Scope:** Full health-and-quality pass on the repository at `freestuff-dartmouth-v2`
**Method:** Each specialist read the actual source (not just docs); the highest-severity claims were independently re-verified by Construct (git history, build output, route existence, data integrity).

---

## 1. What this project is

**Free Stuff @ Dartmouth** is a public catalog of the free perks Dartmouth students and alumni already pay for but rarely use — software licenses, news subscriptions, library databases, outdoor gear, career resources. The mission is a complete, always-current list where every entry has a working link, an eligibility tag, and a "last verified" date.

**Shape of the system:**

- **Static catalog (the core).** An [Astro](https://astro.build) static site styled with Tailwind, deployed on Vercel. ~80 resources authored in `src/content/resources.json`, rendered at build time into static HTML. This part is simple and solid.
- **Dynamic engagement layer (newer).** A [Supabase](https://supabase.com) Postgres backend powering upvotes, issue reports, and public resource submissions. The browser talks to Supabase directly using the public anon key; dedup leans on a client-generated browser "fingerprint."
- **Scenario pages.** Six curated landing pages (`grad-school`, `job-hunt`, `data-analysis`, `save-money`, `creative`, `adventure`) that filter the catalog for a use-case.
- **v2 verification agent.** `agents/verify.py` is intended to re-check links and freshness on a schedule (GitHub Actions + Claude).

It's a small, focused codebase — roughly 2,900 lines across Astro components, inline client scripts, a Supabase data-access module, and a handful of seed/migration scripts. The stated long-term goal is to be **fork-friendly for other schools.**

---

## 2. What's solid

These are real strengths, verified during the pass — worth protecting as the project changes.

- **The architecture fits the problem.** Static catalog + thin dynamic engagement layer is the right split for a low-traffic public directory. Astro/Supabase/Vercel is a sensible, cheap, low-ops stack.
- **Catalog data quality is genuinely good.** A programmatic scan of all 78 entries found **zero duplicate IDs, zero duplicate URLs, zero malformed URLs, and no missing required fields** (`link`, `eligibility`, `last_verified` all present). This is better than typical for a hand-maintained catalog.
- **No secrets leaked.** The Supabase `service_role` key lives only in the gitignored `.env` and server-side scripts — **never** shipped to the browser bundle and **not** in git history (verified: `git log --all -S "sb_secret_"` is empty, `.env` is untracked). Only the public anon key reaches the client, which is correct for this stack.
- **XSS surface is small.** All resource data renders through Astro's auto-escaping `{...}` interpolation; there are **zero** `set:html`/`innerHTML` sinks in `src/`. Stored submissions only reach the public site after manual moderation and a rebuild.
- **The build is healthy.** `npm run build` succeeds, producing 11 pages in ~2s. The empty-results / no-results search state works correctly.
- **Reasonable error swallowing on reads.** When Supabase is unavailable, pages fall back to the static JSON catalog, so the content never goes blank.

---

## 3. What's risky

Findings are consolidated across all four specialists and ordered by severity. Items flagged by more than one specialist are marked **[convergent]** — these are the highest-confidence problems.

### 🔴 Critical — fix before relying on the engagement features

**C1. Permissive Row-Level Security: the anon key can flood, tamper, and read private data** *(Security)* **[convergent — also raised by Architect]**
RLS is enabled but the policies are uniformly `USING (true)` / `WITH CHECK (true)` (`supabase/schema.sql:144-172`, `supabase/add-reports-table.sql:24-36`). Because the anon key ships in the static bundle, anyone can hit the Supabase API directly — bypassing the UI entirely — to:
- **Forge/flood votes** with unlimited fabricated fingerprints (the `unique_vote` constraint only blocks reuse of an *identical* fingerprint, which costs nothing to vary).
- **Delete any vote row** for any user — the votes `DELETE` policy is `USING (true)`, not scoped to the caller, despite the comment claiming "their own."
- **Read the entire moderation queue**, including collected reporter/submitter **email addresses** (`pending_resources` and `resource_reports` both allow public `SELECT`). This is a PII exposure of `dartmouth.edu` addresses.
- **Spam** submissions and reports with no rate limiting or CAPTCHA.

*Fix:* Remove client `DELETE` on votes (route un-voting through the existing `remove_upvote` `SECURITY DEFINER` function and `REVOKE` table-level delete); restrict `SELECT` on `pending_resources`/`resource_reports` to the service role only (admin reads happen server-side); add server-side rate limiting (Supabase Edge Function or Vercel serverless) since RLS cannot rate-limit.

**C2. Broken identity contract: slug IDs in JSON vs. random UUIDs in the database** *(Architect)* **[convergent — also raised by Code Reviewer & QA]**
`resources.json` uses human slugs (`"id": "microsoft-365"`); the Postgres PK is `uuid DEFAULT gen_random_uuid()` and the seed script **discards** any non-UUID id (`scripts/seed-supabase.js:84-87`). So the same logical resource has two different identities depending on whether data comes from JSON or Supabase. Consequences observed:
- The homepage curated-collection filter keys on `r.id.includes('claude'|'github'|…)` (`index.astro:42`) — this **never matches** against production UUIDs, so curated collections silently degrade. An inline comment in the code already concedes this.
- Upvotes/reports key on `resource_id`; votes recorded under one ID space are meaningless in the other.
- This is the *same class* of bug as the already-shipped "Fix UUID filtering bug" commit — the root cause was never fully resolved.

*Fix:* Add a stable `slug text UNIQUE NOT NULL` column; use slug as the cross-system join key and the value in `data-resource-id`; keep UUID as internal PK; upsert on slug.

### 🟠 High — fix soon; these cause user-visible breakage or block maintenance

**H1. `/scenarios` is a guaranteed 404 from every scenario page** *(QA)* — **verified**
All six scenario pages link `<a href="/scenarios">See other scenarios →</a>`, but no `scenarios/index.astro` exists and no `dist/scenarios/index.html` is built. Confirmed: the directory has six pages and no hub. Every visitor who clicks "See other scenarios" from the most-engaged pages hits a dead link.
*Fix:* Add a `scenarios/index.astro` hub page, or repoint the link to `/`.

**H2. Report flow double-inserts a row on the "sticker" path** *(Code Reviewer)* **[convergent — also raised by QA]**
`index.astro:981-998` (duplicated in all scenario pages): a successful report inserts one row, then if the user opts in for a sticker it calls `reportIssue` *again* with the email — producing **two** `resource_reports` rows per action, the first missing the email. Every sticker-opting user inflates report counts 2×.
*Fix:* Collect the email first and insert once, or update the existing row instead of inserting a second.

**H3. Source-of-truth ambiguity: three catalog files, only one is read** *(Architect)* **[convergent — also raised by Code Reviewer & QA]**
`resources.json` (live, 78 entries), `resources-verified.json` (orphan, 9 entries, old schema, **zero code references**), and `resources.json.backup` (**not even a valid array** — verified, it's an object, so it's useless as a backup). Plus Supabase as a fourth representation. Nothing declares which is canonical; someone will eventually edit the wrong one.
*Fix:* Declare `resources.json` the authored source of record, make Supabase a one-directional projection via the seed script, and delete the orphan + broken-backup files (git history is the backup).

**H4. Schema drift: the live DB schema isn't in `schema.sql`** *(Architect)*
Columns the app depends on (`annual_value`, `date_added`, `hidden_gem`) and the entire `resource_reports` table exist only in ad-hoc files (`add-value-and-date-columns.sql`, `add-reports-table.sql`), not in the canonical `schema.sql`. A fresh deploy running only `schema.sql` produces a database the app **cannot use**. There's also script duplication: `add-reports-table.js` and `create-reports-table.js` both create the reports table, and `fix-upvote-functions.sql` is a now-redundant re-paste.
*Fix:* Consolidate into one authoritative `schema.sql` (fine at this scale) or adopt ordered Supabase migrations; delete the redundant one-offs.

**H5. ~140 lines of upvote/report client JS copy-pasted across 7 pages** *(Code Reviewer)* **[convergent — also raised by Architect & QA]**
The upvote + report handlers in `index.astro` are near-verbatim in all six scenario pages (only the import depth differs). The same is true of the ~20-line Supabase-fetch-with-JSON-fallback block (9 copies) and the `link`→`url` field mapper. **The H2 double-submit bug already exists in all 7 copies** — every client-side bug must now be fixed seven times.
*Fix:* Extract a single `src/lib/resource-interactions.ts` (interactions) and `getResourcesForView()` / `normalizeStaticResource()` (data access), imported everywhere.

**H6. Zero automated tests** *(QA)* **[convergent — also raised by Code Reviewer]**
No test runner in `package.json`, no `*.test.*`/`*.spec.*` files. The two "test" scripts (`test-supabase.js`, `scripts/test-reports.js`) make **no assertions**, never exit non-zero on failure, hit the **production** database, and reference a hardcoded UUID that doesn't exist in the catalog. The exact logic where bugs cluster — curated-group filter, search/sort, `transformResource` — has no coverage.
*Fix:* Add Vitest + a node data-integrity check in CI. See §5 for the first five tests.

### 🟡 Medium — address opportunistically

- **M1. Fork-friendliness blocked by hardcoded Dartmouth values** *(Architect)*. The category enum is a hardcoded `CHECK` constraint in SQL DDL (`schema.sql:14-18`), and scenario copy, dollar values, and curated-collection membership are hardcoded across nine `.astro` files. A fork must edit DDL + nine files + prose. *Fix:* replace the `CHECK` with a lookup table; centralize school-specific config in one `site.config.ts`. This is the highest-leverage change for the stated fork goal.
- **M2. Scenario filtering by substring name-match is fragile** *(Code Reviewer / Architect)*. Pages select resources via `r.name.includes('Bloomberg')` chains; renaming a resource silently drops it from the scenario. *Fix:* a `tags`/`scenarios text[]` column makes curation data, not code.
- **M3. `annual_value` mixed types** *(QA)*. 12 entries are `null` rather than `0`; the homepage guards it, but any unguarded `sum + r.annual_value` yields `NaN`. *Fix:* normalize to number or document `null` semantics + enforce a schema.
- **M4. Supabase failures are invisible to users** *(QA)*. On read failure all upvotes render as `0` and vote state is lost, with no banner — the page looks fully functional with frozen counts. *Fix:* surface a "live data unavailable" state.
- **M5. No input validation on submissions** *(Security / QA)*. `submit.astro` validates only that one eligibility box is checked; `name`/`url`/`description`/`notes` pass straight through with no length cap or protocol whitelist. XSS risk is low (auto-escaping), but storage abuse is open. *Fix:* client + DB `CHECK` length limits.
- **M6. Denormalized upvote counter can desync** *(Architect)*. `resources.upvotes` is a second source of truth alongside the `votes` rows; the `GREATEST(...-1,0)` clamp hides drift. *Fix:* add a reconciliation view/query and document the invariant.
- **M7. Inconsistent config guards in `supabase.ts`** *(Code Reviewer / QA)*. `getResourceById`, `hasUserVoted`, and `submitResource` skip the `isSupabaseConfigured()` check that other helpers use, so on misconfig they fire real calls at a placeholder host.

### ⚪ Low — polish

- **L1.** Fingerprinting (`fingerprint.ts`) collects device characteristics with no disclosure, yet appends `Math.random()` — so it's effectively a random localStorage ID anyway. Drop the device hashing for an honest UUID + a one-line privacy note.
- **L2.** Raw `error.message` logged to the browser console can leak schema/constraint detail to a prober.
- **L3.** Two `http://` (non-HTTPS) catalog links (`psycinfo`, `proquest`).
- **L4.** `verify.py` writes `status: needs_review`/`broken`, but the UI only renders `status === 'active'` — non-active resources are silently dropped with no surfacing.
- **L5.** Repo root is cluttered with overlapping point-in-time docs (`IMPLEMENTATION-REPORT.md`, `PHASE1-2-SUMMARY.md`, `HANDOFF.md`, etc.) that rot and compete with the README — a poor first impression for forkers.
- **L6.** Floating dependency versions; run `npm audit` and pin. (No specific CVE asserted without a lookup.)
- **L7.** Issue-type string union (`'broken-link' | …`) and category lists are duplicated as literals in 8+ places; one exported constant prevents drift.

---

## 4. What I'd tackle next (recommended sequence)

The ordering is deliberate: stop the active harm, fix the user-visible breakage, then pay down the debt that keeps regenerating bugs.

**Now (this week) — stop active harm & visible breakage:**
1. **Rotate the Supabase `service_role` key** (workstation hygiene — it sits in plaintext `.env`). *(~15 min)*
2. **Tighten RLS** (C1): remove client vote-DELETE, restrict report/queue `SELECT` to service role, lock down email exposure. *Ship-blocking for the engagement features.*
3. **Fix `/scenarios` 404** (H1) and the **report double-submit** (H2) — both small, both user-facing. *(~1 hr)*

**Next (this sprint) — fix the foundation:**
4. **Resolve identity** (C2): add a `slug` join key; make upvotes/reports/curation key on it.
5. **Declare one source of truth** (H3) and **consolidate the schema** (H4); delete orphan/backup/redundant files.
6. **De-duplicate the client JS** (H5) into shared modules — this is what stops the same bug from living in seven files.
7. **Stand up a test harness** (H6) with the five tests below.

**Later — enable the mission:**
8. **Extract school-specific config** (M1) into `site.config.ts` + a category lookup table — the real unlock for "fork-friendly for other schools."
9. Add server-side rate limiting, submission validation (M5), and a live-data-unavailable UI state (M4).

---

## 5. First five tests to write

A minimal, high-value suite — each pins a real bug found above:

1. **Catalog schema contract** (node/Vitest): every `resources.json` entry has non-empty `id`/`name`/`link`/`category`/`eligibility[]`/`last_verified`; IDs unique; `link` parses as a URL; `annual_value` is a number. *Catches M3 and future data rot. Wire into CI.*
2. **Route/internal-link existence** (build assertion): for every `href="/..."` in `src/pages`, assert a matching `dist/.../index.html` exists. *Catches H1 and any future dead link.*
3. **`reportIssue` flow** (unit, mocked Supabase): the sticker path produces **exactly one** report insert. *Pins H2.*
4. **Static→Resource mapping** (unit): a real catalog row through one shared `normalizeStaticResource()` yields a valid `Resource` (`url`, `is_active`, `upvotes`). *Pins H3/H5 and forces the dedup refactor.*
5. **`filterResources` behavior** (unit, jsdom): empty results hides the grid and shows no-results; group filter maps correctly; clear-filters resets all controls. *Locks the core search/filter flow.*

---

## Appendix — Severity summary

| ID | Finding | Severity | Specialists | Verified |
|----|---------|----------|-------------|----------|
| C1 | Permissive RLS — flood/tamper/PII read | Critical | Security, Architect | — |
| C2 | Slug vs UUID identity mismatch | Critical | Architect, Reviewer, QA | — |
| H1 | `/scenarios` 404 from every scenario page | High | QA | ✅ |
| H2 | Report flow double-inserts | High | Reviewer, QA | — |
| H3 | Three catalog files, no canonical source | High | Architect, Reviewer, QA | ✅ (backup is non-array) |
| H4 | Schema drift / migration sprawl | High | Architect | — |
| H5 | ~140 lines client JS copy-pasted ×7 | High | Reviewer, Architect, QA | — |
| H6 | Zero automated tests | High | QA, Reviewer | ✅ |
| M1–M7 | Fork-blocking config, fragile filters, validation, desync | Medium | mixed | — |
| L1–L7 | Privacy, logging, docs clutter, deps | Low | mixed | partial |
| — | Service-role key clean in git history | (positive) | Security | ✅ |

*Severity reflects impact × likelihood for a low-traffic public catalog. "Verified" means Construct independently re-confirmed the claim beyond the specialist's report.*

---

## Remediation log — 2026-06-03

All findings were addressed on branch `fix/construct-review-remediation`. Build passes (12 pages) and a new test suite passes (27 tests).

### Landed in code (no action required)

| Finding | What changed |
|---|---|
| **C2** identity | New `src/lib/catalog.ts` normalizes every resource so its `id` is the stable **slug** (JSON `id` = DB `slug`). Upvote/report RPCs now accept slug-or-uuid via a `resolve_resource_id()` resolver, so the JSON and DB representations agree and existing UUID-keyed votes still resolve. |
| **H1** `/scenarios` 404 | Added `src/pages/scenarios/index.astro` hub (cards from `site.config`). A route-existence test now fails if any internal link 404s. |
| **H2** report double-submit | Fixed once in the shared `src/lib/resource-interactions.ts` — email is collected *before* a single insert. |
| **H3** source of truth | `resources.json` declared canonical; `loadResources()` is the one fetch+fallback+normalize path. Deleted `resources-verified.json` and the broken `resources.json.backup`. |
| **H4** schema drift | `supabase/schema.sql` rewritten as the single canonical schema; loose migrations folded in and deleted (`add-reports-table.sql`, `add-value-and-date-columns.sql`, `fix-upvote-functions.sql`, and the broken `create-reports-table.js`). |
| **H5** duplication | ~140 lines of upvote/report JS extracted to `src/lib/resource-interactions.ts`, imported by all 9 pages. Data-fetch + curated/scenario filters centralized in `src/site.config.ts` + `catalog.ts`. |
| **H6** tests | Added Vitest + `tests/` (data contract, normalize/identity, route existence, collection/scenario non-emptiness). `npm test`. |
| **Curated filter bug** | Homepage now serializes slug membership and filters by it, instead of the broken category re-derivation. |
| **M2/M3/M5/M7, L1–L4, L7** | Scenario/collection rules centralized (M2); `annual_value` guarded as `number\|null` (M3); submission validation + length caps + URL check in `submitResource` (M5); config guards added (M7); fingerprint is now an honest random id, no device hashing (L1); raw DB errors no longer returned to callers (L2); two `http://` links → `https://` (L3); `needs_review` resources stay visible instead of silently dropping (L4); issue types are one shared constant (L7). |
| **L5** docs clutter | Point-in-time snapshots moved to `docs/archive/`. |

### Requires you to act (DB DDL can't be run from the tooling here)

1. **Apply the database migration** — paste `supabase/migrations/2026-06-03_security_and_slug.sql` into the Supabase SQL editor. It adds the `slug` column + backfill, tightens RLS (**C1**: removes anon vote-DELETE, closes the report/queue email exposure, routes writes through `SECURITY DEFINER` functions), and adds the `resource_vote_counts` reconciliation view (**M6**). Idempotent.
2. **Rotate the Supabase `service_role` key** (Settings → API → Reset) — workstation hygiene; it sits in plaintext `.env`. Update Vercel + local `.env`.
3. **Re-seed** so DB rows carry slugs/values: `npm run seed`.
4. **Deploy order:** apply the SQL and deploy this code together, then re-seed. Between the two there is a brief window where upvotes/reports return errors (old functions vs. new client), so do them close together.

### Deliberately not done
- **L6 dependency bumps:** `npm audit` shows moderate-only advisories (Astro server-islands — unused in static mode; esbuild dev-server — dev/test only). `npm audit fix --force` forces a breaking Astro major, so this is left as a deliberate future upgrade rather than an automatic fix.
- **M2 tags column:** scenario membership was centralized in config rather than adding a `tags[]` column to all 78 resources (which needs human curation). Noted as a future improvement.
