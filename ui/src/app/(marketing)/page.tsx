"use client";

import { ArrowUpRight, Briefcase, Check, Headphones, Megaphone, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import AuroraSky from "@/components/marketing/AuroraSky";
import LiveCallOrb from "@/components/marketing/LiveCallOrb";

const EASE = [0.22, 1, 0.36, 1] as const;

const KPIS = [
  { value: "<60s", label: "response time" },
  { value: "$0.25/min", label: "no tiers" },
  { value: "24/7", label: "always on" },
  { value: "TCPA", label: "compliance ready" },
];

const LOGOS = ["Encompass", "NoblePath", "Velocify", "LendingPad", "HubSpot", "Salesforce"];

const POINTS = [
  {
    n: "01",
    title: "Speed-to-lead, autonomously.",
    body: "A mortgage lead is worth $70–200 — conversion drops 80% if you call after five minutes. Azsetax dials in under sixty seconds, around the clock, including 2am Sundays.",
  },
  {
    n: "02",
    title: "Vertical scripts, not a blank canvas.",
    body: "Refi outreach, pre-approval revival, inbound qualification — pre-tuned templates that book callbacks. No prompt engineering. No 'build your own agent' rabbit holes.",
  },
  {
    n: "03",
    title: "Your CRM, our pipeline.",
    body: "Plug into NoblePath, Encompass, or HubSpot in one click. Leads flow in, qualified borrowers route back. Zero double-entry.",
  },
];

const STEPS = [
  { n: "01", title: "Receive", body: "Lead lands in your CRM, on a form, or in a Twilio inbox." },
  { n: "02", title: "Call", body: "Azsetax dials within 60 seconds with the script you pre-approved." },
  { n: "03", title: "Qualify", body: "Confirms identity, captures intent, addresses common objections." },
  { n: "04", title: "Route", body: "Books a callback or live-transfers to your LO if qualified." },
];

const INDUSTRIES = [
  { slug: "mortgage-brokers", title: "Mortgage brokers", tag: "For brokerages with 5–50 LOs.", Icon: Briefcase },
  { slug: "lender-call-centers", title: "Lender call centers", tag: "For inside-sales teams working purchased leads.", Icon: Headphones },
  { slug: "solo-loan-officers", title: "Solo loan officers", tag: "For independent LOs who can't afford an assistant.", Icon: User },
  { slug: "marketing-buyers", title: "Marketing buyers", tag: "For agencies running cold-traffic mortgage funnels.", Icon: Megaphone },
];

const PRICING_BULLETS = [
  "Unlimited voice agents and campaigns",
  "Deepgram transcription + Cartesia voices included",
  "Recordings and searchable transcripts (90-day retention)",
  "Langfuse observability dashboard",
  "Bring your own Twilio, or use a managed number",
];

export default function MarketingHomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
        <AuroraSky />
        <div className="relative z-10 mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.0 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 mb-8 flex items-center gap-3"
            >
              <span className="inline-block h-px w-8 bg-primary/60" />
              Voice intelligence for mortgage teams
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="font-display font-light leading-[0.95] tracking-tight text-[clamp(2.75rem,7vw,5.5rem)]"
            >
              Mortgage leads die in <em className="italic text-primary">five minutes.</em>
              <br />
              Azsetax calls them in <em className="italic text-primary">sixty seconds.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
              className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground"
            >
              AI voice agents that call every new loan lead the moment it arrives — at 2am, on Sundays, between meetings. Deepgram transcription. Cartesia voices. $0.25 per call-minute. No tiers, no minimums.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/auth/signup"
                className="azure-glow group inline-flex items-center gap-2.5 rounded-md bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <span>Start free trial</span>
                <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#demo"
                className="group inline-flex items-center gap-2 rounded-md border border-border bg-card/40 backdrop-blur-sm px-6 py-3.5 text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
              >
                <span>Watch a demo call</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 max-w-2xl border-t border-border/50 pt-8"
            >
              {KPIS.map((k) => (
                <div key={k.label}>
                  <div className="font-display text-2xl font-medium tracking-tight">{k.value}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {k.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="hidden lg:block"
          >
            <LiveCallOrb />
          </motion.div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="border-y border-border/50 py-10"
      >
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Built for brokerages running on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="font-display text-xl tracking-wide hover:opacity-100 transition-opacity"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* THREE BIG POINTS */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            01 — THE PITCH
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-6 font-display font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight max-w-3xl"
          >
            <em className="italic text-primary">Three reasons</em> mortgage teams switch to Azsetax.
          </motion.h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {POINTS.map((p, i) => (
              <motion.article
                key={p.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              >
                <div className="font-display text-7xl font-light text-muted-foreground/25 leading-none">
                  {p.n}
                </div>
                <h3 className="mt-6 font-display text-2xl font-medium tracking-tight">{p.title}</h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">{p.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 sm:py-32 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            02 — THE FLOW
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-6 font-display font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight max-w-3xl"
          >
            From <em className="italic text-primary">lead</em> to <em className="italic text-primary">live transfer</em> in four steps.
          </motion.h2>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              >
                <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/80">{`STEP ${s.n}`}</div>
                <h3 className="mt-3 font-display text-xl font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industries" className="py-24 sm:py-32 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            03 — WHO USES THIS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-6 font-display font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight max-w-3xl"
          >
            Built for the way <em className="italic text-primary">loans actually close.</em>
          </motion.h2>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INDUSTRIES.map((ind, i) => {
              const Icon = ind.Icon;
              return (
                <motion.div
                  key={ind.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                >
                  <Link
                    href={`/industries/${ind.slug}`}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-card/70 block"
                  >
                    <div className="h-10 w-10 rounded-md border border-border bg-background/40 inline-flex items-center justify-center text-primary group-hover:border-primary/40">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-medium tracking-tight">{ind.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{ind.tag}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-primary">
                        Read playbook
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section id="pricing-preview" className="py-24 sm:py-32 border-t border-border/50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center justify-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            04 — PRICING
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-6 font-display font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight"
          >
            Pay per <em className="italic text-primary">qualified second.</em>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="mt-10 font-display text-[clamp(4rem,11vw,8rem)] font-light leading-none tracking-tight"
          >
            $0.25
            <span className="font-display text-3xl sm:text-4xl text-muted-foreground ml-2">/ minute</span>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="mt-10 inline-flex flex-col gap-3 text-left text-sm text-muted-foreground"
          >
            {PRICING_BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
          >
            <Link
              href="/pricing"
              className="mt-12 group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-primary hover:text-primary/80 transition-colors"
            >
              See full pricing
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 border-t border-border/50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight"
          >
            Stop letting leads <em className="italic text-primary">go cold.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto"
          >
            First 100 minutes free. No credit card. Be live in under ten minutes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/auth/signup"
              className="azure-glow group inline-flex items-center gap-2.5 rounded-md bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <span>Start free trial</span>
              <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="mailto:hello@azsetax.com?subject=Walkthrough"
              className="group inline-flex items-center gap-2 rounded-md border border-border px-6 py-3.5 text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
            >
              <span>Book a 15-min walkthrough</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* DEMO ANCHOR */}
      <div id="demo" />
    </>
  );
}
