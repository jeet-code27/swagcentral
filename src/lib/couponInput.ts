const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
};

/** Validates the admin coupon form. */
export function parseCouponInput(body: Record<string, unknown>) {
  const code = String(body.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const type = body.type === "flat" ? "flat" : "percent";
  const value = num(body.value);
  if (code.length < 3) return { error: "Code must be at least 3 letters or numbers" } as const;
  if (value <= 0) return { error: "Enter a discount greater than 0" } as const;
  if (type === "percent" && value > 90) return { error: "Percent discount can be at most 90%" } as const;

  const expires = String(body.expiresAt || "").trim();
  const expiresAt = expires ? new Date(`${expires}T23:59:59+05:30`) : undefined;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return { error: "Enter a valid expiry date" } as const;

  return {
    data: {
      code,
      type: type as "percent" | "flat",
      value,
      description: String(body.description || "").trim().slice(0, 200),
      maxDiscount: Math.max(num(body.maxDiscount), 0),
      minOrder: Math.max(num(body.minOrder), 0),
      usageLimit: Math.max(Math.round(num(body.usageLimit)), 0),
      active: body.active !== false,
      featured: body.featured === true,
      expiresAt,
    },
  };
}
