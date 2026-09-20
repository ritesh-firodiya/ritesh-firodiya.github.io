/* Inline SVG rather than an icon package: five glyphs do not justify a
   dependency, and these ship as markup with no runtime. 16px grid, currentColor,
   so a link row inherits colour and size from its parent. */
type P = { className?: string };
const base = "h-4 w-4 shrink-0";

export const IconGit = ({ className = "" }: P) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={`${base} ${className}`}>
    <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.49-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.89.87 2.35.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

export const IconDesign = ({ className = "" }: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={`${base} ${className}`}>
    <rect x="2" y="1.5" width="12" height="13" rx="2" />
    <path d="M2 5.5h12M6 5.5v9" />
  </svg>
);

export const IconLive = ({ className = "" }: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={`${base} ${className}`}>
    <circle cx="8" cy="8" r="6.5" />
    <path d="M1.5 8h13M8 1.5c1.8 2 2.7 4.1 2.7 6.5S9.8 12.5 8 14.5c-1.8-2-2.7-4.1-2.7-6.5S6.2 3.5 8 1.5Z" />
  </svg>
);

export const IconAndroid = ({ className = "" }: P) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={`${base} ${className}`}>
    <path d="M2.6 2.2 13.9 8.6a.5.5 0 0 1 0 .87L2.6 15.85A.7.7 0 0 1 1.6 15.2V2.85a.7.7 0 0 1 1-.65Zm7.2 6.86-1.9-1.08-5 4.78 6.9-3.7Zm0-1.15L2.9 4.22l5 4.78 1.9-1.09Z" />
  </svg>
);

export const IconApple = ({ className = "" }: P) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={`${base} ${className}`}>
    <path d="M11.18 8.46c-.02-1.72 1.4-2.55 1.47-2.59-.8-1.17-2.05-1.33-2.5-1.35-1.06-.11-2.07.62-2.61.62-.54 0-1.37-.61-2.25-.59-1.16.02-2.23.67-2.83 1.7-1.2 2.09-.31 5.18.86 6.88.57.83 1.26 1.76 2.16 1.73.87-.04 1.2-.56 2.25-.56s1.35.56 2.27.54c.94-.02 1.53-.85 2.1-1.68.66-.96.94-1.9.95-1.95-.02-.01-1.82-.7-1.84-2.75ZM9.5 3.4c.48-.58.8-1.38.71-2.19-.69.03-1.52.46-2.01 1.03-.44.51-.83 1.33-.73 2.11.77.06 1.55-.39 2.03-.95Z" />
  </svg>
);
