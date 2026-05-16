"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Fragment } from "react";

import { INDUSTRIES } from "@/lib/marketing/industries";

const EASE = [0.22, 1, 0.36, 1] as const;

function renderTitle(str: string) {
  const parts = str.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      return (
        <em key={i} className="italic text-primary">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function IndustryPlaybookPage() {
  const params = useParams() as { slug: string };
  const industry = INDUSTRIES.find((i) => i.slug === params.slug);

  if (!industry) {
    notFound();
  }

  return (
    <>
      {/* HERO */}
      <section className="pt-28 sm:pt-32 pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            01 — {industry.hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(2.5rem,6vw,4.5rem)] max-w-3xl"
          >
            {renderTitle(industry.hero.title)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
            className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground"
          >
            {industry.hero.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            className="mt-12 grid grid-cols-3 gap-x-6 gap-y-4 max-w-2xl border-t border-border/50 pt-8"
          >
            {industry.kpis.map((k) => (
              <div key={k.label}>
                <div className="font-display text-2xl font-medium tracking-tight">{k.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {k.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-primary/60" />
              02 — THE PROBLEM
            </p>
            <h2 className="mt-6 font-display text-3xl font-light tracking-tight">{industry.problem.title}</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">{industry.problem.body}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-primary/60" />
              03 — WHAT WE DO
            </p>
            <h2 className="mt-6 font-display text-3xl font-light tracking-tight">{industry.solution.title}</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">{industry.solution.body}</p>
          </motion.div>
        </div>
      </section>

      {/* SAMPLE CALL */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            04 — SAMPLE CALL
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-6 font-display font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight max-w-3xl"
          >
            What it sounds like in <em className="italic text-primary">production.</em>
          </motion.h2>

          <div className="mt-12 lumen-glow rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-10 max-w-3xl mx-auto">
            <div className="space-y-5">
              {industry.scriptSnippet.map((turn, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                  className="border-l-2 border-primary/40 pl-5 py-1"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    {turn.speaker}
                  </div>
                  <div className="mt-1 text-[0.95rem] text-foreground leading-relaxed">{turn.line}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
            Spin up the <em className="italic text-primary">{industry.title.toLowerCase()}</em> template in <em className="italic text-primary">two clicks.</em>
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
              href={industry.cta.primaryHref}
              className="lumen-glow group inline-flex items-center gap-2.5 rounded-md bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <span>{industry.cta.primaryLabel}</span>
              <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href={industry.cta.secondaryHref}
              className="group inline-flex items-center gap-2 rounded-md border border-border px-6 py-3.5 text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
            >
              <span>{industry.cta.secondaryLabel}</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
