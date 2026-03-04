# Cognitive Identity & Memory Scripts

Direktori ini berisi kumpulan skrip Node.js operasional untuk memproses *Cognitive Patches* (usulan perubahan) pada repositori Miftahul Cognitive Identity Protocol. Skrip ini bertindak sebagai eksekutor persetujuan biner (*Binary Approval Workflow*).

## 1. `accept_patch.js`

Skrip cerdas ini bertugas menyetujui proposal, mengaplikasikannya ke target file yang tepat, memperbarui *state* (versi atau waktu), dan mengarsipkan file proposal secara dinamis berdasarkan jenis datanya.

### Prasyarat
* Node.js runtime terinstal di sistem.
* Dijalankan dari *root directory* repositori.

### Kemampuan *Dynamic Routing*
Skrip ini membaca parameter `"target": { "file": "..." }` di dalam file JSON *patch* untuk menentukan arah eksekusi:

1. **State of Being (`core_identity.json`)**
   * **Target File:** Jika `target.file` tidak diisi, atau diisi `core_identity.json`.
   * **Aksi yang Didukung:** `add`, `update`, `delete`.
   * **Efek Samping:** Menaikkan versi patch (misal: 1.0.1 -> 1.0.2).
   * **Lokasi Arsip:** Dipindahkan ke `patches/accepted/`.

2. **State of Doing (`memory/working_memory.json`)**
   * **Target File:** Wajib mendefinisikan `"file": "memory/working_memory.json"`.
   * **Aksi Khusus:** `update_status` (Memerlukan parameter tambahan `"task_id"` di dalam *node* target untuk memperbarui status tugas spesifik di dalam array tanpa menghapus datanya).
   * **Lokasi Arsip:** Dipindahkan ke `patches/memory_logs/` (menjaga agar folder memori utama tidak dipenuhi log tugas harian).

### Cara Penggunaan
```bash
node scripts/accept_patch.js patches/proposals/<nama_file>.json
```

### Contoh JSON Patch untuk `working_memory` (Aksi: update_status)
```json
{
	"target": {
		"file": "memory/working_memory.json",
		"node": "directives.immediate_action",
		"action": "update_status",
		"task_id": "Nama tugas yang ingin diubah"
	},
	"payload": {
		"status": "completed"
	}
}
```

---

## 2. `reject_patch.js`

Skrip ini digunakan untuk menolak proposal tanpa mengubah *state* identitas maupun memori kerja. File proposal akan dipindahkan ke folder `patches/rejected/` sebagai *training data* negatif (mengajari sistem AI masa depan tentang batasan kognitif, prinsip, dan etika Owner).

### Cara Penggunaan
```bash
node scripts/reject_patch.js patches/proposals/<nama_file>.json
```