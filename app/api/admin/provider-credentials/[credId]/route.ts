import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ credId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/admin/provider-credentials/${resolvedParams.credId}`, {
      method: "DELETE",
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Provider Credential DELETE error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
