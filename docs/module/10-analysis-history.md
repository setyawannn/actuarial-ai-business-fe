# 10 - Analysis History

## Tujuan
Membangun `/analysis/history` untuk melihat analysis milik user yang sedang login.

## Implementation Checklist
- Fetch internal `GET /api/analysis/runs`.
- BFF route meneruskan ke canonical backend `GET /api/v1/analysis-runs`.
- Render table/list history:
  - company/analysis label bila tersedia
  - analysis goal
  - language
  - status
  - progress
  - scores ringkas
  - created_at
  - completed_at
- Row action membuka `/analysis/[analysisPublicId]` jika public id tersedia dari response/meta.
- Tambahkan loading, empty, error, and unauthorized states.
- Siapkan pagination/filter hanya jika backend envelope mengirim meta pagination.

## Contract Rules
- History hanya caller-owned rows.
- Jangan assume admin bisa melihat analysis user lain.
- Jangan pakai internal database id untuk route detail.
- Jika backend list belum paginated, jangan paksa UI pagination palsu.

## Cache Rules
- Query key: `queryKeys.analysis.history(params)`.
- Recommended stale time: 30 detik.
- Recommended gc time: 10 menit.
- Invalidate history setelah run analysis sukses.

## Acceptance Criteria
- History memakai `GET /api/v1/analysis-runs`.
- Detail navigation memakai `analysis_public_id`.
- Empty state jelas untuk user baru.
- Error menampilkan `message` dan `request_id`.
