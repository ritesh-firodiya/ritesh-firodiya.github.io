"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies a short piece of text, and says that it did. */
export function CopyButton({ text, label = "Copy address", className = "btn btn-quiet" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // No clipboard access. The text is on the page beside this button, so it can be selected by hand.
    }
  }

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {done ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {done ? "Copied" : label}
    </button>
  );
}
