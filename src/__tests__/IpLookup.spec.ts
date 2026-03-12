import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IpLookup from '@/components/IpLookup.vue'

describe('IpLookup', () => {
  it('renders with one initial row', () => {
    const wrapper = mount(IpLookup)
    const rows = wrapper.findAll('.ip-row')
    expect(rows.length).toBe(1)
  })

  it('renders the title', () => {
    const wrapper = mount(IpLookup)
    expect(wrapper.find('.ip-lookup__title').text()).toBe('IP Lookup')
  })

  it('adds a new row when the Add button is clicked', async () => {
    const wrapper = mount(IpLookup)
    const addButton = wrapper.find('.ip-lookup__add')

    await addButton.trigger('click')
    expect(wrapper.findAll('.ip-row').length).toBe(2)

    await addButton.trigger('click')
    expect(wrapper.findAll('.ip-row').length).toBe(3)
  })

  it('does not remove the last remaining row', async () => {
    const wrapper = mount(IpLookup)
    expect(wrapper.findAll('.ip-row').length).toBe(1)

    const removeBtn = wrapper.find('.ip-row__remove')
    await removeBtn.trigger('click')

    expect(wrapper.findAll('.ip-row').length).toBe(1)
  })

  it('removes a row when multiple rows exist', async () => {
    const wrapper = mount(IpLookup)
    await wrapper.find('.ip-lookup__add').trigger('click')
    expect(wrapper.findAll('.ip-row').length).toBe(2)

    const removeBtns = wrapper.findAll('.ip-row__remove')
    await removeBtns[0].trigger('click')

    expect(wrapper.findAll('.ip-row').length).toBe(1)
  })

  it('labels rows sequentially', async () => {
    const wrapper = mount(IpLookup)
    await wrapper.find('.ip-lookup__add').trigger('click')
    await wrapper.find('.ip-lookup__add').trigger('click')

    const labels = wrapper.findAll('.ip-row__label')
    expect(labels[0].text()).toBe('IP #1')
    expect(labels[1].text()).toBe('IP #2')
    expect(labels[2].text()).toBe('IP #3')
  })
})
