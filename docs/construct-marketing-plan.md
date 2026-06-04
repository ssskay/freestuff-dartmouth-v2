# Construct Marketing Plan — Free Stuff @ Dartmouth

**Date:** 2026-06-03
**Author:** Construct, building on the GTM section of [construct-monetization-strategy.md](./construct-monetization-strategy.md).
**Scope:** How to reach Dartmouth students and alumni — sequenced, mostly free, and trust-safe.

> **North star:** the goal of the push is **not** a traffic spike. It's a clean, opt-in email list plus repeat visits. The list is the only asset that monetizes later without taxing the catalog's trust (sponsorship/underwriting on the *newsletter*, never paid placement in the *list*). Every tactic below serves list growth + retention.

---

## Prerequisite (now met)

The strategist's hard gate was: **do not market until the trust foundation is fixed.** As of this commit it is:
- About page tells the truth (no false "no email / no submissions / no backend" claims). ✅
- Privacy Policy + Terms live and accurate. ✅
- Cookieless analytics wired (Vercel Web Analytics) — so the push is **measurable**. ✅ *(You must flip it on in the Vercel dashboard.)*
- A newsletter opt-in is built and on the homepage. ✅ *(Needs the `subscribers` migration applied + a sending tool chosen — see "What's still needed.")*

The push is unblocked.

---

## The hook

Lead with the number the site already computes: **"You pay ~$80k/year. Here's ~$58,000 of free stuff you already own."** It's the most shareable thing on the site — concrete, a little outrageous, and true. Put it on flyers, in the first line of every class-newsletter blurb, and in the newsletter's subject lines.

---

## Timing — you have runway, use it

It's June. The single highest-intent window of the year is **fall orientation + course-shopping (late Aug → mid-Sept)**: new students, actively setting up laptops and shopping classes, primed to hear "here's the software/databases you already pay for." **Don't fire the push now — build through the summer and hit the window.**

| Window | Focus |
|---|---|
| **Jun–Aug** | Build: newsletter sending setup, content, line up carriers (class secretaries, UGAs). Baseline analytics. |
| **Late Aug–Sept** | Freshmen push (organic, orientation + course-shopping). |
| **Sept–Oct** | Alumni push (earned, via class newsletters + reunions). |
| **Ongoing** | Monthly "new perks added" email → retention + list growth. |

---

## Phase A — Build (June–August)

1. **Finish the newsletter loop.** The capture is live; pick a sending tool (e.g. Buttondown or beehiiv — both cheap, both give CAN-SPAM-compliant unsubscribe + a physical-address footer). Export opt-ins from Supabase `subscribers` to it, or send from there. *Do not send marketing mail from the submit/report emails — those weren't collected for marketing.*
2. **Write 2–3 evergreen issues** so the newsletter has something to send on day one ("the 10 perks nobody uses," "free stuff for your major").
3. **Line up the carriers now.** Email class secretaries and a few UGAs/floor leaders over the summer — they plan fall content early.
4. **Enable Vercel Web Analytics** and note the baseline so the September lift is measurable.

## Phase B — Freshmen (September, organic only)

Highest-intent first; paid is the last lever, not the first.

| Channel | Cost | Notes |
|---|---|---|
| Orientation / O-week tabling, stickers + flyers (QR → `/for-students`) | Free | The year's highest-intent moment |
| Dorm GroupMes + UGAs / floor leaders | Free | Word-of-mouth dominates freshman behavior — seed it directly |
| Course-shopping week: "the tools for your classes you already pay for" | Free | Ties to immediate need (MATLAB, Adobe, library DBs) |
| Club / Greek listservs | Free | Second wave, once clubs onboard |
| *The Dartmouth* (student paper) sponsored post | **Paid (small)** | Only if organic stalls; ~72–80% of students read the campus paper |

## Phase C — Alumni (Sept–Oct, earned)

You don't own these channels — you must be *carried* by class infrastructure.

| Channel | Cost | Notes |
|---|---|---|
| Class secretaries / class newsletters | Free (earned) | Easy yes — they hunt for content. Pitch: "perks you *still* get as an alum" |
| Reunions | Free | Time content to the reunion calendar (perk relevance spikes) |
| Regional / affinity clubs, alumni LinkedIn groups | Free | Second wave |

---

## The hard rules (from legal + devil's-advocate)

- **Never** scrape the alumni directory or repurpose submit/report emails. The list must be fresh, explicit opt-in only (CAN-SPAM + the collection-purpose limit).
- **Kill "paid promotion to freshmen"** — the one idea with no trust-safe form (targets a partly-minor audience; inverts the mission).
- **Paid amplification is the last lever**, never the first. Exhaust organic.
- Keep money off the catalog: any future sponsorship is footer/newsletter-only and labeled (see the monetization doc).

---

## Gates & metrics

Now that analytics is live, these stop being guesses. **Do not open monetization until both clear:**
- **≥ ~3,000 sustained monthly visitors** (proves the catalog is used, not just shipped).
- **≥ 1,000 engaged newsletter subscribers at > 40% open rate** (the actual monetizable asset).

Track weekly: monthly active visitors, return rate, top resources (which perks pull traffic), newsletter signups by `source` (home vs for-students), open/click rate.

---

## What's still needed (your calls)

1. **Apply the `subscribers` migration** — `supabase/migrations/2026-06-03d_subscribers.sql` in the Supabase SQL editor (same one-paste step as before). Until then the signup form returns a friendly error.
2. **Enable Vercel Web Analytics** in the dashboard.
3. **Choose a newsletter sending tool** (Buttondown / beehiiv / send-from-Supabase). I can wire the export or the integration once you pick.
4. **Decide the funding model** (separate from marketing) — the monetization doc's recommendation stands: fund the catalog cleanly, build the real revenue on the agent-maintained-catalog *engine* (now measurable — see `agents/metrics/`).
