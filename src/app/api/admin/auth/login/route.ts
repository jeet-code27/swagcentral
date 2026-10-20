import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, setAdminSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const expectedEmail = process.env.ADMIN_EMAIL || "swagcentral012@gmail.com";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin@swag2026";

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
