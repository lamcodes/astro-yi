# Zane Blog - 技术博客

Astro + Tailwind CSS 技术博客，聚焦后端开发、网络技术和容器化。

<directory>
src/ - 源码目录
├── components/ - 25个UI组件
├── layouts/ - 2个布局组件 (IndexPage, BlogPost)
├── pages/ - 页面路由
├── styles/ - 样式文件 (Tailwind + 自定义)
├── content/ - MDX内容集合
├── i18n/ - 多语言支持
├── utils/ - 工具函数
├── consts.ts - 全局配置
└── plugins/ - Astro插件
</directory>

<config>
package.json - Astro 4.16.13 + Tailwind CSS 3.4.1
tailwind.config.js - 响应式断点 + 深色模式
</config>

<法则>极简·响应式·深色模式·多语言</法则>

---

## 变更日志

### 2026-01-07 - 文章卡片设计优化

**改动文件**：
- `src/components/PostView.astro` - 容器卡片化
- `src/components/PostViewTitle.astro` - pill 样式重构
- `src/styles/index.css` - 新增卡片样式

**设计改进**：
- 移除 divider-vertical，改用 pill/标签样式
- 卡片容器增加 hover 浮起效果
- 建立清晰的视觉层次（元信息→标题→摘要）
- 元信息使用独立颜色区分（日期/分类/标签）
