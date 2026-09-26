import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'

// The published CLI has a nested default export when Vite bundles its CJS entry.
const uni = typeof uniModule === 'function' ? uniModule : (uniModule as { default: typeof uniModule }).default
export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: { additionalData: '@import "uview-plus/theme.scss";\n@import "uview-plus/libs/css/mixin.scss";\n' }
    }
  }
})
