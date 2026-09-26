export interface Project { id: string; category: string; name: string; price: number; durationMinutes: number; description: string; cautions: string; audience: string }
export interface Beautician { id: string; name: string; rating: number; sales: number; distanceKm: number; radiusKm: number; visitFee: number; bio: string; qualifications: string[]; projectIds: string[] }
export interface Address { id: string; name: string; phone: string; city: string; detail: string; isDefault: boolean }
export type OrderStatus = '待支付' | '待接单' | '待服务' | '服务中' | '已完成' | '已取消' | '退款中' | '已退款'
export interface BookingDraft { projectId: string; beauticianId: string; date: string; slot: string; addressId: string; note: string }
export interface Quote { projectAmount: number; visitFee: number; discount: number; payable: number; outsideRadius: boolean }
export interface ServiceOrder { id: string; draft: BookingDraft; quote: Quote; status: OrderStatus; createdAt: string; review?: { stars: number; text: string; anonymous: boolean }; refundReason?: string }
