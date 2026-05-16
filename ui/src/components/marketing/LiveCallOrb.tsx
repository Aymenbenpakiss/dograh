"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Phone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * LiveCallOrb — signature hero visual.
 *
 * A floating orb representing the active voice agent, ringed by orbiting
 * waveform arcs, paired with a compact streaming event log card to its right.
 * Designed for the landing hero right column on lg+ screens.
 */

const EVENTS = [
  { tag: "DIAL", text: "Calling Marcus C. — 03052…4419" },
  { tag: "CONNECT", text: "Live · 00:02" },
  { tag: "INTENT", text: "Refi · 30-year fixed @ 7.1%" },
  { tag: "QUALIFY", text: "740 FICO · $412k loan · 30-day timeline" },
  { tag: "BOOK", text: "Callback set · Thursday 3:00 PM" },
];

const ARCS = [
  { offset: -90, gap: 36, length: 70 },
  { offset: 18, gap: 12, length: 84 },
  { offset: 130, gap: 24, length: 60 },
  { offset: 220, gap: 18, length: 78 },
  { offset: 310, gap: 30, length: 48 },
];

export default function LiveCallOrb() {
  const reduceMotion = useReducedMotion();
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setEventIndex((i) => (i + 1) % EVENTS.length);
    }, 2200);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Soft outer halo */}
      <div
        aria-hidden
        className="absolute h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.7 0.18 240 / 0.18), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        {/* ORB */}
        <div className="relative h-72 w-72 sm:h-80 sm:w-80">
          {/* Outer rotating arcs */}
          <svg
            viewBox="0 0 200 200"
            className={`absolute inset-0 h-full w-full ${reduceMotion ? "" : "animate-[spin_28s_linear_infinite]"}`}
          >
            <defs>
              <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.184 245)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="oklch(0.62 0.184 245)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {ARCS.map((arc, i) => {
              const r = 88 - i * 2;
              const circumference = 2 * Math.PI * r;
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="url(#arc-grad)"
                  strokeWidth={1.5}
                  strokeDasharray={`${arc.length} ${circumference}`}
                  strokeDashoffset={-arc.offset}
                  strokeLinecap="round"
                  opacity={0.7 - i * 0.1}
                />
              );
            })}
          </svg>

          {/* Pulse rings */}
          <span className="absolute inset-0 m-auto h-40 w-40 rounded-full bg-primary/10" />
          <motion.span
            aria-hidden
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={reduceMotion ? undefined : { scale: [0.85, 1.4], opacity: [0.55, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 m-auto h-40 w-40 rounded-full border border-primary/50"
          />
          <motion.span
            aria-hidden
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={reduceMotion ? undefined : { scale: [0.85, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
            className="absolute inset-0 m-auto h-40 w-40 rounded-full border border-primary/40"
          />

          {/* Inner orb */}
          <div className="azure-halo absolute inset-0 m-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.72_0.18_240)] to-[oklch(0.5_0.2_250)] shadow-[0_12px_40px_-8px_oklch(0.55_0.2_245/0.45)]">
            <Phone className="h-9 w-9 text-white" strokeWidth={1.5} />
          </div>

          {/* Tiny live tag */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary backdrop-blur shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live
          </div>
        </div>

        {/* EVENT LOG CARD */}
        <div className="w-full max-w-[360px] rounded-2xl border border-border bg-card/80 backdrop-blur-md p-5 shadow-[0_24px_60px_-30px_oklch(0.55_0.2_245/0.35)]">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Agent run · 4271
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">00:42</span>
          </div>

          <div className="mt-4 space-y-3 min-h-[170px]">
            <AnimatePresence mode="popLayout">
              {EVENTS.slice(0, eventIndex + 1)
                .slice(-3)
                .map((ev, i, arr) => {
                  const isLatest = i === arr.length - 1;
                  return (
                    <motion.div
                      key={`${ev.tag}-${eventIndex - (arr.length - 1 - i)}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{
                        opacity: isLatest ? 1 : 0.45,
                        y: 0,
                      }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-3"
                    >
                      <span
                        className={`mt-0.5 inline-flex shrink-0 rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] ${isLatest ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {ev.tag}
                      </span>
                      <span
                        className={`text-[13px] leading-snug ${isLatest ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {ev.text}
                      </span>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>

          {/* Waveform bar */}
          <div className="mt-4 flex items-end gap-[3px] border-t border-border/60 pt-4">
            {Array.from({ length: 36 }).map((_, i) => {
              const base = 0.3 + ((i * 53) % 11) / 18;
              return (
                <motion.span
                  key={i}
                  className="block w-[3px] rounded-full bg-primary/55"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          height: [
                            `${base * 100}%`,
                            `${Math.min(base * 200, 100)}%`,
                            `${base * 60}%`,
                            `${base * 100}%`,
                          ],
                        }
                  }
                  style={{ height: `${base * 100}%`, display: "block" }}
                  transition={{
                    duration: 1.4 + (i % 5) * 0.18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (i % 7) * 0.08,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
