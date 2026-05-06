# Backend Endpoint Map

## Analysis Contract Baseline

Frontend only uses `analysis_public_id` (`anl_<random>`) for analysis resources. Analysis is private to creator. Admin cannot read another user's analysis. `GET /api/v1/analysis-runs` is source of truth for history screen and returns caller-owned rows only. Non-owner detail/report/sources reads return `404 ANALYSIS_NOT_FOUND`.


Dokumen ini mengelompokkan endpoint berdasarkan area UI.

## 1. Public Endpoints
- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

## 2. Protected User Endpoints
- `GET /api/v1/auth/me`
- `POST /api/v1/analysis/external/run`
- `GET /api/v1/analysis-runs/{analysis_public_id}`
- `GET /api/v1/analysis-runs/{analysis_public_id}/report`
- `GET /api/v1/analysis-runs/{analysis_public_id}/sources`

Compatibility alias:
- `GET /api/v1/analysis/runs/{analysis_public_id}`
- `GET /api/v1/analysis/runs/{analysis_public_id}/report`
- `GET /api/v1/analysis/runs/{analysis_public_id}/sources`

## 3. Protected Admin Endpoints

### Prompt Templates
- `GET /api/v1/prompt-templates`
- `POST /api/v1/prompt-templates`
- `GET /api/v1/prompt-templates/{template_id}`
- `PATCH /api/v1/prompt-templates/{template_id}`
- `POST /api/v1/prompt-templates/{template_id}/versions`
- `POST /api/v1/prompt-templates/{template_id}/versions/{version_id}/activate`

### Provider Config and Credential
- `GET /api/v1/admin/provider-configs`
- `POST /api/v1/admin/provider-configs`
- `GET /api/v1/admin/provider-credentials`
- `POST /api/v1/admin/provider-credentials`
- `POST /api/v1/admin/provider-credentials/{cred_id}/rotate`
- `POST /api/v1/admin/provider-credentials/{cred_id}/disable`

## 4. Screen to Endpoint Mapping

### Login Page
- `POST /api/v1/auth/login`

### Session Restore
- `GET /api/v1/auth/me`

### Analysis Form
- `POST /api/v1/analysis/external/run`

### Analysis Overview
- gunakan response dari `POST /api/v1/analysis/external/run`
- atau `GET /api/v1/analysis-runs/{analysis_public_id}`

### Report Detail
- `GET /api/v1/analysis-runs/{analysis_public_id}/report`

### Sources Tab
- `GET /api/v1/analysis-runs/{analysis_public_id}/sources`

### Prompt Admin Page
- `GET /api/v1/prompt-templates`
- `GET /api/v1/prompt-templates/{template_id}`
- `POST /api/v1/prompt-templates/{template_id}/versions`
- `POST /api/v1/prompt-templates/{template_id}/versions/{version_id}/activate`

### Provider Admin Page
- `GET /api/v1/admin/provider-configs`
- `GET /api/v1/admin/provider-credentials`
- `POST /api/v1/admin/provider-configs`
- `POST /api/v1/admin/provider-credentials`
