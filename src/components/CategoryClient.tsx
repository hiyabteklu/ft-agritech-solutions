'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Sector, Product } from '@/data/sectors';
import { productImagePath } from '@/data/sectors';
import { supabase } from '@/lib/supabase';

type CatalogType = 'local' | 'imported' | null;

type AlertState = {
  msg: string;
  ok: boolean;
};

export default function CategoryClient({ sector }: { sector: Sector }) {
  const [user, setUser] = useState(null as User | null);
  const [authLoading, setAuthLoading] = useState(true);
  const [catalog, setCatalog] = useState(null as CatalogType);
  const [problemOpen, setProblemOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState(null as Product | null);
  const [quoteQty, setQuoteQty] = useState('1');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteAlert, setQuoteAlert] = useState(null as AlertState | null);
  const [quoteSending, setQuoteSending] = useState(false);

  const [probTitle, setProbTitle] = useState('');
  const [probDesc, setProbDesc] = useState('');
  const [probAlert, setProbAlert] = useState(null as AlertState | null);

  const [customReason, setCustomReason] = useState('');
  const [customParams, setCustomParams] = useState('');
  const [customContact, setCustomContact] = useState('');
  const [customAlert, setCustomAlert] = useState(null as AlertState | null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncCatalogFromHash = useCallback(() => {
    if (typeof window === 'undefined') return;
    const h = window.location.hash;
    if (h === '#catalog-local') setCatalog('local');
    else if (h === '#catalog-imported') setCatalog('imported');
    else setCatalog(null);
  }, []);

  useEffect(() => {
    syncCatalogFromHash();
    const onPop = () => syncCatalogFromHash();
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, [syncCatalogFromHash]);

  useEffect(() => {
    if (quoteAlert && !quoteAlert.ok) {
      const t = setTimeout(() => setQuoteAlert(null), 4500);
      return () => clearTimeout(t);
    }
  }, [quoteAlert]);

  useEffect(() => {
    if (probAlert && !probAlert.ok) {
      const t = setTimeout(() => setProbAlert(null), 4500);
      return () => clearTimeout(t);
    }
  }, [probAlert]);

  useEffect(() => {
    if (customAlert && !customAlert.ok) {
      const t = setTimeout(() => setCustomAlert(null), 4500);
      return () => clearTimeout(t);
    }
  }, [customAlert]);

  const openCatalog = (type: 'local' | 'imported') => {
    setCatalog(type);
    const hash = type === 'local' ? '#catalog-local' : '#catalog-imported';
    if (typeof window !== 'undefined') {
      window.history.pushState({ catalog: type }, '', hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeCatalog = () => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash;
      if (h === '#catalog-local' || h === '#catalog-imported') {
        window.history.back();
        return;
      }
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setCatalog(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProblemModal = () => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    setProbAlert(null);
    setProblemOpen(true);
  };

  const openCustomModal = () => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    setCustomAlert(null);
    setCustomOpen(true);
  };

  const openQuote = (product: Product) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    setQuoteProduct(product);
    setQuoteQty('1');
    setQuoteNotes('');
    setQuotePhone('');
    setQuoteAlert(null);
  };

  const continueToLogin = async () => {
    setAuthPromptOpen(false);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  };

  const submitQuote = async () => {
    if (!user || !quoteProduct) return;
    if (!quotePhone.trim()) {
      setQuoteAlert({
        msg: 'Please add a phone or WhatsApp number so we can reach you.',
        ok: false,
      });
      return;
    }
    setQuoteSending(true);
    const { error } = await supabase.from('quote_requests').insert([
      {
        product_name: quoteProduct.name,
        product_price: quoteProduct.price,
        sector: sector.title,
        quantity: quoteQty.trim() || '1',
        notes: quoteNotes.trim() || null,
        contact_phone: quotePhone.trim(),
        user_email: user.email ?? null,
        status: 'pending',
      },
    ]);
    setQuoteSending(false);
    if (error) {
      setQuoteAlert({
        msg:
          'Could not save quote yet. Message us on Telegram with the product name, or try again later.',
        ok: false,
      });
      return;
    }
    setQuoteAlert({
      msg: 'Quote request sent. We will contact you with pricing and deployment options.',
      ok: true,
    });
    setQuoteQty('1');
    setQuoteNotes('');
  };

  const submitProblem = async () => {
    if (!user) {
      setProbAlert({ msg: 'Please sign in before submitting.', ok: false });
      return;
    }
    if (!probTitle.trim() || !probDesc.trim()) {
      setProbAlert({
        msg: 'Please provide both a problem title and description.',
        ok: false,
      });
      return;
    }
    const { error } = await supabase.from('problems').insert([
      {
        title: probTitle.trim(),
        description: probDesc.trim(),
        sector: sector.title,
        user_email: user.email ?? null,
      },
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
    if (!user) {
      setCustomAlert({ msg: 'Please sign in before submitting.', ok: false });
      return;
    }
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
        user_email: user.email ?? null,
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
    <div className="animate-fade-in">
      <section className="px-4 pb-6 pt-12 sm:px-6">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-brand-gold sm:text-5xl">
            {sector.title}
          </h1>
          <p className="text-lg text-gray-400">{sector.subtitle}</p>
        </div>
      </section>

      {catalog === null ? (
        <div>
          <section className="px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-7xl animate-fade-up stagger-1">
              <h2 className="mb-4 border-b border-brand-gold/30 pb-2 text-2xl font-bold text-white">
                Background & Scope in Ethiopia
              </h2>
              <div className="rounded-2xl border border-white/10 bg-brand-card p-6">
                <p className="leading-relaxed text-gray-300">{sector.scope}</p>
              </div>
            </div>
          </section>

          <section className="px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-7xl animate-fade-up stagger-2">
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
                <p className="mb-5 text-gray-400">
                  Have you identified an unlisted inefficiency in the field?
                </p>
                <button
                  type="button"
                  onClick={openProblemModal}
                  disabled={authLoading}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-red-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-50"
                >
                  + Report New Problem
                </button>
                {!user && !authLoading ? (
                  <p className="mt-3 text-sm text-gray-500">Sign in required to submit</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="px-4 py-8 pb-16 sm:px-6">
            <div className="mx-auto max-w-7xl animate-fade-up stagger-3">
              <h2 className="mb-6 border-b border-brand-green/30 pb-2 text-2xl font-bold text-white">
                Solutions Available
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => openCatalog('local')}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-brand-green/40"
                >
                  <img
                    src={'/assets/images/' + sector.imgPrefix + '_hand.jpg'}
                    alt="Locally Developed"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                  <div className="absolute bottom-0 p-5 sm:p-6">
                    <h3 className="text-xl font-semibold text-white sm:text-2xl">Locally Developed</h3>
                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 animate-soft-pulse rounded-full bg-brand-green shadow-[0_0_10px_#10B981]" />
                      <span className="text-sm font-medium text-brand-green sm:text-base">Ready to Deploy</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openCatalog('imported')}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-blue-400/40"
                >
                  <img
                    src={'/assets/images/' + sector.imgPrefix + '_import.jpg'}
                    alt="Imported Solutions"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                  <div className="absolute bottom-0 p-5 sm:p-6">
                    <h3 className="text-xl font-semibold text-white sm:text-2xl">Imported Solutions</h3>
                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400 shadow-[0_0_10px_#60A5FA]" />
                      <span className="text-sm font-medium text-blue-400 sm:text-base">Global Sourcing</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={openCustomModal}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-brand-gold/40"
                >
                  <img
                    src="/assets/images/custom_design_lab.jpg"
                    alt="Request Custom Design"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                  <div className="absolute bottom-0 p-5 sm:p-6">
                    <h3 className="text-xl font-semibold text-white sm:text-2xl">Request Custom Design</h3>
                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-gold shadow-[0_0_10px_#D4AF37]" />
                      <span className="text-sm font-medium text-brand-gold sm:text-base">Custom R&D Request</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <CatalogView sector={sector} type={catalog} onBack={closeCatalog} onOrder={openQuote} />
      )}

      {authPromptOpen ? (
        <Modal onClose={() => setAuthPromptOpen(false)} accent="gold">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-bold text-white sm:text-2xl">Sign in required</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-400 sm:text-base">
              Sign in with Google to request quotes, report problems, or submit custom R&D.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => setAuthPromptOpen(false)}
              className="min-h-[44px] w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10 active:scale-[0.98] sm:text-base"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={continueToLogin}
              className="min-h-[44px] w-full rounded-xl bg-brand-gold px-4 py-3 text-sm font-bold text-black transition hover:opacity-90 active:scale-[0.98] sm:text-base"
            >
              Continue with Google
            </button>
          </div>
        </Modal>
      ) : null}

      {quoteProduct ? (
        <Modal onClose={() => setQuoteProduct(null)} accent="gold">
          <div className="mb-3 text-center">
            <h3 className="text-lg font-bold text-white sm:text-xl">Request a quote</h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-400">{quoteProduct.name}</p>
            <p className="text-sm font-semibold text-brand-gold">{quoteProduct.price}</p>
          </div>
          {quoteAlert?.ok ? (
            <AlertBanner
              ok
              msg={quoteAlert.msg}
              onDismiss={() => {
                setQuoteAlert(null);
                setQuoteProduct(null);
              }}
            />
          ) : (
            <>
              <label className="mb-2.5 block text-left">
                <span className="mb-1 block text-xs text-gray-400">Quantity</span>
                <input
                  value={quoteQty}
                  onChange={(e) => setQuoteQty(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                  placeholder="1"
                />
              </label>
              <label className="mb-2.5 block text-left">
                <span className="mb-1 block text-xs text-gray-400">Phone / WhatsApp</span>
                <input
                  value={quotePhone}
                  onChange={(e) => setQuotePhone(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                  placeholder="+251..."
                  inputMode="tel"
                />
              </label>
              <label className="mb-3 block text-left">
                <span className="mb-1 block text-xs text-gray-400">Notes (optional)</span>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                  placeholder="Site, timeline, requirements..."
                />
              </label>
              <button
                type="button"
                onClick={submitQuote}
                disabled={quoteSending}
                className="min-h-[44px] w-full rounded-xl bg-brand-green py-3 text-sm font-bold text-black transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {quoteSending ? 'Sending…' : 'Submit quote request'}
              </button>
              {quoteAlert && !quoteAlert.ok ? (
                <AlertBanner ok={false} msg={quoteAlert.msg} onDismiss={() => setQuoteAlert(null)} />
              ) : null}
            </>
          )}
        </Modal>
      ) : null}

      {problemOpen ? (
        <Modal onClose={() => setProblemOpen(false)} accent="red">
          <div className="mb-3 text-center">
            <h3 className="text-lg font-bold text-red-400 sm:text-xl">Report a Problem</h3>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">Signed in as {user?.email}</p>
          </div>
          {probAlert?.ok ? (
            <AlertBanner
              ok
              msg={probAlert.msg}
              onDismiss={() => {
                setProbAlert(null);
                setProblemOpen(false);
              }}
            />
          ) : (
            <>
              <input
                value={probTitle}
                onChange={(e) => setProbTitle(e.target.value)}
                placeholder="Problem title"
                className="mb-2.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
              />
              <textarea
                value={probDesc}
                onChange={(e) => setProbDesc(e.target.value)}
                placeholder="Describe the issue and impact..."
                rows={3}
                className="mb-3 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
              />
              <button
                type="button"
                onClick={submitProblem}
                className="min-h-[44px] w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-500 active:scale-[0.98]"
              >
                Submit to R&D
              </button>
              {probAlert && !probAlert.ok ? (
                <AlertBanner ok={false} msg={probAlert.msg} onDismiss={() => setProbAlert(null)} />
              ) : null}
            </>
          )}
        </Modal>
      ) : null}

      {customOpen ? (
        <Modal onClose={() => setCustomOpen(false)} accent="gold">
          <div className="mb-3 text-center">
            <h3 className="text-lg font-bold text-brand-gold sm:text-xl">Custom R&D Request</h3>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">Signed in as {user?.email}</p>
          </div>
          {customAlert?.ok ? (
            <AlertBanner
              ok
              msg={customAlert.msg}
              onDismiss={() => {
                setCustomAlert(null);
                setCustomOpen(false);
              }}
            />
          ) : (
            <>
              <p className="mb-1 text-left text-xs text-gray-400">1. Why are standard solutions insufficient?</p>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the gap..."
                rows={2}
                className="mb-2.5 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
              />
              <p className="mb-1 text-left text-xs text-gray-400">2. Required parameters</p>
              <textarea
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
                placeholder="Specs, budget, constraints..."
                rows={2}
                className="mb-2.5 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
              />
              <input
                value={customContact}
                onChange={(e) => setCustomContact(e.target.value)}
                placeholder="Contact email / phone"
                className="mb-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
              />
              <button
                type="button"
                onClick={submitCustom}
                className="min-h-[44px] w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-black transition hover:opacity-90 active:scale-[0.98]"
              >
                Initiate R&D Consultation
              </button>
              {customAlert && !customAlert.ok ? (
                <AlertBanner ok={false} msg={customAlert.msg} onDismiss={() => setCustomAlert(null)} />
              ) : null}
            </>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

type CatalogViewProps = {
  sector: Sector;
  type: 'local' | 'imported';
  onBack: () => void;
  onOrder: (product: Product) => void;
};

function CatalogView({ sector, type, onBack, onOrder }: CatalogViewProps) {
  const products = sector.products[type];
  const label = type === 'local' ? 'Locally Developed' : 'Imported Solutions';

  return (
    <section className="animate-fade-up px-4 py-8 pb-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-brand-gold bg-brand-gold/10 px-6 py-3 text-base font-semibold text-brand-gold transition hover:bg-brand-gold/20 active:scale-[0.98]"
        >
          <span className="text-xl leading-none" aria-hidden>
            ←
          </span>
          Back to Dashboard
        </button>
        <h2 className="mb-2 border-b border-brand-green/30 pb-3 text-3xl font-bold text-white">
          <span className={type === 'local' ? 'text-brand-green' : 'text-blue-400'}>{label}</span>
          {' // '}
          {sector.title}
        </h2>
        <p className="mb-8 text-base text-gray-400">
          Select an engineering intervention to view deployment specifications and pricing.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((prod) => (
            <ProductCard key={prod.name} product={prod} type={type} onOrder={() => onOrder(prod)} />
          ))}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-transparent p-8 text-center opacity-60">
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

function ProductCard({
  product,
  type,
  onOrder,
}: {
  product: Product;
  type: 'local' | 'imported';
  onOrder: () => void;
}) {
  const accentBg = type === 'local' ? 'bg-brand-green text-black' : 'bg-blue-400 text-black';
  const borderTop = type === 'local' ? 'border-t-brand-green' : 'border-t-blue-400';
  const btnBg = type === 'local' ? 'bg-brand-green text-black' : 'bg-blue-400 text-black';

  return (
    <div
      className={
        'relative z-0 flex flex-col justify-between rounded-2xl border border-white/10 border-t-4 bg-brand-card p-6 ' +
        borderTop
      }
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
          <span className={'shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ' + accentBg}>
            {product.status}
          </span>
        </div>
        <p className="mb-2 text-sm text-gray-400">
          <strong>Solves:</strong> <span className="text-red-400">{product.solves}</span>
        </p>
        <p className="mb-4 text-sm leading-relaxed text-gray-200">{product.desc}</p>
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between rounded-xl bg-black/30 p-3.5">
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOrder();
          }}
          className={
            'relative z-20 min-h-[48px] w-full touch-manipulation rounded-xl py-3.5 text-base font-bold shadow-md transition hover:opacity-90 active:scale-[0.98] ' +
            btnBg
          }
        >
          Configure & Order
        </button>
      </div>
    </div>
  );
}

type ModalProps = { children: React.ReactNode; onClose: () => void; accent: 'red' | 'gold' };

function Modal({ children, onClose, accent }: ModalProps) {
  const borderClass = accent === 'red' ? 'border-red-500/50' : 'border-brand-gold/50';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.75)',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={
          'relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-brand-card shadow-2xl ' +
          'max-h-[min(85vh,640px)] ' +
          borderClass
        }
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-base font-bold text-white active:bg-white/25"
        >
          ✕
        </button>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-12 sm:px-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function AlertBanner({ ok, msg, onDismiss }: { ok: boolean; msg: string; onDismiss: () => void }) {
  return (
    <div
      className={
        'mt-3 rounded-xl border p-3 ' +
        (ok ? 'border-brand-green/40 bg-brand-green/10' : 'border-brand-gold/40 bg-brand-gold/10')
      }
    >
      <p
        className={
          'text-center text-sm font-medium ' + (ok ? 'text-brand-green' : 'text-brand-gold')
        }
      >
        {msg}
      </p>
      {ok ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 min-h-[40px] w-full rounded-lg border border-brand-green/50 bg-brand-green/20 py-2 text-sm font-semibold text-brand-green active:scale-[0.98]"
        >
          Close
        </button>
      ) : null}
    </div>
  );
}
