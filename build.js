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
const MUTED = '#767E92';  // small print
const RED = '#E63946';    // red coral accents
const BLUE = '#2C3FA0';   // royal blue
const YELLOW = '#FDC830'; // sunshine yellow
const GREEN = '#4FA84F';  // green
const CREAM = '#FFFFFF';  // card background (white per Giulia's feedback)
const OUTER = '#F5F4EF';  // page background: very soft neutral off-white, distinct from the white card

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
  grantBasics: 'https://lesko-help-2.mn.co/spaces/16590945',    // Grant Basics (Quick Guide Library)
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
const row = (inner, padding = '10px 40px') =>
  `<tr><td class="px" style="padding:${padding};">${inner}</td></tr>`;

const para = (html, opts = {}) =>
  row(
    `<p style="margin:0;font-family:${SANS};font-size:${opts.size || 17}px;line-height:${opts.lh || 27}px;color:${opts.color || INK};">${html}</p>`,
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
    '18px 40px'
  );

/* Matthew's sign-off. */
const signoff = () =>
  row(`
    <p style="margin:0;font-family:${SANS};font-size:17px;line-height:25px;color:${INK};">Talk soon,</p>
    <p style="margin:4px 0 0;font-family:${SERIF};font-style:italic;font-weight:700;font-size:26px;color:${NAVY};">Matthew</p>`,
    '14px 40px 4px');

/* Serif-italic P.S. line. */
const ps = html =>
  para(`<span style="font-family:${SERIF};font-style:italic;font-size:16px;color:${NAVY};">P.S. ${html}</span>`, {
    padding: '6px 40px 10px',
  });

/* Greeting + the Kit editor slot ({{ message_content }} flows in here). */
const greeting = () =>
  row(`
    <p style="margin:0 0 6px;font-family:${SANS};font-size:17px;line-height:27px;color:${INK};">Hi {{ subscriber.first_name }},</p>
    <div style="font-family:${SANS};font-size:17px;line-height:27px;color:${INK};">{{ message_content }}</div>`);

/* The 4-color stripe divider. */
const stripe = () =>
  row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="25%" height="6" style="background-color:${YELLOW};font-size:0;line-height:0;">&nbsp;</td>
      <td width="25%" height="6" style="background-color:${RED};font-size:0;line-height:0;">&nbsp;</td>
      <td width="25%" height="6" style="background-color:${GREEN};font-size:0;line-height:0;">&nbsp;</td>
      <td width="25%" height="6" style="background-color:${BLUE};font-size:0;line-height:0;">&nbsp;</td>
    </tr></table>`,
    '26px 40px 0'
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
  <tr><td align="center" style="padding:20px 8px 18px;">
    <table role="presentation" width="660" cellpadding="0" cellspacing="0" class="container" style="width:100%;max-width:660px;">

      <!-- masthead: suits + wordmark -->
      <tr><td style="padding:0 10px 14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td align="left" style="font-size:18px;line-height:18px;">${suitRow()}</td>
          <td align="right" style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:${NAVY};text-transform:uppercase;">Lesko Help &middot; New member guide</td>
        </tr></table>
      </td></tr>

      <!-- the card -->
      <tr><td style="background-color:${CREAM};border:1px solid ${NAVY};border-radius:16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

          <!-- chip row -->
          <tr><td class="px" style="padding:32px 40px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="background-color:${NAVY};border-radius:4px;padding:6px 12px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:${YELLOW};text-transform:uppercase;">Email ${String(e.n).padStart(2, '0')} &middot; ${e.dayChip}</td>
              <td style="padding-left:14px;">${label(e.chipLabel)}</td>
            </tr></table>
          </td></tr>

          <!-- headline + big question mark -->
          <tr><td class="px" style="padding:22px 40px 6px;">
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
          <tr><td class="px" style="padding:22px 40px 30px;">
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
              <a href="${LINKS.community}" style="color:${MUTED};">Open the community</a> &nbsp;&middot;&nbsp; <a href="{{ unsubscribe_url }}" style="color:${MUTED};">Unsubscribe</a>
            </p>
          </td></tr>

        </table>
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
    kitEmailId: 10185361,
    dayChip: 'Day 1',
    dayLabel: 'Day 1 · right after you join',
    chipLabel: 'Welcome & setup',
    subject: 'Pay attention, {{ subscriber.first_name }}: this email decides how your grant search goes',
    preheader: `Members who follow this onboarding have 80% more chance to find their grants. Your Roadmap is waiting inside.`,
    footerNote: SERIES_NOTE,
    h1: `Welcome! You're in ${em('exactly the right place.')}`,
    blocks: [
      greeting(),
      para(`I'm so happy you're here. Really. You just did something most people never do: you stopped wondering if help exists, and you joined the place where people actually find it.`),
      para(`And here's my promise to you: from today, you're not doing this alone. We're going to guide you, step by step. You'll always know what to do next.`),
      para(`We created an amazing <strong style="color:${NAVY};">Roadmap</strong> for you. It shows you the whole path in simple steps. That's your very first stop. Go take a look, it only takes a few minutes:`),
      cta(`Show me my Roadmap &rarr;`, LINKS.roadmap),
      para(`Then, while you're in there, do these <strong style="color:${NAVY};">3 small things</strong> today:`),
      steps([
        { n: 1, title: 'Add your photo', text: `Put a face to your name. Add one line about what you need money for.` },
        { n: 2, title: 'Turn on notifications', text: `So you never miss an answer or a class.` },
        { n: 3, title: 'Get the app', text: `Search for <strong>Mighty Networks</strong> in your app store, install it, and sign in with this same email. Now the community is right there in your pocket.` },
      ]),
      callout('green', 'Come say hi', `Tell us who you are in the ${link(LINKS.sayHi, 'Member Chat')}. Just say hi. You'll get a warm welcome, I promise.`),
      callout('blue', 'The Lesko way', `Every program has a real person whose job is to hand out the money. We help you find that person.`),
      signoff(),
      callout('yellow', 'Tomorrow in your inbox', `I'll show you around the community, so you always know where everything is. Watch for my email!`),
    ],
  },
  {
    n: 2,
    file: '02-welcome-tour.html',
    dayChip: 'Day 2',
    dayLabel: 'Day 2 · the welcome tour',
    chipLabel: 'Roadmap step 1',
    subject: '🚨 Members who take the Welcome Tour find grants way faster. Take yours today',
    preheader: `Join us live every day or watch the webinar now. In 13 minutes you know your way around like a pro.`,
    footerNote: SERIES_NOTE,
    h1: `Let me ${em('show you around.')}`,
    blocks: [
      greeting(),
      para(`How was your first look at the Roadmap? Today we take step 1, and it's the easiest one: the Welcome Tour.`),
      para(`Every day, my team gives a live tour of the community. We show you where everything is. You can ask anything you want. It takes about 30 minutes, and you leave knowing your way around.`),
      cta(`Save my seat on today's tour &rarr;`, LINKS.welcomeTour),
      callout('blue', `Can't make it live?`, `No problem. There's a short video in the same place. Watch it whenever suits you. Same tour, your couch.`),
      signoff(),
      callout('yellow', 'Tomorrow in your inbox', `We build your Call Sheet. That's your personal list of programs that fit YOU. It's where the money search really starts.`),
    ],
  },
  {
    n: 3,
    file: '03-call-sheet.html',
    dayChip: 'Day 3',
    dayLabel: 'Day 3 · your call sheet',
    chipLabel: 'Your call sheet',
    subject: `🚨 No call list, no grants. Let's build yours today, {{ subscriber.first_name }}`,
    preheader: `Your personalized call list is the perfect fit for YOU. Three easy ways to create one today.`,
    footerNote: SERIES_NOTE,
    h1: `Today we build ${em('your list.')}`,
    blocks: [
      greeting(),
      para(`Everything starts with your <strong style="color:${NAVY};">Call Sheet</strong>. It's a simple list of programs and offices that fit you: your state, your needs, your situation. When you have your list, you know exactly who to call.`),
      para(`There are 3 ways to build yours. Pick the one that feels easiest:`),
      steps([
        { n: 1, title: 'Come to a Call Sheet Class', text: `We build your list together, live. There's also a simple instruction page in the ${link(LINKS.callSheetClasses, 'same space')}.` },
        { n: 2, title: 'Use the AI Grant Researcher', text: `Tell it what you need. It digs through the programs for you. ${link(LINKS.aiResearcher, 'Try it here')}.` },
        { n: 3, title: 'Ask in the Questions Channel', text: `Not sure where to start? Just ask. My team answers every day. ${link(LINKS.questions, 'Ask here')}.` },
      ]),
      cta(`I want my Call Sheet &rarr;`, LINKS.callSheetClasses),
      callout('blue', 'No wrong choice', `All three roads end in the same place: your own list. Pick one and start today.`),
      signoff(),
      callout('yellow', 'Tomorrow in your inbox', `What to do with your list. This is the step where most people stop. Not you.`),
    ],
  },
  {
    n: 4,
    file: '04-applications.html',
    dayChip: 'Day 4',
    dayLabel: 'Day 4 · applications',
    chipLabel: 'Roadmap step 5',
    subject: `Grants go to people who apply. I know it's scary, {{ subscriber.first_name }}. I'll help you send yours`,
    preheader: `We walk you through real applications: making calls, sending emails, best practices.`,
    footerNote: SERIES_NOTE,
    h1: `Now we apply. ${em('Together.')}`,
    blocks: [
      greeting(),
      para(`When your list is ready, the next step is asking for the money. That means applications. And I know, forms are nobody's favorite thing. That's why here, we don't do them alone.`),
      para(`In our <strong style="color:${NAVY};">Application Classes</strong> we go through real applications together, step by step. Bring yours, or just watch and learn. Start with the instruction page, then join a class.`),
      cta(`I want help with my application &rarr;`, LINKS.applicationClasses),
      callout('red', 'The truth about applications', `A sent application can get a yes. A perfect application sitting on your desk cannot. Send it in.`),
      signoff(),
      callout('yellow', 'Tomorrow in your inbox', `I'll introduce you to our Group Coaching. Real coaches, real answers, every week.`),
    ],
  },
  {
    n: 5,
    file: '05-group-coaching.html',
    dayChip: 'Day 5',
    dayLabel: 'Day 5 · group coaching',
    chipLabel: 'Roadmap step 6',
    subject: `Stuck on your grant search? Get unstuck in today's class. My coaches will help you`,
    preheader: `Expert grant coaches, several classes a day. All questions are welcome. Or just come listen.`,
    footerNote: SERIES_NOTE,
    h1: `Bring us ${em('your questions.')}`,
    blocks: [
      greeting(),
      para(`By now you know the path: your list, then your calls, then your applications. And somewhere on that path, everyone gets stuck. Everyone. That's normal.`),
      para(`That's what our <strong style="color:${NAVY};">Group Coaching Classes</strong> are for. Real coaches, live. You ask, they answer. You can also just listen. Members tell us this is where things finally click.`),
      cta(`Save my seat in today's class &rarr;`, LINKS.groupCoaching),
      callout('green', 'No question is too small', `"Where do I even start?" is a great question. We hear it every day. Come ask yours.`),
      signoff(),
      callout('yellow', 'Tomorrow in your inbox', `The man himself. I'll tell you about Ask Matthew Live.`),
    ],
  },
  {
    n: 6,
    file: '06-ask-matthew.html',
    dayChip: 'Day 6',
    dayLabel: 'Day 6 · ask matthew live',
    chipLabel: 'Roadmap step 7',
    subject: `It's Matthew. I answer member questions live today. Bring me yours. Yes, really`,
    preheader: `I love helping people with money programs, grants, and your specific situation. I've been doing this for 40 years.`,
    footerNote: SERIES_NOTE,
    h1: `Ask me anything. ${em('Live.')}`,
    blocks: [
      greeting(),
      para(`I do a live session where you can ask me anything. About money, about programs, about your situation. I've been doing this for more than 40 years, and I still love every question.`),
      para(`Come once, and you'll understand what this community is all about. Bring a question, or just come listen and get inspired.`),
      cta(`I want to ask Matthew &rarr;`, LINKS.askMatthew),
      callout('blue', 'Why I do this', `Because questions are free. Always were. The only expensive thing is not asking.`),
      signoff(),
      callout('yellow', 'Tomorrow in your inbox', `Something special for everyone who dreams of their own business or nonprofit.`),
    ],
  },
  {
    n: 7,
    file: '07-business-hub.html',
    dayChip: 'Day 7',
    dayLabel: 'Day 7 · business hub',
    chipLabel: 'Business hub',
    subject: `Want a business, a nonprofit, or a new career? I know where the money is. Let me show you`,
    preheader: `In Lesko Pro you'll find programs, resources, classes, expert coaches, and members doing it with you.`,
    footerNote: SERIES_NOTE,
    h1: `Money to ${em('start something.')}`,
    blocks: [
      greeting(),
      para(`Lots of members come here with a dream: their own business. Their own nonprofit. A fresh start in their career. If that's you, today's stop is your new favorite place.`),
      para(`Our <strong style="color:${NAVY};">Business Hub</strong> is full of help for starting and growing: programs, classes, and people who have done it before you.`),
      cta(`Show me the money &rarr;`, LINKS.businessHub),
      callout('green', 'Not your dream? No problem', `Skip this one. Your Roadmap works for bills, housing, and everything else too. Tomorrow's email is for everyone.`),
      signoff(),
      callout('yellow', 'Tomorrow in your inbox', `Our last stop: all the extra treasures in the community, in one email. Don't miss it.`),
    ],
  },
  {
    n: 8,
    file: '08-keep-exploring.html',
    dayChip: 'Day 8',
    dayLabel: 'Day 8 · keep exploring',
    chipLabel: 'Keep exploring',
    subject: `Don't stop one step before the money. Keep going. Here's how members keep winning`,
    preheader: `Motivation, accountability, and a daily habit. That's how members win.`,
    footerNote: SERIES_NOTE,
    h1: `You know the way. ${em('Keep going.')}`,
    blocks: [
      greeting(),
      para(`Eight days ago you were new here. Now look at you: you know the Roadmap, your list, the classes, and the people. I'm proud of you. Really.`),
      para(`Before I let you go, here are three more places worth knowing:`),
      steps([
        { n: 1, title: 'Quick Guides', text: `Simple help pages for bills, housing, health care, family, and more. Start with ${link(LINKS.grantBasics, 'Grant Basics')}.` },
        { n: 2, title: 'The FAQ Zone', text: `Answers to the questions everyone asks. ${link(LINKS.faqZone, 'Have a look')}.` },
        { n: 3, title: 'Success Stories', text: `Real members who got their yes. Read a few. That will be you.` },
      ]),
      cta(`I want to be the next success story &rarr;`, LINKS.successStories),
      callout('yellow', 'The daily habit', `<strong>One small step, every day.</strong> A class, a call, or one question in the community. Keep showing up and you will be amazed where you are in a few months.`),
      signoff(),
      callout('blue', 'This is not goodbye', `This was your welcome week, but I'm not going anywhere. Watch your inbox, come see me live any time, and when you get your first yes, tell us in Success Stories. I can't wait to read yours.`),
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

/* Kit-ready content fragments — what gets pushed via the Kit MCP as sequence
   email content. Only {{ message_content }} is dropped (that slot belongs to a
   template, not to a finished email). Kit REQUIRES {{ unsubscribe_url }} in the
   email body before a sequence can be published, so address + unsubscribe stay. */
const toKitContent = html => {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].trim();
  return body.replace(/\s*<div style="font-family:[^"]*">\{\{ message_content \}\}<\/div>/, '');
};
fs.mkdirSync(path.join(root, 'emails', 'kit'), { recursive: true });
for (const e of EMAILS) {
  const c = toKitContent(renderEmail(e));
  const visible = c.replace(/<!--[\s\S]*?-->/g, '');
  if (/&mdash;|—/.test(visible)) console.warn(`⚠ emails/kit/${e.file}: long dash found!`);
  if (visible.includes('{{ message_content }}')) console.warn(`⚠ emails/kit/${e.file}: message_content left in!`);
  if (!visible.includes('{{ unsubscribe_url }}')) console.warn(`⚠ emails/kit/${e.file}: MISSING unsubscribe tag, Kit will refuse to publish!`);
  fs.writeFileSync(path.join(root, 'emails', 'kit', e.file), c);
  console.log(`✓ emails/kit/${e.file}`);
}

/* Machine-readable push manifest for the Kit helper session. Kit email ids
   already recorded in the manifest are preserved so re-pushes update the same
   drafts instead of creating duplicates. */
const KIT_SEQUENCE_ID = 2818978;
const manifestPath = path.join(root, 'emails', 'kit', 'manifest.json');
let knownIds = {};
try {
  knownIds = Object.fromEntries(
    JSON.parse(fs.readFileSync(manifestPath, 'utf8')).emails.map(e => [e.n, e.kit_email_id])
  );
} catch {}
fs.writeFileSync(
  path.join(root, 'emails', 'kit', 'manifest.json'),
  JSON.stringify(
    {
      sequence_id: KIT_SEQUENCE_ID,
      note: 'kit_email_id null = create as new unpublished draft; otherwise update that email in place. Content = the matching file in this folder, verbatim.',
      emails: EMAILS.map(e => ({
        n: e.n,
        file: e.file,
        subject: e.subject,
        preview_text: e.preheader,
        delay_value: e.n === 1 ? 0 : 1,
        delay_unit: 'days',
        kit_email_id: knownIds[e.n] || e.kitEmailId || null,
      })),
    },
    null,
    2
  )
);
console.log('✓ emails/kit/manifest.json');

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
