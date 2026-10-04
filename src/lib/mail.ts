import { profile } from "@/lib/profile";

/**
 * Two ways to start an email, because one of them often does nothing.
 *
 * A `mailto:` link only works where a mail program is set up to handle it. On
 * a laptop that reads mail in a browser tab — most of them — pressing one does
 * nothing at all, and the button looks broken. Gmail's compose URL opens in
 * the browser for anyone signed in to Google, with the same subject and body.
 * Every "write to me" on this site offers both, and the address in plain text.
 */
export type Draft = { subject?: string; body?: string };

const q = (o: Record<string, string | undefined>) =>
  Object.entries(o)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");

export const mailto = ({ subject, body }: Draft = {}): string => {
  const query = q({ subject, body });
  return `mailto:${profile.email}${query ? `?${query}` : ""}`;
};

export const gmailCompose = ({ subject, body }: Draft = {}): string =>
  `https://mail.google.com/mail/?${q({ view: "cm", fs: "1", to: profile.email, su: subject, body })}`;
