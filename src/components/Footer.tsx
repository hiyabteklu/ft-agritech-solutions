import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <img
              src="/ftagritech1.jpg"
              alt="FT Agri-Tech"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-semibold text-white">FT Agri-Tech</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Engineering practical solutions for real agricultural challenges in Ethiopia.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-300">
            Explore
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/#solutions" className="hover:text-brand-green">
                Our Products
              </Link>
            </li>
            <li>
              <Link href="/#community" className="hover:text-brand-green">
                Community Service
              </Link>
            </li>
            <li>
              <Link href="/#framework" className="hover:text-brand-green">
                Innovation Framework
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-green">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-brand-green">
                My Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-300">
            Connect
          </h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://t.me/FT_Agri_Tech"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#0088cc] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Telegram
            </a>
            <a
              href="https://www.linkedin.com/company/ft-agritech-solutions/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} FT Agri-Tech Solutions. All systems operational.
      </p>
    </footer>
  );
}
