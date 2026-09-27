import seed from './data.json'
import type { ProviderServices } from '../contracts'
import type { DemoState, MallOrder, Slot } from '../types'

const key = 'yanyue-provider-demo-v1'
const clone = <T>(item: T): T => item === undefined ? item : JSON.parse(JSON.stringify(item)) as T
let state: DemoState = load()
function load(): DemoState {
  try {
    const saved = uni.getStorageSync(key) as DemoState | undefined
    if (saved && Array.isArray(saved.orders) && Array.isArray(saved.mallOrders) && saved.provider) return saved
  } catch { /* Browser/test preview can run without uni storage. */ }
  return clone(seed) as DemoState
}
function save() { try { uni.setStorageSync(key, state) } catch { /* Preview without storage. */ } }
function fail(message: string): never { throw new Error(message) }
function order(id: string) { return state.orders.find(item => item.id === id) || fail('服务订单不存在') }
function mallOrder(id: string) { return state.mallOrders.find(item => item.id === id) || fail('商城订单不存在') }
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const at = (date: string, time: string) => new Date(`${date}T${time}:00`).getTime()
const overlap = (a: { start: number; end: number }, b: { start: number; end: number }) => a.start < b.end && b.start < a.end
const leaveRange = (leave: { from: string; to: string }) => ({ start: new Date(leave.from).getTime(), end: new Date(leave.to).getTime() })
function baseDay(): Slot[] {
  return Array.from({ length: 48 }, (_, index) => {
    const time = `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`
    return { time, status: time >= '09:00' && time < '18:00' ? '可接' : '休息' }
  })
}
function occupiedRange(item: DemoState['orders'][number]) {
  const start = at(item.date, item.time) - state.provider.bufferBefore * 60000
  return { start, end: at(item.date, item.time) + (item.duration + state.provider.bufferAfter) * 60000 }
}
function day(date: string): Slot[] {
  const base = baseDay()
  const current = clone(state.schedule[date] || base)
  // PRD §4.2: occupied slots include before buffer + duration + after buffer; authoritative conflict detection belongs to the server.
  const occupied = state.orders.filter(item => ['待服务', '服务中'].includes(item.status)).map(occupiedRange)
  for (const slot of current) {
    const start = at(date, slot.time)
    const range = { start, end: start + 30 * 60000 }
    if (occupied.some(item => overlap(item, range)) || state.leaves.some(leave => overlap(leaveRange(leave), range))) slot.status = '已占用'
  }
  return current
}
function conflicts(item: DemoState['orders'][number]) {
  const range = occupiedRange(item)
  const date = new Date(range.start)
  for (let cursor = new Date(date.getFullYear(), date.getMonth(), date.getDate()); cursor.getTime() < range.end; cursor.setDate(cursor.getDate() + 1)) {
    const key = localDate(cursor)
    if (day(key).some(slot => slot.status === '休息' && overlap(range, { start: at(key, slot.time), end: at(key, slot.time) + 30 * 60000 }))) return true
  }
  return state.orders.some(other => other.id !== item.id && ['待服务', '服务中'].includes(other.status) && overlap(range, occupiedRange(other))) || state.leaves.some(leave => overlap(range, leaveRange(leave)))
}
function eligibility() {
  // PRD §4.5: local dates only restrict the demo; only server review/expiry can grant real accepting eligibility.
  return !state.provider.paused && state.provider.reviewStatus === '通过' && state.qualifications.every(item => item.status === '通过' && item.expires >= localDate(new Date()))
}

export const mockServices: ProviderServices = {
  auth: {
    async login(phone, code) { if (!/^1\d{10}$/.test(phone) || !/^\d{6}$/.test(code)) fail('请输入 11 位手机号和 6 位验证码'); state.provider.phone = phone; state.loggedIn = true; save() },
    async logout() { state.loggedIn = false; save() }, async session() { return state.loggedIn }
  },
  onboarding: {
    async get() { return clone({ provider: state.provider, qualifications: state.qualifications }) },
    async submit(input, qualifications, account) {
      if (!input.realName?.trim() || !input.identityFront || !input.identityBack || !state.qualifications.filter(q => ['健康证', '美容师证'].includes(q.name)).every(q => qualifications.find(item => item.id === q.id)?.file)) fail('请填写实名并上传身份证、健康证和美容师证')
      if (!account.name?.trim() || !account.masked?.trim() || !['银行卡', '支付宝', '微信'].includes(account.type)) fail('请填写演示收款账户')
      if (qualifications.some(q => !q.file || !/^\d{4}-\d{2}-\d{2}$/.test(q.expires) || !Number.isFinite(at(q.expires, '00:00')))) fail('请填写证件有效期')
      state.provider = { ...state.provider, realName: input.realName.trim(), identityFront: input.identityFront, identityBack: input.identityBack, businessName: input.businessName, reviewStatus: '待审核', rejectionReason: '', accepting: false }
      state.qualifications = state.qualifications.map(old => { const item = qualifications.find(q => q.id === old.id); return item ? { ...old, file: item.file, expires: item.expires, status: '待审核' } : old })
      const existing = state.accounts.find(a => a.isDefault)
      state.accounts = [{ id: existing?.id || `A-${Date.now()}`, ...clone(account), isDefault: true }, ...state.accounts.filter(a => a.id !== existing?.id).map(a => ({ ...a, isDefault: false }))]; save()
    },
    async updateQualification(item) { const index = state.qualifications.findIndex(q => q.id === item.id); if (index < 0 || !item.file || !/^\d{4}-\d{2}-\d{2}$/.test(item.expires) || !Number.isFinite(at(item.expires, '00:00'))) fail('请选择证件文件及有效期'); state.qualifications[index] = { ...state.qualifications[index], file: item.file, expires: item.expires, status: '待审核' }; state.provider.accepting = false; save() }
  },
  workbench: {
    async summary() { return { todayOrders: state.orders.filter(o => o.date === localDate(new Date())).length, todayIncome: state.wallet.today, pending: state.wallet.pending, awaiting: state.orders.filter(o => o.status === '待接单').length, upcoming: state.orders.filter(o => o.status === '待服务').length, proofNeeded: state.orders.filter(o => o.status === '服务中' && !o.proof).length, accepting: state.provider.accepting && eligibility(), eligible: eligibility() } },
    async setAccepting(value) { if (value && !eligibility()) fail('资质未通过或已过期，不能开启接单'); state.provider.accepting = value; save() }
  },
  schedule: {
    async day(date) { return day(date) },
    async setDay(date, slots) { const visible = day(date); const busy = new Set(visible.filter(s => s.status === '已占用').map(s => s.time)); const times = baseDay().map(s => s.time); if (!Number.isFinite(at(date, '00:00')) || slots.length !== 48 || new Set(slots.map(s => s.time)).size !== 48 || slots.some(s => !times.includes(s.time) || !['可接', '休息', '已占用'].includes(s.status) || busy.has(s.time) !== (s.status === '已占用'))) fail('排班时段无效或已占用'); state.schedule[date] = clone(slots).map(s => ({ ...s, status: s.status === '已占用' ? (state.schedule[date]?.find(old => old.time === s.time)?.status || (s.time >= '09:00' && s.time < '18:00' ? '可接' : '休息')) : s.status })); save() },
    async batch(dates, times, status) { if (!times.length) fail('请先选择时段'); for (const date of dates) { const slots = day(date).map(s => ({ ...s, status: s.status === '已占用' ? s.status : times.includes(s.time) ? status : s.status })); await this.setDay(date, slots) } },
    async copyNextWeek(date) { for (let i = 0; i < 7; i++) { const source = new Date(`${date}T12:00:00`); source.setDate(source.getDate() + i); const target = new Date(source); target.setDate(target.getDate() + 7); const sourceSlots = day(localDate(source)); const targetSlots = day(localDate(target)); await this.setDay(localDate(target), sourceSlots.map((slot, index) => ({ time: slot.time, status: targetSlots[index].status === '已占用' ? '已占用' : slot.status === '已占用' ? '休息' : slot.status }))) } },
    async buffer() { return { before: state.provider.bufferBefore, after: state.provider.bufferAfter } },
    async setBuffer(before, after) { if (!Number.isFinite(before) || !Number.isFinite(after) || before < 0 || after < 0 || before % 30 || after % 30) fail('缓冲时间须为非负半小时倍数'); state.provider.bufferBefore = before; state.provider.bufferAfter = after; save() },
    async leaves() { return clone(state.leaves) },
    async addLeave(input) { const range = leaveRange(input); if (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.start >= range.end) fail('请选择有效请假时间段'); if (state.orders.some(item => ['待服务', '服务中'].includes(item.status) && overlap(range, occupiedRange(item)))) fail('请假时间与已接订单冲突'); state.leaves.unshift({ ...input, id: `L-${Date.now()}` }); save() },
    async setPaused(value) { state.provider.paused = value; if (value) state.provider.accepting = false; save() }
  },
  projects: { async list() { return clone(state.projects) }, async save(items) { if (items.length !== state.projects.length || items.some(p => !state.projects.some(old => old.id === p.id) || !Number.isFinite(p.price) || p.price <= 0 || typeof p.enabled !== 'boolean')) fail('项目配置无效'); state.projects = state.projects.map(old => { const item = items.find(p => p.id === old.id)!; return { ...old, price: item.price, enabled: item.enabled } }); save() } },
  orders: {
    async list(status) { return clone(status ? state.orders.filter(o => o.status === status) : state.orders) }, async detail(id) { return clone(state.orders.find(o => o.id === id)) },
    // PRD §4.2/4.3/§6: demo checks state and eligibility; server must atomically validate buffer occupancy, qualification and repeated actions. Outside-radius orders remain rejectable.
    async accept(id) { const o = order(id); if (o.status !== '待接单' || !eligibility() || !state.provider.accepting) fail('当前订单或接单资格不允许操作'); if (conflicts(o)) fail('预约时段与排班、请假或已有订单冲突'); o.status = '待服务'; save() },
    async reject(id, reason) { const o = order(id); if (o.status !== '待接单' || !reason.trim()) fail('请选择拒单原因'); o.status = '已取消'; o.rejectionReason = reason.trim(); save() },
    async start(id) { const o = order(id); if (o.status !== '待服务') fail('订单状态已变更'); o.status = '服务中'; save() },
    async uploadProof(id, proof) { const o = order(id); if (o.status !== '服务中' || !proof.before || !proof.after) fail('请上传服务前后凭证'); o.proof = clone(proof); save() },
    async complete(id) { const o = order(id); if (o.status !== '服务中' || !o.proof?.before || !o.proof.after) fail('请先上传服务凭证'); o.status = '已完成'; save() }
  },
  finance: {
    async wallet() { return clone(state.wallet) },
    // PRD §4.1/4.4: snapshot commission, visit fee and refund reversal are server-provided; fee quote is display-only pending official contract.
    async quote(amount) { const fee = Math.max(0, Math.round(amount * .01 * 100) / 100); return { fee, net: Math.max(0, Math.round((amount - fee) * 100) / 100) } },
    async withdraw(amount, accountId) { if (state.wallet.available <= 1 || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount * 100) || amount > state.wallet.available) fail('余额须大于 1 元，提现金额须为有效金额且不超过余额'); if (!state.accounts.some(a => a.id === accountId)) fail('请选择到账账户'); const { fee, net } = await this.quote(amount); if (net <= 0) fail('到账金额须大于零'); state.wallet.available = Math.round((state.wallet.available - amount) * 100) / 100; state.withdrawals.unshift({ id: `WD-${Date.now()}`, amount, fee, net, accountId, status: '申请中', createdAt: new Date().toISOString() }); save() },
    async withdrawals() { return clone(state.withdrawals) }, async accounts() { return clone(state.accounts) },
    async saveAccount(account) { if (!account.name.trim() || !account.masked.trim() || !['银行卡', '支付宝', '微信'].includes(account.type)) fail('请填写收款账户'); const index = state.accounts.findIndex(a => a.id === account.id); if (index < 0) state.accounts.push({ ...clone(account), isDefault: !state.accounts.length }); else state.accounts[index] = { ...clone(account), isDefault: state.accounts[index].isDefault }; save() },
    async setDefault(id) { if (!state.accounts.some(a => a.id === id)) fail('账户不存在'); state.accounts.forEach(a => { a.isDefault = a.id === id }); save() }
  },
  profile: {
    async get() { return clone(state.provider) }, async update(input) { state.provider.avatar = input.avatar; state.provider.nickname = input.nickname; state.provider.bio = input.bio; state.provider.specialties = clone(input.specialties); save() },
    // PRD §4.3: radius is advisory, not a hard rejection; fixed/tier/free visit fees participate in server commission.
    async serviceSettings(input) { if (!Number.isFinite(input.radiusKm) || input.radiusKm <= 0 || !['固定', '阶梯', '满免'].includes(input.visitFee.mode) || [input.visitFee.fixed, input.visitFee.perKm, input.visitFee.freeAbove].some(value => !Number.isFinite(value) || value < 0)) fail('请检查服务范围及上门费'); state.provider.radiusKm = input.radiusKm; state.provider.visitFee = clone(input.visitFee); save() }
  },
  messages: { async list() { return clone(state.messages) }, async detail(id) { const item = state.messages.find(m => m.id === id); if (item) { item.read = true; save() } return clone(item) } },
  mall: {
    async products(category) { return clone(category && category !== '全部' ? state.products.filter(p => p.category === category) : state.products) }, async product(id) { return clone(state.products.find(p => p.id === id)) },
    // PRD §4.6: mall orders never enter service orders, eligibility, wallet or commission. Payment is only a simulation; real status must be queried from server.
    async create(input) { const product = state.products.find(p => p.id === input.productId) || fail('商品不存在'); if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > product.stock || !product.specs.includes(input.spec) || !input.address.trim() || !['微信', '支付宝'].includes(input.payChannel)) fail('请检查规格、数量和地址'); const created: MallOrder = { ...clone(input), id: `ML-${Date.now()}-${state.mallOrders.length + 1}`, amount: product.price * input.quantity, status: '待支付', tracking: '' }; state.mallOrders.unshift(created); save(); return clone(created) },
    async pay(id) { const o = mallOrder(id); if (o.status !== '待支付') fail('当前订单不可支付'); const product = state.products.find(p => p.id === o.productId) || fail('商品不存在'); if (product.stock < o.quantity) fail('库存不足，请重新下单'); product.stock -= o.quantity; o.status = '待发货'; save() },
    async orders() { return clone(state.mallOrders) }, async order(id) { return clone(state.mallOrders.find(o => o.id === id)) },
    async tracking(id) { return mallOrder(id).tracking },
    async afterSale(id, reason) { const o = mallOrder(id); if (!['待收货', '已完成'].includes(o.status) || !reason.trim()) fail('请填写售后原因'); o.status = '售后中'; o.afterSaleReason = reason.trim(); save() }
  },
  reviews: { async list() { return clone(state.reviews) }, async reply(id, text) { const r = state.reviews.find(x => x.id === id) || fail('评价不存在'); if (!text.trim()) fail('请输入回复'); r.reply = text.trim(); save() }, async appeal(id, reason) { const r = state.reviews.find(x => x.id === id) || fail('评价不存在'); if (!reason.trim()) fail('请输入申诉原因'); r.appeal = reason.trim(); save() } },
  resetDemo() { state = clone(seed) as DemoState; save() }, snapshot() { return clone(state) }
}
