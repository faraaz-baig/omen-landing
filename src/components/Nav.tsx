import type { Component } from 'solid-js';
import ArrowCircle from './ArrowCircle';

const Nav: Component = () => {
  return (
    <nav class="nav">
      <a class="nav__logo" href="#top" aria-label="Omen">
        <svg
          class="nav__logo-mark"
          viewBox="12 8 118 60"
          width="55"
          height="28"
          aria-hidden="true"
        >
          <path
            d="M 16 64 Q 42 16 70 46 Q 98 14 124 38"
            fill="none"
            stroke="currentColor"
            stroke-width="7"
            stroke-linecap="round"
          />
          <circle cx="124" cy="14" r="6" fill="#C4502F" />
        </svg>
      </a>

      <div class="nav__links">
        <a class="nav__link" href="#how-it-works">
          How it works
        </a>
        <span class="nav__dot">·</span>
        <a class="nav__link" href="#product">
          Product
        </a>
        <span class="nav__dot">·</span>
        <a class="nav__link" href="#what-it-tells-you">
          What it can tell you
        </a>
      </div>

      <a class="nav__cta" href="#join">
        <span>Join Waitlist</span>
        <ArrowCircle />
      </a>
    </nav>
  );
};

export default Nav;
