/** The eight stages, as actually practised. Every gate is answered with a
 *  number rather than a feeling — that is the whole discipline. */
export const STAGES = [
  { n: 1, name: "Idea", gate: "One sentence: who it is for, what it does, instead of what." },
  { n: 2, name: "Research", gate: "A keyword with real search volume exists. If nobody searches for it, nobody finds it." },
  { n: 3, name: "Validate", gate: "Incumbents are weak — measured by reading their negative reviews, not by looking at their screenshots." },
  { n: 4, name: "Build", gate: "Designs approved, then schema approved. Two hard gates.", link: "/process/build", linkText: "The five stages" },
  { n: 5, name: "Launch", gate: "Listing complete, screenshots up, review prompt actually shipping." },
  { n: 6, name: "Market", gate: "One channel at a time, 30 days before judging it. Change one thing." },
  { n: 7, name: "Money", gate: "Install → paid conversion is a known number, not a guess." },
  { n: 8, name: "Improve", gate: "Ranked from review themes and funnel drop-off — never from whichever idea is loudest that week." },
] as const;

export const BUILD_STAGES = [
  { n: "01", title: "Designs", gate: true,
    body: "Pure HTML and Tailwind, no React and no build step. Every screen and every variant gets a file — empty, loading, error, locked, offline. A component that appears in no HTML file does not ship.",
    note: "The reason is cost. Changing a wireframe costs minutes; changing a built screen costs an afternoon and a regression. Front-loading the argument is the cheapest thing in the whole process." },
  { n: "02", title: "Scaffold", gate: false,
    body: "Generated fresh from the framework's own tool on the latest SDK — never hand-assembled, never a fork of an old project. Structure only: no features yet.",
    note: "Forking last year's scaffold is how a codebase inherits three years of someone else's decisions on day one." },
  { n: "03", title: "Plan the features", gate: false,
    body: "All of them, written down, before any are built. Then the designs get their manual review against that list." },
  { n: "04", title: "Schema", gate: true,
    body: "The data model, reviewed and approved on its own. It is the one decision that is genuinely expensive to reverse once real user data exists." },
  { n: "05", title: "Build", gate: false,
    body: "And only now. When a screen and its wireframe disagree, the wireframe is the spec and the code is corrected." },
] as const;
