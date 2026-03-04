const fs = require('fs');
const path = require('path');

// Mengarah ke root directory karena skrip ada di dalam folder scripts/
const ROOT_DIR = path.join(__dirname, '..');
const CORE_FILE = path.join(ROOT_DIR, 'core_identity.json');
const ACCEPTED_DIR = path.join(ROOT_DIR, 'patches', 'accepted');

function readJSON(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`File tidak ditemukan: ${filePath}`);
	}
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
	fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf8');
}

function getTargetNode(obj, pathString) {
	const keys = pathString.split('.');
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		if (current[keys[i]] === undefined) {
			current[keys[i]] = {}; 
		}
		current = current[keys[i]];
	}
	return { parent: current, key: keys[keys.length - 1] };
}

function acceptPatch(proposalPath) {
	console.log(`\n[INFO] Mengevaluasi proposal dari: ${proposalPath}`);
	
	// 1. Baca Patch & Core
	const patch = readJSON(proposalPath);
	const core = readJSON(CORE_FILE);

	const targetNodePath = patch.target.node;
	const action = patch.target.action;
	const payloadValue = patch.payload.value;

	const { parent, key } = getTargetNode(core, targetNodePath);

	console.log(`[INFO] Mengeksekusi aksi '${action}' pada node '${targetNodePath}'`);

	// 2. Modifikasi Data (In-Memory)
	if (action === 'add') {
		if (Array.isArray(parent[key])) {
			parent[key].push(payloadValue);
		} else if (parent[key] === undefined) {
			parent[key] = Array.isArray(payloadValue) ? payloadValue : [payloadValue];
		} else {
			throw new Error(`Node ${targetNodePath} bukan array, gunakan aksi 'update'`);
		}
	} else if (action === 'update') {
		parent[key] = payloadValue;
	} else if (action === 'delete') {
		delete parent[key];
	} else {
		throw new Error(`Aksi tidak dikenali: ${action}`);
	}

	// 3. Update Metadata
	const now = new Date();
	core.metadata.last_updated = now.toISOString();
	
	const versionParts = core.metadata.version.split('.');
	versionParts[2] = parseInt(versionParts[2]) + 1; 
	core.metadata.version = versionParts.join('.');

	console.log(`[INFO] Memperbarui versi core_identity menjadi: ${core.metadata.version}`);

	// 4. Simpan ke core_identity.json
	writeJSON(CORE_FILE, core);
	
	// 5. Pindahkan file patch ke folder accepted/
	const fileName = path.basename(proposalPath);
	const acceptedPath = path.join(ACCEPTED_DIR, fileName);
	fs.renameSync(proposalPath, acceptedPath);
	
	console.log(`[SUCCESS] Patch dieksekusi dan diarsipkan ke: patches/accepted/${fileName}\n`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
	console.log("Penggunaan: node scripts/accept_patch.js <path_ke_file_proposal.json>");
	process.exit(1);
}

try {
	acceptPatch(args[0]);
} catch (error) {
	console.error(`[ERROR] Gagal menerima patch: ${error.message}`);
}