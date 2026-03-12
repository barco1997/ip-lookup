export interface IpLookupResult {
  country: string
  countryCode: string
  timezone: string
  query: string
}

export type RowStatus = 'idle' | 'searching' | 'success' | 'error'

export interface IpRow {
  id: number
  ip: string
  status: RowStatus
  result: IpLookupResult | null
  error: string | null
}
