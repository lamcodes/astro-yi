import { describe, expect, it } from 'vitest'

import { getBlogPath, normalizeUtc8DateInput, shouldIncludeEntry } from '../src/utils/content-entry'

describe('content entry assumptions', () => {
  it('normalizes string dates to UTC+8 input', () => {
    expect(normalizeUtc8DateInput('2024-03-05')).toBe('2024-03-05+08:00')
  })

  it('keeps non-string date inputs unchanged', () => {
    const value = new Date('2024-03-05T00:00:00Z')

    expect(normalizeUtc8DateInput(value)).toBe(value)
  })

  it('filters draft entries only in production mode', () => {
    expect(shouldIncludeEntry({ draft: true }, true)).toBe(false)
    expect(shouldIncludeEntry({ draft: false }, true)).toBe(true)
    expect(shouldIncludeEntry({ draft: true }, false)).toBe(true)
  })

  it('builds canonical blog paths with trailing slash', () => {
    expect(getBlogPath('markdown-elements')).toBe('/blog/markdown-elements/')
  })
})
