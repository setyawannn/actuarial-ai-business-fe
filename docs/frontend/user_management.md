# User and Role Management API

Modul ini menyediakan fitur manajemen pengguna dan peranan (role). Terdapat fungsionalitas khusus untuk Admin, serta fungsi dasar bagi pengguna umum untuk mengelola profil dan mengganti password.

## 1. Get Paginated Users (Admin Only)
Mengambil daftar pengguna dengan fitur pagination dan pencarian.

**Endpoint:** `GET /api/v1/admin/users`

**Query Parameters:**
- `page` (int, default=1): Nomor halaman
- `page_size` (int, default=20): Jumlah item per halaman
- `search` (str, optional): Cari berdasarkan nama atau email

**Contoh Response:**
```json
{
  "code": "SUCCESS",
  "message": "Fetched users successfully",
  "data": {
    "items": [
      {
        "email": "user@example.com",
        "full_name": "Test User",
        "role": "user",
        "is_active": true,
        "id": 1,
        "created_at": "2026-06-02T09:00:00Z",
        "updated_at": "2026-06-02T09:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20,
    "total_pages": 1
  }
}
```

## 2. Create User (Admin Only)
Admin dapat membuat pengguna baru dan menentukan peranan (role).

**Endpoint:** `POST /api/v1/admin/users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "New Admin User",
  "role": "admin",
  "is_active": true
}
```

**Contoh Response:**
```json
{
  "code": "CREATED",
  "message": "User created successfully",
  "data": {
    "email": "newuser@example.com",
    "full_name": "New Admin User",
    "role": "admin",
    "is_active": true,
    "id": 2,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

## 3. Update User (Admin Only)
Admin dapat mengedit pengguna, seperti mengganti role, status aktif, dll.

**Endpoint:** `PUT /api/v1/admin/users/{user_id}`

**Request Body (Fields bersifat Opsional):**
```json
{
  "role": "user",
  "is_active": false
}
```

## 4. Change Password (Semua Pengguna Terautentikasi)
Pengguna dapat mengubah passwordnya sendiri. **Harus menggunakan password lama untuk validasi.**

**Endpoint:** `POST /api/v1/auth/change-password`

**Request Body:**
```json
{
  "old_password": "passwordlama123",
  "new_password": "passwordbaru123"
}
```

**Contoh Response:**
```json
{
  "code": "SUCCESS",
  "message": "Password changed successfully.",
  "data": {
    "id": 1
  }
}
```

## 5. Update Profile (Semua Pengguna Terautentikasi)
Pengguna dapat memperbarui data dirinya sendiri (seperti nama lengkap).

**Endpoint:** `PUT /api/v1/auth/me`

**Request Body:**
```json
{
  "full_name": "Updated Name"
}
```

**Contoh Response:**
```json
{
  "code": "SUCCESS",
  "message": "Profile updated successfully.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Updated Name",
    "role": "user",
    "is_active": true
  }
}
```
