export type ReviewStatus = '待提交' | '待审核' | '通过' | '驳回' | '禁用'
export type OrderStatus = '待接单' | '待服务' | '服务中' | '已完成' | '已取消'
export type SlotStatus = '可接' | '休息' | '已占用'
export type MallStatus = '待支付' | '待发货' | '待收货' | '已完成' | '售后中'
export interface Qualification { id: string; name: string; expires: string; status: ReviewStatus; file: string }
export interface Provider { phone: string; realName: string; identityFront: string; identityBack: string; businessName: string; avatar: string; nickname: string; bio: string; specialties: string[]; reviewStatus: ReviewStatus; rejectionReason: string; accepting: boolean; radiusKm: number; visitFee: { mode: '固定' | '阶梯' | '满免'; fixed: number; perKm: number; freeAbove: number }; bufferBefore: number; bufferAfter: number; paused: boolean }
export interface Project { id: string; name: string; category: string; duration: number; basePrice: number; price: number; enabled: boolean }
export interface ServiceOrder { id: string; customer: string; phone: string; address: string; latitude: number; longitude: number; distanceKm: number; project: string; date: string; time: string; duration: number; status: OrderStatus; paid: number; visitFee: number; discount: number; commissionRateSnapshot: number; commission: number; income: number; note: string; rejectionReason?: string; proof?: { before: string; after: string; note: string } }
export interface Slot { time: string; status: SlotStatus }
export interface Leave { id: string; from: string; to: string; reason: string }
export interface IncomeEntry { id: string; title: string; date: string; amount: number; kind: '收入' | '抽成' | '上门费' | '退款冲正' }
export interface Wallet { available: number; pending: number; total: number; today: number; month: number; entries: IncomeEntry[] }
export interface PayoutAccount { id: string; type: '银行卡' | '支付宝' | '微信'; name: string; masked: string; isDefault: boolean }
export interface Withdrawal { id: string; amount: number; fee: number; net: number; accountId: string; status: '申请中' | '审核通过' | '打款中' | '已到账' | '驳回'; createdAt: string; reason?: string }
export interface Product { id: string; name: string; category: string; description: string; price: number; stock: number; specs: string[]; image: string }
export interface MallOrder { id: string; productId: string; spec: string; quantity: number; amount: number; address: string; payChannel: '微信' | '支付宝'; status: MallStatus; tracking: string; afterSaleReason?: string }
export interface Review { id: string; customer: string; stars: number; content: string; date: string; reply?: string; appeal?: string }
export interface Message { id: string; type: '订单' | '审核' | '提现' | '系统'; title: string; content: string; date: string; read: boolean }
export interface DemoState { provider: Provider; qualifications: Qualification[]; projects: Project[]; orders: ServiceOrder[]; schedule: Record<string, Slot[]>; leaves: Leave[]; wallet: Wallet; accounts: PayoutAccount[]; withdrawals: Withdrawal[]; products: Product[]; mallOrders: MallOrder[]; reviews: Review[]; messages: Message[]; loggedIn: boolean }
