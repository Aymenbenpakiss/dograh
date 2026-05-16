"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  Bot, Briefcase, Cpu, Database,
  FileAudio, Globe, Headphones, KeyRound, Layers, LineChart,
  Lock, MessageSquare, Mic, Network, Phone, PhoneIncoming,
  Plug, Radio, Settings, ShieldCheck, Sparkles, Workflow, Zap
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

type IconType = typeof Workflow;

type Feature = {
  name: string;
  desc: string;
  icon: IconType;
  comingSoon?: boolean;
};

type CategoryProps = {
  number: string;
  name: string;
  title: string;
  lede: string;
  features: Feature[];
};

function Category({ number, name, title, lede, features }: CategoryProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="border-t border-border/50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-primary/60" />
              {number} — {name}
            </p>
            <h2 className="mt-6 font-display font-light text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.05] tracking-tight">
              {title}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">{lede}</p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.name} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-primary mt-1 shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="font-display text-[15px] font-medium leading-snug">
                      {f.name}
                      {f.comingSoon ? (
                        <span className="ml-2 inline-flex items-center rounded border border-border bg-card/60 px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/80 align-middle">
                          Coming soon
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}

const CATEGORIES: CategoryProps[] = [
  {
    number: "01",
    name: "AGENT BUILDER",
    title: "Build agents like flow charts, not prompt strings.",
    lede: "Visual editor for multi-step conversations. Conditional branches, tool calls, RAG over your own files. No prompt engineering required.",
    features: [
      { name: "Visual workflow editor", icon: Workflow, desc: "Drag-and-drop nodes, branch on intent, route on disposition." },
      { name: "Mortgage templates", icon: Briefcase, desc: "Refi outreach, pre-approval revival, inbound qualifier — pre-tuned and live in two clicks." },
      { name: "Conditional logic", icon: Network, desc: "Branch on income range, credit tier, intent score, or any captured variable." },
      { name: "Tool calling (HTTP)", icon: Plug, desc: "Hit any REST endpoint mid-call — pricing, eligibility, calendar, CRM." },
      { name: "Knowledge base RAG", icon: Database, desc: "Upload PDFs, rate sheets, scripts. Agent retrieves and quotes during the call." },
      { name: "Custom dispositions", icon: Layers, desc: "Define your own outcome codes. Map them to your CRM lifecycle stages." },
    ],
  },
  {
    number: "02",
    name: "VOICE & LANGUAGE",
    title: "Voices borrowers don't hang up on.",
    lede: "Deepgram nova-2-general transcription paired with Cartesia's 250+ neural voices. Sub-300ms turn latency. Interruption-aware.",
    features: [
      { name: "Deepgram transcription", icon: Mic, desc: "Streaming STT tuned for US English mortgage vocabulary." },
      { name: "Cartesia voices", icon: Sparkles, desc: "250+ neural voices. Pick by gender, accent, age — every call sounds intentional." },
      { name: "Interruption handling", icon: Radio, desc: "Borrower talks over the agent? It stops, listens, responds." },
      { name: "Custom pronunciation", icon: Settings, desc: "Override how the agent says specific names, products, rates, or local towns." },
      { name: "Multi-language", icon: Globe, desc: "English, Spanish, French today. More on request." },
      { name: "Voice cloning", icon: Bot, desc: "Match the agent voice to your in-house LO.", comingSoon: true },
    ],
  },
  {
    number: "03",
    name: "TELEPHONY",
    title: "Plug into the carrier you already pay.",
    lede: "Twilio, Telnyx, Plivo, Vonage, or your own Asterisk PBX. Inbound, outbound, transfer to human, SIP — all supported.",
    features: [
      { name: "Twilio", icon: Phone, desc: "Most common path. Bring your own number or use our managed pool." },
      { name: "Telnyx / Plivo / Vonage", icon: Network, desc: "First-class support for each carrier with native webhooks." },
      { name: "Asterisk PBX (ARI)", icon: Cpu, desc: "Self-hosted PBX? Connect via ARI — the dialer runs against your trunk." },
      { name: "Inbound calls", icon: PhoneIncoming, desc: "Route incoming calls to the right agent based on caller history." },
      { name: "Live call transfer", icon: Headphones, desc: "Agent qualifies, then warm-transfers to your LO on the same call." },
      { name: "Number pool (managed)", icon: Phone, desc: "Pre-purchased local + toll-free numbers, $0.018/min passthrough." },
    ],
  },
  {
    number: "04",
    name: "CAMPAIGNS & OUTBOUND",
    title: "From CSV to first dial in under a minute.",
    lede: "Upload a list, attach an agent, let the dialer work the queue. Time windows, retries, AMD, DNC — all built in.",
    features: [
      { name: "CSV upload (10k contacts)", icon: Database, desc: "Drop a CSV with any column layout. Map fields once, save the template." },
      { name: "Google Sheets sync", icon: Layers, desc: "Connect a sheet, pull new rows every five minutes — never re-upload." },
      { name: "AMD (answering machine detection)", icon: MessageSquare, desc: "Skip voicemails or leave a pre-recorded one — your call." },
      { name: "Retry rules", icon: Network, desc: "Configure retry intervals and max attempts per disposition." },
      { name: "Time-of-day windows", icon: Settings, desc: "Respect TCPA call hours per timezone. Pause/resume per campaign." },
      { name: "DNC scrubbing", icon: ShieldCheck, desc: "Upload your suppression list — agent never dials a match." },
    ],
  },
  {
    number: "05",
    name: "OBSERVABILITY",
    title: "Every second, every word, on the record.",
    lede: "Live call dashboard, full transcripts, recordings, OTEL traces. Pipe your own data wherever you need it.",
    features: [
      { name: "Live call dashboard", icon: LineChart, desc: "See which agents are on calls right now, with median duration and disposition rate." },
      { name: "Transcripts", icon: MessageSquare, desc: "Speaker-labeled, timestamped, searchable across all calls." },
      { name: "Recordings", icon: FileAudio, desc: "WAV files, 90-day retention by default, downloadable." },
      { name: "Langfuse OTEL tracing", icon: LineChart, desc: "Every Pipecat span shipped to your Langfuse project — model calls, costs, latency." },
      { name: "Post-call webhooks", icon: Zap, desc: "POST the full run payload to any URL — your CRM, your data warehouse, your Slack." },
      { name: "Custom disposition codes", icon: Layers, desc: "Tag every run with your own outcome taxonomy." },
    ],
  },
  {
    number: "06",
    name: "INTEGRATIONS",
    title: "The pieces of your stack, talking to each other.",
    lede: "Native bridges to the CRMs and tools mortgage teams actually use. Plus webhooks and a REST API for everything else.",
    features: [
      { name: "NoblePath CRM", icon: Briefcase, desc: "Read leads, write back qualified borrowers, sync activity." },
      { name: "Twilio", icon: Phone, desc: "Number provisioning, recordings, AMD." },
      { name: "Gmail (read)", icon: MessageSquare, desc: "Pull inbound lead emails into a campaign queue." },
      { name: "Webhooks (any URL)", icon: Zap, desc: "Outbound HTTP on call-start, mid-call events, call-complete." },
      { name: "REST API", icon: Plug, desc: "Programmatic agents, campaigns, runs, recordings — the same surface as our own UI." },
      { name: "MCP server", icon: Bot, desc: "Let AI agents (Claude, ChatGPT) drive Azsetax via Model Context Protocol." },
      { name: "Stripe billing", icon: KeyRound, desc: "Per-tenant metered billing.", comingSoon: true },
      { name: "Slack notifications", icon: MessageSquare, desc: "Pipe campaign + call events into your team channel.", comingSoon: true },
    ],
  },
  {
    number: "07",
    name: "DEVELOPER EXPERIENCE",
    title: "Built for engineers, not just operators.",
    lede: "Two SDKs, an OpenAPI spec, an MCP server, and the same backend our own UI runs against.",
    features: [
      { name: "Python SDK", icon: Cpu, desc: "pip install dograh-sdk. Mirror the full API surface in snake_case." },
      { name: "TypeScript SDK", icon: Cpu, desc: "npm i @dograh/sdk. Same methods in camelCase." },
      { name: "REST API", icon: Plug, desc: "OpenAPI spec served by the backend. No undocumented endpoints." },
      { name: "MCP server", icon: Bot, desc: "Claude / ChatGPT / any MCP-capable client can drive the platform." },
      { name: "Webhooks", icon: Zap, desc: "Verified HMAC signatures on every outbound webhook." },
      { name: "Sentry-compatible error reporting", icon: LineChart, desc: "Per-run error context with the OTEL trace ID." },
    ],
  },
  {
    number: "08",
    name: "SECURITY & COMPLIANCE",
    title: "Compliance you don't have to retrofit.",
    lede: "TCPA-aware templates, encrypted recordings, audit trail of every call. SOC 2 in progress.",
    features: [
      { name: "TCPA-ready templates", icon: ShieldCheck, desc: "Required disclosure language baked into agent scripts." },
      { name: "DNC list integration", icon: ShieldCheck, desc: "Upload + scrub. Agent will not dial a suppressed number." },
      { name: "End-to-end TLS", icon: Lock, desc: "All traffic encrypted in transit. No exceptions." },
      { name: "Encrypted recordings at rest", icon: Lock, desc: "AES-256 on the storage tier." },
      { name: "Audit log", icon: LineChart, desc: "Every call, every config change, every API key event — written to an append-only log." },
      { name: "SOC 2 Type I", icon: ShieldCheck, desc: "In progress.", comingSoon: true },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-28 sm:pt-32 pb-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80"
            >
              WHAT&apos;S INSIDE
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(2.75rem,7vw,5rem)]"
            >
              Everything you need to make voice <em className="italic text-primary">work for loans.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground"
            >
              Eight feature categories. Forty-plus capabilities. Built for production-grade outbound calling — not demo videos.
            </motion.p>
          </div>
        </div>
      </section>

      {CATEGORIES.map((cat) => (
        <Category key={cat.number} {...cat} />
      ))}

      {/* FINAL CTA */}
      <section className="py-32 border-t border-border/50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight"
          >
            Build your first <em className="italic text-primary">agent.</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground"
          >
            First 100 minutes free. No credit card.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/auth/signup"
              className="lumen-glow group relative overflow-hidden inline-flex items-center gap-2.5 rounded-md bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 inline-flex items-center gap-2.5">
                <span>Start free trial</span>
                <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">→</span>
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 rounded-md border border-border px-6 py-3.5 text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
            >
              <span>See pricing</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
