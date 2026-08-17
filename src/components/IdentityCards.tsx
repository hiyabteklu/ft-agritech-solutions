const cards = [
  {
    title: 'Vision',
    body: "To make Ethiopia the world's leading example of technology-driven agriculture by innovating practical solutions to every major agricultural challenge.",
    highlight: false,
  },
  {
    title: 'Mission',
    body: 'FT Agri-Tech exists to identify real agricultural challenges through research, field engagement, and data, then design, build, deploy, and continuously improve engineering solutions that create measurable value for farmers, businesses, and institutions.',
    highlight: false,
  },
  {
    title: 'Why We Exist',
    body: 'FT Agri-Tech was born from lived experience. We grew up watching hardworking farmers lose harvests to pests, wildlife, unpredictable weather, disease, and problems that often had practical solutions but no one built them.',
    highlight: false,
  },
  {
    title: 'Philosophy',
    body: "We don't invent technology and search for a use. We find the problem first, then build exactly what the situation demands.",
    highlight: true,
  },
];

export default function IdentityCards() {
  return (
    <section id="identity" className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border p-6 transition hover:border-brand-green/40 ${
              card.highlight
                ? 'border-brand-green/50 bg-brand-green/10'
                : 'border-white/10 bg-brand-card'
            }`}
          >
            <h3
              className={`mb-3 text-lg font-semibold ${
                card.highlight ? 'text-brand-green' : 'text-white'
              }`}
            >
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-300">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
