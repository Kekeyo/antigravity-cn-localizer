const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_DESCRIPTIONS = {
  'agy-customizations': 'Antigravity 自定义扩展系统完整指南，涵盖技能、规则、插件、钩子与 MCP 工具。',
  'antigravity-guide': 'Google Antigravity (AGY) 官方综合指南与全景导航，涵盖 CLI、IDE、桌面端、SDK 及扩展定制。',
  'antigravity_guide': 'Google Antigravity (AGY) 官方综合指南与全景导航，涵盖 CLI、IDE、桌面端、SDK 及扩展定制。',
  'generative_ui': '在对话中或作为独立产物渲染富交互式 HTML 可视化组件与交互图表。',
  'migrate-workflows': '自动将旧版历史工作流平滑迁移为新版技能 (Skills)。',
  'permissioned-github': 'GitHub 协同操作指南，在受限环境下自动请求必要的执行授权。',
  'gemini-api-dev': '编写调用 Gemini 官方 API 代码（文本、多模态、函数调用等）的专业开发指南。',
  'gemini-interactions-api': '使用推荐的 Gemini Interactions API 进行多轮对话、多模态理解与智能体开发。',
  'gemini-live-api-dev': '使用 Gemini Live API 构建低延迟、双向实时语音与多模态流式应用。',
  'gemini-omni-flash-api': '使用 Gemini Omni 1.1 Flash 进行视频生成、视频编辑与首尾帧转场动画开发。'
};

function findSkillFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findSkillFiles(fullPath, fileList);
      } else if (entry.isFile() && entry.name === 'SKILL.md') {
        fileList.push(fullPath);
      }
    }
  } catch (err) {}
  return fileList;
}

function getAllSkillPaths() {
  const homeDir = os.homedir();
  const searchRoots = [
    path.join(homeDir, '.gemini', 'antigravity', 'builtin', 'skills'),
    path.join(homeDir, '.gemini', 'antigravity-cli', 'builtin', 'skills'),
    path.join(homeDir, '.gemini', 'antigravity-ide', 'builtin', 'skills'),
    path.join(homeDir, '.gemini', 'config', 'plugins', 'gemini-api', 'skills')
  ];

  const allFiles = [];
  for (const root of searchRoots) {
    findSkillFiles(root, allFiles);
  }
  return allFiles;
}

function replaceYamlDescription(content, newDescription) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return content;

  const lines = fmMatch[1].split(/\r?\n/);
  const newLines = [];
  let inDesc = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^description\s*:/.test(line)) {
      newLines.push(`description: ${newDescription}`);
      inDesc = true;
      continue;
    }
    if (inDesc) {
      if (/^\s+/.test(line)) {
        // Skip continuation lines of old description
        continue;
      } else {
        inDesc = false;
      }
    }
    newLines.push(line);
  }

  return content.replace(fmMatch[0], `---\n${newLines.join('\n')}\n---`);
}

function localizeSkills() {
  console.log('\n[Skills] 正在扫描并汉化所有内置与插件技能 (SKILL.md)...');
  const skillFiles = getAllSkillPaths();
  let modifiedCount = 0;

  for (const filePath of skillFiles) {
    try {
      const dirName = path.basename(path.dirname(filePath));
      const content = fs.readFileSync(filePath, 'utf8');

      let skillName = dirName;
      const nameMatch = content.match(/name:\s*([^\r\n]+)/);
      if (nameMatch) {
        skillName = nameMatch[1].trim();
      }

      const zhDesc = SKILL_DESCRIPTIONS[skillName] || SKILL_DESCRIPTIONS[dirName];
      if (!zhDesc) continue;

      // Backup original file
      const backupPath = filePath + '.bak';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, content, 'utf8');
      }

      const updated = replaceYamlDescription(content, zhDesc);
      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        modifiedCount++;
        console.log(`  ✓ 已汉化技能: [${skillName}] (${path.relative(os.homedir(), filePath)})`);
      }
    } catch (err) {
      console.warn(`  ! 处理技能失败: ${filePath}:`, err.message);
    }
  }

  console.log(`[Skills] 汉化完成，共更新 ${modifiedCount} 个技能定义文件。`);
  return modifiedCount;
}

function restoreSkills() {
  console.log('\n[Skills] 正在还原所有技能 (SKILL.md) 至官方初始英文...');
  const skillFiles = getAllSkillPaths();
  let restoredCount = 0;

  for (const filePath of skillFiles) {
    const backupPath = filePath + '.bak';
    if (fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
        restoredCount++;
        console.log(`  ✓ 已还原技能: ${path.relative(os.homedir(), filePath)}`);
      } catch (err) {
        console.warn(`  ! 还原技能失败: ${filePath}:`, err.message);
      }
    }
  }

  console.log(`[Skills] 还原完成，共恢复 ${restoredCount} 个技能文件。`);
  return restoredCount;
}

module.exports = {
  localizeSkills,
  restoreSkills,
  SKILL_DESCRIPTIONS
};
