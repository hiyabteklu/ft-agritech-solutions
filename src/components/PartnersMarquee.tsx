const partners = [
  'GridArt_20260718_090800234.png',
  'GridArt_20260718_090950084.png',
  'GridArt_20260718_091135477.png',
  'GridArt_20260718_091736635.png',
  'GridArt_20260718_092344887.png',
  'GridArt_20260718_092523414.png',
  'GridArt_20260718_092816998.png',
];

export default function PartnersMarquee() {
  const track = [...partners, ...partners];

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl animate-fade-up">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Strategic Partners
        </h2>

        <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-sky-950/40 py-8 shadow-[0_0_60px_-20px_rgba(56,189,248,0.25)] sm:py-10">
          {/* Soft blue wash so dark logos read clearly */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-900/50 via-sky-950/30 to-sky-900/50" />

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-sky-950/90 to-transparent sm:w-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-sky-950/90 to-transparent sm:w-20" />

          <div className="marquee-track relative z-[1] flex w-max gap-8 sm:gap-12">
            {track.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="flex h-24 w-44 shrink-0 items-center justify-center rounded-2xl border border-sky-400/15 bg-sky-400/10 px-4 py-3 backdrop-blur-sm transition hover:border-sky-300/30 hover:bg-sky-400/20 sm:h-28 sm:w-52"
              >
                <img
                  src={`/${src}`}
                  alt="Partner"
                  className="max-h-full max-w-full object-contain brightness-110 contrast-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
