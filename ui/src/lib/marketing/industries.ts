// Italic accents in hero.title are encoded via [bracketed] segments.
// The dynamic playbook page wraps bracketed text in <em className="italic text-primary">.
import type { LucideIcon } from "lucide-react";
import { Briefcase, Headphones, Megaphone, User } from "lucide-react";

export type Industry = {
  slug: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  hero: {
    eyebrow: string;
    title: string;
    subhead: string;
  };
  problem: {
    title: string;
    body: string;
  };
  solution: {
    title: string;
    body: string;
  };
  scriptSnippet: Array<{ speaker: "Borrower" | "Azsetax"; line: string }>;
  kpis: Array<{ value: string; label: string }>;
  cta: {
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "mortgage-brokers",
    icon: Briefcase,
    title: "For brokerages with 5–50 loan officers",
    tagline: "For brokerages with 5–50 loan officers",
    hero: {
      eyebrow: "MORTGAGE BROKERAGES",
      title: "Every lead [called] in under sixty seconds. Even at 2am.",
      subhead:
        "Your LOs sleep, take meetings, work other deals. Azsetax dials every new lead the moment it arrives — and only routes the warm ones back to a human.",
    },
    problem: {
      title: "The problem",
      body: "Internet leads decay 80% in five minutes. Your team is at lunch, in a closing, or on another call. By the time someone dials, the borrower has gone with whoever picked up first. Speed-to-lead is the entire game.",
    },
    solution: {
      title: "What Azsetax does",
      body: "The moment a lead lands in your CRM, Azsetax calls. It opens with the broker's name, confirms intent, captures rate range and timeline, and books a callback into the LO's calendar — or warm-transfers if the borrower wants to talk now.",
    },
    scriptSnippet: [
      { speaker: "Azsetax", line: "Hi Marcus, this is the Northstar Lending assistant calling — got two minutes?" },
      { speaker: "Borrower", line: "Yeah, what's this about?" },
      { speaker: "Azsetax", line: "You submitted a rate quote on our site about ten minutes ago — I wanted to lock in a real conversation before someone else got there. Are you looking to buy or refinance?" },
      { speaker: "Borrower", line: "Refi. Got a 30-year at 7.1%." },
      { speaker: "Azsetax", line: "Good news — based on what you told us, you'd be looking at 5.875% today, about $312 a month lower. Want me to put you on Sarah's calendar this afternoon?" },
      { speaker: "Borrower", line: "Sure, 3pm works." },
    ],
    kpis: [
      { value: "<60s", label: "from lead to dial" },
      { value: "3.2x", label: "more booked appointments" },
      { value: "24/7", label: "even Sundays" },
    ],
    cta: {
      primaryLabel: "Start free trial",
      primaryHref: "/auth/signup",
      secondaryLabel: "See pricing",
      secondaryHref: "/pricing",
    },
  },
  {
    slug: "lender-call-centers",
    icon: Headphones,
    title: "For inside-sales teams working purchased leads",
    tagline: "For inside-sales teams working purchased leads",
    hero: {
      eyebrow: "LENDER CALL CENTERS",
      title: "Stop burning [purchased] leads on voicemail.",
      subhead:
        "Your reps each cover 80–120 dials a day, and most calls go to voicemail. Azsetax handles the first-touch dial so your reps only talk to humans who picked up.",
    },
    problem: {
      title: "The problem",
      body: "Purchased leads cost $70–200 a head. Your floor reps spend half their day leaving voicemails. By the time they reach a live human, the lead is two hours old and the borrower has been called by four competitors.",
    },
    solution: {
      title: "What Azsetax does",
      body: "Drop the list into a campaign. Azsetax dials the entire queue 24/7, qualifies on income range, intent, and timing, then live-transfers the qualified borrower to your next available rep. Your reps stay on the phone with people who actually answered.",
    },
    scriptSnippet: [
      { speaker: "Azsetax", line: "Hi, this is calling about the home-loan inquiry you submitted last week." },
      { speaker: "Borrower", line: "Right — what's going on?" },
      { speaker: "Azsetax", line: "Quick question first — are you still actively shopping for a mortgage, or did you go with someone already?" },
      { speaker: "Borrower", line: "Still shopping." },
      { speaker: "Azsetax", line: "Perfect. I have a senior loan officer free right now who can pull your real rate in under three minutes — should I transfer you?" },
      { speaker: "Borrower", line: "Yeah, transfer me." },
    ],
    kpis: [
      { value: "5x", label: "live connects per rep-hour" },
      { value: "$1.40", label: "cost per qualified transfer" },
      { value: "100%", label: "of leads called within 60s" },
    ],
    cta: {
      primaryLabel: "Start free trial",
      primaryHref: "/auth/signup",
      secondaryLabel: "See pricing",
      secondaryHref: "/pricing",
    },
  },
  {
    slug: "solo-loan-officers",
    icon: User,
    title: "For independent LOs who can't afford an assistant",
    tagline: "For independent LOs who can't afford an assistant",
    hero: {
      eyebrow: "SOLO LOAN OFFICERS",
      title: "The [assistant] you couldn't justify hiring.",
      subhead:
        "Hiring an LOA costs $45k. Azsetax handles the same first-touch, qualification, and callback-booking work for $0.25 a minute — and never takes vacation.",
    },
    problem: {
      title: "The problem",
      body: "You're a one-person shop. Every minute on the phone with a tire-kicker is a minute not spent closing. Hiring a loan officer assistant costs $45k a year and takes three months to train. Most solo LOs just leak leads instead.",
    },
    solution: {
      title: "What Azsetax does",
      body: "Forward your inbound leads to Azsetax. The agent qualifies on credit range, loan amount, timeline. It books pre-qualified borrowers directly into your Google Calendar. You show up to a meeting that's already half-closed.",
    },
    scriptSnippet: [
      { speaker: "Azsetax", line: "Hi, I'm calling on behalf of Jenna at Pacific Lending — you reached out about a mortgage rate." },
      { speaker: "Borrower", line: "Yeah, I'm comparing options." },
      { speaker: "Azsetax", line: "Got it — to save you time, can I ask: roughly what loan amount, and what's your credit ballpark — fair, good, or excellent?" },
      { speaker: "Borrower", line: "400k, credit's around 740." },
      { speaker: "Azsetax", line: "Perfect — Jenna does exactly this kind of file. She has slots open Thursday at 10am or Friday at 2pm — which works better?" },
      { speaker: "Borrower", line: "Thursday 10." },
    ],
    kpis: [
      { value: "$45k", label: "cheaper than an assistant" },
      { value: "Day 1", label: "no training required" },
      { value: "0", label: "leads slip through" },
    ],
    cta: {
      primaryLabel: "Start free trial",
      primaryHref: "/auth/signup",
      secondaryLabel: "See pricing",
      secondaryHref: "/pricing",
    },
  },
  {
    slug: "marketing-buyers",
    icon: Megaphone,
    title: "For agencies running cold-traffic mortgage funnels",
    tagline: "For agencies running cold-traffic mortgage funnels",
    hero: {
      eyebrow: "MARKETING BUYERS",
      title: "Make cold traffic [warm] before you hand it off.",
      subhead:
        "You spend $40-200 per lead. Half of them never answer. Azsetax dials every form-fill the second it converts and ships only qualified borrowers downstream.",
    },
    problem: {
      title: "The problem",
      body: "Your Facebook and Google funnels generate clicks. Your downstream broker pays per lead. The broker complains that half the leads are unqualified or unreachable, and they renegotiate your CPL down. You lose margin every quarter.",
    },
    solution: {
      title: "What Azsetax does",
      body: "Drop a webhook from your landing page to Azsetax. The agent dials within sixty seconds, qualifies on intent + income + credit, and ships only verified live leads to your broker. You charge a premium for warm transfers instead of fighting for CPL.",
    },
    scriptSnippet: [
      { speaker: "Azsetax", line: "Hi, I'm reaching out about the mortgage rate quote you just filled out." },
      { speaker: "Borrower", line: "Oh — yeah, just curious right now." },
      { speaker: "Azsetax", line: "Totally fair — quick question, are you looking in the next 30 days, 90 days, or further out?" },
      { speaker: "Borrower", line: "Probably 30." },
      { speaker: "Azsetax", line: "Got it — I'll have a licensed loan officer reach out today. Best number to use is the one I'm calling, correct?" },
      { speaker: "Borrower", line: "Yes." },
    ],
    kpis: [
      { value: "+45%", label: "lead-to-appointment rate" },
      { value: "Per-transfer", label: "pricing model unlocks" },
      { value: "24/7", label: "auto-respond, no human" },
    ],
    cta: {
      primaryLabel: "Start free trial",
      primaryHref: "/auth/signup",
      secondaryLabel: "See pricing",
      secondaryHref: "/pricing",
    },
  },
];
