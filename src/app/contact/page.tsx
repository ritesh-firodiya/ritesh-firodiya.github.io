import type { Metadata } from "next";
import Link from "next/link";
import { IconMail, IconLinkedin, IconGit, IconLocation } from "@/components/icons";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Get in touch",
  description: "Email, LinkedIn and GitHub. Open to senior / staff roles and consulting.",
  alternates: { canonical: "/contact/" },
};

/* Email, not a form. This is a static export with no server to post to, and a
   contact form that silently drops messages is worse than no form — a
   third-party handler would also put a stranger between a job offer and an
   inbox. */
const WAYS = [
  { Icon: IconMail, label: "firodiya.ritesh@gmail.com", note: "Usually same day", href: `mailto:${profile.email}`, dynamic: "email" as const },
  { Icon: IconLinkedin, label: "in/riteshfirodiya", note: "For recruiters", href: `https://linkedin.com/in/${profile.linkedin}` },
  { Icon: IconGit, label: "github.com/ritesh-firodiya", note: "Most product repos are private", href: `https://github.com/${profile.github}` },
];

export default function Contact() {
  return (
    <>
      <SiteHeader cta={{ href: "/resume", label: "Résumé" }} />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter py-16">
            <Label>Get in touch</Label>
            <h1 className="mt-3 max-w-[20ch] text-d1 font-semibold">
              Hiring, building, or just want to argue about tooling?
            </h1>
            <p className="mt-5 max-w-measure text-lead text-ink-2">
              Email is best and I reply to everything. Tell me what you are working on — a
              paragraph is plenty.
            </p>

            <div className="mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
              {WAYS.map(({ Icon, label, note, href, dynamic }) => (
                <a
                  key={label}
                  href={href}
                  className="group rounded-card border border-line bg-surface p-6 transition hover:border-brand-200"
                >
                  <Icon size={20} strokeWidth={1.75} className="text-brand-500" aria-hidden />
                  <p className="mt-3 text-small font-semibold transition group-hover:text-brand-500">
                    {dynamic === "email" ? profile.email : label}
                  </p>
                  <p className="mt-1 font-mono text-xs2 text-ink-3">{note}</p>
                </a>
              ))}
              <div className="rounded-card border border-line bg-muted p-6">
                <IconLocation size={20} strokeWidth={1.75} className="text-ink-3" aria-hidden />
                <p className="mt-3 text-small font-semibold">{profile.location} · IST</p>
                <p className="mt-1 font-mono text-xs2 text-ink-3">
                  Remote, and used to overlapping with other zones
                </p>
              </div>
            </div>

            <div className="mt-10 max-w-3xl rounded border-l-2 border-live bg-live-bg px-5 py-4">
              <p className="text-small font-medium text-ink">
                Open to senior / staff IC and tech-lead roles.
              </p>
              <p className="mt-1 text-small text-ink-2">
                Also taking on consulting —{" "}
                <Link href="/hire" className="text-brand-500 underline decoration-brand-200 underline-offset-4">
                  what that looks like
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
