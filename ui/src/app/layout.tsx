import "./globals.css";

import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";

import AppLayout from "@/components/layout/AppLayout";
import PostHogIdentify from "@/components/PostHogIdentify";
import { SentryErrorBoundary } from "@/components/SentryErrorBoundary";
import SpinLoader from "@/components/SpinLoader";
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
  weight: ["300", "400", "500", "600", "700"],
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
  title: "Iluminators",
  description: "AI voice agents for mortgage lead follow-up",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Inline script to prevent flash of light theme - runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}>
        <SentryErrorBoundary>
          <AuthProvider>
            <AppConfigProvider>
              <Suspense fallback={<SpinLoader />}>
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
