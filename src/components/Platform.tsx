import type { Component } from 'solid-js';

const variants = [
  { name: 'CYP2C19 *2/*2', implication: 'Poor metaboliser', confidence: 'High' },
  { name: 'HFE C282Y', implication: 'Iron loading', confidence: 'High' },
  { name: 'APOE ε3/ε4', implication: 'Lipid handling', confidence: 'Moderate' },
  { name: 'MTHFR C677T', implication: 'Folate conversion', confidence: 'Moderate' },
];

const Platform: Component = () => {
  return (
    <section class="platform" id="product">
      <div class="platform__eyebrow">
        <svg
          class="spin-slow"
          width="28"
          height="28"
          viewBox="0 0 28 28"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ 'flex-shrink': '0' }}
        >
          <path
            d="M14 1V27M1 14H27M5 5L23 23M5 23L23 5"
            fill="none"
            stroke="#555555"
            stroke-width="1.5"
          />
        </svg>
        <span>{`READY TO STOP GUESSING WHICH\nINTERVENTIONS WORK FOR YOU?`}</span>
      </div>

      <h2 class="platform__headline" data-split>
        {`A predictive, personalised\ngenomics platform — for people\nand their clinicians.`}
      </h2>

      <div class="clinician" data-reveal="scale">
        <div class="clinician__message">
          <div class="clinician__label mono-label">CLINICIAN VIEW</div>
          <div class="clinician__title">
            {`The same genome, read\nfor the person treating you`}
          </div>
          <div class="clinician__body">
            Every recommendation carries its variant, its evidence and its
            confidence, so a clinician can accept or overrule it in seconds.
          </div>
        </div>

        <div class="clinician__panel">
          <div class="evidence">
            <div class="evidence__row evidence__row--head">
              <div class="evidence__cell evidence__cell--variant mono-label">VARIANT</div>
              <div class="evidence__cell evidence__cell--implication">IMPLICATION</div>
              <div class="evidence__cell evidence__cell--confidence">CONFIDENCE</div>
            </div>
            {variants.map((v) => (
              <div class="evidence__row">
                <div class="evidence__cell evidence__cell--variant">{v.name}</div>
                <div class="evidence__cell evidence__cell--implication">
                  {v.implication}
                </div>
                <div
                  class="evidence__cell evidence__cell--confidence"
                  classList={{ 'evidence__cell--high': v.confidence === 'High' }}
                >
                  {v.confidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;
