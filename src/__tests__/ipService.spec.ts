import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupIp } from '@/services/ipService'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()
})

describe('lookupIp', () => {
  it('returns parsed result on successful response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          country_name: 'United States',
          country_code: 'US',
          timezone: 'America/Los_Angeles',
          ip: '8.8.8.8',
        }),
    })

    const result = await lookupIp('8.8.8.8')

    expect(result).toEqual({
      country: 'United States',
      countryCode: 'US',
      timezone: 'America/Los_Angeles',
      query: '8.8.8.8',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('8.8.8.8'),
      expect.any(Object),
    )
  })

  it('throws on network error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(lookupIp('8.8.8.8')).rejects.toThrow('Network error (500)')
  })

  it('throws on API failure response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          error: true,
          reason: 'invalid query',
        }),
    })

    await expect(lookupIp('invalid')).rejects.toThrow('invalid query')
  })

  it('passes abort signal to fetch', async () => {
    const controller = new AbortController()

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          country_name: 'US',
          timezone: 'UTC',
          ip: '1.1.1.1',
        }),
    })

    await lookupIp('1.1.1.1', controller.signal)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    )
  })

  it('trims whitespace from IP input', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          country_name: 'US',
          timezone: 'UTC',
          ip: '1.1.1.1',
        }),
    })

    await lookupIp('  1.1.1.1  ')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('1.1.1.1'),
      expect.any(Object),
    )
  })
})
