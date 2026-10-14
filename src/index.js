#!/usr/bin/env node
const path = require('path');
const { detectPaths } = require('./detector');
const { localizeIde, restoreIde } = require('./ideLocalizer');
const { localizeApp, restoreApp } = require('./appLocalizer');
const { deployChineseRule, removeChineseRule } = require('./ruleLocalizer');
const { localizeSkills, restoreSkills } = require('./skillLocalizer');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    target: null,
    restore: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1];
    } else if (arg.startsWith('--restore=')) {
      options.restore = arg.split('=')[1];
    } else if (arg === '--restore') {
      options.restore = 'all';
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  // If neither specified, default to localizing all
  if (!options.target && !options.restore) {
    options.target = 'all';
  }

  return options;
}

function printBanner() {
  console.log('====================================================');
  console.log('  🚀 Antigravity-CN-Localizer 汉化与优化套件 v1.1.0');
  console.log('  支持: Antigravity IDE | 桌面端 | 智能体动作与技能 | 交互规则');
  console.log('====================================================\n');
}

function printHelp() {
  console.log(`使用方法:
  node src/index.js [选项]

选项:
  --target=all      [默认] 汉化所有组件 (IDE + 桌面端 + 技能列表 + 中文规则)
  --target=ide      仅汉化 Antigravity IDE
  --target=app      仅汉化 Antigravity 2.0 桌面端应用
  --target=skills   仅汉化智能体技能与动作命令描述
  --target=rules    仅注入智能体中文回复规则

  --restore=all     一键还原所有组件至官方原版
  --restore=ide     仅还原 Antigravity IDE
  --restore=app     仅还原 Antigravity 2.0 桌面端应用
  --restore=skills  仅还原智能体技能定义 (SKILL.md)
  --restore=rules   仅移除全局中文交互规则

  --help, -h        显示此帮助文档
`);
}

async function main() {
  printBanner();
  const options = parseArgs();

  if (options.help) {
    printHelp();
    return;
  }

  const paths = detectPaths();
  const dictsDir = path.join(__dirname, 'dictionaries');

  console.log('[环境探测结果]');
  console.log(`- Antigravity IDE:   ${paths.ide ? paths.ide.root : '未检测到'}`);
  console.log(`- Antigravity 桌面端: ${paths.app ? paths.app.root : '未检测到'}`);
  console.log(`- 用户自定义规则目录: ${paths.customizations.geminiDir}`);
  console.log('----------------------------------------------------\n');

  // Handle Restore
  if (options.restore) {
    const r = options.restore.toLowerCase();
    if (r === 'all' || r === 'ide') {
      restoreIde(paths.ide);
    }
    if (r === 'all' || r === 'app') {
      restoreApp(paths.app);
    }
    if (r === 'all' || r === 'skills') {
      restoreSkills();
    }
    if (r === 'all' || r === 'rules') {
      removeChineseRule();
    }
    console.log('✨ 所选组件已全部成功还原至官方原始状态！');
    return;
  }

  // Handle Localize
  const t = options.target.toLowerCase();
  if (t === 'all' || t === 'ide') {
    localizeIde(paths.ide, dictsDir);
  }
  if (t === 'all' || t === 'app') {
    await localizeApp(paths.app, dictsDir);
  }
  if (t === 'all' || t === 'skills') {
    localizeSkills();
  }
  if (t === 'all' || t === 'rules') {
    deployChineseRule();
  }

  console.log('\n====================================================');
  console.log('  🎉 汉化部署完成！');
  console.log('  💡 提示:');
  console.log('  1. 请重启正在运行的 Antigravity IDE 与 Antigravity 桌面端以加载新界面。');
  console.log('  2. 如需随时恢复官方原版英文，可执行: npm run restore:all');
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('[执行异常]', err);
  process.exit(1);
});
