"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpToLine,
  CheckCircle,
  ExternalLink,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cdnImage } from "@/lib/image";
import { formatPrice } from "@/lib/price";
import Pagination, { usePagination } from "@/components/Pagination";

interface AdminProduct {
  _id: string;
  title: string;
  slug: string;
  category: string;
  categoryName?: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  accessUrl?: string;
  pdfFileName?: string;
  status: "active" | "draft";
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  isTrending?: boolean;
}

type Flag = "isBestSeller" | "isNewArrival" | "isOnSale" | "isTrending";

/** Homepage sections a product can be shown in, with one-click toggles. */
const FLAGS: { key: Flag; label: string; on: string }[] = [
  { key: "isBestSeller", label: "Best Seller", on: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { key: "isNewArrival", label: "New Arrival", on: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  { key: "isOnSale", label: "On Sale", on: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { key: "isTrending", label: "Trending", on: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40" },
];

type View = "all" | Flag | "missing" | "draft";

const VIEWS: { key: View; label: string }[] = [
  { key: "all", label: "All" },
  { key: "isBestSeller", label: "Best Sellers" },
  { key: "isNewArrival", label: "New Arrivals" },
  { key: "isOnSale", label: "On Sale" },
  { key: "isTrending", label: "Trending" },
  { key: "missing", label: "No Link" },
  { key: "draft", label: "Drafts" },
];

const hasLink = (p: AdminProduct) => !!(p.accessUrl || p.pdfFileName);

function matchesView(p: AdminProduct, view: View) {
  if (view === "all") return true;
  if (view === "missing") return !hasLink(p);
  if (view === "draft") return p.status === "draft";
  return !!p[view];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("all");
  const [savingOrder, setSavingOrder] = useState(false);
  const [busyFlag, setBusyFlag] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("missing") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView("missing");
    }
    fetch("/api/admin/products", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load products");
        setProducts(data.products);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const flash = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const visible = products.filter(
    (p) =>
      matchesView(p, view) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q))
  );
  const { page, totalPages, pageItems, rangeStart, rangeEnd, setPage } = usePagination(visible, 20, `${search}|${view}`);

  /** Saves a new store order (the whole list, top first). Updates the screen right away. */
  const saveOrder = async (next: AdminProduct[], message: string) => {
    const previous = products;
    setProducts(next);
    setSavingOrder(true);
    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p._id) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Could not save order");
      flash(message);
    } catch (err) {
      setProducts(previous);
      setError((err as Error).message);
    } finally {
      setSavingOrder(false);
    }
  };

  /** Moves a product above/below its neighbour in the list you are looking at. */
  const move = (product: AdminProduct, direction: -1 | 1) => {
    const idx = visible.findIndex((p) => p._id === product._id);
    const neighbour = visible[idx + direction];
    if (!neighbour) return;
    const rest = products.filter((p) => p._id !== product._id);
    const at = rest.findIndex((p) => p._id === neighbour._id);
    rest.splice(direction === -1 ? at : at + 1, 0, product);
    saveOrder(rest, `Moved "${product.title.slice(0, 40)}" ${direction === -1 ? "up" : "down"}`);
  };

  const moveToTop = (product: AdminProduct) => {
    saveOrder([product, ...products.filter((p) => p._id !== product._id)], `"${product.title.slice(0, 40)}" is now first in the store`);
  };

  const toggleFlag = async (product: AdminProduct, flag: Flag) => {
    const value = !product[flag];
    const key = `${product._id}:${flag}`;
    setBusyFlag(key);
    setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, [flag]: value } : p)));
    try {
      const res = await fetch(`/api/admin/products/${product._id}/flags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: value }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Could not update");
    } catch (err) {
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, [flag]: !value } : p)));
      setError((err as Error).message);
    } finally {
      setBusyFlag(null);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-xl md:text-2xl text-white tracking-tight uppercase">Products</h1>
          <p className="text-xs text-gray-400 mt-1">
            The order here is the order in your store. Use the arrows to move products, and the tags to show them in
            homepage sections.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Product</span>
        </Link>
      </div>

      {/* Views + search */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
          {VIEWS.map(({ key, label }) => {
            const count = products.filter((p) => matchesView(p, key)).length;
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition border ${
                  active ? "bg-[#ff5500] border-[#ff5500] text-white" : "bg-[#131b2e] border-gray-800 text-gray-300 hover:border-gray-600"
                }`}
              >
                {label}
                <span className={`min-w-5 px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-white/25" : "bg-gray-800"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131b2e] border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {(notice || savingOrder) && (
        <div className="sticky top-3 z-20 p-3 rounded-xl text-xs flex items-center gap-2 border shadow-lg bg-emerald-950 text-emerald-200 border-emerald-800">
          {savingOrder ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {savingOrder ? "Saving order..." : notice}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={14} /> <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#ff5500]" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-[#131b2e] border border-gray-800 rounded-2xl p-10 text-center text-sm text-gray-400">
          No products here.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] text-gray-500 px-1">
            Showing {rangeStart}–{rangeEnd} of {visible.length}
          </p>
          <ul className="space-y-2">
            {pageItems.map((prod) => {
              const position = products.findIndex((p) => p._id === prod._id) + 1;
              const visibleIdx = visible.findIndex((p) => p._id === prod._id);
              return (
                <li
                  key={prod._id}
                  className="bg-[#131b2e] border border-gray-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-3"
                >
                  {/* Order controls + product */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => move(prod, -1)}
                        disabled={savingOrder || visibleIdx === 0}
                        className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-25"
                        title="Move up"
                        aria-label="Move up"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <span className="text-[10px] font-mono text-gray-500 w-6 text-center">{position}</span>
                      <button
                        onClick={() => move(prod, 1)}
                        disabled={savingOrder || visibleIdx === visible.length - 1}
                        className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-25"
                        title="Move down"
                        aria-label="Move down"
                      >
                        <ArrowDown size={15} />
                      </button>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cdnImage(prod.thumbnail, 120)}
                      alt=""
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-contain bg-gray-950 border border-gray-800 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${prod._id}`}
                        className="text-xs sm:text-sm font-semibold text-white hover:text-[#ff7a33] line-clamp-2"
                      >
                        {prod.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px]">
                        <span className="font-bold text-[#ff7a33]">{formatPrice(prod.price)}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="text-gray-500 line-through">{formatPrice(prod.originalPrice)}</span>
                        )}
                        <span className="text-gray-500">· {prod.categoryName || prod.category}</span>
                        {prod.status === "draft" && (
                          <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 font-bold">DRAFT</span>
                        )}
                        {hasLink(prod) ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-400">
                            <CheckCircle size={11} /> Link
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-amber-400">
                            <AlertTriangle size={11} /> No link
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section toggles */}
                  <div className="flex flex-wrap gap-1.5 md:w-[260px] md:justify-end">
                    {FLAGS.map(({ key, label, on }) => {
                      const active = !!prod[key];
                      return (
                        <button
                          key={key}
                          onClick={() => toggleFlag(prod, key)}
                          disabled={busyFlag === `${prod._id}:${key}`}
                          aria-pressed={active}
                          title={active ? `Remove from ${label}` : `Add to ${label}`}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            active ? on : "bg-transparent text-gray-500 border-gray-700 hover:text-gray-300 hover:border-gray-500"
                          }`}
                        >
                          {active ? "✓ " : "+ "}
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 md:flex-shrink-0 border-t border-gray-800 pt-2 md:border-0 md:pt-0">
                    <button
                      onClick={() => moveToTop(prod)}
                      disabled={savingOrder || position === 1}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-30"
                      title="Show first in the store"
                    >
                      <ArrowUpToLine size={14} /> Top
                    </button>
                    <Link
                      href={`/admin/products/${prod._id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                      title="View details"
                    >
                      <Eye size={15} />
                    </Link>
                    <Link
                      href={`/admin/products/${prod._id}/edit`}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#ff7a33] hover:bg-gray-800"
                      title="Edit product"
                    >
                      <Pencil size={15} />
                    </Link>
                    <Link
                      href={`/product/${prod.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                      title="View in store"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
}
