/**
 * Meta (Facebook) Pixel helpers. The base code is loaded by <MetaPixel /> in the root layout;
 * these helpers send standard events from anywhere in the store and do nothing if the
 * pixel hasn't loaded (e.g. blocked by an ad blocker).
 */
export const META_PIXEL_ID = "2179055282648228";

type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Sends an event to this store's pixel only. ("trackSingle" rather than "track", because Google Tag
 * Manager loads other pixels on the page too, and "track" would send our events to all of them.)
 */
export function trackPixel(event: string, params?: FbqParams, eventId?: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (eventId) window.fbq("trackSingle", META_PIXEL_ID, event, params || {}, { eventID: eventId });
  else window.fbq("trackSingle", META_PIXEL_ID, event, params || {});
}

/** Common product fields Meta uses for ads and catalog matching. */
export function productParams(items: { id: string; price: number; title?: string; quantity?: number }[]) {
  const value = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  return {
    content_type: "product",
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity || 1, item_price: i.price })),
    num_items: items.length,
    value,
    currency: "INR",
  };
}
