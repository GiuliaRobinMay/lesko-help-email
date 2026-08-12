# Handoff state — Lesko Help onboarding emails

_Last updated: 2026-08-11. This file lets any session pick up exactly where we left off._

## Immediate next action

Push the rebuilt email 1 to Kit via the Kit MCP:

- Call `update_sequence_email` with:
  - `sequence_id`: **2818978** (the empty sandbox sequence named "Sequence", 0 subscribers)
  - `id`: **10185361** (the existing draft, unpublished)
  - `subject`: `Welcome to Lesko Help! Start here`
  - `preview_text`: `We made you an amazing Roadmap. Take your first look today.`
  - `content`: full contents of **`emails/kit/01-welcome.html`** (already built, dash-free, uses `{{ subscriber.first_name }}`)
- Then give Giulia https://app.kit.com/sequences/2818978 to review + send herself a test.

## Kit account facts

- Live sequence: "00 FINAL | New Email New Member Onboarding" id **2691903** (10 emails, ~3,441 subs, DO NOT touch until Giulia approves the new set).
- Sandbox sequence: "Sequence" id **2818978** — our draft workspace.
- Templates: only Kit starting-point templates + Classic "Text only" (id 4821884). No custom HTML template; MCP cannot create templates. `email_template_id` param seemed ignored on create/update (email kept "V1" 4917344) — check visual result in Kit; switch per-email template in the editor's Styles tab if the wrapper interferes.
- Content pushed via MCP must NOT contain `{{ message_content }}`, `{{ address }}`, `{{ unsubscribe_url }}` — `build.js` strips these into `emails/kit/*.html` automatically.

## Content rules from Giulia (STRICT)

- Matthew's voice, first person, talking directly to one member. No "I'm Matthew" intro (everyone knows him).
- VERY simple, plain language (low-literacy audience). Motivational, personal, "we're going to guide you".
- NO long dashes anywhere (build.js has a guard). Signature is "Talk soon, / Matthew" (no dash).
- White background, wide layout (660px), larger text — done in build.js.
- Personalization tag: `{{ subscriber.first_name }}` (plain, per Giulia).
- Every email ends with a yellow "Tomorrow in your inbox" nudge teasing the next email.

## Sequence plan (~8 emails, 1/day, replacing the old "21 days" framing)

1. Day 1 (instant): Welcome & setup — Roadmap + photo/notifications/app + say hi. **BUILT, awaiting Giulia's review in Kit.**
2. Day 2: Roadmap step 1 — Daily Welcome Tour (join live or watch video) — space 24366161
3. Day 3: Roadmap steps 2–4 — Call Sheet three ways: Call Sheet Classes 24440881 (+instruction page), AI Grant Researcher 24461105, Questions Channel 24366155
4. Day 4: Roadmap step 5 — Application Classes 24366189 (join + read instructions)
5. Day 5: Roadmap step 6 — Group Coaching Classes 24366194
6. Day 6: Roadmap step 7 — Ask Matthew Live 21948411
7. Day 7: Business Hub 18083958
8. Day 8: Resources + FAQ 20304678 + Success Stories 10351370 (maybe split into 9 emails)

Giulia still owes us: app download link, business hub confirmation, resources/FAQ links, and per-email link checks. Go step by step, one email at a time; push each to the sandbox sequence as an unpublished draft for her review.

## Repo layout

- `build.js` — design system + all email content; `node build.js` regenerates everything.
- `emails/*.html` — standalone versions (previews/screenshots).
- `emails/kit/*.html` — Kit-ready content fragments to push via MCP.
- `template/kit-master-template.html` — branded frame for one-off broadcasts (manual paste, not needed for the sequence).
- `preview/index.html` — local gallery.

## Push log

- 2026-08-12 10:56 UTC: email 1 v3 pushed to Kit draft (seq 2818978 / email 10185361), content verified, left unpublished.
- 2026-08-12 13:59 UTC: email 1 'Welcome to Lesko Help! Start here' pushed (kit id 10185361, updated in place), unpublished.
- 2026-08-12 13:59 UTC: email 2 'Your first step: take the tour' pushed (kit id 10187983), unpublished.
- 2026-08-12 13:59 UTC: email 3 'Let's build your list (this is the big one)' pushed (kit id 10187986), unpublished.
- 2026-08-12 13:59 UTC: email 4 'You found programs. Now what?' pushed (kit id 10187990), unpublished.
- 2026-08-12 13:59 UTC: email 5 'Stuck? This is where you get unstuck' pushed (kit id 10187994), unpublished.
- 2026-08-12 13:59 UTC: email 6 'Come talk to me. Yes, really' pushed (kit id 10187996), unpublished.
- 2026-08-12 13:59 UTC: email 7 'Dreaming of your own business?' pushed (kit id 10187998), unpublished.
- 2026-08-12 13:59 UTC: email 8 'You made it! Here's your treasure map' pushed (kit id 10188000), unpublished.
- 2026-08-12 13:59 UTC: verified all 8 emails present in sequence 2818978, positions 0-7, delays 0d then 1d each, all unpublished.
- 2026-08-12 14:02 UTC: email 1 re-pushed with app-store instructions (no download URL exists); still unpublished.
