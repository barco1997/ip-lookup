import type { IpLookupResult } from '@/types'

const API_URL = 'https://ipapi.co'

export const lookupIp = async (
  ip: string,
  signal?: AbortSignal,
): Promise<IpLookupResult> => {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(ip.trim())}/json/`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(`Network error (${response.status})`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.reason || 'Lookup failed for this IP')
  }

  return {
    country: data.country_name,
    countryCode: data.country_code ?? '',
    timezone: data.timezone,
    query: data.ip,
  }
}
