# Handoff — Extract `freestuff-template` (multi-school engine) + build CMU

**Date:** 2026-06-06
**From:** Construct (Dartmouth session)
**Goal of next phase:** Turn the very-Dartmouth repo into a school-agnostic **template** + content "packs," with Dartmouth as pack #1 and **Carnegie Mellon as pack #2**. This is the "Track B" product from the monetization strategy: sell the agent-maintained-catalog *engine* to other schools, Dartmouth stays the clean reference implementation.

---

## CURRENT STATE

**Dartmouth site (`github.com/ssskay/freestuff-dartmouth-v2`, deploys to Vercel on push to `main`):**
- ✅ **Live and verified working end-to-end** (drove the production build via Chrome DevTools: all 15 routes 200, zero JS exceptions; homepage search filters correctly, map renders 12 pins + 10 building footprints, popups open with working links and no `$/yr`, report dropdown opens). The only "errors" in preview are `/_vercel/insights/script.js` (Vercel Analytics, loads only on Vercel) and cartocdn map tiles cancelled by the zoom reframe — both benign.
- ✅ 40 vitest tests pass; **CI now runs typecheck+test+build on every push** (`.github/workflows/ci.yml`).
- ✅ Sara considers the Dartmouth site **feature-complete** — no more features planned. The goal now is purely forkability.

**Work done this session (most recent first):**
- `b6d56f4` Make the fork seam real: wire SITE config, kill four fork traps *(the prep for templating)*
- `bfa6934` a11y + polish: map keyboard, reduced motion, honest counts/dates, nav wrap
- `1e3d01c` SEO: OG + Twitter cards, canonical, sitemap, robots, OG image
- `bfd800a` CI gate + stop the weekly verifier failing
- `c7e5646` Map: tint building footprints + mobile-first layout
- `cb1ecb6` Map: open one zoom notch tighter (desktop), fit all pins mobile
- `a6c9864` Map: real OSM coordinates + drop per-resource `$/yr` from popups

**In progress / not started:** the template extraction itself (this handoff is the kickoff).

**Blocked:** nothing. (Optional, deferred: `ANTHROPIC_API_KEY` GitHub secret to activate the weekly verifier — it now skips cleanly without the key, so it's no longer urgent.)

---

## THE FORKABILITY BOUNDARY (the core deliverable of the audit — keep this)

A Construct sub-agent audited the whole codebase. **The engine is already school-agnostic in code; the Dartmouth-ness is concentrated in data, copy, two constants, and (formerly) a dead config object.** 204 of 265 `dartmouth|hanover` string hits live in one file (`resources.json`).

### Engine — reuse as-is, DO NOT re-couple to a school
- `src/lib/map-data.ts` — `buildMapData()` is pure, generic, unit-tested. Already supports "no coords → falls to the anchor cluster," so an urban campus can have many pins and no central anchor.
- `src/lib/catalog.ts`, `src/lib/supabase.ts`, all components, the interaction/filter/search layer.

### Per-school — must change for each school
1. **Catalog content** — `src/content/resources.json` (78 resources, the source of record; every link is `*.dartmouth.edu`). The irreducible work: *knowing what's free at the school*.
2. **Map** — fully Hanover:
   - 20 of 78 resources carry `lat`/`lng` in `resources.json`.
   - `src/content/building-footprints.json` (10 real OSM building polygons, Hanover coords, ~1,110 lines).
   - Anchor constant `GREEN = [43.7033, -72.2886]` in `src/pages/map.astro` (used at ~`:91,:131,:170,:178`).
   - **Conceptual Dartmouth-ism:** "everything from a bench on the Green" — one central WiFi anchor holding all online resources. CMU is urban/multi-campus with no single "Green." This is baked into *copy*, not just coordinates — most likely thing to NOT transfer.
3. **Scenarios** — `src/pages/scenarios/*.astro` (6 pages). The `SCENARIOS` *match predicates* live in `site.config.ts`, but the hero + bullet **body copy is hardcoded inline** in each page (DOC, Ledyard, Alumni Gym, Feldberg, Hopkins, Hood, dollar figures). The homepage scenario tiles (`index.astro` ~`:165-205`) **duplicate** those blurbs with different wording.
4. **Branding** — `public/tokens.css` `--color-accent: oklch(39% 0.11 155)` (= `#00693E`); `BaseLayout` wordmark/footer/OG (NOW wired to `SITE`); `public/og.png` (static 1200×630, regenerate per school).
5. **Category taxonomy** — `CATEGORIES`/`CATEGORY_LABELS` in `site.config.ts` include `tuck` → "Tuck (Business School)" (CMU = **Tepper**). **Dual-sourced**: the same list is also a CHECK constraint in `supabase/schema.sql` — they can silently drift.
6. **Verifier agent** — `agents/verify.py` is Dartmouth-locked, not cosmetic: `:107` prompt hardcodes "for Dartmouth {eligibility}"; `:157-163` `domain_map` whitelists only `*.dartmouth.edu`, so link-recovery **silently no-ops** for other schools; `:22` `USER_AGENT = "Dartmouth-Verifier/1.0"`.
7. **Narrative copy** — `about.astro`, `for-students.astro`, `for-alumni.astro` (dense Dartmouth prose to rewrite).
8. **Per-instance plumbing** — `astro.config` site URL (now `SITE.url`), `package.json` `name`, `robots.txt` sitemap host, Supabase env vars (env-based — fine).

### Four traps FIXED this session (commit `b6d56f4`) — do NOT re-fix
- **Dead `SITE` config** → wired into BaseLayout (name/og/wordmark/footer/description) + `astro.config` (`site: SITE.url`). Added `SITE.github`.
- **Duplicate `tokens.css`** → deleted the stale root copy (only `public/tokens.css` is served).
- **Wrong fork recipe** → `about.astro` now points at `src/site.config.ts` + `--color-accent` in `public/tokens.css` (was the unused `tailwind.config.mjs`).
- **Broken `sarakay` GitHub links** → centralized through `SITE.github` (correct `ssskay`) across about/privacy/terms.

---

## RECENT DECISIONS (and why)

- **Approach C: "templatize-through-CMU"** (chosen over A=fork-and-strip-per-school and B=fully-extract-now). Rationale: we already know the boundary (above) with file:line evidence, and the engine is already clean code, so the rule-of-three "wait" no longer protects A — but the *conceptual* abstractions (map anchor model, scenario shape, taxonomy) are unproven at N=1, so don't bake them in yet (that's B's mistake). Build the template + extract the **mechanical** parts now; let **CMU (pack #2)** validate the conceptual parts.
- **Build CMU as a real second instance, not a speculative template.** Cap investment at template + 2 packs + recipes. Don't gold-plate a SaaS before demand exists.
- **Don't monetize users; monetize the engine** (see `docs/construct-monetization-strategy.md`). The "Fork this for your school" link is the top of that funnel.

---

## NEXT ACTIONS (owner: Sara + a fresh Construct session in a NEW repo)

1. **Create `freestuff-template` repo.** Structure: `engine/` (the generic `src/lib`, components, `map-data.ts`, verifier) + `school/<name>/` packs + `recipes/`.
2. **Extract the mechanical config (safe at N=1):** finish wiring theme + taxonomy; turn `public/og.png` into a generator script (render 1200×630 from name+accent — we used headless Chrome + an HTML template, see below); externalize `verify.py` school name/domains/UA into a `verify.config`; **generate the SQL category CHECK from the config** (kill the dual-source).
3. **Move Dartmouth in as pack #1** (`school/dartmouth/`: `resources.json`, footprints, scenarios-as-data, `school.config`, accent, OG inputs). Prove the template reproduces the current site.
4. **Build CMU as pack #2** — this is where the conceptual abstractions get tested. New repo, new Supabase project (run `supabase/schema.sql` + seed), new Vercel project. CMU = cardinal red branding, Pittsburgh coords, urban map (expect the Green anchor model to break — fix the *interface*, not a fork). CMU's catalog research is the long pole.
5. **Write the recipes as you do CMU** (so they're real): `recipe-map.md`, `recipe-colors.md`, `recipe-seed-content.md`, `recipe-deploy.md`.
6. **Ship CMU.** You then hold template + 2 packs + recipes = a candidate Track B product.

**Defer until CMU proves the interface:** the map anchor model (keep *optional* config), scenario copy → data shape, category taxonomy (`tuck`→`tepper`), curated collections.

### The map-building recipe (concrete — we used this for Dartmouth, reuse for CMU)
- **Building footprints:** Overpass API — `[out:json]; ( way["name"~"<Bldg1|Bldg2|...>"](<bbox>); ); out geom;` → returns polygon geometry; build a GeoJSON `FeatureCollection` keyed by the catalog's `place` label, saved **static** in `building-footprints.json` (no runtime Overpass dependency for visitors). For a library inside a larger building, use the containing building's footprint (e.g. Feldberg → Murdough Center).
- **Point coordinates:** Nominatim — `GET /search?q=<name>, <City>, <ST>&format=json&limit=1` (curl `-G --data-urlencode`). Cross-check against the Overpass building centroid.
- **Anchor:** Dartmouth used the Green centroid. For an urban campus, consider **no single anchor** (just pins) — `buildMapData` already handles it.
- **Frame:** `fitBounds(pins)` then `+1` zoom, but only keep the tighter zoom if all pins still fit (mobile self-corrects). See `src/pages/map.astro`.

### Effort (estimate, not measured)
- Template skeleton + wiring mechanical config/theme/taxonomy/OG: **~1–2 days.**
- Scenario copy → data + verifier externalization: **~1 day.**
- CMU pack #2: **~2–4 days, dominated by researching CMU's actual perks + coordinates** (irreducible under any approach).

---

## RISKS

- **Over-fitting the map to Dartmouth.** Keep the anchor model optional; `buildMapData` is already generic — resist re-coupling it.
- **Abstracting scenario/taxonomy shape against N=1.** Defer; let CMU settle the shape.
- **Two consumers is not three.** The post-CMU template is a *candidate*, not a proven product — school **#3 (a real paying customer)** is the true validation. Don't market it as finished after CMU.
- **Unvalidated demand + economics** (`docs/construct-monetization-strategy.md §5`): nobody's confirmed other schools want this or that the "~10 min/week" maintenance holds. Cap spend at template + 2 packs.
- **`astro.config.mjs` now imports `./src/site.config.ts`.** Works (verified build), but it's a real coupling — if a fork deletes/renames `site.config.ts`, the build breaks. Document it.
- **Verifier silent failure:** until `verify.py` domains are externalized, a non-Dartmouth fork's link-recovery quietly does nothing. Externalize before relying on it for CMU.

---

## DO NOT TOUCH

- **`src/lib/map-data.ts`** — generic, unit-tested; do not couple it to any one school.
- **The Dartmouth repo's `main`** — it's live/deployed. Template work happens in a **NEW repo**, not by mutating Dartmouth.
- **`supabase/schema.sql`** category constraint — only change it deliberately (ideally generate it from config).
- **`.cx/`** telemetry, and the four already-fixed traps (don't re-fix).

---

## READ FIRST (next session)

1. **This handoff.**
2. `docs/construct-monetization-strategy.md` — the Track B strategy and its open risks (Phase gates, §5).
3. `src/site.config.ts` — the now-wired config (the fork seam).
4. `src/lib/map-data.ts` — the generic engine to preserve.
5. `src/pages/map.astro` — the Hanover-specific map + `GREEN` anchor + framing logic.
6. `agents/verify.py` — the Dartmouth-locked verifier (`:22,:107,:157-163`).
7. Companion audits: `docs/construct-design-review.md`, `docs/construct-review.md`.

---

## OPENING PROMPT for the new chat (copy-paste)

> I'm starting the multi-school template extraction for Free Stuff @ Dartmouth (the "Track B" engine — sell the agent-maintained-catalog pattern to other schools; Dartmouth stays the clean reference). **Read `.cx/handoffs/2026-06-06-freestuff-template-extraction.md` first** — it has the full forkability boundary, the chosen approach (C: templatize-through-CMU), the map-building recipe, risks, and what not to touch.
>
> Goal this session: stand up a school-agnostic `freestuff-template` structure, extract the **mechanical** config now (theme, taxonomy, OG generator, externalize the verifier's school/domains, generate the SQL category CHECK from config), and move **Dartmouth in as pack #1** so the template reproduces the current site. Then we'll build **Carnegie Mellon as pack #2** (new repo + Supabase + Vercel; cardinal-red branding; Pittsburgh/urban map — expect the single-anchor "Green" model to break, and fix the interface rather than fork). **Defer** the conceptual abstractions (map anchor model, scenarios-as-data shape, `tuck`→`tepper` taxonomy) until CMU validates them. Don't re-fix the four traps already fixed in `b6d56f4`, and don't couple `src/lib/map-data.ts` to any school.
