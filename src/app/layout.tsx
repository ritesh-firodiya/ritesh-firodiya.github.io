import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font — no render-blocking request to
// Google, and no layout shift. The wireframes used an @import because they run
// from a CDN with no build step; this is the same three faces, done properly.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ritesh-firodiya.github.io"),
  title: {
    default: "Ritesh Firodiya — Engineer who ships",
    template: "%s — Ritesh Firodiya",
  },
  description:
    "Full-stack engineer and lead, ~9 years. Thirteen products for India — eight of them apps, two live on the Play Store. Every app's real price, stated plainly.",
  openGraph: {
    type: "website",
    siteName: "Ritesh Firodiya",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-small focus:text-ink-inv"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
