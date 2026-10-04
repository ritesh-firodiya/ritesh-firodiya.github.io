import { Embed } from "@/components/embed";
import { type Product, type Shot, shotsOf, hasScreen } from "@/lib/products";

/**
 * Every picture on this site is the product's own.
 *
 * Store art comes from the product's listing folder and already carries a
 * device and a headline, so it is shown as it is. A product with no store art
 * can name one of its own design screens instead, embedded live. A product with
 * neither shows a hatched slot that says so — never a grey box.
 */
export function ShotImage({ shot, name, crop = false, className = "" }: { shot: Shot; name: string; crop?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={shot.src}
      alt={`${name} — ${shot.label}`}
      width={shot.width}
      height={shot.height}
      loading="lazy"
      className={`shot${crop ? " shot--crop" : ""} ${className}`}
    />
  );
}

export const embedPathOf = (p: Product): string | null => {
  if (!p.embed) return null;
  const path = `/designs/${p.slug}/${p.embed}`;
  return hasScreen(p.slug, path) ? path : null;
};

/** The picture slot at the top of a card. A product that names a design
 *  screen is a web product first, so that leads; otherwise its best store shot. */
export function CardPicture({ p }: { p: Product }) {
  const shot = shotsOf(p, 1)[0];
  const embed = embedPathOf(p);
  if (embed) {
    return (
      <div className="h-56 overflow-hidden bg-muted">
        <Embed src={embed} title={`${p.name} design screen`} fill />
      </div>
    );
  }
  if (shot) {
    return (
      <div className="h-56 overflow-hidden bg-muted">
        <ShotImage shot={shot} name={p.name} crop />
      </div>
    );
  }
  return (
    <div className="slot grid h-56 place-items-center">
      <p className="eyebrow">No screenshot yet</p>
    </div>
  );
}
