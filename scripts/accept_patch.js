const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats'); // <-- Tambahan baru

const ajv = new Ajv();
addFormats(ajv); // <-- Mengaktifkan plugin date-time

// Mengarah ke root directory
const ROOT_DIR = path.join(__dirname, '..');
const ACCEPTED_DIR = path.join(ROOT_DIR, 'patches', 'accepted');
const MEMORY_LOGS_DIR = path.join(ROOT_DIR, 'patches', 'memory_logs');
const SCHEMAS_DIR = path.join(ROOT_DIR, 'schemas');

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

// Mesin Validasi Skema
function validateAgainstSchema(dataObj, schemaFileName) {
	const schemaPath = path.join(SCHEMAS_DIR, schemaFileName);
	if (!fs.existsSync(schemaPath)) {
		console.warn(`\n[WARNING] Skema ${schemaFileName} tidak ditemukan di direktori schemas/. Validasi ketat dilewati.`);
		return true;
	}
	
	const schema = readJSON(schemaPath);
	const validate = ajv.compile(schema);
	const valid = validate(dataObj);
	
	if (!valid) {
		console.error("\n[ERROR VALIDASI SKEMA]:", JSON.stringify(validate.errors, null, 2));
		throw new Error(`Struktur data baru tidak mematuhi ${schemaFileName}. Patch dibatalkan.`);
	}
	return true;
}

function acceptPatch(proposalPath) {
	console.log(`\n[INFO] Mengevaluasi proposal dari: ${proposalPath}`);
	
	const patch = readJSON(proposalPath);
	
	const targetFileName = (patch.target && patch.target.file) ? patch.target.file : 'core_identity.json';
	const targetFilePath = path.join(ROOT_DIR, targetFileName);
	
	let targetSchemaName = 'identity.schema.json';
	if (targetFileName === 'memory/working_memory.json') {
		targetSchemaName = 'memory.schema.json';
	}
	
	console.log(`[INFO] Target modifikasi: ${targetFileName}`);
	
	const targetObj = readJSON(targetFilePath);
	const targetNodePath = patch.target.node;
	const action = patch.target.action;
	const payload = patch.payload.value !== undefined ? patch.payload.value : patch.payload;

	const { parent, key } = getTargetNode(targetObj, targetNodePath);

	console.log(`[INFO] Mengeksekusi aksi '${action}' pada node '${targetNodePath}'`);

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
		if (Array.isArray(parent[key]) && patch.target.task_id) {
			const itemIndex = parent[key].findIndex(item => item.task === patch.target.task_id || item.id === patch.target.task_id);
			if (itemIndex !== -1) {
				parent[key][itemIndex] = { ...parent[key][itemIndex], ...payload };
			} else {
				throw new Error(`Task '${patch.target.task_id}' tidak ditemukan di node ${targetNodePath}`);
			}
		} else {
			throw new Error(`Aksi 'update_status' membutuhkan node array dan parameter 'target.task_id'`);
		}
	} else {
		throw new Error(`Aksi tidak dikenali: ${action}`);
	}

	const now = new Date();
	if (targetObj.metadata) {
		targetObj.metadata.last_updated = now.toISOString();
	}
	
	let destinationDir = ACCEPTED_DIR;

	if (targetFileName === 'core_identity.json') {
		const versionParts = targetObj.metadata.version.split('.');
		versionParts[2] = parseInt(versionParts[2]) + 1; 
		targetObj.metadata.version = versionParts.join('.');
		console.log(`[INFO] Memperbarui versi menjadi: ${targetObj.metadata.version}`);
	} else if (targetFileName === 'memory/working_memory.json') {
		destinationDir = MEMORY_LOGS_DIR;
	}

	console.log(`[INFO] Memvalidasi hasil akhir terhadap ${targetSchemaName}...`);
	validateAgainstSchema(targetObj, targetSchemaName);
	console.log(`[SUCCESS] Validasi skema lulus. Epistemologi data terjaga.`);

	writeJSON(targetFilePath, targetObj);
	
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
	console.error(`\n[FATAL ERROR] Gagal menerima patch: ${error.message}\n`);
}