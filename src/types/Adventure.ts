import { type Activity } from './Activity'
import type { CustomText } from './CustomText'
import type { DataGraph } from './DataGraph'
import { type Label } from './Label'
import type { MapStyle } from './MapStyle'

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

  mapStyle: MapStyle
  dataGraph: DataGraph

  customizationEnabled: boolean
  layoutMode: LayoutMode
}
