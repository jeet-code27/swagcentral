import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { applyPayuTransaction } from "@/lib/orderPayment";

/**
 * PayU server-to-server webhook (set in PayU Dashboard > Developer > Webhooks).
 * Catches payments where the customer closed the browser before returning to the site.
 * The payload is only used to find the transaction; its status is re-checked with PayU.
 */
export async function POST(req: NextRequest) {
  let txnid = "";
  try {
    const type = req.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      const json = await req.json();
      txnid = String(json.txnid || json.merchantTransactionId || "");
    } else {
      const form = await req.formData();
      txnid = String(form.get("txnid") || form.get("merchantTransactionId") || "");
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!txnid) return NextResponse.json({ error: "txnid missing" }, { status: 400 });

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  try {
    const { outcome } = await applyPayuTransaction(txnid);
    return NextResponse.json({ received: true, outcome });
  } catch (error) {
    console.error("PayU webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
