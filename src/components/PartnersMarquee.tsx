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

        {/* Soft light plate so black logos stay readable — no dark overlay on images */}
        <div className="relative overflow-hidden rounded-3xl border border-sky-200/20 bg-[#e8f4fc] py-8 sm:py-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#e8f4fc] to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#e8f4fc] to-transparent sm:w-16" />

          <div className="marquee-track relative z-[1] flex w-max gap-8 sm:gap-12">
            {track.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="flex h-24 w-44 shrink-0 items-center justify-center rounded-2xl border border-sky-900/10 bg-white px-4 py-3 shadow-sm sm:h-28 sm:w-52"
              >
                <img
                  src={`/${src}`}
                  alt="Partner"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
