import { Head } from "$fresh/runtime.ts";

import profile from "@/profile.json" with { type: "json" };

const STYLES = `
  /* On-screen typography (the white "paper") */
  .paper {
    color: #0f172a;
    font-family: "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
    line-height: 1.4;
  }
  .paper h1 { font-size: 1.7rem; font-weight: 700; letter-spacing: -0.01em; color: #0f172a; line-height: 1.15; margin: 0; }
  .paper h2 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600; margin: 0.85rem 0 0.35rem; padding-bottom: 0.2rem; border-bottom: 1px solid #e2e8f0; }
  .paper .role { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
  .paper .meta { font-size: 0.7rem; font-family: ui-monospace, SFMono-Regular, monospace; color: #64748b; letter-spacing: 0.02em; }
  .paper p, .paper li { font-size: 0.8rem; color: #334155; margin: 0; }
  .paper .desc { margin-top: 0.1rem; }
  .paper a { color: #047857; text-decoration: none; }
  .paper a:hover { text-decoration: underline; }
  .paper .contact-row { font-size: 0.78rem; color: #475569; margin-top: 0.3rem; }
  .paper .contact-row > span:not(:last-child)::after { content: " · "; color: #cbd5e1; }
  .paper .entry + .entry { margin-top: 0.5rem; }
  .paper .entry-head { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
  .paper .skill-row { display: grid; grid-template-columns: 6rem 1fr; gap: 0.5rem; padding: 0.05rem 0; align-items: baseline; }
  .paper .skill-row dt { font-size: 0.78rem; font-weight: 600; color: #0f172a; }
  .paper .skill-row dd { font-size: 0.78rem; color: #334155; margin: 0; }
  .paper .skill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.5rem; }

  @media print {
    .no-print { display: none !important; }
    body { background: white !important; margin: 0 !important; }
    .paper-wrap { background: white !important; padding: 0 !important; }
    .paper { box-shadow: none !important; border: 0 !important; padding: 0 !important; max-width: none !important; }
    .paper p, .paper li, .paper .skill-row dt, .paper .skill-row dd, .paper .contact-row { font-size: 0.74rem; }
    .paper h1 { font-size: 1.4rem; }
    .paper h2 { font-size: 0.65rem; margin-top: 0.6rem; margin-bottom: 0.25rem; }
    .paper .role { font-size: 0.8rem; }
    .paper .meta { font-size: 0.65rem; }
    .paper .entry + .entry { margin-top: 0.35rem; }
    .paper h2, .paper .role { break-after: avoid; }
    .paper .entry, .paper p, .paper li { break-inside: avoid; }
    @page { size: Letter; margin: 0.4in; }
  }
`;

export default function ResumePage() {
  const exp = profile.experiences;
  const projects = profile.projects;
  const skills = profile.skills as Record<string, string[]>;
  const education = profile.education;
  const phoneFmt = profile.phone.replace(/^\+91/, "+91 ");
  const websiteLabel = profile.website.replace(/^https?:\/\//, "").replace(
    /\/$/,
    "",
  );

  return (
    <>
      <Head>
        <title>Résumé · {profile.name}</title>
        <meta
          name="description"
          content={`Resume of ${profile.name} — ${profile.headline} ${profile.tagline}`}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      </Head>
      <main class="min-h-screen bg-navy text-slate-light">
        {/* Toolbar — hidden when printing */}
        <div class="no-print sticky top-0 z-10 bg-navy/85 backdrop-blur border-b border-navy-lightest">
          <div class="max-w-3xl mx-auto px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <a
              href="/"
              class="text-sm text-slate-light hover:text-accent inline-flex items-center gap-1.5 transition-colors"
            >
              <span aria-hidden="true">←</span> Back
            </a>
            <div class="flex items-center gap-2">
              <a
                href="javascript:window.print()"
                class="text-sm font-medium px-3 py-1.5 rounded border border-navy-lightest text-slate-light hover:border-accent hover:text-accent transition-colors"
              >
                Print / Save as PDF
              </a>
              <a
                href="/resume.pdf"
                download
                class="text-sm font-medium px-3 py-1.5 rounded bg-accent text-navy hover:bg-accent/90 transition-colors"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>

        {/* Letter-paper container */}
        <div class="paper-wrap py-8 lg:py-10 px-3">
          <article class="paper max-w-3xl mx-auto bg-white rounded-lg shadow-2xl px-7 py-7 lg:px-10 lg:py-9">
            {/* Header */}
            <header>
              <div class="flex items-baseline justify-between gap-4 flex-wrap">
                <h1>{profile.name}</h1>
                <span class="meta">{profile.location}</span>
              </div>
              <p
                class="desc text-slate-700"
                style="font-size:0.85rem; margin-top:0.15rem;"
              >
                {profile.headline} {profile.tagline}
              </p>
              <div class="contact-row">
                <span>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </span>
                <span>{phoneFmt}</span>
                <span>
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/{profile.github}
                  </a>
                </span>
                <span>
                  <a
                    href={`https://www.linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    linkedin.com/in/{profile.linkedin}
                  </a>
                </span>
                <span>
                  <a href={profile.website} target="_blank" rel="noreferrer">
                    {websiteLabel}
                  </a>
                </span>
              </div>
            </header>

            {/* Summary */}
            <section>
              <h2>Summary</h2>
              <p>{profile.summary}</p>
            </section>

            {/* Skills — moved up so recruiters can scan immediately */}
            <section>
              <h2>Skills</h2>
              <dl class="skill-grid">
                {Object.entries(skills).map(([cat, items]) => (
                  <div key={cat} class="skill-row">
                    <dt>{cat}</dt>
                    <dd>{items.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Experience */}
            <section>
              <h2>Experience</h2>
              {exp.map((e, i) => (
                <div key={i} class="entry">
                  <div class="entry-head">
                    <span class="role">
                      {e.position} · {e.companyLink
                        ? (
                          <a
                            href={e.companyLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {e.company}
                          </a>
                        )
                        : e.company}
                    </span>
                    <span class="meta">{e.from} – {e.to}</span>
                  </div>
                  {e.description && <p class="desc">{e.description}</p>}
                </div>
              ))}
            </section>

            {/* Projects */}
            <section>
              <h2>Projects</h2>
              {projects.map((p, i) => (
                <div key={i} class="entry">
                  <p>
                    <strong>{p.name}</strong> — {p.tagline}.{" "}
                    <span style="color:#475569">
                      {p.description}
                    </span>{" "}
                    <span class="meta">({p.stack.join(", ")})</span>
                  </p>
                </div>
              ))}
            </section>

            {/* Education */}
            <section>
              <h2>Education</h2>
              {education.map((ed, i) => (
                <div key={i} class="entry">
                  <div class="entry-head">
                    <span class="role">{ed.degree} · {ed.institution}</span>
                    <span class="meta">{ed.from} – {ed.to}</span>
                  </div>
                </div>
              ))}
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
