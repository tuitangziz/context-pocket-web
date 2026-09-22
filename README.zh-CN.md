# Context Pocket · 把代码装进口袋

**选代码 → 定任务 → 复制给 AI。**

一个小而实用的 AI 上下文整理工具：在浏览器里选择本地项目，把需要的文件整理成一份 Markdown，方便发给 AI 理解项目、排查问题或审查代码。

**无需安装依赖，无需 API Key，不上传代码。** 本工具负责整理上下文，本身不调用或运行大模型。

[在线使用](https://tuitangziz.github.io/context-pocket-web/) · [English](README.md) · [反馈问题](https://github.com/tuitangziz/context-pocket-web/issues)

![Context Pocket 示例界面](docs/screenshot.png)

## 30 秒上手

1. 打开在线页面，点击「试试示例」体验。
2. 点击「选择文件夹」导入自己的小项目，也可以只选几个文件。每次选择都会替换当前项目。
3. 勾选需要的文件，选择「理解项目 / 排查问题 / 代码审查 / 补充测试」，写下具体问题。
4. 查看右侧预览，确认没有不想分享的内容，再复制或下载 Markdown。
5. 粘贴到你常用的 AI 对话中。

## 适合什么场景

- 想让 AI 解释几份 Python、前端或课程项目代码。
- 排查问题时，需要同时提供多个文件和目录结构。
- 不想逐个复制粘贴，也不想安装命令行工具。
- 希望分享前先筛选文件，限制上下文大小。

特色是 **本地处理、中文友好、可视化预览、零依赖**。大型仓库、精确 token 统计、完整 Git 忽略规则可以使用更成熟的 [Repomix](https://github.com/yamadashy/repomix) 或 [Gitingest](https://github.com/coderamp-labs/gitingest)。这个项目独立实现，定位于小项目的轻量使用流程。

## 完全离线使用

在 GitHub 点击 **Code → Download ZIP**，解压后双击 `index.html`，保留同目录的 JS、CSS 和图标文件即可。不需要 Python、Node.js 或联网。

如果电脑已有 Node.js 20+，也可以：

```sh
git clone https://github.com/tuitangziz/context-pocket-web.git
cd context-pocket-web
npm start
```

打开 `http://127.0.0.1:8765`。**不用运行 `npm install`。** 本地预览服务只监听回环地址，只提供指定的应用文件，不接收代码上传。

推荐桌面 Chrome / Edge。浏览器不支持选文件夹时，可使用「选择文件」。本地 `file://` 页面可能限制自动复制；工具会选中预览，按 Ctrl+C / ⌘C 或下载 `.md` 即可。

## 文件筛选与预算

- 默认跳过 `node_modules`、`.git`、虚拟环境、构建产物和锁文件。
- 默认跳过 `.env` 系列、常见凭据文件、证书私钥等；包括 `.env.example`，第一版不允许手动重新启用这些文件。
- 只处理支持类型的 UTF-8 文本，单文件上限 256 KiB。
- 单次读取最多 2,000 个候选文件、20 MiB 原始内容。
- 按文件路径排序，超出预算的文件整份跳过，后续较小文件仍可能被纳入。预算包含任务、目录清单和 Markdown 标记。
- 字符数按 JavaScript UTF-16 代码单元计算；token 是粗略估计，不是模型真实计数。
- 搜索只改变可见列表；取消勾选或添加忽略规则才会改变导出内容。

在「额外忽略规则」里每行写一个 glob，也可以放到所选文件夹根目录的 `.contextignore`：

```gitignore
# 注释
tests/
*.csv
docs/**
src/**/generated?.py
```

支持 `*`、`**`、`?` 和目录尾部 `/`，不支持 `!` 否定规则和完整 Git 语义；**不会读取 `.gitignore`，不会应用嵌套 `.contextignore`**。含 `/` 的模式相对于所选根目录，简单文件名在各层目录匹配。删除规则会恢复匹配文件原有的勾选状态。

## 隐私边界

文件在浏览器内存中处理，不持久化；刷新或关闭页面后需要重新选择。应用没有埋点、远程字体、CDN 脚本或上传接口，并通过 CSP 禁止脚本发起网络连接。在线版最初仍需从 GitHub Pages 加载网页资源，受托管服务的正常日志与政策约束；离线版无此加载请求。

**自动遮盖只是辅助，无法保证发现所有秘密。** 常见 API token、私钥块、密码赋值会替换为 `[REDACTED]`，但可能漏掉个人信息、自定义凭据、敏感文件名，也可能误遮盖普通代码。Notebook 按原始 JSON 处理，可能包含输出结果。分享前务必看一遍预览。

## 开发与测试

```sh
npm test
npm start
```

用原生 HTML/CSS/JavaScript 实现，Node.js 内置测试，无第三方依赖、无构建步骤。核心逻辑在 `core.js`，界面交互在 `app.js`，适合阅读、学习和做小改进。

欢迎提交使用反馈、发现的问题和小功能改进。如果对你有帮助，也欢迎点一个 Star，让更多人发现它。

## 开源协议

[MIT](LICENSE)
