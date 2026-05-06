# 13 - Testing Quality and Contract Checklist

## Tujuan
Menentukan quality gate sebelum module dianggap selesai dan aman dilanjutkan.

## Implementation Checklist
- Jalankan:
  - `bun run typecheck`
  - `bun run lint`
  - `bun run build`
- Tambahkan test unit untuk mapper dan helper penting:
  - envelope parsing
  - `ApiClientError`
  - query keys
  - analysis overview view model
  - forecast qualitative confidence logic
  - source/data gap key builders
- Tambahkan route handler tests bila test setup tersedia:
  - attach Bearer token
  - refresh-on-401 retry once
  - failed refresh clears cookies
  - error envelope passthrough
- Tambahkan UI smoke scenario:
  - login success
  - protected redirect when unauthenticated
  - run analysis success redirect by `analysis_public_id`
  - overview render score/summary/forecast
  - report markdown display-only
  - sources render without internal id
  - history caller-owned list
  - admin guard

## Contract Checklist
- Browser calls only Next internal API routes.
- JWT stored in httpOnly cookies.
- Refresh-on-401 retries original request once.
- All analysis routes and query keys use `analysis_public_id`.
- History uses canonical `GET /api/v1/analysis-runs`.
- UI cards use `report_summary`.
- Score cards use `scores`.
- Source table uses `sources`.
- Data gap list uses `data_gaps`.
- Full report uses `report_markdown` display-only.
- No markdown parsing for score, badge, summary, forecast, source, or data gaps.
- Forecast qualitative label appears for low/unknown/partial/insufficient confidence.
- Source/data gap render keys use content + index.
- Error UI displays `message`, first error item, and `meta.request_id`.
- `ANALYSIS_NOT_FOUND` renders not found state.
- Admin cannot view another user's analysis.
- No secrets exposed in client bundle.

## Acceptance Criteria
- Typecheck, lint, and build pass.
- Contract checklist fully satisfied.
- Known backend/frontend drift is resolved in frontend types: forecast fields present, source/data gap id optional or ignored for UI keys.
- Manual smoke flow passes on desktop and mobile viewport.
