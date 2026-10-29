import Link from "next/link";
import { GitBranch, History, MessageSquareDashed, WandSparkles } from "lucide-react";
import { Lifecycle, Value, VerdictCard } from "@/components/canon";
import { products } from "@/lib/products";
import { flowFor } from "@/lib/flow";
import { canonFor, INSTALL, VERDICTS, CANON_REPO, CANON_VERSION } from "@/lib/canon";

/* canon-cli is the free, open-source CLI and plugin under canon. It is not a
   project of its own: it is shown only here, as a section of canon's page. */

const PROBLEMS = [
  { Icon: MessageSquareDashed, title: "Knowledge lives in chat", body: "Why a price is what it is gets said once, then lost." },
  { Icon: History, title: "Settled things come back", body: "Every session starts fresh. Last month's \"no\" returns as a new idea." },
  { Icon: WandSparkles, title: "The AI fills gaps by guessing", body: "It sounds sure, builds it, and you find out later." },
];

export function CanonCli() {
  /* Derived: how many of the products shown here carry a canon config. */
  const onCanon = products.filter((p) => canonFor(p.slug)).length;
  /* Derived: the products whose "How it ships" is canon flow's own output. */
  const measured = products.filter((p) => flowFor(p.slug));
  return (
    <section id="cli" className="mt-12 scroll-mt-16">
      <div className="text-center">
        <p className="flex flex-wrap justify-center gap-1.5">
          <span className="chip">Open source · MIT</span> <span className="chip">v{CANON_VERSION}</span>{" "}
          <span className="chip">Claude Code plugin + CLI</span>
        </p>
        <h2 className="mt-3 text-h2 font-extrabold">Under the hood: canon-cli</h2>
        <p className="mx-auto mt-2 max-w-[56ch] text-base text-ink-2">
          The free part canon is built on. Your rules, prices and past decisions stay in your repo, and the AI checks them, and every claim you
          make, against facts before it acts. It guesses less, and you redo less.
        </p>
        <pre className="term mx-auto mt-4 max-w-[34rem] text-left text-xs">
          {INSTALL.map((line) => (
            <span key={line} className="block">
              <span className="term-dim">$</span> {line}
            </span>
          ))}
        </pre>
      </div>

      <h3 className="mt-10 text-center text-h3 font-bold">AI forgets your domain</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {PROBLEMS.map(({ Icon, title, body }) => (
          <div key={title} className="glass p-4">
            <Icon size={20} className="text-brand-500" aria-hidden />
            <p className="mt-3 font-bold">{title}</p>
            <p className="mt-1 text-sm text-ink-2">{body}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 text-center text-h3 font-bold">What it is worth</h3>
      <Value
        extra={{
          "Finds the bottleneck": measured.length > 0 && (
            <>
              Measured on {measured.length} of my products. See &ldquo;How it ships&rdquo; on{" "}
              <Link href={`/products/${measured[0].slug}/`} className="text-link">
                {measured[0].name}
              </Link>
              .
            </>
          ),
          "Weighs each decision": (
            <a href="#caught" className="text-link">
              Real verdicts below.
            </a>
          ),
        }}
      />

      <div id="caught" className="scroll-mt-16">
        <h3 className="mt-10 text-center text-h3 font-bold">What it caught</h3>
        <p className="mx-auto mt-2 max-w-[52ch] text-center text-sm text-ink-3">
          Real verdicts. The first three are from canon-cli&apos;s test suite on a sample habit app; the last is from my own products.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {VERDICTS.map((v) => (
            <VerdictCard key={v.ask} v={v} long />
          ))}
        </div>
      </div>

      <div id="lifecycle" className="scroll-mt-16">
        <h3 className="mt-10 text-center text-h3 font-bold">Across the whole lifecycle</h3>
        <Lifecycle />
      </div>

      <div className="glass glow mt-10 p-5 text-center md:p-8">
        <p className="text-h3 font-extrabold">Runs on {onCanon} of my product repos.</p>
        <p className="mx-auto mt-2 max-w-[46ch] text-base text-ink-2">Free and open source. Your knowledge stays in your own repos, as plain Markdown.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a href={CANON_REPO} className="btn btn-primary">
            <GitBranch size={16} aria-hidden /> Get it on GitHub
          </a>
          <a href={`${CANON_REPO}/blob/main/standards/constitution.md`} className="btn btn-quiet">
            The 15 principles
          </a>
        </div>
      </div>
    </section>
  );
}
