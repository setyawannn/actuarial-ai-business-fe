# 01 - Project Foundation

## Tujuan
Menyiapkan baseline project agar module auth, BFF, dan analysis berikutnya dibangun di atas stack yang konsisten, ringan, dan siap dikembangkan.

## Baseline Saat Ini
- Next.js `16.1.7`
- React `19.2.4`
- TypeScript strict aktif
- Tailwind CSS `4`
- shadcn `4.6.0`
- Bun lockfile sudah ada
- Alias `@/*` sudah aktif
- Struktur dasar `app/`, `components/`, `lib/`, dan `hooks/` sudah ada

## Yang Harus Disiapkan
- Install dependency:
  - `@tanstack/react-query`
  - `react-hook-form`
  - `@hookform/resolvers`
  - `zod`
  - `react-markdown`
  - `remark-gfm`
  - `sonner`
  - optional: `@next/bundle-analyzer`
- Tambah `app/providers.tsx` untuk provider global: query, theme, tooltip, dan toast.
- Siapkan env:
  - `NEXT_PUBLIC_APP_NAME`
  - `NEXT_PUBLIC_APP_URL`
  - `BACKEND_API_BASE_URL`
  - `APP_ENV`
- Kunci baseline rule:
  - browser hanya call internal `/api/*`
  - token disimpan di httpOnly cookie via BFF
  - hanya `NEXT_PUBLIC_*` yang boleh terbaca browser
  - secret non-`NEXT_PUBLIC_*` tidak boleh masuk client bundle

## Acceptance Criteria
- Dependency foundation siap untuk module berikutnya.
- `app/providers.tsx` sudah direncanakan sebagai provider root utama.
- Env dasar terdokumentasi dan aman untuk client/server boundary.
- Quality gate project: `bun run typecheck`, `bun run lint`, `bun run build`.
