# 11 - Admin Prompts and Providers

## Tujuan
Membangun admin module opsional V1 untuk prompt template dan provider management.

## Implementation Checklist
- Buat `/admin/prompts` dengan admin guard.
- Buat `/admin/providers` dengan admin guard.
- Prompt templates:
  - list templates
  - view template detail
  - create version
  - activate version
- Provider configs:
  - list configs
  - create config
  - show enabled/priority/default model/environment
- Provider credentials:
  - list credential status
  - create credential
  - rotate credential
  - disable credential
- Gunakan dialog/form client component untuk editor dan mutation.
- Dynamic import editor-heavy components bila perlu.

## Backend Mapping
- Prompt templates:
  - `GET /api/v1/prompt-templates`
  - `POST /api/v1/prompt-templates`
  - `GET /api/v1/prompt-templates/{template_id}`
  - `PATCH /api/v1/prompt-templates/{template_id}`
  - `POST /api/v1/prompt-templates/{template_id}/versions`
  - `POST /api/v1/prompt-templates/{template_id}/versions/{version_id}/activate`
- Provider:
  - `GET/POST /api/v1/admin/provider-configs`
  - `GET/POST /api/v1/admin/provider-credentials`
  - `POST /api/v1/admin/provider-credentials/{cred_id}/rotate`
  - `POST /api/v1/admin/provider-credentials/{cred_id}/disable`

## Security Rules
- Admin module hanya untuk prompt/provider management.
- Admin tidak punya cross-user analysis viewer.
- Credential value penuh tidak boleh ditampilkan.
- Error UI tetap tampilkan `request_id`, bukan secret.

## Acceptance Criteria
- Non-admin tidak bisa akses admin pages.
- Admin pages tidak membuka analysis user lain.
- Provider credential UI hanya menampilkan status dan last four bila ada.
- Mutations invalidate query key admin terkait.
