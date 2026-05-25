# Cubiconia Business Intelligence — Timeline MVP

## Target Utama

Target project saat ini adalah menyelesaikan **MVP V1.5 demo-ready bulan depan**.

MVP ini belum menjadi produk final penuh, tetapi sudah cukup untuk ditunjukkan sebagai aplikasi AI company analysis yang memiliki:

```text
- login
- input analisis perusahaan
- summary/report
- sources dan data gaps
- chart dasar
- forecast/scenario kualitatif
- UX loading yang lebih baik
- context questions jika AI kurang konteks
```

---

## Status Saat Ini

```text
Minggu 1: Backend core selesai
Minggu 2: Frontend core selesai
Minggu 3: Sedang berjalan
```

---

## Minggu 1 — Done

### Fokus

Backend core aplikasi.

### Sudah dikerjakan

```text
- Auth / JWT
- Analysis API
- LLM integration
- Tavily integration
- PostgreSQL base schema
- Prompt/template flow
- Summary/report generation
- Source dan data gap handling
```

### Status

```text
Done
```

---

## Minggu 2 — Done

### Fokus

Frontend core aplikasi.

### Sudah dikerjakan

```text
- Login page
- Analysis form
- Summary page
- Report page
- Source/data gap display
- API integration
- Basic protected route
```

### Status

```text
Done
```

---

## Minggu 3 — Current

### Fokus

Chart dasar, UX improvement, dan optimasi token dasar.

### Target minggu ini

```text
- Summary page punya chart dasar
- Loading tidak hanya spinner
- Chart punya fallback jika data tidak cukup
- Penggunaan Gemini lebih hemat dan stabil
```

### Backend task

```text
1. Buat ChartDataGenerator.
2. Buat table analysis_charts.
3. Buat endpoint:
   GET /api/v1/analysis-runs/{analysis_public_id}/charts
4. Generate chart dasar:
   - Risk Domain Breakdown
   - Data Availability Breakdown
   - Source Coverage
   - Forecast Scenario Cards
5. Tambahkan chart fallback jika data tidak cukup.
6. Tambahkan token logging per LLM call.
7. Tambahkan model routing:
   - Flash/Flash-Lite untuk task ringan
   - Pro hanya untuk final analysis/report
8. Tambahkan retry/backoff untuk 429 dan 503.
9. Batasi concurrency LLM call.
```

### Frontend task

```text
1. Install Recharts.
2. Buat useAnalysisCharts.
3. Buat DynamicChartRenderer.
4. Tambahkan ChartSection di summary page.
5. Buat ChartFallback.
6. Tambahkan badge:
   - AI-derived
   - Source-backed
   - Confidence
7. Buat loading UX:
   - AI Analysis Workspace
   - pipeline stepper
   - activity feed
   - report skeleton
```

### Definition of Done minggu 3

```text
- Risk Domain Breakdown tampil.
- Data Availability Breakdown tampil.
- Source Coverage tampil.
- Forecast Scenario Cards tampil.
- Chart tidak kosong tanpa alasan.
- Loading UX lebih informatif.
- Token logging tersedia.
- Gemini Pro tidak dipakai untuk task chart/extraction ringan.
- 429/503 lebih aman dengan retry dan backoff.
```

---

## Minggu 4

### Fokus

Context improvement.

### Target

Kalau AI kurang konteks, sistem tidak error, tetapi bertanya ke user.

### Backend task

```text
- Tambahkan Data Sufficiency Check.
- Tambahkan response NEEDS_MORE_CONTEXT.
- Tambahkan Context Question Generator.
- Simpan context questions dan context answers.
```

### Frontend task

```text
- Tampilkan pertanyaan jika response NEEDS_MORE_CONTEXT.
- User bisa jawab pertanyaan.
- User bisa skip dan tetap generate report.
```

### Definition of Done

```text
- AI bisa meminta konteks tambahan.
- User tidak dipaksa mengisi form panjang di awal.
- Jika user skip, report tetap dibuat dengan confidence lebih rendah.
```

---

## Minggu 5

### Fokus

Event timeline dan risk taxonomy.

### Target

Menjawab pertanyaan utama:

```text
Dalam 3 tahun terakhir bisnis ini terkena apa saja?
```

### Backend task

```text
- Extract event dari source summaries.
- Klasifikasi event:
  - financial
  - debt/liquidity
  - employee/people
  - management/governance
  - legal/regulatory
  - market
  - reputation
  - operational
- Tambahkan severity dan confidence.
```

### Frontend task

```text
- Tambahkan Event Timeline.
- Tambahkan Risk Domain Map.
- Tampilkan status risk:
  - detected
  - not detected
  - unknown
  - insufficient data
```

### Definition of Done

```text
- Summary punya timeline kejadian 3 tahun terakhir.
- Risk domain lebih jelas dan mudah dibaca.
```

---

## Minggu 6

### Fokus

Redis async/progress/cache jika diperlukan.

### Target

Analysis panjang tidak terasa menggantung.

### Backend task

```text
- Tambahkan Redis untuk progress/cache/queue.
- Tambahkan background worker.
- Tambahkan progress endpoint.
- Cache Tavily/Gemini result dasar.
```

### Frontend task

```text
- Polling progress.
- AI Analysis Workspace memakai status real.
- Redirect ke result saat completed.
```

### Definition of Done

```text
- Analysis bisa berjalan async.
- User bisa melihat progress.
- Request panjang tidak terasa freeze.
```

---

## Target Akhir Bulan Depan

### Target MVP V1.5 Demo-Ready

Pada akhir bulan depan, target aplikasi adalah:

```text
- Login berjalan.
- User bisa input perusahaan.
- AI mencari data publik.
- Summary/report tampil.
- Source dan data gap tampil.
- Chart dasar tampil.
- Forecast/scenario kualitatif tampil.
- Jika data kurang, sistem meminta konteks tambahan.
- Jika user skip, report tetap dibuat dengan limitation.
- Loading UX terasa hidup.
- Token usage lebih terkontrol.
```

---

## Yang Belum Menjadi Target Bulan Depan

Hal berikut belum wajib selesai bulan depan:

```text
- ClickHouse
- scraping besar
- OCR/PDF extraction
- GPU/ML pipeline
- financial chart dari annual report valid
- dashboard analytics lintas perusahaan
- Superset
- full quantitative forecasting
```

---

## Roadmap Setelah MVP V1.5

### Phase Next — Real Data Chart

```text
- Label chart sebagai AI-derived atau Source-backed.
- Metric validation.
- Extracted facts.
- Financial chart hanya jika data valid.
```

### Phase Next — ClickHouse

Masuk jika:

```text
- chart data makin besar
- event timeline makin banyak
- butuh dashboard lintas perusahaan
- butuh agregasi per industri/negara
```

### Phase Next — Self-hosted Extraction

Masuk jika:

```text
- perlu extract financial table
- perlu baca annual report PDF
- perlu OCR
- perlu scraping HTML table
```

---

## Prioritas Saat Ini

Untuk minggu ke-3, jangan keluar dari scope berikut:

```text
1. Chart dasar
2. UX loading improvement
3. Token logging
4. Model routing
5. Retry/backoff Gemini
6. Chart fallback
```

Jangan dulu fokus ke:

```text
- ClickHouse
- scraping besar
- financial chart
- GPU/ML
- OCR
```

---

## Kesimpulan

Target yang realistis:

```text
Bulan depan selesai untuk MVP V1.5 demo-ready.
```

Bukan target saat ini:

```text
Produk final advanced analytics sepenuhnya.
```

Versi yang dituju bulan depan:

```text
Cubiconia Business Intelligence V1.5
AI company analysis with summary, basic dynamic charts, context questions, data gaps, and qualitative 3-year outlook.
