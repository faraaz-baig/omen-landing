"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWaitlist } from "./waitlist";

/**
 * Two headers, one component. At the top of the page: a three-zone in-flow
 * band — nav left, the wordmark lockup dead-center (absolutely positioned so
 * uneven zones can never shift it), actions right. Once that band scrolls
 * away, a condensed capsule fixes itself to the top edge: frosted espresso,
 * rounded bottom corners only (it hangs from the viewport, so its top edge
 * is the viewport's), everything one size down, and the CTA inverted to
 * paper. Superpower's scroll trick in Omen's materials.
 *
 * The capsule stays mounted and slides in/out rather than mounting on
 * scroll: mounting mid-scroll would replay its backdrop-filter paint and
 * flash. Threshold 120px ≈ just past the expanded header, so the two never
 * show together.
 */
export function SiteHeader() {
  const open = useWaitlist();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="relative flex h-14 items-center justify-between px-4 sm:h-[92px] sm:px-5">
        <span className="text-[15px] leading-none font-medium tracking-[0.22em] text-ink uppercase sm:hidden">
          Omen
        </span>

        <nav className="hidden items-center gap-9 sm:flex">
          <a
            className="text-[12px] font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:text-ink-2"
            href="#how-it-works"
          >
            How it works
          </a>
        </nav>

        <div className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-center gap-1.5 sm:flex">
          <span className="text-[18px] leading-none font-medium tracking-[0.22em] text-ink uppercase">
            Omen
          </span>
          <span className="text-[10px] leading-none tracking-[0.18em] text-ink-2 uppercase">
            The personal genomics company
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-7">
          <Link
            className="hidden text-[12px] font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:text-ink-2 sm:inline"
            href="/gate"
          >
            Log in
          </Link>
          <button
            className="flex h-8 items-center rounded-[4px] bg-ink px-4 text-[11px] leading-none font-medium tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85 sm:h-10 sm:rounded-[var(--radius-frame)] sm:px-6 sm:text-[12px]"
            onClick={open}
            type="button"
          >
            Get a kit
          </button>
        </div>
      </header>

      {/* aria-hidden + inert-ish pointer handling while offscreen, so the
          capsule's controls never tab-focus or catch clicks before it shows.
          The duplicate controls are hidden from assistive tech entirely when
          offscreen; when visible they are the only header on screen. */}
      <div
        aria-hidden={!scrolled}
        className={`fixed inset-x-0 top-0 z-40 flex justify-center transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
          scrolled ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex h-[52px] items-center gap-5 rounded-b-[8px] bg-[rgb(28_23_19/0.62)] px-2.5 pl-5 backdrop-blur-[18px] sm:h-[58px] sm:gap-8 sm:pl-7">
          <a
            className="hidden text-[11px] font-medium tracking-[0.16em] text-white/90 uppercase transition-colors hover:text-white sm:inline"
            href="#how-it-works"
            tabIndex={scrolled ? 0 : -1}
          >
            How it works
          </a>
          <span className="text-[14px] leading-none font-medium tracking-[0.22em] text-white uppercase sm:text-[15px]">
            Omen
          </span>
          <Link
            className="hidden text-[11px] font-medium tracking-[0.16em] text-white/90 uppercase transition-colors hover:text-white sm:inline"
            href="/gate"
            tabIndex={scrolled ? 0 : -1}
          >
            Log in
          </Link>
          <button
            className="flex h-9 items-center rounded-[var(--radius-frame)] bg-paper px-4 text-[11px] leading-none font-medium tracking-[0.16em] text-ink uppercase transition-opacity hover:opacity-90 sm:px-5"
            onClick={open}
            tabIndex={scrolled ? 0 : -1}
            type="button"
          >
            Get a kit
          </button>
        </div>
      </div>
    </>
  );
}
