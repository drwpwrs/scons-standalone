#!/usr/bin/env node

const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const fs = require('fs');
const AdmZip = require('adm-zip');

const platform = os.platform();
const arch = os.arch();

const zipMap = {
  win32: 'scons-win.exe.zip',
  darwin: arch === 'arm64' ? 'scons-macos-arm64.zip' : 'scons-macos-x86_64.zip',
  linux: 'scons-linux.zip'
};
const zipArchive = zipMap[platform];

if (!zipArchive) {
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

const zipArchivePath = path.join(__dirname, zipArchive);
const extractedPath = path.join(__dirname, path.basename(zipArchive, '.zip'));

if (!fs.existsSync(extractedPath)) {
  console.debug('Extracting SCons executable...');
  const zip = new AdmZip(zipArchivePath);
  zip.extractAllTo(__dirname, true);
  fs.chmodSync(extractedPath, 0o755); 
}

try {
  execFileSync(extractedPath, process.argv.slice(2), { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status);
}