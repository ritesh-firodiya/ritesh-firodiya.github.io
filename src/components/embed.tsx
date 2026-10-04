"use client";

import { useEffect, useRef } from "react";

/**
 * A product's own design screen, live, at its own logical size and scaled to
 * the box by CSS.
 *
 * It is the real file from the product's design set, so nothing is copied and
 * nothing goes stale — and it can follow this site's theme, which a screenshot
 * cannot. The set keeps its own theme in its own storage; this pushes ours in
 * once the frame has loaded and again whenever ours changes.
 */
function isDark(): boolean {
  const chosen = document.documentElement.getAttribute("data-theme");
  if (chosen === "dark" || chosen === "light") return chosen === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function Embed({ src, title, phone = false, fill = false }: { src: string; title: string; phone?: boolean; fill?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const apply = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        const dark = isDark();
        doc.documentElement.dataset.wfTheme = dark ? "dark" : "light";
        doc.querySelectorAll(".phone").forEach((el) => el.classList.toggle("phone--dark", dark));
      } catch {
        // A frame that refuses access keeps its own theme; that is not worth throwing over.
      }
    };
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    frame.addEventListener("load", apply);
    window.addEventListener("themechange", apply);
    media.addEventListener("change", apply);
    apply();
    return () => {
      frame.removeEventListener("load", apply);
      window.removeEventListener("themechange", apply);
      media.removeEventListener("change", apply);
    };
  }, []);

  return (
    <div className={`embed${phone ? " embed--phone" : ""}${fill ? " embed--fill" : ""}`}>
      <iframe ref={ref} src={`${src}?bare`} title={title} loading="lazy" tabIndex={-1} />
    </div>
  );
}
