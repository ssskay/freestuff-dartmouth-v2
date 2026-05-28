# Free Stuff @ Dartmouth — Vision

## The thesis

Dartmouth students and alumni already pay for an enormous amount of stuff and don't use most of it. Tuition, fees, and alumni dues fund software licenses, news subscriptions, library databases, outdoor gear rentals, professional development resources, and lifelong perks — but the catalog of "what you actually get" is fragmented across dozens of pages, hard to discover, and goes stale fast.

This site is the catalog. The mission is a complete, public, always-current list of free perks available to Dartmouth students and alumni — with a working link, eligibility tag, and a "last verified" date on every entry.

## Why it can exist now (when it couldn't before)

A previous version of this idea existed in roughly 2018-2019 and died because maintenance was a nightmare. Links rotted. New perks weren't added. The site became less useful than just googling.

What's different: an agent can maintain it. Three small agents — one to verify existing entries, one to discover new ones, one to draft entries from raw URLs — running on a schedule, opening PRs that a human reviews and merges. The maintenance burden goes from "hours per week of unpaid drudgery" to "ten minutes of PR review on a Sunday."

This site is also a deliberate test case for the Construct framework. If a small agent fleet can keep a public-facing site fresh and accurate with minimal human oversight, the same pattern applies to dozens of other catalogs.

## Audience

- Current Dartmouth students (primary) — undergrads and grad students who don't know what they're paying for
- Dartmouth alumni (also primary) — most alumni dramatically underuse their lifetime perks (library card for life, Digital Library, career services, email forwarding)
- Faculty and staff (secondary) — some perks overlap; they're a smaller audience but a real one

## Tone

Public-facing copy should be conversational, slightly cheeky, and earnest. The original idea was called "Free Shit at Dartmouth" — public domain went with "Free Stuff" because the joke works without the word doing the work. The voice is "your friend who actually read the fine print" — informed, generous, occasionally funny, never bureaucratic.

## What success looks like

- Six months in: 80+ verified resources across at least 8 categories. Site is shared in Dartmouth alumni Slack groups and student GroupMes. Less than 5% of links broken at any given time.
- One year in: Site is referenced by the Dartmouth admissions office or a campus publication. Other schools fork the repo for their own versions (the architecture should make this easy).
- Two years in: The agent loop has discovered and added perks that the maintainer never knew existed.

## Explicit non-goals

- Not a deals site (no third-party discounts that any college kid gets — only things specific to Dartmouth affiliation)
- Not a complaint platform (perks that were promised but are broken get flagged, not editorialized)
- Not user-generated (a "report broken link" feature is fine; freeform submissions invite spam and quality issues)
- Not gated (no login wall, no email capture)
