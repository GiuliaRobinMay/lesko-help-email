#!/usr/bin/env node
/**
 * Lesko Help — Member Onboarding Email Sequence
 * ---------------------------------------------
 * A personal letter from Matthew on Lesko Help stationery.
 *
 *   node build.js
 *
 * Outputs:
 *   emails/*.html      → standalone previews (screenshots, browser)
 *   emails/kit/*.html  → what gets pushed into Kit as sequence email content
 *   emails/kit/manifest.json → subjects, preview texts and Kit email ids
 *   preview/index.html → local gallery of the whole sequence
 *
 * DESIGN: letterhead, not brochure. The brand lives in the masthead, the
 * paper, one yellow button and the signature. No cards, chips, tinted panels
 * or dividers — those read as marketing and the audience reads them as such.
 *
 * HOUSE RULES (Giulia's, and they are strict):
 *   - Matthew writes in the first person to one member. No self-introduction.
 *   - Very plain language. Short sentences. Roughly 5th-grade reading level.
 *   - NO long dashes anywhere. The build fails loudly if one appears.
 *   - Personalization tag is exactly {{ subscriber.first_name }}.
 *   - Subjects: warm and concrete, never hype. No emoji, no ALL CAPS, no
 *     "Pay attention". A quiet "Step N" carries the importance instead.
 *   - Kit needs {{ unsubscribe_url }} in the body or it refuses to publish.
 *     Kit appends its own address line, so we do not repeat it.
 */

const fs = require('fs');
const path = require('path');

/* ---------------------------------------------------------------- palette */

const NAVY = '#18234A';   // ink, headings, signature
const INK = '#2F3548';    // body text
const MUTED = '#8A8F9E';  // footer, small print
const RED = '#E63946';    // wordmark accent, list numerals
const BLUE = '#2C3FA0';   // links
const YELLOW = '#FDC830'; // the one button
const GREEN = '#4FA84F';  // suit only
const PAPER = '#FFFDF8';  // the letter itself
const OUTER = '#F2F0EA';  // the desk it lies on
const RULE = '#E7E3D8';   // hairlines

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'Courier New',Courier,monospace";

/* Matthew's photo, already hosted on the community. Swap this constant if
   Giulia uploads a different portrait to Kit. */
const PHOTO =
  'https://media1-production-mightynetworks.imgix.net/asset/7984cbd1-4267-4cfb-99bc-e3718bb708c3/Profile_Matthew_03.png?ixlib=rails-4.3.1&auto=format&w=160&h=160&fit=crop&crop=faces';

/* ------------------------------------------------- community destinations */

const LINKS = {
  community: 'https://lesko-help-2.mn.co/',
  roadmap: 'https://lesko-help-2.mn.co/spaces/24365840/page',
  welcomeTour: 'https://lesko-help-2.mn.co/spaces/24366161',
  tourEvent: 'https://lesko-help-2.mn.co/posts/104965991',
  callSheetClasses: 'https://lesko-help-2.mn.co/spaces/24440881',
  aiResearcher: 'https://lesko-help-2.mn.co/spaces/24461105',
  groupCoaching: 'https://lesko-help-2.mn.co/spaces/24366194',
  askMatthew: 'https://lesko-help-2.mn.co/spaces/21948411',
  replays: 'https://lesko-help-2.mn.co/spaces/24487048',
  questions: 'https://lesko-help-2.mn.co/spaces/24366155',
  applicationClasses: 'https://lesko-help-2.mn.co/spaces/24366189',
  successStories: 'https://lesko-help-2.mn.co/spaces/10351370',
  sayHi: 'https://lesko-help-2.mn.co/spaces/22851440/feed',
  businessHub: 'https://lesko-help-2.mn.co/spaces/18083958',
  faqZone: 'https://lesko-help-2.mn.co/spaces/20304678',
  grantBasics: 'https://lesko-help-2.mn.co/spaces/16590945',
};

/* ------------------------------------------------------------ letter parts */

const link = (url, text) => `<a href="${url}" style="color:${BLUE};font-weight:bold;">${text}</a>`;
const b = text => `<strong style="color:${NAVY};">${text}</strong>`;

/* A paragraph of the letter. */
const p = html =>
  `<p style="margin:0 0 18px;font-family:${SANS};font-size:17px;line-height:29px;color:${INK};">${html}</p>`;

/* A short numbered list. Red numerals, no circles, no badges. */
const steps = list => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
${list
  .map(
    (s, i) => `  <tr>
    <td width="26" valign="top" style="font-family:${SERIF};font-size:17px;font-weight:bold;color:${RED};padding:0 0 12px;">${i + 1}.</td>
    <td valign="top" style="padding:0 0 12px;font-family:${SANS};font-size:17px;line-height:27px;color:${INK};">${b(s.title + '.')} ${s.text}</td>
  </tr>`
  )
  .join('\n')}
</table>`;

/* The single call to action. */
const cta = (label, url) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:2px 0 26px;">
  <tr><td style="background:${YELLOW};border-radius:6px;">
    <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:16px;font-weight:bold;color:${NAVY};text-decoration:none;">${label} &nbsp;&rarr;</a>
  </td></tr>
</table>`;

/* Sign-off. Typographic, not an image. */
const signoff = () => `
<p style="margin:26px 0 4px;font-family:${SANS};font-size:17px;line-height:27px;color:${INK};">Talk soon,</p>
<p style="margin:0;font-family:${SERIF};font-style:italic;font-weight:bold;font-size:30px;line-height:36px;color:${NAVY};">Matthew</p>`;

/* The P.S. carries the nudge towards tomorrow's email. */
const ps = html => `
<p style="margin:22px 0 0;font-family:${SANS};font-size:16px;line-height:26px;">
  <em style="font-family:${SERIF};font-size:17px;color:${INK};">P.S. ${html}</em>
</p>`;

/* ------------------------------------------------------------- the letter */

function renderEmail(e) {
  const preheaderPad = '&nbsp;&zwnj;'.repeat(90);
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${e.subject.replace(/{{[^}]*}}/g, '').trim()}</title>
<style>
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  table { border-collapse:separate; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  a { color:${BLUE}; }
  @media only screen and (max-width:620px) {
    .px { padding-left:24px !important; padding-right:24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${OUTER};">
<div style="display:none;font-size:1px;color:${OUTER};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${e.preheader}${preheaderPad}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${OUTER}" style="background-color:${OUTER};">
  <tr><td align="center" style="padding:26px 10px 34px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:${PAPER};">

      <!-- letterhead -->
      <tr><td class="px" style="padding:34px 46px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="66" valign="middle">
            <img src="${PHOTO}" width="56" height="56" alt="Matthew Lesko" style="display:block;width:56px;height:56px;border-radius:50%;border:2px solid ${NAVY};">
          </td>
          <td valign="middle" style="padding-left:4px;">
            <div style="font-family:${SERIF};font-size:20px;font-weight:bold;color:${NAVY};line-height:24px;">
              <span style="color:${RED};font-style:italic;">Lesko</span> Help
            </div>
            <div style="font-family:${MONO};font-size:10px;letter-spacing:1.6px;color:${MUTED};text-transform:uppercase;padding-top:3px;">A letter from Matthew</div>
          </td>
          <td align="right" valign="middle" style="font-size:22px;line-height:22px;letter-spacing:6px;">
            <span style="color:${BLUE};">&#9824;</span><span style="color:${RED};">&#9829;</span><span style="color:${YELLOW};">&#9830;</span><span style="color:${GREEN};">&#9827;</span>
          </td>
        </tr></table>
        <div style="border-bottom:1px solid ${RULE};margin:16px 0 0;font-size:0;line-height:0;">&nbsp;</div>
      </td></tr>

      <!-- the letter itself -->
      <tr><td class="px" style="padding:28px 46px 0;">
        ${p(`Hi {{ subscriber.first_name }},`)}
        ${e.blocks.join('\n        ')}
        ${signoff()}
        ${ps(e.ps)}
      </td></tr>

      <!-- footer -->
      <tr><td class="px" style="padding:30px 46px 40px;">
        <div style="border-top:1px solid ${RULE};padding-top:16px;">
          <p style="margin:0;font-family:${SANS};font-size:12px;line-height:20px;color:${MUTED};">
            You're getting this because you joined the Lesko Help community.<br>
            <a href="${LINKS.community}" style="color:${MUTED};">Open the community</a> &nbsp;&middot;&nbsp; <a href="{{ unsubscribe_url }}" style="color:${MUTED};">Unsubscribe</a>
          </p>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ------------------------------------------------------------- the emails */

const EMAILS = [
  {
    n: 1,
    file: '01-welcome.html',
    day: 'Day 1',
    subject: 'Start here: your Roadmap to your first grant',
    preheader: `Welcome. Open your Roadmap and do three small things today.`,
    blocks: [
      p(`I'm so happy you're here. Really. You just did something most people never do: you stopped wondering if help exists, and you joined the place where people actually find it.`),
      p(`Here's my promise to you. From today, you're not doing this alone. We're going to guide you, step by step, and you'll always know what to do next.`),
      p(`We made you an amazing ${b('Roadmap')}. It shows you the whole path in simple steps. That's your very first stop, and it only takes a few minutes to look at.`),
      cta('Show me my Roadmap', LINKS.roadmap),
      p(`Then, while you're in there, do these ${b('3 small things')} today:`),
      steps([
        { title: 'Add your photo', text: `Put a face to your name. Add one line about what you need money for.` },
        { title: 'Turn on notifications', text: `So you never miss an answer or a class.` },
        { title: 'Get the app', text: `Search for ${b('Mighty Networks')} in your app store and sign in with this same email.` },
      ]),
      p(`One more thing. Come say hi in the ${link(LINKS.sayHi, 'Member Chat')} and tell us who you are. You'll get a warm welcome, I promise.`),
    ],
    ps: `Tomorrow I'll show you around the community, so you always know where everything is. Watch for my email.`,
  },
  {
    n: 2,
    file: '02-welcome-tour.html',
    day: 'Day 2',
    subject: 'Step 1: let me show you around the community',
    preheader: `A live tour every day at 11 AM New York time. Or watch it whenever you like.`,
    blocks: [
      p(`How was your first look at the Roadmap? Today we take step 1, and it's the easiest one of all.`),
      p(`Every day at ${b('11 AM New York time')}, my team gives a live tour of the community. We show you where everything is, and you can ask anything you want. In 30 minutes you'll know your way around like a member who has been here for months.`),
      cta(`Save my seat on today's tour`, LINKS.tourEvent),
      p(`Can't make it live? No problem at all. The tours are recorded, so you can ${link(LINKS.replays, 'watch one whenever it suits you')}. Same tour, your own couch.`),
    ],
    ps: `Tomorrow we build your call list. That's your own list of grant programs that fit you, and it's where the real search begins.`,
  },
  {
    n: 3,
    file: '03-call-sheet.html',
    day: 'Day 3',
    subject: 'Step 2: build your personal grant call list',
    preheader: `Programs that fit you, not ten thousand search results. Three easy ways to make yours.`,
    blocks: [
      p(`Everything starts with your ${b('call list')}. It's a simple list of grant programs and offices that fit you: your state, your needs, your situation. Once you have your list, you know exactly who to call.`),
      p(`There are three ways to build yours. Pick whichever feels easiest today:`),
      steps([
        { title: 'Use the AI Grant Researcher', text: `The fastest way. Tell it what you need and it digs through the programs for you, at any hour. ${link(LINKS.aiResearcher, 'Try it now')}.` },
        { title: 'Come to a Call Sheet Class', text: `We build your list together, live. There's a simple instruction page in the ${link(LINKS.callSheetClasses, 'same place')}.` },
        { title: 'Ask in the Questions Channel', text: `Not sure where to start? Just ask. My team answers every day. ${link(LINKS.questions, 'Ask here')}.` },
      ]),
      cta('I want my call list', LINKS.aiResearcher),
      p(`All three roads end in the same place: your own list. Pick one and start today.`),
    ],
    ps: `Tomorrow, what to do with your list. This is the step where most people stop. Not you.`,
  },
  {
    n: 4,
    file: '04-applications.html',
    day: 'Day 4',
    subject: 'Step 3: applying for grants, with help from us',
    preheader: `Nobody fills in these forms alone here. We go through real applications together.`,
    blocks: [
      p(`When your list is ready, the next step is asking for the money. That means applications. And I know, forms are nobody's favourite thing. That's exactly why here, you don't do them alone.`),
      p(`In our ${b('Application Classes')} we go through real applications together, step by step. Bring your own, or just watch and learn how it works.`),
      cta('I want help with my application', LINKS.applicationClasses),
      p(`Not ready to join a class yet? That's fine. Ask anything in the ${link(LINKS.questions, 'Questions Channel')} first, or come to a class and simply listen.`),
      p(`One thing worth remembering: a sent application can get a yes. A perfect application sitting on your desk cannot.`),
    ],
    ps: `Tomorrow I'll introduce you to our coaches. Real people, live, every week.`,
  },
  {
    n: 5,
    file: '05-group-coaching.html',
    day: 'Day 5',
    subject: 'Step 4: get your questions answered by a coach',
    preheader: `Everybody gets stuck. This is the room where you get unstuck.`,
    blocks: [
      p(`By now you know the path: your list, then your calls, then your applications. And somewhere along that path, everyone gets stuck. Everyone. That is completely normal.`),
      p(`That's what our ${b('Group Coaching Classes')} are for. Expert grant coaches, live, several classes a day. You ask, they answer. You can also just come and listen.`),
      cta(`Save my seat in today's class`, LINKS.groupCoaching),
      p(`And no question is too small. "Where do I even start?" is a great question. We hear it every single day.`),
    ],
    ps: `Tomorrow, something special. You get to talk to me directly.`,
  },
  {
    n: 6,
    file: '06-ask-matthew.html',
    day: 'Day 6',
    subject: 'Step 5: come and ask me anything, live',
    preheader: `I answer member questions live. About money, programs, and your own situation.`,
    blocks: [
      p(`I do a live session where you can ask me anything. About money, about programs, about your own situation. I've been doing this for more than 40 years and I still love every question.`),
      p(`Come once and you'll understand what this community is really about. Bring a question, or just come and listen.`),
      cta('I want to ask Matthew', LINKS.askMatthew),
      p(`Why do I do this? Because questions are free. They always were. The only expensive thing is not asking.`),
    ],
    ps: `Tomorrow, something for everyone who dreams of their own business or nonprofit.`,
  },
  {
    n: 7,
    file: '07-business-hub.html',
    day: 'Day 7',
    subject: 'If you want your own business, this one is for you',
    preheader: `Grant money exists for starting a business, a nonprofit, or a new career.`,
    blocks: [
      p(`A lot of members come here with a dream. Their own business. Their own nonprofit. A fresh start in their career. If that sounds like you, today's stop is going to be your new favourite place.`),
      p(`Our ${b('Business Hub')} is full of help for starting and growing: programs, resources, classes, expert coaches, and other members doing it right alongside you.`),
      cta('Show me the money', LINKS.businessHub),
      p(`Not your dream? Skip this one with my blessing. Your Roadmap works just as well for bills, housing, health care and everything else. Tomorrow's email is for everyone.`),
    ],
    ps: `Tomorrow is our last stop together, and it's the one that keeps everything going.`,
  },
  {
    n: 8,
    file: '08-keep-exploring.html',
    day: 'Day 8',
    subject: 'The habit that finds members their grants',
    preheader: `Guides, answers, and real stories from members who got their yes.`,
    blocks: [
      p(`Eight days ago you were brand new here. Now look at you. You know the Roadmap, your call list, the classes and the people. I'm proud of you. Really.`),
      p(`Before I let you go, three more places worth knowing about:`),
      steps([
        { title: 'Quick Guides', text: `Simple help pages for bills, housing, health care, families and more. Start with ${link(LINKS.grantBasics, 'Grant Basics')}.` },
        { title: 'The FAQ Zone', text: `Answers to the questions everybody asks. ${link(LINKS.faqZone, 'Have a look')}.` },
        { title: 'Success Stories', text: `Real members who got their yes. Read a few. That will be you.` },
      ]),
      cta('I want to be the next success story', LINKS.successStories),
      p(`And here's the habit that actually works: ${b('one small step every day')}. A class, a call, or one question in the community. Keep showing up and you'll be amazed where you are in a few months.`),
      p(`This is not goodbye. I'm not going anywhere. Come and see me live any time, and when you get your first yes, tell us in Success Stories. I can't wait to read yours.`),
    ],
    ps: `Every member who found money started exactly where you are standing today.`,
  },
];

/* ----------------------------------------------------------------- output */

const root = __dirname;
for (const dir of ['emails', 'emails/kit', 'preview']) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}
for (const f of fs.readdirSync(path.join(root, 'emails'))) {
  if (f.endsWith('.html')) fs.unlinkSync(path.join(root, 'emails', f));
}

/* Kit gets the body only. Kit supplies its own address line, but it refuses to
   publish a sequence unless the body itself carries an unsubscribe tag. */
const toKitContent = html => html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].trim();

let problems = 0;
for (const e of EMAILS) {
  const full = renderEmail(e);
  const kit = toKitContent(full);
  const visible = kit.replace(/<!--[\s\S]*?-->/g, '');

  if (/&mdash;|&ndash;|—|–/.test(visible)) { console.error(`✗ ${e.file}: long dash found`); problems++; }
  if (!visible.includes('{{ unsubscribe_url }}')) { console.error(`✗ ${e.file}: no unsubscribe tag, Kit will refuse to publish`); problems++; }
  if (!visible.includes('{{ subscriber.first_name }}')) { console.error(`✗ ${e.file}: personalization tag missing`); problems++; }
  if (visible.includes('{{ message_content }}') || visible.includes('{{ address }}')) { console.error(`✗ ${e.file}: template-only tag left in`); problems++; }

  fs.writeFileSync(path.join(root, 'emails', e.file), full);
  fs.writeFileSync(path.join(root, 'emails', 'kit', e.file), kit);
  console.log(`✓ ${e.file}  (${(kit.length / 1024).toFixed(1)} KB)`);
}

/* Push manifest. Existing Kit email ids are preserved so re-pushes update the
   same drafts instead of creating duplicates. */
const manifestPath = path.join(root, 'emails', 'kit', 'manifest.json');
let knownIds = {};
try {
  knownIds = Object.fromEntries(
    JSON.parse(fs.readFileSync(manifestPath, 'utf8')).emails.map(x => [x.n, x.kit_email_id])
  );
} catch {}

fs.writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      sequence_id: 2818978,
      note: 'kit_email_id null = create as new draft; otherwise update in place. Content = the matching file in this folder, verbatim.',
      emails: EMAILS.map(e => ({
        n: e.n,
        file: e.file,
        subject: e.subject,
        preview_text: e.preheader,
        delay_value: e.n === 1 ? 0 : 1,
        delay_unit: 'days',
        kit_email_id: knownIds[e.n] || null,
      })),
    },
    null,
    2
  )
);
console.log('✓ emails/kit/manifest.json');

/* Local gallery. */
fs.writeFileSync(
  path.join(root, 'preview', 'index.html'),
  `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Lesko Help onboarding</title>
<style>
 body{margin:0;background:${OUTER};font-family:${SANS};color:${NAVY};}
 .wrap{max-width:780px;margin:0 auto;padding:44px 20px 80px;}
 h1{font-family:${SERIF};font-size:38px;margin:0 0 4px;} h1 em{color:${RED};}
 .sub{font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-bottom:36px;}
 .e{background:${PAPER};border:1px solid ${RULE};border-radius:12px;padding:22px 24px;margin:0 0 20px;}
 .day{font-family:${MONO};font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:${RED};}
 h2{font-family:${SERIF};font-size:21px;margin:6px 0 2px;}
 .pre{color:${MUTED};font-size:14px;margin:0 0 14px;}
 iframe{width:100%;height:1200px;border:1px solid ${RULE};border-radius:8px;background:${OUTER};}
</style></head><body><div class="wrap">
<h1>Onboarding <em>letters.</em></h1>
<div class="sub">Lesko Help &middot; ${EMAILS.length} emails &middot; one per day</div>
${EMAILS.map(e => `<section class="e">
  <div class="day">${e.day}</div>
  <h2>${e.subject.replace(/{{[^}]*}}/g, '[name]')}</h2>
  <p class="pre">${e.preheader}</p>
  <iframe src="../emails/${e.file}" loading="lazy" title="${e.day}"></iframe>
</section>`).join('\n')}
</div></body></html>`
);
console.log('✓ preview/index.html');

if (problems) {
  console.error(`\n${problems} problem(s) found. Fix before pushing to Kit.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
