# Sentriposts

Sentriposts adalah aplikasi web untuk **menjadwalkan dan mempublikasikan konten media sosial** dari satu dashboard. Pengguna menghubungkan akun media sosial mereka (LinkedIn dan Instagram), menulis post, lalu memilih untuk menyimpannya sebagai draft, memasukkannya ke antrean, atau menjadwalkannya agar terbit otomatis pada waktu yang ditentukan.

> Status: dalam pengembangan aktif.

---

## Fitur

- **Publish**: kelola semua post dalam satu halaman dengan tab **Queue**, **Drafts**, **Published**, dan **Failed**, plus filter per platform dan ringkasan statistik.
- **Penjadwalan**: post dijadwalkan dalam zona waktu WIB (Asia/Jakarta) dan diterbitkan otomatis oleh worker di latar belakang.
- **Calendar**: tampilan kalender (FullCalendar) untuk melihat jadwal post dalam satu bulan.
- **Analytics**: pemantauan performa post (likes, komentar, shares, views, engagement rate).
- **Smart Queue**: rekomendasi jam posting berbasis riset data industri.
- **Multi-channel**: hubungkan beberapa akun LinkedIn dan Instagram, setiap post terhubung ke channel tertentu.
- **Media**: unggah gambar untuk post (disimpan di Cloudinary).
- **Admin dan moderasi**: area admin dan halaman khusus untuk akun yang diblokir (`banned`).
- **Pemantauan error**: error dan performa dilacak dengan Sentry.

---

## Tech Stack

| Bagian            | Teknologi                                                                   |
| ----------------- | --------------------------------------------------------------------------- |
| Framework         | [Next.js](https://nextjs.org) 16 (App Router, Turbopack), React, TypeScript |
| Autentikasi       | [Clerk](https://clerk.com)                                                  |
| Database          | [Supabase](https://supabase.com) (PostgreSQL)                               |
| Job terjadwal     | [Inngest](https://www.inngest.com)                                          |
| Penyimpanan media | [Cloudinary](https://cloudinary.com)                                        |
| Monitoring        | [Sentry](https://sentry.io)                                                 |
| UI                | Tailwind CSS, Radix UI (shadcn/ui), Lucide, Sonner                          |
| Data client       | TanStack Query                                                              |
| Kalender          | FullCalendar                                                                |
| Validasi          | Zod                                                                         |
| Testing           | Vitest                                                                      |

---

## Arsitektur singkat

Kode diorganisasi per fitur dan dibagi menjadi lapisan dengan tanggung jawab jelas:

```
app/                     Route (App Router): (auth), (dashboard), (marketing), admin, api, banned
components/              Komponen UI bersama
features/<fitur>/
  actions/               Pintu masuk dari UI (Server Action atau fungsi untuk Server Component)
  services/              Logika bisnis
  repositories/          Query database (Supabase)
  components, hooks, types, utils
inngest/                 Definisi fungsi worker (mis. publish-post)
lib/, utils/             Helper dan klien (Supabase, Cloudinary, dll.)
supabase/                Konfigurasi dan skema database
test/                    Test Vitest
```

### Alur data

```
Browser ──► Action (auth() → userId) ──► Service ──► Repository ──► Supabase
```

### Prinsip keamanan

Aplikasi memakai Clerk untuk identitas, sedangkan database diakses lewat Supabase **service role** (melewati RLS). Karena itu:

1. `userId` **selalu** diambil dari `auth()` di lapisan action, tidak pernah dari input client.
2. Service dan repository menerima `userId` sebagai parameter dan **setiap query data milik user wajib memfilter `user_id`**.
3. File service dan repository memakai `import "server-only"`.
4. `"use server"` hanya dipakai pada action yang dipanggil dari komponen client.

### Alur publikasi terjadwal

Saat user menjadwalkan post, aplikasi menyimpan `post` dan `post_target`, lalu mengirim event ke Inngest. Worker menjalankan langkah-langkah berikut:

```
fetch-target → wait-until-scheduled → acquire → publish → finalize
```

- `acquire` mengubah status `queued → publishing` sebagai kunci agar tidak ada dua worker mengerjakan target yang sama.
- `publish` mengirim post ke platform; hanya langkah yang gagal yang diulang (retry).
- `finalize` mencatat hasil dan menyinkronkan status post.
- Menghapus post membatalkan job yang masih menunggu (`cancelOn`).

---

## Memulai (development)

### Prasyarat

- Node.js (versi LTS terbaru)
- npm
- Akun dan proyek di: Clerk, Supabase, Inngest, Cloudinary, Sentry
- Aplikasi developer LinkedIn dan/atau Instagram (untuk koneksi akun)

### Instalasi

```bash
git clone <url-repository>
cd sentri-post
npm install
```

### Environment variables

Salin dan isi `.env.local`. Nama variabel di bawah adalah yang umum dipakai oleh masing-masing layanan; sesuaikan dengan kode proyek.

| Variabel                                                | Kegunaan                                      |
| ------------------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Autentikasi Clerk                             |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Akses database (service role hanya di server) |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`              | Inngest (production)                          |
| `CLOUDINARY_*`                                          | Upload dan penghapusan media                  |
| `SENTRY_AUTH_TOKEN`                                     | Upload source map saat build                  |
| Kredensial OAuth LinkedIn / Instagram                   | Koneksi akun media sosial                     |

> Jangan pernah commit `.env*` ke git. `SUPABASE_SERVICE_ROLE_KEY` tidak boleh diawali `NEXT_PUBLIC_`.

### Menjalankan

```bash
# terminal 1: aplikasi
npm run dev

# terminal 2: Inngest dev server (untuk job terjadwal)
npx inngest-cli@latest dev
```

Aplikasi berjalan di `http://localhost:3000`, dan endpoint Inngest di `/api/inngest`.

---

## Script

| Perintah                        | Fungsi                             |
| ------------------------------- | ---------------------------------- |
| `npm run dev`                   | Menjalankan server development     |
| `npm run build`                 | Build produksi                     |
| `npm run start`                 | Menjalankan hasil build            |
| `npm test`                      | Menjalankan test (Vitest)          |
| `npx next experimental-analyze` | Analisis ukuran bundle (Turbopack) |

---

## Testing

Test memakai Vitest. Fokus utama:

- Penjaga autentikasi pada action (`getPosts`, `schedulePost`, `deletePost`).
- Logika worker publikasi, termasuk retry yang tidak mengirim post dua kali dan penguncian antar worker.
- Fungsi murni seperti `normalizeStatus`.

```bash
npm test
```

---

## Deployment

Aplikasi dapat dijalankan di Vercel atau VPS sendiri. Hal yang perlu diperhatikan:

- Isi semua environment variables produksi.
- Gunakan key production Clerk dan daftarkan domain.
- Daftarkan endpoint `/api/inngest` di dashboard Inngest.
- Atur redirect URL OAuth ke domain produksi.
- Samakan region server dengan region Supabase untuk menekan latensi.
- Di VPS: jalankan `npm run build` dan `npm run start` di bawah PM2 atau systemd, dengan reverse proxy (Nginx/Caddy) dan HTTPS.

---

## Catatan pengembangan

Hal yang sudah diketahui dan akan dikerjakan:

- `post_targets` yang berstatus `publishing` setelah `finalize` gagal permanen dapat ditandai `failed` padahal post sudah tayang. Rencana: simpan `platform_post_id` lebih awal dan selesaikan pencatatan di `onFailure`.
- Daftar post belum dipaginasi; pertimbangkan paginasi dan query `count` untuk statistik.
- `getPostsService` perlu melempar error (bukan mengembalikan `[]`) agar kegagalan database tidak tampak sebagai data kosong.
- Tambahkan `error.tsx` pada segmen `(dashboard)`.
- Validasi input (Zod) pada action penjadwalan.
- Pertimbangkan RLS Supabase dengan Clerk sebagai lapisan keamanan tambahan.

---
