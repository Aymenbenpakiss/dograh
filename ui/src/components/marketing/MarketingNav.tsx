"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Product", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Sign in", href: "/auth/login" },
];

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        {/* Brand mark */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20" />
            <div className="absolute inset-[3px] rounded-full border border-primary/60" />
            <div className="absolute inset-[8px] rounded-full bg-primary" />
            <div className="absolute inset-0 animate-pulse-ring rounded-full border border-primary/40" />
          </div>
          <span className="font-display text-xl font-medium tracking-tight">
            Azsetax
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/auth/signup"
            className="lumen-glow group relative overflow-hidden rounded-md bg-primary px-5 py-2.5 text-sm font-medium tracking-wide text-primary-foreground transition-colors"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              Get started
              <span className="font-mono text-xs opacity-60 transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile slide-down sheet */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/90 backdrop-blur-md lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4 sm:px-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="lumen-glow group relative block overflow-hidden rounded-md bg-primary px-5 py-3 text-center text-sm font-medium tracking-wide text-primary-foreground transition-colors"
              >
                <span className="relative z-10">Get started</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
