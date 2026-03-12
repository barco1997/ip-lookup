import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IpRow from '@/components/IpRow.vue'
import type { IpRow as IpRowType } from '@/types'
import * as ipService from '@/services/ipService'

vi.mock('@/services/ipService', () => ({
  lookupIp: vi.fn(),
}))

const createRow = (overrides: Partial<IpRowType> = {}): IpRowType => ({
  id: 1,
  ip: '',
  status: 'idle',
  result: null,
  error: null,
  ...overrides,
})

describe('IpRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders label and input', () => {
    const wrapper = mount(IpRow, {
      props: { row: createRow(), label: 'IP #1' },
    })

    expect(wrapper.find('.ip-row__label').text()).toBe('IP #1')
    expect(wrapper.find('.ip-row__input').exists()).toBe(true)
  })

  it('disables input when status is searching', () => {
    const wrapper = mount(IpRow, {
      props: {
        row: createRow({ status: 'searching' }),
        label: 'IP #1',
      },
    })

    const input = wrapper.find('.ip-row__input').element as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('shows spinner when searching', () => {
    const wrapper = mount(IpRow, {
      props: {
        row: createRow({ status: 'searching' }),
        label: 'IP #1',
      },
    })

    expect(wrapper.find('.ip-row__spinner').exists()).toBe(true)
  })

  it('shows validation error for invalid IP on blur', async () => {
    const wrapper = mount(IpRow, {
      props: { row: createRow(), label: 'IP #1' },
    })

    const input = wrapper.find('.ip-row__input')
    await input.setValue('not-valid')
    await input.trigger('blur')

    expect(wrapper.find('.ip-row__validation').text()).toBe(
      'Please enter a valid IPv4 or IPv6 address',
    )
  })

  it('shows location and time for successful result', () => {
    const wrapper = mount(IpRow, {
      props: {
        row: createRow({
          status: 'success',
          result: {
            country: 'United States',
            countryCode: 'US',
            timezone: 'America/Los_Angeles',
            query: '8.8.8.8',
          },
        }),
        label: 'IP #1',
      },
    })

    expect(wrapper.find('.ip-row__location').text()).toBe('United States')
    expect(wrapper.find('.ip-row__time').exists()).toBe(true)
  })

  it('shows error message when status is error', () => {
    const wrapper = mount(IpRow, {
      props: {
        row: createRow({
          status: 'error',
          error: 'Something went wrong',
        }),
        label: 'IP #1',
      },
    })

    expect(wrapper.find('.ip-row__error').text()).toBe('Something went wrong')
  })

  it('emits remove event when remove button is clicked', async () => {
    const wrapper = mount(IpRow, {
      props: { row: createRow({ id: 42 }), label: 'IP #1' },
    })

    await wrapper.find('.ip-row__remove').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([[42]])
  })

  it('triggers search on blur with valid IP', async () => {
    vi.mocked(ipService.lookupIp).mockResolvedValue({
      country: 'United States',
      countryCode: 'US',
      timezone: 'UTC',
      query: '8.8.8.8',
    })

    const wrapper = mount(IpRow, {
      props: { row: createRow(), label: 'IP #1' },
    })

    const input = wrapper.find('.ip-row__input')
    await input.setValue('8.8.8.8')
    await input.trigger('blur')

    expect(wrapper.emitted('update')).toBeTruthy()
    const firstEmit = wrapper.emitted('update')![0][0] as IpRowType
    expect(firstEmit.status).toBe('searching')
  })

  it('does not search on blur when input is empty', async () => {
    const wrapper = mount(IpRow, {
      props: { row: createRow(), label: 'IP #1' },
    })

    await wrapper.find('.ip-row__input').trigger('blur')

    expect(wrapper.emitted('update')).toBeFalsy()
  })

  it('renders flag icon from country code', () => {
    const wrapper = mount(IpRow, {
      props: {
        row: createRow({
          status: 'success',
          result: {
            country: 'United Kingdom',
            countryCode: 'GB',
            timezone: 'Europe/London',
            query: '1.2.3.4',
          },
        }),
        label: 'IP #1',
      },
    })

    const flag = wrapper.find('.ip-row__flag')
    expect(flag.exists()).toBe(true)
    expect(flag.classes()).toContain('fi')
    expect(flag.classes()).toContain('fi-gb')
  })

  it('clears validation error on input', async () => {
    const wrapper = mount(IpRow, {
      props: { row: createRow(), label: 'IP #1' },
    })

    const input = wrapper.find('.ip-row__input')
    await input.setValue('invalid')
    await input.trigger('blur')
    expect(wrapper.find('.ip-row__validation').exists()).toBe(true)

    await input.setValue('8.8.8.8')
    expect(wrapper.find('.ip-row__validation').exists()).toBe(false)
  })
})
