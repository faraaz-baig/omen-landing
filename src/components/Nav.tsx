import type { Component } from 'solid-js';
import ArrowCircle from './ArrowCircle';
import Logo from './Logo';

const Nav: Component = () => {
  return (
    <nav class="nav">
      <a class="nav__logo" href="#top" aria-label="Omen — back to top">
        <Logo />
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
