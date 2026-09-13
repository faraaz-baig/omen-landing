import Lenis from 'lenis';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

let lenis: Lenis | null = null;

/* ———————————————— Lenis smooth scroll ————————————————
   Same config as myhealthprac.com (duration 1.2, exponential easing) */

function initSmoothScroll() {
  if (REDUCED.matches) return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Anchor links through Lenis
  document.addEventListener('click', (e) => {
    const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (!anchor) return;
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      if (id === '#join') {
        // back to the top of the site, then focus the hero email input
        const focusInput = () =>
          document
            .querySelector<HTMLInputElement>('.waitlist__input')
            ?.focus({ preventScroll: true });
        if (lenis) {
          lenis.scrollTo(0, { onComplete: focusInput });
        } else {
          window.scrollTo(0, 0);
          focusInput();
        }
        return;
      }
      lenis?.scrollTo(target as HTMLElement, { offset: 0 });
    }
  });
}

/* ———————————————— Split text (letters-slide-up) ————————————————
   Splits [data-split] into masked word > char spans, exactly like the
   SplitType setup on myhealthprac.com. Chars get staggered delays. */

function splitText(el: HTMLElement) {
  const text = el.textContent ?? '';
  el.textContent = '';

  const base = Number(el.dataset.splitDelay ?? 0);
  let i = 0;
  text.split(/\n/).forEach((line, li) => {
    if (li > 0) {
      // trailing space keeps words joined when <br> is hidden on mobile
      el.appendChild(document.createTextNode(' '));
      el.appendChild(document.createElement('br'));
    }
    line.split(' ').forEach((word, wi) => {
      if (wi > 0) el.appendChild(document.createTextNode(' '));
      const w = document.createElement('span');
      w.className = 'split__word';
      for (const ch of word) {
        const c = document.createElement('span');
        c.className = 'split__char';
        c.textContent = ch;
        c.style.transitionDelay = `${base + Math.min(i++ * 22, 800)}ms`;
        w.appendChild(c);
      }
      el.appendChild(w);
    });
  });
}

/* ———————————————— IntersectionObserver reveals ————————————————
   ScrollTrigger equivalent: plays once when element top crosses 90%
   of the viewport (their `start: "top 90%"`). */

function observe(elements: HTMLElement[], cls = 'is-in') {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add(cls);
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  );
  elements.forEach((el) => io.observe(el));
}

/* ———————————————— Hero parallax ———————————————— */

function initParallax() {
  if (REDUCED.matches) return;

  const portrait = document.querySelector<HTMLElement>('.hero__portrait');
  if (!portrait) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    portrait.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(${1 + y * 0.00012})`;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
}

/* ———————————————— Nav re-theme past hero ————————————————
   Same idea as their #light-header-trigger → header--light swap. */

function initNavTheme() {
  const hero = document.querySelector('.hero');
  const nav = document.querySelector('.nav');
  if (!hero || !nav) return;

  new IntersectionObserver(
    ([entry]) => {
      nav.classList.toggle('nav--scrolled', !entry.isIntersecting);
    },
    { rootMargin: '-72px 0px 0px 0px', threshold: 0 },
  ).observe(hero);
}

/* ———————————————— Scroll-scrubbed cascade ————————————————
   Each line fades from dim to full ink as it rises past ~2/3 of the
   viewport — the health-conditions list effect on myhealthprac.com. */

function initCascade() {
  if (REDUCED.matches) return;

  const lines = Array.from(
    document.querySelectorAll<HTMLElement>('[data-cascade] .cascade-line'),
  );
  if (!lines.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of lines) {
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (vh * 0.95 - top) / (vh * 0.32)));
      el.style.opacity = String(0.12 + 0.88 * p);
      el.style.transform = `translateY(${(1 - p) * 8}px)`;
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ———————————————— Card background parallax ————————————————
   Process rail photos drift vertically against page scroll while the
   scrim + content stay pinned to the card. */

function initCardParallax() {
  if (REDUCED.matches) return;

  const bgs = Array.from(document.querySelectorAll<HTMLElement>('.step__bg'));
  if (!bgs.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const bg of bgs) {
      const card = bg.parentElement;
      if (!card) continue;
      const rect = card.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > vh + 120) continue;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      bg.style.transform = `translate3d(0, ${progress * 56}px, 0)`;
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ———————————————— Process rail edge blurs ————————————————
   Left blur appears once scrolled; right blur hides at the end. */

function initRailEdges() {
  const rail = document.querySelector<HTMLElement>('.process__rail');
  const section = document.querySelector<HTMLElement>('.process');
  if (!rail || !section) return;

  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    section.classList.toggle('process--scrolled', rail.scrollLeft > 8);
    section.classList.toggle('process--end', rail.scrollLeft >= max - 8);
  };

  rail.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ———————————————— Entry point ———————————————— */

export function initAnimations() {
  initSmoothScroll();
  initNavTheme();
  initParallax();
  initCascade();
  initCardParallax();
  initRailEdges();

  const split = Array.from(
    document.querySelectorAll<HTMLElement>('[data-split]'),
  );
  split.forEach(splitText);
  observe(split);

  observe(Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')));
}
