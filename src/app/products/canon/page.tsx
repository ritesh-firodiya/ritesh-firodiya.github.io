import type { Metadata } from "next";
import { ArrowDown, GitBranch, History, MessageSquareDashed, WandSparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Lifecycle, Steps, VerdictCard } from "@/components/canon";
import { products } from "@/lib/products";
import { canonFor, INSTALL, VERDICTS, CANON_REPO, CANON_VERSION } from "@/lib/canon";

export const metadata: Metadata = {
  title: "canon",
  description:
    "canon keeps your domain knowledge, rules and past decisions in your repo and makes the AI check them before it acts. Open source, a Claude Code plugin and a CLI.",
  alternates: { canonical: "/products/canon/" },
};

/* canon is a tool, not one of the products: it is not in products.json and has
   no release state. It sits at /products/canon/ beside them because it is
   shown as a project (LAUNCH, 2026-10-23). */

const PROBLEMS = [
  { Icon: MessageSquareDashed, title: "Knowledge lives in chat", body: "Why a price is what it is gets said once, then lost." },
  { Icon: History, title: "Settled things come back", body: "Every session starts fresh. Last month's \"no\" returns as a new idea." },
  { Icon: WandSparkles, title: "The AI fills gaps by guessing", body: "It sounds sure, builds it, and you find out later." },
];

export default function CanonPage() {
  /* Derived: how many of the products shown here carry a canon config. */
  const onCanon = products.filter((p) => canonFor(p.slug)).length;
  return (
    <>
      <SiteHeader on="canon" />
      <main id="main" className="pb-12">
        <section className="glow">
          <div className="grid-bg absolute inset-0 -z-10" aria-hidden />
          <div className="wrap pb-10 pt-8 text-center md:pb-12 md:pt-14">
            <p className="flex flex-wrap justify-center gap-1.5">
              <span className="chip">Open source · MIT</span> <span className="chip">v{CANON_VERSION}</span>{" "}
              <span className="chip">Claude Code plugin + CLI</span>
            </p>
            <h1 className="display grad-text mx-auto mt-4 max-w-[15ch]">Your domain knowledge, kept local. Enforced.</h1>
            <p className="mx-auto mt-3 max-w-[56ch] text-lead text-ink-2">
              canon is a productivity tool for the whole product lifecycle. Your rules, prices and past decisions stay in your repo, and the AI
              checks them, and every claim you make, against facts before it acts. It guesses less, and you ship faster.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <a href={CANON_REPO} className="btn btn-primary">
                <GitBranch size={16} aria-hidden /> Get it on GitHub
              </a>
              <a href="#caught" className="btn btn-quiet">
                What it caught <ArrowDown size={16} aria-hidden />
              </a>
            </div>
            <pre className="term mx-auto mt-6 max-w-[34rem] text-left text-xs">
              {INSTALL.map((line) => (
                <span key={line} className="block">
                  <span className="term-dim">$</span> {line}
                </span>
              ))}
            </pre>
          </div>
        </section>

        <div className="wrap">
          <section id="problem">
            <h2 className="text-center text-h2 font-extrabold">AI forgets your domain</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {PROBLEMS.map(({ Icon, title, body }) => (
                <div key={title} className="glass p-4">
                  <Icon size={20} className="text-brand-500" aria-hidden />
                  <p className="mt-3 font-bold">{title}</p>
                  <p className="mt-1 text-sm text-ink-2">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="how" className="mt-12">
            <h2 className="text-center text-h2 font-extrabold">How canon fixes it</h2>
            <Steps long />
          </section>

          <section id="caught" className="mt-12 scroll-mt-16">
            <h2 className="text-center text-h2 font-extrabold">What it caught</h2>
            <p className="mx-auto mt-2 max-w-[52ch] text-center text-sm text-ink-3">
              Real verdicts. The first three are from canon&apos;s test suite on a sample habit app; the last is from my own products.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {VERDICTS.map((v) => (
                <VerdictCard key={v.ask} v={v} long />
              ))}
            </div>
          </section>

          <section id="lifecycle" className="mt-12 scroll-mt-16">
            <h2 className="text-center text-h2 font-extrabold">Across the whole lifecycle</h2>
            <Lifecycle />
          </section>

          <section className="glass glow mt-12 p-5 text-center md:p-8">
            <h2 className="text-h2 font-extrabold">Runs on {onCanon} of my product repos.</h2>
            <p className="mx-auto mt-2 max-w-[46ch] text-base text-ink-2">
              Free and open source. Your knowledge stays in your own repos, as plain Markdown.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <a href={CANON_REPO} className="btn btn-primary">
                <GitBranch size={16} aria-hidden /> Get it on GitHub
              </a>
              <a href={`${CANON_REPO}/blob/main/standards/constitution.md`} className="btn btn-quiet">
                The 15 principles
              </a>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
