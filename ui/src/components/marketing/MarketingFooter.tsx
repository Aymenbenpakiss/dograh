import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/features" },
  { label: "Docs", href: "/docs" },
  { label: "Status", href: "#" },
  { label: "Changelog", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Credits", href: "/legal/credits" },
];

export default function MarketingFooter() {
  return (
    <footer className="py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Three-column grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/20" />
                <div className="absolute inset-[3px] rounded-full border border-primary/60" />
                <div className="absolute inset-[8px] rounded-full bg-primary" />
                <div className="absolute inset-0 animate-pulse-ring rounded-full border border-primary/40" />
              </div>
              <span className="font-display text-xl font-medium tracking-tight">
                Azsetax
              </span>
            </div>
            <p className="max-w-[220px] text-sm leading-relaxed text-muted-foreground">
              AI voice agents for mortgage teams.
            </p>
          </div>

          {/* Column 2 — Product */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Legal
            </h3>
            <ul className="flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom attribution row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row sm:items-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            © Azsetax MMXXVI
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Voice infra: Dograh BSD-2
          </span>
        </div>
      </div>
    </footer>
  );
}
