"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import {
  Card,
  ErrorState,
  Field,
  LoadingState,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/admin/AdminUI";

interface CouponRow {
  _id: string;
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  maxDiscount: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  featured: boolean;
  expiresAt?: string;
}

interface CouponForm {
  code: string;
  description: string;
  type: "percent" | "flat";
  value: string;
  maxDiscount: string;
  minOrder: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
  featured: boolean;
}

const emptyForm: CouponForm = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  maxDiscount: "",
  minOrder: "",
  usageLimit: "",
  expiresAt: "",
  active: true,
  featured: false,
};

function describe(c: CouponRow) {
  const off = c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`;
  const parts = [off];
  if (c.type === "percent" && c.maxDiscount > 0) parts.push(`max ₹${c.maxDiscount}`);
  if (c.minOrder > 0) parts.push(`min order ₹${c.minOrder}`);
  return parts.join(" · ");
}

const isExpired = (c: CouponRow) => !!c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load coupons");
      setCoupons(data.coupons);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const set = <K extends keyof CouponForm>(key: K, value: CouponForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (c: CouponRow) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      description: c.description || "",
      type: c.type,
      value: String(c.value),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
      minOrder: c.minOrder ? String(c.minOrder) : "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "",
      active: c.active,
      featured: c.featured,
    });
    setFormError("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      const res = await fetch(editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save coupon");
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: CouponRow, field: "active" | "featured") => {
    const res = await fetch(`/api/admin/coupons/${c._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !c[field] }),
    });
    if (res.ok) load();
  };

  const remove = async (c: CouponRow) => {
    if (!confirm(`Delete coupon ${c.code}? Customers will no longer be able to use it.`)) return;
    const res = await fetch(`/api/admin/coupons/${c._id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-xl md:text-2xl text-white tracking-tight uppercase">Coupons</h1>
          <p className="text-xs text-gray-400 mt-1">
            Discount codes customers can apply at checkout. The <Star size={11} className="inline text-yellow-400" />{" "}
            featured coupon is shown on the homepage.
          </p>
        </div>
        {!formOpen && (
          <button onClick={openNew} className={primaryButton}>
            <Plus size={14} /> New Coupon
          </button>
        )}
      </div>

      {formOpen && (
        <Card title={editingId ? `Edit ${form.code}` : "New Coupon"}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Code" required hint="Letters and numbers, e.g. WELCOME10">
                <input
                  required
                  value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  className={inputClass + " uppercase font-mono"}
                />
              </Field>
              <Field label="Short description" hint="Shown on the homepage banner">
                <input value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Discount type">
                <select value={form.type} onChange={(e) => set("type", e.target.value as CouponForm["type"])} className={inputClass}>
                  <option value="percent">% off</option>
                  <option value="flat">₹ off</option>
                </select>
              </Field>
              <Field label={form.type === "percent" ? "Percent off" : "₹ off"} required>
                <input
                  required
                  type="number"
                  min="1"
                  max={form.type === "percent" ? 90 : undefined}
                  value={form.value}
                  onChange={(e) => set("value", e.target.value)}
                  className={inputClass}
                />
              </Field>
              {form.type === "percent" && (
                <Field label="Max ₹ off" hint="Empty = no cap">
                  <input type="number" min="0" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} className={inputClass} />
                </Field>
              )}
              <Field label="Min order ₹" hint="Empty = any amount">
                <input type="number" min="0" value={form.minOrder} onChange={(e) => set("minOrder", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Usage limit" hint="Empty = unlimited">
                <input type="number" min="0" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Expires on" hint="Empty = never">
                <input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="accent-[#ff5500]" />
                Active (customers can use it)
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[#ff5500]" />
                Show on homepage
              </label>
            </div>
            {formError && <ErrorState message={formError} />}
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className={primaryButton}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {editingId ? "Save Changes" : "Create Coupon"}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className={secondaryButton}>
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {error && <ErrorState message={error} />}
      {!coupons && !error ? (
        <LoadingState />
      ) : coupons && coupons.length === 0 ? (
        <div className="bg-[#131b2e] border border-gray-800 rounded-2xl p-10 text-center text-sm text-gray-400">
          No coupons yet. Create one to offer discounts at checkout.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(coupons || []).map((c) => {
            const expired = isExpired(c);
            const usedUp = c.usageLimit > 0 && c.usedCount >= c.usageLimit;
            const live = c.active && !expired && !usedUp;
            return (
              <div key={c._id} className="bg-[#131b2e] border border-gray-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-white tracking-wider">{c.code}</span>
                      {c.featured && <Star size={15} className="text-yellow-400 fill-yellow-400" aria-label="Featured" />}
                    </div>
                    <p className="text-xs text-[#ff7a33] font-semibold mt-0.5">{describe(c)}</p>
                    {c.description && <p className="text-[11px] text-gray-400 mt-1">{c.description}</p>}
                  </div>
                  <span
                    className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border ${
                      live
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-gray-500/15 text-gray-400 border-gray-600/40"
                    }`}
                  >
                    {live ? "LIVE" : expired ? "EXPIRED" : usedUp ? "USED UP" : "OFF"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Used {c.usedCount}
                  {c.usageLimit > 0 ? ` / ${c.usageLimit}` : ""} times
                  {c.expiresAt && ` · expires ${new Date(c.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={() => toggle(c, "active")} className={secondaryButton}>
                    {c.active ? "Turn Off" : "Turn On"}
                  </button>
                  <button onClick={() => toggle(c, "featured")} className={secondaryButton}>
                    <Star size={13} /> {c.featured ? "Hide from Home" : "Show on Home"}
                  </button>
                  <button onClick={() => openEdit(c)} className={secondaryButton}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => remove(c)} className={secondaryButton + " text-red-300"} aria-label={`Delete ${c.code}`}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
