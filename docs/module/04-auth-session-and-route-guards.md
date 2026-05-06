# 04 - Auth Session and Route Guards

## Tujuan
Membangun auth flow aman dengan JWT di httpOnly cookies, session restore, refresh token, dan guard role.

## Implementation Checklist
- Buat `/login` dengan React Hook Form + Zod.
- Login client call ke internal route `POST /api/auth/login`.
- BFF login call backend `POST /api/v1/auth/login`, simpan `access_token` dan `refresh_token` ke httpOnly cookies.
- Route login hanya return user object ke client, bukan token.
- Buat `GET /api/auth/me` untuk restore session.
- Buat `POST /api/auth/refresh` dan `POST /api/auth/logout`.
- Tambahkan middleware atau guard layout untuk protected route.
- Tambahkan `useMeQuery` dengan TanStack Query.
- Tambahkan `AdminOnly` untuk `/admin/prompts` dan `/admin/providers`.

## Cookie Rules
- `httpOnly: true`
- `secure: true` di production
- `sameSite: "lax"`
- `path: "/"`
- Jangan simpan token di `localStorage`, `sessionStorage`, atau client-readable state.

## Route Rules
- User belum login diarahkan ke `/login`.
- User login yang membuka `/login` diarahkan ke `/analysis/new` atau dashboard.
- Role `admin` boleh akses prompt/provider admin.
- Role `user` hanya akses endpoint normal.
- Admin tetap tidak boleh dianggap bisa membaca analysis user lain.

## Acceptance Criteria
- Login berhasil menyimpan token sebagai httpOnly cookies.
- Client tidak pernah menerima token.
- Session restore memakai `/api/auth/me`.
- Logout clear cookies dan invalidate `auth.me`.
- Unauthorized protected page redirect ke login.
