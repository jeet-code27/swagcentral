import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, setAdminSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword) {
      console.error("ADMIN_EMAIL / ADMIN_PASSWORD are not set in the environment");
      return NextResponse.json({ error: "Admin login is not configured" }, { status: 500 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (
      email.toLowerCase().trim() !== expectedEmail.toLowerCase().trim() ||
      password !== expectedPassword
    ) {
      return NextResponse.json(
        { error: "Invalid Super Admin credentials" },
        { status: 401 }
      );
    }

    // Generate signed JWT token
    const token = signAdminToken(email);

    // Save token in secure HTTP-only cookie
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      token,
      admin: {
        email: expectedEmail,
        role: "super_admin",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Login failed" },
      { status: 500 }
    );
  }
}
