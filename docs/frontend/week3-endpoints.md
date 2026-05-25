# Dokumen Integrasi Frontend - Panduan Pengerjaan Backend Week 3

Dokumen ini memuat seluruh perubahan arsitektur backend, pemrosesan model, optimasi token logging, dan spesifikasi API Contract lengkap untuk seluruh endpoint baru yang dikembangkan pada **Week 3**. Panduan ini ditujukan bagi tim Frontend untuk memudahkan integrasi visualisasi chart dan analisis penggunaan (billing/token) pada dashboard.

---

## 1. Ikhtisar Pengerjaan & Perubahan Backend (Week 3)

Pada Week 3, backend difokuskan pada peningkatan kualitas data analitis, pemrosesan multi-model LLM melalui **OpenRouter**, penyediaan visualisasi data siap saji, serta audit penggunaan token dan biaya. Berikut adalah rangkuman pengerjaan backend:

1. **Database & ORM Model Baru (`analysis_charts`):**
   * Menambahkan tabel `analysis_charts` untuk menyimpan data chart secara terstruktur dan ter-relasi dengan `analysis_runs` (tiap analisis menghasilkan 4 jenis chart).
   * Relasi database diset cascade-delete agar penghapusan run otomatis membersihkan data chart terkait.
2. **Multi-Model Router (OpenRouter Integration):**
   * Mengimplementasikan `ModelRouter` untuk membagi tugas LLM berdasarkan tingkat kesulitannya:
     * **Tier Fast (`google/gemini-2.5-flash`):** Digunakan untuk merancang pencarian (`research_planner`), penelusuran kesenjangan data, dan summarization dokumen.
     * **Tier Reasoning (`google/gemini-2.5-pro`):** Digunakan untuk interpretasi aktuaria mendalam (`actuarial_analyzer`).
     * **Tier Writing (`anthropic/claude-sonnet-4.5`):** Digunakan khusus untuk meramu laporan naratif Markdown final (`report_generator`).
3. **Pure Python Chart Generator:**
   * Membuat layanan `ChartDataGenerator` yang memproses hasil kalkulasi skor risiko, tingkat ketersediaan data, kredibilitas sumber, dan skenario aktuaria secara langsung (tanpa membebani I/O database atau memicu pemanggilan LLM tambahan) menjadi payload chart siap konsumsi oleh library frontend.
4. **Audit Token & Sistem Kalkulasi Biaya Otomatis (USD):**
   * **Perbaikan Bug Logging:** Memperbaiki sistem logging di mana tugas-tugas berbasis format JSON sebelumnya membuang data token pemanggilan. Sekarang seluruh data token (`prompt_tokens`, `completion_tokens`, `total_tokens`) dan latensi (`latency_ms`) tersimpan sempurna.
   * **Cost Engine:** Menambahkan fungsi pencatat tarif per 1 juta token secara real-time berdasarkan harga OpenRouter untuk menghitung biaya aktual dari tiap pemanggilan LLM.

---

## 2. API Contract & Spesifikasi Endpoint Baru

Seluruh endpoint di bawah ini memerlukan otentikasi menggunakan JWT Token yang dikirimkan melalui header `Authorization: Bearer <token>`.

### Endpoint 1: Mengambil Data Chart Visualisasi
Mengembalikan list data berisi 4 jenis chart siap pakai untuk visualisasi dashboard perusahaan.

* **Method:** `GET`
* **Path:** `/api/v1/analysis-runs/{analysis_public_id}/charts`
* **Header:**
  ```http
  Authorization: Bearer <your_jwt_token>
  Accept: application/json
  ```
* **Path Parameter:**
  * `analysis_public_id` (string, required): ID unik publik dari jalannya analisis (contoh: `anl_xxxx`).
* **Format Response Sukses (`200 OK`):**
  ```json
  {
    "status": "success",
    "code": "CHARTS_RETRIEVED",
    "message": "4 chart(s) retrieved for analysis run anl_example123.",
    "data": [
      {
        "chart_type": "risk_domain",
        "title": "Risk Domain Breakdown",
        "is_fallback": false,
        "fallback_reason": null,
        "chart_data": {
          "labels": [
            "Financial Opacity",
            "Data Availability",
            "Source Credibility",
            "Market Risk",
            "Governance Risk",
            "Sentiment Risk",
            "Business Model Risk"
          ],
          "datasets": [
            {
              "label": "Risk Score",
              "data": [45, 60, 30, 75, 40, 50, 65],
              "backgroundColor": ["#f59e0b", "#f97316", "#22c55e", "#ef4444", "#f59e0b", "#f59e0b", "#f97316"],
              "borderColor": ["#f59e0b", "#f97316", "#22c55e", "#ef4444", "#f59e0b", "#f59e0b", "#f97316"]
            }
          ],
          "summary": {
            "overall_risk": 55,
            "risk_category": "medium",
            "risk_level_color": "#f59e0b",
            "top_drivers": [
              "High market competition in target sector",
              "Incomplete disclosure of corporate tax returns"
            ]
          },
          "meta": {
            "description": "Skor risiko per dimensi (0 = rendah, 100 = tinggi)",
            "scale": { "min": 0, "max": 100 }
          }
        }
      },
      {
        "chart_type": "data_availability",
        "title": "Data Availability Score",
        "is_fallback": false,
        "fallback_reason": null,
        "chart_data": {
          "score": 75,
          "category": "good",
          "color": "#84cc16",
          "breakdown": [
            { "label": "Official Website", "found": true, "points_earned": 15, "points_max": 15 },
            { "label": "Financial Statement", "found": true, "points_earned": 25, "points_max": 25 },
            { "label": "Stock/Ticker Data", "found": false, "points_earned": 0, "points_max": 15 },
            { "label": "Credible News", "found": true, "points_earned": 15, "points_max": 15 },
            { "label": "Industry Benchmark", "found": true, "points_earned": 10, "points_max": 10 },
            { "label": "Legal/Registry Data", "found": true, "points_earned": 10, "points_max": 10 },
            { "label": "Multiple Confirmation", "found": false, "points_earned": 0, "points_max": 10 }
          ],
          "donut": {
            "labels": ["Available", "Missing"],
            "datasets": [
              {
                "data": [75, 25],
                "backgroundColor": ["#84cc16", "#e2e8f0"]
              }
            ]
          },
          "meta": {
            "description": "Persentase ketersediaan data publik yang relevan untuk analisis"
          }
        }
      },
      {
        "chart_type": "source_coverage",
        "title": "Source Coverage by Type",
        "is_fallback": false,
        "fallback_reason": null,
        "chart_data": {
          "labels": ["Official Website", "Reputable News", "Regulator"],
          "datasets": [
            {
              "label": "Source Count",
              "data": [4, 2, 1],
              "backgroundColor": ["#6366f1", "#84cc16", "#8b5cf6"]
            }
          ],
          "summary": {
            "total_sources": 7,
            "avg_credibility": 84,
            "credibility_level": "Good",
            "breakdown_by_type": [
              { "type": "official_website", "label": "Official Website", "count": 4, "avg_credibility": 90, "color": "#6366f1" },
              { "type": "reputable_news", "label": "Reputable News", "count": 2, "avg_credibility": 75, "color": "#84cc16" },
              { "type": "regulator", "label": "Regulator", "count": 1, "avg_credibility": 95, "color": "#8b5cf6" }
            ]
          },
          "meta": {
            "description": "Distribusi jenis sumber yang ditemukan dan rata-rata skor kredibilitasnya"
          }
        }
      },
      {
        "chart_type": "forecast_scenario",
        "title": "3-Year Forecast & Scenarios",
        "is_fallback": true,
        "fallback_reason": "Forecast numerik belum bisa diberikan karena kualitas data tren historis terbatas.",
        "chart_data": {
          "qualitative_view": "Pertumbuhan sedang dalam jangka menengah dengan volatilitas pasar tinggi.",
          "confidence": "Medium",
          "numeric_forecast_allowed": false,
          "horizon_years": [],
          "scenario_cards": [
            {
              "name": "Market Shock Scenario",
              "type": "scenario",
              "trigger": "Peningkatan suku bunga acuan domestik > 1.5%",
              "impact": "Tekanan pada arus kas operasional akibat naiknya biaya modal",
              "severity": "Medium",
              "response": "Hedging portofolio investasi likuid dan re-negosiasi pinjaman jangka pendek",
              "color": "#f59e0b"
            }
          ],
          "historical_summary": "Tren pendapatan naik 8% YoY namun profitabilitas tertekan margin operasional.",
          "historical_quality": "Moderate",
          "data_sufficiency": {
            "status": "partial",
            "reason": "Kurang data detail laporan posisi keuangan triwulan"
          },
          "required_data_for_numeric": [
            "Laporan posisi keuangan audit 3 tahun berturut-turut",
            "Rincian kewajiban kontinjensi jangka pendek"
          ]
        }
      }
    ]
  }
  ```

---

### Endpoint 2: Mengambil Analisis Token & Biaya Pemakaian (Usage & Billing)
Mengembalikan ringkasan statistik pemakaian token LLM, performa latensi, jumlah pencarian eksternal, dan akumulasi biaya aktual dalam USD untuk satu kali run analisis.

* **Method:** `GET`
* **Path:** `/api/v1/analysis-runs/{analysis_public_id}/usage`
* **Header:**
  ```http
  Authorization: Bearer <your_jwt_token>
  Accept: application/json
  ```
* **Path Parameter:**
  * `analysis_public_id` (string, required): ID unik publik dari jalannya analisis (contoh: `anl_xxxx`).
* **Format Response Sukses (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "analysis_public_id": "anl_example123",
      "company_name": "PT. Asuransi Jiwa Megah",
      "analysis_goal": "risk_assessment",
      "status": "completed",
      "llm_usage": {
        "total_calls": 2,
        "total_tokens": 18500,
        "total_cost_usd": 0.037763,
        "calls": [
          {
            "id": 41,
            "task_type": "research_planner",
            "provider": "openrouter",
            "model_name": "google/gemini-2.5-flash-preview-05-20",
            "prompt_tokens": 1500,
            "completion_tokens": 500,
            "total_tokens": 2000,
            "cost_usd": 0.000263,
            "latency_ms": 1180,
            "status": "success",
            "error_message": null,
            "created_at": "2026-05-25T10:45:00.123456"
          },
          {
            "id": 42,
            "task_type": "actuarial_analyzer",
            "provider": "openrouter",
            "model_name": "google/gemini-2.5-pro-preview-05-06",
            "prompt_tokens": 12000,
            "completion_tokens": 4500,
            "total_tokens": 16500,
            "cost_usd": 0.0375,
            "latency_ms": 6120,
            "status": "success",
            "error_message": null,
            "created_at": "2026-05-25T10:46:15.654321"
          }
        ]
      },
      "tavily_usage": {
        "query_count": 4,
        "cost_per_query_usd": 0.015,
        "total_cost_usd": 0.06
      },
      "summary": {
        "total_cost_usd": 0.097763,
        "currency": "USD",
        "duration_seconds": 95.4,
        "created_at": "2026-05-25T10:44:50.111111",
        "completed_at": "2026-05-25T10:46:25.511111"
      }
    }
  }
  ```

---

### Endpoint 3: Mengambil Analisis Penggunaan Admin (Date Range & Global Charts)
Mengembalikan data agregat konsumsi token, performa kueri Tavily, tren harian, proporsi penggunaan model/tugas, serta tabel analisis data lengkap untuk dashboard usage Administrator.

* **Method:** `GET`
* **Path:** `/api/v1/admin/analytics/usage`
* **Header:**
  ```http
  Authorization: Bearer <your_jwt_admin_token>
  Accept: application/json
  ```
* **Query Parameters:**
  * `start_date` (string ISO, optional): Tanggal mulai pemrosesan (contoh: `2026-05-01T00:00:00`, default: 30 hari yang lalu).
  * `end_date` (string ISO, optional): Tanggal akhir pemrosesan (contoh: `2026-05-25T23:59:59`, default: waktu sekarang).
  * `user_id` (integer, optional): ID user spesifik jika ingin memfilter data per pengguna.
* **Format Response Sukses (`200 OK`):**
  ```json
  {
    "status": "success",
    "code": "SUCCESS",
    "message": "Fetched admin usage analytics successfully",
    "data": {
      "filter": {
        "start_date": "2026-05-01T00:00:00",
        "end_date": "2026-05-25T23:59:59",
        "user_id": null
      },
      "summary": {
        "total_runs": 12,
        "total_llm_calls": 24,
        "total_tavily_queries": 48,
        "total_tokens": 222000,
        "total_prompt_tokens": 162000,
        "total_completion_tokens": 60000,
        "total_cost_usd": 1.173156,
        "total_llm_cost_usd": 0.453156,
        "total_tavily_cost_usd": 0.72,
        "currency": "USD"
      },
      "charts": {
        "daily_trend": [
          {
            "date": "2026-05-24",
            "tokens": 18500,
            "cost_usd": 0.097763,
            "calls": 2,
            "tavily_queries": 4
          },
          {
            "date": "2026-05-25",
            "tokens": 37000,
            "cost_usd": 0.195526,
            "calls": 4,
            "tavily_queries": 8
          }
        ],
        "model_breakdown": [
          {
            "model_name": "google/gemini-2.5-pro-preview-05-06",
            "total_tokens": 198000,
            "total_calls": 12,
            "total_cost_usd": 0.45
          },
          {
            "model_name": "google/gemini-2.5-flash-preview-05-20",
            "total_tokens": 24000,
            "total_calls": 12,
            "total_cost_usd": 0.003156
          }
        ],
        "task_breakdown": [
          {
            "task_type": "actuarial_analyzer",
            "total_tokens": 198000,
            "total_calls": 12,
            "total_cost_usd": 0.45
          },
          {
            "task_type": "research_planner",
            "total_tokens": 24000,
            "total_calls": 12,
            "total_cost_usd": 0.003156
          }
        ]
      },
      "top_records": {
        "highest_token_run": {
          "analysis_run_id": 42,
          "analysis_public_id": "anl_heavy123",
          "company_name": "PT. Megah Securindo",
          "total_tokens": 37000,
          "total_cost_usd": 0.195526,
          "created_at": "2026-05-25T08:00:00"
        },
        "highest_cost_run": {
          "analysis_run_id": 42,
          "analysis_public_id": "anl_heavy123",
          "company_name": "PT. Megah Securindo",
          "total_tokens": 37000,
          "total_cost_usd": 0.195526,
          "created_at": "2026-05-25T08:00:00"
        }
      },
      "runs_table": [
        {
          "analysis_public_id": "anl_heavy123",
          "company_name": "PT. Megah Securindo",
          "owner_email": "admin@cubiconia.com",
          "status": "completed",
          "total_tokens": 37000,
          "tavily_queries": 8,
          "total_cost_usd": 0.195526,
          "models_used": [
            "google/gemini-2.5-pro-preview-05-06",
            "google/gemini-2.5-flash-preview-05-20"
          ],
          "created_at": "2026-05-25T08:00:00"
        }
      ]
    }
  }
  ```

---

## 3. Panduan Integrasi UI / Library Frontend

### Rendering Data Charts
Frontend dapat dengan mudah menggunakan library **Recharts** atau **Chart.js** untuk me-render data dari API:

1. **`risk_domain` (Radar/Radar Chart):**
   * **Data Binding:** Petakan `chart_data.labels` sebagai sumbu kategori dan `chart_data.datasets[0].data` sebagai nilai dari data poin radar.
   * **Warna:** Gunakan warna hex dari `chart_data.datasets[0].backgroundColor` pada tiap poin untuk representasi tingkat keparahan risiko secara visual.
   * **UI Card:** Tampilkan parameter `summary.overall_risk` (skor besar di tengah radar) dan buat daftar text pemicu dari array `summary.top_drivers`.
2. **`data_availability` (Radial Bar / Gauge / Donut Chart):**
   * **Data Binding:** Gunakan `chart_data.donut` yang menyediakan proporsi data untuk visualisasi lingkaran donat (Available vs Missing).
   * **Kategori Teks:** Tampilkan teks `category` (misalnya "Good") beserta warna hex penunjang dari variabel `color`.
   * **Tabel Kelayakan:** Tampilkan rincian dari variabel array `breakdown` untuk menampilkan item apa saja yang ditemukan (dengan icon checklist hijau/silang merah berdasarkan nilai boolean `found`).
3. **`source_coverage` (Bar / Pie Chart):**
   * **Data Binding:** Gunakan nilai `chart_data.datasets[0].data` untuk menunjukkan volume temuan dokumen per kategori, dan padankan dengan label di `labels`.
   * **Legenda:** Render tabel ringkasan di bawah chart dari `summary.breakdown_by_type` untuk memperlihatkan rata-rata skor kredibilitas dokumen per kategori secara spesifik.
4. **`forecast_scenario` (Card List UI):**
   * **Pengecekan Fallback:** Pertama, periksa variabel `is_fallback`. Jika bernilai `true`, tampilkan banner info/alert berwarna kuning berisi teks `fallback_reason` yang menerangkan bahwa data historis tidak cukup untuk hitungan numerik linier.
   * **Visualisasi Skenario:** Render kartu-kartu grid dari array `scenario_cards` dengan aksen warna sisi kiri kartu mengikuti kode hex `color` masing-masing skenario (menampilkan pemicu, estimasi keparahan/severity, dan respons aktuaria yang direkomendasikan).

### Rendering Biaya / Token Admin (Sesi Perusahaan Individu)
* Tampilkan **Total Biaya Run** secara mencolok dari `summary.total_cost_usd` (contoh: `$0.10 USD`).
* Sajikan rincian konsumsi LLM (Total token dan total biaya LLM) bersebelahan dengan pemakaian kuota kueri Tavily.
* Buat tabel performa latensi (`latency_ms`) untuk melihat durasi respons dari tiap LLM Call (Gemini Flash vs Gemini Pro) guna memantau efisiensi pipeline backend.

---
## 3. Panduan Integrasi UI / Library Frontend (Usage Admin Halaman Khusus)

Frontend dapat me-render data dari **Endpoint 3** secara penuh untuk membangun Halaman Usage Admin:
1. **Penyaring Periode (Date Range Selector):**
   * Sediakan input date-picker `start_date` dan `end_date`. Saat berubah, panggil kembali API `GET /api/v1/admin/analytics/usage?start_date=xxx&end_date=yyy`.
2. **Tren Harian (Daily Trend Line/Bar Chart):**
   * **Data Binding:** Petakan list `charts.daily_trend`. Gunakan koordinat X untuk `date`, dan koordinat Y ganda: satu garis untuk `tokens` (sumbu kiri) dan satu garis untuk `cost_usd` (sumbu kanan) atau plot kueri `tavily_queries`.
3. **Proporsi Model & Tugas (Pie/Donut Charts):**
   * **Model Breakdown:** Render data `charts.model_breakdown` ke dalam Pie Chart untuk memperlihatkan model mana yang paling boros token (menggunakan `total_tokens`) atau kontribusi biaya terbesar (`total_cost_usd`).
   * **Task Breakdown:** Lakukan visualisasi donat serupa untuk `charts.task_breakdown` guna mengidentifikasi tipe task LLM yang paling sering dijalankan.
4. **Tabel Audit Run (Runs Table):**
   * Tampilkan list dari `runs_table` ke dalam tabel interaktif.
   * Urutkan tabel secara default berdasarkan tanggal pembuatan (`created_at` desc) atau berikan kontrol sorting pada kolom `total_tokens` dan `total_cost_usd` untuk memperlihatkan pencarian mana yang paling menguras kuota.
   * Sediakan link navigasi dari kolom `analysis_public_id` menuju detail run untuk memanggil API `/usage` individual jika admin ingin melihat trace logs teknis secara spesifik!

---

*Dokumen ini diperbarui secara berkala seiring penambahan fitur administrasi di backend.*
