import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyPayuResponseHash } from "@/lib/payu";
import { applyPayuTransaction } from "@/lib/orderPayment";

/**
 * PayU sends the customer's browser here (surl / furl) after payment with a form POST.
 * We confirm the result with PayU's server, update the order, then redirect to the order page.
 */
export async function POST(req: NextRequest) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, "");
  const redirectTo = (path: string) => NextResponse.redirect(`${appUrl}${path}`, 303);

  let data: Record<string, string> = {};
  try {
    const form = await req.formData();
    data = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  } catch {
    return redirectTo("/checkout?payment=error");
  }

  if (!data.txnid) return redirectTo("/checkout?payment=error");
  if (!verifyPayuResponseHash(data)) {
    // Not trusted on its own; the server-to-server verification below decides the outcome
    console.warn(`PayU callback hash mismatch for ${data.txnid}`);
  }

  const conn = await connectDB();
  if (!conn) return redirectTo("/checkout?payment=error");

  try {
    const { outcome, order } = await applyPayuTransaction(data.txnid);
    if (!order) return redirectTo("/checkout?payment=error");
    return redirectTo(`/download/${order.downloadToken}?payment=${outcome}`);
  } catch (error) {
    console.error("PayU callback error:", error);
    return redirectTo("/checkout?payment=error");
  }
}
