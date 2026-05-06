# Frontend Delivery Overview

## Analysis Contract Baseline

Frontend only uses `analysis_public_id` (`anl_<random>`) for analysis resources. Analysis is private to creator. Admin cannot read another user's analysis. `GET /api/v1/analysis-runs` is source of truth for history screen and returns caller-owned rows only. Non-owner detail/report/sources reads return `404 ANALYSIS_NOT_FOUND`.


Dokumen ini memberi gambaran singkat seluruh backend yang relevan untuk frontend.

## 1. Backend Stack
- Framework: FastAPI
- Database: PostgreSQL
- Auth: JWT Bearer Token
- AI Provider aktif: Gemini
- Search Provider aktif: Tavily
- Output utama V1: structured analysis response + markdown report

## 2. Modul Backend yang Sudah Relevan untuk Frontend
- Health check
- Auth
- Analysis run
- Analysis report
- Analysis sources
- Prompt management admin
- Provider admin

## 3. Fokus Frontend V1
Frontend V1 paling cocok membangun:
- login page
- analysis request form
- result overview page
- report detail page
- sources tab
- data gaps tab

Admin page opsional:
- provider config list
- credential status list
- prompt template list

## 4. Output yang Harus Dianggap Stabil
Untuk analysis result:
- `analysis_public_id`
- `status`
- `scores`
- `report_summary`
- `report_markdown`
- `sources`
- `data_gaps`

## 5. Hal yang Jangan Diandalkan Frontend
- format narasi di dalam markdown
- urutan bullet dalam markdown
- appendix markdown sebagai data utama
- asumsi bahwa semua endpoint list sudah paginated

## 6. Delivery Goal untuk AI Frontend Agent
AI frontend agent harus mampu:
- login dan menyimpan token
- mengirim analysis request
- menampilkan score card
- menampilkan summary
- menampilkan markdown report
- menampilkan daftar source
- menampilkan data gaps
- menangani envelope error
