'use client';

import { useState } from 'react';
import type { Sector, Product } from '@/data/sectors';
import { productImagePath } from '@/data/sectors';
import { supabase } from '@/lib/supabase';

type CatalogType = 'local' | 'imported' | null;

export default function CategoryClient({ sector }: { sector: Sector }) {
  const [catalog, setCatalog] = useState<CatalogType>(null);
  const [problemOpen, setProblemOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  // Problem form
  const [probTitle, setProbTitle] = useState('');
  const [probDesc, setProbDesc] = useState('');
  const [probAlert, setProbAlert] = useState<{ msg: string; ok: boolean } | null>(null);

  // Custom form
  const [customReason, setCustomReason] = useState('');
  const [customParams, setCustomParams] = useState('');
  const [customContact, setCustomContact] = useState('');
  const [customAlert, setCustomAlert] = useState<{ msg: string; ok: boolean } | null>(null);

  const openCatalog = (type: 'local' | 'imported') => {
    setCatalog(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeCatalog = () => {
    setCatalog(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitProblem = async () => {
    if (!probTitle.trim() || !probDesc.trim()) {
      setProbAlert({ msg: 'Please provide both a problem title and description.', ok: false });
      return;
    }
    const { error } = await supabase.from('problems').insert([
      { title: probTitle.trim(), description: probDesc.trim(), sector: sector.title },
    ]);
    if (error) {
      setProbAlert({ msg: error.message, ok: false });
      return;
    }
    setProbAlert({ msg: 'Problem submitted to R&D successfully.', ok: true });
    setProbTitle('');
    setProbDesc('');
  };

  const submitCustom = async () => {
    if (!customReason.trim() || !customParams.trim() || !customContact.trim()) {
      setCustomAlert({ msg: 'Please complete all custom request fields.', ok: false });
      return;
    }
    const { error } = await supabase.from('custom_requests').insert([
      {
        reason: customReason.trim(),
        parameters: customParams.trim(),
        contact: customContact.trim(),
        sector: sector.title,
      },
    ]);
    if (error) {
      setCustomAlert({ msg: error.message, ok: false });
      return;
    }
    setCustomAlert({ msg: 'Custom R&D request submitted successfully.', ok: true });
    setCustomReason('');
    setCustomParams('');
    setCustomContact('');
  };

  return (
    <>
      {/* Header */}
      <section className="px-4 pb-6 pt-12 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-brand-gold sm:text-5xl">
            {sector.title}
          </h1>
          <p className="text-lg text-gray-400">{sector.subtitle}</p>
        </div>
      </section>

      {catalog === null ? (
        <div>
          {/* Background & Scope */}
          <section className="px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-4 border-b border-brand-gold/30 pb-2 text-2xl font-bold text-white">
                Background &amp; Scope in Ethiopia
              </h2>
              <div className="rounded-2xl border border-white/10 bg-brand-card p-6">
                <p className="leading-relaxed text-gray-300">{sector.scope}</p>
              </div>
            </div>
          </section>

          {/* Problems */}
          <section className="px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-6 border-b border-red-500/30 pb-2 text-2xl font-bold text-white">
                Problems Identified
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {sector.problems.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-white/10 border-t-4 border-t-red-500 bg-brand-card p-5"
                  >
                    <h3 className="mb-2 font-semibold text-red-400">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-300">{p.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 border-t border-dashed border-white/10 pt-8 text-center">
                <p className="mb-4 text-gray-400">
                  Have you identified an unlisted inefficiency in the field?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProbAlert(null);
                    setProblemOpen(true);
                  }}
                  className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  + Report New Problem
                </button>
              </div>
            </div>
          </section>

          {/* Solution type cards */}
          <section className="px-4 py-8 pb-16 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-6 border-b border-brand-green/30 pb-2 text-2xl font-bold text-white">
                Solutions Available
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => openCatalog('local')}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 text-left transition hover:scale-[1.02]"
                >
                  <img
                    src={`/assets/images/${sector.imgPrefix}_hand.jpg`}
                    alt="Locally Developed"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <h3 className="text-xl font-semibold text-white">Locally Developed</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green shadow-[0_0_8px_#10B981]" />
                      <span className="text-sm text-brand-green">Ready to Deploy</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openCatalog('imported')}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 text-left transition hover:scale-[1.02]"
                >
                  <img
                    src={`/assets/images/${sector.imgPrefix}_import.jpg`}
                    alt="Imported Solutions"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <h3 className="text-xl font-semibold text-white">Imported Solutions</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
                      <span className="text-sm text-blue-400">Global Sourcing</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomAlert(null);
                    setCustomOpen(true);
                  }}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 text-left transition hover:scale-[1.02]"
                >
                  <img
                    src="/assets/images/custom_design_lab.jpg"
                    alt="Request Custom Design"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <h3 className="text-xl font-semibold text-white">Request Custom Design</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-gold" />
                      <span className="text-sm text-brand-gold">Custom R&amp;D Request</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <CatalogView
          sector={sector}
          type={catalog}
          onBack={closeCatalog}
        />
      )}

      {/* Report Problem Modal */}
      {problemOpen && (
        <Modal onClose={() => setProblemOpen(false)} accent="red">
          <div className="mb-4 text-center">
            <span className="text-3xl">⚙️</span>
            <h3 className="mt-2 text-xl font-bold text-red-400">Report an Engineering Problem</h3>
            <p className="mt-1 text-sm text-gray-400">
              Submit the parameters below so our engineering team can analyze a solution.
            </p>
          </div>
          <input
            value={probTitle}
            onChange={(e) => setProbTitle(e.target.value)}
            placeholder="Problem Title (e.g., Sensor Failure)"
            className="mb-3 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-red-400"
          />
          <textarea
            value={probDesc}
            onChange={(e) => setProbDesc(e.target.value)}
            placeholder="Describe the technical issue and its impact..."
            rows={4}
            className="mb-4 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-red-400"
          />
          <button
            type="button"
            onClick={submitProblem}
            className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Submit to R&amp;D
          </button>
          {probAlert && (
            <p
              className={`mt-3 text-center text-sm ${
                probAlert.ok ? 'text-brand-green' : 'text-brand-gold'
              }`}
            >
              {probAlert.msg}
            </p>
          )}
        </Modal>
      )}

      {/* Custom R&D Modal */}
      {customOpen && (
        <Modal onClose={() => setCustomOpen(false)} accent="gold">
          <div className="mb-4 text-center">
            <span className="text-3xl">🔬</span>
            <h3 className="mt-2 text-xl font-bold text-brand-gold">Custom R&amp;D Request</h3>
            <p className="mt-1 text-sm text-gray-400">
              If our existing local or imported solutions do not fit your parameters, our
              engineering team can design a custom architecture.
            </p>
          </div>
          <p className="mb-1 text-left text-xs text-gray-400">
            1. Why are the standard solutions insufficient?
          </p>
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="e.g., The standard pumps cannot handle our high-sediment water..."
            rows={3}
            className="mb-3 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
          />
          <p className="mb-1 text-left text-xs text-gray-400">
            2. What exact parameters must the new solution meet?
          </p>
          <textarea
            value={customParams}
            onChange={(e) => setCustomParams(e.target.value)}
            placeholder="e.g., Must run on 12V solar, process 500L/hour, and cost under 15,000 ETB..."
            rows={3}
            className="mb-3 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
          />
          <input
            value={customContact}
            onChange={(e) => setCustomContact(e.target.value)}
            placeholder="Engineering Lead Contact Email / Phone"
            className="mb-4 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
          />
          <button
            type="button"
            onClick={submitCustom}
            className="w-full rounded-lg bg-brand-gold py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Initiate R&amp;D Consultation
          </button>
          {customAlert && (
            <p
              className={`mt-3 text-center text-sm ${\n                customAlert.ok ? 'text-brand-green' : 'text-brand-gold'
              }`}
            >
              {customAlert.msg}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}

function CatalogView({
  sector,
  type,
  onBack,
}: {
  sector: Sector;
  type: 'local' | 'imported';
  onBack: () => void;
}) {
  const products = sector.products[type];
  const accent = type === 'local' ? 'brand-green' : 'blue-400';
  const label = type === 'local' ? 'Locally Developed' : 'Imported Solutions';

  return (
    <section className="px-4 py-8 pb-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-brand-gold bg-transparent px-4 py-2 text-sm font-medium text-brand-gold transition hover:bg-brand-gold/10"
        >
          ← Back to Dashboard
        </button>

        <h2 className="mb-2 border-b border-brand-green/30 pb-2 text-3xl font-bold text-white">
          <span className={type === 'local' ? 'text-brand-green' : 'text-blue-400'}>
            {label}
          </span>{' '}
          // {sector.title}
        </h2>
        <p className="mb-8 text-gray-400">
          Select an engineering intervention to view deployment specifications and pricing.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((prod) => (
            <ProductCard key={prod.name} product={prod} type={type} />
          ))}

          {/* Coming soon placeholder */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-transparent p-8 text-center opacity-50">
            <div className="mb-3 text-4xl">⚙️</div>
            <h3 className="mb-2 text-lg font-semibold text-white">Further Developments</h3>
            <p className="text-sm text-gray-400">
              Additional engineering interventions for this sector are currently undergoing field
              testing and stress verification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, type }: { product: Product; type: 'local' | 'imported' }) {
  const accentBg = type === 'local' ? 'bg-brand-green text-black' : 'bg-blue-400 text-black';
  const borderTop = type === 'local' ? 'border-t-brand-green' : 'border-t-blue-400';
  const btnBg = type === 'local' ? 'bg-brand-green text-black' : 'bg-blue-400 text-black';

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border border-white/10 border-t-4 ${borderTop} bg-brand-card p-6`}
    >
      <div>
        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-black/40">
          <img
            src={productImagePath(product.name)}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="mb-3 flex items-start justify-between gap-2 border-b border-white/10 pb-3">
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${accentBg}`}>
            {product.status}
          </span>
        </div>
        <p className="mb-2 text-sm text-gray-400">
          <strong>Solves:</strong>{' '}
          <span className="text-red-400">{product.solves}</span>
        </p>
        <p className="mb-4 text-sm leading-relaxed text-gray-200">{product.desc}</p>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between rounded-lg bg-black/30 p-3">
          <div>
            <p className="text-xs text-gray-500">Unit Pricing</p>
            <p className="text-lg font-bold text-brand-gold">{product.price}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Field Rating</p>
            <p className="font-bold text-white">⭐ {product.rating}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            alert('Procurement Gateway Offline: Pending backend integration.')
          }
          className={`w-full rounded-lg py-3 text-sm font-bold transition hover:opacity-90 ${btnBg}`}
        >
          Configure &amp; Order
        </button>
      </div>
    </div>
  );
}

function Modal({
  children,
  onClose,
  accent,
}: {
  children: React.ReactNode;
  onClose: () => void;
  accent: 'red' | 'gold';
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl border bg-brand-card p-6 shadow-2xl ${
          accent === 'red' ? 'border-red-500/40' : 'border-brand-gold/40'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition hover:text-white"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
