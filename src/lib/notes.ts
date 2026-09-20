type Block = { h?: string; p: string[] };

export type Note = {
  slug: string;
  title: string;
  date: string;
  kicker: string;
  topic: string;
  readingTime: string;
  published: boolean;
  lede?: string;
  body?: Block[];
};

/** One published piece. The two below it are real subjects with real evidence
 *  behind them, listed as planned rather than invented — a notes index padded
 *  with imaginary posts is the same failure this site was rebuilt to fix. */
export const NOTES: Note[] = [
  {
    slug: "the-marketing-claim-that-outlived-the-fact",
    title: "The marketing claim that outlived the fact",
    date: "2026-09-20",
    kicker:
      "A studio-wide promise is only as true as the least convenient product. Mine said “no ads in our games” for months after one of the games shipped an ad banner — and nothing in the system could have caught it.",
    topic: "Process",
    readingTime: "6 min",
    published: true,
    lede:
      "For months my apps' website promised something the apps did not do. Nothing was lying on purpose. The claim was simply written once, in a place nothing checked, about products that kept changing.",
    body: [
      { h: "What it said", p: [
        "Two lines, both of which I believed when I wrote them: no ads in our games, and one-time purchases where we can, not subscriptions you forget about.",
        "Both came out of a real method. You read the negative reviews of the five biggest apps in your category, theme them, and count. The loudest complaint becomes the thing you structurally do not do. In this category the loudest complaints were price and ads, so those two lines were not slogans — they were the positioning, and they were earned.",
      ]},
      { h: "What was true", p: [
        "One of the games shipped a banner and an interstitial. Four of the eight apps were subscriptions. A third page said one product was free and would stay free, while that product's own config defined three priced tiers.",
        "None of those were secret. Every one was sitting in a config file in a repository I owned.",
      ]},
      { h: "The actual mistake", p: [
        "It was not the wording. It was the shape of the claim.",
        "A promise made on behalf of every product is only as true as the least convenient product, and it decays silently — because the thing that breaks it is a change to a different repo than the one the promise lives in. Nobody edits a marketing page when they add an ad SDK. Nobody thinks to.",
        "A fact stated per product cannot decay that way. It has one subject, and the subject is the thing that changed.",
      ]},
      { h: "What I changed", p: [
        "There are no studio-wide promises on the site any more. There is a table with one row per app, and the table is built from the app repositories rather than typed into a page.",
        "The generator does one thing that matters more than the rest: it refuses to build if a stated fact disagrees with the source. If an app declares no ads and an ad package appears in its dependencies, the build fails. Adding an ad SDK now breaks a deployment instead of breaking a promise.",
        "That is the only version of this I trust, because it does not rely on me remembering.",
      ]},
      { h: "The part that generalises", p: [
        "Any claim you cannot check automatically will eventually be false. Not because anyone lied, but because products change more often than the pages that describe them, and the two live in different places.",
        "So the useful question about a marketing claim is not is this true? It is what would have to happen for this to become false, and would anything tell me?",
      ]},
    ],
  },
  {
    slug: "a-token-referenced-and-never-defined",
    title: "A token that was referenced and never defined",
    date: "",
    kicker:
      "Three colour variables that did not exist silently disabled a shadow on 26 primary buttons, for months, with no error anywhere. The strongest argument I have for why design tokens must be variables.",
    topic: "Design",
    readingTime: "",
    published: false,
  },
  {
    slug: "why-my-funnel-tool-refuses-to-fetch",
    title: "Why my funnel tool refuses to fetch the numbers",
    date: "",
    kicker:
      "It prints four dashboards to read by hand instead. A tool that fakes completeness is worse than one that admits a gap, and I would rather have a blank than a plausible lie.",
    topic: "Process",
    readingTime: "",
    published: false,
  },
];

export const published = NOTES.filter((n) => n.published);
export const noteBySlug = (s: string) => NOTES.find((n) => n.slug === s && n.published);
