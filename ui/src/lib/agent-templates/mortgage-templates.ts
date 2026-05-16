export type MortgageTemplate = {
  slug: "refi-outreach" | "pre-approval-revival" | "inbound-qualifier";
  name: string;
  description: string;
  sampleOpener: string;
  goals: string[];
  workflow: {
    nodes: Array<{
      id: string;
      type: "start" | "agent" | "branch" | "transfer" | "end";
      label: string;
      prompt?: string;
    }>;
    edges: Array<{ from: string; to: string; condition?: string }>;
  };
};

export const MORTGAGE_TEMPLATES: MortgageTemplate[] = [
  {
    slug: "refi-outreach",
    name: "Refi Outreach",
    description:
      "Re-engages current homeowners when rates drop. Confirms current rate, pitches a quick refi review, books a callback.",
    sampleOpener:
      "Hi {{first_name}}, this is the {{broker_name}} assistant — rates dropped 0.4 points yesterday and I wanted to flag a quick refi check. Got two minutes?",
    goals: [
      "Confirm identity and current rate",
      "Position the rate drop without quoting numbers",
      "Book a 10-min callback with the LO",
    ],
    workflow: {
      nodes: [
        { id: "start", type: "start", label: "Start" },
        {
          id: "greet",
          type: "agent",
          label: "Greet & identify",
          prompt:
            "Greet the homeowner by first name, identify as {{broker_name}}'s assistant, and reference the recent rate drop briefly.",
        },
        {
          id: "confirm-rate",
          type: "agent",
          label: "Confirm current rate",
          prompt:
            "Ask the borrower what their current mortgage rate is. Do not quote new rates — just confirm theirs.",
        },
        {
          id: "interest-branch",
          type: "branch",
          label: "Interested?",
          prompt:
            "Branch based on whether the borrower expresses interest in exploring a refi review.",
        },
        {
          id: "book-callback",
          type: "agent",
          label: "Book LO callback",
          prompt:
            "Offer a 10-minute callback slot with the loan officer. Capture the preferred time.",
        },
        {
          id: "mark-not-interested",
          type: "agent",
          label: "Polite close",
          prompt:
            "Thank the borrower, mark as not interested, and leave the door open for future outreach.",
        },
        { id: "end", type: "end", label: "End" },
      ],
      edges: [
        { from: "start", to: "greet" },
        { from: "greet", to: "confirm-rate" },
        { from: "confirm-rate", to: "interest-branch" },
        { from: "interest-branch", to: "book-callback", condition: "interested" },
        { from: "interest-branch", to: "mark-not-interested", condition: "not_interested" },
        { from: "book-callback", to: "end" },
        { from: "mark-not-interested", to: "end" },
      ],
    },
  },
  {
    slug: "pre-approval-revival",
    name: "Pre-Approval Revival",
    description:
      "Re-engages borrowers who pre-approved 60-180 days ago and went silent. Surfaces the blocker, addresses common objections, books the LO.",
    sampleOpener:
      "Hi {{first_name}}, I'm following up on your pre-approval with {{broker_name}} from {{months_ago}} months ago — wanted to check in. Are you still looking?",
    goals: [
      "Find out why they stalled",
      "Address the most common 3 objections (rate, market, life event)",
      "Re-engage or politely close out",
    ],
    workflow: {
      nodes: [
        { id: "start", type: "start", label: "Start" },
        {
          id: "greet",
          type: "agent",
          label: "Greet & remind context",
          prompt:
            "Greet the borrower, reference their prior pre-approval with {{broker_name}} {{months_ago}} months ago.",
        },
        {
          id: "status-check",
          type: "agent",
          label: "Surface status",
          prompt:
            "Ask whether they are still actively looking, paused, or have moved on. Listen for the blocker.",
        },
        {
          id: "status-branch",
          type: "branch",
          label: "Where are they?",
          prompt:
            "Branch on still-looking / paused-due-to-objection / no-longer-interested.",
        },
        {
          id: "book-lo",
          type: "agent",
          label: "Book LO",
          prompt:
            "Walk through the top 3 objections (rate, market, life event) and book a call with the LO.",
        },
        {
          id: "mark-closed-lost",
          type: "agent",
          label: "Mark closed-lost",
          prompt:
            "Thank the borrower, mark as closed-lost in CRM, leave door open.",
        },
        { id: "end", type: "end", label: "End" },
      ],
      edges: [
        { from: "start", to: "greet" },
        { from: "greet", to: "status-check" },
        { from: "status-check", to: "status-branch" },
        { from: "status-branch", to: "book-lo", condition: "still_looking_or_paused" },
        { from: "status-branch", to: "mark-closed-lost", condition: "no_longer" },
        { from: "book-lo", to: "end" },
        { from: "mark-closed-lost", to: "end" },
      ],
    },
  },
  {
    slug: "inbound-qualifier",
    name: "Inbound Qualifier",
    description:
      "Qualifies fresh web/Facebook leads on intent, credit range, loan amount, and timeline — then live-transfers to a human LO if hot.",
    sampleOpener:
      "Hi {{first_name}}, this is the {{broker_name}} team calling about the mortgage rate quote you just submitted — got a couple of minutes?",
    goals: [
      "Confirm intent and contact info",
      "Capture loan amount + credit range bucket",
      "Live-transfer if qualified, else book a callback",
    ],
    workflow: {
      nodes: [
        { id: "start", type: "start", label: "Start" },
        {
          id: "greet",
          type: "agent",
          label: "Greet & confirm intent",
          prompt:
            "Greet the inbound lead, confirm they just submitted a rate quote, and confirm contact info.",
        },
        {
          id: "qualify-amount",
          type: "agent",
          label: "Loan amount",
          prompt: "Ask the approximate loan amount they are looking for.",
        },
        {
          id: "qualify-credit",
          type: "agent",
          label: "Credit range",
          prompt:
            "Ask for a self-reported credit range bucket (excellent / good / fair / unsure).",
        },
        {
          id: "qualify-timeline",
          type: "agent",
          label: "Timeline",
          prompt:
            "Ask the timeline — within 30 days, 30–90 days, or just researching.",
        },
        {
          id: "qualified-branch",
          type: "branch",
          label: "Qualified?",
          prompt:
            "Branch: qualified if amount + credit + timeline all meet threshold; else book callback.",
        },
        {
          id: "transfer",
          type: "transfer",
          label: "Live transfer to LO",
          prompt: "Warm-transfer the call to an available human loan officer.",
        },
        {
          id: "book-callback",
          type: "agent",
          label: "Book callback",
          prompt: "Offer a callback slot with an LO and capture preferred time.",
        },
        { id: "end", type: "end", label: "End" },
      ],
      edges: [
        { from: "start", to: "greet" },
        { from: "greet", to: "qualify-amount" },
        { from: "qualify-amount", to: "qualify-credit" },
        { from: "qualify-credit", to: "qualify-timeline" },
        { from: "qualify-timeline", to: "qualified-branch" },
        { from: "qualified-branch", to: "transfer", condition: "qualified" },
        { from: "qualified-branch", to: "book-callback", condition: "not_qualified" },
        { from: "transfer", to: "end" },
        { from: "book-callback", to: "end" },
      ],
    },
  },
];
