# 06 - Analysis Request Form

## Tujuan
Membangun `/analysis/new` untuk menjalankan external company analysis sesuai kontrak backend.

## Implementation Checklist
- Buat form dengan React Hook Form, Zod, dan shadcn/ui Form.
- Required fields:
  - `company_name`
  - `country`
  - `industry`
  - `analysis_goal`
  - `language`
- Optional fields:
  - `legal_entity`
  - `location`
  - `ticker`
  - `website`
  - `company_type`
  - `target_context.currency`
  - `target_context.notes`
- Enum goal:
  - `business_health`
  - `acquisition_risk`
  - `investment_risk`
  - `competitor_analysis`
  - `vendor_risk`
  - `market_entry`
  - `partnership_risk`
- Submit ke internal `POST /api/analysis/external/run`.
- Setelah sukses, baca `data.analysis_public_id`.
- Prefill TanStack Query cache untuk report, sources, dan overview/detail yang kompatibel.
- Invalidate history.
- Redirect ke `/analysis/${analysisPublicId}`.

## Cache Rules
- Jangan refetch report langsung setelah submit sukses.
- Simpan response run ke cache berdasarkan `analysis_public_id`.
- Mutation retry `0`.
- Tampilkan progress/loading state yang jelas karena endpoint synchronous bisa lama.

## Error Rules
- Tampilkan backend `message`.
- Tampilkan first field/global error bila ada.
- Tampilkan `meta.request_id`.
- Validation error frontend harus muncul dekat field terkait.

## Acceptance Criteria
- Payload sesuai `ExternalAnalysisRequest`.
- Success redirect memakai `analysis_public_id`, bukan internal id.
- Result response langsung tersedia untuk overview tanpa fetch berlebih.
- Form aman untuk empty optional field dan URL kosong.
