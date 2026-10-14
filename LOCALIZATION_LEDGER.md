# Antigravity 汉化全量记忆档案与持久化备忘录 (Localization Ledger)

本文档永久记录当前对话及历次迭代中**所有修改、汉化与优化的界面节点、词条映射、底层注入位置与应对官方自动更新的持久化方案**。

---

## 📌 一、核心修改模块与物理注入位置速查

| 模块名称 | 目标系统文件路径 | 修改方式与作用 | 备份路径 |
| :--- | :--- | :--- | :--- |
| **桌面端渲染注入引擎** | `%LOCALAPPDATA%\Programs\antigravity\resources\app.asar` -> `dist/preload.js` | 注入 `MutationObserver` 实时扫描翻译引擎，携带 430+ 条精准词典 | `app.asar.bak` |
| **桌面端系统菜单** | `%LOCALAPPDATA%\Programs\antigravity\resources\app.asar` -> `dist/menu.js` | 汉化主窗口顶部系统菜单（File, Edit, View, Window, Help 等） | 同上 |
| **内置与插件技能定义** | `~/.gemini/antigravity/builtin/skills/*/SKILL.md`<br>`~/.gemini/antigravity-cli/builtin/skills/*/SKILL.md`<br>`~/.gemini/antigravity-ide/builtin/skills/*/SKILL.md`<br>`~/.gemini/config/plugins/gemini-api/skills/*/SKILL.md` (共 17 处) | 深度修改 YAML 前言中的 `description`，解决官方因文本过长强制硬截断 `...` 的缺陷 | `SKILL.md.bak` |
| **IDE AI 侧边栏面板** | `[IDE 安装路径]\resources\app\out\jetskiAgent\main.js` | 静态编译替换 Planning 规划、Review 产物、接受/拒绝变更等 180+ 处文案 | `main.js.bak` |
| **IDE 专属扩展命令** | `[IDE 安装路径]\resources\app\extensions\antigravity\package.json` | 汉化命令面板专属指令、设置分组及 hover 提示 | `package.json.bak` |
| **IDE 中文语言包** | `%USERPROFILE%\.antigravity-ide\argv.json` | 配置 `"locale": "zh-cn"` 并安装官方简体中文语言包 | 自动创建 |
| **智能体全局中文规则** | `~/.agents/rules/chinese-language-preset.md`<br>`~/.gemini/antigravity/global_rules/chinese-language-preset.md` | 注入系统级思维链与中文回复守则，确保日常交流与代码生成默认使用地道中文 | 自动独立文件 |

---

## 🎯 二、本次对话重点攻克的对话框与界面汉化记忆表

### 1. 输入框左侧加号（`+`）上下文菜单
- **菜单总标题**：`Add Context` $\rightarrow$ **添加上下文引用**（彻底消除 `新增 Context`）
- **条目一**：`Media` $\rightarrow$ **图片与媒体文件**
- **条目二**：`@ Mentions` / `Mentions` $\rightarrow$ **@ 提及引用**
- **条目三**：`Actions` $\rightarrow$ **快捷动作**
- **条目四**：`Browser` $\rightarrow$ **内置浏览器**

### 2. 对话框快捷指令与向下滚动的全量技能列表（`+` 或 `/`）
- `/goal` $\rightarrow$ **持续自主执行，直至指定目标完全达成为止。**
- `/schedule` $\rightarrow$ **按周期定时调度执行任务，或设定单次延时运行计时器。**
- `/browser` $\rightarrow$ **唤出自动化浏览器智能体，执行网页检索、浏览与测试任务。**
- `/grill-me` $\rightarrow$ **通过互动式提问深入对齐需求，协助完善并确认实施方案。**
- `/teamwork-preview` $\rightarrow$ **唤出多智能体协作团队，自主协同攻坚大型复杂工程。**
- `/learn` $\rightarrow$ **复盘近期的成功经验或纠错记录，沉淀为可复用的技能或规则。**
- `/boost` $\rightarrow$ **启用 Boost 多智能体调度器，针对高难度复杂任务深度攻坚。**
- `agy-customizations` $\rightarrow$ **Antigravity 自定义扩展系统完整指南，涵盖技能、规则、插件、钩子与 MCP 工具。**（彻底消除 `跟随系统...` 翻译冲突与截断）
- `antigravity-guide` $\rightarrow$ **Google Antigravity (AGY) 官方综合指南与全景导航，涵盖 CLI、IDE、桌面端、SDK 及扩展定制。**
- `generative_ui` $\rightarrow$ **在对话中或作为独立产物渲染富交互式 HTML 可视化组件与交互图表。**
- `migrate-workflows` $\rightarrow$ **自动将旧版历史工作流平滑迁移为新版技能 (Skills)。**
- `permissioned-github` $\rightarrow$ **GitHub 协同操作指南，在受限环境下自动请求必要的执行授权。**
- `gemini-api-dev` $\rightarrow$ **编写调用 Gemini 官方 API 代码（文本、多模态、函数调用等）的专业开发指南。**
- `gemini-interactions-api` $\rightarrow$ **使用推荐的 Gemini Interactions API 进行多轮对话、多模态理解与智能体开发。**
- `gemini-live-api-dev` $\rightarrow$ **使用 Gemini Live API 构建低延迟、双向实时语音与多模态流式应用。**
- `gemini-omni-flash-api` $\rightarrow$ **使用 Gemini Omni 1.1 Flash 进行视频生成、视频编辑与首尾帧转场动画开发。**

### 3. 键盘快捷键全屏弹窗（Shortcuts Modal）
- **副标题**：`Keyboard shortcuts for quick navigation and control.` $\rightarrow$ **使用键盘快捷键进行快速导航与操作控制。**
- **分类标题**：
  - `RECOMMENDED` $\rightarrow$ **推荐操作**
  - `NAVIGATION` $\rightarrow$ **界面与导航**
  - `CONVERSATION` $\rightarrow$ **会话操作**
- **快捷键专项修复**：
  - 修复词典单字 `Open` 被误设为 `打开设置` 导致的串扰：
    - `Open File Search` $\rightarrow$ **快速查找文件**（杜绝 `打开设置 文件 Search`）
    - `Open Settings` $\rightarrow$ **打开系统设置**（杜绝 `打开设置 系统设置`）
    - `Open Conversation Picker` $\rightarrow$ **打开会话选择器**
  - `Select Previous Conversation` $\rightarrow$ **选择上一会话**
  - `Select Next Conversation` $\rightarrow$ **选择下一会话**
  - `Previous Pane Tab` $\rightarrow$ **上一个面板标签页**
  - `Next Pane Tab` $\rightarrow$ **下一个面板标签页**
  - `Previous Aux Pane Tab` $\rightarrow$ **上一个辅助面板标签页**
  - `Next Aux Pane Tab` $\rightarrow$ **下一个辅助面板标签页**

### 4. 系统设置第一页（常规设置 General）底部“内置浏览器”板块
- **板块副标题**：`Configure the browser subagent. It requires Google Chrome to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.` $\rightarrow$ **配置内置浏览器智能体。此功能需安装 Google Chrome 浏览器。可在对话输入框中键入 /browser 快速唤出该智能体。**
- **JS 执行策略卡片**：
  - 标题：`Browser Javascript Execution Policy` $\rightarrow$ **浏览器 JavaScript 脚本执行策略**（杜绝拼凑词）
  - 描述：`Controls whether the agent can run custom JavaScript to automate complex browser actions.` $\rightarrow$ **控制智能体是否可以运行自定义 JavaScript 脚本来自动化执行复杂的网页操作。**
- **操作规则卡片**：
  - 标题：`Browser Actuation Rules` $\rightarrow$ **浏览器交互操作规则**（杜绝拼凑词）
  - 描述：`Configure allowed and denied URLs for browser actuation.` $\rightarrow$ **配置允许或拒绝智能体进行交互操作的网址白名单/黑名单。**

---

## 🛡️ 三、防官方重启自动更新覆盖方案

官方应用在退出重启或静默更新时可能会下载新的 `app.asar` 覆盖补丁。为此我们提供了**双重保险**：

1. **持久化启动器（推荐使用）**：
   - 运行路径：`scripts/launch-antigravity-cn.bat`
   - 每次点击它启动时，会自动秒级校验并注入汉化补丁，然后再唤起 Antigravity，确保**任何时候打开应用都是最新中文版**！
2. **一键重应用脚本**：
   - 如果您是直接从原快捷方式启动并发现被官方更新冲掉，只需双击运行：
     `scripts/install.bat`
     3 秒钟即可自动将所有 500+ 词条与技能重新全部生效！
