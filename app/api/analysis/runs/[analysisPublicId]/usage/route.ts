import { NextResponse } from "next/server";

/**
 * DEPRECATED: Endpoint GET /api/v1/analysis-runs/{id}/usage telah dihapus dari backend (Week 3 bugfix).
 * Data usage kini hanya tersedia melalui endpoint admin khusus:
 * GET /api/v1/admin/analytics/runs/{id}/usage  →  BFF: /api/admin/analytics/runs/{id}/usage
 *
 * Mengembalikan 410 Gone agar tidak ada request yang menggantung secara diam-diam.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      code: "ENDPOINT_REMOVED",
      message: "Endpoint usage per-run untuk pengguna umum telah dihapus. Gunakan endpoint admin untuk audit trace.",
    },
    { status: 410 }
  );
}
