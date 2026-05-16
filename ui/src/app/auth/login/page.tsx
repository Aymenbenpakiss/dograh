"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { loginApiV1AuthLoginPost } from "@/client/sdk.gen";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginApiV1AuthLoginPost({
        body: { email, password },
      });

      if (res.error || !res.data) {
        const detail = (res.error as { detail?: string })?.detail;
        toast.error(detail || "Login failed");
        return;
      }

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: res.data.token, user: res.data.user }),
      });

      window.location.href = "/after-sign-in";
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background composition */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[oklch(0.8_0.14_78/0.15)] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[oklch(0.62_0.13_240/0.08)] blur-[120px]" />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT — editorial side */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative hidden flex-col justify-between border-r border-border/50 px-12 py-14 lg:flex"
        >
          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-full bg-primary/20" />
              <div className="absolute inset-[3px] rounded-full border border-primary/60" />
              <div className="absolute inset-[8px] rounded-full bg-primary" />
              <div className="absolute inset-0 animate-pulse-ring rounded-full border border-primary/40" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-medium tracking-tight">Azsetax</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                voice · loan · pipeline
              </span>
            </div>
          </motion.div>

          {/* Editorial headline */}
          <div className="max-w-xl space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-primary/80">
                <span className="mr-2 inline-block h-px w-8 translate-y-[-3px] bg-primary/60 align-middle" />
                Issue 001 — The Voice Issue
              </p>
              <h1 className="font-display text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-[0.95] tracking-tight">
                Light the{" "}
                <em className="font-display italic text-primary">leads</em>
                <br />
                that everyone
                <br />
                else lets <em className="italic">go cold.</em>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="max-w-md text-[0.95rem] leading-relaxed text-muted-foreground"
            >
              Azsetax is a voice intelligence layer for mortgage teams.
              We call, qualify, and route every new loan opportunity — overnight,
              over weekend, between meetings — so your producers only hear from
              borrowers who are ready to talk.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="grid grid-cols-3 gap-6 border-t border-border/50 pt-8"
            >
              {[
                { v: "24/7", l: "outbound dialer" },
                { v: "<60s", l: "first response" },
                { v: "1¢", l: "per qualified second" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-medium tracking-tight">{s.v}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footnote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span>© Azsetax — MMXXVI</span>
            <Link href="/legal/credits" className="hover:text-foreground">
              Credits
            </Link>
          </motion.div>
        </motion.aside>

        {/* RIGHT — form panel */}
        <main className="relative flex items-center justify-center px-6 py-12 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            {/* Mobile brand */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-full bg-primary/20" />
                <div className="absolute inset-[3px] rounded-full bg-primary" />
              </div>
              <span className="font-display text-xl font-medium tracking-tight">Azsetax</span>
            </div>

            <div className="mb-10">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
                Member access
              </p>
              <h2 className="font-display text-4xl font-light tracking-tight">
                Welcome <em className="italic text-primary">back.</em>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Sign in to keep the leads warm.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Field
                label="Email"
                hint="01"
                id="email"
                type="email"
                placeholder="you@brokerage.com"
                value={email}
                onChange={setEmail}
              />
              <Field
                label="Password"
                hint="02"
                id="password"
                type="password"
                placeholder="• • • • • • • •"
                value={password}
                onChange={setPassword}
              />

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="lumen-glow group relative w-full overflow-hidden rounded-md bg-primary px-6 py-3.5 text-sm font-medium tracking-wide text-primary-foreground transition-colors disabled:opacity-60"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground/80" />
                      <span className="font-mono text-xs uppercase tracking-[0.2em]">
                        Authenticating…
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.button>
            </form>

            <p className="mt-10 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
              First time here?{" "}
              <Link
                href="/auth/signup"
                className="text-foreground underline decoration-primary/60 decoration-2 underline-offset-4 transition-colors hover:text-primary"
              >
                Request an invitation
              </Link>
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  id,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="group">
      <div className="mb-2 flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors group-focus-within:text-primary"
        >
          {label}
        </label>
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground/40">
          / {hint}
        </span>
      </div>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          className="w-full border-0 border-b border-border bg-transparent px-0 py-3 font-sans text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        <motion.div
          initial={false}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="absolute bottom-0 left-0 h-px w-full bg-primary"
        />
      </div>
    </div>
  );
}
