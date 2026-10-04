import Link from "next/link";
import { Mail } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { profile } from "@/lib/profile";
import { gmailCompose } from "@/lib/mail";

export type NavKey = "work" | "process" | "resume";

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: "work", label: "Work", href: "/#work" },
  { key: "process", label: "Process", href: "/#process" },
  { key: "resume", label: "Résumé", href: "/resume/" },
];

export function SiteHeader({ on }: { on?: NavKey }) {
  return (
    <header className="site-head no-print">
      <div className="wrap flex items-center gap-4 py-2 md:gap-6">
        <Link href="/" className="flex items-center gap-2 text-base font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/me.webp" alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
          <span className="hidden sm:inline">{profile.name}</span>
        </Link>
        <nav className="ml-auto flex items-center gap-5" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} aria-current={n.key === on ? "page" : undefined} className={`nav-link${n.key === on ? " nav-link--on" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        {/* Gmail's compose page: a mailto link does nothing on a machine with no mail app. */}
        <a href={gmailCompose()} target="_blank" rel="noopener" className="btn btn-primary" aria-label={`Email ${profile.email}`}>
          <Mail size={16} aria-hidden /> <span className="hidden sm:inline">Email</span>
        </a>
      </div>
    </header>
  );
}

/** One line. Support and Legal are for app users and store reviewers, who
 *  arrive by direct link. */
export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="wrap flex flex-wrap items-center gap-x-5 gap-y-1.5 py-4 text-sm text-ink-2">
        <a href={`mailto:${profile.email}`} className="font-semibold text-ink">{profile.email}</a>
        <a href={`https://linkedin.com/in/${profile.linkedin}`}>LinkedIn</a>
        <a href={`https://github.com/${profile.github}`}>GitHub</a>
        <a href="/resume.pdf">Résumé PDF</a>
        <span className="ml-auto flex gap-5 text-ink-3">
          <Link href="/support/">Support</Link>
          <Link href="/legal/">Legal</Link>
        </span>
      </div>
    </footer>
  );
}
