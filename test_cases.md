# Tabel Test Case - Sagara Daily Checkup

Dokumen ini berisi daftar test case yang diimplementasikan dalam pengujian fitur (Feature Testing) untuk aplikasi Sagara Daily Checkup.

---

## 1. AdminAuthControllerTest
**File:** `tests/Feature/AdminAuthControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-AUTH-01 | `test_show_login_form_renders_for_guest` | Guest mengakses halaman login admin | 1. Buka URL login admin | - | Status 200, Komponen 'Admin/LoginAdmin' muncul |
| 2 | REQ-AUTH-02 | `test_show_login_form_redirects_authenticated_admin` | Admin yang sudah login mencoba akses halaman login | 1. Login sebagai Admin<br>2. Buka URL login admin | Auth: Admin | Redirect ke dashboard admin |
| 3 | REQ-AUTH-03 | `test_show_login_form_shows_form_when_non_admin_authenticated` | Driver mencoba akses halaman login admin | 1. Login sebagai Driver<br>2. Buka URL login admin | Auth: Driver | Status 200 (Form login tetap tampil) |
| 4 | REQ-AUTH-04 | `test_login_with_valid_admin_credentials_redirects_to_dashboard` | Login admin dengan kredensial valid | 1. Input username admin<br>2. Input key valid<br>3. Klik login | username, key (8 karakter) | Redirect ke dashboard admin, user terautentikasi |
| 5 | REQ-AUTH-05 | `test_login_fails_when_username_is_missing` | Login admin tanpa username | 1. Kosongkan username<br>2. Input key<br>3. Klik login | username: "" | Error validasi pada field 'username' |
| 6 | REQ-AUTH-06 | `test_login_fails_when_key_is_missing` | Login admin tanpa key | 1. Input username<br>2. Kosongkan key<br>3. Klik login | key: "" | Error validasi pada field 'key' |
| 7 | REQ-AUTH-07 | `test_login_fails_when_key_is_not_8_characters` | Login admin dengan key tidak standar | 1. Input username<br>2. Input key (bukan 8 char)<br>3. Klik login | key: "SHORT" | Error validasi pada field 'key' |
| 8 | REQ-AUTH-08 | `test_login_fails_with_wrong_key` | Login admin dengan key salah | 1. Input username<br>2. Input key salah<br>3. Klik login | key: "WRONGKEY" | Error validasi pada field 'key' |
| 9 | REQ-AUTH-09 | `test_login_fails_when_user_is_not_admin_role` | Login sebagai admin menggunakan akun Driver | 1. Input username Driver<br>2. Input key Driver<br>3. Klik login | username (Driver), key | Error validasi pada field 'key' |
| 10 | REQ-AUTH-10 | `test_login_succeeds_with_lowercase_key_input` | Login admin dengan key huruf kecil | 1. Input username admin<br>2. Input key huruf kecil<br>3. Klik login | key: "abcd1234" | Redirect ke dashboard admin |
| 11 | REQ-AUTH-11 | `test_logout_logs_out_admin_and_redirects` | Admin melakukan logout | 1. Klik tombol logout | - | Redirect ke login admin, status kembali guest |
| 12 | REQ-PROF-01 | `test_update_gambar_uploads_image_successfully` | Admin update foto profil | 1. Pilih file gambar<br>2. Klik upload | gambar (JPG/PNG) | Redirect, success message, file tersimpan di storage |
| 13 | REQ-PROF-02 | `test_update_gambar_fails_when_no_file_provided` | Update foto profil tanpa file | 1. Klik upload tanpa pilih file | - | Error validasi pada field 'gambar' |
| 14 | REQ-PROF-03 | `test_update_gambar_fails_with_non_image_file` | Update foto profil dengan file non-gambar | 1. Pilih file PDF<br>2. Klik upload | gambar (PDF) | Error validasi pada field 'gambar' |
| 15 | REQ-PROF-04 | `test_update_gambar_fails_when_image_exceeds_max_size` | Update foto profil > 2MB | 1. Pilih file > 2MB<br>2. Klik upload | gambar (>2MB) | Error validasi pada field 'gambar' |
| 16 | REQ-PROF-05 | `test_update_gambar_deletes_old_local_image_on_update` | Hapus foto lama saat update foto profil | 1. Upload foto profil baru | gambar baru | File foto lama terhapus dari storage |
| 17 | REQ-DSHB-01 | `test_dashboard_renders_for_authenticated_admin` | Akses dashboard admin | 1. Login sebagai admin<br>2. Buka dashboard | Auth: Admin | Status 200, Komponen dashboard tampil |
| 18 | REQ-DSHB-02 | `test_dashboard_redirects_unauthenticated_user` | Guest dilarang akses dashboard admin | 1. Buka dashboard tanpa login | - | Redirect (302) ke halaman login |
| 19 | REQ-DSHB-03 | `test_dashboard_is_forbidden_for_driver_role` | Driver dilarang akses dashboard admin | 1. Login sebagai Driver<br>2. Buka dashboard admin | Auth: Driver | Redirect (302) |
| 20 | REQ-DSHB-04 | `test_dashboard_shows_zero_stats_when_no_data` | Dashboard menampilkan nol jika data kosong | 1. Buka dashboard saat DB kosong | - | Nilai statistik tampil "0" |

---

## 2. BensinControllerTest
**File:** `tests/Feature/BensinControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-BNSN-01 | `test_index_renders_for_driver` | Driver akses halaman upload struk | 1. Buka menu Struk Bensin | Auth: Driver | Status 200, riwayatStruk tampil |
| 2 | REQ-BNSN-02 | `test_index_only_shows_own_history` | Driver hanya melihat riwayat struk sendiri | 1. Buka menu Struk Bensin | Auth: Driver | Hanya struk milik driver tersebut yang tampil |
| 3 | REQ-BNSN-03 | `test_index_requires_auth` | Guest dilarang akses halaman struk | 1. Buka URL struk bensin | - | Redirect (302) |
| 4 | REQ-BNSN-04 | `test_index_blocked_for_non_driver` | Admin dilarang akses halaman struk driver | 1. Login Admin<br>2. Buka URL struk driver | Auth: Admin | Redirect (302) |
| 5 | REQ-BNSN-05 | `test_store_uploads_struk_successfully` | Driver upload struk valid | 1. Pilih gambar struk<br>2. Klik upload | gambar (struk.jpg) | Success message, record masuk ke DB |
| 6 | REQ-BNSN-06 | `test_store_fails_without_gambar` | Upload struk tanpa gambar | 1. Klik upload tanpa file | - | Error validasi 'gambar' |
| 7 | REQ-BNSN-07 | `test_store_fails_with_non_image_file` | Upload struk dengan PDF | 1. Pilih file PDF<br>2. Klik upload | gambar (PDF) | Error validasi 'gambar' |
| 8 | REQ-BNSN-08 | `test_store_fails_with_oversized_image` | Upload struk > 2MB | 1. Pilih file > 2MB<br>2. Klik upload | gambar (>2MB) | Error validasi 'gambar' |
| 9 | REQ-BNSN-09 | `test_cancel_deletes_struk_when_is_accept_null` | Batalkan pengajuan struk yang belum diproses | 1. Klik tombol cancel pada struk | struk_bensin_id | Record struk terhapus dari DB |
| 10 | REQ-BNSN-10 | `test_cancel_fails_when_is_accept_true` | Gagal batal jika struk sudah diterima | 1. Klik cancel pada struk 'Accepted' | struk_bensin_id | Error message, record tetap ada |
| 11 | REQ-BNSN-11 | `test_cancel_fails_when_struk_belongs_to_another_driver` | Driver dilarang cancel struk orang lain | 1. Coba cancel struk milik driver lain | ID struk orang lain | Error message |

---

## 3. BillControllerTest
**File:** `tests/Feature/BillControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-BILL-01 | `test_store_creates_bill_and_sets_kendaraan_normal` | Mekanik simpan bill perbaikan | 1. Input detail biaya<br>2. Klik simpan | detail_biaya | Bill tersimpan, status kendaraan -> Normal |
| 2 | REQ-BILL-02 | `test_store_creates_bill_with_bukti_bill` | Mekanik simpan bill dengan bukti gambar | 1. Input detail biaya<br>2. Pilih gambar bukti<br>3. Klik simpan | bukti_bill (JPG) | File tersimpan di storage |
| 3 | REQ-BILL-03 | `test_store_fails_without_keruskaanacc_id` | Simpan bill tanpa ID ACC | 1. Submit form tanpa ID tugas | - | Error validasi 'keruskaanacc_id' |
| 4 | REQ-BILL-04 | `test_store_fails_without_detail_biaya` | Simpan bill tanpa rincian biaya | 1. Submit form tanpa rincian | - | Error validasi 'detail_biaya' |
| 5 | REQ-BILL-05 | `test_store_fails_when_mekanik_is_not_the_assigned_one` | Mekanik lain mencoba isi bill | 1. Login sebagai Mekanik lain<br>2. Coba simpan bill tugas orang lain | Auth: Mekanik B | Error message |
| 6 | REQ-BILL-06 | `test_index_renders_for_admin` | Admin akses laporan biaya | 1. Buka menu Laporan Biaya | Auth: Admin | Status 200, daftar bill tampil |
| 7 | REQ-BILL-07 | `test_index_accepts_search_param` | Pencarian di laporan biaya | 1. Input keyword pencarian | search: "Toyota" | Hasil pencarian tampil |

---

## 4. DriverAuthControllerTest
**File:** `tests/Feature/DriverAuthControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-AUTH-D1 | `test_show_login_form_renders_for_guest` | Guest akses login driver | 1. Buka URL login driver | - | Status 200, form tampil |
| 2 | REQ-AUTH-D2 | `test_login_valid_credentials_redirects_to_dashboard` | Login driver valid | 1. Input username<br>2. Input key<br>3. Klik login | username, key (8 char) | Redirect ke dashboard driver |
| 3 | REQ-AUTH-D3 | `test_login_fails_with_short_key` | Login driver dengan key pendek | 1. Input username<br>2. Input key < 8 char<br>3. Klik login | key: "SHORT" | Error validasi 'key' |
| 4 | REQ-PROF-D1 | `test_update_gambar_stores_image` | Driver update foto profil | 1. Pilih gambar<br>2. Klik upload | gambar (JPG) | File tersimpan, success message |

---

## 5. GenerateKeyControllerTest
**File:** `tests/Feature/GenerateKeyControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-GKEY-01 | `test_index_renders_for_admin` | Admin akses manajemen user | 1. Buka menu Generate Key | Auth: Admin | Status 200, daftar user tampil |
| 2 | REQ-GKEY-02 | `test_store_creates_user_with_valid_data` | Buat user baru | 1. Input username, role, key<br>2. Klik simpan | username, role, key | User baru terdaftar di DB |
| 3 | REQ-GKEY-03 | `test_store_fails_with_duplicate_username` | Buat user dengan username yang sudah ada | 1. Input username yang sudah terdaftar | existing_user | Error validasi 'username' |
| 4 | REQ-GKEY-04 | `test_update_updates_user_with_valid_data` | Edit data user | 1. Ubah data username/role<br>2. Klik update | username baru | Data terupdate di DB |
| 5 | REQ-GKEY-05 | `test_destroy_deletes_user` | Hapus user | 1. Klik tombol delete pada user | user_id | User terhapus dari DB |

---

## 6. KendaraanControllerTest
**File:** `tests/Feature/KendaraanControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-KNDR-01 | `test_index_renders_for_admin` | Admin akses daftar kendaraan | 1. Buka menu Kendaraan | Auth: Admin | Status 200, daftar kendaraan tampil |
| 2 | REQ-KNDR-02 | `test_store_creates_kendaraan` | Tambah kendaraan baru | 1. Input merek, plat, driver<br>2. Klik simpan | merek, plat_nomor | Kendaraan tersimpan di DB |
| 3 | REQ-KNDR-03 | `test_store_fails_with_duplicate_plat_nomor` | Tambah kendaraan dengan plat yang sama | 1. Input plat nomor yang sudah ada | existing_plat | Error validasi 'plat_nomor' |
| 4 | REQ-KNDR-04 | `test_destroy_deletes_kendaraan` | Hapus kendaraan | 1. Klik delete pada kendaraan | kendaraan_id | Record terhapus dari DB |
| 5 | REQ-KNDR-05 | `test_driver_dashboard_renders` | Driver lihat dashboard | 1. Login Driver<br>2. Buka dashboard | Auth: Driver | Status 200, dashboard tampil |

---

## 7. KerusakanControllerTest
**File:** `tests/Feature/KerusakanControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-KRSK-01 | `test_store_creates_kerusakan_and_changes_status` | Driver lapor kerusakan | 1. Input kendala & catatan<br>2. Klik lapor | kendala, catatan | Record tersimpan, status -> Pengajuan Perbaikan |
| 2 | REQ-KRSK-02 | `test_store_from_chat_creates_kerusakan` | Lapor kerusakan via AI Chat | 1. Kirim pesan ke AI<br>2. AI memproses laporan | kendala (array) | Kerusakan tersimpan otomatis |
| 3 | REQ-KRSK-03 | `test_cancel_resets_status_to_normal` | Batalkan pengajuan perbaikan | 1. Klik tombol cancel pengajuan | kendaraan_id | Laporan dihapus, status -> Normal |
| 4 | REQ-KRSK-04 | `test_approve_creates_keruskaanacc_and_sets_perbaikan_status` | Admin setujui laporan & pilih mekanik | 1. Pilih mekanik<br>2. Klik approve | kerusakan_id, mekanik_id | Record ACC dibuat, status -> Perbaikan |
| 5 | REQ-KRSK-05 | `test_mekanik_dashboard_renders` | Mekanik akses dashboard | 1. Login Mekanik<br>2. Buka dashboard | Auth: Mekanik | Status 200, daftar tugas tampil |
| 6 | REQ-KRSK-06 | `test_mark_as_pending_sets_status` | Mekanik set status pending | 1. Klik tombol pending | keruskaanacc_id | Status kendaraan -> Pending |

---

## 8. MekanikAuthControllerTest
**File:** `tests/Feature/MekanikAuthControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-AUTH-M1 | `test_show_login_form_renders_for_guest` | Guest akses login mekanik | 1. Buka URL login mekanik | - | Status 200, form tampil |
| 2 | REQ-AUTH-M2 | `test_login_valid_credentials_redirects_to_dashboard` | Login mekanik valid | 1. Input username & key<br>2. Klik login | username, key | Redirect ke dashboard mekanik |
| 3 | REQ-STAT-M1 | `test_mark_as_full_updates_status_to_full` | Mekanik set status sibuk | 1. Klik tombol Mark as Full | - | Status mekanik -> full |

---

## 9. TowingControllerTest
**File:** `tests/Feature/TowingControllerTest.php`

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| 1 | REQ-TWNG-01 | `test_index_renders_for_driver` | Driver akses halaman towing | 1. Buka menu Towing | Auth: Driver | Status 200, form & riwayat tampil |
| 2 | REQ-TWNG-02 | `test_store_creates_towing_successfully` | Ajukan towing baru | 1. Input lokasi & keterangan<br>2. Klik request | lokasi, keterangan | Record tersimpan, status Pending |
| 3 | REQ-TWNG-03 | `test_cancel_deletes_pending_towing` | Batalkan request towing | 1. Klik cancel pada request Pending | towing_id | Record terhapus dari DB |
| 4 | REQ-TWNG-04 | `test_cancel_fails_when_isproses_is_true` | Gagal batal jika sedang diproses | 1. Coba cancel request status 'Diproses' | isproses: true | Error message |
