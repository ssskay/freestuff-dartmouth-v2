# Campus Map — Design Spec

**Date:** 2026-06-04
**Status:** Approved (design); pending implementation plan
**Inspiration:** [nyc.gov/summer](https://www.nyc.gov/content/summer/pages/) — "the city is your backyard. Get out there."

## Goal

Add an interactive map view to Free Stuff @ Dartmouth that turns the catalog into a
"get out there" experience: real campus/Upper Valley places as geographic pins, and
all the online resources anchored to the Dartmouth Green as a single "grab the free
WiFi, sit outside, and from here you have access to all of this" spot.

## Why the Green anchor

The NYC map works because nearly everything on it is a physical place you travel to.
The Dartmouth dataset is the opposite: of 78 resources, ~45 are digital/online
(Microsoft 365, JSTOR, LinkedIn Learning, research databases) with no location.
Rather than exclude them, they cluster on the Green — a narrative device that keeps
everything on the map and reinforces the "enjoy the outdoors, the resources come with
you" message. The remaining ~25–30 are genuine physical places (the Hop, Hood Museum,
climbing gym, Alumni Gym, Cable Makerspace, Outdoor Rentals, Dick's House, Bloomberg
Terminal at Feldberg, the free Advance Transit bus, DOC cabins) and get real pins.

## Placement decision

A **dedicated `/map` page** (not a homepage toggle, not a map-first hero). Rationale:

- The homepage (`src/pages/index.astro`, ~968 lines) is a proven search/filter/grid
  machine; a view toggle would bolt two-view state management onto the page we can
  least afford to regress.
- Leaflet is the site's **first client-JS dependency** (today the site is static HTML +
  small inline vanilla scripts, zero islands). A `/map` page quarantines that ~45KB
  payload so it loads only when someone visits the map; the homepage's perf is untouched.
- `/map` matches the existing `/scenarios/*` pattern: standalone destinations that
  reframe the same catalog with their own hero and copy.
- A real URL is independently shareable, indexable, and OG-tagged — the point of the
  nyc.gov/summer framing.

Tradeoff acknowledged: a separate page gets less traffic than a homepage toggle. Cheap,
reversible mitigation if discovery lags — a "Prefer to explore by place? See the map →"
strip on the homepage later. Not in scope for v1.

## Architecture

### The page — `src/pages/map.astro`
Wrapped in `BaseLayout` with its own title, meta description, and OG image. Structure
mirrors `scenarios/index.astro`:
- **Hero**: "The campus is your backyard. Get out there." + one line of copy.
- **The map**: Leaflet, real Hanover geography.
- **Back-to-catalog CTA**: "Browse all 78 resources →" linking to `/`.
- Resource data emitted server-side as inline JSON (the pattern the homepage already
  uses), not fetched client-side. Use `loadResources()` on the server.

### Nav
One link added to `.nav-links` in `BaseLayout.astro` (`Map`). Check the 768px mobile
row wrap with the added link; no structural nav change expected.

## Data model

Add three optional fields to records in `src/content/resources.json`, and mirror them
in the `StaticResource` interface + `normalizeStaticResource` in `src/lib/catalog.ts`:

- `lat` (number) — latitude, physical places only.
- `lng` (number) — longitude, physical places only.
- `place` (string) — human label (e.g. `"Hopkins Center"`) used to **group resources
  that share a building** into one pin. The Hop has woodworking, ceramics, practice
  rooms, and performances → one pin, not four stacked markers.

**Classification rule the map applies:**
- Record has `lat`/`lng` → a real geographic pin, grouped by `place`.
- Record has no coordinates → belongs to the Green anchor.

Source-of-truth note: `resources.json` is the static source. If/when the Supabase
projection is updated, the same optional fields should be added there for consistency.
Not required for v1 (the map reads the static catalog).

## Components & interaction

### Pins
- One marker per physical `place` (grouped). Distinct, branded marker style.
- One special, visually-distinct **Green anchor** marker holding all digital resources.

### Detail panel (not Leaflet popups)
Clicking any pin opens a **side panel** (desktop) / **bottom sheet** (mobile) listing
that location's resources as trimmed cards (title, value badge, "Get access" link —
reusing `ResourceCard` data, not forking the component).

Rationale: the Green holds ~45 resources, which will never fit a popup balloon. A panel
handles 1 or 45 gracefully and doubles as the accessibility fallback. The Green's panel
leads with the concept copy, then lists resources grouped by category.

## Geocoding & tiles

- **Coordinates** hand-assembled for the ~25–30 fixed campus/Upper Valley landmarks.
  The Green ≈ `43.7045, -72.2887`.
- **Tiles**: CARTO Positron — clean, light, low-ink basemap, proper attribution, no API
  key, pinned. (OSM default is the fallback option but visually busier.)
- **Leaflet**: added to `package.json`, version pinned. Lazy-initialized after first
  paint (dynamic `import('leaflet')` on `DOMContentLoaded`). CSS scoped to this page.
  Container needs an explicit height in page `<style>`.

## Accessibility (non-negotiable)

A bare map silently excludes keyboard and screen-reader users. Therefore:
- Every place is **also rendered as a real text list** on the page (the panel content /
  a visible "All places" list). The map is an enhancement, not the only entry point.
- Markers are keyboard-focusable with accessible labels; the panel is focus-managed.
- Every resource remains reachable via the existing `/` catalog regardless of the map.

## Testing

- **Data-integrity check** (small node script): every physical resource has `lat`/`lng`
  within a sane Hanover bounding box; digital resources have none; every `place` group
  resolves to exactly one coordinate. Catches the most likely bug — a bad/missing pin.
- `astro check` (types) and `astro build` must pass.
- Manual verify: pins render, panel opens, the Green shows the full digital set,
  everything is keyboard-reachable.

## Files touched

- `src/pages/map.astro` (new)
- `src/layouts/BaseLayout.astro` (one nav link)
- `src/lib/catalog.ts` (optional `lat`/`lng`/`place` fields + normalize)
- `src/content/resources.json` (coordinates for physical places)
- `package.json` (add `leaflet`)
- A small data-integrity test script

## Out of scope (v1)

- Homepage promo strip for the map (add later only if discovery lags).
- Supabase projection of the new fields (static catalog is the v1 source).
- Custom-styled/branded tile layer (CARTO Positron default is enough for v1).
- Marker clustering plugins (grouping by `place` is handled in our own data layer).
