const fs = require('fs');
const path = require('path');

function backupFile(targetPath) {
  const bakPath = `${targetPath}.bak`;
  if (!fs.existsSync(bakPath) && fs.existsSync(targetPath)) {
    fs.copyFileSync(targetPath, bakPath);
    console.log(`[备份] 已创建原始文件备份: ${bakPath}`);
    return true;
  }
  return false;
}

function restoreFile(targetPath) {
  const bakPath = `${targetPath}.bak`;
  if (fs.existsSync(bakPath)) {
    fs.copyFileSync(bakPath, targetPath);
    console.log(`[还原] 已恢复文件至官方初始状态: ${targetPath}`);
    return true;
  }
  return false;
}

function configureVscodeLocale(ideConfig) {
  if (!ideConfig || !ideConfig.argvJson) return false;
  const argvPath = ideConfig.argvJson;
  if (!fs.existsSync(argvPath)) {
    fs.mkdirSync(path.dirname(argvPath), { recursive: true });
    fs.writeFileSync(argvPath, JSON.stringify({ locale: 'zh-cn' }, null, 2), 'utf8');
    console.log(`[IDE语言] 创建并设置语言为 zh-cn: ${argvPath}`);
    return true;
  }

  let content = fs.readFileSync(argvPath, 'utf8');
  if (content.includes('"locale": "zh-cn"')) {
    console.log(`[IDE语言] argv.json 已配置为中文 (zh-cn)`);
    return true;
  }

  backupFile(argvPath);

  if (/"locale"\s*:\s*"[^"]*"/.test(content)) {
    content = content.replace(/"locale"\s*:\s*"[^"]*"/, '"locale": "zh-cn"');
  } else {
    content = content.replace(/\{/, '{\n\t"locale": "zh-cn",');
  }

  fs.writeFileSync(argvPath, content, 'utf8');
  console.log(`[IDE语言] 成功配置 argv.json 语言为中文 (zh-cn)`);
  return true;
}

function localizeIdePackage(ideConfig, dictPath) {
  if (!ideConfig || !ideConfig.extensionPkg) return false;
  const pkgPath = ideConfig.extensionPkg;
  if (!fs.existsSync(pkgPath)) {
    console.warn(`[IDE扩展] 未找到 package.json: ${pkgPath}`);
    return false;
  }

  backupFile(pkgPath);

  const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (pkg.contributes && pkg.contributes.customEditors) {
    for (const editor of pkg.contributes.customEditors) {
      if (dict.editors && dict.editors[editor.displayName]) {
        editor.displayName = dict.editors[editor.displayName];
      }
    }
  }

  if (pkg.contributes && pkg.contributes.commands) {
    for (const cmd of pkg.contributes.commands) {
      if (dict.commands && dict.commands[cmd.title]) {
        cmd.title = dict.commands[cmd.title];
      }
    }
  }

  if (pkg.contributes && pkg.contributes.configuration) {
    const config = pkg.contributes.configuration;
    if (dict.configuration && dict.configuration[config.title]) {
      config.title = dict.configuration[config.title];
    }
    if (config.properties) {
      for (const [key, prop] of Object.entries(config.properties)) {
        if (prop.description && dict.configuration[prop.description]) {
          prop.description = dict.configuration[prop.description];
        }
        if (prop.markdownDescription && dict.configuration[prop.markdownDescription]) {
          prop.markdownDescription = dict.configuration[prop.markdownDescription];
        }
      }
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  console.log(`[IDE扩展] 已成功汉化 Antigravity 核心扩展命令与设置项: ${pkgPath}`);
  return true;
}

function localizeJetskiAgent(ideConfig, dictPath) {
  if (!ideConfig || !ideConfig.jetskiAgent) return false;
  const agentPath = ideConfig.jetskiAgent;
  if (!fs.existsSync(agentPath)) {
    console.warn(`[IDE面板] 未找到 jetskiAgent/main.js: ${agentPath}`);
    return false;
  }

  backupFile(agentPath);

  const bakPath = `${agentPath}.bak`;
  let code = fs.existsSync(bakPath) ? fs.readFileSync(bakPath, 'utf8') : fs.readFileSync(agentPath, 'utf8');

  const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
  const combined = {
    ...(dict.exactMatches || {}),
    ...(dict.placeholders || {}),
  };

  const sortedKeys = Object.keys(combined).sort((a, b) => b.length - a.length);
  let replacedCount = 0;

  for (const en of sortedKeys) {
    const zh = combined[en];
    const doubleQuoted = `"${en}"`;
    const singleQuoted = `'${en}'`;

    if (code.includes(doubleQuoted)) {
      code = code.split(doubleQuoted).join(`"${zh}"`);
      replacedCount++;
    }
    if (code.includes(singleQuoted)) {
      code = code.split(singleQuoted).join(`'${zh}'`);
      replacedCount++;
    }
  }

  const explicitReplacements = [
    ['children:"General"', 'children:"常规设置"'],
    ['children:"Settings"', 'children:"系统设置"'],
    ['children:"Workspaces"', 'children:"工作区"'],
    ['children:"Projects"', 'children:"项目工程"'],
    ['children:"Show all"', 'children:"显示全部"'],
    ['children:"Not in Project"', 'children:"未关联项目"'],
    ['children:"Conversations"', 'children:"历史会话"'],
    ['children:"Shortcuts"', 'children:"键盘快捷键"'],
    ['children:"Provide Feedback"', 'children:"意见与反馈"'],
    ['children:"Execution"', 'children:"执行策略"'],
    ['children:"Queued Messages"', 'children:"消息排队模式"'],
    ['children:"Agent Settings"', 'children:"智能体配置"'],
    ['children:"Agent Behavior"', 'children:"智能体行为"'],
    ['children:"Network Permissions"', 'children:"网络访问权限"'],
    ['children:"Terminal & Tooling Permissions"', 'children:"终端与工具权限"'],
    ['children:"Turbo Mode"', 'children:"疾速模式 (Turbo)"'],
    ['children:"Open"', 'children:"打开设置"'],
    ['children:"Always Proceed"', 'children:"始终继续"'],
    ['children:"Queue"', 'children:"排队等待"'],
    ['children:"Send Immediately"', 'children:"立即发送"'],
    ['label:"Create Project"', 'label:"新建项目"'],
    ['label:"Command Palette"', 'label:"命令面板"'],
    ['label:"Maximize"', 'label:"最大化"'],
    ['label:"Minimize"', 'label:"最小化"'],
    ['label:"Toggle Fullscreen"', 'label:"切换全屏"'],
    ['label:"Reset Zoom"', 'label:"重置缩放"'],
    ['label:"Zoom In"', 'label:"放大"'],
    ['label:"Zoom Out"', 'label:"缩小"'],
    ['label:"About"', 'label:"关于"'],
    ['"Create Project"', '"新建项目"'],
    ['"Command Palette"', '"命令面板"'],
    ['"Maximize"', '"最大化"'],
  ];

  for (const [enChunk, zhChunk] of explicitReplacements) {
    if (code.includes(enChunk)) {
      code = code.split(enChunk).join(zhChunk);
      replacedCount++;
    }
  }

  fs.writeFileSync(agentPath, code, 'utf8');
  console.log(`[IDE面板] 已成功汉化 jetskiAgent AI 交互面板 (${replacedCount} 处词条与组件生效): ${agentPath}`);
  return true;
}

function localizeIde(ideConfig, dictsDir) {
  console.log('\n=== 开始执行 Antigravity IDE 汉化 ===');
  if (!ideConfig) {
    console.error('[错误] 未检测到 Antigravity IDE 安装目录！');
    return false;
  }

  const ideCommandsDict = path.join(dictsDir, 'ide_commands.json');
  const jetskiDict = path.join(dictsDir, 'jetski_agent.json');

  configureVscodeLocale(ideConfig);
  localizeIdePackage(ideConfig, ideCommandsDict);
  localizeJetskiAgent(ideConfig, jetskiDict);

  console.log('=== Antigravity IDE 汉化完成 ===\n');
  return true;
}

function restoreIde(ideConfig) {
  console.log('\n=== 开始还原 Antigravity IDE 至官方原版 ===');
  if (!ideConfig) {
    console.error('[错误] 未检测到 Antigravity IDE 安装目录！');
    return false;
  }

  if (ideConfig.extensionPkg) restoreFile(ideConfig.extensionPkg);
  if (ideConfig.jetskiAgent) restoreFile(ideConfig.jetskiAgent);
  if (ideConfig.argvJson) restoreFile(ideConfig.argvJson);

  console.log('=== Antigravity IDE 还原完成 ===\n');
  return true;
}

module.exports = {
  localizeIde,
  restoreIde,
  configureVscodeLocale,
  localizeIdePackage,
  localizeJetskiAgent,
};
