"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight, Code2, Terminal, Webhook, Zap } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

type TileIcon = typeof Webhook;

type Tile = {
  icon: TileIcon;
  title: string;
  lede: string;
  install: string;
  example: string;
};

const TILES: Tile[] = [
  {
    icon: Webhook,
    title: "REST API",
    lede: "Trigger calls, manage agents, fetch transcripts. The same surface our UI runs against.",
    install: `curl https://api.azsetax.com/api/v1/health`,
    example: `curl -X POST https://api.azsetax.com/api/v1/calls/trigger \\
  -H "Authorization: Bearer $AZSETAX_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": 1,
    "phone": "+13055551234",
    "metadata": { "lead_id": "ld_42" }
  }'`,
  },
  {
    icon: Terminal,
    title: "Python SDK",
    lede: "Idiomatic snake_case wrapper around the REST API. Type-checked with Pydantic.",
    install: `pip install dograh-sdk`,
    example: `from dograh_sdk import DograhClient

client = DograhClient(
    base_url="https://api.azsetax.com",
    api_key="YOUR_KEY",
)

run = client.calls.trigger(
    agent_id=1,
    phone="+13055551234",
    metadata={"lead_id": "ld_42"},
)
print(run.id, run.status)`,
  },
  {
    icon: Code2,
    title: "TypeScript SDK",
    lede: "camelCase, fully typed. Works in Node, Bun, and modern browsers.",
    install: `npm i @dograh/sdk`,
    example: `import { DograhClient } from "@dograh/sdk";

const client = new DograhClient({
  baseUrl: "https://api.azsetax.com",
  apiKey: process.env.AZSETAX_API_KEY!,
});

const run = await client.calls.trigger({
  agentId: 1,
  phone: "+13055551234",
  metadata: { leadId: "ld_42" },
});
console.log(run.id, run.status);`,
  },
];

const STEPS: { label: string; title: string; body: string }[] = [
  {
    label: "STEP 01",
    title: "Sign up",
    body: "Create your workspace at azsetax.com/auth/signup. First 100 minutes free.",
  },
  {
    label: "STEP 02",
    title: "Get an API key",
    body: "Settings → Developers → Create API key. Store it as AZSETAX_API_KEY.",
  },
  {
    label: "STEP 03",
    title: "Configure telephony",
    body: "Plug in your Twilio creds or pick a managed number from the pool. Two minutes.",
  },
  {
    label: "STEP 04",
    title: "Trigger your first call",
    body: "POST /api/v1/calls/trigger with an agent id and a phone number. Recording + transcript land in your dashboard within seconds of hangup.",
  },
];

export default function DocsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center justify-center gap-3"
            >
              <span className="inline-block h-px w-8 bg-primary/60" />
              DOCUMENTATION
              <span className="inline-block h-px w-8 bg-primary/60" />
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(2.75rem,7vw,5rem)]"
            >
              Build with <em className="italic text-primary">Azsetax.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
              className="mt-6 text-lg text-muted-foreground"
            >
              Two SDKs, one REST API, full OpenAPI spec, MCP server. Ship a working voice agent in under ten minutes.
            </motion.p>
          </div>
        </div>
      </section>

      {/* SDK tiles */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TILES.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <motion.div
                  key={tile.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-7 backdrop-blur-sm hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background/40 text-primary">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <h3 className="font-display text-xl font-medium tracking-tight">{tile.title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{tile.lede}</p>
                  <pre className="mt-5 overflow-x-auto rounded-md border border-border/80 bg-background/40 p-4 font-mono text-xs text-foreground/90 leading-relaxed">
                    <code>{tile.install}</code>
                  </pre>
                  <pre className="mt-3 overflow-x-auto rounded-md border border-border/80 bg-background/40 p-4 font-mono text-xs text-foreground/90 leading-relaxed">
                    <code>{tile.example}</code>
                  </pre>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quickstart */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="py-24 sm:py-28 border-t border-border/50"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-primary/60" />
              01 — QUICKSTART
            </p>
            <h2 className="mt-6 font-display font-light text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05] tracking-tight">
              Live in <em className="italic text-primary">four steps.</em>
            </h2>
          </div>
          <ol className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 list-none">
            {STEPS.map((step) => (
              <li key={step.label}>
                <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/80">{step.label}</div>
                <h3 className="mt-3 font-display text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* Full docs callout */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="py-20 border-t border-border/50"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="lumen-glow rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 sm:p-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-primary/60" />
                02 — FULL DOCS
              </p>
              <p className="mt-2 font-display text-2xl font-medium tracking-tight">
                The complete reference lives at{" "}
                <Link
                  href="/docs/quickstart"
                  className="underline decoration-primary/60 decoration-2 underline-offset-4 hover:text-primary transition-colors"
                >
                  docs.azsetax.com
                </Link>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                OpenAPI spec, every endpoint, every workflow node, every webhook payload.
              </p>
            </div>
            <Link
              href="/docs/quickstart"
              className="lumen-glow group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-transform"
            >
              Open docs
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="py-32 border-t border-border/50"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
            Place your first <em className="italic text-primary">call.</em>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">First 100 minutes free. No credit card.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="lumen-glow group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-transform"
            >
              <Zap className="h-4 w-4" strokeWidth={1.8} />
              Start free trial
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </motion.section>
    </>
  );
}
