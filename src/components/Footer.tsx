export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-6 text-2xl font-bold text-white">Contact us</h2>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://t.me/FT_Agri_Tech"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#0088cc] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Telegram
          </a>
          <a
            href="https://www.linkedin.com/company/ft-agritech-solutions/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#0A66C2] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            LinkedIn
          </a>
        </div>

        <p className="text-sm text-gray-500">
          &copy; 2026 FT Agri-Tech Solutions. All systems operational.
        </p>
      </div>
    </footer>
  );
}
