/** Rupee price for display: "₹499", "₹1,299", "₹49.50" (no ".00" for whole amounts). */
export function formatPrice(value: number): string {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
