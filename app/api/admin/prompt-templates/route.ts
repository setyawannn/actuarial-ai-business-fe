import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await proxyRequest(`/prompt-templates${queryString}`, { method: "GET" });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Templates GET error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await proxyRequest("/prompt-templates", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Templates POST error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
