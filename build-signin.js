#!/usr/bin/env node
/**
 * Lesko Help — "Never Signed In" Email Sequence
 * --------------------------------------------
 * Five letters from Matthew to somebody who bought a membership and then never
 * opened it. 625 people, 471 of them paying. Warm, grateful, never scolding:
 * they did not fail, they just met a door they did not know how to open.
 *
 *   node build-signin.js
 *
 * The stationery, the house rules and all the output live in letter.js.
 * This file is only the words.
 *
 * TWO RULES SPECIFIC TO THIS SEQUENCE
 *
 * 1. Keep the letters SHORT. The job is to get somebody through a door, not to
 *    be read. Three or four short paragraphs, then the button. If a sentence is
 *    not moving them towards signing in, cut it.
 *
 * 2. The sign-in steps go BELOW the signature, in every single letter, under
 *    "lost the instructions". They will open one of the five, not all five, and
 *    whichever one they open has to be able to get them in on its own. Keeping
 *    the steps out of the body is what lets the body stay short.
 *
 * THE FACT THE WHOLE SEQUENCE TURNS ON: nobody ever sent them a password, they
 * make their own. First sign-in goes email address, then a 6-digit code we mail
 * them, then they choose a password on the spot. Almost everybody who is stuck
 * is hunting an inbox for a password that was never sent.
 *
 * Do not write "there is no password" anywhere. There is one, they just have to
 * invent it. Saying otherwise strands them at the very last step. letter.js
 * fails the build over it.
 */

const { LINKS, link, mailto, b, p, cta, recap, emit } = require('./letter');

/* The five steps, in the same words in every letter.
   The important thing here, and Giulia was firm about it: they do NOT have to
   go digging for some old code we sent days ago. They ASK for the code from the
   page, and it arrives while they are sitting there. So the instructions work
   the same whenever somebody opens the letter, and no step depends on an email
   they may already have lost or deleted. */
const SIGNIN = [
  { title: 'Click the link', text: `Go to ${link(LINKS.community, 'lesko-help-2.mn.co')}.` },
  { title: 'Type in your email address', text: `The same one we send these letters to, the address this letter arrived at. That's how we find your account.` },
  { title: 'Click "Send me the code"', text: `We email you a fresh 6-digit code straight away. You ask for it, so you never have to go looking for an old one.` },
  { title: 'Fetch the code and come back', text: `It lands in your inbox in a minute or two, from ${b('Lesko Help 2')}. If you don't see it, look in your spam folder. Type it in on the page. You have 30 minutes.` },
  { title: 'Make up your own password', text: `Nobody sent you one, you choose it yourself right there. Write it down somewhere safe, because that's how you'll get in from now on.` },
];

const INSTRUCTIONS = recap(
  'Lost the instructions? Here they are again',
  SIGNIN,
  `Still can't get in? Write to ${mailto()} and tell us what happened. A real person will help you.`
);

/* ------------------------------------------------------------- the emails */

const EMAILS = [
  {
    n: 1,
    file: '01-your-account-is-ready.html',
    day: 'Day 1',
    subject: 'Your Lesko Help account is ready and waiting for you',
    preheader: `You haven't been inside yet. Your first sign-in takes about a minute.`,
    blocks: [
      p(`Thank you for joining Lesko Help. Now one thing straight: ${b(`you haven't been inside yet.`)} Your account is paid for and ready, and nobody has opened it.`),
      p(`The classes, the coaches, the grant programs, me. All of it is in there waiting for you.`),
      p(`What trips people up is this: ${b('nobody ever sent you a password')}. You make your own, the first time you go in. The steps are at the bottom.`),
      cta('Take me to my account', LINKS.community),
    ],
    ps: `It takes about a minute. Really.`,
    recap: INSTRUCTIONS,
  },
  {
    n: 2,
    file: '02-make-your-own-password.html',
    day: 'Day 3',
    subject: 'Nobody sent you a password. You make your own',
    preheader: `First a 6-digit code, then you pick your password. That's the part people miss.`,
    blocks: [
      p(`If you tried to get in and gave up, I think I know why. You went hunting through your inbox for a password.`),
      p(`There was never one to find. ${b(`We don't send you a password.`)} You make your own, right after we check the address is yours.`),
      p(`And you don't have to go hunting for the code either. You ask for it yourself on the page, and it lands in your inbox a minute later. The steps are at the bottom.`),
      cta('Set up my account', LINKS.community),
    ],
    ps: `If your code ran out, just ask for another. They're free and you can have as many as you need.`,
    recap: INSTRUCTIONS,
  },
  {
    n: 3,
    file: '03-we-miss-you.html',
    day: 'Day 6',
    subject: 'We miss you, and your seat is still empty',
    preheader: `Coaches answer questions all day long. None of them are yours yet.`,
    blocks: [
      p(`I'll keep this one short. ${b('We miss you.')}`),
      p(`Every day there are live classes, and coaches answering questions all day long. Questions from members who were once exactly where you are.`),
      p(`But not yours. That's the part that gets me. Your seat is paid for and it's empty.`),
      cta(`Show me what's inside`, LINKS.community),
    ],
    ps: `Bring a question with you. Any question. That's how most people start.`,
    recap: INSTRUCTIONS,
  },
  {
    n: 4,
    file: '04-one-thing-first.html',
    day: 'Day 9',
    subject: 'The members finding grant money all did this one thing first',
    preheader: `They're not smarter than you. They just opened the door.`,
    blocks: [
      p(`I've been watching people find money for more than 40 years. The ones who got it weren't smarter, and they weren't good with computers. Plenty are in their seventies and eighties, and more than a few asked a grandchild for help the first time.`),
      p(`${b('They signed in.')} That's the whole difference between the people who find grant money and the people who keep meaning to.`),
      p(`I want that for you too. So come on in. We miss you.`),
      cta('I am ready to sign in', LINKS.community),
    ],
    ps: `If you're stuck, my next letter has the fastest way to get a hand.`,
    recap: INSTRUCTIONS,
  },
  {
    n: 5,
    file: '05-a-hand-if-youre-stuck.html',
    day: 'Day 12',
    subject: `I think you might be stuck. Let us help you in`,
    preheader: `Write to us and one of our team will do their best to get you in.`,
    blocks: [
      p(`I have a feeling you got stuck somewhere along the way, so I'm reaching out.`),
      p(`Nothing is lost. Your account is sitting there and it stays there, whether you come in today or in six months.`),
      p(`But if something went wrong, don't give up quietly. Write to ${mailto()} and tell us what happened. One of our team will do their best to get you in.`),
      p(`I hope to see you in there very soon.`),
      cta('Let me in', LINKS.community),
    ],
    ps: `Every member who found their grant was once standing exactly where you are.`,
    recap: INSTRUCTIONS,
  },
];

/* Day 1, then +2, +3, +3, +3. */
const DELAYS = { 1: 0, 2: 2, 3: 3, 4: 3, 5: 3 };

emit({
  root: __dirname,
  dir: 'emails-signin',
  preview: 'signin.html',
  title: 'Never signed in.',
  sequenceId: 2865986,
  emails: EMAILS,
  delayFor: e => DELAYS[e.n],
});
