---
type: knowledge
status: active
kind: architecture
importance: high
updated: 2026-08-21
topic: decisions-index
source_logs: []
supersedes: null
---

# 工程决策

本目录保存已确认、会影响后续工作的架构和工程决策。每个决策使用 `ADR-NNN-标题.md` 命名。

## 决策状态

- `proposed`：候选，等待用户确认。
- `active`：当前采用。
- `superseded`：被新决策替代，保留用于追溯。
- `deprecated`：不再推荐，但不一定有替代方案。

## 规则

每篇决策必须写明背景、选择、理由、影响、验证方式和来源日志。新决策替代旧决策时，填写 `supersedes`，不要删除旧文件。

## 当前决策

- [[决策/ADR-001-multi-project-host|ADR-001：统一宿主与多工程目录]]
- [[决策/ADR-002-git-submit-push|ADR-002：完整改动必须检查、提交并推送]]
- [[决策/ADR-003-fixed-dev-port|ADR-003：固定开发服务器端口]]（superseded）
- [[决策/ADR-004-adaptive-workspace-theme|ADR-004：工程主题令牌驱动宿主顶栏]]
- [[决策/ADR-005-sidebar-project-directory|ADR-005：左侧目录式工程导航]]
- [[决策/ADR-006-parallel-dev-servers|ADR-006：允许并行开发服务器]]
