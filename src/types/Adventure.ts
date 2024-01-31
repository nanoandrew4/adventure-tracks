import { type Activity } from './Activity'
import type { CustomText } from './CustomText'
import { type Label } from './Label'

export enum LayoutMode {
  PORTRAIT,
  LANDSCAPE
}

export interface Adventure {
  mainText: CustomText
  secondaryText: CustomText
  lineWidth: number
  backgroundColor: string
  activities: Activity[]
  labels: Label[]

  displayElevationProfile: boolean
  displayHeartRateGraph: boolean

  customizationEnabled: boolean
  layoutMode: LayoutMode
}
