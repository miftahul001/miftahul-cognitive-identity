# Cognitive Identity Scripts

Direktori ini berisi skrip operasional untuk memproses *Cognitive Patches*.

### Prasyarat
* Node.js runtime terinstal di sistem.
* File `core_identity.json` yang valid berada di *root directory*.

## 1. `accept_patch.js`
Menyetujui proposal, mengaplikasikannya ke `core_identity.json`, dan memindahkan file ke `patches/accepted/`.
**Penggunaan:** `node scripts/accept_patch.js patches/proposals/[nama_file].json`

## 2. `reject_patch.js`
Menolak proposal tanpa mengubah *state* identitas, dan memindahkan file ke `patches/rejected/` sebagai *training data* negatif.
**Penggunaan:** `node scripts/reject_patch.js patches/proposals/[nama_file].json`