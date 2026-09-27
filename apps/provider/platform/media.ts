const savedFilesKey = 'yanyue-provider-demo-files-v1'

export async function selectImage(): Promise<string> {
  const selected = await new Promise<string>((resolve, reject) => uni.chooseImage({
    count: 1, sizeType: ['compressed'],
    success: result => resolve(result.tempFilePaths[0] || ''), fail: reject
  }))
  if (!selected) throw new Error('未选择图片')
  // #ifdef MP-WEIXIN
  // Mini-program temp paths expire; keep demo evidence locally until the user resets it. A real API needs uploaded file IDs.
  const saved = await new Promise<string>((resolve, reject) => uni.saveFile({
    tempFilePath: selected, success: result => resolve(result.savedFilePath), fail: reject
  }))
  const paths = (uni.getStorageSync(savedFilesKey) || []) as string[]
  uni.setStorageSync(savedFilesKey, [...paths, saved])
  return saved
  // #endif
  // #ifndef MP-WEIXIN
  return selected
  // #endif
}

export function clearSelectedImages() {
  // #ifdef MP-WEIXIN
  const paths = (uni.getStorageSync(savedFilesKey) || []) as string[]
  paths.forEach(filePath => uni.removeSavedFile({ filePath, fail: () => {} }))
  uni.removeStorageSync(savedFilesKey)
  // #endif
}
export function callPhone(phone: string) { uni.makePhoneCall({ phoneNumber: phone }) }
export function navigate(latitude: number, longitude: number, name: string, address: string) { uni.openLocation({ latitude, longitude, name, address }) }
