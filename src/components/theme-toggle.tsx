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
 * Until someone presses the button there is no stored choice, and the media
 * query in globals.css follows the OS. A press stores the opposite of what is
 * on screen, so the button always does something visible.
 *
 * The choice lives in localStorage, which is an external store, so it is read
 * with useSyncExternalStore rather than copied into state by an effect. The
 * effect version tripped react-hooks/set-state-in-effect and deserved to: it
 * rendered once with the wrong value and then again with the right one.
 */
type Theme = "light" | "dark" | "system";

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

/* What is actually on screen. "system" is the absence of a choice, so it
   resolves to whatever the OS asks for. */
function shownDark(theme: Theme): boolean {
  if (theme === "system") return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme === "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const dark = shownDark(theme);

  /* One press always changes the page. The button used to cycle
     system → dark → light, so on a dark system the first press went from
     "dark by default" to "dark by choice" and looked broken. */
  function toggle() {
    const next = dark ? "light" : "dark";
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage refused; the click is still honoured for this page view.
    }
    window.dispatchEvent(new Event(CHANGED));
  }

  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-pill border border-line text-ink-2 transition hover:border-line-strong hover:text-ink"
      suppressHydrationWarning
    >
      {/* Both icons are rendered and CSS shows one, so the server and the
          browser agree on the markup whatever the theme turns out to be. */}
      <Sun size={16} strokeWidth={1.75} className="theme-icon-light" aria-hidden />
      <Moon size={16} strokeWidth={1.75} className="theme-icon-dark" aria-hidden />
    </button>
  );
}
