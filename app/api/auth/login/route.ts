import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({ message: "Login failed" }));
      return NextResponse.json({ success: false, error: errorData }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    const tokenPayload = data.data || data; // Ensure we handle ApiEnvelope mapping

    if (!tokenPayload.access_token) {
      return NextResponse.json({ success: false, error: { message: "Invalid response from server" } }, { status: 500 });
    }

    const cookieStore = await cookies();
    
    cookieStore.set("access_token", tokenPayload.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: tokenPayload.expires_in || 3600,
    });

    if (tokenPayload.refresh_token) {
      cookieStore.set("refresh_token", tokenPayload.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    // Hanya return success message, jangan pass token ke client
    return NextResponse.json({ success: true, message: "Logged in successfully" });

  } catch (error) {
    console.error("Login BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
