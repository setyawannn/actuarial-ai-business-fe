import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await proxyRequest("/analysis/external/run", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Analysis Run BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
