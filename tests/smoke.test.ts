import { describe, it, expect } from 'vitest'
import { formatDate } from '../src/utils/formatDate'

describe('smoke', () => {
  it('formats a date string or Date object', () => {
    const d = new Date('2020-01-01T00:00:00Z')
    const s = formatDate(d)
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(0)
  })
})
