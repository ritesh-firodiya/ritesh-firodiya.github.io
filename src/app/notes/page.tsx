import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { NOTES } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Notes",
  description: "Short pieces about building and shipping software alone — written when something cost me a day and the lesson seemed transferable.",
};

export default function NotesPage() {
  return (
    <>
      <SiteHeader active="/notes" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Label>Notes</Label>
            <h1 className="mt-4 max-w-[18ch] font-display text-d1 font-semibold">Things learned the expensive way.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Short pieces about building and shipping software alone. Written when something cost me
              a day and the lesson seemed transferable.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter pb-section">
          <ol className="border-t border-line">
            {NOTES.map((n) => {
              const inner = (
                <div className="grid gap-2 md:grid-cols-[9rem_1fr] md:gap-8">
                  <p className="font-mono text-xs2 uppercase tracking-label text-ink-3">
                    {n.published ? n.date : "Planned"}
                  </p>
                  <div>
                    <h2 className={`font-display text-h2 font-semibold ${n.published ? "group-hover:text-accent" : "text-ink-2 group-hover:text-accent"}`}>
                      {n.title}
                    </h2>
                    <p className="mt-2 max-w-prose text-body text-ink-2">{n.kicker}</p>
                    <p className="mt-3 font-mono text-xs2 text-ink-3">
                      {n.topic}{n.readingTime ? ` · ${n.readingTime}` : ""}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={n.slug} className="border-b border-line py-7 last:border-0">
                  {n.published ? (
                    <Link href={`/notes/${n.slug}/`} className="group block">{inner}</Link>
                  ) : (
                    <div className="group cursor-default">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
