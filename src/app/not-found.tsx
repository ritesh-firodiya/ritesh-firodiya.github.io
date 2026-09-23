import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";

/* A 404 that routes rather than apologises. The three destinations are the same
   three doors as the home page, because a lost visitor is still one of the same
   three readers. */
const DOORS = [
  { href: "/resume", title: "Résumé", body: "The full history, on the web or as a PDF." },
  { href: "/products", title: "Products", body: "Every app, and how each one is paid for." },
  { href: "/hire", title: "Work with me", body: "What I take on, and how an engagement runs." },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="grain relative mx-auto flex min-h-[70vh] max-w-page flex-col justify-center px-gutter py-section">
        <Label>404</Label>
        <h1 className="mt-5 max-w-[16ch] font-display text-d1 font-semibold">That page moved, or never existed.</h1>
        <p className="mt-6 max-w-measure text-lead text-ink-2">
          Both are plausible — this site was rebuilt from scratch. Here is where you were probably going.
        </p>
        <div className="mt-11 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
          {DOORS.map((d) => (
            <Link key={d.href} href={d.href} className="group bg-surface p-6 transition hover:bg-muted">
              <h2 className="font-display text-h3 font-semibold group-hover:text-brand-500">{d.title}</h2>
              <p className="mt-1.5 text-small text-ink-2">{d.body}</p>
            </Link>
          ))}
        </div>
        <Link href="/" className="link-u mt-10 inline-flex items-center gap-2 self-start text-small font-medium text-brand-500">
          ← Back to the start
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
