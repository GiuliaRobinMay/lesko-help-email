# Lesko Help — Onboarding Email Sequence

Fully branded HTML emails for the new-member welcome series of the
[Lesko Help community](https://lesko-help-2.mn.co/) (Mighty Networks), designed in the
Lesko Help "editorial civic" style: cream paper, navy ink, red italic serif accents,
sunshine-yellow question mark, ♠ ♥ ♦ ♣ suit motif.

## How it works

Everything is generated from **one file**:

```
node build.js
```

| Path | What it is |
|------|------------|
| `build.js` | The design system (colors, fonts, blocks) + the content of every email. Edit here, then re-run. |
| `emails/*.html` | The rendered emails — one standalone file each, ready to paste into Kit. |
| `template/kit-master-template.html` | A generic branded frame (no headline block) for one-off broadcasts/newsletters. |
| `preview/index.html` | Open in a browser to flip through the whole sequence. |

## The sequence plan (8 days)

New members get email 1 immediately on the day they join (Day 1).

| # | Day | Email | Status |
|---|-----|-------|--------|
| 1 | 1 | Welcome & setup — explore the Roadmap, profile, notifications, app, say hi in Member Chat | ✅ drafted |
| 2 | 2 | Roadmap step 1 — Daily Welcome Tour (join live or watch the video) | pending |
| 3 | 3 | Roadmap steps 2–4 — the Call Sheet, three ways (Call Sheet Classes / AI Grant Researcher / Questions Channel) | pending |
| 4 | 4 | Roadmap step 5 — Application Classes | pending |
| 5 | 5 | Roadmap step 6 — Group Coaching Classes | pending |
| 6 | 6 | Roadmap step 7 — Ask Matthew Live | pending |
| 7 | 7 | Business Hub (Lesko Pro) | pending |
| 8 | 8 | Resources, FAQ & Success Stories | pending |

## Putting an email into Kit (ConvertKit)

The emails contain Kit Liquid tags, so they work as **custom HTML email templates**:

- `{{ subscriber.first_name | default: "there" }}` — personalized greeting
- `{{ message_content }}` — where anything typed in Kit's email editor flows in (can stay empty)
- `{{ unsubscribe_url }}` and `{{ address }}` — required by Kit, filled automatically

Steps, per email:

1. In Kit: **Settings → Email → Email templates → New email template → HTML**.
2. Paste the full contents of the email's file (e.g. `emails/01-welcome.html`).
3. Name it (e.g. `Lesko Onboarding 01 — Welcome`) and save.
4. In your **Sequence**, add an email, pick that template, set the subject line and send delay.
5. Send yourself a test before going live.

Subject line + preview text for each email are in `build.js` (and shown in `preview/index.html`).

### Using a different email platform?

Swap the merge tags: Mailchimp `*|FNAME|*` / `*|UNSUB|*`, MailerLite `{$name}` / `{$unsubscribe}`,
ActiveCampaign `%FIRSTNAME%` / `%UNSUBSCRIBELINK%`. Everything else is plain email-safe HTML
(600px table layout, inline styles, web-font fallbacks to Georgia/Arial/Courier).
