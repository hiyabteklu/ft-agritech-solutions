'use client';

import { useState } from 'react';
import { communityServices } from '@/data/communityServices';

export default function CommunityServiceGrid() {
  const [openTitle, setOpenTitle] = useState(null as string | null);

  return (
    <section id="community" className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-brand-green">
            Free for farmers & communities
          </p>
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Community Service
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
            Practical knowledge for rural communities and agri sectors — courses, weather,
            pharmacy info, seeds, yield tips, and market research. Always free.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {communityServices.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenTitle(item.title)}
              className={
                'tile-3d group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 text-left animate-fade-up stagger-' +
                Math.min(i + 1, 6)
              }
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src !== item.fallbackImage) {
                    el.src = item.fallbackImage;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <h3 className="text-xl font-semibold text-white sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">{item.subtitle}</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 animate-soft-pulse rounded-full bg-brand-green shadow-[0_0_10px_#10B981]" />
                  <span className="text-sm font-medium text-brand-green sm:text-base">
                    Open free resource
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {openTitle && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-dev-title"
          onClick={() => setOpenTitle(null)}
        >
          <div
            className="w-full max-w-md animate-scale-in rounded-2xl border border-white/15 bg-[#0d0d0d] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-green">
              Community Service
            </p>
            <h3 id="community-dev-title" className="mt-2 text-xl font-semibold text-white">
              {openTitle}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Under development. This free resource is being prepared for farmers and rural
              communities across Ethiopia. Check back soon.
            </p>
            <button
              type="button"
              onClick={() => setOpenTitle(null)}
              className="mt-6 w-full rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
