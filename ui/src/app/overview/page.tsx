"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Database, Phone, Workflow as WorkflowIcon } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { MORTGAGE_TEMPLATES } from "@/lib/agent-templates/mortgage-templates";

const ease = [0.22, 1, 0.36, 1] as const;

export default function OverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const firstName = user?.displayName?.split(" ")[0];
  const hasFetched = useRef(false);
  const [hasAgents, setHasAgents] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || !user || hasFetched.current) return;
    hasFetched.current = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/agents", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const count = Array.isArray(data)
            ? data.length
            : (data.items?.length ?? 0);
          setHasAgents(count > 0);
        } else {
          setHasAgents(true);
        }
      } catch {
        setHasAgents(true);
      }
    })();
  }, [authLoading, user]);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[10%] h-[400px] w-[400px] rounded-full bg-[oklch(0.8_0.14_78/0.10)] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-[oklch(0.62_0.13_240/0.06)] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-10">
        {/* Header strip */}
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-wrap items-end justify-between gap-4 border-b border-border/50 pb-6"
        >
          <div>
            <p className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-primary/80">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-primary shadow-[0_0_12px_2px_oklch(0.8_0.14_78/0.6)]" />
              Live dashboard · {today}
            </p>
            <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-light leading-[1] tracking-tight">
              {firstName ? (
                <>
                  Good to see you,{" "}
                  <em className="italic text-primary">{firstName}.</em>
                </>
              ) : (
                <>
                  Welcome to <em className="italic text-primary">Azsetax.</em>
                </>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            All systems nominal
          </div>
        </motion.header>

        {/* Quick-start: pre-built mortgage agents (only when user has zero agents) */}
        <AnimatePresence>
          {hasAgents === false && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <div className="mb-6 flex items-center gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
                  <span className="mr-2 inline-block h-px w-6 translate-y-[-3px] bg-primary/60 align-middle" />
                  Quick-start
                </p>
                <div className="h-px flex-1 bg-border/50" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Pre-built mortgage agents
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {MORTGAGE_TEMPLATES.map((t, i) => (
                  <motion.div
                    key={t.slug}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/40 transition-colors"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="font-display text-lg font-medium tracking-tight">{t.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t.description}
                    </p>
                    <p className="mt-5 font-mono text-xs italic text-foreground/70 leading-relaxed border-l-2 border-primary/40 pl-3">
                      {t.sampleOpener}
                    </p>
                    <Link
                      href={`/workflow?template=${t.slug}`}
                      className="lumen-glow group/btn mt-6 inline-flex items-center justify-between w-full gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-transform"
                    >
                      <span>Use this template</span>
                      <span className="font-mono text-xs opacity-60 group-hover/btn:translate-x-1 transition-transform">→</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* HERO grid — asymmetric editorial */}
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="relative col-span-1 overflow-hidden rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm lg:col-span-7 lg:p-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
                <span className="mr-2 inline-block h-px w-6 translate-y-[-3px] bg-primary/60 align-middle" />
                The pitch
              </p>
              <h2 className="max-w-xl font-display text-[clamp(1.8rem,2.6vw,2.4rem)] font-light leading-[1.1] tracking-tight">
                Voice agents that follow up on every mortgage lead — overnight,
                weekend, between meetings — so producers only hear from{" "}
                <em className="italic text-primary">borrowers ready to talk.</em>
              </h2>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/workflow"
                  className="lumen-glow group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Build an agent
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/campaigns"
                  className="group inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
                >
                  Launch a campaign
                  <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease }}
            className="col-span-1 grid grid-cols-1 gap-4 lg:col-span-5"
          >
            {[
              { kpi: "0.25", unit: "$/min", label: "Pay-as-you-call", desc: "No platform fee, no minimums." },
              { kpi: "<60", unit: "sec", label: "Lead response time", desc: "Median from inbound to first dial." },
              { kpi: "24/7", unit: "", label: "Always on", desc: "Holidays, weekends, midnight." },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease }}
                className="group relative flex items-center gap-6 rounded-xl border border-border bg-card/40 p-6 backdrop-blur-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-medium tracking-tight text-foreground">
                    {s.kpi}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {s.unit}
                  </span>
                </div>
                <div className="flex-1 border-l border-border/60 pl-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    {s.label}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Action cards */}
        <section className="mt-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-6 flex items-center gap-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="mr-2 inline-block h-px w-6 translate-y-[-3px] bg-border align-middle" />
              Quick actions
            </p>
            <div className="h-px flex-1 bg-border/50" />
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/workflow",
                title: "Loan follow-up agent",
                desc: "Lead qualification, refi outreach, pre-approval revival.",
                icon: WorkflowIcon,
                tag: "Build",
              },
              {
                href: "/campaigns",
                title: "Lead-list campaign",
                desc: "Upload borrowers, attach an agent, start dialing.",
                icon: Database,
                tag: "Launch",
              },
              {
                href: "/telephony-configurations",
                title: "Caller IDs & numbers",
                desc: "Bring your own Twilio or use a managed number pool.",
                icon: Phone,
                tag: "Connect",
              },
              {
                href: "/model-configurations",
                title: "Voice & language models",
                desc: "Pick the LLM, voice, and transcription providers.",
                icon: WorkflowIcon,
                tag: "Tune",
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 + i * 0.07, ease }}
              >
                <Link
                  href={c.href}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/40 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-card/70"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background/40 text-primary transition-colors group-hover:border-primary/40">
                        <c.icon className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                        {c.tag}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-medium leading-snug tracking-tight">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors group-hover:text-primary">
                      Open
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer mark */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 flex items-center justify-between border-t border-border/50 pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
        >
          <span>Azsetax · voice intelligence for mortgage teams</span>
          <Link href="/legal/credits" className="hover:text-primary">
            Credits
          </Link>
        </motion.footer>
      </div>
    </div>
  );
}
