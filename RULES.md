# Miftahul Cognitive Identity Protocol: Rules of Engagement

Dokumen ini mendefinisikan protokol absolut untuk membaca, mengusulkan, dan mengubah *state* kognitif di dalam repositori ini. Setiap agen (manusia atau AI) yang berinteraksi dengan repositori ini wajib mematuhi aturan berikut tanpa pengecualian.

## 1. Definisi Peran (Roles)

* **The Owner (Miftahul Munir):** Satu-satunya entitas yang memiliki otoritas final (Hak Veto) untuk menyetujui (`accept`) atau menolak (`reject`) perubahan pada *core identity*.
* **The Agent (Sistem AI / Skrip Otomatisasi):** Entitas analitik yang bertugas mengekstrak informasi, merumuskan pola, dan mengajukan draf pembaruan (Patch Proposals) berdasarkan interaksi terbaru, jurnal, atau pencapaian teknis.

## 2. Prinsip Dasar Pengajuan (Epistemology & Integrity)

Setiap *patch* yang diajukan oleh agen harus dievaluasi berdasarkan dua prinsip operasional utama:
1.  **Epistemology:** Proposal harus didasarkan pada kebenaran objektif dan bukti empiris (misalnya: komit kode baru, jurnal harian, atau penyelesaian studi kasus), bukan sekadar asumsi atau halusinasi algoritma.
2.  **Mutual Exploitation Guard:** Proposal tidak boleh memodifikasi prinsip dasar identitas yang berpotensi melemahkan kedaulatan kognitif *Owner* atau menciptakan celah eksploitasi oleh sistem eksternal. Perubahan pada `operating_principles` membutuhkan tingkat validasi tertinggi.

## 3. Protokol Pembuatan Patch (Format & Validasi)

Agen AI dilarang keras memodifikasi `core_identity.json` secara langsung. Semua perubahan harus diajukan dalam bentuk file JSON individual.

* **Lokasi Penyimpanan Sementara:** Semua draf harus diletakkan di dalam direktori `patches/proposals/`.
* **Standar Validasi:** Nilai baru yang diajukan harus mematuhi tipe data yang didefinisikan dalam `schema.json`.
* **Format Data Patch:** Setiap file *patch* wajib menggunakan struktur berikut (dengan indentasi `tab`):

```json
{
	"patch_metadata": {
		"patch_id": "YYYYMMDD-HHMMSS-KATA-KUNCI",
		"timestamp": "ISO-8601-Format",
		"agent_id": "Nama_atau_Versi_AI"
	},
	"target": {
		"node": "cognitive_state.technical_matrix",
		"action": "add | update | delete"
	},
	"payload": {
		"value": "Nilai atau objek baru yang akan dimasukkan"
	},
	"rationale": {
		"event_context": "Konteks objektif kenapa patch ini diajukan",
		"cognitive_impact": "Dampak logis terhadap evolusi identitas"
	}
}