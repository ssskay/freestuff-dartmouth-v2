# Campus Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/map` page with an interactive Leaflet map: real Hanover/Upper-Valley places as geographic pins, and all online resources anchored to the Dartmouth Green.

**Architecture:** A new `src/pages/map.astro` (following the existing `scenarios/index.astro` standalone-page pattern) reads the authored catalog from `resources.json`, shapes it into map data with a pure, unit-tested `buildMapData()` function, server-renders both an accessible text list (the no-JS baseline) and an inline JSON blob, then a lazily-initialized client script hydrates a Leaflet map from that JSON. Coordinates are authored as optional fields on each resource; resources without coordinates belong to the Green anchor.

**Tech Stack:** Astro 5, TypeScript, Leaflet (new dep), CARTO Positron tiles, Vitest, the existing `tokens.css` design system.

---

## Why the map reads `resources.json` directly (not `loadResources()`)

`loadResources()` (`src/lib/catalog.ts:99`) tries Supabase first and falls back to the JSON. The new geo fields (`lat`/`lng`/`place`) are authored **only** in `resources.json` and are not in the Supabase projection. If the map used `loadResources()`, a build that successfully reads from Supabase would produce a catalog with no coordinates — every resource would collapse onto the Green. So the map uses a new `loadStaticResources()` helper that always reads the authored JSON. This is consistent with the spec's "the map reads the static catalog" note.

## File structure

- `src/lib/catalog.ts` (modify) — add `lat`/`lng`/`place` to `StaticResource`, `Resource`, and `normalizeStaticResource`; add `loadStaticResources()`.
- `src/lib/map-data.ts` (create) — pure `buildMapData()` that groups resources into places + the Green. The one piece of real logic; fully unit-tested.
- `src/content/resources.json` (modify) — add coordinates + `place` to the physical resources.
- `src/pages/map.astro` (create) — the page: hero, server-rendered accessible list, inline JSON, Leaflet island, styles.
- `src/layouts/BaseLayout.astro` (modify) — one nav link.
- `tests/map-data.test.ts` (create) — unit tests for `buildMapData()`.
- `tests/normalize.test.ts` (modify) — assert geo fields pass through `normalizeStaticResource`.
- `tests/catalog-data.test.ts` (modify) — geo data-integrity invariants.
- `tests/routes.test.ts` (modify) — assert `/map` builds and contains expected content.
- `package.json` (modify) — add `leaflet` + `@types/leaflet`.

## Coordinate reference table (Hanover campus)

These are **best-known approximate coordinates** grouped by `place`. During Task 5's manual verification, open the map and confirm each pin sits on the right building; nudge any that are visibly off. The data-integrity test (Task 3) enforces they fall inside the Hanover bounding box, catching gross errors.

| `place` | lat | lng | resources (by `id` / name) |
|---|---|---|---|
| The Green (anchor) | 43.7045 | -72.2887 | all resources with no coordinates |
| Hopkins Center | 43.7035 | -72.2876 | Hopkins Center Performances, Cable Makerspace, Hop Woodworking Shop, Hop Ceramics Studio, Hop Music Practice Rooms & Instruments, Dartmouth Film Society Membership |
| Hood Museum of Art | 43.7037 | -72.2872 | Hood Museum of Art |
| Alumni Gym | 43.7022 | -72.2885 | Lewinstein Athletic Center (Alumni Gym), Dartmouth Climbing Gym |
| Dick's House | 43.7041 | -72.2867 | Dick's House Medical Services, Free Counseling Sessions |
| Robinson Hall (DOC) | 43.7058 | -72.2885 | Dartmouth Outdoor Rentals, DOC Trips, DOC Cabin Rentals |
| Ledyard Canoe Club | 43.7028 | -72.2931 | Ledyard Canoe Club |
| Feldberg Library | 43.7036 | -72.2899 | Bloomberg Terminal at Feldberg |
| Webster Hall (Rauner) | 43.7053 | -72.2879 | Rauner Special Collections |
| Collis Center | 43.7027 | -72.2882 | Programming Board Events |
| Athletic Facilities | 43.7008 | -72.2876 | Dartmouth Athletic Events |
| Advance Transit (Hanover) | 43.7033 | -72.2887 | Advance Transit (Free Bus) |

**Stays on the Green (no coordinates):** all `software` resources, the online library databases (JSTOR, Scopus, Web of Science, WRDS, Nexis Uni, PsycINFO, ProQuest, Statista, O'Reilly, LinkedIn Learning, Library Research Databases), Interlibrary Loan, money/career/news/alumni-only online perks, and Museum of Fine Arts Boston (an "access-anywhere" benefit, geographically off the Hanover map). The Green panel is framed as "online & access-anywhere resources," which fits these.

---

## Task 1: Geo fields in the data layer

**Files:**
- Modify: `src/lib/catalog.ts` (interfaces at lines 22-49, `normalizeStaticResource` at 55-77, add loader near 99)
- Test: `tests/normalize.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `tests/normalize.test.ts` inside the existing `describe('normalizeStaticResource', ...)` block:

```ts
  it('passes geo fields through when present', () => {
    const r = normalizeStaticResource({ ...base, lat: 43.7035, lng: -72.2876, place: 'Hopkins Center' });
    expect(r.lat).toBe(43.7035);
    expect(r.lng).toBe(-72.2876);
    expect(r.place).toBe('Hopkins Center');
  });

  it('leaves geo fields null when absent', () => {
    const r = normalizeStaticResource(base);
    expect(r.lat).toBeNull();
    expect(r.lng).toBeNull();
    expect(r.place).toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- normalize`
Expected: FAIL — `lat`/`lng`/`place` are `undefined` (not on the type, and not set by the normalizer).

- [ ] **Step 3: Add geo fields to the interfaces**

In `src/lib/catalog.ts`, extend the `Resource` interface (after line 30, before the closing brace) with:

```ts
  /** Geographic pin latitude. Null for online / access-anywhere resources. */
  lat?: number | null;
  /** Geographic pin longitude. Null for online / access-anywhere resources. */
  lng?: number | null;
  /** Building/landmark label used to group co-located resources into one pin. */
  place?: string | null;
```

And extend the `StaticResource` interface (after `hidden_gem?: boolean;` at line 48) with:

```ts
  lat?: number;
  lng?: number;
  place?: string;
```

- [ ] **Step 4: Set the fields in `normalizeStaticResource`**

In `src/lib/catalog.ts`, inside the object returned by `normalizeStaticResource` (after `hidden_gem: r.hidden_gem ?? false,` at line 75), add:

```ts
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    place: r.place ?? null,
```

- [ ] **Step 5: Add the static-only loader**

In `src/lib/catalog.ts`, after `loadResources()` (after line 110), add:

```ts
/**
 * Resolve the catalog from the authored JSON only (never Supabase). The map view
 * uses this because geo fields (lat/lng/place) are authored solely in the JSON
 * and are not part of the Supabase projection.
 */
export async function loadStaticResources(): Promise<Resource[]> {
  const staticResources = await import('../content/resources.json');
  return (staticResources.default as StaticResource[]).map(normalizeStaticResource);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- normalize`
Expected: PASS (all normalize tests, including the two new ones).

- [ ] **Step 7: Commit**

```bash
git add src/lib/catalog.ts tests/normalize.test.ts
git commit -m "Add geo fields (lat/lng/place) to the catalog data layer"
```

---

## Task 2: `buildMapData()` — the pure map-data shaper

**Files:**
- Create: `src/lib/map-data.ts`
- Test: `tests/map-data.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/map-data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildMapData } from '../src/lib/map-data';
import type { Resource } from '../src/lib/catalog';

function res(partial: Partial<Resource>): Resource {
  return {
    id: 'x', slug: 'x', name: 'X', description: '', url: 'https://e.com',
    category: 'software', eligibility: ['student'], last_verified: '2026-01-01',
    notes: null, source: null, added_at: '2026-01-01', added_by: 'human',
    upvotes: 0, is_active: true, annual_value: null, date_added: null,
    hidden_gem: false, lat: null, lng: null, place: null,
    ...partial,
  } as Resource;
}

describe('buildMapData', () => {
  it('routes resources without coordinates to the Green', () => {
    const data = buildMapData([res({ id: 'm365', name: 'Microsoft 365' })]);
    expect(data.green.map((r) => r.id)).toEqual(['m365']);
    expect(data.places).toEqual([]);
  });

  it('groups co-located resources into a single place pin', () => {
    const data = buildMapData([
      res({ id: 'hop-perf', name: 'Performances', lat: 43.7035, lng: -72.2876, place: 'Hopkins Center' }),
      res({ id: 'hop-wood', name: 'Woodworking', lat: 43.7035, lng: -72.2876, place: 'Hopkins Center' }),
    ]);
    expect(data.places).toHaveLength(1);
    expect(data.places[0].place).toBe('Hopkins Center');
    expect(data.places[0].lat).toBe(43.7035);
    expect(data.places[0].resources.map((r) => r.id)).toEqual(['hop-perf', 'hop-wood']);
  });

  it('keeps distinct places separate and excludes inactive resources', () => {
    const data = buildMapData([
      res({ id: 'gym', name: 'Gym', lat: 43.7022, lng: -72.2885, place: 'Alumni Gym' }),
      res({ id: 'hood', name: 'Hood', lat: 43.7037, lng: -72.2872, place: 'Hood Museum of Art' }),
      res({ id: 'dead', name: 'Dead', is_active: false }),
    ]);
    expect(data.places.map((p) => p.place).sort()).toEqual(['Alumni Gym', 'Hood Museum of Art']);
    expect(data.green).toEqual([]);
  });

  it('emits only the trimmed fields the map needs', () => {
    const data = buildMapData([res({ id: 'm365', name: 'Microsoft 365', annual_value: 70 })]);
    expect(data.green[0]).toEqual({ id: 'm365', name: 'Microsoft 365', category: 'software', url: 'https://e.com', annual_value: 70 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- map-data`
Expected: FAIL — `Cannot find module '../src/lib/map-data'`.

- [ ] **Step 3: Implement `buildMapData()`**

Create `src/lib/map-data.ts`:

```ts
/**
 * Shape the catalog into map data: co-located physical resources become one
 * "place" pin (grouped by the `place` label); everything without coordinates
 * belongs to the Green anchor. Pure and deterministic — unit-tested in isolation.
 */
import type { Resource } from './catalog';

/** The trimmed resource shape the map UI consumes (no description/notes/etc.). */
export interface MapResource {
  id: string;
  name: string;
  category: string;
  url: string;
  annual_value: number | null;
}

/** A grouped geographic pin: one building/landmark holding 1+ resources. */
export interface MapPlace {
  place: string;
  lat: number;
  lng: number;
  resources: MapResource[];
}

/** The full data set the map page emits: physical places + the Green cluster. */
export interface MapData {
  places: MapPlace[];
  green: MapResource[];
}

function trim(r: Resource): MapResource {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    url: r.url,
    annual_value: r.annual_value ?? null,
  };
}

export function buildMapData(resources: Resource[]): MapData {
  const byPlace = new Map<string, MapPlace>();
  const green: MapResource[] = [];

  for (const r of resources) {
    if (r.is_active === false) continue;
    const hasCoords = typeof r.lat === 'number' && typeof r.lng === 'number';
    if (hasCoords && r.place) {
      let pin = byPlace.get(r.place);
      if (!pin) {
        pin = { place: r.place, lat: r.lat as number, lng: r.lng as number, resources: [] };
        byPlace.set(r.place, pin);
      }
      pin.resources.push(trim(r));
    } else {
      green.push(trim(r));
    }
  }

  return { places: [...byPlace.values()], green };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- map-data`
Expected: PASS (all four cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/map-data.ts tests/map-data.test.ts
git commit -m "Add buildMapData(): group catalog into place pins + Green anchor"
```

---

## Task 3: Author coordinates into `resources.json`

**Files:**
- Modify: `src/content/resources.json`
- Test: `tests/catalog-data.test.ts`

- [ ] **Step 1: Write the failing data-integrity test**

Add a new `describe` block to the end of `tests/catalog-data.test.ts` (before the file's final closing if any; it can be a top-level `describe`):

```ts
// Hanover/Upper-Valley bounding box. Any pinned resource must fall inside it.
const HANOVER_BOUNDS = { minLat: 43.69, maxLat: 43.72, minLng: -72.31, maxLng: -72.27 };

describe('resources.json map invariants', () => {
  it('every pinned resource has numeric lat+lng inside the Hanover box and a place', () => {
    for (const r of resources) {
      const hasLat = r.lat !== undefined;
      const hasLng = r.lng !== undefined;
      expect(hasLat, `lat/lng must be paired on ${r.id}`).toBe(hasLng);
      if (!hasLat) continue;
      expect(typeof r.lat, `lat type on ${r.id}`).toBe('number');
      expect(typeof r.lng, `lng type on ${r.id}`).toBe('number');
      expect(r.lat, `lat range on ${r.id}`).toBeGreaterThanOrEqual(HANOVER_BOUNDS.minLat);
      expect(r.lat, `lat range on ${r.id}`).toBeLessThanOrEqual(HANOVER_BOUNDS.maxLat);
      expect(r.lng, `lng range on ${r.id}`).toBeGreaterThanOrEqual(HANOVER_BOUNDS.minLng);
      expect(r.lng, `lng range on ${r.id}`).toBeLessThanOrEqual(HANOVER_BOUNDS.maxLng);
      expect(r.place, `place required on pinned ${r.id}`).toBeTruthy();
    }
  });

  it('each place label maps to exactly one coordinate', () => {
    const coordsByPlace = new Map<string, string>();
    for (const r of resources) {
      if (r.place === undefined || r.lat === undefined) continue;
      const key = `${r.lat},${r.lng}`;
      const seen = coordsByPlace.get(r.place);
      if (seen === undefined) coordsByPlace.set(r.place, key);
      else expect(seen, `place "${r.place}" has conflicting coords on ${r.id}`).toBe(key);
    }
  });

  it('has at least 10 pinned resources (the map is not empty)', () => {
    expect(resources.filter((r) => r.lat !== undefined).length).toBeGreaterThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- catalog-data`
Expected: FAIL on "at least 10 pinned resources" — no resource has coordinates yet.

- [ ] **Step 3: Add `lat`/`lng`/`place` to the physical resources**

Edit `src/content/resources.json`. For each resource listed in the coordinate table, add the three fields. Match resources by their existing `name`. Use these exact values (find each object by name and add the fields alongside its existing keys):

```
Hopkins Center Performances            → "lat": 43.7035, "lng": -72.2876, "place": "Hopkins Center"
Cable Makerspace (3D Printing & Laser Cutting) → "lat": 43.7035, "lng": -72.2876, "place": "Hopkins Center"
Hopkins Center Woodworking Shop        → "lat": 43.7035, "lng": -72.2876, "place": "Hopkins Center"
Hopkins Center Ceramics Studio         → "lat": 43.7035, "lng": -72.2876, "place": "Hopkins Center"
Hop Music Practice Rooms & Instruments → "lat": 43.7035, "lng": -72.2876, "place": "Hopkins Center"
Dartmouth Film Society Membership      → "lat": 43.7035, "lng": -72.2876, "place": "Hopkins Center"
Hood Museum of Art                     → "lat": 43.7037, "lng": -72.2872, "place": "Hood Museum of Art"
Lewinstein Athletic Center (Alumni Gym)→ "lat": 43.7022, "lng": -72.2885, "place": "Alumni Gym"
Dartmouth Climbing Gym                 → "lat": 43.7022, "lng": -72.2885, "place": "Alumni Gym"
Dick's House Medical Services          → "lat": 43.7041, "lng": -72.2867, "place": "Dick's House"
Free Counseling Sessions               → "lat": 43.7041, "lng": -72.2867, "place": "Dick's House"
Dartmouth Outdoor Rentals              → "lat": 43.7058, "lng": -72.2885, "place": "Robinson Hall (DOC)"
DOC Trips                              → "lat": 43.7058, "lng": -72.2885, "place": "Robinson Hall (DOC)"
DOC Cabin Rentals                      → "lat": 43.7058, "lng": -72.2885, "place": "Robinson Hall (DOC)"
Ledyard Canoe Club                     → "lat": 43.7028, "lng": -72.2931, "place": "Ledyard Canoe Club"
Bloomberg Terminal at Feldberg         → "lat": 43.7036, "lng": -72.2899, "place": "Feldberg Library"
Rauner Special Collections             → "lat": 43.7053, "lng": -72.2879, "place": "Webster Hall (Rauner)"
Programming Board Events               → "lat": 43.7027, "lng": -72.2882, "place": "Collis Center"
Dartmouth Athletic Events              → "lat": 43.7008, "lng": -72.2876, "place": "Athletic Facilities"
Advance Transit (Free Bus)             → "lat": 43.7033, "lng": -72.2887, "place": "Advance Transit (Hanover)"
```

Example — the `Hood Museum of Art` object becomes (only the three new keys added; keep all existing keys):

```json
{
  "id": "hood-museum",
  "name": "Hood Museum of Art",
  "category": "campus-life",
  "...": "all existing keys unchanged",
  "lat": 43.7037,
  "lng": -72.2872,
  "place": "Hood Museum of Art"
}
```

Do not add coordinates to any resource not in the list above (they belong on the Green).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- catalog-data`
Expected: PASS — all map invariants green, including "at least 10 pinned resources" (20 pinned).

Also confirm the JSON is still valid:
Run: `node -e "console.log(JSON.parse(require('fs').readFileSync('src/content/resources.json','utf8')).length)"`
Expected: prints `78`.

- [ ] **Step 5: Commit**

```bash
git add src/content/resources.json tests/catalog-data.test.ts
git commit -m "Author Hanover coordinates for physical resources + map invariants"
```

---

## Task 4: The `/map` page — server render + accessible baseline (no Leaflet yet)

**Files:**
- Create: `src/pages/map.astro`
- Modify: `src/layouts/BaseLayout.astro:37-39` (nav)
- Test: `tests/routes.test.ts`

- [ ] **Step 1: Add the nav link**

In `src/layouts/BaseLayout.astro`, inside `.nav-links` (after the Scenarios link at line 37), add:

```html
            <a href="/map" class="nav-link">Map</a>
```

- [ ] **Step 2: Write the page (server render + accessible list + inline JSON)**

Create `src/pages/map.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { loadStaticResources } from '../lib/catalog';
import { buildMapData } from '../lib/map-data';
import { categoryLabel } from '../site.config';

const resources = await loadStaticResources();
const mapData = buildMapData(resources);

// Group the Green's resources by category for the readable text list.
const greenByCategory = [...new Set(mapData.green.map((r) => r.category))]
  .sort()
  .map((cat) => ({
    label: categoryLabel(cat),
    resources: mapData.green.filter((r) => r.category === cat),
  }));
---

<BaseLayout
  title="Map | Free Stuff @ Dartmouth"
  description="The campus is your backyard. An interactive map of free and affordable things to do around Dartmouth — and everything you can access from the Green."
>
  <div class="map-page">
    <div class="map-hero">
      <h1 class="page-title">The campus is your backyard</h1>
      <p class="page-deck">
        Free movies, makerspaces, museums, gyms, the river, the free bus — and from a bench
        on the Green, every online resource Dartmouth gives you. Get out there.
      </p>
    </div>

    <div class="map-layout">
      <!-- Leaflet mounts here; hidden from assistive tech, which uses the list below. -->
      <div id="map" class="map-canvas" role="presentation" aria-hidden="true"></div>

      <!-- Detail panel populated by the client script on pin click. -->
      <aside id="map-panel" class="map-panel" aria-live="polite" hidden></aside>
    </div>

    <!-- Accessible, no-JS baseline: every place and the full Green set, as real links. -->
    <section class="map-list" aria-label="All places on the map">
      <h2 class="map-list-title">Places on campus</h2>
      <ul class="place-list">
        {mapData.places.map((p) => (
          <li class="place-item">
            <button type="button" class="place-button" data-place={p.place}>{p.place}</button>
            <ul class="place-resources">
              {p.resources.map((r) => (
                <li><a href={r.url} class="resource-link">{r.name}</a></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h2 class="map-list-title">From the Green — online &amp; access-anywhere</h2>
      <p class="green-blurb">
        Grab the free campus WiFi, sit on the grass, and from right here you have all of this:
      </p>
      {greenByCategory.map((g) => (
        <div class="green-group">
          <h3 class="green-group-title">{g.label}</h3>
          <ul class="place-resources">
            {g.resources.map((r) => (
              <li><a href={r.url} class="resource-link">{r.name}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </section>

    <div class="cta-section">
      <p class="cta-text">Want the full searchable list?</p>
      <a href="/" class="cta-button">Browse all 78 resources</a>
    </div>
  </div>

  <!-- Map data for the client island. -->
  <script is:inline type="application/json" id="map-data" set:html={JSON.stringify(mapData)}></script>

  <style>
    .map-page { max-width: 90rem; margin: 0 auto; padding: var(--space-3xl) var(--space-lg) var(--space-2xl); }
    .map-hero { max-width: var(--measure); margin: 0 auto var(--space-2xl); text-align: center; }
    .page-title { font-family: var(--font-display); font-style: italic; font-size: var(--text-display); font-weight: 600; line-height: var(--leading-tight); color: var(--color-ink); margin: 0 0 var(--space-md) 0; }
    .page-deck { font-size: var(--text-lg); line-height: var(--leading-relaxed); color: var(--color-ink-muted); margin: 0; }
    .map-layout { position: relative; }
    .map-canvas { width: 100%; height: 32rem; border-radius: var(--radius-lg, 12px); background: var(--color-surface, #f5f5f2); margin-bottom: var(--space-2xl); }
    .map-panel { position: absolute; top: var(--space-md); right: var(--space-md); width: min(22rem, 90%); max-height: calc(32rem - 2 * var(--space-md)); overflow-y: auto; background: var(--color-bg, #fff); border: 1px solid var(--color-border, #e5e5e0); border-radius: var(--radius-lg, 12px); padding: var(--space-lg); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
    .map-list { max-width: var(--measure); margin: 0 auto; }
    .map-list-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-ink); margin: var(--space-2xl) 0 var(--space-md); }
    .place-list { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-lg); }
    .place-button { font: inherit; font-weight: 600; color: var(--color-ink); background: none; border: none; padding: 0; cursor: pointer; text-align: left; }
    .place-button:hover { text-decoration: underline; }
    .place-resources { margin: var(--space-xs) 0 0; padding-left: var(--space-lg); }
    .resource-link { color: var(--color-link, #1a5); }
    .green-blurb { color: var(--color-ink-muted); margin: 0 0 var(--space-md); }
    .green-group-title { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-ink-muted); margin: var(--space-md) 0 var(--space-xs); }
    @media (max-width: 768px) {
      .map-canvas { height: 24rem; }
      .map-panel { position: static; width: 100%; max-height: none; margin-bottom: var(--space-lg); }
    }
  </style>
</BaseLayout>
```

> Note: if a referenced design token (e.g. `--radius-lg`, `--color-link`) is not defined in `public/tokens.css`, the CSS fallbacks after the comma apply. Confirm token names during Task 6 and replace fallbacks with the real tokens where they exist.

- [ ] **Step 3: Write the route test**

Add to `tests/routes.test.ts` (match the file's existing style — it tests built output under `dist/`). Append a test that the map page builds with its hero and data blob. If the existing file already builds the site once and asserts on `dist/**/*.html`, follow that exact pattern; the assertion to add is:

```ts
  it('builds /map with the hero and inline map data', () => {
    const html = readFileSync(join(distDir, 'map/index.html'), 'utf-8');
    expect(html).toContain('The campus is your backyard');
    expect(html).toContain('id="map-data"');
    expect(html).toContain('Hopkins Center');
  });
```

(Use the same `distDir`/`readFileSync` helpers already defined at the top of `tests/routes.test.ts`. Read the file first to reuse its setup rather than redefining it.)

- [ ] **Step 4: Build and run the route test**

Run: `npm run build && npm test -- routes`
Expected: PASS — `dist/map/index.html` exists and contains the hero, the JSON blob, and "Hopkins Center".

- [ ] **Step 5: Commit**

```bash
git add src/pages/map.astro src/layouts/BaseLayout.astro tests/routes.test.ts
git commit -m "Add /map page: server-rendered accessible baseline + nav link"
```

---

## Task 5: The Leaflet island — pins, Green anchor, detail panel

**Files:**
- Modify: `package.json` (deps), `src/pages/map.astro` (add the client script)

- [ ] **Step 1: Add Leaflet**

Run:

```bash
npm install leaflet@^1.9.4 && npm install -D @types/leaflet@^1.9.12
```

Expected: `leaflet` in `dependencies`, `@types/leaflet` in `devDependencies`.

- [ ] **Step 2: Add the client island to `map.astro`**

In `src/pages/map.astro`, immediately after the JSON `<script ... id="map-data">` line, add this module script. It is NOT `is:inline` — Astro bundles it and tree-shakes Leaflet, and it only loads on `/map`:

```astro
<script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  type MapResource = { id: string; name: string; category: string; url: string; annual_value: number | null };
  type MapPlace = { place: string; lat: number; lng: number; resources: MapResource[] };
  type MapData = { places: MapPlace[]; green: MapResource[] };

  const GREEN: [number, number] = [43.7045, -72.2887];

  function readData(): MapData | null {
    const el = document.getElementById('map-data');
    if (!el?.textContent) return null;
    try { return JSON.parse(el.textContent) as MapData; } catch { return null; }
  }

  function cardHtml(r: MapResource): string {
    const value = r.annual_value && r.annual_value > 0 ? `<span class="pc-value">~$${r.annual_value}/yr</span>` : '';
    return `<li class="pc-item">
      <a class="pc-link" href="${r.url}" target="_blank" rel="noopener">${r.name}</a>
      ${value}
    </li>`;
  }

  function renderPanel(title: string, lead: string, resources: MapResource[]): void {
    const panel = document.getElementById('map-panel');
    if (!panel) return;
    panel.innerHTML = `
      <button type="button" class="pc-close" aria-label="Close">&times;</button>
      <h2 class="pc-title">${title}</h2>
      ${lead ? `<p class="pc-lead">${lead}</p>` : ''}
      <ul class="pc-list">${resources.map(cardHtml).join('')}</ul>`;
    panel.hidden = false;
    panel.querySelector<HTMLButtonElement>('.pc-close')?.addEventListener('click', () => { panel.hidden = true; });
    panel.querySelector<HTMLElement>('.pc-title')?.focus?.();
  }

  function init(): void {
    const data = readData();
    const el = document.getElementById('map');
    if (!data || !el) return;

    const map = L.map(el, { scrollWheelZoom: false }).setView(GREEN, 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const placeIcon = L.divIcon({ className: 'pin pin-place', html: '<span></span>', iconSize: [18, 18] });
    const greenIcon = L.divIcon({ className: 'pin pin-green', html: '<span>WiFi</span>', iconSize: [44, 44] });

    for (const p of data.places) {
      L.marker([p.lat, p.lng], { icon: placeIcon, keyboard: true, title: p.place, alt: p.place })
        .addTo(map)
        .on('click keypress', () => renderPanel(p.place, '', p.resources));
    }

    L.marker(GREEN, { icon: greenIcon, keyboard: true, title: 'The Green', alt: 'The Dartmouth Green' })
      .addTo(map)
      .on('click keypress', () =>
        renderPanel(
          'From the Green',
          'Grab the free campus WiFi, sit on the grass, and from right here you have access to all of this.',
          data.green,
        ),
      );

    // Wire the accessible text-list buttons to open the same panel + pan the map.
    document.querySelectorAll<HTMLButtonElement>('.place-button').forEach((btn) => {
      const place = data.places.find((p) => p.place === btn.dataset.place);
      if (!place) return;
      btn.addEventListener('click', () => {
        map.setView([place.lat, place.lng], 16);
        renderPanel(place.place, '', place.resources);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
</script>
```

- [ ] **Step 3: Add pin + panel-card styles**

In `src/pages/map.astro`'s `<style>` block, append:

```css
    :global(.pin-place span) { display: block; width: 14px; height: 14px; border-radius: 50%; background: var(--color-link, #1a5); border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
    :global(.pin-green) { display: grid; place-items: center; }
    :global(.pin-green span) { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--color-accent, #2e7d32); color: #fff; font-size: 11px; font-weight: 700; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.35); }
    .pc-close { float: right; font-size: 1.5rem; line-height: 1; background: none; border: none; cursor: pointer; color: var(--color-ink-muted); }
    .pc-title { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-ink); margin: 0 0 var(--space-xs); }
    .pc-lead { color: var(--color-ink-muted); font-size: var(--text-sm); margin: 0 0 var(--space-md); }
    .pc-list { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-sm); }
    .pc-item { display: flex; justify-content: space-between; gap: var(--space-sm); align-items: baseline; }
    .pc-link { color: var(--color-link, #1a5); font-weight: 600; }
    .pc-value { color: var(--color-ink-muted); font-size: var(--text-sm); white-space: nowrap; }
```

- [ ] **Step 4: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: no type errors; build succeeds and bundles the Leaflet island only into the `/map` chunk.

- [ ] **Step 5: Manual verification (the part tests can't cover)**

Run: `npm run preview` and open the printed URL at `/map`. Confirm:
- The map renders centered on campus with the CARTO light basemap.
- ~11 small place pins plus one larger "WiFi" Green pin appear, roughly over the right buildings. **Nudge any coordinate in `resources.json` that is visibly off the building**, then re-run `npm test -- catalog-data` to keep invariants green.
- Clicking a place pin opens the panel listing that building's resources; clicking the Green pin shows the framing line + the full online set.
- Tab key reaches the pins and the text-list "place" buttons; Enter opens the panel; the panel close button works.
- Resize to mobile width: the panel drops below the map (static), nothing overflows.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/pages/map.astro
git commit -m "Add Leaflet island: place pins, Green anchor, detail panel"
```

---

## Task 6: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: PASS — all suites (normalize, map-data, catalog-data, routes, collections).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: succeeds; `dist/map/index.html` present.

- [ ] **Step 4: Token audit**

Open `public/tokens.css` and confirm the tokens used in `map.astro` exist (`--color-link`, `--color-accent`, `--radius-lg`, `--color-border`, `--color-surface`, `--color-bg`). For any that don't, replace the CSS fallback usage with an existing token of the same role. Re-run `npm run build`.

- [ ] **Step 5: Update project context**

Note the new `/map` page in `.cx/context.md` under Recent Decisions (one line), and confirm the nav shows six links without breaking the mobile row.

- [ ] **Step 6: Final commit (if Step 4 changed anything)**

```bash
git add -A
git commit -m "Finalize campus map: token audit + context update"
```

---

## Self-review notes (author)

- **Spec coverage:** page/placement → Task 4; data model (`lat`/`lng`/`place`) → Tasks 1, 3; Green anchor → Tasks 2, 4, 5; side panel → Task 5; geocoding + CARTO tiles + lazy Leaflet → Tasks 3, 5; accessibility text-list baseline → Task 4 + keyboard wiring in Task 5; data-integrity + build/typecheck tests → Tasks 2, 3, 4, 6. All spec sections map to a task.
- **Type consistency:** `MapResource`/`MapPlace`/`MapData` are defined once in `src/lib/map-data.ts` (Task 2) and re-declared structurally in the client script (Task 5) because Astro client scripts can't import server type-only symbols across the island boundary cleanly; the shapes match field-for-field. `buildMapData` / `loadStaticResources` / `normalizeStaticResource` names are used consistently across tasks.
- **Known nuance to verify, not a blocker:** coordinates are approximate and get a manual nudge pass in Task 5 Step 5; the bounding-box test prevents gross errors but not building-level precision.
