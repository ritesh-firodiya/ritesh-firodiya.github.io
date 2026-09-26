import Link from "next/link";
import type { Metadata } from "next";
import { profile } from "@/lib/profile";
import { shipped, MODEL } from "@/lib/products";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Full-stack engineer and tech lead, ~9 years. Products shipped, then employment.",
  alternates: { canonical: "/resume/" },
};

export default function ResumePage() {
  return (
    <div className="bg-sunken">
      {/* Toolbar disappears in print — the sheet below is the PDF. */}
      <div className="no-print sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-page flex-wrap items-center gap-3 px-gutter py-3.5">
          <Link href="/" className="link-u inline-flex items-center gap-1.5 text-small text-ink-2 hover:text-ink">← Back to site</Link>
          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <a href="/resume.pdf" className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inverse transition hover:bg-brand-500">
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* A4-proportioned sheet on a darker ground, so it reads as a document
          rather than another web section. Products come BEFORE employment —
          for a candidate whose differentiator is shipped products, burying them
          under eight jobs throws away the whole case. */}
      <main id="main" className="mx-auto my-10 max-w-[52rem] bg-surface px-10 py-12 shadow-frame print:my-0 print:shadow-none sm:px-14">
        {/* Photo sits with the contact block, not above the name: on the
            printed sheet the name has to stay the first thing read, and a
            portrait that pushes it down costs a résumé its opening line.
            print-exact keeps it from dropping out of the PDF. */}
        <header className="flex flex-wrap items-start gap-6 border-b-2 border-ink pb-7 sm:flex-nowrap">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-d2 font-semibold">{profile.name}</h1>
            <p className="mt-1.5 font-display text-lead italic text-ink-2">Full-stack engineer &amp; tech lead · ~9 years</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-xs2 text-ink-2">
              <span>{profile.location}</span>
              <a href={`mailto:${profile.email}`} className="link-u">{profile.email}</a>
              <a href={`https://github.com/${profile.github}`} className="link-u">github.com/{profile.github}</a>
              <a href={`https://linkedin.com/in/${profile.linkedin}`} className="link-u">linkedin.com/in/{profile.linkedin}</a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/me.webp"
            alt={profile.name}
            width={104}
            height={104}
            className="h-24 w-24 shrink-0 rounded-card border border-line object-cover print:[print-color-adjust:exact]"
          />
        </header>

        <section className="pt-8">
          <p className="text-body text-ink-2">{profile.summary}</p>
        </section>

        <section className="pt-9">
          <h2 className="border-b border-line pb-2 font-mono text-label uppercase tracking-label text-ink-3">Products shipped</h2>
          <ul className="mt-4 space-y-3.5">
            {shipped.slice(0, 5).map((p) => (
              <li key={p.slug} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                <div>
                  <span className="font-semibold">{p.name}</span>{" "}
                  <span className="text-ink-2">— {p.blurb}</span>
                </div>
                <span className="font-mono text-xs2 uppercase tracking-label text-ink-3 sm:text-right">
                  {MODEL[p.model].label}
                </span>
              </li>
            ))}
            <li className="text-ink-2">
              …and {profile.projects.length - 5} more —{" "}
              <Link href="/products" className="link-u font-medium text-brand-500">the full list</Link>.
            </li>
          </ul>
        </section>

        <section className="pt-9">
          <h2 className="border-b border-line pb-2 font-mono text-label uppercase tracking-label text-ink-3">Experience</h2>
          <div className="mt-5 space-y-6">
            {profile.experiences.map((e) => (
              <div key={e.company} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-display text-h3 font-semibold">{e.position} · {e.company}</h3>
                  <span className="font-mono text-xs2 uppercase tracking-label text-ink-3">{e.from} — {e.to}</span>
                </div>
                <p className="mt-1.5 text-small text-ink-2">{e.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="break-inside-avoid pt-9">
          <h2 className="border-b border-line pb-2 font-mono text-label uppercase tracking-label text-ink-3">Skills</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-3 text-small sm:grid-cols-2">
            {Object.entries(profile.skills).map(([g, items]) => (
              <div key={g} className="grid grid-cols-[7rem_1fr] gap-3">
                <dt className="font-mono text-xs2 uppercase tracking-label text-ink-3">{g}</dt>
                <dd className="text-ink-2">{items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="break-inside-avoid pt-9">
          <h2 className="border-b border-line pb-2 font-mono text-label uppercase tracking-label text-ink-3">Education</h2>
          {profile.education.map((ed) => (
            <div key={ed.institution} className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-display text-h3 font-semibold">{ed.degree} · {ed.institution}</h3>
              <span className="font-mono text-xs2 uppercase tracking-label text-ink-3">{ed.from} — {ed.to}</span>
            </div>
          ))}
        </section>
      </main>

      <p className="no-print pb-12 text-center font-mono text-xs2 text-ink-3">
        Cmd&nbsp;+&nbsp;P produces this sheet with the toolbar and ground stripped.
      </p>
    </div>
  );
}
