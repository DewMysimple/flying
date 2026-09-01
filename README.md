# 飞鸟实验室

统一的 Vite + p5.js 多工程工作区。根目录宿主提供顶栏、工程清单和同一张画布的切换协议；当前内置“飞鸟蒲公英”和“莲花小池”两个工程。

## 开始使用

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5189/`。也可以直接访问：

- `http://127.0.0.1:5189/?project=flying-dandelion`
- `http://127.0.0.1:5189/?project=lotus-pond`

刷新后会按 URL 恢复工程。端口已固定，若被占用会直接报错，不会自动切换到其他端口。Windows 下也可运行根目录的 `runStart.cmd`。

## 工程结构

```text
index.html                 # 统一宿主入口
src/main.js                # 工程发现、URL 状态与 mount/destroy 切换
src/style.css              # 宿主顶栏、反馈状态和响应式布局
projects/<slug>/            # 独立 p5.js 工程
  project.js               # { slug, title, mount(container) }
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
