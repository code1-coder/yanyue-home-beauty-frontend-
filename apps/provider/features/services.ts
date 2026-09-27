import type { ProviderServices } from './contracts'
import { mockServices } from './mock/services'

// Swap this adapter for a real backend implementation once URLs, DTOs, auth and error contracts are agreed.
export const services: ProviderServices = mockServices
export type * from './types'
