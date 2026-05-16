"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

export default function MarketingHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/overview");
    }
  }, [user, loading, router]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl space-y-8"
      >
        {/* Eye-line label */}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
          <span className="mr-2 inline-block h-px w-8 translate-y-[-3px] bg-primary/60 align-middle" />
          Voice · Loan · Pipeline
        </p>

        {/* Headline */}
        <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] font-light leading-[0.93] tracking-tight">
          Light the{" "}
          <em className="italic text-primary">leads</em>
          <br />
          that everyone else
          <br />
          lets <em className="italic">go cold.</em>
        </h1>

        <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
          Azsetax deploys AI voice agents that call, qualify, and route
          every new mortgage opportunity — overnight, over weekend, between
          meetings.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="lumen-glow group relative overflow-hidden rounded-md bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors"
          >
            <span className="relative z-10 inline-flex items-center gap-3">
              Get started
              <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>

          <Link
            href="/pricing"
            className="rounded-md border border-border/60 px-8 py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            View pricing
          </Link>
        </div>

        {/* KPI strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-6 border-t border-border/50 pt-10"
        >
          {[
            { v: "24/7", l: "Outbound dialer" },
            { v: "<60s", l: "First response" },
            { v: "1¢", l: "Per qualified second" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-2xl font-medium tracking-tight">
                {s.v}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
