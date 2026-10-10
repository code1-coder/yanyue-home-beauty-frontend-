import { describe, expect, it } from 'vitest'
import { dateToTimestamp, fenToYuan, timestampToDate, yuanToFen } from '../platform/mapper'

describe('mapper', () => {
  it('converts fen/yuan without loss under reasonable amounts', () => {
    expect(fenToYuan(36850)).toBe(368.5)
    expect(yuanToFen(368.5)).toBe(36850)
    expect(fenToYuan(1)).toBe(0.01)
    expect(yuanToFen(0.01)).toBe(1)
    expect(yuanToFen(0.005)).toBe(1)
    expect(yuanToFen(0.004)).toBe(0)
  })

  it('formats timestamps to date strings and back', () => {
    expect(timestampToDate(1727683200000)).toBe('2024-09-30')
    expect(dateToTimestamp('2024-09-30')).toBe(new Date('2024-09-30T00:00:00').getTime())
  })
})
