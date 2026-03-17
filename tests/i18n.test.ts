import { describe, expect, it } from 'vitest'

import { useTranslations } from '../src/i18n/utils'

describe('i18n assumptions', () => {
  it('returns configured Chinese navigation copy for known keys', () => {
    const t = useTranslations('zh-cn')

    expect(t('nav.blog')).toBe('博客')
    expect(t('home.goBack')).toBe('返回')
  })

  it('returns English copy for known keys', () => {
    const t = useTranslations('en')

    expect(t('nav.blog')).toBe('Blog')
    expect(t('home.readMore')).toBe('Read more')
  })
})
