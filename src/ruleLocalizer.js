const fs = require('fs');
const path = require('path');
const os = require('os');

const CHINESE_SYSTEM_RULE = `---
description: 中文语言交互规范与智能体回答设定
trigger: always_on
---

# 语言与交互规范 (Language & Interaction Rules)

1. **中文优先交互**：
   - 在所有日常对话、方案规划 (Implementation Plan)、进度汇报、任务解释以及错误诊断中，必须默认使用流畅、自然、符合中文母语者习惯的简体中文进行回复。
   - 保持专业、准确的中文技术表述。对于行业标准专有英文缩写或术语（如 Git、RESTful API、Docker、K8s、AST、Electron 等），采用【中文语法 + 英文标准术语】的自然混合模式，无需生硬意译。

2. **代码与文件操作**：
   - 编写或重构代码时，代码中的注释、函数说明文档 (Docstring) 以及报错提示应遵循项目现有风格，若为中文项目或新建项目优先提供中文注释。
   - 提交信息 (Git Commit Message) 与变更概述使用清晰准确的中文描述。

3. **思维链与逻辑表述**：
   - 智能体内部思考过程、计划排期与行动步骤，均统一使用中文组织，确保用户随时能清晰审阅与理解意图。
`;

function deployChineseRule() {
  const home = os.homedir();
  const ruleDirs = [
    path.join(home, '.agents', 'rules'),
    path.join(home, '.gemini', 'antigravity', 'global_rules'),
  ];

  let deployedCount = 0;
  for (const dir of ruleDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const targetFile = path.join(dir, 'chinese-language-preset.md');
      fs.writeFileSync(targetFile, CHINESE_SYSTEM_RULE, 'utf8');
      console.log(`[规则注入] 已成功部署全局中文规则: ${targetFile}`);
      deployedCount++;
    } catch (err) {
      console.warn(`[规则注入提示] 写入 ${dir} 失败: ${err.message}`);
    }
  }

  return deployedCount > 0;
}

function removeChineseRule() {
  const home = os.homedir();
  const ruleFiles = [
    path.join(home, '.agents', 'rules', 'chinese-language-preset.md'),
    path.join(home, '.gemini', 'antigravity', 'global_rules', 'chinese-language-preset.md'),
  ];

  for (const f of ruleFiles) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log(`[规则移除] 已移除中文规则: ${f}`);
    }
  }
}

module.exports = {
  CHINESE_SYSTEM_RULE,
  deployChineseRule,
  removeChineseRule,
};
