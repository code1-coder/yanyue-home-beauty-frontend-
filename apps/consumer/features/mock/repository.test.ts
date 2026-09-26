import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = new Map<string, unknown>()
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => store.get(key),
  setStorageSync: (key: string, value: unknown) => store.set(key, structuredClone(value))
})

describe('consumer demo repository', () => {
  beforeEach(() => { store.clear(); vi.resetModules() })

  it('keeps outside-radius booking available with an explicit warning flag', async () => {
    const { bookingRepository } = await import('./repository')
    const draft = { projectId: 'p3', beauticianId: 'b2', date: '2026-09-30', slot: '09:00', addressId: 'a1', note: '' }
    expect(bookingRepository.quote(draft)).toMatchObject({ projectAmount: 328, visitFee: 40, payable: 368, outsideRadius: true })
    expect(bookingRepository.create(draft)?.status).toBe('待支付')
  })

  it('rejects invalid sample slots and missing addresses', async () => {
    const { bookingRepository, orderRepository, profileRepository } = await import('./repository')
    const draft = { projectId: 'p1', beauticianId: 'b1', date: '2026-09-30', slot: '09:15', addressId: 'a1', note: '' }
    expect(bookingRepository.create(draft)).toBeNull()
    expect(bookingRepository.create({ ...draft, slot: '10:30' })).toBeNull()
    expect(bookingRepository.create({ ...draft, slot: '14:30' })).toBeNull()
    expect(bookingRepository.quote({ ...draft, addressId: 'missing' })).toBeNull()
    expect(profileRepository.address('missing')).toBeUndefined()
    expect(orderRepository.byId('missing')).toBeUndefined()
  })

  it('does not treat a failed payment attempt as paid', async () => {
    const { bookingRepository, orderRepository } = await import('./repository')
    const order = bookingRepository.create({ projectId: 'p1', beauticianId: 'b1', date: '2026-09-30', slot: '10:00', addressId: 'a1', note: '' })!
    expect(orderRepository.byId(order.id)?.status).toBe('待支付')
    orderRepository.update(order.id, '待接单')
    expect(orderRepository.byId(order.id)?.status).toBe('待接单')
  })

  it('keeps browsing location separate from the booking address', async () => {
    const { profileRepository } = await import('./repository')
    profileRepository.setLocation('长沙', '五一广场')
    expect(profileRepository.city()).toBe('长沙')
    expect(profileRepository.locationLabel()).toBe('五一广场')
    expect(profileRepository.address('a1')?.city).toBe('杭州')
    profileRepository.setCity('杭州')
    expect(profileRepository.locationLabel()).toBe('')
  })
})
