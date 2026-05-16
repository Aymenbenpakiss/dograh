import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingNav from "@/components/marketing/MarketingNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-azure relative min-h-screen flex flex-col bg-background text-foreground">
      {/* Ambient light-theme atmosphere — soft sky wash behind everything */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[900px] w-[1200px] -translate-x-1/2 rounded-[50%] bg-[oklch(0.92_0.07_240)] opacity-60 blur-[120px]" />
        <div className="absolute bottom-[-300px] right-[-200px] h-[600px] w-[600px] rounded-full bg-[oklch(0.88_0.08_220)] opacity-50 blur-[120px]" />
        <div className="absolute top-1/3 left-[-200px] h-[420px] w-[420px] rounded-full bg-[oklch(0.94_0.05_260)] opacity-50 blur-[100px]" />
      </div>
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
