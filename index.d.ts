declare module 'vue3-icon' {
  import { DefineComponent } from 'vue'

  interface SvgIconProps {
    type?: string
    path: string
    size?: string | number
    viewbox?: string
    flip?: 'horizontal' | 'vertical' | 'both' | 'none'
    rotate?: number
  }

  const SvgIcon: DefineComponent<SvgIconProps>
  export default SvgIcon
}

import { Composer } from 'vue-i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: Composer['t']
  }
}   