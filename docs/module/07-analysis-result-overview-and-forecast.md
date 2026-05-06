# 07 - Analysis Result Overview and Forecast

## Tujuan
Membangun `/analysis/[analysisPublicId]` sebagai halaman overview structured analysis, termasuk score, summary, risiko, rekomendasi, limitation, data gaps ringkas, dan forecast.

## Implementation Checklist
- Ambil data dari cache hasil submit bila tersedia.
- Pada reload, fetch:
  - `GET /api/analysis/runs/[analysisPublicId]`
  - `GET /api/analysis/runs/[analysisPublicId]/report` bila summary/report dibutuhkan.
- Render header dari `report_summary.company_name`, `report_summary.analysis_goal`, dan `status`.
- Render score cards dari `scores.overall_risk_score`, `scores.confidence_score`, `scores.data_availability_score`.
- Render risk badge dari `report_summary.overall_risk_level`.
- Render summary dari `report_summary.overall_conclusion`, `top_findings`, dan `top_risks`.
- Render recommendations dari `recommendations` dan `next_steps`.
- Render limitations dari `key_limitations`, `data_requests`, dan ringkasan `data_gaps`.
- Render forecast cards:
  - historical 3-year summary
  - forecast 3-year summary
  - forecast confidence
  - forecast methods used
  - scenario highlights

## Forecast Rules
- Source forecast hanya dari `report_summary`.
- Confidence check case-insensitive.
- Jika `forecast_confidence` adalah `low`, `unknown`, `partial`, atau `insufficient`, tampilkan label: forecast bersifat kualitatif dan bukan prediksi presisi.
- Jangan membuat scenario label sendiri jika backend tidak mengirim.
- Jika forecast field kosong, tampilkan empty state ringan tanpa mengarang data.

## Contract Rules
- Jangan parse markdown untuk score, badge, summary, forecast, source, atau data gap.
- Semua route link pakai `analysisPublicId`.
- Non-owner read dengan `ANALYSIS_NOT_FOUND` tampil sebagai not found state.

## Acceptance Criteria
- Overview tetap render walau `report_summary` sebagian kosong.
- Forecast qualitative label muncul untuk low/unknown/partial/insufficient.
- Score, summary, dan forecast berasal dari structured response.
- Halaman menyediakan link ke report dan sources.
