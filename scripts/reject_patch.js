const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const REJECTED_DIR = path.join(ROOT_DIR, 'patches', 'rejected');

function rejectPatch(proposalPath) {
	if (!fs.existsSync(proposalPath)) {
		throw new Error(`File proposal tidak ditemukan: ${proposalPath}`);
	}

	console.log(`\n[INFO] Menolak proposal dari: ${proposalPath}`);

	// Pindahkan file ke folder rejected/
	const fileName = path.basename(proposalPath);
	const rejectedPath = path.join(REJECTED_DIR, fileName);
	
	fs.renameSync(proposalPath, rejectedPath);
	
	console.log(`[SUCCESS] Proposal ditolak. File dipindahkan ke: patches/rejected/${fileName}`);
	console.log(`[INFO] core_identity.json tidak mengalami perubahan.\n`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
	console.log("Penggunaan: node scripts/reject_patch.js <path_ke_file_proposal.json>");
	process.exit(1);
}

try {
	rejectPatch(args[0]);
} catch (error) {
	console.error(`[ERROR] Gagal menolak patch: ${error.message}`);
}
