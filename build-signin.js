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
 * The whole sequence turns on one fact the audience does not know:
 * THERE IS NO PASSWORD. Signing in means typing your email address and then a
 * 6-digit code we mail you. Almost everybody who gets stuck is hunting for a
 * password that does not exist, so every letter says so again.
 */

const { LINKS, link, b, p, steps, cta, emit } = require('./letter');

/* The four steps, in the same words every time. Repetition is the point: this
   audience will read one letter, not five, and whichever one they read has to
   be able to get them in on its own. */
const SIGNIN = [
  { title: 'Go to the community', text: `Open ${link(LINKS.community, 'lesko-help-2.mn.co')}.` },
  { title: 'Type in this email address', text: `The same one this letter came to. That's how we find your account.` },
  { title: 'We email you a 6-digit code', text: `It comes from ${b('Lesko Help 2')}. If you don't see it in a minute or two, look in your spam folder.` },
  { title: 'Type the code in', text: `That's it, you're inside. No password to make up, and none to remember.` },
];

/* ------------------------------------------------------------- the emails */

const EMAILS = [
  {
    n: 1,
    file: '01-your-account-is-ready.html',
    day: 'Day 1',
    subject: 'Your Lesko Help account is ready and waiting for you',
    preheader: `You haven't been inside yet. It takes one minute, and there's no password.`,
    blocks: [
      p(`Thank you for joining Lesko Help. I mean that. You already did the hard part, which is deciding to go looking for the money instead of hoping it finds you.`),
      p(`But I have to tell you something, and I hope you don't mind me saying it straight. ${b(`You haven't been inside yet.`)} Your account is sitting there, paid for and ready, and nobody has opened it.`),
      p(`Everything is in there waiting for you. The live classes. The coaches who answer your questions. The lists of grant programs. Me.`),
      p(`So let me walk you in. It takes about a minute, and here's the part that surprises everybody: ${b('there is no password')}.`),
      steps(SIGNIN),
      cta('Take me to my account', LINKS.community),
      p(`Four small steps and you're in. That's the whole thing.`),
    ],
    ps: `If you already tried and got stuck, my next letter is about the one thing that trips up almost everybody. Watch for it.`,
  },
  {
    n: 2,
    file: '02-no-password.html',
    day: 'Day 3',
    subject: `The reason you can't get in: there is no password`,
    preheader: `You're not looking for a password. You're looking for a 6-digit code.`,
    blocks: [
      p(`If you tried to get in and gave up, I think I know exactly what happened. You went looking for a password.`),
      p(`There isn't one. We got rid of passwords, because people were losing them and giving up. ${b(`You will never need a password for Lesko Help.`)}`),
      p(`Instead we send you a fresh 6-digit code each time. Here's where to find yours:`),
      steps([
        { title: 'Look for an email from Lesko Help 2', text: `The subject line says "Lesko Help 2 Account Email Verification". It turns up a minute or two after you ask for it.` },
        { title: 'Check your spam folder', text: `This is the big one. That code loves to hide in spam and junk mail. If it's not in your inbox, look there.` },
        { title: 'Use it within 30 minutes', text: `After that it stops working. If yours ran out, just ask for another. They're free and you can have as many as you need.` },
      ]),
      cta('Send me my code', LINKS.community),
      p(`One more thing that catches people. You have to type in ${b('this exact email address')}, the one this letter came to. Another address won't find your account.`),
    ],
    ps: `Next time I'll tell you what's been going on inside while you've been out here.`,
  },
  {
    n: 3,
    file: '03-whats-inside.html',
    day: 'Day 6',
    subject: `What's happening inside the community while you're out here`,
    preheader: `Live classes every day, coaches who answer, and members finding real money.`,
    blocks: [
      p(`Let me tell you what a normal week looks like inside, because I don't think you know yet.`),
      p(`Every single day there are live classes. Coaches answer questions all day long. I go live myself and take whatever anybody wants to ask me, about money, about programs, about their own situation. Members talk to each other about what worked and what didn't.`),
      p(`The AI Grant Researcher is in there too, digging through thousands of programs to find the ones that fit ${b('your')} state and ${b('your')} situation, at any hour you like.`),
      p(`And then somebody posts that they got their yes. That happens most weeks. Those are the posts I read twice.`),
      p(`All of it is already yours. It's just on the other side of a door you haven't opened.`),
      cta(`Show me what's inside`, LINKS.community),
      p(`Remember, no password. Your email address, then the 6-digit code we send you. That's all.`),
    ],
    ps: `Next time, the one thing every member who found money did first.`,
  },
  {
    n: 4,
    file: '04-one-thing-first.html',
    day: 'Day 9',
    subject: 'The members finding grant money all did this one thing first',
    preheader: `They're not smarter than you. They just opened the door.`,
    blocks: [
      p(`I've been watching people find money for more than 40 years. Let me tell you what the ones who succeed have in common.`),
      p(`It isn't that they're smarter. It isn't that they're good with computers. Plenty of our members are in their seventies and eighties, and more than a few had to ask a grandchild for help the first time.`),
      p(`${b('They signed in.')} That's it. That's the whole difference between the people who find grant money and the people who keep meaning to.`),
      p(`You already paid for your seat. It's yours. The only thing between you and everything inside is one minute and a 6-digit code.`),
      steps(SIGNIN),
      cta('I am ready to sign in', LINKS.community),
    ],
    ps: `One more letter from me about this, and in that one I'll give you a hand if you're still stuck.`,
  },
  {
    n: 5,
    file: '05-a-hand-if-youre-stuck.html',
    day: 'Day 12',
    subject: `My last note about this, and a hand if you're stuck`,
    preheader: `If something isn't working, tell us. A real person will help you get in.`,
    blocks: [
      p(`This is my last letter about signing in. I don't want to be the man who keeps knocking.`),
      p(`Your account isn't going anywhere. Whenever you're ready, it's there.`),
      p(`But if you tried and something went wrong, please don't give up quietly. That's the part that would make me sad, because it's almost always something small and easy to fix.`),
      p(`${b('Just hit reply to this email')} and tell us what happened. A real person on my team reads it and will walk you through it.`),
      p(`And if you want to try once more yourself, here it is one last time:`),
      steps(SIGNIN),
      cta('Let me in', LINKS.community),
      p(`I hope I see you in there. There's money out there with your name on it, and I would very much like to help you go and get it.`),
    ],
    ps: `Every member who found their grant was, at some point, standing exactly where you are: outside, wondering whether it's worth it. It is.`,
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
