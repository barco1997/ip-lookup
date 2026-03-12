import { describe, it, expect } from 'vitest'
import { getTimeInTimezone } from '@/utils/time'

describe('getTimeInTimezone', () => {
  it('returns a time string in hh:mm:ss format', () => {
    const time = getTimeInTimezone('America/New_York')
    expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('returns fallback for invalid timezone', () => {
    const time = getTimeInTimezone('Invalid/Timezone')
    expect(time).toBe('--:--:--')
  })

  it('handles UTC timezone', () => {
    const time = getTimeInTimezone('UTC')
    expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('handles various valid timezones', () => {
    const zones = ['Europe/London', 'Asia/Tokyo', 'Australia/Sydney']
    for (const tz of zones) {
      const time = getTimeInTimezone(tz)
      expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    }
  })
})
