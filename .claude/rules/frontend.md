---
paths:
  - "src/**/*.tsx"
---

# Frontend code

`pnpm lint` and `pnpm typecheck` are the gates. These are the rules they cannot
see.

- **Plan the files before writing a page.** List its components and helpers,
  then write each in its own file. Splitting afterwards is the failure.
- **One component per file, named after the file.** No private sub-component at
  the bottom of a page.
- **A route file is thin.** `src/app/**` reads params, finds the data and
  renders. No business logic in it.
- **Pure functions go in `src/lib/`.** No lowercase helper declared in a `.tsx`
  file.
- **Props are a named `interface`** above the component. No `React.FC`.
- **Tailwind classes for everything a class can express.** `style={{ }}` only
  for a value computed at runtime.
- **Lowercase kebab-case file names, PascalCase component exports.**
