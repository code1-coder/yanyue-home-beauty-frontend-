import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
const uni = typeof uniModule === 'function' ? uniModule : (uniModule as { default: typeof uniModule }).default
export default defineConfig({
  plugins: [uni(), {
    name: 'h5-uview-easycom-only', enforce: 'pre',
    transform(code, id) {
      if (process.env.UNI_PLATFORM !== 'h5' || !id.replace(/\\/g, '/').endsWith('/uview-plus/index.js')) return
      return code.replace("import.meta.glob('./components/u-*/u-*.vue', { eager: true })", '{}')
    }
  }],
  css: { preprocessorOptions: { scss: { additionalData: '@import "uview-plus/theme.scss";\n@import "uview-plus/libs/css/mixin.scss";\n' } } }
})
