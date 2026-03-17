/**
 * [INPUT]: 依赖调用方传入 content entry 的 data/slug 与当前环境标志
 * [OUTPUT]: 对外提供日期预处理、草稿过滤、博客链接生成等纯函数
 * [POS]: src/utils 的内容契约工具，被 content 配置、博客路由、RSS 与集合工具共享
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const normalizeUtc8DateInput = (value: unknown) => {
  if (typeof value === 'string') {
    return `${value}+08:00`
  }

  return value
}

export const shouldIncludeEntry = (data: { draft?: boolean | null }, isProd: boolean) => {
  return isProd ? !data.draft : true
}

export const getBlogPath = (slug: string) => `/blog/${slug}/`

export const getFeedPath = (slug: string) => `/feed/${slug}/`
