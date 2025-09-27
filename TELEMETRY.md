
# Penyiapan OpenTelemetry (OTel)

Dokumen ini menjelaskan bagaimana OpenTelemetry (OTel) disiapkan di proyek ini.

## Ringkasan

Kita telah mengimplementasikan penyiapan OpenTelemetry standar yang fleksibel dan tidak terikat pada vendor tertentu. Tujuannya adalah untuk mengumpulkan data telemetri (traces) dari aplikasi Next.js.

Konfigurasi utama berada di `src/instrumentation.ts` dan diaktifkan melalui `next.config.js`.

## Cara Kerja

Penyiapan ini memiliki dua mode yang berjalan otomatis berdasarkan environment `NODE_ENV`:

### 1. Mode Development

- **Kapan aktif?**: Saat Anda menjalankan `npm run dev`.
- **Apa yang terjadi?**: Semua data *trace* (misalnya dari `fetch` atau pemanggilan API) akan dicetak langsung ke konsol tempat `next dev` berjalan.
- **Tujuan**: Memudahkan debugging dan verifikasi bahwa telemetri berjalan dengan benar tanpa perlu setup tambahan.

### 2. Mode Production

- **Kapan aktif?**: Saat `NODE_ENV` diatur ke `production`. Contoh: `NODE_ENV=production npm start`.
- **Apa yang terjadi?**: Data *trace* akan dikirim sebagai data OTLP melalui HTTP ke sebuah *endpoint* yang Anda tentukan.
- **Tujuan**: Mengirim data telemetri ke backend observability pilihan Anda (seperti Jaeger, Grafana Tempo, atau OpenTelemetry Collector) di lingkungan production (misalnya, server homelab Anda).

## Konfigurasi untuk Production (Homelab)

Untuk membuat ini berfungsi di server production Anda, Anda perlu mengatur environment variable berikut:

1.  `NODE_ENV=production`
    - Mengaktifkan mode production di Next.js dan di skrip telemetri kita.

2.  `OTEL_EXPORTER_OTLP_ENDPOINT="http://your-collector-address:4318"`
    - **Wajib diatur.** Ganti `http://your-collector-address:4318` dengan alamat OTel Collector atau Jaeger di jaringan Anda.
    - Port `4318` adalah port default untuk OTLP/HTTP. Jika Anda menggunakan gRPC, portnya mungkin `4317`.

Contoh perintah untuk menjalankan di production:

```bash
NODE_ENV=production OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318" npm start
```

Dengan penyiapan ini, Anda memiliki sistem telemetri yang portabel dan siap untuk production.
