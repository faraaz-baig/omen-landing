/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';

import App from './App';
import { initAnimations } from './lib/animate';
import './index.css';

document.documentElement.classList.add('js');

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);

if (!new URLSearchParams(window.location.search).has('noanim')) {
  initAnimations();
} else {
  document.querySelectorAll('[data-split]').forEach((el) => el.classList.add('is-in'));
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
  document
    .querySelectorAll<HTMLElement>('.cascade-line')
    .forEach((el) => (el.style.opacity = '1'));
}
