const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const asar = require('@electron/asar');

function backupFile(targetPath) {
  const bakPath = `${targetPath}.bak`;
  if (!fs.existsSync(bakPath) && fs.existsSync(targetPath)) {
    fs.copyFileSync(targetPath, bakPath);
    console.log(`[桌面端备份] 已创建原始文件备份: ${bakPath}`);
    return true;
  }
  return false;
}

function restoreFile(targetPath) {
  const bakPath = `${targetPath}.bak`;
  if (fs.existsSync(bakPath)) {
    fs.copyFileSync(bakPath, targetPath);
    console.log(`[桌面端还原] 已成功恢复文件至初始官方版本: ${targetPath}`);
    return true;
  }
  return false;
}

function generateInjectionScript(combinedDict) {
  // Sort keys by length descending
  const sortedKeys = Object.keys(combinedDict).sort((a, b) => b.length - a.length);
  const sortedDict = {};
  for (const k of sortedKeys) {
    sortedDict[k] = combinedDict[k];
  }
  const dictJson = JSON.stringify(sortedDict);

  return `
// === Antigravity-CN-Localizer 智能实时汉化注入引擎 v2.6 ===
(function () {
  if (window.__antigravityCnInjected) return;
  window.__antigravityCnInjected = true;

  const DICTIONARY = ${dictJson};
  const keys = Object.keys(DICTIONARY);

  function escapeRegex(s) {
    return s.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
  }

  // Precompile word-boundary regular expressions
  const boundaryReplacers = [];
  for (let i = 0; i < keys.length; i++) {
    const en = keys[i];
    if (en.length < 2) continue;

    try {
      const pattern = new RegExp('\\\\b' + escapeRegex(en) + '\\\\b', 'g');
      boundaryReplacers.push({
        pattern: pattern,
        replacement: DICTIONARY[en],
        isSingleWord: !en.includes(' ')
      });
    } catch (e) {}
  }

  // Dynamic sentence templates
  const dynamicPatterns = [
    {
      regex: /(\\d+(?:\\.\\d+)?%)\\s+of the customization budget is available\\.?/i,
      fn: function(m) { return '剩余 ' + m[1] + ' 的自定义配额可用。'; }
    },
    {
      regex: /Show\\s+(\\d+)\\s+breakdowns/i,
      fn: function(m) { return '展开查看 ' + m[1] + ' 项明细'; }
    },
    {
      regex: /Hide\\s+(\\d+)\\s+breakdowns/i,
      fn: function(m) { return '收起 ' + m[1] + ' 项明细'; }
    },
    {
      regex: /You have used some of your weekly limit, it will fully refresh in\\s+(\\d+)\\s+days?,\\s*(\\d+)\\s+hours?\\.?/i,
      fn: function(m) { return '您已使用了部分每周配额，将在 ' + m[1] + ' 天 ' + m[2] + ' 小时后完全重置。'; }
    },
    {
      regex: /You have used some of your 5-hour limit, it will fully refresh in\\s+(\\d+)\\s+hours?,\\s*(\\d+)\\s+minutes?\\.?/i,
      fn: function(m) { return '您已使用了部分 5 小时配额，将在 ' + m[1] + ' 小时 ' + m[2] + ' 分钟后完全重置。'; }
    },
    {
      regex: /\\((\\d+)\\s+tokens\\)/i,
      fn: function(m) { return '(' + m[1] + ' Token)'; }
    },
    {
      regex: /Browser settings have moved to the (?:内置浏览器 )?section of (?:常规设置 )?settings\\.?/i,
      fn: function() { return '内置浏览器设置已整合迁移至“常规设置”的浏览器板块。'; }
    },
    {
      regex: /Go to (?:常规设置 )?settings/i,
      fn: function() { return '前往常规设置'; }
    }
  ];

  function translateString(str) {
    if (!str || typeof str !== 'string') return str;
    const trimmed = str.trim();
    if (!trimmed) return str;

    // 1. Direct exact match
    if (DICTIONARY[trimmed]) {
      return str.replace(trimmed, DICTIONARY[trimmed]);
    }

    // 2. Dynamic pattern templates
    for (let i = 0; i < dynamicPatterns.length; i++) {
      const p = dynamicPatterns[i];
      const match = p.regex.exec(trimmed);
      if (match) {
        return str.replace(p.regex, p.fn(match));
      }
    }

    // 3. Truncated text with ellipsis check (e.g. "..."):
    if (trimmed.endsWith('...') || trimmed.endsWith('…')) {
      const stem = trimmed.replace(/\\.{2,}|…$/, '').trim();
      if (stem.length > 8) {
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (k.length > 15 && k.startsWith(stem)) {
            return DICTIONARY[k];
          }
        }
      }
    }

    // 4. Trailing punctuation check (. , : ? !)
    const lastChar = trimmed[trimmed.length - 1];
    if (['.', ':', '?', '!', ',', '。', '：'].includes(lastChar)) {
      const stem = trimmed.slice(0, -1).trim();
      if (DICTIONARY[stem]) {
        return str.replace(trimmed, DICTIONARY[stem] + (lastChar === '.' ? '。' : lastChar === ':' ? '：' : lastChar));
      }
    }

    // 5. Word-boundary regex replacement (prevents substring collision like "Background" -> "返回ground")
    // Note: If text is longer than 30 characters, skip single-word replacements to avoid corrupting full sentences
    let res = str;
    let modified = false;
    const isLongSentence = trimmed.length > 30;
    for (let i = 0; i < boundaryReplacers.length; i++) {
      const item = boundaryReplacers[i];
      if (isLongSentence && item.isSingleWord) continue;
      if (item.pattern.test(res)) {
        item.pattern.lastIndex = 0;
        res = res.replace(item.pattern, item.replacement);
        modified = true;
      }
    }
    return modified ? res : str;
  }

  const processedTexts = new WeakMap();
  let isMutatingSelf = false;

  function translateNode(node) {
    if (!node) return;
    if (node.nodeType === 3) { // TEXT_NODE
      const val = node.nodeValue;
      if (!val) return;
      if (processedTexts.get(node) === val) return;
      processedTexts.set(node, val);

      if (/[a-zA-Z]/.test(val)) {
        const trans = translateString(val);
        if (trans !== val) {
          processedTexts.set(node, trans);
          isMutatingSelf = true;
          try {
            node.nodeValue = trans;
          } finally {
            isMutatingSelf = false;
          }
        }
      }
    } else if (node.nodeType === 1) { // ELEMENT_NODE
      const tagName = (node.tagName || '').toLowerCase();
      // Skip code editors and non-UI elements
      if (tagName === 'script' || tagName === 'style' || tagName === 'code' || tagName === 'pre') return;
      if (node.classList && (node.classList.contains('monaco-editor') || node.classList.contains('view-lines') || node.classList.contains('xterm'))) return;

      if (node.placeholder && /[a-zA-Z]/.test(node.placeholder)) {
        const trans = translateString(node.placeholder);
        if (trans !== node.placeholder) node.placeholder = trans;
      }
      if (node.title && /[a-zA-Z]/.test(node.title)) {
        const trans = translateString(node.title);
        if (trans !== node.title) node.title = trans;
      }
      const aria = node.getAttribute('aria-label');
      if (aria && /[a-zA-Z]/.test(aria)) {
        const trans = translateString(aria);
        if (trans !== aria) node.setAttribute('aria-label', trans);
      }

      // Do NOT translate text nodes inside editable areas
      if (tagName === 'textarea' || tagName === 'input' || node.isContentEditable) return;

      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        translateNode(children[i]);
      }
    }
  }

  function scanDOM() {
    if (!document || !document.body) return;
    translateNode(document.body);
  }

  function init() {
    if (!document || !document.body) {
      setTimeout(init, 50);
      return;
    }
    scanDOM();

    // Observe changes reactively using childList only (prevents characterData infinite recursion loops)
    const observer = new MutationObserver((mutations) => {
      if (isMutatingSelf) return;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === 'childList') {
          for (let j = 0; j < m.addedNodes.length; j++) {
            translateNode(m.addedNodes[j]);
          }
        }
      }
    });

    const targetNode = document.documentElement || document.body;
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;
}

function isAppAsarPatched(asarPath) {
  try {
    const preloadBuf = asar.extractFile(asarPath, 'dist/preload.js');
    return preloadBuf && preloadBuf.toString('utf8').includes('// === Antigravity-CN-Localizer 智能实时汉化注入引擎 v2.6 ===');
  } catch (e) {
    return false;
  }
}

function ensureBinaries(appConfig) {
  if (!appConfig || !appConfig.resources) return;
  const binPath = path.join(appConfig.resources, 'bin', 'language_server.exe');
  if (!fs.existsSync(binPath)) {
    console.log('[自愈] 检测到 language_server.exe 缺失，正在从更新安装包自动提取修复...');
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const updaterPending = path.join(localAppData, 'antigravity-updater', 'pending', 'Antigravity-x64.exe');
    const updaterInstaller = path.join(localAppData, 'antigravity-updater', 'installer.exe');
    const pkg = fs.existsSync(updaterPending) ? updaterPending : fs.existsSync(updaterInstaller) ? updaterInstaller : null;
    if (pkg) {
      try {
        execSync('tar -xf "' + pkg + '" -C "' + appConfig.root + '" resources/bin resources/app.asar.unpacked', { stdio: 'ignore' });
        console.log('[自愈] 已成功自动恢复 language_server.exe 及 unpacked 依赖！');
      } catch (e) {
        console.warn('[自愈] 自动提取依赖失败: ' + e.message);
      }
    }
  }
}

async function localizeApp(appConfig, dictsDir) {
  ensureBinaries(appConfig);
  console.log('\n=== 开始执行 Antigravity 2.0 桌面端汉化 ===');
  if (!appConfig || !appConfig.appAsar) {
    console.error('[错误] 未检测到 Antigravity 桌面端安装目录！');
    return false;
  }

  const asarPath = appConfig.appAsar;
  if (!fs.existsSync(asarPath)) {
    console.error(`[错误] 未找到 app.asar: ${asarPath}`);
    return false;
  }

  // 1. 若 app.asar 已经包含汉化引擎，则无需重复解包打包
  if (isAppAsarPatched(asarPath)) {
    console.log('[桌面端] 检测到 app.asar 已包含最新汉化补丁，直接保持生效。');
    return true;
  }

  // 2. 官方更新覆盖后需要重打补丁，自动关闭后台实例以解除文件锁定
  console.log('[桌面端] 检测到官方文件更新，正在解除文件锁定并重新注入汉化...');
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM Antigravity.exe /T', { stdio: 'ignore' });
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 600);
    }
  } catch (_) {}

  backupFile(asarPath);

  const appUiDict = JSON.parse(fs.readFileSync(path.join(dictsDir, 'app_ui.json'), 'utf8'));
  const jetskiDict = JSON.parse(fs.readFileSync(path.join(dictsDir, 'jetski_agent.json'), 'utf8'));
  const combinedDict = {
    ...(appUiDict.ui || {}),
    ...(appUiDict.menu || {}),
    ...(jetskiDict.exactMatches || {}),
    ...(jetskiDict.placeholders || {}),
  };

  const tempExtractDir = path.join(os.tmpdir(), `antigravity_asar_${Date.now()}`);

  try {
    console.log(`[桌面端] 解包 app.asar 到临时目录...`);
    asar.extractAll(asarPath, tempExtractDir);

    const preloadPath = path.join(tempExtractDir, 'dist', 'preload.js');
    if (fs.existsSync(preloadPath)) {
      console.log(`[桌面端] 注入包含 slash action 汉化的引擎至 preload.js (${Object.keys(combinedDict).length} 个词条)...`);
      
      let preloadContent = fs.readFileSync(preloadPath, 'utf8');
      const marker = '// === Antigravity-CN-Localizer';
      const markerIdx = preloadContent.indexOf(marker);
      if (markerIdx !== -1) {
        preloadContent = preloadContent.slice(0, markerIdx);
      }

      const injectionCode = generateInjectionScript(combinedDict);
      fs.writeFileSync(preloadPath, preloadContent + `\n${injectionCode}\n`, 'utf8');
    }

    const menuPath = path.join(tempExtractDir, 'dist', 'menu.js');
    if (fs.existsSync(menuPath)) {
      console.log(`[桌面端] 汉化主进程窗口菜单 (menu.js)...`);
      let menuCode = fs.readFileSync(menuPath, 'utf8');
      menuCode = menuCode.replace("'New Window'", "'新建窗口'");
      menuCode = menuCode.replace("'Docs'", "'使用文档'");
      menuCode = menuCode.replace("'Connect to WSL'", "'连接至 WSL'");
      menuCode = menuCode.replace("'Reopen Locally'", "'在本地重新打开'");
      fs.writeFileSync(menuPath, menuCode, 'utf8');
    }

    const ipcPath = path.join(tempExtractDir, 'dist', 'ipcHandlers.js');
    if (fs.existsSync(ipcPath)) {
      console.log(`[桌面端] 汉化原生上下文右键菜单 (ipcHandlers.js)...`);
      let ipcCode = fs.readFileSync(ipcPath, 'utf8');
      const contextDictJson = JSON.stringify(combinedDict);
      const patchCode = `// === Antigravity-CN-ContextMenu ===
const __cnContextMenuDict = ${contextDictJson};
function __translateContextMenuLabel(lbl) {
  if (!lbl || typeof lbl !== 'string') return lbl;
  const trimmed = lbl.trim();
  return __cnContextMenuDict[trimmed] || __cnContextMenuDict[lbl] || lbl;
}
// === End Antigravity-CN-ContextMenu ===
`;
      if (ipcCode.includes('// === Antigravity-CN-ContextMenu ===')) {
        const startMarker = '// === Antigravity-CN-ContextMenu ===';
        const endMarker = '// === End Antigravity-CN-ContextMenu ===\n';
        const sIdx = ipcCode.indexOf(startMarker);
        const eIdx = ipcCode.indexOf(endMarker);
        if (sIdx !== -1 && eIdx !== -1) {
          ipcCode = ipcCode.slice(0, sIdx) + ipcCode.slice(eIdx + endMarker.length);
        }
      } else if (ipcCode.includes('__cnContextMenuDict')) {
        const strictIdx = ipcCode.indexOf('"use strict";');
        if (strictIdx !== -1) {
          ipcCode = ipcCode.slice(strictIdx);
        }
      }

      ipcCode = patchCode + '\n' + ipcCode;
      ipcCode = ipcCode.replace(/label:\s*item\.label\s*\?\?\s*'',/g, "label: __translateContextMenuLabel(item.label ?? ''),");
      fs.writeFileSync(ipcPath, ipcCode, 'utf8');
    }

    console.log(`[桌面端] 重新打包 app.asar...`);
    await asar.createPackage(tempExtractDir, asarPath);
    console.log(`[桌面端] 汉化补丁打包成功！`);

    return true;
  } catch (err) {
    console.error(`[桌面端] 汉化处理失败: ${err.message}`);
    restoreFile(asarPath);
    return false;
  } finally {
    try {
      if (fs.existsSync(tempExtractDir)) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      }
    } catch (_) {}
  }
}

function restoreApp(appConfig) {
  console.log('\n=== 开始还原 Antigravity 2.0 桌面端至官方原版 ===');
  if (!appConfig || !appConfig.appAsar) {
    console.error('[错误] 未检测到 Antigravity 桌面端安装目录！');
    return false;
  }

  restoreFile(appConfig.appAsar);
  console.log('=== Antigravity 2.0 桌面端还原完成 ===\n');
  return true;
}

module.exports = {
  localizeApp,
  restoreApp,
};
