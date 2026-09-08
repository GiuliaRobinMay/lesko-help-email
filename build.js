#!/usr/bin/env node
/**
 * Lesko Help — Member Onboarding Email Sequence
 * ---------------------------------------------
 * Eight daily letters from Matthew to a brand new member.
 *
 *   node build.js
 *
 * The stationery, the house rules and all the output live in letter.js.
 * This file is only the words.
 */

const { LINKS, link, b, p, steps, cta, emit } = require('./letter');

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

emit({
  root: __dirname,
  dir: 'emails',
  preview: 'index.html',
  title: 'Onboarding letters.',
  sequenceId: 2818978,
  emails: EMAILS,
  delayFor: e => (e.n === 1 ? 0 : 1),
});
