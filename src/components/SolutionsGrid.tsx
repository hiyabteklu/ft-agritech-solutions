const solutions = [
  {
    id: '01',
    title: 'Apiculture',
    image: '/assets/images/cat1.jpg',
    keywords: 'apiculture bees honey',
  },
  {
    id: '02',
    title: 'Aviculture',
    image: '/assets/images/cat2.jpg',
    keywords: 'aviculture poultry birds chickens',
  },
  {
    id: '03',
    title: 'Horticulture',
    image: '/assets/images/cat3.jpg',
    keywords: 'horticulture plants vegetables fruits',
  },
  {
    id: '04',
    title: 'Livestock',
    image: '/assets/images/cat4.jpg',
    keywords: 'livestock cattle cows animals',
  },
  {
    id: '05',
    title: 'Export Crops',
    image: '/assets/images/cat5.jpg',
    keywords: 'export crops coffee sesame international',
  },
  {
    id: '06',
    title: 'Staple Grains',
    image: '/assets/images/cat6.jpg',
    keywords: 'staple grains teff wheat corn',
  },
  {
    id: '07',
    title: 'Aquaculture',
    image: '/assets/images/cat7.jpg',
    keywords: 'aquaculture fish farming water',
  },
];

export default function SolutionsGrid() {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Our Solutions
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {solutions.map((item) => (
            <a
              key={item.id}
              href={`/category?title=${item.id} | ${item.title}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-[1.02]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-semibold text-white">
                  {item.id} | {item.title}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green shadow-[0_0_8px_#10B981]" />
                  <span className="text-sm text-brand-green">Explore Solutions</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
