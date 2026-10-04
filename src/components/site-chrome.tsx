import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { profile } from "@/lib/profile";

/**
 * The header belongs to one reader: someone deciding whether to interview me.
 * Support and Legal are for people who use the apps and for store reviewers,
 * who arrive by direct link — they live in the footer.
 */
export type NavKey = "work" | "process" | "about" | "resume";

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: "work", label: "Work", href: "/work/" },
  { key: "process", label: "How I build", href: "/process/" },
  { key: "about", label: "About", href: "/about/" },
  { key: "resume", label: "Résumé", href: "/resume/" },
];

function NavLinks({ on }: { on?: NavKey }) {
  return NAV.map((n) => (
    <Link
      key={n.key}
      href={n.href}
      aria-current={n.key === on ? "page" : undefined}
      className={`nav-link${n.key === on ? " nav-link--on" : ""}`}
    >
      {n.label}
    </Link>
  ));
}

export function SiteHeader({ on }: { on?: NavKey }) {
  return (
    <header className="site-head no-print">
      <div className="wrap flex items-center gap-4 py-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2.5 text-base font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/me.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          {profile.name}
        </Link>
        <nav className="ml-auto hidden items-center gap-7 md:flex" aria-label="Main">
          <NavLinks on={on} />
        </nav>
        <span className="ml-auto md:ml-0">
          <ThemeToggle />
        </span>
        <Link href="/contact/" className="btn btn-primary">
          Get in touch
        </Link>
      </div>
      {/* No menu button: a hidden menu is a state nobody drew. On a phone the
          same four links sit in a row that scrolls. */}
      <nav className="wrap flex gap-6 overflow-x-auto pb-1 md:hidden" aria-label="Main">
        <NavLinks on={on} />
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto bg-band text-band-ink">
      <div className="wrap grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-body font-bold">{profile.name}</p>
          <p className="mt-2 max-w-[34ch] text-sm text-band-2">
            Full-stack engineer in {profile.location}. Open to senior, staff and tech-lead roles.
          </p>
          <a href={`mailto:${profile.email}`} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
            {profile.email}
          </a>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="eyebrow eyebrow--band mb-1">Site</p>
          <Link href="/work/">Work</Link>
          <Link href="/process/">How I build</Link>
          <Link href="/about/">About</Link>
          <Link href="/resume/">Résumé</Link>
          <Link href="/contact/">Contact</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="eyebrow eyebrow--band mb-1">For app users</p>
          <Link href="/support/">Support</Link>
          <Link href="/legal/">Privacy and legal</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="eyebrow eyebrow--band mb-1">Elsewhere</p>
          <a href={`https://github.com/${profile.github}`}>GitHub</a>
          <a href={`https://linkedin.com/in/${profile.linkedin}`}>LinkedIn</a>
          <a href="/resume.pdf">Résumé PDF</a>
        </div>
      </div>
      <div className="wrap band-rule py-4 text-xs text-band-2">
        © {new Date().getFullYear()} {profile.name} · {profile.location}
      </div>
    </footer>
  );
}
