import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Download, Mail } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips } from "@/components/ui";
import { profile } from "@/lib/profile";
import { products, stageCounts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Résumé",
  description: profile.summary,
  alternates: { canonical: "/resume/" },
};

/* A page first and a PDF second: a recruiter on a phone reads the page, one
   filing an application downloads the file. Both are in the first screenful. */
export default function ResumePage() {
  const school = profile.education[0];
  return (
    <>
      <SiteHeader on="resume" />
      <main id="main" className="wrap pb-12 pt-8 lg:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Résumé</p>
            <h1 className="page-title mt-3">{profile.name}</h1>
            <p className="mt-2 text-lead text-ink-2">Senior full-stack engineer · {profile.location}</p>
          </div>
          <div className="no-print flex flex-wrap gap-3">
            <a href="/resume.pdf" className="btn btn-primary">
              <Download size={16} aria-hidden /> Download PDF
            </a>
            <a href={`mailto:${profile.email}`} className="btn btn-quiet">
              <Mail size={16} aria-hidden /> Email
            </a>
            <a href={`https://linkedin.com/in/${profile.linkedin}`} className="btn btn-quiet">LinkedIn</a>
          </div>
        </div>

        <p className="card mt-8 max-w-[80ch] p-6 text-body text-ink-2">{profile.summary}</p>

        <section className="mt-9">
          <h2 className="section-title">Experience</h2>
          <ol className="mt-5">
            {profile.experiences.map((e) => (
              <li key={e.company} className="grid gap-2 border-t border-line py-6 lg:grid-cols-[13rem_1fr]">
                {/* Dates in their own column: they are what a reader scans for gaps. */}
                <p className="pt-1 font-mono text-xs text-ink-3">
                  {e.from} — {e.to}
                </p>
                <div>
                  <h3 className="text-h3 font-bold">{e.position}</h3>
                  <p className="text-base font-semibold text-brand-500">{e.company}</p>
                  <p className="mt-2 max-w-[70ch] text-base text-ink-2">{e.description}</p>
                  <div className="mt-3">
                    <Chips items={e.tags} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="section-title">Skills</h2>
          <div className="mt-5 border-b border-line">
            {Object.entries(profile.skills).map(([k, v]) => (
              <div key={k} className="grid gap-2 border-t border-line py-3 sm:grid-cols-[10rem_1fr]">
                <p className="eyebrow pt-1">{k}</p>
                <Chips items={v} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-9 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <p className="eyebrow">Education</p>
            <h3 className="mt-3 text-h3 font-bold">{school.degree}</h3>
            <p className="mt-1 text-base text-ink-2">
              {school.institution} · {school.from} — {school.to}
            </p>
          </div>
          <Link href="/work/" className="card p-6">
            <p className="eyebrow">Own products</p>
            <h3 className="mt-3 text-h3 font-bold">
              {products.length} projects, {stageCounts.live} live
            </h3>
            <p className="mt-1 text-base text-ink-2">Each with its screens, its wiki and its store links.</p>
          </Link>
        </section>

        <div className="no-print mt-9 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-brand-50 p-8">
          <h2 className="section-title max-w-[24ch]">Does this match a role you have open?</h2>
          <Link href="/contact/" className="btn btn-primary">
            Get in touch <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
