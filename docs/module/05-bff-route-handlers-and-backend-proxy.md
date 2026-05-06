# 05 - BFF Route Handlers and Backend Proxy

## Tujuan
Membuat Next.js route handlers sebagai BFF tunggal antara browser dan FastAPI.

## Implementation Checklist
- Buat backend proxy helper yang membaca `BACKEND_API_BASE_URL`.
- Proxy helper membaca `access_token` dari httpOnly cookie dan attach `Authorization: Bearer <access_token>`.
- Jika backend return 401, jalankan refresh flow:
  1. Call `POST /api/v1/auth/refresh` dengan refresh token.
  2. Jika sukses, update access token cookie.
  3. Retry original request satu kali.
  4. Jika gagal, clear cookies dan return 401.
- Route handler auth:
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Route handler analysis:
  - `POST /api/analysis/external/run`
  - `GET /api/analysis/runs`
  - `GET /api/analysis/runs/[analysisPublicId]`
  - `GET /api/analysis/runs/[analysisPublicId]/report`
  - `GET /api/analysis/runs/[analysisPublicId]/sources`
- Route handler admin:
  - `GET/POST /api/admin/prompt-templates`
  - prompt template detail/version/activate routes
  - `GET/POST /api/admin/provider-configs`
  - `GET/POST /api/admin/provider-credentials`
  - credential rotate/disable routes

## Backend Mapping
- Use canonical backend endpoint `GET /api/v1/analysis-runs` for history.
- Use canonical backend endpoint `GET /api/v1/analysis-runs/{analysis_public_id}` for detail.
- Use compatibility aliases only if backend canonical endpoint is unavailable.

## Error Rules
- Return backend envelope unchanged when possible.
- UI must show `message`, first error item, and `meta.request_id`.
- `ANALYSIS_NOT_FOUND` is not found state, not admin permission state.

## Acceptance Criteria
- Browser code calls only `/api/*` internal routes.
- Proxy retries once after successful refresh.
- Failed refresh clears auth cookies.
- Request body, status code, and error envelope are preserved as much as possible.
