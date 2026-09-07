"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { intro } from "./intro-state";

/**
 * Progressive reveal that mounts one item at a time.
 *
 * Mounting rather than fading matters for layout: items hidden with
 * `opacity: 0` still occupy their full box, so the page would be its final
 * length from first paint and you could scroll past the animation into blank
 * space. Growing the list keeps the document exactly as tall as what has
 * appeared.
 *
 * Scroll position is left alone — the reader stays where they are and new
 * findings accumulate below.
 */
export function Reveal({
  items,
  startDelayMs = 3400,
  stepMs = 450,
}: {
  items: ReactNode[];
  startDelayMs?: number;
  stepMs?: number;
}) {
  // Already played this visit (or motion is unwanted)? Render the finished list.
  const [shown, setShown] = useState(() => (intro.played ? items.length : 0));
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    if (intro.played) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      intro.played = true;
      setShown(items.length);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < items.length; i++) {
      timers.push(
        setTimeout(
          () => setShown((n) => Math.max(n, i + 1)),
          startDelayMs + i * stepMs,
        ),
      );
    }
    return () => {
      timers.forEach(clearTimeout);
      // Mark played only if items actually appeared. React's dev-mode double
      // mount tears down at shown === 0, which must not count as a play.
      if (shownRef.current > 0) intro.played = true;
    };
  }, [items.length, startDelayMs, stepMs]);

  return (
    <>
      {items.slice(0, shown).map((item, i) => (
        <div className="rise" key={i}>
          {item}
        </div>
      ))}
    </>
  );
}
