# Free Stuff @ Dartmouth — Agents

Three agents, each doing one job well. Designed to map to Construct's specialist persona model.

## 1. Verifier (agents/verify.py)

Purpose: Every existing entry in resources.json needs to stay current.

Trigger: Weekly cron via GitHub Actions, every Monday at 9 AM ET.

Behavior:
1. Load resources.json
2. For each entry, HTTP GET the link URL
3. If non-200, mark status: broken
4. If 200, scan page for keywords from the entry's name/description to detect content drift
5. Update last_verified to today's date if consistent
6. If anything changed, open a single PR titled "verify: weekly health check (YYYY-MM-DD)"
7. If nothing changed, do nothing (no empty PRs)

Maps to Construct: a QA persona.

## 2. Discoverer (agents/discover.py)

Purpose: Find new perks not yet in the catalog.

Trigger: Monthly cron, first Saturday of the month at 9 AM ET.

Behavior:
1. Run pre-defined searches:
   - Dartmouth.edu site search for "free for students", "alumni benefit", "no cost"
   - Reddit r/Dartmouth search for "free" in the last 6 months
   - Specific perk-dense pages: services.dartmouth.edu, library.dartmouth.edu/services, alumni.dartmouth.edu/alumni-services, outdoors.dartmouth.edu
2. Collect candidate URLs
3. Dedupe against existing entries
4. Output agents/pending/candidates-YYYY-MM-DD.json
5. Open a PR titled "discover: monthly scan (YYYY-MM-DD)"

Maps to Construct: a research persona. Scouts and reports; doesn't ship.

Cap: 25 candidates per run.

## 3. Drafter (agents/draft_entry.py)

Purpose: Turn a candidate URL into a resources.json entry.

Trigger: Runs after Discoverer in the same workflow, OR manually via agents/pending/manual-queue.txt.

Behavior:
1. For each candidate URL, fetch the page
2. Use Claude to extract a structured entry matching the schema
3. Set status: needs_verification so Verifier double-checks
4. Set added_by: agent
5. Add new entries to resources.json in a PR titled "draft: N new entries from monthly discovery"

Maps to Construct: a content engineer persona.

Quality gates:
- Description under 280 characters
- Eligibility must be justified from page content
- If unsure about category, use category: uncategorized

Cap: 10 new entries per PR.

## Cross-agent contract

- Shared agents/shared/resources_io.py for atomic reads/writes
- Shared logging format (JSON-lines, timestamp + agent + event + payload)
- Shared Claude client wrapper (retries, rate limits, token accounting)
- NEVER push directly to main. Always open a PR.

## Human time budget

- 5 min/week reviewing Verifier's PR
- 15-20 min/month reviewing Discoverer + Drafter's PR
- Occasional 10 min sessions for manual additions

If above 30 min/week, the agents need tuning.

## Failure modes to design for

1. Site goes down temporarily → Verifier retries before flagging broken
2. Claude returns malformed JSON → Drafter validates schema, rejects malformed
3. Discoverer repeats dead ends → blocklist.json for URLs to skip
4. Agent spams 50 PRs → caps on candidates per run and entries per PR
5. Site changes structure → Verifier logs "couldn't verify" instead of "broken"
