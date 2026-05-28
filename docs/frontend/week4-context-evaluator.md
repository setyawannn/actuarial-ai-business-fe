# Week 4 Frontend Changes: Context Evaluator Integration

Dokumen ini berisi panduan untuk tim frontend mengenai perubahan-perubahan API dan state yang diperkenalkan pada Minggu 4, khususnya fitur **Data Sufficiency Check (Context Evaluator)**.

## 1. Konsep Utama
Pada proses analisis eksternal, setelah data dari internet dikumpulkan, AI kini akan mengevaluasi apakah data tersebut cukup untuk melakukan analisis. Jika data dinilai kurang (misalnya untuk perusahaan tertutup/private yang datanya minim), analisis akan "berhenti sementara" (paused) dan AI akan memberikan daftar pertanyaan spesifik kepada user untuk melengkapi konteks.

## 2. Perubahan pada State `status`
Terdapat beberapa tambahan status baru pada siklus `AnalysisRun`:
- `evaluating_context` (sementara): AI sedang mengevaluasi kecukupan data.
- **`needs_more_context`**: Ini adalah status kritis yang harus ditangkap oleh frontend. Analisis terhenti sementara menunggu user menjawab pertanyaan.
- `resuming_analysis`: Status transisi saat jawaban sudah di-submit dan analisis kembali berjalan.

## 3. Perubahan Payload pada GET Analysis Run
Ketika melakukan *polling* ke endpoint `GET /analysis-runs/{analysis_public_id}`, apabila `status == "needs_more_context"`, backend kini akan menyertakan properti `context_questions`.

```json
{
  "code": "SUCCESS",
  "data": {
    "analysis_public_id": "anl_xxxx",
    "status": "needs_more_context",
    "progress": 60,
    ...
    "context_questions": [
      {
        "question_id": "q_revenue_data",
        "question_text": "Apa model pendapatan utama dari perusahaan ini?",
        "reason_why_needed": "Sangat penting untuk menghitung proyeksi margin dan valuasi 3 tahun ke depan."
      }
    ]
  }
}
```

## 4. Endpoint Baru: Submit Context Answers
Setelah menampilkan form pertanyaan kepada user, frontend harus mengirimkan jawaban (atau mengabaikannya) ke endpoint baru berikut:

**Endpoint**: `POST /analysis-runs/{analysis_public_id}/context-answers`
**Auth**: Bearer Token (diperlukan)

### Payload Request (User Menjawab)
```json
{
  "answers": [
    {
      "question_id": "q_revenue_data",
      "answer": "Pendapatan utama dari B2B SaaS subscription dengan model tahunan."
    }
  ],
  "is_skipped": false
}
```

### Payload Request (User Melewati/Skip)
Jika user tidak tahu jawabannya dan ingin AI tetap memaksakan analisis dengan data yang ada, frontend bisa mengirimkan request skip:
```json
{
  "answers": [],
  "is_skipped": true
}
```

### Response
Jika sukses, backend akan mengembalikan status code 200 dan analisis akan otomatis dilanjutkan.
```json
{
  "code": "ANALYSIS_RESUMED",
  "message": "Analysis resumed successfully.",
  "data": { ... }
}
```

## 5. Alur UI yang Diharapkan
1. **Polling Normal**: Frontend mem-polling `GET /analysis-runs/{analysis_public_id}` setiap beberapa detik.
2. **Intersepsi Status**: Jika response menunjukkan `status: "needs_more_context"`, **hentikan polling**.
3. **Tampilkan Form**: Tampilkan modal atau layar khusus berisi daftar `context_questions`. Tampilkan teks pertanyaan (`question_text`) beserta alasan (`reason_why_needed`).
4. **Input User**: Sediakan field input teks untuk setiap pertanyaan, tombol "Submit Jawaban", dan tombol "Skip / Lanjutkan Tanpa Konteks".
5. **Kirim Request**: Panggil endpoint `POST /analysis-runs/{analysis_public_id}/context-answers`.
6. **Lanjutkan Polling**: Setelah request berhasil, tampilkan kembali layar loading/progress bar dan lanjutkan rutinitas polling setiap beberapa detik sampai `status == "completed"`.
