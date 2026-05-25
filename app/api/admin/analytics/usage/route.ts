import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const userId = url.searchParams.get("user_id");

    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (userId) params.set("user_id", userId);
    const qs = params.toString();
    const queryString = qs ? "?" + qs : "";

    const res = await proxyRequest(`/admin/analytics/usage${queryString}`, { method: "GET" });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Usage BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
