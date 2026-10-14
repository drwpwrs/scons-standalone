import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { test } from 'node:test';
import { deflateRawSync } from 'node:zlib';
import AdmZip from 'adm-zip';

const content = Buffer.from('hello');
const entryName = Buffer.from('scons');
const crc = 0x3610a686;

function archive(method, declaredSize = content.length, checksum = crc) {
	const data = method === 0 ? content : deflateRawSync(content);
	const local = Buffer.alloc(30);
	local.writeUInt32LE(0x04034b50, 0);
	local.writeUInt16LE(20, 4);
	local.writeUInt16LE(method, 8);
	local.writeUInt32LE(checksum, 14);
	local.writeUInt32LE(data.length, 18);
	local.writeUInt32LE(content.length, 22);
	local.writeUInt16LE(entryName.length, 26);
	const central = Buffer.alloc(46);
	central.writeUInt32LE(0x02014b50, 0);
	central.writeUInt16LE(20, 4);
	central.writeUInt16LE(20, 6);
	central.writeUInt16LE(method, 10);
	central.writeUInt32LE(checksum, 16);
	central.writeUInt32LE(data.length, 20);
	central.writeUInt32LE(declaredSize, 24);
	central.writeUInt16LE(entryName.length, 28);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(1, 8);
	end.writeUInt16LE(1, 10);
	end.writeUInt32LE(central.length + entryName.length, 12);
	end.writeUInt32LE(local.length + entryName.length + data.length, 16);
	return Buffer.concat([local, entryName, data, central, entryName, end]);
}

function withDestination(run) {
	const destination = fs.mkdtempSync(path.join(import.meta.dirname, '.extraction-'));
	try {
		run(destination);
	} finally {
		fs.rmSync(destination, { recursive: true, force: true });
	}
}

for (const [name, method] of [['stored', 0], ['deflated', 8]]) {
	test(`extracts a normal ${name} executable archive`, () => {
		withDestination((destination) => {
			new AdmZip(archive(method)).extractAllTo(destination, true);
			assert.deepEqual(fs.readFileSync(path.join(destination, 'scons')), content);
		});
	});

	test(`${name} extraction does not allocate the size claimed by ZIP metadata`, () => {
		// CVE-2026-39244: use a bounded 1 MiB claim and intercept the allocation
		// before it happens. The fixture still contains only five payload bytes.
		const declaredSize = 1024 * 1024;
		const input = archive(method, declaredSize);
		withDestination((destination) => {
			const allocate = Buffer.alloc;
			try {
				Buffer.alloc = function (size, ...args) {
					assert.ok(size < declaredSize, `ZIP metadata requested ${size} bytes`);
					return allocate(size, ...args);
				};
				new AdmZip(input).extractAllTo(destination, true);
			} finally {
				Buffer.alloc = allocate;
			}
			assert.deepEqual(fs.readFileSync(path.join(destination, 'scons')), content);
		});
	});

	test(`rejects a ${name} archive with an invalid checksum`, () => {
		withDestination((destination) => {
			assert.throws(() => new AdmZip(archive(method, content.length, 0)).extractAllTo(destination, true), /CRC32 checksum failed/);
			assert.equal(fs.existsSync(path.join(destination, 'scons')), false);
		});
	});
}
