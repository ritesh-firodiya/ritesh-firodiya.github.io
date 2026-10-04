/**
 * Credential shapes worth stopping a public deploy for.
 *
 * Everything the sync scripts copy comes out of a PRIVATE repo and lands on a
 * public host: design screens, and every page of every wiki. Nothing else ever
 * looks at those bytes, so the scan runs at that boundary and stops the build.
 *
 * Deliberately narrow: a pattern that fires on a wireframe's placeholder trains
 * everyone to add an exception, and then it catches nothing.
 */
export const SECRETS = [
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["GitHub token", /\bgh[pousr]_[0-9A-Za-z]{36,}\b/],
  ["Slack token", /\bxox[abposr]-[0-9A-Za-z-]{10,}\b/],
  ["Stripe secret key", /\bsk_live_[0-9A-Za-z]{16,}\b/],
  ["RevenueCat secret key", /\bsk_[0-9A-Za-z]{24,}\b/],
  ["private key block", /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/],
];

/** Throws, naming the file, on the first match. */
export function assertNoSecrets(text, where) {
  for (const [name, re] of SECRETS) {
    if (re.test(text)) throw new Error(`${where}: looks like a ${name} — refusing to publish it`);
  }
}
