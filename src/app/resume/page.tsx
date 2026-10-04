import type { Metadata } from "next";
import { Download, Mail } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips } from "@/components/ui";
import { profile } from "@/lib/profile";
import { gmailCompose } from "@/lib/mail";

export const metadata: Metadata = {
  title: "Résumé",
  description: profile.summary,
  alternates: { canonical: "/resume/" },
};

/* A page first and a PDF second: a recruiter on a phone reads the page, one
   filing an application downloads the file. */
export default function ResumePage() {
  const school = profile.education[0];
  return (
    <>
      <SiteHeader on="resume" />
      <main id="main" className="wrap pb-10 pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/me.webp" alt="" width={64} height={64} className="h-16 w-16 rounded-full border border-line object-cover" />
          <div className="min-w-0 flex-1">
            <h1 className="page-title">{profile.name}</h1>
            <p className="text-base text-ink-2">Senior full-stack engineer · {profile.location}</p>
            {/* The buttons beside this are hidden on paper, so the sheet needs its own contact line. */}
            <p className="print-only text-sm text-ink-2">
              {profile.email} · linkedin.com/in/{profile.linkedin} · github.com/{profile.github} ·{" "}
              {profile.github}.github.io
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <a href="/resume.pdf" className="btn btn-primary">
              <Download size={16} aria-hidden /> PDF
            </a>
            <a href={gmailCompose()} target="_blank" rel="noopener" className="btn btn-quiet">
              <Mail size={16} aria-hidden /> {profile.email}
            </a>
            <a href={`https://linkedin.com/in/${profile.linkedin}`} className="btn btn-quiet">LinkedIn</a>
          </div>
        </div>

        <p className="mt-4 max-w-[90ch] text-body text-ink-2">{profile.summary}</p>

        <ol className="mt-5 border-b border-line">
          {profile.experiences.map((e) => (
            <li key={e.company} className="grid gap-x-6 gap-y-1 border-t border-line py-3.5 lg:grid-cols-[11rem_1fr]">
              <p className="pt-0.5 font-mono text-xs text-ink-3">
                {e.from} — {e.to}
              </p>
              <div>
                <h2 className="text-body font-bold">
                  {e.position} <span className="font-semibold text-brand-500">· {e.company}</span>
                </h2>
                <p className="mt-1 max-w-[90ch] text-base text-ink-2">{e.description}</p>
                <div className="mt-2">
                  <Chips items={e.tags} />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid gap-x-8 border-b border-line lg:grid-cols-2">
          {Object.entries(profile.skills).map(([k, v]) => (
            <div key={k} className="grid content-start items-start gap-x-4 gap-y-1 border-b border-line py-2.5 sm:grid-cols-[8rem_1fr]">
              <p className="eyebrow pt-1">{k}</p>
              <Chips items={v} />
            </div>
          ))}
          <div className="grid gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[8rem_1fr] lg:col-span-2">
            <p className="eyebrow pt-1">Education</p>
            <p className="text-base">
              <b className="font-semibold">{school.degree}</b>{" "}
              <span className="text-ink-2">
                · {school.institution} · {school.from} — {school.to}
              </span>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
