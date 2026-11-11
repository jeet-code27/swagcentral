import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { LoginCode } from "@/models/LoginCode";
import { generateLoginCode, hashLoginCode } from "@/lib/customerAuth";
import { sendLoginCodeEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_WAIT_MS = 60 * 1000;

/**
 * Emails a 6-digit login code. The reply is the same whether or not the email has orders,
 * so nobody can use this to find out who has bought from the store.
 */
export async function POST(req: NextRequest) {
  const { email: rawEmail } = await req.json().catch(() => ({ email: "" }));
  const email = String(rawEmail || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Please try again in a minute" }, { status: 503 });

  const recent = await LoginCode.findOne({ email, createdAt: { $gt: new Date(Date.now() - RESEND_WAIT_MS) } });
  if (recent) {
    return NextResponse.json({ error: "Please wait a minute before asking for a new code" }, { status: 429 });
  }

  const hasOrders = await Order.exists({ customerEmail: email });
  if (hasOrders) {
    const code = generateLoginCode();
    await LoginCode.deleteMany({ email });
    await LoginCode.create({ email, codeHash: hashLoginCode(email, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) });
    const mail = await sendLoginCodeEmail(email, code);
    if (!mail.success) {
      return NextResponse.json({ error: "Could not send the email. Please try again." }, { status: 502 });
    }
  }

  return NextResponse.json({
    success: true,
    message: "If this email has orders with us, a 6-digit code has been sent to it.",
  });
}
