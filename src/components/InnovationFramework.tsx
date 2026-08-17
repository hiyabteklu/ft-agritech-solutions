'use client';

import { useState } from 'react';

const stages = [
  {
    step: '01',
    title: 'Research',
    blurb: 'Listen to the field before drawing a single circuit.',
    items: [
      'Field studies',
      'Data collection',
      'Government priorities',
      'Customer requests',
      'Global trends',
      'Case studies',
    ],
  },
  {
    step: '02',
    title: 'Problem Identification',
    blurb: 'Rank what hurts most — impact, cost, and feasibility.',
    items: [
      'Root-cause analysis',
      'Economic impact',
      'Technical feasibility',
      'Priority ranking',
    ],
  },
  {
    step: '03',
    title: 'Engineering',
    blurb: 'Build only what the problem demands — hardware to AI.',
    items: [
      'Hardware',
      'Embedded systems',
      'AI & Machine Learning',
      'IoT',
      'Robotics',
      'Software',
      'Automation',
    ],
  },
  {
    step: '04',
    title: 'Deployment',
    blurb: 'Ship, train, maintain — then improve from real use.',
    items: [
      'Manufacturing',
      'Installation',
      'Training',
      'Maintenance',
      'Continuous improvement',
    ],
  },
];

const coreValues = [
  'Purpose before profit.',
  'Research before engineering.',
  'Practicality over complexity.',
  'Innovation driven by real demand.',
  'Long-term partnership with customers.',
  'Continuous learning from the field.',
  'Engineering with measurable impact.',
];

export default function InnovationFramework() {
  const [openStep, setOpenStep] = useState(0);

  const toggle = (index: number) => {
    setOpenStep((prev) => (prev === index ? -1 : index));
  };

  return (
    <section id="framework" className="relative px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Innovation Framework
        </h2>
        <p className="mb-10 text-center text-base text-gray-400">
          Every innovation follows the same ordered cycle. Tap a stage to expand.
        </p>

        {/* Ordered expandable list — mobile-first */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isOpen = openStep === index;
            return (
              <div
                key={stage.step}
                className={
                  'overflow-hidden rounded-2xl border transition ' +
                  (isOpen
                    ? 'border-brand-green/40 bg-brand-card shadow-[0_0_24px_-12px_rgba(16,185,129,0.35)]'
                    : 'border-white/10 bg-brand-card/80')
                }
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full min-h-[56px] items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-black">
                    {stage.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-white sm:text-lg">{stage.title}</p>
                    <p className="mt-0.5 truncate text-sm text-gray-500 sm:text-gray-400">
                      {stage.blurb}
                    </p>
                  </div>
                  <span
                    className={
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg text-gray-300 transition ' +
                      (isOpen ? 'rotate-180 bg-white/10' : '')
                    }
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-white/10 px-4 pb-5 pt-3 sm:px-5">
                    <ol className="space-y-2">
                      {stage.items.map((item, i) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 rounded-xl bg-black/30 px-3 py-2.5"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-brand-green">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-snug text-gray-200 sm:text-base">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                    {index < stages.length - 1 ? (
                      <p className="mt-4 text-center text-xs text-gray-500">
                        Next → {stages[index + 1].title}
                      </p>
                    ) : (
                      <p className="mt-4 text-center text-xs text-brand-gold/80">
                        Loops back to Research — continuous improvement
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Core Values — entirely different design: quiet manifesto strip */}
        <div className="mt-16">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
            <h3 className="shrink-0 text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Core Values
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0c0c0c] px-5 py-8 sm:px-10 sm:py-10">
            <p className="mb-8 text-center font-serif text-4xl leading-none text-brand-gold/30 sm:text-5xl">
              “
            </p>
            <ul className="mx-auto max-w-xl space-y-0">
              {coreValues.map((value, i) => (
                <li key={value}>
                  <div className="flex gap-4 py-4 sm:gap-6">
                    <span className="w-8 shrink-0 pt-0.5 text-right font-mono text-xs text-brand-gold/60 sm:w-10 sm:text-sm">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base leading-relaxed text-gray-200 sm:text-lg">{value}</p>
                  </div>
                  {i < coreValues.length - 1 ? (
                    <div className="ml-12 border-b border-white/5 sm:ml-16" />
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center font-serif text-4xl leading-none text-brand-gold/30 sm:text-5xl">
              ”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
