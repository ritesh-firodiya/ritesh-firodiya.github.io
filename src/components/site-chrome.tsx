import Link from "next/link";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/resume", label: "Résumé" },
] as const;

export function SiteHeader({
  active,
  cta = { href: "/#contact", label: "Get in touch" },
}: {
  active?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center gap-6 px-gutter py-4">
        <Link href="/" className="font-display text-h3 font-semibold tracking-tight">
          Ritesh Firodiya
        </Link>
        <nav className="ml-auto hidden items-center gap-7 text-small text-ink-2 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`link-u ${active === n.href ? "text-ink" : "hover:text-ink"}`}
              aria-current={active === n.href ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inv transition hover:bg-accent"
        >
          {cta.label}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-inv">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-6 gap-y-3 px-gutter py-7 font-mono text-xs2 text-ink-inv/55">
        <span>© {new Date().getFullYear()} Ritesh Firodiya</span>
        <Link href="/products" className="link-u hover:text-ink-inv">Products</Link>
        <Link href="/legal" className="link-u hover:text-ink-inv">Legal</Link>
        <Link href="/support" className="link-u hover:text-ink-inv">Support</Link>
        <Link href="/#contact" className="link-u ml-auto hover:text-ink-inv">Get in touch →</Link>
      </div>
    </footer>
  );
}
