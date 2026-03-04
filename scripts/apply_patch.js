const fs = require('fs');
const path = require('path');

const CORE_FILE = path.join(__dirname, 'core_identity.json');

// Fungsi untuk membaca JSON
function readJSON(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`File tidak ditemukan: ${filePath}`);
	}
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Fungsi untuk menyimpan JSON dengan indentasi tab
function writeJSON(filePath, data) {
	fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf8');
}

// Fungsi rekursif untuk menavigasi dot notation (misal: "cognitive_state.technical_matrix")
function getTargetNode(obj, pathString) {
	const keys = pathString.split('.');
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		if (current[keys[i]] === undefined) {
			current[keys[i]] = {}; // Buat node jika belum ada
		}
		current = current[keys[i]];
	}
	return { parent: current, key: keys[keys.length - 1] };
}

// Fungsi utama untuk mengeksekusi patch
function applyPatch(patchFilePath) {
	console.log(`\n[INFO] Membaca patch dari: ${patchFilePath}`);
	const patch = readJSON(patchFilePath);
	const core = readJSON(CORE_FILE);

	const targetNodePath = patch.target.node;
	const action = patch.target.action;
	const payloadValue = patch.payload.value;

	const { parent, key } = getTargetNode(core, targetNodePath);

	console.log(`[INFO] Mengeksekusi aksi '${action}' pada node '${targetNodePath}'`);

	// Eksekusi berdasarkan tipe aksi
	if (action === 'add') {
		if (Array.isArray(parent[key])) {
			parent[key].push(payloadValue); // Jika array, tambahkan ke elemen terakhir
		} else if (parent[key] === undefined) {
			parent[key] = Array.isArray(payloadValue) ? payloadValue : [payloadValue];
		} else {
			throw new Error(`Node ${targetNodePath} bukan array, gunakan aksi 'update'`);
		}
	} else if (action === 'update') {
		parent[key] = payloadValue; // Timpa nilai yang ada
	} else if (action === 'delete') {
		delete parent[key]; // Hapus node
	} else {
		throw new Error(`Aksi tidak dikenali: ${action}`);
	}

	// Update Metadata (Naikkan versi patch & perbarui timestamp)
	const now = new Date();
	core.metadata.last_updated = now.toISOString();
	
	const versionParts = core.metadata.version.split('.');
	versionParts[2] = parseInt(versionParts[2]) + 1; // Increment patch version (x.y.Z)
	core.metadata.version = versionParts.join('.');

	console.log(`[INFO] Memperbarui versi core_identity menjadi: ${core.metadata.version}`);

	// Simpan kembali ke core_identity.json
	writeJSON(CORE_FILE, core);
	console.log(`[SUCCESS] Patch berhasil diterapkan pada core_identity.json\n`);
}

// Eksekusi dari Command Line
const args = process.argv.slice(2);
if (args.length === 0) {
	console.log("Penggunaan: node apply_patch.js <path_ke_file_patch.json>");
	process.exit(1);
}

try {
	applyPatch(args[0]);
} catch (error) {
	console.error(`[ERROR] Gagal menerapkan patch: ${error.message}`);
}