# Week 4 Bug Fix & Optimization — Backend Changes

> **Status:** Done  
> **Tanggal:** 2026-05-28  
> **Scope:** API Optimization, Pagination, Filter/Search, Role-Based Access Control  

---

## Ringkasan Perubahan

Week 4 berfokus pada optimasi performa backend dan perbaikan akses kontrol. Ada 4 area utama yang diubah:

1. **Pisah endpoint dashboard admin & runs table** agar tidak berat
2. **Tambah pagination standar + filter search & status** pada list runs
3. **Role-based access control** — admin lihat semua, user hanya miliknya
4. **Admin bypass** untuk akses detail run milik user mana pun

---

## Catatan Desain: Filter Independen per Endpoint


Kedua endpoint admin analytics memiliki filter **independen** — tidak harus sama.
**Frontend yang mengorkestrasi** mana filter dikirim ke endpoint mana:

| Filter | `/admin/analytics/usage` | `/admin/analytics/runs-table` |
|---|:---:|:---:|
| `start_date` | ✅ | ✅ |
| `end_date` | ✅ | ✅ |
| `user_id` | ✅ | ✅ |
| `search` | ❌ | ✅ |
| `status` | ❌ | ✅ |
| `page` / `page_size` | ❌ | ✅ |

**Pola di FE:** Satu filter panel → kirim `start_date`+`end_date`+`user_id` ke **kedua** API secara paralel. `search` dan `status` hanya dikirim ke table API. Chart tetap bersih dan bisa dipakai di halaman lain secara mandiri.

---

### 1. `GET /admin/analytics/usage` — Dashboard Admin (BERUBAH)

**Sebelumnya:** Response berisi `summary`, `charts`, `top_records`, **dan** `runs_table` (semua runs di-load sekaligus).

**Sekarang:** Response **tidak lagi berisi `runs_table`**. Hanya:
```json
{
  "filter": { "start_date": "...", "end_date": "...", "user_id": null },
  "summary": {
    "total_runs": 0,
    "total_llm_calls": 0,
    "total_tavily_queries": 0,
    "total_tokens": 0,
    "total_prompt_tokens": 0,
    "total_completion_tokens": 0,
    "total_cost_usd": 0.0,
    "total_llm_cost_usd": 0.0,
    "total_tavily_cost_usd": 0.0,
    "currency": "USD"
  },
  "charts": {
    "daily_trend": [],
    "model_breakdown": [],
    "task_breakdown": []
  },
  "top_records": {
    "highest_token_run": null,
    "highest_cost_run": null
  }
}
```

> ⚠️ **Breaking Change:** Field `runs_table` dihapus dari response ini. Gunakan endpoint baru `/admin/analytics/runs-table` untuk data tabel.

**Query Params (tidak berubah):**
| Param | Type | Default | Keterangan |
|---|---|---|---|
| `start_date` | datetime | 30 hari lalu | Filter dari tanggal |
| `end_date` | datetime | Hari ini | Filter sampai tanggal |
| `user_id` | int | null | Filter per user tertentu |

---

### 2. `GET /admin/analytics/runs-table` — ✨ Endpoint Baru

Endpoint khusus untuk tabel semua runs dengan **pagination penuh** dan **filter**. Ringan karena query DB langsung tanpa load LLM call detail.

**Role:** Admin only

**Query Params:**
| Param | Type | Default | Keterangan |
|---|---|---|---|
| `page` | int | `1` | Nomor halaman (min: 1) |
| `page_size` | int | `20` | Item per halaman (min: 1, max: 100) |
| `search` | string | null | Cari berdasarkan nama perusahaan (case-insensitive) |
| `status` | string | null | Filter status: `completed`, `failed`, `analyzing`, `planning_research`, `needs_more_context`, dll |
| `start_date` | datetime | null | Filter dari tanggal |
| `end_date` | datetime | null | Filter sampai tanggal |
| `user_id` | int | null | Filter berdasarkan user ID tertentu |

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "analysis_public_id": "abc-123",
        "company_name": "PT Contoh Indonesia",
        "owner_email": "user@example.com",
        "status": "completed",
        "overall_risk_score": 72,
        "confidence_score": 85,
        "data_availability_score": 78,
        "created_at": "2026-05-28T10:00:00",
        "completed_at": "2026-05-28T10:05:30"
      }
    ],
    "meta": {
      "page": 1,
      "page_size": 20,
      "total": 150,
      "total_pages": 8
    },
    "filter": {
      "search": null,
      "status": null,
      "start_date": null,
      "end_date": null,
      "user_id": null
    }
  }
}
```

**Contoh penggunaan:**
```
GET /admin/analytics/runs-table?page=1&page_size=20&search=PT%20Asuransi&status=completed
GET /admin/analytics/runs-table?page=2&page_size=10&start_date=2026-05-01&end_date=2026-05-28
GET /admin/analytics/runs-table?user_id=5&page=1
```

---

### 3. `GET /analysis-runs` — List Runs (BERUBAH)

**Sebelumnya:** Hanya ada `page` dan `page_size`. Selalu filter berdasarkan user yang login.

**Sekarang:** Tambah filter `search` dan `status`. **Role-based access:**
- **Admin** (`role = "admin"`): Melihat **semua** runs dari semua user
- **User biasa**: Hanya melihat runs miliknya sendiri

**Query Params (updated):**
| Param | Type | Default | Keterangan |
|---|---|---|---|
| `page` | int | `1` | Nomor halaman (min: 1) |
| `page_size` | int | `20` | Item per halaman (min: 1, max: 100) |
| `search` | string | null | **[BARU]** Cari berdasarkan nama perusahaan |
| `status` | string | null | **[BARU]** Filter berdasarkan status run |

**Response shape tidak berubah** — tetap mengembalikan array runs + `meta`:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

**Contoh penggunaan:**
```
GET /analysis-runs?page=1&page_size=10&search=PT%20Mandiri
GET /analysis-runs?status=completed&page=1
GET /analysis-runs?search=insurance&status=failed&page=1&page_size=5
```

---

### 4. Detail Run — Admin Bypass (BERUBAH)

Endpoint berikut sekarang mendukung akses admin ke run milik user mana pun:

| Endpoint | Sebelumnya | Sekarang |
|---|---|---|
| `GET /analysis-runs/{id}` | Hanya owner | Admin dapat akses semua |
| `GET /analysis-runs/{id}/report` | Hanya owner | Admin dapat akses semua |
| `GET /analysis-runs/{id}/sources` | Hanya owner | Admin dapat akses semua |
| `POST /analysis-runs/{id}/context-answers` | Hanya owner | Admin dapat akses semua |

Jika non-admin mencoba akses run milik user lain → tetap `404 ANALYSIS_NOT_FOUND`.

---

## Status Values yang Valid untuk Filter `status`

| Value | Keterangan |
|---|---|
| `created` | Run baru dibuat |
| `planning_research` | Sedang membuat research plan |
| `searching_sources` | Sedang mencari sumber |
| `collecting_sources` | Sedang mengumpulkan sumber |
| `scoring_sources` | Sedang scoring sumber |
| `evaluating_context` | Sedang evaluasi konteks |
| `needs_more_context` | Butuh jawaban konteks dari user |
| `resuming_analysis` | Melanjutkan analisis setelah konteks diberikan |
| `analyzing` | Sedang analisis aktuaria |
| `generating_report` | Sedang generate laporan |
| `completed` | Selesai |
| `failed` | Gagal |

---

## Pagination Standard

Semua endpoint list sekarang menggunakan format `meta` yang konsisten:

```json
"meta": {
  "page": 1,         // Halaman saat ini
  "page_size": 20,   // Item per halaman
  "total": 150,      // Total item keseluruhan
  "total_pages": 8   // Total halaman
}
```

**Default values:**
- `page`: `1`
- `page_size`: `20`
- `page_size` maksimum: `100`

---

## File yang Diubah (Backend)

| File | Perubahan |
|---|---|
| `app/repositories/analysis_repository.py` | Tambah `list_runs()` dengan filter; `get_run_for_user()` dengan `is_admin` bypass |
| `app/services/analysis_orchestrator.py` | Expose `list_runs()` dan `get_run_for_user(is_admin)` |
| `app/services/admin_analytics_service.py` | Hapus `runs_table` dari `get_usage_analytics`; tambah `get_runs_table_paginated()` |
| `app/api/v1/routes_analysis.py` | Tambah `search` & `status` params; role-based access list & detail |
| `app/api/v1/routes_admin.py` | Tambah endpoint `GET /admin/analytics/runs-table` |
