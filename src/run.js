#!/usr/bin/env node

const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const fs = require('fs');
const AdmZip = require('adm-zip');

const platform = os.platform();
const arch = os.arch();

const executableMap = {
  win32: 'scons-win.exe',
  darwin: arch === 'arm64' ? 'scons-macos-arm64' : 'scons-macos-x86_64',
  linux: 'scons-linux'
};
const executable = executableMap[platform];

if (!executable) {
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

const executablePath = path.join(__dirname, executable);
const extractedPath = path.join(__dirname, path.basename(executable, '.zip'));

if (!fs.existsSync(extractedPath)) {
  console.debug('Extracting SCons executable...');
  const zip = new AdmZip(executablePath);
  zip.extractAllTo(__dirname, true);
  fs.chmodSync(extractedPath, 0o755); 
}

try {
  execFileSync(extractedPath, process.argv.slice(2), { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status);
}