import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LoginCode } from "@/models/LoginCode";
import { hashLoginCode, setCustomerSession } from "@/lib/customerAuth";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const code = String(body.code || "").replace(/\D/g, "");
  if (!email || code.length !== 6) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email" }, { status: 400 });
  }

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Please try again in a minute" }, { status: 503 });

  const record = await LoginCode.findOne({ email, expiresAt: { $gt: new Date() } });
  if (!record || record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }

  const expected = Buffer.from(record.codeHash);
  const received = Buffer.from(hashLoginCode(email, code));
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    record.attempts += 1;
    await record.save();
    const left = MAX_ATTEMPTS - record.attempts;
    return NextResponse.json(
      { error: left > 0 ? `Wrong code. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong tries. Request a new code." },
      { status: 400 }
    );
  }

  await LoginCode.deleteMany({ email });
  await setCustomerSession(email);
  return NextResponse.json({ success: true });
}
