---
type: moc
status: active
kind: process
importance: high
updated: 2026-09-02
topic: work-log-index
source_logs: []
supersedes: null
---

# 工作日志 MOC

> 单一工作日志索引，按更新时间倒序。任务类型通过 `kind` 元数据区分。

| 时间 | 类型 | 目标 | 状态 | 主题 | 日志 |
| --- | --- | --- | --- | --- | --- |
| 2026-09-02 | ui | 让统一宿主顶栏根据工程主题令牌自适应，并改善工程切换器的圆角、底色、文字对比和键盘交互。 | archived | adaptive-workspace-theme | [[日志/2026-09-02-自适应主题顶栏与切换器.md|2026-09-02｜自适应主题顶栏与切换器]] |
| 2026-09-02 | feature | 根据教程视频、文字稿和最终效果预览，在统一宿主中新增第二个真实 p5.js 工程。 | archived | add-lotus-pond-project | [[日志/2026-09-02-新增莲花小池工程.md|新增莲花小池工程]] |
| 2026-09-02 | feature | 新增以“望帝离世—化为杜鹃—啼血染花”为核心的桌面 p5.js 诗意动态叙事。 | archived | add-cuckoo-blood-flowers-project | [[日志/2026-09-02-新增杜鹃啼血工程.md|新增杜鹃啼血工程]] |
| 2026-09-02 | operations | 解决旧 Vite 进程仍占用 `5189` 时，新的 `npm run dev` 无法启动的问题，并允许多个开发服务器并行运行。 | archived | parallel-dev-servers | [[日志/2026-09-02-并行开发服务器端口.md|2026-09-02｜并行开发服务器端口]] |
| 2026-09-02 | ui | 参考用户提供的展开/收起侧栏，将宿主顶部工程切换器改为可识别的左侧工程目录。 | archived | sidebar-project-directory | [[日志/2026-09-02-左侧目录式工程导航.md|2026-09-02｜左侧目录式工程导航]] |
| 2026-09-02 | bug | - | archived | fix-collapsed-sidebar-active-marker | [[日志/2026-09-02-修复收起侧栏高亮溢出.md|修复收起侧栏高亮溢出]] |
| 2026-09-01 | maintenance | 解决执行 `npm run dev` 后因端口自动递增或打开旧端口而误连其他工程的问题。 | archived | fixed-dev-port | [[日志/2026-09-01-固定开发服务器端口.md|固定开发服务器端口]] |
| 2026-09-01 | maintenance | 将飞鸟蒲公英整理为可扩展的多 p5.js 工程仓库，建立工程记忆，并准备推送到 `origin/main`。 | archived | initialize-multi-project-workspace | [[日志/2026-09-01-初始化多工程工作区.md|初始化多工程工作区]] |

## 使用方式

- 由 `python 工具/memory_lint.py index` 生成或刷新。
- 查询时先阅读当前状态，再按关键词定位日志。
- 历史日志是审计记录，不应直接覆盖当前状态。

## 入口

- [[README|工程 Agent 记忆系统]]
- [[AGENTS|记忆维护协议]]
- [[日志/README|工作日志说明]]
- [[当前状态/项目概览|当前项目概览]]
- [[当前状态/系统架构|当前系统架构]]
