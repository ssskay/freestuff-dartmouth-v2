# Construct Monetization Strategy — Free Stuff @ Dartmouth

**Date:** 2026-06-03
**Question:** Should this project monetize via ads, sponsorship, paid promotion to freshmen, and business partnerships — and run a marketing push to students/alumni?
**Reviewers:** Construct synthesizing **cx-business-strategist** (lead), **cx-legal-compliance**, and **cx-devil-advocate**.
**Companion docs:** [construct-review.md](./construct-review.md) (health), [construct-design-review.md](./construct-design-review.md) (UX/a11y).

> One-line answer: **Do not monetize the catalog. Fund the Dartmouth site cleanly (near-zero cost, near-zero trust tax) and build the real business by selling the agent-maintained-catalog *engine* to other institutions. Kill "paid promotion to freshmen" outright.**

---

## 1. Recommendation

All three specialists converged on the same shape, from different starting points. The recommendation is a **two-track split** plus a hard stop.

### Track A — The Dartmouth catalog stays clean (the reputation)
The catalog's only asset is that **inclusion means "real, free, verified — no agenda."** Nothing that taxes that ships. Fund the site through models that never touch the list:
- **Flat-fee patronage / underwriting** (NPR/PBS-style), shown only in a footer/"supported by" strip, never inside a card. A Dartmouth entity (a club, the library, an alumni fund) sponsoring a Dartmouth public good is on-brand and trust-additive.
- **A small institutional grant** (Dartmouth student-project / alumni-engagement funds). Institutional backing *adds* trust.
- **An optional, clearly-separated newsletter** (opt-in, off the catalog). This is the only audience asset that can later carry clean sponsorship — but it doesn't exist yet (0 subscribers) and is a Phase-2 question.

### Track B — Sell the engine, not the audience (the business)
The durable, high-ceiling business is **the agent-maintained-catalog pattern productized for other institutions** — "we'll stand up and agent-maintain a verified perks catalog for your school / alumni office / member org." The Dartmouth site is the **unmonetized reference implementation and sales asset** — valuable *because* it's untainted. The README/About "fork this for your school" framing is already the top of this funnel; today it's treated as charity.

The business-strategist and the devil's-advocate reached this **independently**: the Dartmouth ad inventory tops out at ~a few thousand dollars/year (a project subsidy, not a business), while the pattern generalizes to 4,000+ US universities and every "benefits you're not using" catalog (employee perks, union benefits, alumni associations). Comparable: UNiDAYS built a **£53M** business on the narrower, human-run version of this insight ([Finty](https://finty.com/us/business-models/unidays/)).

### The hard stop
**Kill "paid promotion to freshmen," in-catalog paid placement, affiliate links, programmatic display ads, and any freshman data/lead-gen — permanently.** These are not "aggressive monetization"; they are asset destruction with legal exposure (see §3, §4). The devil's-advocate put it exactly: *the trust-safe envelope and the profit envelope barely overlap* — every revenue stream except flat-fee patronage works by *giving the catalog an agenda*.

### Sequencing (this is the part the original plan got backwards)
The plan was "monetize **and** market now." Correct order:
1. **Fix the foundation first** (the About page currently lies; there's no privacy policy — see §3). Non-negotiable before any marketing dollar.
2. **Then market** — for free, to build an audience — via organic channels.
3. **Then, only after scale gates clear,** monetize the *audience* lightly (newsletter sponsorship).
4. **In parallel,** productize the engine (the actual revenue).

Marketing into the current state would drive thousands of skeptical students to an About page making three demonstrably false promises — the fastest way to burn the credibility you're trying to scale.

---

## 2. The trust trade-off, made explicit

This is the heart of the audit, and it is not close.

**The sharpest statement of it (cx-devil-advocate):**
> The instant a reader can't tell whether an entry is on the list because it's *good* or because someone *paid*, the "Verified" badge stops meaning "we checked this is real" and starts meaning "we checked the invoice cleared" — and that suspicion doesn't attach to one card, it retroactively contaminates all 78.

**Why the asset is asymmetric.** You cannot taint "one entry." The catalog's value lives in the *verification mark itself*. One paid placement changes every reader's question from *"is this useful?"* to *"did someone pay to be here?"* — applied backward across all 78 entries. That's why **monetizing the audience (sponsorship/newsletter, walled off) preserves the asset, and monetizing the catalog (paid placement, data) consumes it.** They are not two flavors of the same choice; one keeps the seed corn and one eats it.

**The product literally forbids this in its own files.** `.cx/inbox/vision.md:35,38` lists as *explicit non-goals*: "**Not a deals site**" and "**Not gated (no login wall, no email capture)**." The About page promises users in writing (`about.astro:50`): "**Login walls or email capture (completely open).**" Paid promotion + business partnerships *are* a deals site; ads + freshman targeting *are* gating/capture. The plan contradicts the founder's own constitution.

**The concrete collision (legal C3 + devil FM-1, independently).** Each card renders a green "✓ Verified {month year}" badge and a "$X/yr value" badge (`ResourceCard.astro`). Drop a "Sponsored" badge into that same row and "Verified" and "Sponsored" sit two inches apart — the FTC's textbook native-advertising deception, and the moment the trust signal goes ambiguous.

**The honest concession (all three).** Monetization *is* survivable — but only in the form that makes almost no money: flat-fee, clearly-labeled patronage of *the project* (not placement *within the list*), no tracking, no in-catalog ads, and "paid promotion to freshmen" dropped entirely. Anything that actually scales revenue is the part that can't be made trust-safe.

**The trade we are explicitly recommending:** forgo the (small) catalog ad revenue to keep the catalog's credibility intact, and put the revenue ambition on the *engine* (Track B), where money makes the trust *more* valuable (clean reference customer) instead of less.

---

## 3. What's broken right now (independent of monetization)

The audit surfaced live problems that exist **today** and must be fixed before *any* marketing, let alone monetization:

| Issue | Evidence | Why it's urgent |
|---|---|---|
| **About page makes 3 false promises** | `about.astro:49` "no user-submitted content," `:50` "no email capture (completely open)," `:66` "no database, no backend" | All false post-v2: `/submit` captures optional email, reports capture email, Supabase backend exists. This is a deceptive-practices exposure (FTC §5) the moment there's a commercial motive — and a trust own-goal regardless. |
| **No privacy policy / ToS** | no policy route in `src/pages/` | Email + a `votes.fingerprint` device id are collected today with zero disclosure. Adding analytics/ads compounds it. |
| **No analytics** | no tag in `BaseLayout.astro` | Can't price or gate an audience you can't measure. Every revenue number is multiplied against an unknown denominator (reached audience is likely low-hundreds, not the 84,500 addressable). |

**Premature?** Yes. The business-strategist's gates: monetization shouldn't open until **About is truthful + privacy/ToS live + analytics reporting**, then **≥~3,000 sustained MAU** and a **≥1,000-subscriber newsletter at >40% open**. None exist today. The *marketing* window (orientation/course-shopping) is now; the *monetization* window is one-to-two terms out, minimum.

---

## 4. Legal scaffolding required before any monetization

From cx-legal-compliance (not legal advice; counsel sign-off flagged where noted). Lead severity items:

- **C1 (Critical) — Fix the false About promises** before shipping ads/sponsorship; misrepresentation on a commercial site is FTC §5 exposure.
- **C2 (Critical) — Publish a privacy policy, ToS, and cookie/consent banner** before any ad/analytics tag fires. CCPA/CPRA strict *applicability* is uncertain at this size (thresholds: >$26.6M revenue, or PI of ≥100k consumers, or ≥50% revenue from selling PI — [CPPA](https://cppa.ca.gov/regulations/cpi_adjustment.html)), **but ad-network/analytics contracts (Google) require the policy + consent regardless.**
- **C3 (Critical) — Sponsored-content labeling is a schema/component decision to make now.** Any paid entry needs an "Ad/Sponsored" label at or above the headline, an `is_sponsored`-type field, and a card variant that does **not** borrow the "Verified" badge ([FTC Native Advertising Guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses)). Cheap now, expensive after the card/DB lock.
- **H1 (High) — "Paid promotion to freshmen"** raises marketing-to-minors (some are 17) and data-provenance exposure; using any Dartmouth-sourced contact data violates that source's terms. (Recommendation: drop it.)
- **H2 (High) — CAN-SPAM** on any marketing email (postal address, opt-out ≤10 business days, up to ~$53k/email). **Do not repurpose the submit/report emails** — they were collected for crediting/follow-up, not marketing.
- **H3 (High) — Commercial use of "Dartmouth"** raises trademark/false-affiliation risk beyond non-commercial use; the footer disclaimer (added in the design pass) helps but is likely insufficient once money changes hands. Counsel review before monetizing.
- **H4 (High) — Ad-network policy conflict:** AdSense and peers prohibit ads on scraped/thin or rights-uncertain content; an aggregator of another institution's content with agent-"drafted" entries is at risk of being disabled.
- **M2 (Medium) — Accessibility/ADA:** third-party ad embeds typically fail WCAG AA and worsen the open items from the design review.

**Minimum scaffolding before monetizing:** privacy policy, ToS, consent banner, sponsor-disclosure system, About-page correction, marketing-list hygiene (separate opt-in), and counsel sign-off on trademark + CCPA/GDPR + minors. Full detail and sources in the legal section of the source reports.

---

## 5. Prioritized plan

**Phase 0 — Fix the foundation (do FIRST; blocks all marketing). ~days.**
- Rewrite the About "What's Not Here" section to match reality (exact copy in §6).
- Publish a Privacy Policy + Terms (cover submit email, report email, `votes.fingerprint`).
- Add privacy-respecting analytics (Plausible / Vercel Analytics).
- *Gate → Phase 1:* About truthful, privacy/ToS live, analytics reporting.

**Phase 1 — Build the audience, for free (the marketing push). One academic term.**
- Launch a clearly-opt-in newsletter capture.
- **Freshmen (organic):** orientation/O-week tabling + QR to `/for-students`, dorm GroupMe + UGA seeding, "perks you already pay for" during course-shopping. *(Paid campus-media only if organic stalls.)*
- **Alumni (earned):** class secretaries / class newsletters, reunion-timed content, regional clubs. **Never scrape the alumni directory.**
- *Gate → Phase 2:* ≥3,000 sustained MAU **and** ≥1,000 engaged subscribers >40% open.

**Phase 2 — Monetize the audience, cleanly. Only after Phase-1 gates.**
- NPR-style newsletter underwriting + a single labeled footer sponsor slot. Wall it off from the catalog.
- *Gate → Phase 3:* ≥1 repeatable paying sponsor.

**Phase 3 — Productize the engine (the real business). Parallelizable with 1–2.**
- Package the agent pipeline; pursue 1–2 pilot institutions with Dartmouth as the reference case.
- **Open risk (flagged by both lead and devil):** this rests on the unverified "~10 min/week maintenance" claim and unproven other-school demand. Validate the maintenance economics on Dartmouth *before* selling it.

**Never (any phase):** paid placement inside the catalog · data/lead-gen on freshmen · scraping the alumni directory · repurposing submit/report emails for marketing · programmatic display ads in the grid · "paid promotion to freshmen."

---

## 6. Exact About-page changes for the chosen model

The chosen model is **clean catalog + patronage/underwriting + B2B engine — no in-catalog ads, no paid placement.** These edits (a) fix the live falsehoods and (b) state the funding model honestly. Line numbers per current `src/pages/about.astro`.

**a) `about.astro:49` — "User-submitted content (to avoid spam and quality issues)"** — now false (the `/submit` form exists).
> Replace with: *"Pay-for-placement — no business can buy its way onto this list. Community submissions are welcome and reviewed before publishing (see /submit)."*

**b) `about.astro:50` — "Login walls or email capture (completely open)"** — now false (optional email on submit + report).
> Replace with: *"Login walls. No account is required to browse. We collect an optional email only if you choose to give it when submitting or reporting a resource — see our Privacy Policy."*
> Drop the phrases "completely open" and "no email capture."

**c) `about.astro:47` — "Third-party student discounts (not Dartmouth-specific)"** — keep, and make it load-bearing for the funding model.
> Keep the exclusion, and reinforce it where you describe funding: organic entries are Dartmouth-specific perks only; this is *not* a deals site (consistent with `vision.md`).

**d) `about.astro:66` — "No database, no backend, no auth ... single JSON file"** (fork section) — now false.
> Correct to: *"a static Astro site, with an optional Supabase backend powering upvotes, reports, and community submissions. Forks can run pure-JSON with no backend."*

**e) Add a new "How this is funded" section** (the disclosure the chosen model requires):
> *"This catalog is free and has no agenda. It's funded by [voluntary support / an institutional grant / clearly-labeled underwriting], never by paid placement — no business can pay to appear, rank higher, or be marked 'Verified.' If we ever show a sponsor, it lives in the footer, is clearly labeled, and never touches the list. We don't sell your data, and we don't run targeted ads. Independent of Dartmouth — see our Privacy Policy and Terms."*

**f) Add Privacy Policy + Terms links** to the footer/About (new pages from Phase 0).

> If a future decision *does* introduce labeled sponsored entries, that is a **different model** than the one recommended here and requires the full C3 disclosure architecture (separate card variant, no "Verified" badge, schema flag) before it ships — not a copy tweak.

---

## Appendix — Models ranked by trust cost (cx-business-strategist)

| Model | Trust cost | Revenue at this scale | Verdict |
|---|---|---|---|
| Sponsorship / underwriting (walled, footer/newsletter) | Low | Moderate | **Best fit** |
| Separate opt-in newsletter | Low | Moderate→High over time | **Build — the engine of clean monetization** |
| B2B: agent-catalog pattern to other schools | Zero (to Dartmouth ledger) | High ceiling, slow | **The real business** |
| Affiliate links | Med–High | ~Nil (perks are free) | Skip — nothing to affiliate |
| Display ads | High | Low (pennies) | No |
| Paid placement inside the catalog | **Catastrophic** | Tempting per-unit | **Never** |
| Freshman data / lead-gen | **Catastrophic + illegal-adjacent** | Unknown | **Never** |

**Sources:** [FTC Native Advertising Guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses) · [FTC CAN-SPAM Guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) · [CPPA thresholds](https://cppa.ca.gov/regulations/cpi_adjustment.html) · [Google AdSense Policies](https://support.google.com/adsense/answer/48182) · [UNiDAYS model/revenue (Finty)](https://finty.com/us/business-models/unidays/) · newsletter sponsorship floors ([beehiiv](https://www.beehiiv.com/blog/newsletter-sponsorship-cost)). Severities are the specialists' assessments; the legal section is issue-spotting, not legal advice — counsel sign-off is flagged on trademark, CCPA/GDPR, and minors.
