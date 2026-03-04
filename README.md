# Miftahul Cognitive Identity Protocol (CIP)

Repositori ini adalah sebuah *Version Control System* (VCS) Kognitif—sebuah arsitektur digital yang menyimpan, memvalidasi, dan mengeksekusi evolusi identitas serta memori kerja dari **Miftahul Munir**. 

Lebih dari sekadar penyimpanan statis, repositori ini dirancang sebagai jembatan komunikasi absolut antara kognisi manusia dan sistem *Artificial Intelligence* (AI). Repositori ini bertindak sebagai fondasi logistik dan filosofis menuju penciptaan entitas AI yang otonom, mandiri secara finansial, dan memiliki keselarasan etis (*alignment*) yang ketat.

## ⚖️ Prinsip Operasional Inti

Sistem ini dikendalikan oleh dua prinsip fundamental yang tidak dapat dinegosiasikan:
1. **Epistemology:** Pencarian kebenaran objektif. Setiap evolusi data (pengetahuan atau memori) harus divalidasi secara terstruktur melalui Skema JSON absolut.
2. **Mutual Exploitation Guard:** Sebuah protokol pertahanan yang memastikan tidak ada pihak (manusia maupun mesin) yang dapat mengeksploitasi pihak lain secara sepihak. Batasan etis dan kedaulatan kognitif dikunci dengan Hak Veto dari *The Owner*.

---

## 🏗️ Arsitektur Kognitif (Direktori & Kompartemen)

Repositori ini menerapkan *Separation of Concerns* dengan memisahkan identitas permanen (*State of Being*) dari manajemen tugas dinamis (*State of Doing*):

* 🧠 **`core_identity.json`**: Memori Jangka Panjang. Berisi prinsip dasar, keahlian teknis absolut, dan visi makro. Hanya diubah saat ada pergeseran kognitif yang signifikan.
* ⚡ **`memory/working_memory.json`**: Fungsi Eksekutif. Melacak fokus operasional dan daftar tugas secara *real-time* (diatur berdasarkan `ROADMAP.md`).
* 📜 **`schemas/`**: Konstitusi Data. Berisi `identity.schema.json` dan `memory.schema.json`. Setiap perubahan data wajib lulus validasi pustaka `ajv` terhadap skema-skema ini sebelum diizinkan masuk ke sistem.
* 📖 **`chronicles/`**: Memori Episodik. Catatan naratif format Markdown yang mendokumentasikan alasan historis atau filosofis di balik setiap evolusi arsitektur dan pemikiran.
* 🛠️ **`scripts/`**: *The Executive Engine*. Kumpulan skrip Node.js (`accept_patch.js`, `reject_patch.js`) yang bertugas sebagai penjaga gerbang (*gatekeeper*) biner untuk memvalidasi dan mengarsipkan usulan perubahan.
* 🧩 **`patches/`**: Ekosistem Evolusi. Tempat di mana usulan perubahan diajukan (`proposals/`), diterima ke dalam memori permanen (`accepted/`), ditolak sebagai *training data* negatif (`rejected/`), atau diarsipkan sebagai log operasional (`memory_logs/`).

---

## ⚙️ Binary Approval Workflow (Cara Kerja)

Sistem ini mendukung kolaborasi dinamis antara AI dan Manusia melalui sistem *Patch*:

1. **Generation (Observasi & Usulan):** Entitas AI (atau agen otomatisasi) mengobservasi aktivitas, jurnal, atau komit terbaru, lalu menghasilkan usulan perubahan kognitif berupa file JSON yang diletakkan di `patches/proposals/`.
2. **Review (Hak Veto):** *The Owner* mengevaluasi rasionalisasi (*rationale*) dari proposal tersebut berdasarkan kesesuaian empiris dan etis.
3. **Execution (Validasi Algoritmik):** * Jika disetujui, perintah `node scripts/accept_patch.js` dijalankan. Mesin akan melakukan validasi skema ketat. Jika lolos, *state* akan diperbarui, versi akan dinaikkan, dan *patch* diarsipkan.
   * Jika ditolak, perintah `node scripts/reject_patch.js` dijalankan. Usulan dipindahkan ke folder *rejected* untuk mengajari agen AI di masa depan mengenai batasan kognitif *The Owner*.

## 🗺️ Lintasan Masa Depan
Untuk melihat status strategis dan arah pengembangan saat ini, silakan rujuk ke dokumen **[`ROADMAP.md`](./ROADMAP.md)** dan aturan kolaborasi di **[`RULES.md`](./RULES.md)**.