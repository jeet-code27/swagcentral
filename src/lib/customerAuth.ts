import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/**
 * Passwordless customer login: a 6-digit code is emailed, and a signed cookie keeps
 * the customer signed in to see their orders. Uses its own key and role so a
 * customer session can never be used as an admin session.
 */

const COOKIE_NAME = "swagcentral_customer";
const SESSION_DAYS = 30;

function getCustomerSecret(): string {
  const base = process.env.ADMIN_JWT_SECRET;
  if (!base) throw new Error("ADMIN_JWT_SECRET is not set in the environment");
  return crypto.createHash("sha256").update(`${base}:customer-session`).digest("hex");
}

export function hashLoginCode(email: string, code: string): string {
  return crypto.createHmac("sha256", getCustomerSecret()).update(`${email}:${code}`).digest("hex");
}

export function generateLoginCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function setCustomerSession(email: string) {
  const token = jwt.sign({ email, role: "customer" }, getCustomerSecret(), { expiresIn: `${SESSION_DAYS}d` });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function getCustomerEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getCustomerSecret()) as { email?: string; role?: string };
    return payload.role === "customer" && payload.email ? payload.email : null;
  } catch {
    return null;
  }
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
