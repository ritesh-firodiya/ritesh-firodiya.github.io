"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Light / dark, written to the root as `data-theme`.
 *
 * §8 of the style guide: a theme is a token remap, never a `dark:` prefix. So
 * this component sets one attribute and touches nothing else — every utility
 * on the page already reads `var(--color-…)` and follows on its own.
 *
 * Three states, not two. "system" is the default and is not a third palette:
 * it is the absence of a choice, which lets the media query in globals.css
 * decide. Collapsing it to a boolean is how a site ends up ignoring the OS
 * setting for everyone who never pressed the button.
 *
 * The choice lives in localStorage, which is an external store, so it is read
 * with useSyncExternalStore rather than copied into state by an effect. The
 * effect version tripped react-hooks/set-state-in-effect and deserved to: it
 * rendered once with the wrong value and then again with the right one.
 */
type Theme = "light" | "dark" | "system";

const NEXT: Record<Theme, Theme> = { system: "dark", dark: "light", light: "system" };
const LABEL: Record<Theme, string> = {
  system: "Theme: following your system — switch to dark",
  dark: "Theme: dark — switch to light",
  light: "Theme: light — follow your system",
};

/** Same-tab writes fire no `storage` event, so the setter announces itself. */
const CHANGED = "themechange";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

function readTheme(): Theme {
  try {
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    // Private mode, or site data blocked. A theme button is not worth throwing.
    return "system";
  }
}

/* The export is statically prerendered and the server cannot know the reader's
   theme, so the server snapshot is "system" — the same thing the no-flash
   script in layout.tsx assumes when it finds nothing stored. */
const serverTheme = (): Theme => "system";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  function apply(next: Theme) {
    const root = document.documentElement;
    try {
      if (next === "system") {
        root.removeAttribute("data-theme");
        localStorage.removeItem("theme");
      } else {
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      }
    } catch {
      // Storage refused; still honour the click for this page view.
      if (next === "system") root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", next);
    }
    window.dispatchEvent(new Event(CHANGED));
  }

  return (
    <button
      type="button"
      onClick={() => apply(NEXT[theme])}
      title={LABEL[theme]}
      aria-label={LABEL[theme]}
      className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-line text-ink-2 transition hover:border-line-strong hover:text-ink"
    >
      {theme === "dark" ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
    </button>
  );
}
