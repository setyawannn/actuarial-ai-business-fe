import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: { message: "No refresh token" } }, { status: 401 });
    }

    const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!backendRes.ok) {
      // Refresh failed, clear session
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return NextResponse.json({ success: false, error: { message: "Could not refresh token" } }, { status: 401 });
    }

    const data = await backendRes.json();
    const tokenPayload = data.data || data;

    if (tokenPayload.access_token) {
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
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    return NextResponse.json({ success: true, message: "Token refreshed" });
  } catch (error) {
    console.error("Auth Refresh BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
