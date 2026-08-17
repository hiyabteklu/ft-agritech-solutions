'use client';

import { useEffect, useState } from 'react';

const stages = [
  {
    step: '01',
    title: 'Research',
    blurb: 'Listen to the field before drawing a single circuit.',
    accent: 'border-brand-green/40',
    node: 'bg-brand-green text-black',
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
    accent: 'border-brand-gold/40',
    node: 'bg-brand-gold text-black',
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
    accent: 'border-sky-400/40',
    node: 'bg-sky-400 text-black',
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
    accent: 'border-violet-400/40',
    node: 'bg-violet-400 text-black',
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
  const [active, setActive] = useState(0);
  const stage = stages[active];

  return (
    <section id="framework" className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(90%,40rem)] -translate-x-1/2 rounded-full bg-brand-green/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl animate-fade-up">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Innovation Framework
        </h2>
        <p className="mb-10 text-center text-base text-gray-400">
          Every innovation at FT Agri-Tech follows the same closed cycle — each stage feeds the next,
          and deployment returns insight to research.
        </p>

        {/* Single main card: stages + closed loop inside */}
        <div
          className={
            'card-alive overflow-hidden rounded-3xl border bg-brand-card p-5 sm:p-8 ' + stage.accent
          }
        >
          {/* Stage selector row */}
          <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {stages.map((s, i) => {
              const isOn = active === i;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActive(i)}
                  className={
                    'relative flex flex-col items-center rounded-2xl border px-2 py-4 transition ' +
                    (isOn
                      ? 'border-brand-green/50 bg-black/40 shadow-[0_0_28px_-8px_rgba(16,185,129,0.45)]'
                      : 'border-white/10 bg-black/20 hover:border-white/25')
                  }
                >
                  <span
                    className={
                      'mb-2 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold lifecycle-node ' +
                      s.node
                    }
                  >
                    {s.step}
                  </span>
                  <span
                    className={
                      'text-center text-xs font-semibold sm:text-sm ' +
                      (isOn ? 'text-white' : 'text-gray-400')
                    }
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active stage header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Stage {stage.step} · Closed loop
              </p>
              <h3 className="mt-1 text-2xl font-bold text-white">{stage.title}</h3>
              <p className="mt-1 max-w-lg text-sm text-gray-400">{stage.blurb}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous stage"
                onClick={() => setActive((active - 1 + stages.length) % stages.length)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg text-white transition hover:bg-white/15 active:scale-95"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next stage"
                onClick={() => setActive((active + 1) % stages.length)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg text-white transition hover:bg-white/15 active:scale-95"
              >
                →
              </button>
            </div>
          </div>

          {/*
            Closed hierarchy loop INSIDE the card:
            items flow with next arrows; last connects back to first.
          */}
          <ClosedLoop key={stage.step} items={stage.items} nodeClass={stage.node} />

          {/* Macro cycle hint: stages themselves form a loop */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Full system loop:{' '}
            <span className="text-gray-400">
              Research → Problems → Engineering → Deployment → Research
            </span>
          </p>
        </div>

        {/* Core values — uniform cards, slide left carousel */}
        <div className="mt-14">
          <h3 className="mb-6 text-center text-lg font-semibold text-white">Core Values</h3>
          <CoreValuesSlider values={coreValues} />
        </div>
      </div>
    </section>
  );
}

function ClosedLoop({
  items,
  nodeClass,
}: {
  items: string[];
  nodeClass: string;
}) {
  return (
    <div className="animate-fade-up">
      <div className="flex flex-col items-stretch gap-0">
        {items.map((label, i) => {
          const isLast = i === items.length - 1;
          return (
            <div key={label} className="flex flex-col items-center">
              <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 transition hover:border-white/20 hover:bg-black/50">
                <span
                  className={
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ' +
                    nodeClass
                  }
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-left text-sm font-medium text-white sm:text-base">
                  {label}
                </span>
                {!isLast ? (
                  <span className="hidden text-xs font-semibold uppercase tracking-wide text-brand-green/80 sm:inline">
                    next
                  </span>
                ) : (
                  <span className="hidden text-xs font-semibold uppercase tracking-wide text-brand-gold/80 sm:inline">
                    loops
                  </span>
                )}
              </div>

              {/* Arrow connector: next, or close loop back to start */}
              <div className="flex flex-col items-center py-1.5">
                <span className="text-lg leading-none text-brand-green/70" aria-hidden>
                  ↓
                </span>
                {isLast ? (
                  <span className="mt-0.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
                    back to 1 · closed loop
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Explicit return link to item 1 */}
        <div className="mt-1 flex w-full items-center gap-3 rounded-2xl border border-dashed border-brand-green/35 bg-brand-green/5 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-green/40 text-xs font-bold text-brand-green">
            ↻
          </span>
          <span className="flex-1 text-left text-sm text-gray-300">
            Returns to <strong className="text-white">{items[0]}</strong> — continuous improvement
            cycle inside this stage
          </span>
        </div>
      </div>
    </div>
  );
}

function CoreValuesSlider({ values }: { values: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % values.length);
    }, 3800);
    return () => clearInterval(id);
  }, [values.length]);

  // Duplicate for seamless feel in the track
  const track = [...values, ...values];

  return (
    <div className="relative">
      {/* Auto-advancing single-focus cards — uniform size */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            width: `${values.length * 100}%`,
            transform: `translateX(-${(index * 100) / values.length}%)`,
          }}
        >
          {values.map((v) => (
            <div
              key={v}
              className="box-border flex shrink-0 justify-center px-2"
              style={{ width: `${100 / values.length}%` }}
            >
              <div className="flex h-28 w-full max-w-md items-center justify-center rounded-2xl border border-brand-green/30 bg-brand-green/10 px-6 text-center shadow-lg shadow-brand-green/5">
                <p className="text-base font-medium leading-snug text-brand-green sm:text-lg">{v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continuous slide strip underneath for motion richness */}
      <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/30 py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-brand-dark to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-brand-dark to-transparent" />
        <div className="values-marquee flex w-max gap-4">
          {track.map((v, i) => (
            <div
              key={`${v}-${i}`}
              className="flex h-16 w-64 shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/10 px-4 text-center"
            >
              <p className="line-clamp-2 text-sm font-medium text-brand-green">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {values.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Value ${i + 1}`}
            onClick={() => setIndex(i)}
            className={
              'h-2.5 rounded-full transition ' +
              (i === index ? 'w-8 bg-brand-green' : 'w-2.5 bg-white/25 hover:bg-white/40')
            }
          />
        ))}
      </div>
    </div>
  );
}
