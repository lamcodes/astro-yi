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

/**
 * 生产环境排除显式标记为草稿的条目；没有 draft 字段的集合默认公开。
 * 使用 object 入口避免要求 feed 等集合伪造仅属于 blog 的字段。
 */
export const shouldIncludeEntry = (data: object, isProd: boolean) => {
  const isDraft = 'draft' in data && data.draft === true

  return isProd ? !isDraft : true
}

export const getBlogPath = (slug: string) => `/blog/${slug}/`

export const getFeedPath = (slug: string) => `/feed/${slug}/`
