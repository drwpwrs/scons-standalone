var os = require('os');
var path = require('path');
var execFileSync = require('child_process').execFileSync;
var fs = require('fs');
var AdmZip = require('adm-zip');

var platform = os.platform();
var arch = os.arch();

var zipMap = {
    win32: 'scons-win.exe.zip',
    darwin: arch === 'arm64' ? 'scons-macos-arm64.zip' : 'scons-macos-x86_64.zip',
    linux: 'scons-linux.zip'
};

var zipArchive = zipMap[platform];


/**
 * Extracts and executes the SCons executable for the current platform.
 * @param {string[]} args - Command-line arguments to pass to SCons.
 */
module.exports = function(args) {
    if (!zipArchive) {
        throw new Error('Unsupported platform: ' + platform);
    }

    var dist = path.join(__dirname, 'dist');
    var zipArchivePath = path.join(dist, zipArchive);
    var extractedPath = path.join(dist, path.basename(zipArchive, '.zip'));

    if (!fs.existsSync(extractedPath)) {
        console.debug('Extracting SCons executable...');
        var zip = new AdmZip(zipArchivePath);
        zip.extractAllTo(dist, true);
        fs.chmodSync(extractedPath, 0o755);
    }

    execFileSync(extractedPath, args, { stdio: 'inherit' });
}