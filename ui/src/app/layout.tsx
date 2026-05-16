import "./globals.css";

import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";

import AppLayout from "@/components/layout/AppLayout";
import PostHogIdentify from "@/components/PostHogIdentify";
import { SentryErrorBoundary } from "@/components/SentryErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { AppConfigProvider } from "@/context/AppConfigContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { TelephonyConfigWarningsProvider } from "@/context/TelephonyConfigWarningsContext";
import { UserConfigProvider } from "@/context/UserConfigContext";
import { AuthProvider } from "@/lib/auth";


const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Azsetax",
  description: "AI voice agents for mortgage lead follow-up",
};

// Marketing routes render in the light "azure" theme; all other routes
// (authenticated app + auth screens) keep the dark Lumen theme. Toggle the
// `.dark` class on <html> via an inline pre-hydration script so there's no
// flash on first paint.
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var p = window.location.pathname;
    var isMarketing =
      p === "/" ||
      p.startsWith("/pricing") ||
      p.startsWith("/features") ||
      p.startsWith("/docs") ||
      p.startsWith("/industries");
    if (!isMarketing) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}>
        <SentryErrorBoundary>
          <AuthProvider>
            <AppConfigProvider>
              <Suspense fallback={null}>
                <UserConfigProvider>
                  <TelephonyConfigWarningsProvider>
                    <OnboardingProvider>
                      <PostHogIdentify />
                      <AppLayout>
                        {children}
                      </AppLayout>
                      <Toaster />
                    </OnboardingProvider>
                  </TelephonyConfigWarningsProvider>
                </UserConfigProvider>
              </Suspense>
            </AppConfigProvider>
          </AuthProvider>
        </SentryErrorBoundary>
      </body>
    </html>
  );
}
