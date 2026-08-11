#!/usr/bin/env node
/**
 * Lesko Help — Member Onboarding Email Sequence
 * ---------------------------------------------
 * One shared brand frame + per-email content = fully rendered HTML emails.
 *
 *   node build.js
 *
 * Outputs:
 *   emails/01-*.html …            → paste each into a Kit (ConvertKit) custom HTML template
 *   template/kit-master-template.html → generic branded frame for broadcasts/newsletters
 *   preview/index.html            → open locally to preview the whole sequence
 *
 * The emails use Kit "Liquid" tags: {{ subscriber.first_name }}, {{ message_content }},
 * {{ unsubscribe_url }}, {{ address }}. Swap these if you use a different email platform
 * (see README.md).
 *
 * SEQUENCE PLAN (8 days — email 1 approved first, rest to follow):
 *   1 · Day 1  Welcome & setup — Roadmap, profile, notifications, app, say hi
 *   2 · Day 2  Roadmap step 1 — Daily Welcome Tour
 *   3 · Day 3  Roadmap steps 2–4 — the Call Sheet, three ways
 *   4 · Day 4  Roadmap step 5 — Application Classes
 *   5 · Day 5  Roadmap step 6 — Group Coaching Classes
 *   6 · Day 6  Roadmap step 7 — Ask Matthew Live
 *   7 · Day 7  Business Hub (Lesko Pro)
 *   8 · Day 8  Resources, FAQ & Success Stories
 */

const fs = require('fs');
const path = require('path');

/* ---------------------------------------------------------------- palette */

const NAVY = '#18234A';   // ink / headlines
const INK = '#333D5C';    // body text
const MUTED = '#8A8264';  // small print
const RED = '#E63946';    // red coral accents
const BLUE = '#2C3FA0';   // royal blue
const YELLOW = '#FDC830'; // sunshine yellow
const GREEN = '#4FA84F';  // green
const CREAM = '#FBF6E9';  // paper (card background)
const OUTER = '#F0E7D3';  // deeper cream (email background)

const TINT = {
  yellow: '#FBF0CF',
  blue: '#E9EDFB',
  red: '#FBE5E7',
  green: '#E7F3E4',
};

const SERIF = "'Fraunces',Georgia,'Times New Roman',serif";
const SANS = "'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'JetBrains Mono','Courier New',Courier,monospace";

/* ------------------------------------------------- community destinations */

const LINKS = {
  community: 'https://lesko-help-2.mn.co/',
  roadmap: 'https://lesko-help-2.mn.co/spaces/24365840/page',   // Follow the Roadmap
  welcomeTour: 'https://lesko-help-2.mn.co/spaces/24366161',    // Daily Welcome Tour
  callSheetClasses: 'https://lesko-help-2.mn.co/spaces/24440881',
  aiResearcher: 'https://lesko-help-2.mn.co/spaces/24461105',   // AI Grant Researcher
  askLeskoAI: 'https://lesko-help-2.mn.co/spaces/23670974',     // Ask Lesko AI Research Tool
  groupCoaching: 'https://lesko-help-2.mn.co/spaces/24366194',  // Group Coaching Calls
  dropInClinic: 'https://lesko-help-2.mn.co/spaces/23328015',   // Thursday Drop-In Clinic
  matthewTips: 'https://lesko-help-2.mn.co/spaces/24366306',    // Matthew's Live Success Tips
  askMatthew: 'https://lesko-help-2.mn.co/spaces/21948411',     // Ask Matthew Live
  replays: 'https://lesko-help-2.mn.co/spaces/24487048',        // Watch the Class Replays
  questions: 'https://lesko-help-2.mn.co/spaces/24366155',      // Questions Channel
  applicationClasses: 'https://lesko-help-2.mn.co/spaces/24366189',
  successStories: 'https://lesko-help-2.mn.co/spaces/10351370',
  sayHi: 'https://lesko-help-2.mn.co/spaces/22851440/feed',     // Say Hi & Member Chat
  meetTeam: 'https://lesko-help-2.mn.co/spaces/11054358',
  businessHub: 'https://lesko-help-2.mn.co/spaces/18083958',    // Business - Nonprofits & Career
  faqZone: 'https://lesko-help-2.mn.co/spaces/20304678',
};

/* ----------------------------------------------------------- small pieces */

const SUITS = [
  { char: '&#9824;', color: BLUE },   // spade
  { char: '&#9829;', color: RED },    // heart
  { char: '&#9830;', color: YELLOW }, // diamond
  { char: '&#9827;', color: GREEN },  // club
];

const suitRow = () =>
  SUITS.map(s => `<span style="color:${s.color};">${s.char}</span>`).join('&nbsp;&nbsp;');

const emailSuit = n => {
  const s = SUITS[(n - 1) % 4];
  return `<span style="color:${s.color};">${s.char}</span>`;
};

/* Content row inside the card. */
const row = (inner, padding = '10px 46px') =>
  `<tr><td class="px" style="padding:${padding};">${inner}</td></tr>`;

const para = (html, opts = {}) =>
  row(
    `<p style="margin:0;font-family:${SANS};font-size:${opts.size || 16}px;line-height:${opts.lh || 26}px;color:${opts.color || INK};">${html}</p>`,
    opts.padding
  );

/* Mono uppercase micro-label. */
const label = (text, color = RED) =>
  `<span style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:${color};text-transform:uppercase;">${text}</span>`;

/* Left-border tinted callout card (the signature Lesko doc block). */
const callout = (color, heading, bodyHtml) => {
  const border = { yellow: YELLOW, blue: BLUE, red: RED, green: GREEN }[color];
  return row(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${TINT[color]};border-left:5px solid ${border};border-radius:0 10px 10px 0;">
      <tr><td style="padding:18px 22px;">
        <div style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:${NAVY};text-transform:uppercase;padding-bottom:8px;">${heading}</div>
        <div style="font-family:${SANS};font-size:15px;line-height:24px;color:${INK};">${bodyHtml}</div>
      </td></tr>
    </table>`);
};

/* Numbered roadmap steps with yellow circle badges. */
const steps = list =>
  row(
    list
      .map(
        s => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px 0;">
      <tr>
        <td width="52" valign="top">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td align="center" width="40" height="40" style="width:40px;height:40px;background-color:${YELLOW};border:2px solid ${NAVY};border-radius:50%;font-family:${SERIF};font-style:italic;font-weight:700;font-size:19px;color:${NAVY};">${s.n}</td>
          </tr></table>
        </td>
        <td valign="top" style="padding:2px 0 0 8px;">
          <div style="font-family:${SERIF};font-size:19px;font-weight:700;color:${NAVY};padding-bottom:3px;">${s.title}</div>
          <div style="font-family:${SANS};font-size:15px;line-height:23px;color:${INK};">${s.text}</div>
        </td>
      </tr>
    </table>`
      )
      .join('')
  );

/* Arrow list of live classes / places, each linking to a real Space. */
const linkList = items =>
  row(
    items
      .map(
        it => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px 0;">
      <tr>
        <td width="26" valign="top" style="font-family:${SANS};font-size:16px;color:${RED};font-weight:700;">&rarr;</td>
        <td valign="top">
          <a href="${it.url}" style="font-family:${SANS};font-size:16px;font-weight:700;color:${NAVY};text-decoration:underline;text-decoration-color:${YELLOW};">${it.name}</a>
          <span style="font-family:${SANS};font-size:15px;color:${INK};"> — ${it.desc}</span>
        </td>
      </tr>
    </table>`
      )
      .join('')
  );

/* Bulletproof-ish button: yellow pill, navy border. */
const cta = (text, url, secondary) =>
  row(`
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:6px auto 2px;">
      <tr><td align="center" style="background-color:${YELLOW};border:2px solid ${NAVY};border-radius:999px;">
        <a href="${url}" style="display:inline-block;padding:14px 34px;font-family:${SANS};font-size:16px;font-weight:700;color:${NAVY};text-decoration:none;">${text}</a>
      </td></tr>
    </table>
    ${
      secondary
        ? `<p style="margin:14px 0 0;text-align:center;font-family:${SANS};font-size:14px;color:${INK};">${secondary.pre || ''} <a href="${secondary.url}" style="color:${BLUE};font-weight:700;">${secondary.text}</a></p>`
        : ''
    }`,
    '18px 46px'
  );

/* Matthew's sign-off. */
const signoff = () =>
  row(`
    <p style="margin:0;font-family:${SANS};font-size:16px;line-height:24px;color:${INK};">Talk soon,</p>
    <p style="margin:4px 0 0;font-family:${SERIF};font-style:italic;font-weight:700;font-size:26px;color:${NAVY};">&mdash; Matthew</p>`,
    '14px 46px 4px');

/* Serif-italic P.S. line. */
const ps = html =>
  para(`<span style="font-family:${SERIF};font-style:italic;font-size:16px;color:${NAVY};">P.S. — ${html}</span>`, {
    padding: '6px 46px 10px',
  });

/* Greeting + the Kit editor slot ({{ message_content }} flows in here). */
const greeting = () =>
  row(`
    <p style="margin:0 0 6px;font-family:${SANS};font-size:16px;line-height:26px;color:${INK};">Hi {{ subscriber.first_name | default: "there" }} &mdash;</p>
    <div style="font-family:${SANS};font-size:16px;line-height:26px;color:${INK};">{{ message_content }}</div>`);

/* The 4-color stripe divider. */
const stripe = () =>
  row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="25%" height="6" style="background-color:${YELLOW};font-size:0;line-height:0;">&nbsp;</td>
      <td width="25%" height="6" style="background-color:${RED};font-size:0;line-height:0;">&nbsp;</td>
      <td width="25%" height="6" style="background-color:${GREEN};font-size:0;line-height:0;">&nbsp;</td>
      <td width="25%" height="6" style="background-color:${BLUE};font-size:0;line-height:0;">&nbsp;</td>
    </tr></table>`,
    '26px 46px 0'
  );

/* -------------------------------------------------------------- the frame */

function renderEmail(e) {
  const preheaderPad = '&nbsp;&zwnj;'.repeat(90);
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${e.subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap');
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  table { border-collapse:separate; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  a { color:${BLUE}; }
  @media only screen and (max-width:640px) {
    .container { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:30px !important; line-height:36px !important; }
    .qmark { font-size:58px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${OUTER};">
<div style="display:none;font-size:1px;color:${OUTER};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${e.preheader}${preheaderPad}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${OUTER}" style="background-color:${OUTER};">
  <tr><td align="center" style="padding:32px 12px 24px;">
    <table role="presentation" width="620" cellpadding="0" cellspacing="0" class="container" style="width:100%;max-width:620px;">

      <!-- masthead: suits + wordmark -->
      <tr><td style="padding:0 10px 14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td align="left" style="font-size:18px;line-height:18px;">${suitRow()}</td>
          <td align="right" style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:${NAVY};text-transform:uppercase;">Lesko Help &middot; New member guide</td>
        </tr></table>
      </td></tr>

      <!-- the card -->
      <tr><td style="background-color:${CREAM};border:2px solid ${NAVY};border-radius:16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

          <!-- chip row -->
          <tr><td class="px" style="padding:38px 46px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="background-color:${NAVY};border-radius:4px;padding:6px 12px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:${YELLOW};text-transform:uppercase;">Email ${String(e.n).padStart(2, '0')} &middot; ${e.dayChip}</td>
              <td style="padding-left:14px;">${label(e.chipLabel)}</td>
            </tr></table>
          </td></tr>

          <!-- headline + big question mark -->
          <tr><td class="px" style="padding:22px 46px 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td valign="top">
                <div class="h1" style="font-family:${SERIF};font-size:38px;line-height:44px;font-weight:700;color:${NAVY};">${e.h1}</div>
              </td>
              <td width="86" align="right" valign="top">
                <div class="qmark" style="font-family:${SERIF};font-style:italic;font-weight:700;font-size:76px;line-height:70px;color:${YELLOW};">?</div>
              </td>
            </tr></table>
          </td></tr>

          ${e.blocks.join('\n')}

          ${stripe()}

          <!-- footer -->
          <tr><td class="px" style="padding:22px 46px 34px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="40" valign="middle">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td align="center" width="32" height="32" style="width:32px;height:32px;background-color:${BLUE};border-radius:50%;font-family:${SERIF};font-style:italic;font-weight:700;font-size:17px;color:${YELLOW};">?</td>
                </tr></table>
              </td>
              <td valign="middle" style="padding-left:4px;">
                <span style="font-family:${SERIF};font-style:italic;font-weight:700;font-size:19px;color:${RED};">Lesko</span>
                <span style="font-family:${SANS};font-weight:700;font-size:19px;color:${NAVY};">&nbsp;Help</span>
              </td>
              <td align="right" valign="middle" style="font-family:${MONO};font-size:10px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;">Questions are free.<br>Always were.</td>
            </tr></table>
            <p style="margin:18px 0 0;font-family:${SANS};font-size:12px;line-height:19px;color:${MUTED};">
              ${e.footerNote}<br>
              {{ address }}<br>
              <a href="{{ unsubscribe_url }}" style="color:${MUTED};">Unsubscribe</a> &nbsp;&middot;&nbsp; <a href="${LINKS.community}" style="color:${MUTED};">Open the community</a>
            </p>
          </td></tr>

        </table>
      </td></tr>

      <!-- below-card tag -->
      <tr><td align="center" style="padding:16px 0 0;font-family:${MONO};font-size:10px;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">
        ${emailSuit(e.n)}&nbsp;&nbsp;Member onboarding &middot; ${e.dayLabel}
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ------------------------------------------------------------- the emails */

const em = html => `<em style="font-family:${SERIF};font-style:italic;font-weight:700;color:${RED};">${html}</em>`;
const link = (url, text) => `<a href="${url}" style="color:${BLUE};font-weight:700;">${text}</a>`;

const SERIES_NOTE = `You're getting this because you joined the Lesko Help community. It's part of your new-member welcome series.`;

const EMAILS = [
  {
    n: 1,
    file: '01-welcome.html',
    dayChip: 'Day 1',
    dayLabel: 'Day 1 · right after you join',
    chipLabel: 'Welcome & setup',
    subject: 'Welcome to Lesko Help — start here',
    preheader: `Your map is inside. Open it and do 3 small things today.`,
    footerNote: SERIES_NOTE,
    h1: `Welcome! You're in ${em('exactly the right place.')}`,
    blocks: [
      greeting(),
      para(`I'm Matthew &mdash; and I'm really glad you're here.`),
      para(`Free money from the government is real. Grants. Programs that help with bills, housing, starting a business, and much more. The money is there &mdash; it's just hard to find. So my team and I made you a map. We call it <strong style="color:${NAVY};">the Roadmap</strong>. It shows you the whole path, one step at a time.`),
      para(`Your first job is easy: open the map and take a look.`),
      cta('Open the Roadmap &rarr;', LINKS.roadmap),
      para(`While you're in there, do these <strong style="color:${NAVY};">3 small things</strong> today:`),
      steps([
        { n: 1, title: 'Add your photo', text: `Put a face to your name. Add one line about what you need money for.` },
        { n: 2, title: 'Turn on notifications', text: `So you never miss an answer or a class.` },
        { n: 3, title: 'Get the app', text: `So the community is right there in your pocket.` },
      ]),
      callout('green', 'Come say hi', `Tell us who you are in the ${link(LINKS.sayHi, 'Member Chat')}. Just say hi. You'll get a warm welcome &mdash; I promise.`),
      callout('blue', 'The Lesko way', `Every program has a real person whose job is to hand out the money. We help you find that person.`),
      signoff(),
      ps(`Tomorrow I'll show you the first stop on the map: our daily Welcome Tour.`),
    ],
  },
];

/* -------------------------------------------- master template (broadcasts) */

function renderMasterTemplate() {
  const e = {
    n: 1,
    dayChip: 'From the team',
    dayLabel: 'Lesko Help',
    chipLabel: 'From the team',
    subject: 'Lesko Help',
    preheader: '',
    footerNote: `You're getting this because you joined the Lesko Help community.`,
    h1: '',
    blocks: [greeting()],
  };
  // Build from the same frame, then strip sequence-specific bits.
  let html = renderEmail(e);
  html = html
    .replace(/<!-- headline \+ big question mark -->[\s\S]*?<\/table>\n          <\/td><\/tr>/, '')
    .replace('Email 01 &middot; From the team', 'Lesko Help')
    .replace('Member onboarding &middot; Lesko Help', 'lesko-help-2.mn.co');
  return html;
}

/* ----------------------------------------------------------------- output */

const root = __dirname;
fs.mkdirSync(path.join(root, 'emails'), { recursive: true });
fs.mkdirSync(path.join(root, 'template'), { recursive: true });
fs.mkdirSync(path.join(root, 'preview'), { recursive: true });

// Clear out stale generated emails so the folder always mirrors EMAILS.
for (const f of fs.readdirSync(path.join(root, 'emails'))) {
  if (f.endsWith('.html')) fs.unlinkSync(path.join(root, 'emails', f));
}

for (const e of EMAILS) {
  fs.writeFileSync(path.join(root, 'emails', e.file), renderEmail(e));
  console.log(`✓ emails/${e.file}`);
}

fs.writeFileSync(path.join(root, 'template', 'kit-master-template.html'), renderMasterTemplate());
console.log('✓ template/kit-master-template.html');

/* Preview gallery (local browsing only — not an email). */
const previewCards = EMAILS.map(
  e => `
  <section class="email">
    <header>
      <div class="meta">
        <span class="chip">Email ${String(e.n).padStart(2, '0')} · ${e.dayChip}</span>
        <span class="day">${e.chipLabel}</span>
      </div>
      <h2>${e.subject}</h2>
      <p class="pre">Preview text: ${e.preheader}</p>
    </header>
    <iframe src="../emails/${e.file}" title="${e.subject}" loading="lazy"></iframe>
    <p class="open"><a href="../emails/${e.file}" target="_blank">Open standalone ↗</a></p>
  </section>`
).join('\n');

fs.writeFileSync(
  path.join(root, 'preview', 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lesko Help — Onboarding Sequence Preview</title>
<style>
  body { margin:0; background:${OUTER}; font-family:'Helvetica Neue',Arial,sans-serif; color:${NAVY}; }
  .wrap { max-width:760px; margin:0 auto; padding:48px 20px 80px; }
  h1 { font-family:Georgia,serif; font-size:40px; margin:0 0 6px; }
  h1 em { color:${RED}; }
  .sub { font-family:'Courier New',monospace; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:${MUTED}; margin-bottom:40px; }
  .email { background:${CREAM}; border:2px solid ${NAVY}; border-radius:16px; padding:24px 28px; margin-bottom:36px; }
  .meta { display:flex; gap:12px; align-items:center; margin-bottom:8px; }
  .chip { background:${NAVY}; color:${YELLOW}; font-family:'Courier New',monospace; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:5px 10px; border-radius:4px; }
  .day { font-family:'Courier New',monospace; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:${RED}; }
  h2 { font-family:Georgia,serif; font-size:22px; margin:4px 0; }
  .pre { color:${INK}; font-size:14px; margin:0 0 16px; }
  iframe { width:100%; height:1250px; border:1px solid #d8cfb6; border-radius:10px; background:${OUTER}; }
  .open { text-align:right; margin:10px 0 0; } .open a { color:${BLUE}; font-weight:700; font-size:14px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Onboarding sequence <em>preview.</em></h1>
  <div class="sub">♠ ♥ ♦ ♣ &nbsp; Lesko Help · ${EMAILS.length} of 8 emails drafted · generated by build.js</div>
  ${previewCards}
</div>
</body>
</html>`
);
console.log('✓ preview/index.html');
console.log('\nDone. Open preview/index.html in a browser to see the sequence.');
