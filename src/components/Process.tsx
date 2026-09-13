import type { Component } from 'solid-js';

const interpretRows = [
  { name: 'CYP2C19 *2/*2', tag: 'Actionable', muted: false },
  { name: 'MTHFR C677T', tag: 'Actionable', muted: false },
  { name: 'rs1815739', tag: 'Filtered out', muted: true },
  { name: 'rs4988235', tag: 'Filtered out', muted: true },
];

const StepTop: Component<{ index: string }> = (props) => (
  <div class="step__top">
    <span class="step__index">{props.index}</span>
    <span class="step__index">▮▮▮▮</span>
  </div>
);

const Process: Component = () => {
  return (
    <section class="process" id="how-it-works">
      <div class="process__label mono-label">HOW OMEN WORKS / 01—04</div>
      <div class="process__rail">
        {/* 01 / SEQUENCE */}
        <div class="step step--sequence step--dark" data-reveal>
          <div class="step__bg step__bg--sequence" />
          <StepTop index="01 / SEQUENCE" />
          <div class="step__body">
            <div class="widget">
              <div class="widget__row">
                <span class="widget__label">Sample kit</span>
                <span class="widget__status">RECEIVED</span>
              </div>
              <div class="widget__bar" />
              <div class="widget__row">
                <span class="widget__meta">30× coverage</span>
                <span class="widget__meta">Complete</span>
              </div>
            </div>
            <div class="step__title">One sample, at home</div>
            <div class="step__text">
              Whole-genome sequencing, taken once. Everything the product does
              afterwards runs on this single read.
            </div>
          </div>
        </div>

        {/* 02 / INTERPRET */}
        <div class="step step--interpret" data-reveal style={{ 'transition-delay': '90ms' }}>
          <div class="step__bg step__bg--interpret" />
          <StepTop index="02 / INTERPRET" />
          <div class="variants">
            {interpretRows.map((v) => (
              <div class="variant" classList={{ 'variant--muted': v.muted }}>
                <span class="variant__name">{v.name}</span>
                <span
                  class="variant__tag"
                  classList={{ 'variant__tag--filtered': v.muted }}
                >
                  {v.tag}
                </span>
              </div>
            ))}
          </div>
          <div class="step__body">
            <div class="step__title">Most of it gets thrown away</div>
            <div class="step__text">
              Anything that fails the confidence bar never reaches you. The
              product’s value is what it refuses to say.
            </div>
          </div>
        </div>

        {/* 03 / DECIDE */}
        <div class="step step--decide step--dark" data-reveal style={{ 'transition-delay': '180ms' }}>
          <div class="step__bg step__bg--decide" />
          <StepTop index="03 / DECIDE" />
          <div class="widget">
            <div class="widget__kicker">DO THIS</div>
            <div class="widget__action">
              Ask about an alternative to clopidogrel before any procedure
            </div>
            <div class="widget__chips">
              <span class="widget__chip">CYP2C19</span>
              <span class="widget__chip">Share with GP</span>
            </div>
          </div>
          <div class="step__body">
            <div class="step__title">Four decisions, not 300 findings</div>
            <div class="step__text">
              Each one written as an action, with the evidence and the clinician
              handoff attached.
            </div>
          </div>
        </div>

        {/* 04 / MEASURE */}
        <div class="step step--measure step--dark" data-reveal style={{ 'transition-delay': '270ms' }}>
          <div class="step__bg step__bg--measure" />
          <StepTop index="04 / MEASURE" />
          <div class="widget">
            <div class="widget__label">Your health, in context</div>
            <svg
              class="widget__chart"
              viewBox="0 0 320 75"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M0 65H320M0 35H320M0 5H320"
                fill="none"
                stroke="#45433B"
              />
              <path
                d="M0 60C40 60 35 48 72 51S125 22 162 32S212 45 247 22S285 10 320 7"
                fill="none"
                stroke="#D89D50"
                stroke-width="2"
              />
            </svg>
            <div class="widget__caption">Evidence evolves. Your record grows.</div>
          </div>
          <div class="step__body">
            <div class="step__title">The beginning, not the report</div>
            <div class="step__text">
              Track what changed. Revisit the evidence. Make the next decision
              with a clearer picture.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
