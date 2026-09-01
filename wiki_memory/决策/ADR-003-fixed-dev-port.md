---
type: decision
status: active
kind: architecture
importance: high
updated: 2026-09-01
topic: fixed-dev-port
source_logs:
  - "[[日志/2026-09-01-固定开发服务器端口]]"
supersedes: null
---

# ADR-003：固定开发服务器端口

## 背景

工作区中可能同时运行多个 Vite 工程。若宿主没有明确端口，Vite 会在端口冲突时自动递增，用户打开旧端口就会看到另一个工程；`0.0.0.0` 与本机回环地址的混用还会加重这个误判。

## 选择

飞鸟实验室的开发和预览服务器统一监听 `127.0.0.1:5189`，并启用 `strictPort: true`。配置集中在根目录 `vite.config.js`，npm 脚本只调用 `vite` 和 `vite preview`。

## 理由与影响

固定端口让启动地址稳定，端口被占用时立即暴露问题，不会静默连接到其他工程。代价是启动前需要释放 `5189`，或由用户明确处理端口占用，而不是让 Vite 自动选择新端口。

## 验证方式

从仓库根目录执行 `npm run dev`，确认仅监听 `127.0.0.1:5189`；访问 `http://127.0.0.1:5189/?project=flying-dandelion` 应显示飞鸟蒲公英宿主。来源见 [[日志/2026-09-01-固定开发服务器端口|固定端口日志]]。
