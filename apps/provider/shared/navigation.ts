const tabs = new Set(['pages/workbench/index', 'pages/order/list', 'pages/mall/list', 'pages/mine/index'])
export function go(path: string, query: Record<string, string | number> = {}) {
  const url = `/${path}${Object.keys(query).length ? '?' + Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&') : ''}`
  if (tabs.has(path)) uni.switchTab({ url: `/${path}` })
  else uni.navigateTo({ url })
}
export function toast(message: string) { uni.showToast({ title: message, icon: 'none' }) }
export function inputValue(event: Event): string { return (event as Event & { detail: { value: string } }).detail.value }
export function switchValue(event: Event): boolean { return (event as Event & { detail: { value: boolean } }).detail.value }
export async function run(action: () => Promise<unknown>, success = '已保存') {
  try { await action(); toast(success); return true } catch (error) { toast(error instanceof Error ? error.message : '操作失败'); return false }
}
