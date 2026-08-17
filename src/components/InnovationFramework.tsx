'use client';

import { useState } from 'react';

const sections = [
  {
    title: 'Research',
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
    title: 'Problem Identification',
    items: [
      'Root-cause analysis',
      'Economic impact',
      'Technical feasibility',
      'Priority ranking',
    ],
  },
  {
    title: 'Engineering',
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
    title: 'Deployment',
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

type AccordionItemProps = {
  title: string;
  items: string[];
  isOpen: boolean;
  onToggle: () => void;
};

function AccordionItem({ title, items, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="card-alive overflow-hidden rounded-xl border border-white/10 bg-brand-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[56px] w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/5 active:scale-[0.99]"
      >
        <span className="text-base font-semibold text-white sm:text-lg">{title}</span>
        <span
          className={
            'flex h-9 w-9 items-center justify-center rounded-full border border-brand-green/40 bg-brand-green/10 text-sm text-brand-green transition-transform duration-200 ' +
            (isOpen ? 'rotate-180' : '')
          }
        >
          ▼
        </span>
      </button>
      {isOpen ? (
        <div className="animate-fade-up overflow-hidden">
          <ul className="flex flex-wrap gap-2 border-t border-white/5 px-5 py-4">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-brand-green/30 bg-brand-green/10 px-3.5 py-1.5 text-sm text-brand-green"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function InnovationFramework() {
  const [openIndex, setOpenIndex] = useState(0 as number | null);
  const [valuesOpen, setValuesOpen] = useState(false);

  return (
    <section id="framework" className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl animate-fade-up">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Innovation Framework
        </h2>
        <p className="mb-8 text-center text-base text-gray-400">
          Every innovation at FT Agri-Tech follows the same process:
        </p>

        <div className="space-y-3">
          {sections.map((section, index) => (
            <AccordionItem
              key={section.title}
              title={section.title}
              items={section.items}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        <div className="mt-10">
          <AccordionItem
            title="Core Values"
            items={coreValues}
            isOpen={valuesOpen}
            onToggle={() => setValuesOpen(!valuesOpen)}
          />
        </div>
      </div>
    </section>
  );
}
