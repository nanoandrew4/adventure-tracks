declare module '@jamescoyle/vue-icon' {
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

export class EnvironmentHelper {    
  public static get isDevelopment(): boolean {
      return process.env.NODE_ENV === "development";
  }

  public static get isProduction(): boolean {
      return process.env.NODE_ENV === "production";
  }
}