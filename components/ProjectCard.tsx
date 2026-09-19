import IconLock from "https://deno.land/x/tabler_icons_tsx@0.0.2/tsx/lock.tsx";
import IconExternalLink from "https://deno.land/x/tabler_icons_tsx@0.0.2/tsx/external-link.tsx";
import IconMail from "https://deno.land/x/tabler_icons_tsx@0.0.2/tsx/mail.tsx";

export type IProjectEntry = {
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  status?: string;
  link?: string;
  links?: { label: string; url: string }[];
  private?: boolean;
};

type ProjectCardProps = IProjectEntry & {
  contactEmail: string;
};

const statusBadge = (status?: string) => {
  if (!status) return null;
  const s = status.toLowerCase();
  let cls = "bg-slate-dark/30 text-slate-light";
  if (s.includes("closed testing") || s.includes("validation")) {
    cls = "bg-amber-400/10 text-amber-300";
  } else if (s.includes("live") || s.includes("production")) {
    cls = "bg-accent-dim text-accent";
  }
  return (
    <span
      class={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${cls} whitespace-nowrap`}
    >
      {status}
    </span>
  );
};

const buildContributeMailto = (email: string, project: string) => {
  const subject = `Interested in ${project}`;
  const body =
    `Hi Ritesh,\n\nI came across "${project}" on your portfolio and I'd like ` +
    `to learn more about it — happy to help out, contribute, or just chat ` +
    `about how it works.\n\nA bit about me:\n- \n\nThanks,\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${
    encodeURIComponent(body)
  }`;
};

const ProjectCard = (
  {
    name,
    tagline,
    description,
    stack,
    status,
    link,
    links,
    private: isPrivate,
    contactEmail,
  }: ProjectCardProps,
) => {
  const titleEl = link
    ? (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
      >
        {name}
        <IconExternalLink class="w-4 h-4 opacity-70" />
      </a>
    )
    : <span>{name}</span>;

  return (
    <article class="group relative py-5 px-2 -mx-2 rounded-md transition-colors hover:bg-navy-light/30">
      <div class="flex items-baseline gap-3 flex-wrap">
        <h3 class="text-base font-semibold text-slate-lightest leading-snug flex-1 min-w-0">
          {titleEl}
        </h3>
        <div class="flex items-center gap-1.5 flex-wrap">
          {statusBadge(status)}
          {isPrivate && (
            <span
              title="Private repository"
              class="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-dark/30 text-slate"
            >
              <IconLock class="w-3 h-3" /> private
            </span>
          )}
        </div>
      </div>
      <p class="mt-1 text-sm font-medium text-slate-light">{tagline}</p>
      <p class="mt-2 text-sm text-slate leading-relaxed">{description}</p>
      <ul class="mt-3 flex flex-wrap gap-1.5">
        {stack.map((s, i) => (
          <li
            key={i}
            class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent-dim text-accent"
          >
            {s}
          </li>
        ))}
      </ul>
      {links?.length
        ? (
          <ul class="mt-3 flex flex-wrap gap-2">
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded border border-slate-dark/40 text-slate-light hover:text-accent hover:border-accent transition-colors"
                >
                  {l.label}
                  <IconExternalLink class="w-3 h-3 opacity-70" />
                </a>
              </li>
            ))}
          </ul>
        )
        : null}
      <a
        href={buildContributeMailto(contactEmail, name)}
        class="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-slate-light hover:text-accent transition-colors"
        title={`Email me about ${name}`}
      >
        <IconMail class="w-3.5 h-3.5" />
        Contribute / learn more
        <span aria-hidden="true">→</span>
      </a>
    </article>
  );
};

export default ProjectCard;
