# Integrasi Export PDF (Frontend)

Dokumentasi ini menjelaskan cara kerja dan cara memanggil endpoint backend untuk mengunduh **Risk and Business Analysis Report** dalam format PDF yang rapi dan profesional.

## Endpoint

```http
GET /api/v1/analysis/{analysis_public_id}/export-pdf
```
> Atau bergantung pada prefix routing yang Anda gunakan, bisa juga di: `/api/v1/analysis/runs/{analysis_public_id}/export-pdf`

- **Method:** `GET`
- **Response:** `application/pdf` (Byte Stream)
- **Authentication:** Bearer Token (sama seperti endpoint analysis lainnya)

## Cara Integrasi di Frontend

Karena respons yang dikembalikan bukanlah data JSON melainkan *file binary (Blob)*, Anda tidak bisa sekadar memparsing response ke JSON. Anda harus memberi tahu klien HTTP (seperti `fetch` atau `axios`) bahwa Anda menerima tipe `blob`.

Berikut adalah contoh fungsi di TypeScript/JavaScript untuk men-*trigger* download PDF saat tombol diklik.

### Menggunakan `Fetch API`

```javascript
async function downloadReportPDF(analysisPublicId, token) {
  try {
    const response = await fetch(`/api/v1/analysis/${analysisPublicId}/export-pdf`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Gagal mengunduh PDF");
    }

    // 1. Ekstrak data sebagai Blob
    const blob = await response.blob();
    
    // 2. Ambil filename dari header Content-Disposition (opsional)
    // Atau Anda bisa menggunakan nama file default yang Anda tentukan sendiri
    let filename = "Analysis_Report.pdf";
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.indexOf("filename=") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // 3. Buat Object URL untuk blob
    const url = window.URL.createObjectURL(blob);
    
    // 4. Buat elemen <a> sementara untuk men-trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    
    // 5. Append, click, lalu hapus link tersebut
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 6. Bebaskan memory
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error downloading PDF:", error);
    // Tampilkan toast/notifikasi error ke user
  }
}
```

### Menggunakan `Axios`

Jika proyek Anda menggunakan Axios, pastikan Anda menambahkan `responseType: 'blob'`:

```javascript
import axios from 'axios';

async function downloadReportPDFAxios(analysisPublicId) {
  try {
    const response = await axios.get(`/api/v1/analysis/${analysisPublicId}/export-pdf`, {
      responseType: 'blob', // SANGAT PENTING!
    });

    // Buat URL dan trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Ambil nama dari header (axios headers lowercase)
    let filename = 'Report.pdf';
    const disposition = response.headers['content-disposition'];
    if (disposition) {
       const match = disposition.match(/filename="(.+)"/);
       if (match && match.length > 1) {
           filename = match[1];
       }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Gagal mendownload PDF:", error);
  }
}
```

## Styling Notes
Skema warna PDF di-generate dan ditentukan oleh *backend* (`app/services/pdf_generator.py`). Saat ini backend menggunakan palet warna (Utama: Violet/Purple menyesuaikan OKLCH primary `oklch(0.496 0.265 301.924)`) yang mendekati *design language* dari Frontend agar terasa *seamless*. Tidak ada intervensi *style* PDF yang dibutuhkan dari sisi Frontend.
