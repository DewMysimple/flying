# 飞鸟实验室

统一的 Vite + p5.js 多工程工作区。根目录宿主提供左侧工程目录、工程清单和同一张画布的切换协议；当前内置“飞鸟蒲公英”和“莲花小池”两个工程。

## 开始使用

```bash
npm install
npm run dev
```

打开终端中 Vite 输出的地址。默认从 `http://127.0.0.1:5189/` 开始，也可以直接访问：

- `http://127.0.0.1:5189/?project=flying-dandelion`
- `http://127.0.0.1:5189/?project=lotus-pond`

刷新后会按 URL 恢复工程。如果 `5189` 已被其他开发服务器占用，Vite 会自动递增到下一个空闲端口，并在终端打印实际地址；也可以显式指定端口：`npm run dev -- --port 5200`。Windows 下也可运行根目录的 `runStart.cmd`。

左侧工程目录可展开或收起；收起后仍可通过飞鸟、荷花等工程图标直接切换，状态会在刷新后保留。

## 工程结构

```text
index.html                 # 统一宿主入口
src/main.js                # 工程发现、目录状态与 mount/destroy 切换
src/style.css              # 宿主侧栏、反馈状态和主题布局
projects/<slug>/            # 独立 p5.js 工程
  project.js               # { slug, title, icon?, mount(container) }
  sketch.js                # 工程逻辑
  style.css                # 工程专属样式
wiki_memory/               # 工程记忆与 lint/index 工具
source/                     # 参考资料与未来工程素材
```

新增工程时，只需创建新的 `projects/<slug>/project.js` 并导出统一生命周期接口。工程不得依赖其他工程的全局变量或 DOM。

## 检查与记忆同步

```bash
npm run build
python wiki_memory/工具/memory_lint.py check
python wiki_memory/工具/memory_lint.py index
```

完成一批修改并通过检查后，必须提交并推送到 `origin/main`。详见根目录 [`AGENTS.md`](./AGENTS.md) 和 [`wiki_memory/README.md`](./wiki_memory/README.md)。
