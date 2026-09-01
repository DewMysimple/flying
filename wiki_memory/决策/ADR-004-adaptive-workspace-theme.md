---
type: decision
status: active
kind: architecture
importance: medium
updated: 2026-09-02
topic: adaptive-workspace-theme
source_logs:
  - "[[日志/2026-09-02-自适应主题顶栏与切换器]]"
supersedes: null
---

# ADR-004：工程主题令牌驱动宿主顶栏

## 背景

统一宿主会持续承载视觉风格不同的 p5.js 工程。顶栏若按工程 slug 固定颜色，新增工程时必须修改宿主 CSS，且容易与画布内容产生冲突。

## 选择

每个工程 manifest 提供 `theme.surface`、`theme.ink`、`theme.accent` 三个语义令牌。宿主把令牌写入 CSS 自定义属性，并用 CSS 派生透明度、边框、悬停态、选中态和阴影；宿主不按工程 slug 添加颜色分支。

工程切换使用无第三方依赖的按钮 + listbox 浮层，避免原生下拉菜单在不同操作系统上的不可控样式。

## 理由与影响

颜色只在工程自身定义一次，新增工程只需提供主题令牌即可接入统一顶栏。自绘菜单增加少量宿主交互代码，但能保证圆角、文字对比、选中态和键盘操作的一致性。

## 验证方式

使用桌面浏览器检查两个现有工程的主题切换、菜单键盘操作、URL 恢复和销毁边界；使用构建与 memory lint 检查宿主清单和记忆完整性。来源见 [[日志/2026-09-02-自适应主题顶栏与切换器|自适应主题顶栏日志]]。
