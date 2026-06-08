# Threat Modeling STRIDE - Sagara Daily Checkup

## 1) Ruang Lingkup Sistem

Analisis ini dibuat berdasarkan kode Laravel + Inertia pada repository ini, khususnya:

- Autentikasi dan otorisasi role: `Admin`, `Driver`, `Mekanik`.
- Modul pengajuan perbaikan kendaraan (`KerusakanController`).
- Modul towing (`TowingController`).
- Modul upload struk bensin (`BensinController`).
- Modul generate key user (`GenerateKeyController`).
- Modul bill perbaikan (`BillController`).

Komponen utama yang dianalisis:

- **Client/UI**: halaman Inertia React.
- **Web Server Laravel**: route, middleware, controller.
- **Session & Auth**: login berbasis `username + key`.
- **Database**: tabel user, kendaraan, kerusakan, bill, towing, struk bensin.
- **File Storage**: disk `public` untuk upload gambar.

## 2) Aset yang Harus Dilindungi

- Data identitas user (username, role, key).
- Data operasional kendaraan dan pengajuan perbaikan.
- Data biaya bill dan bukti gambar.
- Data lokasi towing (potensi data sensitif).
- File gambar upload (profil, struk, bukti bill).
- Integritas status proses (`Pending`, `Perbaikan`, `Normal`, `is_accept`, dll).

## 3) Tabel Analisis STRIDE

| No | Kategori STRIDE | Contoh Ancaman pada Kode Ini | Komponen Terdampak | Risiko | Mitigasi Rekomendasi |
|---|---|---|---|---|---|
| 1 | Spoofing | Penyerang menebak `username + key` (key 8 karakter) untuk login sebagai role tertentu. | Auth controller, session, user account | High | Tambahkan MFA atau OTP untuk role sensitif, rate limit login per IP+username, lockout sementara setelah gagal berulang, kebijakan rotasi key. |
| 2 | Spoofing | Session hijacking jika cookie/session bocor di perangkat publik. | Session auth seluruh role | Medium | Pastikan `secure`, `http_only`, `same_site` aktif di produksi, paksa HTTPS, timeout session idle, logout all sessions saat key diubah. |
| 3 | Tampering | Manipulasi request ID (mis. `struk_bensin_id`, `towing_id`) untuk mengubah/menghapus data user lain. | Endpoint cancel/update berbagai modul | Medium | Sudah ada ownership check di controller; pertahankan pola ini di semua endpoint baru, tambah policy/gate terpusat agar konsisten. |
| 4 | Tampering | Upload file berbahaya dengan ekstensi gambar palsu/polyglot. | Storage publik dan endpoint upload gambar | Medium | Tetap validasi MIME + size (sudah ada), random filename (sudah default), scan malware (opsional), simpan di non-public path lalu serve via controller bila data sensitif. |
| 5 | Repudiation | User menyangkal pernah melakukan aksi (approve, cancel, update) karena audit trail belum eksplisit. | Proses bisnis kritis admin/driver/mekanik | Medium | Tambahkan audit log tabel/event: siapa, kapan, endpoint, payload penting, old/new value, IP dan user-agent. |
| 6 | Information Disclosure | Key user tersimpan/ditampilkan sebagai plaintext (modul generate key menampilkan `key`). | Data kredensial user | High | Jangan tampilkan key penuh setelah pembuatan, gunakan hashing untuk verifikasi credential, masking key di UI/log, batasi akses ketat ke modul generate key. |
| 7 | Information Disclosure | File upload disimpan di disk public (`/storage/...`) sehingga bisa diakses jika URL diketahui. | Gambar struk/bukti/profil | Medium | Untuk dokumen sensitif gunakan private storage + signed URL/controller auth check; validasi kepemilikan sebelum download/view. |
| 8 | Denial of Service | Spam upload file atau spam request pengajuan menyebabkan beban storage/DB. | Endpoint upload dan create record | Medium | Rate limiting per endpoint (`throttle`), quota upload per user/hari, background cleanup orphan files, alert ketika lonjakan request. |
| 9 | Denial of Service | Query berat pada dashboard/list tanpa pembatasan cukup bisa memperlambat aplikasi saat data besar. | Dashboard admin, listing history | Low/Medium | Pastikan pagination konsisten, index DB pada kolom filter/sort (`created_at`, foreign key), caching agregasi dashboard. |
|10| Elevation of Privilege | Celah role bypass jika middleware tidak terpasang pada route baru yang ditambahkan developer. | Route group dan endpoint baru | High | Wajibkan semua route dalam group middleware role, tambah test otomatis untuk akses role (guest/admin/driver/mekanik) seperti pattern test yang sudah ada. |
|11| Elevation of Privilege | Admin dengan akses generate key dapat membuat akun role tinggi tanpa kontrol tambahan. | Modul `GenerateKeyController` | Medium | Tambahkan approval flow untuk pembuatan akun admin, least privilege, batasi siapa yang bisa akses generate key, audit semua perubahan akun. |
|12| Repudiation + Tampering | Perubahan status bisnis kritis (`is_accept`, status kendaraan) tanpa jejak perubahan detail. | Proses approval/reject/cancel | Medium | Simpan status history terpisah (`status_logs`) berisi actor dan timestamp untuk traceability dan investigasi insiden. |

## 4) Prioritas Mitigasi (Quick Wins)

Prioritas implementasi yang paling berdampak:

1. **Lindungi kredensial key**: hentikan pemaparan plaintext key, gunakan hash + masking.
2. **Tambahkan rate limit**: endpoint login, upload gambar, dan create request.
3. **Audit trail wajib**: log aksi sensitif (approve, cancel, update, delete).
4. **Perkuat akses file**: pindahkan file sensitif ke private storage + access check.
5. **Perluas test keamanan akses role**: pastikan tidak ada route yang lolos tanpa middleware role.

## 5) Asumsi dan Batasan Analisis

- Analisis dilakukan dari source code aplikasi; tidak mencakup hardening server OS/network secara detail.
- Konfigurasi produksi (`APP_DEBUG=false`, HTTPS, secure cookie, firewall) diasumsikan belum diverifikasi di dokumen ini.
- Tidak ada static/dynamic security scanning tool yang dijalankan pada tahap ini; hasil bersifat threat modeling manual berbasis arsitektur dan implementasi kode.

