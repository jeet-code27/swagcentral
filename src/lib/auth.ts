import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set in the environment");
  }
  return secret;
}
const COOKIE_NAME = "swagcentral_admin_token";

export interface AdminTokenPayload {
  email: string;
  role: "super_admin";
  iat?: number;
  exp?: number;
}

export function signAdminToken(email: string): string {
  return jwt.sign(
    { email, role: "super_admin" },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
    // Only admin tokens grant admin access (customer sessions use a different secret and role)
    return payload.role === "super_admin" ? payload : null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Guard for admin API routes. Returns a 401 response when not signed in.
 */
export async function requireAdmin(): Promise<AdminTokenPayload | Response> {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
