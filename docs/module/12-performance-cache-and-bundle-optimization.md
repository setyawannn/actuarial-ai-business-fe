# 12 - Performance Cache and Bundle Optimization

## Tujuan
Mengoptimasi server/client boundary, TanStack Query cache, bundle size, dan over-fetching.

## Implementation Checklist
- Konfigurasi QueryClient:
  - queries retry `1`
  - mutations retry `0`
  - `refetchOnWindowFocus: false`
  - default `staleTime: 60_000`
  - default `gcTime: 10 * 60_000`
- Override cache per resource:
  - auth me: stale 5 menit, gc 30 menit
  - history: stale 30 detik, gc 10 menit
  - running detail: stale 30 detik
  - completed detail: stale 10 menit, gc 30 menit
  - report: stale 30 menit atau Infinity, gc 60 menit
  - sources: stale 30 menit, gc 60 menit
  - admin data: stale 1 menit, gc 10 menit
- Setelah analysis run sukses, pakai `queryClient.setQueryData` untuk report/sources/detail agar tidak refetch langsung.
- Fetch sources hanya pada sources page/tab.
- Fetch report hanya pada report page atau overview reload yang butuh summary.
- Dynamic import heavy components: markdown report, admin editor, future chart components.
- Hindari package berat seperti chart library besar, monaco, moment, full lodash, syntax highlighter kecuali dibutuhkan.
- Tambahkan Next config optimize package imports untuk `lucide-react` dan `react-markdown` jika kompatibel.

## Server Component Rules
- Server Components default untuk static layout dan page shell.
- Client Components hanya untuk form, query hooks, tabs, toast, dialogs, admin editors, dan interactive controls.
- Browser fetch hanya ke internal `/api/*`.

## Bundle and Secret Rules
- Jalankan analyzer sebelum rilis bila dependency bertambah.
- Pastikan tidak ada provider key, JWT secret, LLM key, Tavily key, atau backend credential di client bundle.
- Gunakan `NEXT_PUBLIC_*` hanya untuk public runtime value.

## Acceptance Criteria
- Tidak ada refetch report langsung setelah successful run.
- Cache key semua analysis memakai `analysis_public_id`.
- Markdown/admin heavy component tidak masuk initial route bundle yang tidak membutuhkan.
- Build production tidak mengekspos secret.
