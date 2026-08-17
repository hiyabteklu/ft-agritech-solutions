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
  // Duplicate the list so the CSS animation can loop seamlessly
  const track = [...partners, ...partners];

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Strategic Partners
        </h2>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-6">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-brand-dark to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-brand-dark to-transparent" />

          <div className="marquee-track flex w-max gap-10">
            {track.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="flex h-16 w-36 shrink-0 items-center justify-center sm:h-20 sm:w-44"
              >
                <img
                  src={`/${src}`}
                  alt="Partner"
                  className="max-h-full max-w-full object-contain opacity-80 transition hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
