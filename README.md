# @yangatc/dsh-filetree

DSH（DeepSeek Harness）文件树侧边栏插件：右侧栏展示当前工作区文件树，双击文件在主窗口「文件预览」tab 内预览（代码语法高亮 / 图片 / 大文件提示），支持多文件二级 tab 栏与关闭按钮。

- **右侧边栏文件树**：受主题控制、半透明、emoji 文件图标、可折叠目录
- **双击预览**：文本/代码（常见语言语法高亮）、图片、大文件提示
- **主窗口「文件预览」tab**：内部二级 tab 栏（文件名 + 关闭按钮 X），固定在顶部不随滚动
- **多文件 tab**：可同时打开多个文件，二级 tab 切换/关闭
- **自动切换**：双击文件后自动跳到「文件预览」tab

> 注：因 DSH 框架对动态/持久插件的 tab 排序限制，「文件预览」主 tab 会排在对话之前（无法放到轨迹后面）。这是框架安全机制，无法通过插件 API 绕过。

---

## 原理

DSH 的 Web 端是 [Cordis](https://github.com/cordiverse/cordis) 组合。本插件是**持久化的 profile 插件**（不是一次性动态插件）：

- **Host 半区**（`lib/index.js`，运行在 DSH Node 进程）：
  - 通过 `ctx.connection.rpc.handle('/filetree', ...)` 注册私有 RPC 通道，提供 `list` / `read` 两个端点
  - `list`：递归构建工作区文件树（忽略 `node_modules`、`.git` 等目录，深度上限 6）
  - `read`：读取文件内容（文本 / 图片 base64 / 大文件提示）
  - 使用 Node 原生 `node:fs/promises`，无需额外依赖
- **Client 半区**（`lib/client.js`，运行在浏览器）：
  - 在 `details` 插槽注册右侧文件树侧边栏
  - 在 `conversation.view` 插槽注册「文件预览」tab
  - 通过 `ctx.connection.rpc.call('/filetree', ...)` 与 Host 通信

---

## 安装

### 方式 A：npm 安装（推荐）

```bash
# 1. 把包装到 DSH web profile 的依赖里
cd "$DSH_HOME/profiles/web"
npm install @yangatc/dsh-filetree

# 2. 把插件行挂到 cordis 组合（cordis.patch.yml）
```

在 `$DSH_HOME/profiles/web/cordis.patch.yml` 的 `patches` 里追加一行：

```yaml
patches:
  - insert:
      - '@yangatc/dsh-filetree'
```

DSH 会热重载（或重启 DSH 生效），浏览器刷新后即可使用。

### 方式 B：便携拷贝

把整个项目（`lib/`、`package.json`）拷到：

```
$DSH_HOME/profiles/web/node_modules/@yangatc/dsh-filetree/
```

然后同样在 `cordis.patch.yml` 加 `- insert: '@yangatc/dsh-filetree'` 行。

> `$DSH_HOME` 默认是 `~/.dsh`（Windows：`C:\Users\<你>\.dsh`）。

---

## 使用

1. 打开网页版 DSH → 右侧栏应显示当前工作区的文件树
2. 单击目录展开/折叠，双击文件打开预览
3. 预览显示在主窗口「文件预览」tab 内，二级 tab 栏可切换/关闭多个文件

---

## 开发

```bash
# 工作区装依赖后直接改 lib/ 下源码，无需构建（host 直接 ESM，client 为手写 __ModuleLoader__ bundle）
```

client bundle 由 DSH 的 client-modules 自动按 `exports["./client"]` 重建，文件变化后浏览器硬刷新（`Ctrl+Shift+R`）即可加载新 bundle。

---

## 发布

### 发布到 npm

```bash
# 1. 登录 npm
npm login

# 2. 修改版本号（发布前会校验，避免误发 0.1.0）
npm version patch   # 或 minor / major

# 3. 发布
npm publish
```

包名 `@yangatc/dsh-filetree` 已配置 `publishConfig.access: public`，`files` 只发布 `lib/`。

### 发布到 GitHub

```bash
# 1. 初始化 git 并提交
git init
git add -A
git commit -m "feat: initial release"

# 2. 关联远程仓库（改成你的仓库地址）
git remote add origin https://github.com/<你>/dsh-filetree.git
git push -u origin master

# 3. 打 tag（可选，配合 npm version）
git tag v0.1.0
git push origin --tags
```

仓库内已包含 `.github/workflows/publish.yml`（可选 CI）：在 tag 推送时自动构建并发布到 npm。

---

## License

MIT
