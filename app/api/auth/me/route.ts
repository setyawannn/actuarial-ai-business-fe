import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const backendRes = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!backendRes.ok) {
      // If token expired, could attempt to refresh here or let client use /api/auth/refresh
      const errorData = await backendRes.json().catch(() => ({ message: "Unauthorized" }));
      return NextResponse.json({ success: false, error: errorData }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data); // returns user object wrapped in ApiEnvelope

  } catch (error) {
    console.error("Auth Me BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
