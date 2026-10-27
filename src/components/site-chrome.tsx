import Link from "next/link";
import { Mail } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { profile } from "@/lib/profile";
import { gmailCompose } from "@/lib/mail";
import { CANON_REPO } from "@/lib/canon";

export type NavKey = "work" | "canon" | "resume";

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: "work", label: "Work", href: "/#work" },
  { key: "canon", label: "canon", href: "/products/canon/" },
  { key: "resume", label: "Résumé", href: "/resume/" },
];

export function SiteHeader({ on }: { on?: NavKey }) {
  return (
    <header className="site-head no-print">
      <div className="wrap flex items-center gap-3 py-2 md:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-bold" aria-label={`${profile.name}, home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/me.webp" alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
          <span className="hidden md:inline">{profile.name}</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 md:gap-6" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} aria-current={n.key === on ? "page" : undefined} className={`nav-link${n.key === on ? " nav-link--on" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        {/* Gmail's compose page: a mailto link does nothing on a machine with no mail app. */}
        <a href={gmailCompose()} target="_blank" rel="noopener" className="btn btn-quiet hidden sm:inline-flex" aria-label={`Email ${profile.email}`}>
          <Mail size={16} aria-hidden /> Email
        </a>
      </div>
    </header>
  );
}

/** Contact first, then the links, then Support and Legal for app users and
 *  store reviewers, who arrive by direct link. On a phone the header has no
 *  email button, so the address here is the way in. */
export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="wrap grid gap-3 py-5 text-sm text-ink-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
        <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <Mail size={16} aria-hidden /> {profile.email}
        </a>
        <span className="flex flex-wrap gap-x-5 gap-y-1">
          <a href={`https://linkedin.com/in/${profile.linkedin}`}>LinkedIn</a>
          <a href={`https://github.com/${profile.github}`}>GitHub</a>
          <a href={CANON_REPO}>canon on GitHub</a>
          <a href="/resume.pdf">Résumé PDF</a>
        </span>
        <span className="flex gap-5 text-ink-3 sm:ml-auto">
          <Link href="/support/">Support</Link>
          <Link href="/legal/">Legal</Link>
        </span>
      </div>
    </footer>
  );
}
