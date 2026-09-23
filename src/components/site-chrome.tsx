import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

/* Six destinations, because the site has six jobs. The version this replaces
   carried three — Products, Screens, Résumé — while Work, Hire, Support and
   Legal were reachable only from the footer or from prose inside a page.

   Résumé is not in this list on purpose: it is the CTA slot on pages where
   hiring is the likely intent, and a recruiter should never scroll for it. */
const NAV = [
  { href: "/work", label: "Work" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/hire", label: "Hire me" },
] as const;

export function SiteHeader({
  active,
  cta = { href: "/contact", label: "Get in touch" },
}: {
  active?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center gap-4 px-gutter py-4 sm:gap-8">
        <Link href="/" className="text-h3 font-semibold tracking-tight">
          Ritesh Firodiya
        </Link>
        {/* The nav collapses below sm rather than becoming a hamburger: four
            links fit a phone as a wrapped row, and a drawer for four items is
            a tap to reveal what would already have been on screen. */}
        <nav className="ml-auto hidden items-center gap-7 text-small text-ink-2 sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={active === n.href ? "text-ink" : "transition hover:text-ink"}
              aria-current={active === n.href ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
          <ThemeToggle />
          <Link
            href={cta.href}
            className="rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inverse transition hover:bg-brand-500"
          >
            {cta.label}
          </Link>
        </div>
      </div>
      <nav className="flex items-center gap-5 border-t border-line px-gutter py-2.5 text-small text-ink-2 sm:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={active === n.href ? "text-ink" : ""}
            aria-current={active === n.href ? "page" : undefined}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-band text-band-ink/50">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-6 gap-y-2 px-gutter py-7 font-mono text-xs2">
        <span>© {new Date().getFullYear()} Ritesh Firodiya</span>
        <Link href="/products" className="transition hover:text-band-ink">Products</Link>
        {/* Legal is in the footer of every page and must stay there: two live
            Play listings point at documents under /legal/, and a reader who
            arrives from a store listing has exactly one thing they want. */}
        <Link href="/legal" className="transition hover:text-band-ink">Legal</Link>
        <Link href="/support" className="transition hover:text-band-ink">Support</Link>
        <Link href="/about" className="transition hover:text-band-ink">About</Link>
        <Link href="/contact" className="ml-auto transition hover:text-band-ink">
          Get in touch →
        </Link>
      </div>
    </footer>
  );
}
