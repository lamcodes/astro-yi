# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这个仓库是一个基于 Astro 6、Tailwind CSS 3 和少量 SolidJS 的技术博客。它是内容驱动型站点：大多数行为都从 Astro 内容集合和全局站点配置开始，而不是从客户端状态开始。

## 常用命令

- 安装依赖：`npm ci`
- 启动本地开发服务器：`npm run dev`
- 构建生产产物：`npm run build`
- 预览构建结果：`npm run preview`
- 运行全部测试：`npm run test`
- 运行单个 Vitest 文件：`npx vitest run tests/path/to/file.test.ts`
- 按名称运行匹配的测试：`npx vitest run -t "test name"`

## 工具链与约束

- `package.json` 和 CI 都要求 Node 22。
- CI 在 [.github/workflows/ci.yml](.github/workflows/ci.yml) 中只运行 `npm ci`、`npm run test` 和 `npm run build`。
- `package.json` 里没有单独的 lint 脚本；不要在文档或自动化里凭空假设有它。
- `tsconfig.json` 故意保持宽松（`strict: false`、`noImplicitAny: false`）。不要假设这里有严格模式保障。

## 高层架构

### 1. 内容集合就是数据模型

真正的事实来源是 [src/content.config.ts](src/content.config.ts) 中定义的 `astro:content`。

- `blog` 集合：来自 `src/content/blog` 的长文文章
- `feed` 集合：来自 `src/content/feed` 的短动态内容
- 两个集合都使用 [src/utils/content-entry.ts](src/utils/content-entry.ts) 中的 `normalizeUtc8DateInput()`，把纯日期字符串规范成 `+08:00` 时区后再做 schema 解析。
- 草稿过滤集中在 [src/utils/content-entry.ts](src/utils/content-entry.ts) 的 `shouldIncludeEntry()`。生产环境构建时会排除草稿；开发环境则保留可见。

处理内容行为时，先看：
- [src/content.config.ts](src/content.config.ts)
- [src/utils/content-entry.ts](src/utils/content-entry.ts)
- [src/utils/getCollectionByName.ts](src/utils/getCollectionByName.ts)

### 2. `src/consts.ts` 驱动了大部分站点行为

全局站点行为配置集中在 [src/consts.ts](src/consts.ts)。这不只是静态元数据；它控制了主要运行时行为：

- `site`：站点 URL、标题、头像、分页大小、RSS 元数据、favicon 资源
- `config`：默认语言、分析脚本开关、代码折叠、Memos 集成、Umami/GA 开关
- `categories`：主导航项
- `infoLinks`：页脚和个人资料链接
- `donate`：赞赏区块开关与资源
- `comment`：选择 Waline 或 Giscus 及其运行时配置

如果某个页面、布局或组件在不同部署环境下行为不同，先检查 `src/consts.ts`。

### 3. 布局分成列表页壳和文章详情页壳

这里主要有两个页面壳：

- [src/layouts/IndexPage.astro](src/layouts/IndexPage.astro)：列表页、首页、搜索页、归档页一类页面。它负责渲染页头、页脚、个人资料、侧边栏，以及可选的赞赏和评论区块。
- [src/layouts/BlogPost.astro](src/layouts/BlogPost.astro)：博客文章和 feed 条目的详情页。它处理页面元信息、目录、Fancybox/图片行为、可选评论、MathJax 和 Mermaid 支持。

如果改动会影响共享外壳或侧边栏行为，编辑前先把这两个布局都看一遍。

### 4. 路由结构以集合为核心

主要路由都由内容集合和配置里的分页大小生成。

博客路由：
- [src/pages/index.astro](src/pages/index.astro)：首页；加载 blog 集合，按 sticky 排序，展示第一页
- [src/pages/blog/[page].astro](src/pages/blog/[page].astro)：通过 Astro `paginate()` 生成分页博客列表
- [src/pages/blog/[...slug].astro](src/pages/blog/[...slug].astro)：通过 `getEntry()` + `render()` 渲染博客详情页

Feed 路由：
- [src/pages/feed/[page].astro](src/pages/feed/[page].astro)：feed 分页列表
- [src/pages/feed/[...slug].astro](src/pages/feed/[...slug].astro)：feed 详情页

其他辅助路由也依赖集合派生数据：
- archive 页面
- category 页面
- tag 页面
- [src/pages/search.astro](src/pages/search.astro)：面向 blog 条目的客户端搜索
- [src/pages/rss.xml.js](src/pages/rss.xml.js)：从 blog 集合生成 RSS

需要生成规范内部路径时，使用 [src/utils/content-entry.ts](src/utils/content-entry.ts) 里的 `getBlogPath()` 和 `getFeedPath()`。

### 5. 排序和过滤放在工具函数里，而不是到处内联

内容集合的消费者通常先走 [src/utils/getCollectionByName.ts](src/utils/getCollectionByName.ts)，再套用专门的工具函数：

- `orderBySticky()`：用于首页和列表页的博客排序
- `sortPostsByDate()`：用于 feed 的时间排序和上一篇/下一篇导航
- `src/utils/` 下还有 category/tag/archive 相关辅助函数

如果排序不对，先查工具函数，再动页面文件。

### 6. 搜索是主要的客户端 island

搜索由 SolidJS 组件 [src/components/Search.jsx](src/components/Search.jsx) 实现，并在 [src/pages/search.astro](src/pages/search.astro) 里通过 `client:only="solid-js"` 挂载。

这是项目里少数真正的客户端交互 island 之一。其余大多数页面都是静态 Astro 模板，只带少量浏览器端增强。

### 7. 国际化很简单，而且由配置驱动

翻译文本放在 `src/i18n/*.ts`，通过 [src/i18n/utils.ts](src/i18n/utils.ts) 选择。

- [src/consts.ts](src/consts.ts) 中的 `config.lang` 选择当前语言。
- 导出的 `t` 函数对当前构建来说基本是全局的。
- 这不是基于路由的 i18n 系统；改语言是配置级行为。

### 8. Head、元数据和外部集成都集中在一个地方

[src/components/BaseHead.astro](src/components/BaseHead.astro) 是这些内容的统一入口：

- canonical URL
- favicon 和 manifest 链接
- Open Graph 和 Twitter 元数据
- sitemap 链接
- 主题切换脚本
- 可选的 MathJax、Mermaid、Busuanzi、Google Analytics 和 Umami 脚本

如果要改元数据、分析脚本或 head 标签，先从这里下手，不要把修改散落到各个页面。

### 9. 评论和其他集成都有功能开关

评论通过 [src/components/Comment.astro](src/components/Comment.astro) 抽象，内部会切换：
- [src/components/WalineComment.astro](src/components/WalineComment.astro)
- [src/components/GiscusComment.astro](src/components/GiscusComment.astro)

评论是否渲染，取决于 [src/consts.ts](src/consts.ts) 里的全局配置，以及条目前言中的 `comment`、`donate`、`toc`、`mathjax`、`mermaid`。

Memos 是单独的浏览器端集成，位于 [src/pages/memos/index.astro](src/pages/memos/index.astro)，由 `config.memosUrl` 和 `config.memosUsername` 驱动。

## 内容编写相关事实

- 博客内容位于 `src/content/blog`。
- Feed 内容位于 `src/content/feed`。
- 博客条目支持的前言字段包括 `title`、`description`、`date`、`tags`、`category`、`sticky`、`mathjax`、`mermaid`、`draft`、`toc`、`donate`、`comment`，定义见 [src/content.config.ts](src/content.config.ts)。
- Feed 条目的 schema 更小，主要是 `date`、`donate` 和 `comment`。
- slug 是基于文件路径生成的，因为集合加载器使用了 `glob()`。

## 样式说明

- Tailwind 配置在 [tailwind.config.js](tailwind.config.js)。
- 项目使用基于 class 的暗色模式（`darkMode: "class"`）。
- 主题颜色很大程度上依赖 Tailwind 配置里 `skin` 色组暴露的 CSS 变量。
- [postcss.config.cjs](postcss.config.cjs) 里的 PostCSS 只是 Tailwind + autoprefixer 的构建桥接层。

## 现有项目级指导的处理方式

之前的项目级 `CLAUDE.md` 主要是一个简短项目说明和一段带日期的设计变更记录。那些有价值的信息已经被吸收进这份更可执行的版本里。保持这个文件聚焦于命令、架构和那些不读多个文件就看不出来的项目行为，不要把它写成变更日志。
