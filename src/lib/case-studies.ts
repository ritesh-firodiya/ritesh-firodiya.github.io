/** Long-form writeups. One for now; the template is the point. `/work` links
 *  to a study only where one exists, so this never advertises an empty page. */
export type CaseStudy = {
  slug: string;
  /** The page's opening line, where the product's tagline is not enough. */
  lead?: string;
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
    slug: "askcal",
    product: "AskCal",
    title: "A calorie counter that admits what it cannot see",
    lead: "An AI calorie counter that admits what it cannot see. Photograph a meal, get an honest estimate, and answer at most two questions the camera could not.",
    status: "In review",
    period: "2026",
    facts: [
      { k: "Role", v: "Everything — product, design, app, backend, release" },
      { k: "Platforms", v: "iOS and Android, one Expo codebase" },
      { k: "Backend", v: "A Firebase Cloud Function holding the model and the food-data keys" },
      { k: "Measured", v: "A 120-meal accuracy harness gates every estimator change" },
    ],
    sections: [
      { h: "The idea", p: [
        "Every camera-first calorie app turns a photo into one confident number. A photo cannot show the oil a dish was cooked in, cannot separate a sandwich's layers, and gives a different answer from a different angle. Those failures cluster on mixed, sauced, oil-cooked, shared-serving food — which is most of what the world actually eats, and almost everything cooked at home.",
        "Asking is friction, and frictionlessness is what the incumbents sell. That is precisely why they will not copy it.",
      ]},
      { h: "What it does", list: [
        { t: "Estimates from a photo", b: "and marks every value Seen, Label, Guessed or Unknown." },
        { t: "Asks one or two questions", b: "— how many pieces, which oil, your share or the whole dish." },
        { t: "Resolves the answer against USDA FoodData Central", b: "rather than the model's recall." },
        { t: "Shows a range", b: "where a single number would be false." },
        { t: "Keeps totals honest", b: "— a total always equals the sum of its rows." },
      ]},
      { h: "Decisions worth defending", list: [
        { t: "The estimator is a config value, not an import", b: "One file per vision provider behind a single interface. Quota, caching and the app never know which one ran, so swapping the model is one line." },
        { t: "Accuracy is the product, so it is measured", b: "A harness answers whether asking beats guessing. It imports the same prompts the server sends, so it measures the estimator that ships, and a change is not done until it has run." },
        { t: "Grams are the quantity of record", b: "A unit a person would say out loud — two eggs, a glass of juice — is only how the amount is spoken. Macros scale from grams, and a measure that disagrees is dropped, not repaired." },
        { t: "“We could not check” is not “you have not paid”", b: "The entitlement check returns three values. Collapsing unknown into false once metered a paying subscriber against the free allowance; unknown now touches no counter." },
      ]},
    ],
    stack: ["Expo SDK 57", "React Native", "expo-router", "UniWind", "Zustand", "MMKV", "RevenueCat", "Firebase Functions", "Zod", "Turborepo"],
  },
  {
    slug: "chitragupt",
    product: "Chitragupt",
    title: "Household tax review for salaried Indian filers",
    status: "Pre-launch",
    period: "2025 — now",
    facts: [
      { k: "Role", v: "Everything — product, design, build, deploy" },
      { k: "Surface", v: "Web app, and an Android app" },
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
        "The web app is deployed and reachable; version one has not launched. An Android app is on Google Play's internal testing track. It is also the only product of mine carrying analytics — PostHog and Sentry, behind a consent gate — which is stated on this page rather than buried.",
      ]},
    ],
    stack: ["Next.js", "Cloud Run", "Firebase Functions", "Firestore", "Zod", "Turborepo", "TypeScript"],
    link: { label: "chitragupt.ai", url: "https://chitragupt.ai" },
  },
];

export const studyBySlug = (s: string) => CASE_STUDIES.find((c) => c.slug === s);
