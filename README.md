# Toolkiit Invoice Custom

## Setup
1. `npm install`
2. `cp .env.example .env.local` lalu isi semua key.
3. Supabase: jalankan `supabase/schema.sql` di SQL Editor.
   - Authentication > Providers > Email: **matikan "Confirm email"** (tanpa verifikasi/OTP).
   - Aktifkan provider Google (untuk One Tap isi juga `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
   - Authentication > URL Configuration: tambahkan `http://localhost:3000/create` & domain Vercel ke Redirect URLs.
4. `npm run dev` -> http://localhost:3000
5. Iklan: buat *Rewarded ad unit* (web) di Google Ad Manager, isi path-nya di `NEXT_PUBLIC_GAM_REWARDED_AD_UNIT`. Tanpa itu app jalan dalam mode demo (hitung mundur 8 detik).

## Catatan
- Remove background (`@imgly/background-removal`) mengunduh model ~tens MB pada pemakaian pertama (client-side).
- Aplikasi gratis: iklan rewarded tampil otomatis saat klik **Download Draft** dan saat klik **Tambah Draft Baru**. Tiap draft baru bisa memilih 1 dari 20 template gratis. Pengecekan dilakukan di browser, jadi bisa dilewati oleh pengguna teknis.
- Gambar disimpan sebagai base64 di `data_json`; bucket `assets` sudah dibuat bila ingin upload ke Storage.
