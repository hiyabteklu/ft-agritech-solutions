export default function Hero() {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl animate-fade-up text-center">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Where It All Began
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-brand-green/5 transition duration-500 hover:border-brand-green/25 hover:shadow-brand-green/15">
          <video controls className="aspect-video w-full" poster="/ftagritech1.jpg">
            <source src="/yorda.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
