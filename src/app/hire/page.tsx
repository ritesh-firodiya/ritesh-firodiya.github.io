import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";

export const metadata: Metadata = {
  title: "Work with me",
  description: "Three engagement shapes — zero to launched, lead the team, or AI and agent tooling. Fixed price per milestone, and a written scope within a week.",
};

const SHAPES = [
  { title: "Zero to launched", body: "An idea to a thing in a store or on a domain. Schema, API, app, payments, release pipeline — I own all of it.", points: ["Web, React Native, or both from one monorepo", "Payments wired: Razorpay, Stripe, RevenueCat, UPI", "Store submission and release, not just a build"], time: "Typically 8 – 16 weeks", feature: false },
  { title: "Lead the team", body: "Tech lead on an existing team. Architecture, review standards, delivery cadence — and writing code, not only talking about it.", points: ["Schema and API design you will not be rewriting in a year", "Mentoring — I did this for two years at Masai", "Handover that survives my last day"], time: "3 – 12 months", feature: true },
  { title: "AI & agent tooling", body: "Anthropic SDK, MCP servers, tool use, prompt caching. Internal tooling that actually gets used, not a demo.", points: ["MCP servers over your own systems", "Agent workflows with evaluations, not vibes", "Cost and latency budgeted up front"], time: "4 – 10 weeks", feature: false },
];

const STEPS = [
  { n: "01", title: "A call, free", body: "Thirty minutes. You describe it, I tell you whether I am the right person — including when I am not." },
  { n: "02", title: "A written shape, within a week", body: "Scope, the stack and why, the milestones, and the price. One document, fixed, no hourly estimate that drifts." },
  { n: "03", title: "Build, visible the whole way", body: "Your repo, your cloud accounts, from day one. Weekly builds you can open. Nothing lives on my machine." },
  { n: "04", title: "Handover that holds", body: "Documented architecture, a running CI pipeline, and a walkthrough with whoever takes it on next." },
];

const ANSWERS = [
  { q: "Fixed price or hourly?", a: "Fixed, per milestone. You should know the number before I start." },
  { q: "Time zone?", a: "IST. I have worked US and EU hours before and will say so up front if your project needs it." },
  { q: "Do you take equity?", a: "Sometimes, partly, for something I would build anyway." },
  { q: "Full-time roles?", a: "Yes — senior / staff IC and tech lead." },
];

export default function HirePage() {
  return (
    <>
      <SiteHeader cta={{ href: "#start", label: "Start a conversation" }} />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-14 pt-section">
            <p className="inline-flex items-center gap-2 rounded-pill border border-live/25 bg-live-wash px-3 py-1 font-mono text-label uppercase tracking-label text-live">
              <span className="h-1.5 w-1.5 rounded-pill bg-live" /> Taking on work from Oct 2026
            </p>
            <h1 className="mt-7 max-w-[17ch] font-display text-d1 font-semibold">I build the first version, and the team that keeps it.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Nine years shipping production software, and thirteen of my own products to show what
              that looks like when nobody else is holding the pieces together.
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <Label>What I take on</Label>
            <h2 className="mt-3 max-w-[20ch] font-display text-d2 font-semibold">Three shapes, and I will tell you if yours is a fourth.</h2>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {SHAPES.map((s) => (
                <div key={s.title} className={`flex flex-col rounded-card border bg-surface p-7 shadow-lift ${s.feature ? "border-accent/30" : "border-line"}`}>
                  <h3 className="font-display text-h2 font-semibold">{s.title}</h3>
                  <p className="mt-3 text-body text-ink-2">{s.body}</p>
                  <ul className="mt-6 space-y-2.5 text-small text-ink-2">
                    {s.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <p className="mt-auto pt-7 font-mono text-xs2 uppercase tracking-label text-ink-3">{s.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-20">
            <div>
              <Label>How it goes</Label>
              <h2 className="mt-3 max-w-[20ch] font-display text-d2 font-semibold">No discovery phase that bills for a month.</h2>
              <ol className="mt-10 border-t border-line">
                {STEPS.map((s) => (
                  <li key={s.n} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[3rem_1fr] sm:gap-6">
                    <span className="font-display text-h2 font-semibold text-accent">{s.n}</span>
                    <div>
                      <h3 className="font-display text-h3 font-semibold">{s.title}</h3>
                      <p className="mt-1.5 max-w-prose text-small text-ink-2">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="lg:pt-16">
              <div className="rounded-card border border-line bg-paper-2 p-7">
                <Label>Straight answers</Label>
                <dl className="mt-5 space-y-5 text-small">
                  {ANSWERS.map((a) => (
                    <div key={a.q}>
                      <dt className="font-medium text-ink">{a.q}</dt>
                      <dd className="mt-1 text-ink-2">
                        {a.a}
                        {a.q === "Full-time roles?" && <> <Link href="/resume" className="link-u text-accent">Résumé here</Link>.</>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </section>

        <section id="start" className="scroll-mt-20 bg-ink text-ink-inv">
          <div className="mx-auto max-w-page px-gutter py-section">
            <p className="font-mono text-label uppercase tracking-label text-ink-inv/55">Start</p>
            <h2 className="mt-4 max-w-[16ch] font-display text-d2 font-semibold">Tell me what you are building.</h2>
            <p className="mt-5 max-w-measure text-lead text-ink-inv/70">
              Four lines is plenty: what it is, who it is for, when you need it, and what is already
              built. I answer every email within two working days.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="mailto:firodiya.ritesh@gmail.com?subject=Project%20brief&body=What%20it%20is%3A%0AWho%20it%20is%20for%3A%0AWhen%20you%20need%20it%3A%0AWhat%20is%20already%20built%3A%0A"
                className="inline-flex items-center gap-2 rounded-pill bg-paper px-5 py-3 text-body font-medium text-ink transition hover:bg-accent hover:text-ink-inv"
              >
                Email me the brief
              </a>
            </div>
            <p className="mt-6 max-w-measure font-mono text-xs2 text-ink-inv/45">
              The button prefills the subject and the four questions. No form, no CRM, no drip
              sequence — this site is static and stores nothing.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
