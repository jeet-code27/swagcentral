"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Client-side pagination. The page resets to 1 whenever `resetKey` changes
 * (e.g. when a search or filter changes), without needing an effect.
 */
export function usePagination<T>(items: T[], pageSize: number, resetKey = "") {
  const [state, setState] = useState({ key: resetKey, page: 1 });
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(state.key === resetKey ? state.page : 1, totalPages);
  const start = (page - 1) * pageSize;

  return {
    page,
    totalPages,
    pageItems: items.slice(start, start + pageSize),
    rangeStart: items.length ? start + 1 : 0,
    rangeEnd: Math.min(start + pageSize, items.length),
    setPage: (p: number) => setState({ key: resetKey, page: p }),
  };
}

/** Page numbers to show, with "…" gaps, e.g. 1 … 4 5 6 … 12 */
function pageList(page: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  theme = "light",
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  theme?: "light" | "dark";
}) {
  if (totalPages <= 1) return null;

  const base = "min-w-9 h-9 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition";
  const idle =
    theme === "dark"
      ? "bg-[#0a0f1d] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
      : "bg-white border border-gray-200 text-gray-700 hover:border-[#ff5500] hover:text-[#ff5500]";
  const active = "bg-[#ff5500] border border-[#ff5500] text-white";
  const disabled = "opacity-40 pointer-events-none";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        className={`${base} ${idle} ${page === 1 ? disabled : ""}`}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className={theme === "dark" ? "px-1 text-gray-500" : "px-1 text-gray-400"}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`${base} ${p === page ? active : idle}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        className={`${base} ${idle} ${page === totalPages ? disabled : ""}`}
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
