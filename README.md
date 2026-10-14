# Antigravity-CN-Localizer 🇨🇳 (Antigravity 汉化深度桌面端套件)

<p align="center">
  <img src="https://img.shields.io/badge/Antigravity-2.0%2B-blue?style=flat-square" alt="Antigravity Version" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-green?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Engine-v2.6%20Non--blocking-orange?style=flat-square" alt="Engine Version" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License" />
</p>

专为 **Google Antigravity 2.0 桌面客户端** 打造的深度中文汉化与本地化解决方案。支持原生会话右键菜单、系统设置面板、执行策略下拉框、快捷动作指令（Slash Commands）以及智能体中文交互规则。

---


## 快速使用

提供两种最便捷的使用方式，无论是否具备开发基础均可轻松上手：

### 方式一：一键自动安装包（⭐ 最推荐，自动创建桌面中文版图标）

1. 从 [Releases 最新发布页](https://github.com/Kekeyo/antigravity-cn-localizer/releases/latest) 下载 **`Antigravity-CN-v2.6-Setup.zip`**（仅 3.4 MB）；
2. 解压到任意文件夹，双击运行 **`一键安装中文版.bat`**；
3. **完成！** 程序将全自动备份原版并注入汉化，同时在您的电脑桌面上自动生成 **`Antigravity (中文版)`** 图标，点击即可随时启动中文版！


---

### 方式二：手动替换 app.asar 方式

1. 从 Releases 下载 `app.asar`；
2. 完全退出 Antigravity 应用；
3. 键盘按 `Win + R` 键，输入并回车打开目录：
   ```text
   %LOCALAPPDATA%\Programs\antigravity\resources
   ```
4. 将目录里的原版 `app.asar` 重命名为 `app.asar.bak` 作为备份；
5. 将下载的 `app.asar` 复制替换进去即可。

---

### 方式二：一键脚本与源码自动注入（推荐）

如果你已克隆本仓库，可以直接通过脚本一键完成自动检测与注入：

#### 1. 运行环境准备
- 已安装 [Node.js](https://nodejs.org/) (v18 或更高版本)

#### 2. 一键安装汉化
在项目根目录下：
```bash
# 安装依赖
npm install

# 一键注入全部组件（桌面端 + 技能 + 规则）
node src/index.js --target=all
```
> **提示**：Windows 用户也可直接双击运行 `scripts/install.bat`，脚本将自动停止后台实例并完成注入。

---

## 🔄 随时还原官方原版

如需随时撤销汉化并恢复到 Google 官方原版英文界面：

```bash
# 命令行一键还原
node src/index.js --restore=all
```
或者直接双击运行 `scripts/restore.bat`。

---

## 📁 项目结构

```text
antigravity-cn-localizer/
├── src/
│   ├── index.js                  # CLI 入口与任务调度
│   ├── detector.js               # 本地安装路径与配置动态探测
│   ├── appLocalizer.js           # 桌面端 Electron 注入/提取核心引擎 (v2.6)
│   ├── ideLocalizer.js           # IDE 核心与 AI 协作面板汉化引擎
│   ├── skillLocalizer.js         # 智能体技能长描述源头汉化引擎
│   ├── ruleLocalizer.js          # 全局中文提示词规范部署
│   └── dictionaries/             # 中文字典词库 (500+ 词条)
│       ├── app_ui.json           # 桌面端 UI 界面字典
│       └── jetski_agent.json     # 会话面板与占位符字典
├── scripts/
│   ├── install.bat               # Windows 双击一键安装脚本
│   ├── launch-antigravity-cn.bat # 带汉化自愈能力的启动器
│   └── restore.bat               # Windows 双击一键还原脚本
├── build_master_dict.js          # 主字典编译构建工具
├── package.json
└── README.md
```

## ✨ 核心特性

- 🚀 **极速无阻塞引擎 (v2.6)**：基于 `WeakMap` 与 `childList` 增量变动监听，彻底解决打开系统设置面板时 100% CPU 假死卡顿问题，性能零损耗。
- 🖱️ **原生右键菜单深度汉化**：深度拦截 Electron 主进程 IPC 管道，完美汉化会话列表原生右键菜单（`重命名`、`固定`、`标记为未读`、`复制 (会话名称/会话 ID/项目名称)`、`分屏`、`归档`、`删除` 等）。
- 🛡️ **执行策略全景汉化**：底部运行模式全面本地化（`极速模式 (Turbo)`、`请求审查 (Request Review)`、`默认标准` 及所有安全说明文案）。
- ⚡ **斜杠指令与技能描述**：全面汉化输入框快捷命令（`/goal`, `/schedule`, `/browser`, `/grill-me`, `/teamwork-preview`, `/learn`, `/boost`）与内置技能的长文本说明。
- 🔄 **自愈防覆盖与一键还原**：自动生成 `.bak` 备份文件，提供一键还原脚本，随时无损秒级恢复官方原版英文界面。

---

## ❓ 常见问题 (FAQ)

**Q1：官方升级新版本后汉化会失效吗？**  
A：官方如果推送更新包覆盖了文件，汉化可能被官方文件冲掉。此时只需重新运行一次 `scripts/install.bat` 或 `node src/index.js --target=all` 即可秒级重新打上补丁。

**Q2：汉化会对我的代码或 Git 仓库造成影响吗？**  
A：绝对不会。汉化仅对软件自身的 UI 展示与菜单标签进行本地化映射，完全不修改用户的业务代码、文件读写或网络通信。

---

## 📄 开源许可与免责声明

- 本项目基于 [MIT 许可证](LICENSE) 开源。
- 本项目仅供个人技术研究与日常学习交流使用，不含任何商业推广内容。
