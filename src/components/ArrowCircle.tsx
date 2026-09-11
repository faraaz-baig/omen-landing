import type { Component } from 'solid-js';

const Arrow: Component<{ stroke: string }> = (props) => (
  <svg
    class="arrow-swap__arrow"
    width="36"
    height="36"
    viewBox="0 0 36 36"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M13 25L24 12M13 12H24V23"
      fill="none"
      stroke={props.stroke}
      stroke-width="1.5"
    />
  </svg>
);

const ArrowCircle: Component<{ dark?: boolean }> = (props) => {
  const bg = () => (props.dark ? '#111111' : '#FFFFFF');
  const fg = () => (props.dark ? '#FFFFFF' : '#111111');

  return (
    <span
      class="arrow-swap"
      style={{ 'background-color': bg() }}
      aria-hidden="true"
    >
      <Arrow stroke={fg()} />
      <Arrow stroke={fg()} />
    </span>
  );
};

export default ArrowCircle;
