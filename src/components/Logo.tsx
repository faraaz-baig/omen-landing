import type { Component } from 'solid-js';

const Logo: Component = () => (
  <span class="logo">
    <svg
      class="logo__mark"
      width="44"
      height="30"
      viewBox="0 0 100 58"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 49 C23 20 34 17 49 33 C65 16 78 12 92 26"
        fill="none"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="92" cy="7" r="4.6" fill="var(--ref-amber)" />
    </svg>
    <span class="logo__word">Omen</span>
  </span>
);

export default Logo;
