"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * AuroraSky — signature animated background for the marketing hero.
 *
 * Three stacked SVG path layers that morph between two shapes on a slow loop,
 * tinted in sky-blue. A faint dot grid sits on top to anchor scale.
 * Position absolutely inside a `relative` container; renders behind content.
 *
 * Respects prefers-reduced-motion: falls back to the static gradient.
 */

const WAVE_A = "M0,160 C160,80 320,240 480,160 C640,80 800,240 960,160 C1120,80 1280,240 1440,160 L1440,400 L0,400 Z";
const WAVE_B = "M0,200 C160,260 320,120 480,200 C640,280 800,120 960,200 C1120,280 1280,120 1440,200 L1440,400 L0,400 Z";

const WAVE_C = "M0,120 C200,200 360,40 560,120 C760,200 940,40 1120,120 C1300,200 1440,80 1440,120 L1440,400 L0,400 Z";
const WAVE_D = "M0,180 C200,80 360,260 560,180 C760,100 940,260 1120,180 C1300,100 1440,220 1440,180 L1440,400 L0,400 Z";

const WAVE_E = "M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 L1440,400 L0,400 Z";
const WAVE_F = "M0,100 C240,40 480,180 720,100 C960,20 1200,180 1440,100 L1440,400 L0,400 Z";

export default function AuroraSky({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-0 overflow-hidden ${className ?? ""}`}
    >
      {/* dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.62 0.184 245 / 0.35) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 90%)",
        }}
      />

      {/* aurora waves */}
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="aurora-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.176 240)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.92 0.07 230)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="aurora-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.13 220)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.95 0.05 250)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="aurora-c" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.184 245)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="oklch(0.62 0.184 245)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d={WAVE_A}
          fill="url(#aurora-a)"
          animate={reduceMotion ? undefined : { d: [WAVE_A, WAVE_B, WAVE_A] }}
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.path
          d={WAVE_C}
          fill="url(#aurora-b)"
          animate={reduceMotion ? undefined : { d: [WAVE_C, WAVE_D, WAVE_C] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
        />
        <motion.path
          d={WAVE_E}
          fill="url(#aurora-c)"
          animate={reduceMotion ? undefined : { d: [WAVE_E, WAVE_F, WAVE_E] }}
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, delay: 3 }}
        />
      </svg>

      {/* soft top fade so the nav blends out */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      {/* bottom fade so the section ends cleanly */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
