import * as os from 'os';
import * as path from 'path';
import util from 'node:util';
import { execFileSync, execFile as _execFile } from 'node:child_process';
import * as fs from 'fs';
import AdmZip from 'adm-zip';
import { ExecFileOptions } from 'node:child_process';

const execFile = util.promisify(_execFile);

const platform = os.platform();
const arch = os.arch();

const zipMap = {
	win32: 'scons-win.exe.zip',
	darwin: arch === 'arm64' ? 'scons-macos-arm64.zip' : 'scons-macos-x86_64.zip',
	linux: 'scons-linux.zip',
} as const;

const zipArchive = zipMap[platform as keyof typeof zipMap];

function getExecutable() {
	if (!zipArchive) {
		throw new Error('Unsupported platform: ' + platform);
	}

	const sconsDir = path.join(import.meta.dirname, '..', 'scons');
	const zipArchivePath = path.join(sconsDir, zipArchive);
	const extractedPath = path.join(sconsDir, path.basename(zipArchive, '.zip'));

	if (!fs.existsSync(extractedPath)) {
		const zip = new AdmZip(zipArchivePath);
		zip.extractAllTo(sconsDir, true);
		fs.chmodSync(extractedPath, 0o755);
	}

	return extractedPath;
}

export const sconsSync = (args: string[], opts?: ExecFileOptions) => {
	const extractedPath = getExecutable();
	return execFileSync(extractedPath, args, opts);
};

export const scons = (args: string[], opts?: ExecFileOptions) => {
	const extractedPath = getExecutable();
	return execFile(extractedPath, args, opts);
};
