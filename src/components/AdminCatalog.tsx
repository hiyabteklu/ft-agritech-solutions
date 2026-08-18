'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  fetchCatalogAdmin,
  type CatalogType,
  type DbProblem,
  type DbProduct,
  type DbSector,
} from '@/lib/catalog';

type SubTab = 'products' | 'problems' | 'sectors';

const STATUS_PRESETS = [
  'Ready to Deploy',
  'In Stock',
  'Global Sourcing',
  'Special Order',
  'Coming Soon',
  'Discontinued',
];

function emptyProduct(sectorId: string, catalogType: CatalogType): Partial<DbProduct> {
  return {
    sector_id: sectorId,
    catalog_type: catalogType,
    name: '',
    solves: '',
    price: '',
    rating: '4.5/5',
    status: 'In Stock',
    description: '',
    image_path: '',
    sort_order: 0,
    published: true,
  };
}

function emptyProblem(sectorId: string): Partial<DbProblem> {
  return { sector_id: sectorId, title: '', body: '', sort_order: 0 };
}

function emptySector(): Partial<DbSector> {
  return {
    slug: '',
    code: '',
    title: '',
    subtitle: '',
    scope: '',
    img_prefix: '',
    keywords: '',
    image: '/assets/images/cat1.jpg',
    sort_order: 99,
    published: true,
  };
}

export default function AdminCatalog({ onToast }: { onToast: (msg: string) => void }) {
  const [sub, setSub] = useState('products' as SubTab);
  const [sectors, setSectors] = useState([] as DbSector[]);
  const [problems, setProblems] = useState([] as DbProblem[]);
  const [products, setProducts] = useState([] as DbProduct[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [catalogFilter, setCatalogFilter] = useState('all');
  const [busy, setBusy] = useState('');

  const [editProduct, setEditProduct] = useState(null as (Partial<DbProduct> & { id?: string }) | null);
  const [editProblem, setEditProblem] = useState(null as (Partial<DbProblem> & { id?: string }) | null);
  const [editSector, setEditSector] = useState(null as (Partial<DbSector> & { id?: string }) | null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const data = await fetchCatalogAdmin();
    if (data.error) setError(data.error);
    setSectors(data.sectors);
    setProblems(data.problems);
    setProducts(data.products);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sectorMap = useMemo(() => {
    const m: Record<string, DbSector> = {};
    sectors.forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [sectors]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (sectorFilter !== 'all' && p.sector_id !== sectorFilter) return false;
      if (catalogFilter !== 'all' && p.catalog_type !== catalogFilter) return false;
      return true;
    });
  }, [products, sectorFilter, catalogFilter]);

  const filteredProblems = useMemo(() => {
    if (sectorFilter === 'all') return problems;
    return problems.filter((p) => p.sector_id === sectorFilter);
  }, [problems, sectorFilter]);

  const saveProduct = async () => {
    if (!editProduct) return;
    if (!editProduct.name?.trim()) {
      onToast('Product name is required');
      return;
    }
    if (!editProduct.sector_id) {
      onToast('Select a category');
      return;
    }
    setBusy('product');
    const payload = {
      sector_id: editProduct.sector_id,
      catalog_type: (editProduct.catalog_type || 'local') as CatalogType,
      name: editProduct.name.trim(),
      solves: (editProduct.solves || '').trim(),
      price: (editProduct.price || '').trim(),
      rating: (editProduct.rating || '4.5/5').trim(),
      status: (editProduct.status || 'In Stock').trim(),
      description: (editProduct.description || '').trim(),
      image_path: (editProduct.image_path || '').trim(),
      sort_order: Number(editProduct.sort_order) || 0,
      published: editProduct.published !== false,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (editProduct.id) {
      ({ error: err } = await supabase.from('products').update(payload).eq('id', editProduct.id));
    } else {
      ({ error: err } = await supabase.from('products').insert([payload]));
    }
    setBusy('');
    if (err) {
      onToast('Save failed: ' + err.message);
      return;
    }
    onToast(editProduct.id ? 'Product updated' : 'Product added');
    setEditProduct(null);
    await load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    setBusy(id);
    const { error: err } = await supabase.from('products').delete().eq('id', id);
    setBusy('');
    if (err) {
      onToast('Delete failed: ' + err.message);
      return;
    }
    onToast('Product deleted');
    await load();
  };

  const saveProblem = async () => {
    if (!editProblem) return;
    if (!editProblem.title?.trim()) {
      onToast('Problem title is required');
      return;
    }
    if (!editProblem.sector_id) {
      onToast('Select a category');
      return;
    }
    setBusy('problem');
    const payload = {
      sector_id: editProblem.sector_id,
      title: editProblem.title.trim(),
      body: (editProblem.body || '').trim(),
      sort_order: Number(editProblem.sort_order) || 0,
    };
    let err;
    if (editProblem.id) {
      ({ error: err } = await supabase.from('sector_problems').update(payload).eq('id', editProblem.id));
    } else {
      ({ error: err } = await supabase.from('sector_problems').insert([payload]));
    }
    setBusy('');
    if (err) {
      onToast('Save failed: ' + err.message);
      return;
    }
    onToast(editProblem.id ? 'Problem updated' : 'Problem added');
    setEditProblem(null);
    await load();
  };

  const deleteProblem = async (id: string) => {
    if (!confirm('Delete this problem?')) return;
    setBusy(id);
    const { error: err } = await supabase.from('sector_problems').delete().eq('id', id);
    setBusy('');
    if (err) {
      onToast('Delete failed: ' + err.message);
      return;
    }
    onToast('Problem deleted');
    await load();
  };

  const saveSector = async () => {
    if (!editSector) return;
    if (!editSector.title?.trim() || !editSector.slug?.trim()) {
      onToast('Title and slug are required');
      return;
    }
    const slug = editSector.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '');
    setBusy('sector');
    const payload = {
      slug,
      code: (editSector.code || '').trim(),
      title: editSector.title.trim(),
      subtitle: (editSector.subtitle || '').trim(),
      scope: (editSector.scope || '').trim(),
      img_prefix: (editSector.img_prefix || '').trim(),
      keywords: (editSector.keywords || '').trim(),
      image: (editSector.image || '').trim(),
      sort_order: Number(editSector.sort_order) || 0,
      published: editSector.published !== false,
      updated_at: new Date().toISOString(),
    };
    let err;
    if (editSector.id) {
      ({ error: err } = await supabase.from('sectors').update(payload).eq('id', editSector.id));
    } else {
      ({ error: err } = await supabase.from('sectors').insert([payload]));
    }
    setBusy('');
    if (err) {
      onToast('Save failed: ' + err.message);
      return;
    }
    onToast(editSector.id ? 'Category updated' : 'Category added');
    setEditSector(null);
    await load();
  };

  const deleteSector = async (id: string) => {
    if (
      !confirm(
        'Delete this category and ALL its products & problems? This cannot be undone.'
      )
    )
      return;
    setBusy(id);
    const { error: err } = await supabase.from('sectors').delete().eq('id', id);
    setBusy('');
    if (err) {
      onToast('Delete failed: ' + err.message);
      return;
    }
    onToast('Category deleted');
    await load();
  };

  const defaultSectorId =
    sectorFilter !== 'all' ? sectorFilter : sectors[0]?.id || '';

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-400">
          Manage categories, field problems, and products (local / imported).
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="min-h-[40px] rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Reload catalog'}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-4 text-sm text-brand-gold">
          <p className="font-semibold">Catalog load error</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs text-gray-400">
            Run <code className="text-brand-gold">supabase-catalog.sql</code> in the Supabase SQL Editor, then sign in as admin and reload.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1 border-b border-white/10 pb-px">
        {(
          [
            { id: 'products' as SubTab, label: 'Products', n: products.length },
            { id: 'problems' as SubTab, label: 'Problems', n: problems.length },
            { id: 'sectors' as SubTab, label: 'Categories', n: sectors.length },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSub(t.id)}
            className={
              'min-h-[40px] shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ' +
              (sub === t.id
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-400 hover:text-white')
            }
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 text-xs tabular-nums">{t.n}</span>
          </button>
        ))}
      </div>

      {(sub === 'products' || sub === 'problems') && sectors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="min-h-[40px] rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-brand-gold"
          >
            <option value="all">All categories</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? s.code + ' · ' : ''}{s.title}
              </option>
            ))}
          </select>
          {sub === 'products' ? (
            <select
              value={catalogFilter}
              onChange={(e) => setCatalogFilter(e.target.value)}
              className="min-h-[40px] rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-brand-gold"
            >
              <option value="all">Local + Imported</option>
              <option value="local">Local only</option>
              <option value="imported">Imported only</option>
            </select>
          ) : null}
        </div>
      ) : null}

      {/* ── Products ── */}
      {sub === 'products' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              setEditProduct(
                emptyProduct(
                  defaultSectorId,
                  catalogFilter === 'imported' ? 'imported' : 'local'
                )
              )
            }
            disabled={!sectors.length}
            className="min-h-[44px] rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 disabled:opacity-40"
          >
            + Add product
          </button>

          {loading ? (
            <p className="py-10 text-center text-gray-500">Loading products…</p>
          ) : !filteredProducts.length ? (
            <p className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-gray-500">
              No products yet. Add one or run the seed SQL.
            </p>
          ) : (
            filteredProducts.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-brand-green bg-brand-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white">{p.name}</h3>
                    <p className="mt-0.5 text-sm text-gray-400">
                      {sectorMap[p.sector_id]?.title || '—'} ·{' '}
                      <span className={p.catalog_type === 'local' ? 'text-brand-green' : 'text-blue-400'}>
                        {p.catalog_type}
                      </span>
                      {' · '}{p.price}
                      {!p.published ? (
                        <span className="ml-2 text-brand-gold">· hidden</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Solves: {p.solves || '—'} · {p.status} · ⭐ {p.rating}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditProduct({ ...p })}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy === p.id}
                      onClick={() => deleteProduct(p.id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* ── Problems ── */}
      {sub === 'problems' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setEditProblem(emptyProblem(defaultSectorId))}
            disabled={!sectors.length}
            className="min-h-[44px] rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-40"
          >
            + Add problem
          </button>

          {loading ? (
            <p className="py-10 text-center text-gray-500">Loading…</p>
          ) : !filteredProblems.length ? (
            <p className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-gray-500">
              No problems for this filter.
            </p>
          ) : (
            filteredProblems.map((pr) => (
              <article
                key={pr.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-red-500 bg-brand-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-red-400">{pr.title}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {sectorMap[pr.sector_id]?.title || '—'}
                    </p>
                    <p className="mt-2 text-sm text-gray-300">{pr.body}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditProblem({ ...pr })}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy === pr.id}
                      onClick={() => deleteProblem(pr.id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* ── Sectors ── */}
      {sub === 'sectors' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setEditSector(emptySector())}
            className="min-h-[44px] rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-black hover:opacity-90"
          >
            + Add category
          </button>

          {loading ? (
            <p className="py-10 text-center text-gray-500">Loading…</p>
          ) : !sectors.length ? (
            <p className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-gray-500">
              No categories. Run supabase-catalog.sql to seed, or add one here.
            </p>
          ) : (
            sectors.map((s) => (
              <article
                key={s.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-brand-gold bg-brand-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {s.code ? s.code + ' | ' : ''}{s.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-400">
                      /{s.slug} · order {s.sort_order}
                      {!s.published ? <span className="ml-2 text-brand-gold">· unpublished</span> : null}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{s.subtitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditSector({ ...s })}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy === s.id}
                      onClick={() => deleteSector(s.id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Product modal */}
      {editProduct ? (
        <FormModal
          title={editProduct.id ? 'Edit product' : 'Add product'}
          onClose={() => setEditProduct(null)}
          onSave={saveProduct}
          busy={busy === 'product'}
        >
          <Field label="Category">
            <select
              value={editProduct.sector_id || ''}
              onChange={(e) => setEditProduct({ ...editProduct, sector_id: e.target.value })}
              className="field"
            >
              <option value="">Select…</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory (catalog)">
            <select
              value={editProduct.catalog_type || 'local'}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  catalog_type: e.target.value as CatalogType,
                })
              }
              className="field"
            >
              <option value="local">Locally Developed</option>
              <option value="imported">Imported Solutions</option>
            </select>
          </Field>
          <Field label="Name">
            <input
              className="field"
              value={editProduct.name || ''}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              placeholder="Smart-Temp Hive Node v1"
            />
          </Field>
          <Field label="Solves (problem name)">
            <input
              className="field"
              value={editProduct.solves || ''}
              onChange={(e) => setEditProduct({ ...editProduct, solves: e.target.value })}
              placeholder="Micro-Climate Volatility"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Price">
              <input
                className="field"
                value={editProduct.price || ''}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                placeholder="4,200 ETB"
              />
            </Field>
            <Field label="Rating">
              <input
                className="field"
                value={editProduct.rating || ''}
                onChange={(e) => setEditProduct({ ...editProduct, rating: e.target.value })}
                placeholder="4.9/5"
              />
            </Field>
          </div>
          <Field label="Status">
            <select
              className="field"
              value={editProduct.status || 'In Stock'}
              onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value })}
            >
              {STATUS_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description / specifications">
            <textarea
              className="field"
              rows={3}
              value={editProduct.description || ''}
              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              placeholder="Technical description…"
            />
          </Field>
          <Field label="Image path (optional)">
            <input
              className="field"
              value={editProduct.image_path || ''}
              onChange={(e) => setEditProduct({ ...editProduct, image_path: e.target.value })}
              placeholder="/assets/images/my_product.jpg"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Sort order">
              <input
                className="field"
                type="number"
                value={editProduct.sort_order ?? 0}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, sort_order: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Published">
              <select
                className="field"
                value={editProduct.published === false ? 'no' : 'yes'}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, published: e.target.value === 'yes' })
                }
              >
                <option value="yes">Yes (visible)</option>
                <option value="no">No (hidden)</option>
              </select>
            </Field>
          </div>
        </FormModal>
      ) : null}

      {/* Problem modal */}
      {editProblem ? (
        <FormModal
          title={editProblem.id ? 'Edit problem' : 'Add problem'}
          onClose={() => setEditProblem(null)}
          onSave={saveProblem}
          busy={busy === 'problem'}
          accent="red"
        >
          <Field label="Category">
            <select
              value={editProblem.sector_id || ''}
              onChange={(e) => setEditProblem({ ...editProblem, sector_id: e.target.value })}
              className="field"
            >
              <option value="">Select…</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title">
            <input
              className="field"
              value={editProblem.title || ''}
              onChange={(e) => setEditProblem({ ...editProblem, title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="field"
              rows={4}
              value={editProblem.body || ''}
              onChange={(e) => setEditProblem({ ...editProblem, body: e.target.value })}
            />
          </Field>
          <Field label="Sort order">
            <input
              className="field"
              type="number"
              value={editProblem.sort_order ?? 0}
              onChange={(e) =>
                setEditProblem({ ...editProblem, sort_order: Number(e.target.value) })
              }
            />
          </Field>
        </FormModal>
      ) : null}

      {/* Sector modal */}
      {editSector ? (
        <FormModal
          title={editSector.id ? 'Edit category' : 'Add category'}
          onClose={() => setEditSector(null)}
          onSave={saveSector}
          busy={busy === 'sector'}
          accent="gold"
        >
          <div className="grid grid-cols-2 gap-2">
            <Field label="Code (e.g. 01)">
              <input
                className="field"
                value={editSector.code || ''}
                onChange={(e) => setEditSector({ ...editSector, code: e.target.value })}
              />
            </Field>
            <Field label="Slug (url)">
              <input
                className="field"
                value={editSector.slug || ''}
                onChange={(e) => setEditSector({ ...editSector, slug: e.target.value })}
                placeholder="apiculture"
              />
            </Field>
          </div>
          <Field label="Title">
            <input
              className="field"
              value={editSector.title || ''}
              onChange={(e) => setEditSector({ ...editSector, title: e.target.value })}
            />
          </Field>
          <Field label="Subtitle">
            <input
              className="field"
              value={editSector.subtitle || ''}
              onChange={(e) => setEditSector({ ...editSector, subtitle: e.target.value })}
            />
          </Field>
          <Field label="Scope / background">
            <textarea
              className="field"
              rows={4}
              value={editSector.scope || ''}
              onChange={(e) => setEditSector({ ...editSector, scope: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Image prefix">
              <input
                className="field"
                value={editSector.img_prefix || ''}
                onChange={(e) => setEditSector({ ...editSector, img_prefix: e.target.value })}
                placeholder="api"
              />
            </Field>
            <Field label="Keywords">
              <input
                className="field"
                value={editSector.keywords || ''}
                onChange={(e) => setEditSector({ ...editSector, keywords: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Cover image path">
            <input
              className="field"
              value={editSector.image || ''}
              onChange={(e) => setEditSector({ ...editSector, image: e.target.value })}
              placeholder="/assets/images/cat1.jpg"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Sort order">
              <input
                className="field"
                type="number"
                value={editSector.sort_order ?? 0}
                onChange={(e) =>
                  setEditSector({ ...editSector, sort_order: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Published">
              <select
                className="field"
                value={editSector.published === false ? 'no' : 'yes'}
                onChange={(e) =>
                  setEditSector({ ...editSector, published: e.target.value === 'yes' })
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
          </div>
        </FormModal>
      ) : null}

      <style jsx global>{`
        .field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        .field:focus {
          border-color: #d4af37;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-2.5 block text-left">
      <span className="mb-1 block text-xs text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function FormModal({
  title,
  children,
  onClose,
  onSave,
  busy,
  accent = 'green',
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  busy: boolean;
  accent?: 'green' | 'red' | 'gold';
}) {
  const btn =
    accent === 'red'
      ? 'bg-red-600 text-white'
      : accent === 'gold'
        ? 'bg-brand-gold text-black'
        : 'bg-brand-green text-black';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-brand-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
        <div className="flex gap-2 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] flex-1 rounded-xl border border-white/20 py-2.5 text-sm font-semibold text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className={'min-h-[44px] flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 ' + btn}
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
