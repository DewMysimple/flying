# 飞鸟实验室工程规则

本仓库遵循 [`wiki_memory/AGENTS.md`](./wiki_memory/AGENTS.md) 的工程记忆协议。每次开始工作时，先读取 `wiki_memory/当前状态/` 中的项目概览、系统架构、当前约束和当前待办，再按需读取相关决策、知识页与最近日志。

## 项目规则

- 根目录是统一 Vite 宿主；每个 p5.js 工程必须位于 `projects/<slug>/`。
- 工程通过 `projects/<slug>/project.js` 导出 `{ slug, title, mount(container) }`，由 `src/main.js` 清单自动发现。
- 工程只能操作自己的挂载容器，并从 `mount()` 返回 `destroy()`；销毁时必须移除 p5 实例、工程 DOM、事件监听器和其他资源。
- 工程之间不得共享全局变量或使用全局 DOM 查询。新增工程只需新增目录和清单文件，不修改宿主切换协议。
- 四张教程 JPG 是不可变参考资料，记忆文件只记录其相对路径，不复制图片内容。

## 完成一批改动后的固定流程

1. 运行 `npm run build`，并按需进行浏览器冒烟检查。
2. 运行 `python wiki_memory/工具/memory_lint.py check`。
3. 运行 `python wiki_memory/工具/memory_lint.py index`。
4. 检查 `git diff --check` 和 `git status`，确认没有 `node_modules/`、`dist/`、密钥、令牌或本地缓存。
5. 为这一批完整改动创建一个 Conventional Commit，并执行 `git push origin main`。

后续用户要求的每一批完整修改都必须遵循上述“检查、记忆同步、提交、推送”流程。推送失败时必须如实报告原因并保留本地提交，禁止强制推送或覆盖远程历史。

## 记忆维护

- 长期事实写入 `wiki_memory/当前状态/`、`wiki_memory/决策/` 或 `wiki_memory/知识/`，并通过 `source_logs` 指向日志。
- 每轮实质任务完成后新增 `wiki_memory/日志/YYYY-MM-DD-任务标题.md`，再刷新日志 MOC。
- 记忆路径使用 `/` 和仓库相对路径，不写机器特定的绝对路径，不记录密钥、令牌或大段命令输出。
