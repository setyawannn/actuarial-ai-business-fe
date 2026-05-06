import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await proxyRequest(`/analysis-runs${queryString}`, { method: "GET" });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Analysis Runs BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
