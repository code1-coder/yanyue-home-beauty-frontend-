import { beforeEach, describe, expect, it, vi } from 'vitest'

const storage = new Map<string, unknown>()
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value)
})

import { mockServices as api } from './services'

beforeEach(() => { storage.clear(); api.resetDemo() })

describe('provider demo boundaries', () => {
  it('requires six-digit login code and never approves onboarding locally', async () => {
    await expect(api.auth.login('13800000000', '123')).rejects.toThrow()
    await api.auth.login('13800000000', '123456')
    expect(await api.auth.session()).toBe(true)
    const { qualifications } = await api.onboarding.get()
    await api.onboarding.submit({ realName: '演示', identityFront: 'front', identityBack: 'back', businessName: '工作室' }, qualifications.map(q => ({ id: q.id, file: 'sample', expires: q.expires })), { type: '银行卡', name: '演示', masked: '**** 1234' })
    expect((await api.onboarding.get()).provider.reviewStatus).toBe('待审核')
    await expect(api.workbench.setAccepting(true)).rejects.toThrow()
  })

  it('keeps occupied half-hour segments immutable including before/after buffers', async () => {
    const date = '2026-09-28'
    const slots = await api.schedule.day(date)
    expect(slots.find(s => s.time === '14:30')?.status).toBe('已占用')
    expect(slots.find(s => s.time === '16:00')?.status).toBe('已占用')
    await expect(api.schedule.setDay(date, slots.map(s => ({ ...s, status: '可接' })))).rejects.toThrow()
    await api.schedule.batch([date], ['09:00', '14:30'], '休息')
    expect((await api.schedule.day(date)).find(s => s.time === '14:30')?.status).toBe('已占用')
    expect((await api.schedule.day(date)).find(s => s.time === '09:00')?.status).toBe('休息')
    await api.schedule.setDay(date, await api.schedule.day(date))
    await api.orders.start('SV-1002')
    await api.orders.uploadProof('SV-1002', { before: 'before', after: 'after', note: '' })
    await api.orders.complete('SV-1002')
    expect((await api.schedule.day(date)).find(s => s.time === '14:30')?.status).toBe('可接')
    await api.schedule.setPaused(true)
    await expect(api.workbench.setAccepting(true)).rejects.toThrow()
  })

  it('keeps out-of-radius order rejectable and requires proof before completion', async () => {
    expect((await api.orders.detail('SV-1002'))?.distanceKm).toBeGreaterThan(api.snapshot().provider.radiusKm)
    await expect(api.orders.reject('SV-1001', '')).rejects.toThrow()
    await api.orders.reject('SV-1001', '路程较远')
    expect((await api.orders.detail('SV-1001'))?.status).toBe('已取消')
    await api.orders.start('SV-1002')
    await expect(api.orders.complete('SV-1002')).rejects.toThrow()
    await api.orders.uploadProof('SV-1002', { before: 'before', after: 'after', note: '' })
    await api.orders.complete('SV-1002')
    expect((await api.orders.detail('SV-1002'))?.status).toBe('已完成')
  })

  it('checks schedule and leave conflicts before a local accept', async () => {
    const date = '2026-09-28'
    const slots = await api.schedule.day(date)
    await api.schedule.setDay(date, slots.map(s => s.time === '10:00' ? { ...s, status: '休息' } : s))
    await expect(api.orders.accept('SV-1001')).rejects.toThrow('冲突')
    api.resetDemo()
    await api.schedule.addLeave({ from: '2026-09-28T09:30', to: '2026-09-28T10:00', reason: '' })
    await expect(api.orders.accept('SV-1001')).rejects.toThrow('冲突')
  })

  it('applies strict balance threshold and submits only an application', async () => {
    await expect(api.finance.withdraw(500, 'a1')).rejects.toThrow()
    await api.finance.withdraw(367.5, 'a1')
    expect((await api.finance.wallet()).available).toBe(1)
    await expect(api.finance.withdraw(1, 'a1')).rejects.toThrow()
    api.resetDemo()
    await api.finance.withdraw(0.5, 'a1')
    expect((await api.finance.wallet()).available).toBe(368)
    await expect(api.finance.withdraw(NaN, 'a1')).rejects.toThrow()
    await expect(api.finance.withdraw(0.001, 'a1')).rejects.toThrow()
    api.resetDemo()
    await api.finance.withdraw(10, 'a1')
    expect((await api.finance.withdrawals())[0].status).toBe('申请中')
    expect((await api.finance.wallet()).available).toBe(358.5)
  })

  it('does not mix mall orders/payment with service orders, wallet or qualification', async () => {
    const before = api.snapshot()
    const mall = await api.mall.create({ productId: 'g1', spec: '基础款', quantity: 2, address: '演示地址', payChannel: '微信' })
    await api.mall.pay(mall.id)
    const after = api.snapshot()
    expect(after.mallOrders).toHaveLength(before.mallOrders.length + 1)
    expect(after.orders).toEqual(before.orders)
    expect(after.wallet).toEqual(before.wallet)
    expect(after.provider.accepting).toBe(before.provider.accepting)
    expect(after.products[0].stock).toBe(before.products[0].stock - 2)
  })

  it('exposes all capability groups with isolated read and write flows', async () => {
    expect(Object.keys(api)).toEqual(expect.arrayContaining(['auth', 'onboarding', 'workbench', 'schedule', 'projects', 'orders', 'finance', 'profile', 'messages', 'mall', 'reviews']))
    expect((await api.onboarding.get()).qualifications).toHaveLength(3)
    expect((await api.workbench.summary()).awaiting).toBeGreaterThan(0)
    expect(await api.schedule.buffer()).toEqual({ before: 30, after: 30 })
    await api.schedule.setBuffer(60, 30)
    expect((await api.schedule.buffer()).before).toBe(60)
    expect(await api.schedule.leaves()).toEqual([])
    const projects = await api.projects.list()
    await api.projects.save(projects.map(p => ({ ...p, price: p.price + 1 })))
    expect((await api.projects.list())[0].price).toBe(projects[0].price + 1)
    expect(await api.orders.list('待接单')).toHaveLength(1)
    expect((await api.finance.wallet()).entries.length).toBeGreaterThan(0)
    expect(await api.finance.quote(100)).toEqual({ fee: 1, net: 99 })
    expect(await api.finance.withdrawals()).toEqual([])
    await api.finance.saveAccount({ id: 'a2', type: '微信', name: '演示', masked: '尾号 1234', isDefault: false })
    await api.finance.setDefault('a2')
    expect((await api.finance.accounts()).find(a => a.isDefault)?.id).toBe('a2')
    const profile = await api.profile.get()
    await api.profile.update({ avatar: '', nickname: '新昵称', bio: '简介', specialties: ['护理'] })
    await api.profile.serviceSettings({ radiusKm: 12, visitFee: { ...profile.visitFee, fixed: 30 } })
    expect((await api.profile.get()).radiusKm).toBe(12)
    const message = (await api.messages.list())[0]
    expect((await api.messages.detail(message.id))?.read).toBe(true)
    expect(await api.mall.products('工具')).toHaveLength(1)
    expect((await api.mall.product('g1'))?.specs).toContain('基础款')
    expect((await api.mall.order('ML-1001'))?.status).toBe('待收货')
    expect(await api.mall.tracking('ML-1001')).toContain('演示物流')
    await api.mall.afterSale('ML-1001', '演示问题')
    expect((await api.mall.orders())[0].status).toBe('售后中')
    const review = (await api.reviews.list())[0]
    await api.reviews.reply(review.id, '谢谢')
    await api.reviews.appeal(review.id, '演示申诉')
    expect((await api.reviews.list())[0]).toMatchObject({ reply: '谢谢', appeal: '演示申诉' })
    await api.auth.logout()
    expect(await api.auth.session()).toBe(false)
  })

  it('does not let editable DTOs change review or qualification authority', async () => {
    const original = api.snapshot()
    await api.profile.update({ avatar: '', nickname: '修改', bio: '', specialties: [], reviewStatus: '禁用' } as never)
    expect(api.snapshot().provider.reviewStatus).toBe(original.provider.reviewStatus)
    await api.onboarding.updateQualification({ id: 'q2', file: 'new', expires: '2028-01-01', status: '通过' } as never)
    expect(api.snapshot().qualifications[1].status).toBe('待审核')
    await expect(api.profile.serviceSettings({ radiusKm: NaN, visitFee: original.provider.visitFee })).rejects.toThrow()
    await expect(api.projects.save(original.projects.map(p => ({ ...p, price: NaN })))).rejects.toThrow()
  })

  it('copies seven days while preserving target occupancy and blocks leave on accepted orders', async () => {
    const source = await api.schedule.day('2026-09-29')
    await api.schedule.setDay('2026-09-29', source.map(s => s.time === '11:00' ? { ...s, status: '休息' } : s))
    await api.schedule.copyNextWeek('2026-09-28')
    expect((await api.schedule.day('2026-10-06')).find(s => s.time === '11:00')?.status).toBe('休息')
    expect((await api.schedule.day('2026-10-05')).find(s => s.time === '14:30')?.status).toBe('休息')
    await expect(api.schedule.addLeave({ from: '2026-09-28T14:30', to: '2026-09-28T15:00', reason: '' })).rejects.toThrow('冲突')
    await api.schedule.addLeave({ from: '2026-09-28T08:00', to: '2026-09-28T08:30', reason: '演示' })
    expect(await api.schedule.leaves()).toHaveLength(1)
    await expect(api.schedule.setDay('2026-10-06', source.map(s => ({ ...s, time: '00:15' })))).rejects.toThrow()
  })

  it('checks next-day leave against an order whose buffer crosses midnight', async () => {
    const state = api.snapshot()
    state.orders[0].date = '2026-10-01'
    state.orders[0].time = '00:00'
    state.provider.bufferBefore = 30
    state.schedule['2026-09-30'] = Array.from({ length: 48 }, (_, i) => ({ time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`, status: '可接' }))
    state.schedule['2026-10-01'] = state.schedule['2026-09-30']
    storage.set('yanyue-provider-demo-v1', state)
    // A reset still starts from JSON; a new module import rehydrates the stored fixture.
    vi.resetModules()
    const { mockServices: hydrated } = await import('./services')
    await hydrated.schedule.addLeave({ from: '2026-09-30T23:45', to: '2026-10-01T00:00', reason: '' })
    await expect(hydrated.orders.accept('SV-1001')).rejects.toThrow('冲突')
  })
})
