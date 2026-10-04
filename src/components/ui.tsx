import Link from "next/link";
import { Mail } from "lucide-react";
import { profile } from "@/lib/profile";
import { type Product, stageOf } from "@/lib/products";

/** The release state. The colour is derived; only the words are the product's. */
export function StatePill({ p, label }: { p: Product; label?: string }) {
  return <span className={`state state--${stageOf(p)}`}>{label ?? p.stageLabel}</span>;
}

export function Chips({ items }: { items: string[] }) {
  return (
    <p className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="chip">
          {s}
        </span>
      ))}
    </p>
  );
}

/** The band every hiring page ends on. The same two actions everywhere: an
 *  email and the résumé. */
export function HireBand({ title }: { title: string }) {
  return (
    <section className="no-print bg-band text-band-ink">
      <div className="wrap flex flex-wrap items-center justify-between gap-6 py-9">
        <div>
          <h2 className="section-title max-w-[26ch]">{title}</h2>
          <p className="mt-2 text-base text-band-2">Email is fastest. Usually a reply within two working days.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}`} className="btn btn-band">
            <Mail size={16} aria-hidden /> {profile.email}
          </a>
          <Link href="/resume/" className="btn btn-band-quiet">
            Read the résumé
          </Link>
        </div>
      </div>
    </section>
  );
}
