# 01 - Project Foundation

## Tujuan
Menyiapkan fondasi Next.js 16 + TypeScript + Bun agar semua module berikutnya punya baseline yang konsisten, strict, dan siap dioptimasi.

## Implementation Checklist
- Validasi stack aktif: Next.js App Router, React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui terbaru, Bun lockfile.
- Tambahkan dependency inti yang belum ada saat implementasi fitur: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `react-markdown`, `remark-gfm`, `sonner`.
- Siapkan env frontend: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `BACKEND_API_BASE_URL`, `APP_ENV`.
- Pastikan hanya `NEXT_PUBLIC_*` boleh terbaca browser; secret backend, JWT secret, provider keys, dan credential tidak boleh masuk client bundle.
- Pertahankan path alias `@/*` dan struktur App Router.
- Tambahkan `app/providers.tsx` untuk provider global yang akan dipakai TanStack Query, theme, tooltip, dan toast.
- Tambahkan optional script analyzer saat dibutuhkan: `analyze`.

## Contract Rules
- Browser tidak boleh call FastAPI langsung.
- Semua komunikasi protected lewat Next route handlers sebagai BFF.
- Semua module analysis wajib memakai `analysis_public_id`, bukan internal id.
- Output utama V1: structured analysis response, markdown report, source table, data gaps, forecast summary, scenario highlights.

## Acceptance Criteria
- Project bisa install dependency dengan Bun.
- `bun run typecheck`, `bun run lint`, dan `bun run build` menjadi quality gate utama.
- Env documented dan tidak mengekspos secret ke browser.
- Provider root siap dipakai module auth, query, toast, dan UI shell.
