# Frontend Delivery Pack

## Backend Contract Baseline

Frontend only uses `analysis_public_id` for analysis resources. Analysis data is private to creator; admin cannot view another user's analysis. History screen must load from `GET /api/v1/analysis-runs`.

Dokumen di folder ini adalah paket delivery resmi backend ke frontend untuk implementasi Next.js + TypeScript, termasuk jika frontend dikerjakan penuh oleh agent AI.

## 1. Tujuan Folder Ini
Folder ini disusun supaya frontend tidak perlu membaca seluruh code backend untuk mulai develop.

Gunakan folder ini untuk:
- memahami endpoint yang aktif
- memahami auth flow
- memahami shape request dan response
- memahami field mana yang aman dijadikan source of truth UI
- memahami error handling
- memahami screen-to-endpoint mapping

## 2. Urutan Baca yang Direkomendasikan

### Step 1
Baca:
[frontend-delivery-overview.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/frontend/frontend-delivery-overview.md>)

Tujuan:
- memahami gambaran aplikasi backend
- memahami modul yang sudah aktif
- memahami batasan V1

### Step 2
Baca:
[api-contract.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/frontend/api-contract.md>)

Tujuan:
- memahami kontrak analysis endpoint
- memahami field utama untuk dashboard

### Step 3
Baca:
[auth-and-session-contract.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/frontend/auth-and-session-contract.md>)

Tujuan:
- implement login
- implement token handling
- implement unauthorized flow

### Step 4
Baca:
[backend-endpoint-map.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/frontend/backend-endpoint-map.md>)

Tujuan:
- melihat semua endpoint yang tersedia
- tahu endpoint mana yang dipakai oleh screen tertentu

### Step 5
Baca:
[typescript-models.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/frontend/typescript-models.md>)

Tujuan:
- langsung copy struktur type/interface frontend

### Step 6
Baca:
[ui-integration-guide.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/frontend/ui-integration-guide.md>)

Tujuan:
- mapping endpoint ke halaman dan komponen

## 3. Source of Truth Rules
- Untuk UI summary, gunakan `report_summary`
- Untuk score card, gunakan `scores`
- Untuk source tab, gunakan `sources`
- Untuk gap tab, gunakan `data_gaps`
- Untuk full report page, gunakan `report_markdown`
- Jangan parsing markdown untuk state utama UI

## 4. Dokumen Backend Pendukung
Jika frontend butuh detail tambahan:
- [00-backend-api-reference.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/api/00-backend-api-reference.md>)
- [02-endpoint-contracts.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/api/02-endpoint-contracts.md>)
- [analysis-user-manual.md](</D:/Workspace/Cubiconia/rnd/Acturial AI/actuarial-ai-business-be/docs/api/analysis-user-manual.md>)
