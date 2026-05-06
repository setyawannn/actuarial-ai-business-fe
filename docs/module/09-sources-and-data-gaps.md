# 09 - Sources and Data Gaps

## Tujuan
Membangun tampilan evidence source dan data gap tanpa bergantung pada internal numeric id.

## Implementation Checklist
- Buat `/analysis/[analysisPublicId]/sources`.
- Fetch `GET /api/analysis/runs/[analysisPublicId]/sources`.
- Render source table dengan kolom:
  - title
  - domain
  - source_type
  - credibility_score
  - relevance_score
  - url
- Tampilkan `raw_snippet` capped dari backend sebagai detail expandable atau compact preview.
- Render data gaps dari response run/overview bila tersedia:
  - missing_item
  - importance
  - reason
  - recommended_action
- Tambahkan action open source URL dan copy URL bila cocok.
- Tambahkan empty state untuk no sources dan no data gaps.

## Rendering Key Rules
- Source key utama: `${source.url}-${index}`.
- Source fallback: `${source.title ?? "source"}-${index}`.
- Data gap key: `${gap.missing_item}-${index}`.
- Jangan memakai internal numeric id sebagai dependency UI.
- Jika backend mengirim `id`, anggap optional dan public-safe only; tetap gunakan content + index untuk rendering key.

## Contract Rules
- Source table memakai `sources`, bukan markdown.
- Data gap list memakai `data_gaps`, bukan markdown.
- `raw_snippet` sudah capped 800 characters dari backend.

## Acceptance Criteria
- Sources page render stabil walau `id` tidak ada.
- Link source aman dibuka di tab baru dengan `rel="noreferrer"`.
- Data gaps tampil tanpa key collision berbasis internal id.
- Error UI menampilkan `message` dan `request_id`.
