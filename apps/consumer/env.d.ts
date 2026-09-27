/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
declare module 'uview-plus' {
  import type { Plugin } from 'vue'
  const uviewPlus: Plugin
  export default uviewPlus
}
