/**
 * Lesko Help — the letter.
 * ------------------------
 * Shared stationery for every Lesko Help sequence. A build script supplies the
 * words; this file decides what the letter looks like, checks the house rules
 * and writes the output. Two sequences use it, so a change here changes both.
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

/* Where a member goes when they are stuck. Giulia's, 2026-09-08: this has to be
   everywhere, so it sits in the shared footer of every letter. */
const SUPPORT = 'leskohelp@gmail.com';

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

/* An appendix below the signature, for something the reader may need again but
   that should not weigh down the letter itself. Same hairline and mono kicker
   as the letterhead, so it reads as part of the stationery. */
const recap = (heading, list, note) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 0;">
  <tr><td style="border-top:1px solid ${RULE};padding-top:18px;">
    <div style="font-family:${MONO};font-size:10px;letter-spacing:1.6px;color:${MUTED};text-transform:uppercase;padding-bottom:14px;">${heading}</div>
    ${steps(list)}${note ? `
    <p style="margin:0;font-family:${SANS};font-size:16px;line-height:26px;color:${INK};">${note}</p>` : ''}
  </td></tr>
</table>`;

/* The P.S. carries the nudge towards the next email. */
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
        ${ps(e.ps)}${e.recap || ''}
      </td></tr>

      <!-- footer -->
      <tr><td class="px" style="padding:30px 46px 40px;">
        <div style="border-top:1px solid ${RULE};padding-top:16px;">
          <p style="margin:0;font-family:${SANS};font-size:12px;line-height:20px;color:${MUTED};">
            You're getting this because you joined the Lesko Help community.<br>
            Need a hand? Write to <a href="mailto:${SUPPORT}" style="color:${MUTED};">${SUPPORT}</a> and a real person will answer.<br>
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

/* ----------------------------------------------------------------- output */

/* Kit gets the body only. Kit supplies its own address line, but it refuses to
   publish a sequence unless the body itself carries an unsubscribe tag. */
const toKitContent = html => html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].trim();

/**
 * Write one sequence: standalone previews, Kit fragments, a push manifest and
 * a local gallery. Exits non-zero if any house rule is broken, so a bad letter
 * can never reach Kit.
 *
 *   root        absolute path of the repo
 *   dir         folder for this sequence's html, e.g. 'emails'
 *   preview     gallery filename under preview/, e.g. 'index.html'
 *   title       gallery heading, e.g. 'Onboarding letters.'
 *   sequenceId  Kit sequence the manifest targets
 *   emails      the letters
 *   delayFor    (email) => days to wait before sending it
 */
function emit({ root, dir, preview, title, sequenceId, emails, delayFor }) {
  for (const d of [dir, path.join(dir, 'kit'), 'preview']) {
    fs.mkdirSync(path.join(root, d), { recursive: true });
  }
  /* Clear both folders, so a renamed letter cannot leave a stale twin behind for
     somebody to push to Kit by mistake. The manifest is not html, so it stays. */
  for (const d of [dir, path.join(dir, 'kit')]) {
    for (const f of fs.readdirSync(path.join(root, d))) {
      if (f.endsWith('.html')) fs.unlinkSync(path.join(root, d, f));
    }
  }

  let problems = 0;
  for (const e of emails) {
    const full = renderEmail(e);
    const kit = toKitContent(full);
    const visible = kit.replace(/<!--[\s\S]*?-->/g, '');

    if (/&mdash;|&ndash;|—|–/.test(visible)) { console.error(`✗ ${e.file}: long dash found`); problems++; }
    if (!visible.includes('{{ unsubscribe_url }}')) { console.error(`✗ ${e.file}: no unsubscribe tag, Kit will refuse to publish`); problems++; }
    if (!visible.includes('{{ subscriber.first_name }}')) { console.error(`✗ ${e.file}: personalization tag missing`); problems++; }
    if (visible.includes('{{ message_content }}') || visible.includes('{{ address }}')) { console.error(`✗ ${e.file}: template-only tag left in`); problems++; }
    /* Members DO set a password, after the 6-digit code. An earlier draft said
       otherwise and would have stranded people at the last step. */
    if (/no password|never need a password|without a password/i.test(visible)) {
      console.error(`✗ ${e.file}: says there is no password. There is one, members choose it after the code.`);
      problems++;
    }

    fs.writeFileSync(path.join(root, dir, e.file), full);
    fs.writeFileSync(path.join(root, dir, 'kit', e.file), kit);
    console.log(`✓ ${e.file}  (${(kit.length / 1024).toFixed(1)} KB)`);
  }

  /* Push manifest. Existing Kit email ids are preserved so re-pushes update the
     same drafts instead of creating duplicates. */
  const manifestPath = path.join(root, dir, 'kit', 'manifest.json');
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
        sequence_id: sequenceId,
        note: 'kit_email_id null = create as new draft; otherwise update in place. Content = the matching file in this folder, verbatim.',
        emails: emails.map(e => ({
          n: e.n,
          file: e.file,
          subject: e.subject,
          preview_text: e.preheader,
          delay_value: delayFor(e),
          delay_unit: 'days',
          kit_email_id: knownIds[e.n] || null,
        })),
      },
      null,
      2
    )
  );
  console.log(`✓ ${dir}/kit/manifest.json`);

  /* Local gallery. */
  fs.writeFileSync(
    path.join(root, 'preview', preview),
    `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
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
<h1>${title.replace(/\s(\S+)$/, ' <em>$1</em>')}</h1>
<div class="sub">Lesko Help &middot; ${emails.length} emails</div>
${emails.map(e => `<section class="e">
  <div class="day">${e.day}</div>
  <h2>${e.subject.replace(/{{[^}]*}}/g, '[name]')}</h2>
  <p class="pre">${e.preheader}</p>
  <iframe src="../${dir}/${e.file}" loading="lazy" title="${e.day}"></iframe>
</section>`).join('\n')}
</div></body></html>`
  );
  console.log(`✓ preview/${preview}`);

  if (problems) {
    console.error(`\n${problems} problem(s) found. Fix before pushing to Kit.`);
    process.exit(1);
  }
  console.log('\nAll checks passed.');
}

const mailto = () => `<a href="mailto:${SUPPORT}" style="color:${BLUE};font-weight:bold;">${SUPPORT}</a>`;

module.exports = { LINKS, SUPPORT, link, mailto, b, p, steps, cta, recap, emit };
