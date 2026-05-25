# Catatan Rilis & Panduan Integrasi Frontend (Week 3 Bugfix)

Dokumen ini memuat catatan penting mengenai perbaikan backend pada fitur **Data Availability Breakdown** dan **Scenario Cards (Proyeksi & Skenario Aktuaria)**. Perbaikan ini secara otomatis memperbaiki seluruh data visualisasi yang kosong atau terdeteksi salah, termasuk pada run ID **`anl_m9ckUEBuhKbwIZILALrVipPy`**.

---

## 1. Perubahan Utama di Sisi Backend

Backend telah menyempurnakan struktur data yang dikirimkan melalui endpoint:
`GET /api/v1/analysis-runs/{analysis_public_id}/charts`

Berikut adalah tiga perbaikan besar yang wajib diperhatikan oleh tim frontend:

### A. Donut Chart Ketersediaan Data (Data Availability Score)
* **Masalah Sebelumnya**: Seluruh item indikator di tabel breakdown ketersediaan data (seperti Official Website, Financial Statement, dll) selalu tertulis **`Missing` dengan skor `0/15` atau `0/25`** walaupun total ketersediaan data bernilai tinggi (misal: 85). Ini terjadi karena ketidakcocokan nama key pemetaan di backend.
* **Kondisi Sekarang**: Pemetaan key telah diselaraskan. Backend sekarang secara konsisten menghasilkan data status `found: true/false` yang akurat beserta perolehan poin yang tepat sesuai data publik asli yang ditemukan.
* **Instruksi untuk Frontend**: Tim frontend cukup memetakan array dari objek chart bertipe `"data_availability"` langsung ke UI:
  - **Path Data**: `chart_data.breakdown` (berisi list objek indikator).
  - **Properties**:
    - `label`: Nama indikator (e.g., `"Official Website"`).
    - `found`: Boolean (`true` jika tersedia, `false` jika missing).
    - `points_earned`: Integer skor yang diperoleh (e.g., `15`).
    - `points_max`: Integer bobot maksimal indikator (e.g., `15`).

---

### B. Pengisian Field Forecast Cards (`Base Case`, `Low Case`, `High Case`)
* **Masalah Sebelumnya**: Pada layout kartu skenario, kolom **Trigger**, **Impact**, dan **Response** pada tiga kartu kasus proyeksi kualitatif selalu kosong karena backend tidak mengirimkan propertinya.
* **Kondisi Sekarang**: Backend secara dinamis menghasilkan teks analisis risiko operasional dan rencana mitigasi formal dalam bahasa target (Indonesia/Inggris) untuk ketiga kartu proyeksi tersebut.
* **Instruksi untuk Frontend**: **TIDAK PERLU lagi memisahkan logika render kartu forecast dengan kartu skenario LLM.** 
  - Sekarang seluruh kartu di array `scenario_cards` (baik bertipe `"forecast"` maupun `"scenario"`) **dijamin selalu memiliki key `trigger`, `impact`, dan `response`**.
  - Anda dapat langsung mengikat (*data binding*) properti tersebut langsung ke komponen kartu tanpa pemeriksaan kondisional:
    - Render **Trigger** dengan: `card.trigger`
    - Render **Impact** dengan: `card.impact`
    - Render **Response** with: `card.response`

---

### C. Standardisasi Properti Kartu Skenario Kustom & Keparahan (*Severity*)
* **Masalah Sebelumnya**: Kartu skenario kustom hasil ekstraksi LLM (seperti *Perang Harga oleh Pesaing*, *Kemitraan Strategis*, dsb.) memiliki field kosong dan menampilkan tingkat keparahan (*severity*) `"Unknown"`. Ini terjadi karena inkonsistensi nama key properti JSON dari LLM.
* **Kondisi Sekarang**: 
  - Backend telah mengimplementasikan **Smart Mapping** yang secara otomatis menerjemahkan key alternatif LLM (Inggris & Indonesia seperti `potential_impact`, `stress_factor`, `pemicu`, dll) menjadi properti standar bahasa Inggris.
  - Backend secara cerdas menganalisis isi teks dampak skenario untuk menetapkan tingkat keparahan yang akurat jika nilai keparahan dari LLM kosong.
  - Prompt seeder telah ditingkatkan dengan aturan skema yang ketat dan instruksi Bahasa Indonesia bisnis formal elegan (dengan istilah aktuaria dalam kurung seperti `solvabilitas (solvency)`).
* **Instruksi untuk Frontend**:
  - Properti kartu skenario dijamin seragam:
    - **Nama Skenario**: `card.name`
    - **Pemicu**: `card.trigger`
    - **Dampak Aktuaria**: `card.impact`
    - **Tingkat Keparahan**: `card.severity` (Akan bernilai salah satu dari: `"Low" | "Medium" | "High" | "Critical"`).
    - **Rekomendasi Respons**: `card.response`
    - **Warna Badge Skenario**: `card.color` (Backend sudah menyediakan Hex color kode harmonis seperti `#ef4444` untuk High/Critical, `#f59e0b` untuk Medium, `#22c55e` untuk Low, dan `#6366f1` untuk default, yang bisa langsung Anda pasang ke warna teks/badge border di React/Vue!).

---

## 2. Struktur Data Payload JSON Terbaru untuk Pengujian

Untuk mempermudah integrasi, berikut adalah struktur data aktual yang dikirimkan oleh endpoint `GET /api/v1/analysis-runs/anl_m9ckUEBuhKbwIZILALrVipPy/charts` pada bagian chart `"forecast_scenario"` dan `"data_availability"` setelah dilakukan perbaikan:

### A. Payload Data Availability Score
```json
{
  "chart_type": "data_availability",
  "title": "Data Availability Score",
  "is_fallback": false,
  "fallback_reason": null,
  "chart_data": {
    "score": 85,
    "category": "good",
    "color": "#84cc16",
    "breakdown": [
      { "label": "Official Website", "found": true, "points_earned": 15, "points_max": 15 },
      { "label": "Financial Statement", "found": true, "points_earned": 25, "points_max": 25 },
      { "label": "Stock/Ticker Data", "found": true, "points_earned": 15, "points_max": 15 },
      { "label": "Credible News", "found": false, "points_earned": 0, "points_max": 15 },
      { "label": "Industry Benchmark", "found": true, "points_earned": 10, "points_max": 10 },
      { "label": "Legal/Registry Data", "found": true, "points_earned": 10, "points_max": 10 },
      { "label": "Multiple Confirmation", "found": true, "points_earned": 10, "points_max": 10 }
    ],
    "donut": {
      "labels": ["Available", "Missing"],
      "datasets": [
        { "data": [85, 15], "backgroundColor": ["#84cc16", "#e2e8f0"] }
      ]
    }
  }
}
```

### B. Payload Forecast Scenario (3-Year Forecast & Scenarios)
```json
{
  "chart_type": "forecast_scenario",
  "title": "3-Year Forecast & Scenarios",
  "is_fallback": true,
  "fallback_reason": "Forecast numerik belum bisa diberikan...",
  "chart_data": {
    "qualitative_view": "Proyeksi bersifat kualitatif...",
    "confidence": "Low",
    "numeric_forecast_allowed": false,
    "horizon_years": ["2025", "2026", "2027"],
    "scenario_cards": [
      {
        "name": "Base Case",
        "type": "forecast",
        "horizon": ["2025", "2026", "2027"],
        "values": ["N/A", "N/A", "N/A"],
        "trigger": "Tren bisnis berjalan seperti biasa (kondisi pasar normal).",
        "impact": "N/A, N/A, N/A. Kondisi operasional stabil dengan risiko terukur.",
        "response": "Lakukan pemantauan berkala dan optimasi efisiensi operasional.",
        "severity": "Medium",
        "confidence": "Low",
        "color": "#6366f1"
      },
      {
        "name": "Low Case (Downside)",
        "type": "forecast",
        "horizon": ["2025", "2026", "2027"],
        "values": ["N/A", "N/A", "N/A"],
        "trigger": "Terjadi penurunan pasar, peningkatan klaim, atau ketidakpastian makroekonomi.",
        "impact": "N/A, N/A, N/A. Penurunan margin profitabilitas, potensi tekanan likuiditas, dan risiko modal meningkat.",
        "response": "Terapkan protokol pengelolaan modal ketat dan tinjau ulang struktur biaya.",
        "severity": "High",
        "confidence": "Low",
        "color": "#ef4444"
      },
      {
        "name": "Perang Harga oleh Pesaing",
        "type": "scenario",
        "trigger": "Pesaing utama (misalnya, Grab) memulai perang harga yang agresif di layanan transportasi atau pengiriman makanan.",
        "impact": "Peningkatan tajam dalam biaya promosi dan insentif, tekanan signifikan pada 'take rate', dan potensi kembalinya EBITDA ke wilayah negatif...",
        "severity": "Medium",
        "response": "Tinjau kecukupan modal operasional dan siapkan rencana darurat likuiditas.",
        "color": "#f59e0b"
      }
    ]
  }
}
```

---

## 3. Langkah Rekomendasi Integrasi Cepat (Action Items)

1. **Pull API Terbaru**: Hubungkan UI Anda langsung ke endpoint `GET /api/v1/analysis-runs/anl_m9ckUEBuhKbwIZILALrVipPy/charts`.
2. **Hapus Percabangan Kondisional**: Hapus semua kode JS/TS yang memeriksa `if (card.type === 'forecast')` hanya untuk menyembunyikan kolom Trigger/Impact/Response. Anda bisa mengikatnya langsung.
3. **Badge & Warna Dinamis**: Gunakan `card.color` dari backend langsung ke properti `style={{ backgroundColor: card.color }}` atau class warna tailwind yang sebanding pada border badge/teks keparahan skenario Anda untuk visualisasi yang premium.

---

## 4. [PENTING] Pembagian Halaman Laporan & Audit Usage (Admin-Only Audit Trace)

Untuk menjaga privasi dan keamanan biaya operasional perusahaan:
1. **Dihapus dari User-Facing**: Endpoint `GET /api/v1/analysis-runs/{id}/usage` yang sebelumnya bersifat publik/user-facing kini **Telah Dihapus**. Halaman detail laporan untuk pengguna umum tidak boleh menampilkan usage, token, maupun billing.
2. **Endpoint Admin Khusus Baru**: Kami membuat endpoint audit mendalam khusus admin untuk menelusuri performa model, konsumsi token, dan mendeteksi anomali (seperti kegagalan API, retries, atau lonjakan biaya):
   - **Path**: `GET /api/v1/admin/analytics/runs/{analysis_public_id}/usage`
   - **Authentication**: JWT Bearer Token guarded by `require_admin` (Admin-Only).
   - **Description**: Mengembalikan trace logs lengkap dari **setiap pemanggilan LLM** (`llm_calls_trace`) yang terjadi selama proses analisis itu berjalan, termasuk parameter template version, input hash, input keys, jumlah token (prompt/completion), latency per LLM call dalam milidetik, error message (jika ada), serta daftar query Tavily yang dilemparkan.

### Mock JSON Response untuk Admin Run Audit Trace
`GET /api/v1/admin/analytics/runs/anl_m9ckUEBuhKbwIZILALrVipPy/usage`

```json
{
  "code": "SUCCESS",
  "message": "Fetched admin run detailed usage audit successfully",
  "data": {
    "run_metadata": {
      "analysis_run_id": 123,
      "analysis_public_id": "anl_m9ckUEBuhKbwIZILALrVipPy",
      "company_name": "PT GoTo Gojek Tokopedia Tbk",
      "owner_email": "admin@cubiconia.com",
      "status": "completed",
      "progress": 100,
      "analysis_goal": "business_health",
      "language": "id",
      "created_at": "2026-05-25T12:00:00+07:00",
      "completed_at": "2026-05-25T12:03:15+07:00"
    },
    "summary": {
      "total_llm_calls": 2,
      "total_tavily_queries": 3,
      "total_tokens": 1258500,
      "total_prompt_tokens": 1245000,
      "total_completion_tokens": 13500,
      "total_latency_ms": 28200,
      "total_cost_usd": 1.608825,
      "total_llm_cost_usd": 1.563825,
      "total_tavily_cost_usd": 0.0450,
      "currency": "USD"
    },
    "llm_calls_trace": [
      {
        "id": 451,
        "task_type": "research_planner",
        "provider": "openrouter",
        "model_name": "google/gemini-2.5-flash",
        "prompt_template_version_id": 12,
        "input_hash": "a1b2c3d4e5f6g7h8...",
        "input_variables_keys": ["company_name", "industry", "analysis_goal", "language"],
        "prompt_tokens": 45000,
        "completion_tokens": 1500,
        "total_tokens": 46500,
        "cost_usd": 0.003825,
        "latency_ms": 3200,
        "error_message": null,
        "created_at": "2026-05-25T12:00:05+07:00"
      },
      {
        "id": 452,
        "task_type": "actuarial_analyzer",
        "provider": "openrouter",
        "model_name": "google/gemini-2.5-pro",
        "prompt_template_version_id": 13,
        "input_hash": "e5f6g7h8i9j0k1l2...",
        "input_variables_keys": ["company_name", "source_summaries_json", "data_availability_json", "user_perspective"],
        "prompt_tokens": 1200000,
        "completion_tokens": 12000,
        "total_tokens": 1212000,
        "cost_usd": 1.600000,
        "latency_ms": 25000,
        "error_message": null,
        "created_at": "2026-05-25T12:00:45+07:00"
      }
    ],
    "tavily_queries": [
      "GoTo Gojek Tokopedia financial statements 2024",
      "GoTo Gojek Tokopedia business segment performance",
      "GoTo Gojek Tokopedia news sentiment"
    ]
  }
}
```

### Rekomendasi Integrasi Halaman Admin:
- Letakkan link detail di baris Runs Table di Dashboard Admin (kolom `analysis_public_id`).
- Ketika admin mengklik link tersebut, arahkan ke `/admin/analytics/runs/{id}` dan lakukan fetch ke `GET /api/v1/admin/analytics/runs/{id}/usage`.
- Desain halaman ini sebagai **Technical Trace Audit** yang fokus mem-breakdown total biaya, perolehan waktu latency LLM, model yang terpilih, dan key input variabel. Ini sangat efektif untuk mendeteksi anomali performa model Router Anda.

