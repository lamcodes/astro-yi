import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import solid from '@astrojs/solid-js';
import remarkDirective from "remark-directive";
import expressiveCode from "astro-expressive-code";
import {pluginLineNumbers} from '@expressive-code/plugin-line-numbers'
import {pluginCollapsibleSections} from '@expressive-code/plugin-collapsible-sections'

import {remarkModifiedTime,} from "./src/plugins/remark-modified-time.mjs";
import {resetRemark} from "./src/plugins/reset-remark.js";
import {remarkAsides} from  './src/plugins/remark-asides.js'
import {remarkCollapse} from "./src/plugins/remark-collapse.js";
import {remarkGithubCard} from './src/plugins/remark-github-card.js'
import {lazyLoadImage} from "./src/plugins/lazy-load-image.js";

const noindexPages = new Set([
  'https://blog.zkplife.com/404/',
  'https://blog.zkplife.com/search/',
]);

export default defineConfig({
  site: 'https://blog.zkplife.com',
  integrations: [sitemap({
    // 这些页面自身声明 noindex，继续放进 sitemap 会让 Search Console 报“被 noindex 排除”。
    filter: (page) => !noindexPages.has(page),
  }), solid(), expressiveCode({
    plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
    themes: ["github-dark", "github-light"],
  }), mdx()],
  markdown: {
    remarkPlugins: [remarkModifiedTime, resetRemark, remarkDirective, remarkAsides({}),remarkCollapse({}),remarkGithubCard()],
    rehypePlugins: [lazyLoadImage],
  }
});
