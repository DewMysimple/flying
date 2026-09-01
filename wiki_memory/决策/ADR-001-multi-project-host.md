---
type: decision
status: active
kind: architecture
importance: high
updated: 2026-09-01
topic: multi-project-host
source_logs:
  - "[[日志/2026-09-01-初始化多工程工作区]]"
supersedes: null
---

# ADR-001：统一宿主与多 p5.js 工程目录

## 背景

后续会持续增加飞鸟蒲公英之外的 p5.js 作品，需要在一个开发服务器中切换，同时避免工程间的全局变量、DOM 和事件互相污染。

## 选择

根目录保留一个 Vite 入口和宿主层。每个作品放在 `projects/<slug>/`，通过 `project.js` 导出 `{ slug, title, mount(container) }`。宿主通过 Vite 的工程清单自动发现项目，并用 URL 的 `project` 查询参数记录当前选择。

## 生命周期协议

宿主切换时先调用旧工程返回的 `destroy()`，清空挂载容器，再调用新工程的 `mount(container)`。工程必须把 DOM、p5 实例和事件监听限制在自己的容器中；载入失败时清空容器并显示可理解的错误状态。

## 理由与影响

这种边界让新增工程只需要新增目录和清单文件，不需要改写根目录切换协议；代价是每个工程必须认真实现清理逻辑，并共享根目录依赖。

## 验证方式

使用 `npm run build` 验证清单和打包，浏览器检查 URL 恢复、画布唯一性、切换销毁和移动端顶栏布局。来源见 [[日志/2026-09-01-初始化多工程工作区|初始化日志]]。
