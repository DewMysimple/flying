---
type: decision
status: active
kind: operations
importance: medium
updated: 2026-09-02
topic: parallel-dev-servers
source_logs:
  - "[[日志/2026-09-02-并行开发服务器端口]]"
supersedes: "[[决策/ADR-003-fixed-dev-port|ADR-003：固定开发服务器端口]]"
---

# ADR-006：允许并行开发服务器

## 背景

工作区可能同时运行多个 Vite 实例，或与其他本地工程共用开发端口。此前宿主使用 `strictPort: true`，旧进程未退出时新的 `npm run dev` 会直接失败，关闭浏览器标签也无法释放 Node/Vite 进程。

## 选择

- 保留 `127.0.0.1` 作为默认监听地址。
- 开发和预览服务器默认从 `5189` 开始；端口被占用时由 Vite 自动递增到下一个空闲端口。
- 支持 `npm run dev -- --port 5200` 这类 CLI 参数，为并行实例明确指定端口。
- 终端启动输出是实例地址的唯一依据；宿主通过 URL 的 `project` 参数恢复工程，不根据端口判断工程归属。

## 理由与影响

多个服务可以同时运行，不必为了释放固定端口而结束其他工程。自动递增会使地址不再始终是 `5189`，因此启动后应使用 Vite 输出的实际 URL；这避免了第二个实例因端口冲突失败，同时不改变统一宿主的多工程切换协议。

## 验证方式

启动两个开发实例，确认第一个监听 `5189`、第二个监听下一个空闲端口，并分别能通过 `?project=flying-dandelion` 和 `?project=lotus-pond` 访问。运行 `npm run build`、memory lint 和 `git diff --check`。来源见 [[日志/2026-09-02-并行开发服务器端口|并行开发服务器端口日志]]。
