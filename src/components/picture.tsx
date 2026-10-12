import { Embed } from "@/components/embed";
import { type Product, type Shot, shotsOf, hasScreen } from "@/lib/products";

/**
 * Every picture on this site is the product's own: its store art, read from
 * its listing folder, or one of its design screens, embedded live.
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

const screenPath = (p: Product, file?: string): string | null => {
  if (!file) return null;
  const path = `/designs/${p.slug}/${file}`;
  return hasScreen(p.slug, path) ? path : null;
};
export const embedPathOf = (p: Product): string | null => screenPath(p, p.embed);
export const isPhoneEmbed = (p: Product): boolean => Boolean(p.embed?.startsWith("mobile/"));

/** Has anything to show: store art, or a design screen of its own. */
export const hasPicture = (p: Product): boolean => shotsOf(p, 1).length > 0 || embedPathOf(p) !== null;

/** The phone that stands beside a web screen, for a product that is both. */
function Phone({ p, className }: { p: Product; className: string }) {
  const screen = screenPath(p, p.embedMobile);
  const shot = shotsOf(p, 1)[0];
  if (!screen && !shot) return null;
  return (
    <div className={`overflow-hidden rounded-lg border border-line-strong bg-surface shadow-lg ${className}`}>
      {screen ? <Embed src={screen} title={`${p.name} mobile screen`} phone /> : <ShotImage shot={shot} name={p.name} className="rounded-none" />}
    </div>
  );
}

/** The picture at the top of a card. Every card gets the slot: a product with
 *  nothing to show gets a hatched one that says so. */
export function CardPicture({ p }: { p: Product }) {
  const h = "h-32 md:h-36";
  const shot = shotsOf(p, 1)[0];
  const embed = embedPathOf(p);
  if (embed && isPhoneEmbed(p)) {
    return (
      <div className={`flex ${h} justify-center overflow-hidden bg-muted pt-3`}>
        <div className="w-28 shrink-0 overflow-hidden rounded-t-xl border border-b-0 border-line-strong md:w-32">
          <Embed src={embed} title={`${p.name} design screen`} phone />
        </div>
      </div>
    );
  }
  if (embed) {
    return (
      <div className={`relative ${h} overflow-hidden bg-muted`}>
        <Embed src={embed} title={`${p.name} design screen`} fill />
        <Phone p={p} className="absolute -bottom-10 right-2 w-16 md:w-20" />
      </div>
    );
  }
  if (shot) {
    return (
      <div className={`${h} overflow-hidden bg-muted`}>
        <ShotImage shot={shot} name={p.name} crop />
      </div>
    );
  }
  return (
    <div className={`slot grid ${h} place-items-center border-x-0 border-t-0`}>
      <span className="font-mono text-2xs text-ink-3">No picture yet</span>
    </div>
  );
}

/** The picture on a product page: the web screen with the phone beside it,
 *  the phone screen alone, or the store shots. */
export function ProductPicture({ p }: { p: Product }) {
  const embed = embedPathOf(p);
  const shots = shotsOf(p, 3);
  if (embed && !isPhoneEmbed(p)) {
    return (
      <div className="relative pb-6 pr-6">
        <div className="overflow-hidden rounded-lg border border-line-strong shadow-lg">
          <Embed src={embed} title={`${p.name} design screen`} />
        </div>
        <Phone p={p} className="absolute bottom-0 right-0 w-[22%]" />
      </div>
    );
  }
  if (embed) {
    return (
      <div className="mx-auto w-48 overflow-hidden rounded-xl border border-line-strong shadow-lg">
        <Embed src={embed} title={`${p.name} design screen`} phone />
      </div>
    );
  }
  if (shots.length === 0) return null;
  return (
    <div className="mx-auto grid max-w-sm grid-cols-3 gap-2.5">
      {shots.map((s) => (
        <ShotImage key={s.src} shot={s} name={p.name} className="shot--lift" />
      ))}
    </div>
  );
}
