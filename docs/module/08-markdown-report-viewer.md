# 08 - Markdown Report Viewer

## Tujuan
Membangun `/analysis/[analysisPublicId]/report` sebagai reader markdown display-only untuk full report.

## Implementation Checklist
- Fetch `GET /api/analysis/runs/[analysisPublicId]/report`.
- Render `data.report_markdown` dengan `react-markdown` dan `remark-gfm`.
- Dynamic import markdown renderer agar bundle awal lebih ringan.
- Tampilkan header ringkas dari `report_summary` bila tersedia.
- Tambahkan skeleton loading, empty report state, not found state, dan error state.
- Sediakan navigasi balik ke overview dan sources.

## Markdown Rules
- Markdown hanya display-only.
- Jangan pakai `rehype-raw`.
- Jangan execute raw HTML.
- Jangan parse heading, appendix, bullet, atau angka dari markdown untuk UI state.
- Structured UI tetap memakai `report_summary` dan `scores`.

## Cache Rules
- Query key: `queryKeys.analysis.report(analysisPublicId)`.
- Recommended stale time: 30 menit atau Infinity untuk completed report.
- Recommended gc time: 60 menit.

## Acceptance Criteria
- Report markdown tampil dengan GFM table/list support.
- Raw HTML tidak dieksekusi.
- Error menampilkan `message` dan `request_id`.
- `ANALYSIS_NOT_FOUND` tampil sebagai not found.
