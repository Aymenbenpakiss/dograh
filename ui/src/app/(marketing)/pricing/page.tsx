"use client";

import { ArrowUpRight, Check, Minus, X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  "Unlimited voice agents",
  "Unlimited campaigns and contacts",
  "Deepgram transcription on every call",
  "Cartesia voices — 250+, multi-lingual",
  "Call recordings (90-day retention)",
  "Searchable transcripts",
  "Langfuse tracing dashboard",
  "REST API + Webhooks + MCP server",
  "Email support (priority above 5k min/mo)",
  "Bring-your-own Twilio number — or managed pool (+$0.018/min passthrough, shown on your invoice)",
];

type Cell =
  | { kind: "text"; value: string }
  | { kind: "check" }
  | { kind: "x" }
  | { kind: "minus" };

const VENDORS = ["Azsetax", "Vapi", "Retell", "Junior LO ($40k/yr)"] as const;

const ROWS: { label: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  {
    label: "Price",
    cells: [
      { kind: "text", value: "$0.25/min" },
      { kind: "text", value: "$0.05–0.20/min" },
      { kind: "text", value: "$0.07–0.31/min" },
      { kind: "text", value: "~$40k/year" },
    ],
  },
  {
    label: "Setup time",
    cells: [
      { kind: "text", value: "<10 min" },
      { kind: "text", value: "Days" },
      { kind: "text", value: "Days" },
      { kind: "text", value: "Weeks" },
    ],
  },
  {
    label: "Mortgage-specific scripts",
    cells: [
      { kind: "text", value: "Included" },
      { kind: "text", value: "None" },
      { kind: "text", value: "None" },
      { kind: "text", value: "Hand-trained" },
    ],
  },
  {
    label: "24/7 coverage",
    cells: [{ kind: "check" }, { kind: "check" }, { kind: "check" }, { kind: "x" }],
  },
  {
    label: "Quits or has bad days",
    cells: [{ kind: "x" }, { kind: "x" }, { kind: "x" }, { kind: "check" }],
  },
  {
    label: "Compliance baked in",
    cells: [
      { kind: "text", value: "TCPA/DNC ready" },
      { kind: "text", value: "Self-build" },
      { kind: "text", value: "Self-build" },
      { kind: "check" },
    ],
  },
];

const FAQ = [
  {
    q: "What counts as a minute?",
    a: "Only connected call time, rounded up to the nearest second. Rings that go to voicemail or are not picked up are free.",
  },
  {
    q: "Can I bring my own Twilio?",
    a: "Yes — paste your Twilio account SID + auth token in Telephony settings. You bypass our $0.018/min passthrough and the number you call from is yours.",
  },
  {
    q: "Do you charge for transcripts or recordings?",
    a: "No. Transcripts via Deepgram and recordings (90-day retention) are included in the per-minute rate.",
  },
  {
    q: "How does TCPA / DNC work?",
    a: "You bring your DNC-scrubbed list. Our agent templates include the legally-required disclosure language. We log every call for audit.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — prepaid only. No long-term contracts. Unused minutes do not refund but never expire.",
  },
];

function CellRender({ cell }: { cell: Cell }) {
  if (cell.kind === "text") return <span>{cell.value}</span>;
  if (cell.kind === "check") return <Check className="h-4 w-4 text-primary" aria-label="Yes" />;
  if (cell.kind === "x") return <X className="h-4 w-4 text-muted-foreground/50" aria-label="No" />;
  return <Minus className="h-4 w-4 text-muted-foreground/50" aria-label="N/A" />;
}

export default function PricingPage() {
  return (
    <>
      {/* 1. HERO STRIP */}
      <section className="relative pt-28 sm:pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center justify-center gap-3"
            >
              <span className="inline-block h-px w-8 bg-primary/60" />
              Pricing
              <span className="inline-block h-px w-8 bg-primary/60" />
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(2.75rem,7vw,5rem)]"
            >
              One number. <em className="italic text-primary">No tiers.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground"
            >
              $0.25 per call-minute. Every feature included.
            </motion.p>
          </div>
        </div>
      </section>

      {/* 2. THE PLAN CARD */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="lumen-glow relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 sm:p-12">
              <div
                className="absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full bg-primary/10 blur-3xl"
                aria-hidden
              />

              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80 mb-4">
                  The Azsetax plan
                </p>

                <div className="font-display text-[clamp(3.5rem,9vw,6rem)] font-light leading-none tracking-tight">
                  $0.25
                  <span className="ml-2 font-display text-2xl text-muted-foreground">/ minute</span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  Billed monthly. No minimums. No platform fee.
                </p>

                <div className="my-8 h-px bg-border/60" />

                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80 mb-4">
                  What&apos;s included
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-[0.2em] text-primary/80">SOC 2</span>
                  &nbsp;in progress. Encrypted recordings at rest, TLS in transit, audit log of every call.
                </p>

                <Link
                  href="/auth/signup"
                  className="lumen-glow group mt-10 inline-flex items-center justify-center w-full gap-2.5 rounded-md bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <span>Start free trial — first 100 minutes free</span>
                  <span className="font-mono text-xs opacity-60 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. COMPARE-TO-ALTERNATIVES */}
      <section className="border-t border-border/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            01 — VS THE ALTERNATIVES
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mt-6 font-display font-light text-[clamp(2.25rem,5vw,3.5rem)] leading-[1] tracking-tight max-w-3xl"
          >
            Cheaper than a junior LO. <em className="italic text-primary">Faster than Vapi.</em>
          </motion.h2>

          {/* Desktop table */}
          <div className="mt-16 hidden md:block overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-5 border-b border-border bg-card/40">
              <div className="p-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Feature
              </div>
              {VENDORS.map((v, i) => (
                <div
                  key={v}
                  className={`p-5 font-mono text-[10px] uppercase tracking-[0.22em] ${
                    i === 0 ? "text-primary bg-primary/[0.04]" : "text-muted-foreground"
                  }`}
                >
                  {v}
                </div>
              ))}
            </div>

            {ROWS.map((row, rIdx) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: EASE, delay: rIdx * 0.04 }}
                className="grid grid-cols-5 border-b border-border/40 last:border-b-0"
              >
                <div className="p-5 text-sm text-foreground">{row.label}</div>
                {row.cells.map((cell, cIdx) => (
                  <div
                    key={cIdx}
                    className={`p-5 text-sm ${cIdx === 0 ? "bg-primary/[0.04]" : ""}`}
                  >
                    <CellRender cell={cell} />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Mobile stack */}
          <div className="mt-12 md:hidden grid grid-cols-1 gap-4">
            {VENDORS.map((v, vIdx) => (
              <div
                key={v}
                className={`rounded-xl border border-border p-5 ${
                  vIdx === 0 ? "bg-primary/[0.04]" : "bg-card/40"
                }`}
              >
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.22em] mb-4 ${
                    vIdx === 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {v}
                </p>
                <dl className="space-y-3">
                  {ROWS.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-4 border-t border-border/40 pt-3 first:border-t-0 first:pt-0"
                    >
                      <dt className="text-xs text-muted-foreground">{row.label}</dt>
                      <dd className="text-sm text-foreground text-right">
                        <CellRender cell={row.cells[vIdx]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="border-t border-border/50 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            02 — FAQ
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mt-6 font-display font-light text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-tight"
          >
            Common questions.
          </motion.h2>

          <dl className="mt-12 space-y-8">
            {FAQ.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
                className="border-t border-border/50 pt-6"
              >
                <dt className="font-display text-lg font-medium tracking-tight">{item.q}</dt>
                <dd className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</dd>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: EASE, delay: FAQ.length * 0.04 }}
              className="border-t border-border/50 pt-6"
            >
              <dt className="font-display text-lg font-medium tracking-tight">
                What if I need volume pricing?
              </dt>
              <dd className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Above 100k minutes/month, talk to us at{" "}
                <a
                  href="mailto:hello@azsetax.com"
                  className="text-foreground underline decoration-primary/60 decoration-2 underline-offset-4"
                >
                  hello@azsetax.com
                </a>
                .
              </dd>
            </motion.div>
          </dl>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-32 border-t border-border/50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight"
          >
            Ready to <em className="italic text-primary">try it?</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground"
          >
            First 100 minutes on us. No credit card.
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
                <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              href="mailto:hello@azsetax.com?subject=Pricing"
              className="group inline-flex items-center gap-2 rounded-md border border-border px-6 py-3.5 text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
            >
              <span>Email founder</span>
              <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
