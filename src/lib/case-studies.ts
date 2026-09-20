/** Long-form writeups. One for now; the template is the point. `/work` links
 *  to a study only where one exists, so this never advertises an empty page. */
export type CaseStudy = {
  slug: string;
  product: string;
  title: string;
  status: string;
  period: string;
  facts: { k: string; v: string }[];
  sections: { h: string; p?: string[]; list?: { t: string; b: string }[] }[];
  stack: string[];
  link?: { label: string; url: string };
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "chitragupt",
    product: "Chitragupt",
    title: "Household tax review for salaried Indian filers",
    status: "Live",
    period: "2025 — now",
    facts: [
      { k: "Role", v: "Everything — product, design, build, deploy" },
      { k: "Surface", v: "Web app, responsive, no native build" },
      { k: "Backend", v: "~189 Firebase Functions behind Cloud Run" },
    ],
    sections: [
      { h: "The problem", p: [
        "Every Indian tax calculator answers one question — which regime is cheaper for you, one person, this year. That is the wrong unit. Tax in an Indian household moves across people: a parent's medical premium, a spouse's home-loan interest, a child's tuition. Filed one at a time, a family routinely leaves a deduction on the table that was always claimable.",
      ]},
      { h: "What it does", list: [
        { t: "Parses a Form 16 upload", b: "into a structured return, rather than asking you to retype it." },
        { t: "Shows both regimes side by side", b: "with the delta stated in rupees, not drawn as a chart." },
        { t: "Adds a household lens", b: "across spouse, parents and kids, surfacing deductions that only exist between people." },
        { t: "Runs a 15-question Quick Check", b: "for anyone without a Form 16 to hand." },
        { t: "Prints what you can act on", b: "the refund claimable and the deductions still unused." },
      ]},
      { h: "Decisions worth defending", list: [
        { t: "Zod as the only contract", b: "Tax rules change every budget. A schema shared by the form, the function and the stored document means a rule change is one edit with the type system finding the rest. No hand-written DTOs on either side." },
        { t: "189 small functions, not one service", b: "Each deduction is its own function with its own tests. Wrong numbers are the only failure mode that matters here, and this shape makes a wrong number traceable to one file." },
        { t: "The verdict is free", b: "Which regime wins, and by how much, costs nothing. A tax tool that computes a number and then asks for money before showing it has already lost the user. The paid tiers are the full workings and the household lens." },
      ]},
      { h: "Where it stands", p: [
        "Live and in use through the filing season. The mobile app is paused for V1. It is also the only product of mine carrying analytics — PostHog and Sentry, behind a consent gate — which is stated on its product page rather than buried.",
      ]},
    ],
    stack: ["Next.js", "Cloud Run", "Firebase Functions", "Firestore", "Zod", "Turborepo", "TypeScript"],
    link: { label: "chitragupt.ai", url: "https://chitragupt.ai" },
  },
];

export const studyBySlug = (s: string) => CASE_STUDIES.find((c) => c.slug === s);
