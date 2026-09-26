import { resolve } from 'node:path'

process.env.UNI_INPUT_DIR = resolve(process.cwd())
await import('@dcloudio/vite-plugin-uni/bin/uni.js')
