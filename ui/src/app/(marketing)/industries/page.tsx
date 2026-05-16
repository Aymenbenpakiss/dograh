"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { INDUSTRIES } from "@/lib/marketing/industries";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function IndustriesIndexPage() {
  return (
    <>
      {/* HERO */}
      <section className="pt-28 sm:pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 flex items-center justify-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-primary/60" />
            INDUSTRIES
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="mt-6 font-display font-light leading-[0.95] tracking-tight text-[clamp(2.5rem,6vw,4.5rem)]"
          >
            One platform. <em className="italic text-primary">Four playbooks.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
            className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground"
          >
            Pick the path that matches how leads actually arrive at your team.
          </motion.p>
        </div>
      </section>

      {/* GRID */}
      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INDUSTRIES.map((ind, i) => {
              const Icon = ind.icon;
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
                    <p className="mt-2 text-sm text-muted-foreground">{ind.tagline}</p>
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
    </>
  );
}
