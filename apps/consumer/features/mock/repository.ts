import catalog from './data/catalog.json'
import profileData from './data/profile.json'
import type { Address, Beautician, BookingDraft, Project, Quote, ServiceOrder, OrderStatus } from './types'

const storageKey = 'yanyue-consumer-demo-v1'
interface DemoState { addresses: Address[]; orders: ServiceOrder[]; draft: BookingDraft | null; city: string; locationLabel?: string }
const initial = (): DemoState => ({ addresses: profileData.addresses, orders: [], draft: null, city: catalog.city, locationLabel: '西湖区文三路' })
let state: DemoState = load()

function load(): DemoState {
  try {
    const stored = uni.getStorageSync(storageKey) as DemoState | undefined
    if (stored && Array.isArray(stored.orders) && Array.isArray(stored.addresses)) return stored
  } catch { /* Storage is optional for preview. */ }
  return initial()
}
function save() { uni.setStorageSync(storageKey, state) }
const copy = <T>(value: T): T => value === undefined ? value : JSON.parse(JSON.stringify(value)) as T
export const catalogRepository = {
  categories: () => [...catalog.categories],
  projects: () => copy(catalog.projects) as Project[],
  beauticians: () => copy(catalog.beauticians) as Beautician[],
  project: (id: string) => catalog.projects.find(item => item.id === id) as Project | undefined,
  beautician: (id: string) => catalog.beauticians.find(item => item.id === id) as Beautician | undefined
}
export const profileRepository = {
  profile: () => copy(profileData.profile),
  city: () => state.city,
  locationLabel: () => state.locationLabel || '',
  setCity: (city: string) => { state.city = city; state.locationLabel = ''; save() },
  setLocation: (city: string, label: string) => { state.city = city; state.locationLabel = label; save() },
  addresses: () => copy(state.addresses),
  address: (id: string): Address | undefined => copy(state.addresses.find(item => item.id === id)),
  upsertAddress(address: Address) {
    if (address.isDefault) state.addresses = state.addresses.map(item => ({ ...item, isDefault: false }))
    const index = state.addresses.findIndex(item => item.id === address.id)
    if (index >= 0) state.addresses[index] = address
    else state.addresses.push(address)
    save()
  },
  deleteAddress(id: string) { state.addresses = state.addresses.filter(item => item.id !== id); save() },
  messages: () => copy(profileData.messages),
  coupons: () => copy(profileData.coupons),
  discover: () => copy(profileData.discover)
}

export const bookingRepository = {
  draft: () => copy(state.draft),
  setDraft(draft: BookingDraft) { state.draft = copy(draft); save() },
  // PRD 4.2: 半小时段只是示例候选；前后缓冲、请假及并发占用须由服务端校验。
  slots: () => ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00'],
  slotState: (slot: string): '可约' | '已约' | '休息' => slot === '10:30' ? '已约' : slot === '14:30' ? '休息' : '可约',
  // PRD 4.1/4.3: 本地报价仅演示，上门费参与抽成；优惠分摊和金额以服务端试算/订单快照为准。
  quote(draft: BookingDraft): Quote | null {
    const project = catalogRepository.project(draft.projectId)
    const beautician = catalogRepository.beautician(draft.beauticianId)
    if (!project || !beautician || !state.addresses.some(item => item.id === draft.addressId)) return null
    return { projectAmount: project.price, visitFee: beautician.visitFee, discount: 0, payable: project.price + beautician.visitFee, outsideRadius: beautician.distanceKm > beautician.radiusKm }
  },
  // PRD 4.2/4.3: 超区不拦截，服务者可以拒单；服务端须原子校验时段及金额，客户端模拟单不具法律/支付效力。
  create(draft: BookingDraft): ServiceOrder | null {
    const quote = this.quote(draft)
    if (!quote || !this.slots().includes(draft.slot) || this.slotState(draft.slot) !== '可约' || !draft.date) return null
    const order: ServiceOrder = { id: `DEMO-${Date.now()}`, draft: copy(draft), quote, status: '待支付', createdAt: new Date().toISOString() }
    state.orders.unshift(order); state.draft = null; save()
    return copy(order)
  }
}
export const orderRepository = {
  all: () => copy(state.orders),
  byId: (id: string) => copy(state.orders.find(item => item.id === id)) as ServiceOrder | undefined,
  // PRD 4.1/6: 以下仅本地演示状态；真实支付回调、取消许可、退款冲正均须服务端权威结果。
  update(id: string, status: OrderStatus) {
    const order = state.orders.find(item => item.id === id)
    if (!order) return false
    order.status = status; save(); return true
  },
  requestRefund(id: string, reason: string) {
    const order = state.orders.find(item => item.id === id)
    if (!order || !reason.trim()) return false
    order.refundReason = reason.trim(); order.status = '退款中'; save(); return true
  },
  review(id: string, stars: number, text: string, anonymous: boolean) {
    const order = state.orders.find(item => item.id === id)
    if (!order || order.status !== '已完成' || stars < 1 || stars > 5) return false
    order.review = { stars, text, anonymous }; save(); return true
  }
}
