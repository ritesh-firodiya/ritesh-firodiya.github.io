import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font — no render-blocking request to
// Google, and no layout shift. The wireframes used an @import because they run
// from a CDN with no build step; this is the same three faces, done properly.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ritesh-firodiya.github.io"),
  title: {
    default: "Ritesh Firodiya — Full-stack engineer",
    template: "%s — Ritesh Firodiya",
  },
  description:
    "Full-stack engineer with nine years of production TypeScript at Walmart, Swiggy, Speechify and Globant. Thirteen products of my own, each with its screens, its wiki and its store listing.",
  openGraph: {
    type: "website",
    siteName: "Ritesh Firodiya",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        {/* Runs before first paint. A stored choice applied in an effect
            repaints after the light palette has already been shown, which is
            a white flash on every single navigation for a dark-mode reader. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}',
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-page"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
