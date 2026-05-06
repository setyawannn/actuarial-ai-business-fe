# Auth and Session Contract

## Analysis Contract Baseline

Frontend only uses `analysis_public_id` (`anl_<random>`) for analysis resources. Analysis is private to creator. Admin cannot read another user's analysis. `GET /api/v1/analysis-runs` is source of truth for history screen and returns caller-owned rows only. Non-owner detail/report/sources reads return `404 ANALYSIS_NOT_FOUND`.


Dokumen ini khusus untuk implementasi auth di frontend.

## 1. Endpoint Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

## 2. Login Request
```json
{
  "email": "admin@cubiconia.com",
  "password": "strong-password"
}
```

## 3. Login Success Response
```json
{
  "success": true,
  "code": "LOGIN_SUCCESS",
  "message": "Login successful.",
  "data": {
    "access_token": "jwt-access-token",
    "refresh_token": "jwt-refresh-token",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": 1,
      "email": "admin@cubiconia.com",
      "full_name": "Cubiconia Admin",
      "role": "admin"
    }
  },
  "meta": {
    "request_id": "req_xxx"
  },
  "errors": null
}
```

## 4. Frontend Session Rules
- simpan `access_token`
- simpan `refresh_token`
- kirim `Authorization: Bearer <access_token>` ke endpoint protected
- bila menerima `401`, frontend harus refresh token atau redirect ke login

## 5. Me Endpoint
Gunakan `GET /api/v1/auth/me` untuk:
- restore session
- mengetahui role user
- menentukan apakah halaman admin boleh diakses

## 6. Role Rule
- `admin`: boleh akses prompt/provider admin endpoints
- `user`: hanya boleh akses endpoint biasa
