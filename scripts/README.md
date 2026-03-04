# Cognitive Identity Scripts

Direktori ini berisi kumpulan skrip otomatisasi untuk mengelola, memvalidasi, dan mengekstrak *state* dari Miftahul Cognitive Identity Protocol.

## 1. `apply_patch.js`

Skrip Node.js ini bertugas untuk membaca file proposal *patch* yang telah disetujui, mengeksekusi perubahannya ke dalam `core_identity.json`, memperbarui stempel waktu (*timestamp*), dan menaikkan versi minor identitas secara otomatis.

### Prasyarat
* Node.js runtime terinstal di sistem.
* File `core_identity.json` yang valid berada di *root directory*.

### Cara Penggunaan
Skrip ini dirancang untuk dijalankan dari *root directory* repositori. Gunakan perintah berikut di terminal:

```bash
node scripts/apply_patch.js <path_ke_file_patch.json>