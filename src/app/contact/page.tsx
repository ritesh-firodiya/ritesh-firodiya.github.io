import Link from "next/link";
import type { Metadata } from "next";
import { Briefcase, Download, GitBranch, Mail, type LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email is fastest. Open to senior, staff and tech-lead roles, and to short contracts.",
  alternates: { canonical: "/contact/" },
};

const OPEN_TO = [
  { t: "Senior or staff engineer", b: "full-stack TypeScript, web or mobile." },
  { t: "Tech lead", b: "a small team, with hands still on the code." },
  { t: "Short contracts", b: "an MVP taken from designs to a store release." },
];

export default function ContactPage() {
  const ways: { Icon: LucideIcon; title: string; note: string; href: string }[] = [
    { Icon: Briefcase, title: "LinkedIn", note: `in/${profile.linkedin} · for recruiters`, href: `https://linkedin.com/in/${profile.linkedin}` },
    { Icon: GitBranch, title: "GitHub", note: `${profile.github} · most product repos are private`, href: `https://github.com/${profile.github}` },
    { Icon: Download, title: "Résumé PDF", note: "One file, for your applicant system", href: "/resume.pdf" },
  ];
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap pb-12 pt-8 lg:pt-10">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title mt-3">Get in touch.</h1>
        <p className="mt-4 max-w-[56ch] text-lead text-ink-2">Email is fastest. Usually a reply within two working days.</p>

        {/* A mailto, not a form: a static site has nowhere to post one to. */}
        <a href={`mailto:${profile.email}`} className="card mt-8 flex flex-wrap items-center justify-between gap-6 p-8">
          <div>
            <p className="eyebrow">Email</p>
            <p className="section-title mt-2 break-all">{profile.email}</p>
          </div>
          <span className="btn btn-primary">
            <Mail size={16} aria-hidden /> Write an email
          </span>
        </a>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {ways.map(({ Icon, title, note, href }) => (
            <a key={title} href={href} className="card p-6">
              <Icon size={24} className="text-brand-500" aria-hidden />
              <h2 className="mt-4 text-h3 font-bold">{title}</h2>
              <p className="mt-1 text-base text-ink-2">{note}</p>
            </a>
          ))}
        </div>

        <section className="mt-9 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">What I am open to</p>
            <h2 className="section-title mt-2">In this order.</h2>
          </div>
          <ol className="border-b border-line">
            {OPEN_TO.map((o, i) => (
              <li key={o.t} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[3rem_1fr]">
                <p className="font-mono text-xs text-ink-3">0{i + 1}</p>
                <p className="text-body">
                  <b className="font-semibold">{o.t}</b> <span className="text-ink-2">— {o.b}</span>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-10 rounded-lg border border-line bg-muted p-5 text-base text-ink-2">
          Using one of my apps and need help?{" "}
          <Link href="/support/" className="text-link">Go to Support</Link> — a bug, a purchase, or deleting your account.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
