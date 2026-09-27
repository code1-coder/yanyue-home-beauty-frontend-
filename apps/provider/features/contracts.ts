import type { DemoState, Leave, MallOrder, Message, OrderStatus, PayoutAccount, Product, Project, Provider, Qualification, Review, ServiceOrder, Slot, Wallet, Withdrawal } from './types'

export type OnboardingInput = Pick<Provider, 'realName' | 'identityFront' | 'identityBack' | 'businessName'>
export type ProfileInput = Pick<Provider, 'avatar' | 'nickname' | 'bio' | 'specialties'>
export type QualificationInput = Pick<Qualification, 'id' | 'file' | 'expires'>
export type AccountInput = Pick<PayoutAccount, 'type' | 'name' | 'masked'>

// Capability names follow docs/provider/接口清单.md; method signatures are local mock contracts, not HTTP definitions.
export interface ProviderServices {
  auth: { login(phone: string, code: string): Promise<void>; logout(): Promise<void>; session(): Promise<boolean> }
  onboarding: { get(): Promise<{ provider: Provider; qualifications: Qualification[] }>; submit(input: OnboardingInput, qualifications: QualificationInput[], account: AccountInput): Promise<void>; updateQualification(item: QualificationInput): Promise<void> }
  workbench: { summary(): Promise<{ todayOrders: number; todayIncome: number; pending: number; awaiting: number; upcoming: number; proofNeeded: number; accepting: boolean; eligible: boolean }>; setAccepting(value: boolean): Promise<void> }
  schedule: { day(date: string): Promise<Slot[]>; setDay(date: string, slots: Slot[]): Promise<void>; batch(dates: string[], times: string[], status: '可接' | '休息'): Promise<void>; copyNextWeek(date: string): Promise<void>; buffer(): Promise<{ before: number; after: number }>; setBuffer(before: number, after: number): Promise<void>; leaves(): Promise<Leave[]>; addLeave(input: Omit<Leave, 'id'>): Promise<void>; setPaused(value: boolean): Promise<void> }
  projects: { list(): Promise<Project[]>; save(items: Project[]): Promise<void> }
  orders: { list(status?: OrderStatus): Promise<ServiceOrder[]>; detail(id: string): Promise<ServiceOrder | undefined>; accept(id: string): Promise<void>; reject(id: string, reason: string): Promise<void>; start(id: string): Promise<void>; uploadProof(id: string, proof: NonNullable<ServiceOrder['proof']>): Promise<void>; complete(id: string): Promise<void> }
  finance: { wallet(): Promise<Wallet>; quote(amount: number): Promise<{ fee: number; net: number }>; withdraw(amount: number, accountId: string): Promise<void>; withdrawals(): Promise<Withdrawal[]>; accounts(): Promise<PayoutAccount[]>; saveAccount(account: PayoutAccount): Promise<void>; setDefault(id: string): Promise<void> }
  profile: { get(): Promise<Provider>; update(input: ProfileInput): Promise<void>; serviceSettings(input: Pick<Provider, 'radiusKm' | 'visitFee'>): Promise<void> }
  messages: { list(): Promise<Message[]>; detail(id: string): Promise<Message | undefined> }
  mall: { products(category?: string): Promise<Product[]>; product(id: string): Promise<Product | undefined>; create(input: Pick<MallOrder, 'productId' | 'spec' | 'quantity' | 'address' | 'payChannel'>): Promise<MallOrder>; pay(id: string): Promise<void>; orders(): Promise<MallOrder[]>; order(id: string): Promise<MallOrder | undefined>; tracking(id: string): Promise<string>; afterSale(id: string, reason: string): Promise<void> }
  reviews: { list(): Promise<Review[]>; reply(id: string, text: string): Promise<void>; appeal(id: string, reason: string): Promise<void> }
  resetDemo(): void
  snapshot(): DemoState
}
