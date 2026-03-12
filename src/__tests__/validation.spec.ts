import { describe, it, expect } from 'vitest'
import { isValidIp, getValidationError } from '@/utils/validation'

describe('isValidIp', () => {
  it('accepts valid IPv4 addresses', () => {
    expect(isValidIp('8.8.8.8')).toBe(true)
    expect(isValidIp('192.168.1.1')).toBe(true)
    expect(isValidIp('0.0.0.0')).toBe(true)
    expect(isValidIp('255.255.255.255')).toBe(true)
  })

  it('accepts valid IPv4 with surrounding whitespace', () => {
    expect(isValidIp('  8.8.8.8  ')).toBe(true)
  })

  it('rejects invalid IPv4 addresses', () => {
    expect(isValidIp('256.1.1.1')).toBe(false)
    expect(isValidIp('1.2.3')).toBe(false)
    expect(isValidIp('1.2.3.4.5')).toBe(false)
    expect(isValidIp('abc.def.ghi.jkl')).toBe(false)
    expect(isValidIp('192.168.1')).toBe(false)
  })

  it('accepts valid IPv6 addresses', () => {
    expect(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
    expect(isValidIp('::1')).toBe(true)
  })

  it('rejects empty input', () => {
    expect(isValidIp('')).toBe(false)
    expect(isValidIp('   ')).toBe(false)
  })

  it('rejects arbitrary strings', () => {
    expect(isValidIp('hello')).toBe(false)
    expect(isValidIp('google.com')).toBe(false)
  })
})

describe('getValidationError', () => {
  it('returns null for valid IPs', () => {
    expect(getValidationError('8.8.8.8')).toBeNull()
    expect(getValidationError('1.1.1.1')).toBeNull()
  })

  it('returns required error for empty input', () => {
    expect(getValidationError('')).toBe('IP address is required')
    expect(getValidationError('  ')).toBe('IP address is required')
  })

  it('returns format error for invalid IPs', () => {
    expect(getValidationError('not-an-ip')).toBe(
      'Please enter a valid IPv4 or IPv6 address',
    )
    expect(getValidationError('999.999.999.999')).toBe(
      'Please enter a valid IPv4 or IPv6 address',
    )
  })
})
