import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-6">
      <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
        <Link
          href="/legal/privacy"
          className="hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
        <span className="text-border">|</span>
        <Link
          href="/legal/terms"
          className="hover:text-foreground transition-colors"
        >
          Terms of Service
        </Link>
        <span className="text-border">|</span>
        <Link
          href="/legal/credits"
          className="hover:text-foreground transition-colors"
        >
          Credits
        </Link>
      </div>
    </footer>
  );
}
