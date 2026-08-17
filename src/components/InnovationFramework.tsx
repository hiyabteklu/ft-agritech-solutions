'use client';

import { useState } from 'react';

const stages = [
  {
    step: '01',
    title: 'Research',
    blurb: 'Listen to the field before drawing a single circuit.',
    accent: 'from-emerald-500/20 to-transparent',
    ring: 'ring-brand-green/40',
    dot: 'bg-brand-green',
    items: [
      { label: 'Field studies', depth: 1 },
      { label: 'Data collection', depth: 1 },
      { label: 'Government priorities', depth: 2 },
      { label: 'Customer requests', depth: 2 },
      { label: 'Global trends', depth: 3 },
      { label: 'Case studies', depth: 3 },
    ],
  },
  {
    step: '02',
    title: 'Problem Identification',
    blurb: 'Rank what hurts most — impact, cost, and feasibility.',
    accent: 'from-amber-500/20 to-transparent',
    ring: 'ring-brand-gold/40',
    dot: 'bg-brand-gold',
    items: [
      { label: 'Root-cause analysis', depth: 1 },
      { label: 'Economic impact', depth: 1 },
      { label: 'Technical feasibility', depth: 2 },
      { label: 'Priority ranking', depth: 2 },
    ],
  },
  {
    step: '03',
    title: 'Engineering',
    blurb: 'Build only what the problem demands — hardware to AI.',
    accent: 'from-sky-500/20 to-transparent',
    ring: 'ring-sky-400/40',
    dot: 'bg-sky-400',
    items: [
      { label: 'Hardware', depth: 1 },
      { label: 'Embedded systems', depth: 1 },
      { label: 'AI & Machine Learning', depth: 2 },
      { label: 'IoT', depth: 2 },
      { label: 'Robotics', depth: 3 },
      { label: 'Software', depth: 3 },
      { label: 'Automation', depth: 3 },
    ],
  },
  {
    step: '04',
    title: 'Deployment',
    blurb: 'Ship, train, maintain — then improve from real use.',
    accent: 'from-violet-500/20 to-transparent',
    ring: 'ring-violet-400/40',
    dot: 'bg-violet-400',
    items: [
      { label: 'Manufacturing', depth: 1 },
      { label: 'Installation', depth: 1 },
      { label: 'Training', depth: 2 },
      { label: 'Maintenance', depth: 2 },
      { label: 'Continuous improvement', depth: 3 },
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
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(90%,40rem)] -translate-x-1/2 rounded-full bg-brand-green/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl animate-fade-up">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Innovation Framework
        </h2>
        <p className="mb-12 text-center text-base text-gray-400">
          Every innovation at FT Agri-Tech follows the same living cycle — not a checklist, a
          hierarchy of discovery.
        </p>

        {/* Horizontal lifecycle spine (desktop) / vertical (mobile) */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-2">
          {stages.map((s, i) => {
            const isOn = active === i;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActive(i)}
                className={
                  'group relative flex flex-1 flex-col items-center rounded-2xl border px-3 py-5 text-center transition duration-400 ' +
                  (isOn
                    ? 'border-brand-green/50 bg-brand-card shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] scale-[1.03]'
                    : 'border-white/10 bg-brand-card/60 hover:border-white/25 hover:bg-brand-card')
                }
              >
                {/* Connector line between steps (desktop) */}
                {i < stages.length - 1 ? (
                  <span
                    className="lifecycle-connector absolute right-0 top-1/2 hidden h-0.5 w-[calc(50%+0.5rem)] translate-x-full sm:block"
                    aria-hidden
                  />
                ) : null}

                <span
                  className={
                    'lifecycle-node mb-3 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-black ring-4 ' +
                    s.dot +
                    ' ' +
                    s.ring
                  }
                >
                  {s.step}
                </span>
                <span
                  className={
                    'text-sm font-semibold sm:text-base ' +
                    (isOn ? 'text-white' : 'text-gray-300')
                  }
                >
                  {s.title}
                </span>
                <span className="mt-1 hidden text-xs text-gray-500 sm:line-clamp-2 sm:block">
                  {s.blurb}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hierarchy panel for active stage */}
        <div
          key={stage.step}
          className={
            'card-alive relative overflow-hidden rounded-3xl border border-white/10 bg-brand-card p-6 sm:p-8 bg-gradient-to-br ' +
            stage.accent
          }
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Stage {stage.step} · Hierarchy
              </p>
              <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{stage.title}</h3>
              <p className="mt-2 max-w-xl text-base text-gray-400">{stage.blurb}</p>
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

          {/* Tree / depth hierarchy */}
          <div className="relative space-y-3 pl-2 sm:pl-4">
            {/* Vertical trunk */}
            <div
              className="lifecycle-connector absolute bottom-3 left-[11px] top-3 w-0.5 rounded-full sm:left-[15px]"
              aria-hidden
            />

            {stage.items.map((item, idx) => {
              const indent = (item.depth - 1) * 28;
              return (
                <div
                  key={item.label}
                  className="lifecycle-branch relative animate-fade-up flex items-center gap-3"
                  style={{
                    marginLeft: indent,
                    animationDelay: `${idx * 0.06}s`,
                  }}
                >
                  <span
                    className={
                      'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-card ' +
                      stage.dot
                    }
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-black/40" />
                  </span>
                  <div
                    className={
                      'flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm transition hover:border-white/25 hover:bg-black/45 ' +
                      (item.depth === 1 ? 'shadow-lg shadow-black/30' : '')
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white sm:text-base">{item.label}</span>
                      <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                        L{item.depth}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core values — orbit-style strip */}
        <div className="mt-12">
          <h3 className="mb-5 text-center text-lg font-semibold text-white">Core Values</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {coreValues.map((v, i) => (
              <div
                key={v}
                className={
                  'card-alive max-w-xs rounded-2xl border border-brand-green/25 bg-brand-green/10 px-4 py-3 text-center text-sm text-brand-green animate-fade-up stagger-' +
                  Math.min(i + 1, 6)
                }
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
