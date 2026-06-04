# Construct Design Review — Free Stuff @ Dartmouth

**Date:** 2026-06-03
**Lens:** "Is it *good to use*," not "is it correct." (For the correctness/health pass, see [construct-review.md](./construct-review.md).)
**Reviewers:** Construct, routing the Accessibility, Visual/UI Design, UX/Findability, and Product/Information-Architecture specialists.
**Method:** Each specialist read the source and the rendered `dist/` HTML; the accessibility reviewer computed real contrast ratios from the OKLCH tokens. Construct independently re-verified the highest-impact concrete claims (unused tokens, category distribution, grid markup, copy counts).

---

## 1. What this is

A static catalog of **78** free perks for Dartmouth students and alumni (Astro + an editorial design system: Newsreader serif display, OKLCH palette anchored on Dartmouth green, a 4pt spacing scale). The homepage offers search, three filter dropdowns, a dollar-value banner, six scenario cards, a "hidden gems" section, and an A–Z resource grid. The intended primary user — the lens for this review — is **a stressed freshman, on a phone, who heard "you get free Adobe / NYT / gear" and wants to find the right resource and act on it fast.**

---

## 2. What's strong

Real strengths, verified — protect these as the product evolves.

- **A genuine design system, not ad-hoc CSS.** Coherent OKLCH tokens, a real type scale, consistent 4pt spacing, and a disciplined editorial aesthetic that *can* read as a credible, curated catalog. The bones are better than most side projects.
- **Accessibility fundamentals are present.** A global `:focus-visible` ring (5.82:1, passes), `prefers-reduced-motion` respected, real `<label>`s on the filter selects, semantic landmarks (`header`/`main`/`footer`), and a clean single-`h1` heading order on each page.
- **Most colors pass contrast.** Body ink (7.02:1), muted ink (7.02:1), accent text (8.48:1), white on the green banner (~8–9.8:1), and badge text all clear AA. Only two tokens fail (below).
- **Strong content proposition and multiple ways in.** The dollar-value framing, scenario-based entry points, and eligibility pages are smart product instincts — the *idea* of "browse by your situation" is emotionally stronger than a raw taxonomy.
- **The catalog data is clean and the search/filter no-results state exists** (carried over from the health pass: no dup/malformed entries).

---

## 3. What's hurting users

Consolidated across all four specialists, grouped by theme. **[convergent]** marks issues independently raised by 2+ specialists — the highest-confidence problems. Severity is impact × likelihood for the stressed-freshman job.

### 🔴 Theme A — The interactive layer breaks for keyboard & screen-reader users

**A1. The report flow uses native `confirm()` / `prompt()` / `alert()` + an email-for-sticker gimmick.** **[convergent — Accessibility C3, Design #4, UX F6]**
`src/lib/resource-interactions.ts`. Reporting a broken link fires a native `confirm("…Want a free sticker?")` → `prompt("Drop your email here…")` → `alert(…)`. This is three problems at once: (a) **accessibility** — `prompt()`'s field has no programmatic label and is unreliable with VoiceOver/mobile SR, so the email step can be uncompletable; (b) **trust** — harvesting an email via a native `prompt()` is a textbook phishing pattern and reads as sketchy at the exact moment the user is doing you a favor; (c) **polish** — unstyled blocking dialogs are the single strongest "unfinished side-project" tell against an otherwise polished site. *Fix: submit the report silently with an inline toast; if the sticker stays, make it a separate, clearly-optional, styled in-page field with a privacy note. Remove the native dialogs.*

**A2. The report dropdown is an inaccessible custom menu.** **[convergent — Accessibility C2, Design #13]**
`ResourceCard.astro:74-94` + `resource-interactions.ts:67-96`. The trigger has no `aria-haspopup`/`aria-expanded`; the menu is a `<div style="display:none">` with no `role="menu"`, no focus move on open, **no Escape to close**, no focus trap, and DOM order doesn't match the visually-above placement (focus-order break). Screen readers never announce it opened. *Fix: `aria-haspopup`/`aria-expanded`, `role="menu"`/`menuitem`, focus management, Escape-to-close, roving arrow-key focus — or convert to a `<dialog>`.*

**A3. The search input has no accessible name.** *(Accessibility C1 — Critical)* — **verified**
`index.astro` search is `<input id="search" placeholder="Search resources…">` with no `<label>`, `aria-label`, or `aria-labelledby` (the filter selects *do* have labels; the primary discovery control does not). A screen reader announces "edit text, blank." *Fix: add a visible or visually-hidden `<label for="search">`, or at minimum `aria-label="Search resources"`.*

**A4. No live regions — every dynamic update is silent.** *(Accessibility H2 — High)*
Result count, vote count, and the form success/error message all update with no `aria-live`/`role="status"`. A blind user filtering sees no feedback that "Showing 12" changed; after submitting the form they aren't told the outcome (and the page silently redirects after 3s). *Fix: `role="status" aria-live="polite"` on the result count and form message; `role="alert"` for errors.*

**A5. No skip link.** *(Accessibility H1 — High)*
`BaseLayout.astro` opens straight into nav→main with no skip link and no `id` on `<main>`. Every keyboard/SR user tabs through all nav links, then search + 3 selects, before reaching content. *Fix: a visually-hidden-until-focused "Skip to content" as the first focusable element + `id="main"`.*

**A6. Form accessibility gaps in `submit.astro`.** *(Accessibility H3/H4 — High)*
The eligibility checkboxes aren't wrapped in a `<fieldset>`/`<legend>`, so the group label "Who's eligible?" isn't associated; required fields are signaled by a color-only green asterisk; the eligibility error writes to a shared div not tied to the field via `aria-describedby` and isn't announced. *Fix: fieldset/legend, `aria-required`, field-associated errors with `aria-invalid` + focus management, and text (not color alone) for "required."*

### 🟠 Theme B — Findability: a search-first user with a known target can dead-end

**B1. Search is exact-substring only — no typo or synonym tolerance.** *(UX F2 — Critical)*
`index.astro:757-760` does lowercase `.includes()` on name/description/category. "adboe", "photoshop" (if not in the description), "movies" (vs "Film"), "gym" (vs "Athletic/Recreation"), "coat" (vs "winter clothing") all return the bare no-results state. For a search-first user, a search that fails on a typo or the colloquial word is the difference between "they have everything" and "they don't have it" — and it fails silently. *Fix: lightweight fuzzy matching + a per-resource `aliases` field folded into the search blob; make no-results actionable ("Did you mean Adobe?").* **This is the single highest-impact UX change.**

**B2. The catalog is buried under three marketing sections.** **[convergent — Design #1, UX F1]**
`index.astro`: above the actual grid, the user scrolls past hero + search + filters → green value banner → six scenario cards → a multi-card hidden-gems block → *then* the catalog (~line 184; ~5–8 phone-screens down on mobile, where everything is single-column). The H1 promises "your complete catalog" but makes you wade through pitches to reach it. *Fix: move the grid directly under search; demote the value banner to a thin strip and scenarios to a slim "browse by situation" entry; defer hidden gems below the catalog.*

**B3. "Browse by" mixes two incompatible axes in one dropdown.** **[convergent — UX F3, IA F3]**
`index.astro:59-71` puts "Curated Collections" (themes) and "By Category" (raw taxonomy slugs) as interchangeable peers in one `<select>`. The user can't tell whether picking "Data & Analytics" then "library" composes or replaces, and must reconcile two organizing schemes in one tiny mobile control. *Fix: split into a primary Category filter and a separate Collections/"for-you" entry (chips/cards, not a dropdown option).*

**B4. The card answers "what is it" but not "how do I claim it."** *(UX F5 — High)*
`ResourceCard.astro` shows name/value/description/eligibility/Visit, but the real action ("you must *request* Adobe access," "Bloomberg is in-person only at Feldberg") is buried in the soft italic `notes`. "Visit →" is also the *quietest* element on the card and often deep-links to a generic KB article, not a claim button. The card optimizes for browsing over acting. *Fix: an explicit one-line "How to get it"; make the primary action a real, prominent button (full-width on mobile); relabel "Visit →" to "Get access →".*

**B5. No SSO/login expectation set.** *(UX F10 — Medium)*
Nearly every perk needs a Dartmouth NetID/SSO, but nothing says so; the freshman taps "Visit," hits a login wall or "not eligible," and has no framing. *Fix: a short "Most of these need your Dartmouth NetID login" note; flag request-gated items on the card.*

**B6. Outbound links give no "you're leaving" signal.** *(UX F7 — Medium)*
Title and "Visit" both `target="_blank"` to dartmouth.edu/KB URLs with no external-link affordance and no destination domain shown; broken links have no in-context recourse but the tiny report flag. *Fix: external-link icon + destination domain on the card; consider an automated link-check so "Verified" also means "link resolves."*

### 🟡 Theme C — Visual hierarchy & trust signals

**C1. Inverted hierarchy: everything is the same italic-serif-green, so nothing anchors the eye.** *(Design #2 — Medium)*
Hero, section heads, and all 78 card titles are italic Newsreader 600 with green hover and only small size steps between them — the page reads as one continuous editorial texture. *Fix: reserve italic-serif display for the H1 and section heads; set card titles upright (sans or upright serif) so the repeated unit reads as data, not headlines (also improves small-size legibility).*

**C2. The verified-date — the core trust proposition — is the weakest element on the card.** **[convergent — Design #7, UX F8]**
`ResourceCard.astro:95-97`: "Verified May 2026" at the smallest size and lowest-contrast token, buried next to upvote/report. The project's whole pitch is "always-current with a last-verified date," yet it's nearly invisible (and fails contrast — see C4). *Fix: elevate it as a deliberate cue (small green ✓, higher contrast, tooltip "link + eligibility checked").*

**C3. Trust leaks at the edges.** *(Design #4/#5/#6 — Medium)*
Emoji as primary scenario iconography (renders inconsistently, can't take the brand green, reads casual — Design #5); the "Built by Dartmouth folks / Fork this" footer with **no affiliation disclosure**, so it's simultaneously too casual to feel official and not explicit about being unofficial (Design #6); two gradient flourishes (value banner, hidden-gem glow) in an otherwise flat editorial system (Design #15). *Fix: swap emoji for the line-icon style already shipped (the pine-tree SVG); add an honest "Independent, community-maintained — not an official Dartmouth site" line (this *increases* trust); flatten the gradients.*

**C4. Two contrast failures.** *(Accessibility M2/M3 — Medium)* — **computed**
`--color-ink-subtle` (62% L) on paper = **3.44:1**, used for the verified date, "Report" label, form hints, card notes, and input placeholders — all below the 4.5:1 normal-text threshold. Input/select/textarea resting borders (`--color-border` 88% L) = **1.36:1**, below the 3:1 needed to perceive a field boundary (the accent appears only on focus/hover). *Fix: darken `ink-subtle` to ~52% L for text uses (or switch that text to `ink-muted`, which passes at 7:1); use a ≥3:1 border for the resting field state.*

### 🟢 Theme D — Information architecture: the taxonomy grew by accretion

**D1. `software` is a 31-item dumping ground (40% of the catalog).** *(IA F1 — Critical)* — **verified**
Verified counts: software 31, library 14, campus-life 11, then a long tail. The 31 "software" items mix end-user apps, statistical/data tools, IT/security plumbing (VPN, backup, CrowdStrike — several faculty/staff-only), and collaboration. The largest category is the least browsable — and the curated collections exist *because* "software" is too coarse, an implicit admission it fails. *Fix: split into Creative Tools / Data & Research Tools / Productivity / IT & Security.*

**D2. Four overlapping navigation axes slice the same 78 items.** *(IA F2 — High)*
Categories, curated collections, scenarios, and eligibility pages — where collections and scenarios are the *same content sliced by the same logic under two metaphors* ("Data & Analytics" collection ≈ "Running data analysis?" scenario, with diverging hand-curated name-match lists). Four maps of one territory isn't richness; it's maintenance debt and user confusion. *Fix: collapse collections + scenarios into one task-oriented "for-you" layer driven by resource **tags** (which also fixes fork-portability — the name-match lists silently break at any other school).*

**D3. Audience and location masquerade as topics; labels leak jargon.** *(IA F4/F5/F7 — High)*
`alumni-only` is an eligibility value dressed as a category (and contradicts the 9 items actually tagged `alumni`); `off-campus` is a location facet; `tuck` is a 1-item category whose label means nothing to a first-year and renders as raw lowercase "tuck"; `money` conflates printing credit, free coats, and thesis grants. Four singleton categories (news, tuck, transportation, off-campus) are tags pretending to be shelves. *Fix: a `CATEGORY_LABELS` display map (decouples label from slug, enables Title Case); make eligibility/location facets, not categories; merge singletons.* The IA specialist's proposed ~10-category set is in [the appendix](#appendix-b--proposed-category-set).

**D4. Stale count copy.** *(Construct — Low)* — **verified**
`README.md` still says "56 verified resources" (actual: 78). The homepage H1 is dynamic (`{resources.length}`) so it's correct; the review brief's "80" is also off. *Fix: update README.*

### ⚪ Theme E — Consistency & polish

- **E1. Defined-but-unused colored category badges.** *(Design #8)* — **verified** `tokens.css:25-32` defines seven `--color-badge-*` hues; zero references in `src/` — every badge renders flat gray, so categories are visually indistinguishable across an 80-item grid. *Wire them up for at-a-glance scanning, or delete the dead tokens.*
- **E2. Homepage grid hard-locked to 3 columns** while every sibling grid uses responsive `auto-fill minmax()`. *(Design #9)* — **verified** (`index.astro:369` vs `:457`/`:547`). Cramped cards on 769–1100px tablets/laptops. *Fix: use the same `auto-fill` pattern.*
- **E3. Inconsistent button vocabulary** (radius/weight/fill differ across submit, scenario CTAs, about; three treatments in one card footer). *(Design #10)* *Fix: two button tokens — primary filled, secondary ghost — applied everywhere.*
- **E4. Votes hydrate silently** with a visible count/state "snap" after paint; no loading affordance. *(Design #12)*
- **E5. Scenarios are featured on the homepage but absent from nav** — orphaned once you leave the homepage. *(Design #11)*
- **E6. Viewport meta lacks `initial-scale=1`.** *(Accessibility M4 / UX F12)* Doesn't disable zoom (so not a violation) but can cause inconsistent mobile scaling. *Fix: `width=device-width, initial-scale=1`.*

---

## 4. Prioritized fix list

Ordered by user impact ÷ effort. P0 = blocks or actively damages the core job; do first.

**P0 — blocking / trust-damaging, mostly small:**
1. **Replace `confirm/prompt/alert`** in the report flow with an inline styled toast + optional styled sticker field (A1). *Fixes an a11y blocker, a trust leak, and a polish tell in one change.*
2. **Give search an accessible name** (A3) and **make it forgiving** — fuzzy + aliases + actionable no-results (B1). *The two highest-impact items for the search-first user.*
3. **Make the report dropdown accessible** — aria state, focus management, Escape (A2).

**P1 — high impact, moderate effort:**
4. Add a **skip link** + **live regions** for result/vote/form updates (A4, A5).
5. **Surface the catalog** — grid under search; demote value banner + scenarios + hidden gems, especially on mobile (B2).
6. **Fix the two contrast failures** (ink-subtle text, input borders) (C4).
7. **Form a11y**: fieldset/legend, associated errors, non-color "required" (A6).
8. **Make the card answer "how do I claim it"** + promote the primary action; relabel "Visit →" (B4).
9. **Split the `software` category** and add **student-facing display labels** for the jargon slugs (D1, D3).

**P2 — meaningful polish / structural:**
10. Separate the two filter axes; reconcile collections vs scenarios into one tag-driven layer (B3, D2).
11. Elevate the verified-date trust signal; add an affiliation-disclosure line; swap emoji for line icons; flatten gradients (C2, C3).
12. Differentiate card titles from headings (C1); wire up or delete badge color tokens (E1); fix the homepage 3-col grid (E2); unify buttons (E3); add `initial-scale=1` (E6); set SSO expectations + external-link signals (B5, B6); update stale README count (D4).

---

## Appendix A — Severity summary

| ID | Finding | Severity | Specialists | Verified |
|----|---------|----------|-------------|----------|
| A1 | Native confirm/prompt/alert + email gimmick | Critical | A11y, Design, UX | code |
| A2 | Report dropdown not keyboard/SR accessible | Critical/High | A11y, Design | ✅ |
| A3 | Search input has no accessible name | Critical | A11y | ✅ |
| B1 | Search exact-substring (no typo/synonym) | Critical | UX | ✅ |
| D1 | `software` is 40% of the catalog | Critical | IA | ✅ |
| A4 | No live regions for dynamic updates | High | A11y | ✅ |
| A5 | No skip link | High | A11y | ✅ |
| A6 | Form: no fieldset, color-only required, unassociated errors | High | A11y | ✅ |
| B2 | Catalog buried under marketing sections | High | Design, UX | ✅ |
| B3 | "Browse by" mixes collections + categories | High | UX, IA | ✅ |
| B4 | Card doesn't say how to claim; weak primary action | High | UX | ✅ |
| D2 | Four overlapping navigation axes | High | IA | ✅ |
| D3 | Audience/location/jargon as categories | High | UX, IA | ✅ |
| C1–C4 | Hierarchy, weak trust signal, trust leaks, contrast | Medium | A11y, Design, UX | mixed |
| B5, B6 | No SSO expectation; no external-link signal | Medium | UX | ✅ |
| E1–E6 | Unused tokens, 3-col grid, buttons, silent hydrate, nav, viewport | Low–Med | Design, A11y, UX | ✅ |

*"Verified" = Construct re-confirmed beyond the specialist's report (✅) or grounded directly in cited code. Severities are predictive (assumed freshman behavior), not validated against real users — the UX reviewer notes the top findings would benefit from N≥5 phone-based task tests ("find and claim free Adobe").*

## Appendix B — Proposed category set

The IA specialist's consolidation (audience + location become *facets*, not categories), driven by display labels and resource tags:

| Slug | Display label | Absorbs |
|---|---|---|
| `creative-tools` | Creative Tools | Adobe, Canva, Sibelius, Hop studios |
| `data-research-tools` | Data & Research Tools | SPSS/SAS/JMP/Stata/Python/R/MATLAB/ArcGIS/WRDS/Qualtrics |
| `productivity` | Productivity & Collaboration | M365, Google, Zoom, Slack, Overleaf, Atlassian, DocuSign |
| `it-security` | IT & Security | VPN, backup, CrowdStrike, Bitwarden, FastX (consider hiding faculty/staff-only from student view) |
| `library-research` | Library & Research | JSTOR, Scopus, ProQuest, News Access, Rauner, O'Reilly, LinkedIn Learning |
| `outdoor` | Outdoor & Adventure | DOC rentals/trips/cabins, Ledyard, climbing |
| `arts-campus-life` | Arts & Campus Life | Hopkins, Hood, athletics, film, programming board |
| `funding-discounts` | Funding & Discounts | Dickey/Rockefeller grants, printing credit, winter clothing, MFA Boston, Advance Transit |
| `health` | Health & Wellness | Dick's House, counseling |
| `career` | Career | Career Design, Career Closet (+ Career Services for Life via alumni facet) |

Open questions that would change scope: (1) how large will the catalog grow — drives merge-vs-split aggressiveness; (2) are students and alumni equal-priority — determines whether the thin alumni eligibility coverage (9 of 78) is a bug or a known limit; (3) do collections *and* scenarios both ship long-term.

---

## Remediation log — 2026-06-03

The P0–P2 fix list was implemented. `npm run build` passes (12 pages); `npm test` passes (27); the rendered `dist/` was re-inspected to confirm the a11y markup and section order.

### Landed (verified in the rendered build)

| Theme / ID | What changed |
|---|---|
| **A1** native dialogs | Report flow no longer uses `confirm/prompt/alert`. Submits once, confirms via an inline `role="status"` toast region (`tokens.css` + `BaseLayout.astro`). The email-for-sticker harvest was **removed**. |
| **A2** report menu | `report-btn` now has `aria-haspopup`/`aria-expanded`/`aria-controls`; the menu is `role="menu"` with `role="menuitem"` options, toggled via `hidden`. Opening moves focus to the first item; Escape closes and returns focus; outside-click closes (`ResourceCard.astro`, `resource-interactions.ts`). |
| **A3** search name | `<label for="search" class="sr-only">` added + a search icon. |
| **A4** live regions | Result count is `role="status" aria-live="polite"`; form message likewise; vote toggles update `aria-pressed`. |
| **A5** skip link | "Skip to content" as the first focusable element + `id="main" tabindex="-1"`. |
| **A6** form a11y | Eligibility is a `<fieldset>`/`<legend>`; errors render in an associated `role="alert"` region with focus moved to the group; a "Fields marked * are required" note added. |
| **B1** search | Typo-tolerant (Levenshtein) matching over names/categories + an actionable "Did you mean …?" suggestion in the no-results state. |
| **B2** surface catalog | Resource grid now renders **directly under search/filters**; the value strip, scenarios, and hidden gems moved **below** the catalog. |
| **B3** filter axes | Split into curated-collection **chips** (one axis) and a category **select** (the other); they now compose as independent AND-filters instead of fighting in one dropdown. |
| **B4 / B6** card action | Primary action is a filled **"Get access"** button (full-width on mobile) with an external-link icon + screen-reader destination host; verified-date elevated. |
| **B5** SSO note | "Most perks need your Dartmouth NetID login" note under search. |
| **C1–C4** visual/trust | Card titles set upright; verified-date promoted with a green check at passing contrast; emoji replaced with a single-weight `ScenarioIcon` line-icon set; value banner flattened to a solid strip; **contrast fixed** — `--color-ink-subtle` 62%→50% L, new `--color-border-input` (62% L) for field boundaries; affiliation-disclosure line added to the footer. |
| **D3** IA labels | `CATEGORY_LABELS` display map (e.g. `money`→"Funding & Discounts", `tuck`→"Tuck (Business School)") used in all filters/forms; Scenarios added to the nav. |
| **E1–E6** polish | Category badges now color-tinted per category (dead tokens replaced); homepage grid uses responsive `auto-fill`; `initial-scale=1` added; stale README count 56→78. |

### Deliberately deferred (need a decision or content authoring)

- **D1 / D2 — deep IA re-categorization** (split the 31-item `software`, merge singletons, reconcile collections vs scenarios into one tag-driven axis). This re-tags all 78 resources and changes the DB `category` CHECK constraint (a migration to apply), and the right buckets depend on the open questions above. The labeling/axis-separation half is done; the data restructure is the remaining structural call.
- **B1 aliases / B4 "how to claim"** — the *mechanisms* are in (fuzzy search; prominent action; surfaced caveats; SSO note), but per-resource search aliases and accurate one-line "how to claim" steps are content authoring across 78 items — inventing them risks misdirecting students, so they're left for a content pass.
- **L2 (raw console errors)** and the live-AT verification items from the a11y audit remain as a manual screen-reader/zoom pass.
