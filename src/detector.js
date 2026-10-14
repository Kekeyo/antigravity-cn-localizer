const fs = require('fs');
const path = require('path');
const os = require('os');

function getHomeDir() {
  return os.homedir();
}

function detectPaths() {
  const home = getHomeDir();
  const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
  const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files';

  // Candidate directories for Antigravity IDE
  const ideCandidates = [
    process.env.ANTIGRAVITY_IDE_DIR,
    path.join(localAppData, 'Programs', 'Antigravity IDE'),
    path.join(programFiles, 'Antigravity IDE'),
    'C:\\Program Files\\Antigravity IDE',
  ].filter(Boolean);

  let idePath = null;
  for (const p of ideCandidates) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'resources', 'app'))) {
      idePath = p;
      break;
    }
  }

  // Candidate directories for Antigravity 2.0 Desktop App
  const appCandidates = [
    path.join(localAppData, 'Programs', 'antigravity'),
    path.join(programFiles, 'antigravity'),
    'C:\\Program Files\\antigravity',
  ];

  let appPath = null;
  for (const p of appCandidates) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'resources'))) {
      appPath = p;
      break;
    }
  }

  // User config dirs
  const ideUserData = path.join(home, '.antigravity-ide');
  const ideArgvPath = path.join(ideUserData, 'argv.json');
  const ideExtensionsDir = path.join(ideUserData, 'extensions');

  const geminiDir = path.join(home, '.gemini', 'antigravity');

  return {
    ide: idePath ? {
      root: idePath,
      resourcesApp: path.join(idePath, 'resources', 'app'),
      jetskiAgent: path.join(idePath, 'resources', 'app', 'out', 'jetskiAgent', 'main.js'),
      extensionPkg: path.join(idePath, 'resources', 'app', 'extensions', 'antigravity', 'package.json'),
      extensionDir: path.join(idePath, 'resources', 'app', 'extensions', 'antigravity'),
      binCmd: path.join(idePath, 'bin', 'antigravity-ide.cmd'),
      userDataDir: ideUserData,
      argvJson: ideArgvPath,
      extensionsDir: ideExtensionsDir,
    } : null,
    app: appPath ? {
      root: appPath,
      resources: path.join(appPath, 'resources'),
      appAsar: path.join(appPath, 'resources', 'app.asar'),
      appAsarUnpacked: path.join(appPath, 'resources', 'app.asar.unpacked'),
      binDir: path.join(appPath, 'resources', 'bin'),
    } : null,
    customizations: {
      geminiDir: geminiDir,
      globalWorkflows: path.join(geminiDir, 'global_workflows'),
      rulesDir: path.join(home, '.agents', 'rules'),
    }
  };
}

module.exports = {
  detectPaths,
  getHomeDir,
};
