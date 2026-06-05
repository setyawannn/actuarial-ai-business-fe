# Panduan Integrasi Visualisasi Chart (Update)

## Penanganan Data Chart Kosong (Backward Compatibility)

Untuk analisa-analisa *run* sebelumnya yang digenerate sebelum fitur Chart diimplementasikan, *endpoint* backend `GET /api/v1/analysis/{analysis_public_id}/charts` sekarang akan mengembalikan *array* kosong `[]` dengan HTTP status 200, bukan error 404.

```json
{
  "success": true,
  "code": "CHARTS_RETRIEVED",
  "message": "0 chart(s) retrieved for analysis run req_xxxxx.",
  "data": [],
  "meta": { ... }
}
```

### Rekomendasi untuk Frontend (Tim FE)
Diharapkan komponen *wrapper* atau halaman visualisasi (misalnya di tab "Charts & Visualizations") dapat **menyembunyikan (hide) widget/section chart** apabila response dari data `charts` kosong (`charts.length === 0`). 

Hal ini akan memastikan *backward compatibility* dan mencegah munculnya *error state* kosong di layar pengguna saat membuka histori analisis lama.

Contoh penanganan di sisi FE:
```tsx
const { data: charts, isLoading, error } = useCharts(publicId);

// Jangan render apa-apa (hide) jika chart tidak tersedia
if (!isLoading && (!charts || charts.length === 0)) {
  return null; 
}
```

Hal ini sudah diperbaiki di sisi Backend (BE) sehingga BE tidak lagi memunculkan *error* 404 untuk analisa yang *valid* meskipun belum memiliki data *chart*. 
