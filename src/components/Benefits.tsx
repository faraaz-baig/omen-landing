import type { Component, JSX } from 'solid-js';

const icons: Record<string, JSX.Element> = {
  clock: (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="#11100D" stroke-width="2" />
      <path d="M16 5V16H5" fill="none" stroke="#11100D" stroke-width="2" />
    </svg>
  ),
  asterisk: (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 2V30M2 16H30M6 6L26 26M6 26L26 6" fill="none" stroke="#11100D" stroke-width="3" />
    </svg>
  ),
  sparkle: (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12Z" fill="none" stroke="#11100D" stroke-width="2" />
    </svg>
  ),
  rings: (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="#11100D" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="#11100D" />
    </svg>
  ),
};

const benefits = [
  {
    icon: 'clock',
    title: 'No appointments. No waiting.',
    body: 'One sample, taken at home. Every answer after that comes from data you already gave us.',
  },
  {
    icon: 'asterisk',
    title: 'Smarter than guesswork',
    body: 'Variants are read against published evidence, and anything that fails the confidence bar stays out of the product.',
  },
  {
    icon: 'sparkle',
    title: 'Tailored to you',
    body: 'Recommendations start from your biology rather than the median patient in a guideline.',
  },
  {
    icon: 'rings',
    title: 'Proof, not just advice',
    body: 'We measure whether the decision worked, so the record compounds instead of expiring.',
  },
];

const Benefits: Component = () => {
  return (
    <section class="benefits">
      <h2 class="benefits__headline" data-split>
        {`Anyone. Anywhere.\n3.2B base pairs, read once.`}
      </h2>

      <div class="benefits__grid">
        {benefits.map((b, i) => (
          <div class="benefit" data-reveal style={{ 'transition-delay': `${i * 100}ms` }}>
            {icons[b.icon]}
            <div>
              <div class="benefit__title">{b.title}</div>
              <div class="benefit__body">{b.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
