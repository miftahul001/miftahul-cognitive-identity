const fs = require('fs');
const path = require('path');

// Mengarah ke root directory
const ROOT_DIR = path.join(__dirname, '..');
const ACCEPTED_DIR = path.join(ROOT_DIR, 'patches', 'accepted');
const MEMORY_LOGS_DIR = path.join(ROOT_DIR, 'patches', 'memory_logs');

// Pastikan direktori arsip memori operasional tersedia
if (!fs.existsSync(MEMORY_LOGS_DIR)) {
	fs.mkdirSync(MEMORY_LOGS_DIR, { recursive: true });
}

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
	
	const patch = readJSON(proposalPath);
	
	// 1. Identifikasi Target File (Default ke core_identity.json jika tidak disebut)
	const targetFileName = (patch.target && patch.target.file) ? patch.target.file : 'core_identity.json';
	const targetFilePath = path.join(ROOT_DIR, targetFileName);
	
	console.log(`[INFO] Target file modifikasi: ${targetFileName}`);
	
	const targetObj = readJSON(targetFilePath);
	const targetNodePath = patch.target.node;
	const action = patch.target.action;
	
	// Mendukung payload sederhana (value) atau payload kompleks (objek)
	const payload = patch.payload.value !== undefined ? patch.payload.value : patch.payload;

	const { parent, key } = getTargetNode(targetObj, targetNodePath);

	console.log(`[INFO] Mengeksekusi aksi '${action}' pada node '${targetNodePath}'`);

	// 2. Logika Eksekusi Aksi
	if (action === 'add') {
		if (Array.isArray(parent[key])) {
			parent[key].push(payload);
		} else if (parent[key] === undefined) {
			parent[key] = Array.isArray(payload) ? payload : [payload];
		} else {
			throw new Error(`Node ${targetNodePath} bukan array, gunakan aksi 'update'`);
		}
	} else if (action === 'update') {
		parent[key] = payload;
	} else if (action === 'delete') {
		delete parent[key];
	} else if (action === 'update_status') {
		// Logika khusus untuk update task di dalam array (seperti working_memory)
		if (Array.isArray(parent[key]) && patch.target.task_id) {
			const itemIndex = parent[key].findIndex(item => item.task === patch.target.task_id || item.id === patch.target.task_id);
			if (itemIndex !== -1) {
				parent[key][itemIndex] = { ...parent[key][itemIndex], ...payload };
			} else {
				throw new Error(`Task '${patch.target.task_id}' tidak ditemukan di node ${targetNodePath}`);
			}
		} else {
			throw new Error(`Aksi 'update_status' membutuhkan node berupa array dan parameter 'target.task_id' pada patch`);
		}
	} else {
		throw new Error(`Aksi tidak dikenali: ${action}`);
	}

	// 3. Update Metadata Global (Timestamp)
	const now = new Date();
	if (targetObj.metadata) {
		targetObj.metadata.last_updated = now.toISOString();
	}
	
	let destinationDir = ACCEPTED_DIR;

	// 4. Custom Routing & Versioning
	if (targetFileName === 'core_identity.json') {
		const versionParts = targetObj.metadata.version.split('.');
		versionParts[2] = parseInt(versionParts[2]) + 1; 
		targetObj.metadata.version = versionParts.join('.');
		console.log(`[INFO] Memperbarui versi core_identity menjadi: ${targetObj.metadata.version}`);
	} else if (targetFileName === 'memory/working_memory.json') {
		destinationDir = MEMORY_LOGS_DIR; // Log harian masuk ke folder terpisah
		console.log(`[INFO] Timestamp working_memory.json diperbarui.`);
	}

	// 5. Simpan Perubahan ke File Target
	writeJSON(targetFilePath, targetObj);
	
	// 6. Arsipkan File Patch
	const fileName = path.basename(proposalPath);
	const archivedPath = path.join(destinationDir, fileName);
	fs.renameSync(proposalPath, archivedPath);
	
	const relativeDestDir = path.relative(ROOT_DIR, destinationDir);
	console.log(`[SUCCESS] Patch dieksekusi dan diarsipkan ke: ${relativeDestDir}/${fileName}\n`);
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