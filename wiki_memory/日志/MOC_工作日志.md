---
type: moc
status: active
kind: process
importance: high
updated: 2026-09-01
topic: work-log-index
source_logs: []
supersedes: null
---

# 工作日志 MOC

> 单一工作日志索引，按更新时间倒序。任务类型通过 `kind` 元数据区分。

| 时间 | 类型 | 目标 | 状态 | 主题 | 日志 |
| --- | --- | --- | --- | --- | --- |
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
