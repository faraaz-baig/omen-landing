import type { Component } from 'solid-js';
import ArrowCircle from './ArrowCircle';

const rows: { title: string; items: string[] }[][] = [
  [
    {
      title: 'Medication\n& Dosing',
      items: [
        'Antidepressant selection',
        'Antiplatelet response',
        'Codeine & opioid metabolism',
        'Statin tolerance',
        'Warfarin dosing',
        'PPI clearance',
        'Anaesthetic sensitivity',
        'Chemotherapy toxicity risk',
        'NSAID metabolism',
        'Immunosuppressant dosing',
        'Adverse reaction risk (HLA)',
        'Caffeine clearance',
      ],
    },
    {
      title: 'Disease Risk\n& Prevention',
      items: [
        'Inherited risk assessment',
        'Cardiovascular predisposition',
        'Lipid metabolism',
        'Iron regulation',
        'Cancer predisposition',
        'Metabolic risk',
        'Bone health',
        'Clinician-led screening',
      ],
    },
    {
      title: 'Nutrition\n& Metabolism',
      items: [
        'Nutrient processing',
        'Lactose tolerance',
        'Folate pathways',
        'Vitamin metabolism',
        'Caffeine metabolism',
        'Alcohol metabolism',
        'Dietary response',
        'Evidence-led nutrition',
      ],
    },
  ],
  [
    {
      title: 'Fitness\n& Recovery',
      items: [
        'Exercise response',
        'Muscle function',
        'Recovery patterns',
        'Endurance traits',
        'Injury susceptibility',
        'Training context',
      ],
    },
    {
      title: 'Skin\n& Ageing',
      items: [
        'Skin barrier biology',
        'Pigmentation pathways',
        'UV sensitivity',
        'Collagen biology',
        'Inflammatory pathways',
        'Evidence-led skin care',
      ],
    },
    {
      title: 'Family &\nInherited Health',
      items: [
        'Carrier screening',
        'Recessive conditions',
        'Family history context',
        'Inherited variants',
        'Genetic counselling',
        'Clinician-led next steps',
      ],
    },
  ],
];

const Categories: Component = () => {
  return (
    <section class="categories" id="what-it-tells-you">
      <h2 class="categories__headline" data-split>
        {`From drug response to disease risk —\nwe help you turn what’s in your\ngenome into what to do next.`}
      </h2>

      <button class="categories__cta" type="button" data-reveal>
        <span>Full list (upcoming)</span>
        <ArrowCircle />
      </button>

      {rows.map((row) => (
        <div class="categories__row">
          {row.map((cat, i) => (
            <div class="category">
              <div class="category__title" data-split data-split-delay={i * 120}>
                {cat.title}
              </div>
              <div class="category__list" data-cascade>
                {cat.items.map((item) => (
                  <span class="cascade-line">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div class="categories__note">
        Areas we’re exploring, not a launch feature list. Availability will
        depend on evidence, validation and clinical review.
      </div>
    </section>
  );
};

export default Categories;
