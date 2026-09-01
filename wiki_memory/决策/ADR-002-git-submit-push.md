---
type: decision
status: active
kind: process
importance: high
updated: 2026-09-01
topic: git-submit-push-policy
source_logs:
  - "[[日志/2026-09-01-初始化多工程工作区]]"
supersedes: null
---

# ADR-002：完整改动必须检查、提交并推送

## 背景

仓库需要由远程 Git 记录每批可复现的完整改动，且工程记忆要和代码版本保持同步。

## 选择

每批完整修改完成后，固定执行：构建和必要的冒烟测试、记忆 lint、日志索引、差异检查、Conventional Commit，然后 `git push origin main`。不提交 `node_modules/`、`dist/`、密钥、令牌或本地缓存；推送失败必须报告，禁止强制推送。

## 影响

每次交付都会产生一个可追溯提交，远程 `main` 是协作基线。小的连续修改可以合并为一批，但不得跳过验证或记忆同步。

## 验证方式

检查 `git status` 干净、`git log -1` 与远程 `origin/main` 一致，并确认记忆体检通过。来源见 [[日志/2026-09-01-初始化多工程工作区|初始化日志]]。
