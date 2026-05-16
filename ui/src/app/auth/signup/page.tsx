"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { signupApiV1AuthSignupPost } from "@/client/sdk.gen";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await signupApiV1AuthSignupPost({ body: { email, password } });
      if (res.error || !res.data) {
        const detail = (res.error as { detail?: string })?.detail;
        toast.error(detail || "Signup failed");
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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[oklch(0.8_0.14_78/0.15)] blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[oklch(0.62_0.13_240/0.08)] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 flex items-center gap-3"
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

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
            Request access
          </p>
          <h1 className="font-display text-4xl font-light tracking-tight">
            Start a <em className="italic text-primary">new</em> pipeline.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Create your workspace in under a minute.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >
          <SField label="Email" hint="01" id="email" type="email" placeholder="you@brokerage.com" value={email} onChange={setEmail} />
          <SField label="Password" hint="02" id="password" type="password" placeholder="• • • • • • • •" value={password} onChange={setPassword} />
          <SField label="Confirm" hint="03" id="confirmPassword" type="password" placeholder="• • • • • • • •" value={confirmPassword} onChange={setConfirmPassword} />

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
                  <span className="font-mono text-xs uppercase tracking-[0.2em]">Creating…</span>
                </>
              ) : (
                <>
                  <span>Create workspace</span>
                  <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">→</span>
                </>
              )}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground"
        >
          Already a member?{" "}
          <Link
            href="/auth/login"
            className="text-foreground underline decoration-primary/60 decoration-2 underline-offset-4 transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  );
}

function SField({
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
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground/40">/ {hint}</span>
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
          minLength={id === "email" ? undefined : 8}
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
