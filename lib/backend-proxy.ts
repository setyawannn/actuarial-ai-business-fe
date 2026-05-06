import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function proxyRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;
  
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  
  // ensure content-type json if not set and body is string
  if (!headers.has("Content-Type") && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (refreshToken) {
      const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const payload = refreshData.data || refreshData;
        
        if (payload.access_token) {
          accessToken = payload.access_token;
          cookieStore.set("access_token", payload.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: payload.expires_in || 3600,
          });
          if (payload.refresh_token) {
            cookieStore.set("refresh_token", payload.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60,
            });
          }

          // Retry the original request
          headers.set("Authorization", `Bearer ${accessToken}`);
          res = await fetch(`${BACKEND_URL}${endpoint}`, {
            ...options,
            headers,
          });
        }
      } else {
        // Clear cookies if refresh failed
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
      }
    } else {
      cookieStore.delete("access_token");
    }
  }

  return res;
}

export async function forwardResponse(res: Response) {
  const status = res.status;
  const contentType = res.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    return NextResponse.json(data, { status });
  }
  
  const text = await res.text();
  return new NextResponse(text, { status, headers: { "Content-Type": contentType || "text/plain" } });
}
