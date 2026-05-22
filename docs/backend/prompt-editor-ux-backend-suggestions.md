# Prompt Workspace Backend Contract

## Tujuan
Dokumen ini merangkum kontrak backend yang dipakai frontend setelah prompt editor disederhanakan menjadi model **working draft + publish**.

## Model UX yang Dipakai Frontend
- User membuka satu template.
- Frontend menampilkan **working draft** sebagai sumber edit utama.
- User menyimpan perubahan kecil ke draft tanpa perlu memikirkan lineage atau source version id.
- User melakukan validate dan preview ke backend.
- Saat siap, user melakukan **publish** untuk membuat versi runtime yang aktif.
- History version tetap ada untuk audit dan rollback, tapi bukan model edit harian.

## Endpoint yang Diharapkan Frontend

### 1. Detail Template
`GET /api/v1/prompt-templates/{template_id}`

Response ideal:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Company Analysis",
    "task_type": "analysis",
    "description": "Main prompt",
    "active_version_id": "ver_2",
    "active_version": {},
    "working_draft": {},
    "editor_state": {
      "mode": "draft",
      "source": "working_draft",
      "message": "Editing working draft"
    },
    "versions": []
  }
}
```

Catatan:
- `working_draft` harus berisi `content`, `input_schema`, `output_schema`, `model_preferences`, dan `change_note` bila ada.
- `active_version` dipakai untuk badge published dan fallback bila `working_draft` belum ada.
- `versions` tetap dipakai untuk history.

### 2. Save Working Draft
`PATCH /api/v1/prompt-templates/{template_id}/draft`

Payload:
```json
{
  "content": "updated prompt",
  "input_schema": {},
  "output_schema": {},
  "model_preferences": {},
  "change_note": "perbaikan instruksi summary"
}
```

Behavior:
- Menyimpan perubahan ke working draft tunggal template.
- Tidak membuat user harus mengirim `created_from_version_id`.
- Tidak mewajibkan `version_tag`.

### 3. Publish Working Draft
`POST /api/v1/prompt-templates/{template_id}/publish`

Payload:
```json
{
  "version_tag": "v3",
  "change_note": "publish prompt summary refinement"
}
```

Behavior:
- Membuat atau memperbarui versi published/runtime dari working draft.
- `version_tag` hanya metadata publish, bukan field wajib saat edit harian.

### 4. Variable Catalog
`GET /api/v1/prompt-templates/{template_id}/variables`

Dipakai untuk:
- quick insert variable
- tooltip yang jelas
- validasi token yang lebih akurat

### 5. Validate Draft
`POST /api/v1/prompt-templates/{template_id}/versions/validate`

Dipakai frontend sebelum publish untuk menampilkan:
- `tokens_used`
- `unknown_tokens`
- `missing_required_variables`
- `warnings`

### 6. Render Preview
`POST /api/v1/prompt-templates/{template_id}/versions/render-preview`

Dipakai frontend untuk memastikan hasil render backend sesuai isi draft terbaru.

## Aturan Backend yang Diandalkan Frontend
- `working_draft` adalah sumber edit utama.
- `active_version` adalah versi published yang dipakai runtime.
- Published version tidak boleh dihapus sembarangan.
- History version boleh tetap dipakai untuk rollback lewat activate/publish ulang.
- Semua error admin sebaiknya mengembalikan `request_id`.

## Fallback Frontend
Jika backend belum mengirim `working_draft`, frontend sementara akan:
1. pakai `active_version` sebagai dasar edit,
2. menampilkan status jujur bahwa editor sedang memakai published version sebagai fallback.

## Ringkasan
Frontend sekarang tidak lagi mendorong user ke model version-first untuk edit harian. Agar UX tetap sederhana dan previous data selalu tampil dengan benar, backend perlu konsisten mengembalikan:
1. `working_draft`
2. `active_version`
3. `versions`
4. endpoint `PATCH /draft`
5. endpoint `POST /publish`
