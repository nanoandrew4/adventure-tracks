import { type Activity } from './Activity'
import { type Label } from './Label'

export interface Adventure {
  mainText: string
  mainTextColor: string
  secondaryText: string
  secondaryTextColor: string
  lineWidth: number
  backgroundColor: string
  activities: Activity[]
  labels: Label[]

  displayElevationProfile: boolean
  displayHeartRateGraph: boolean

  customizationEnabled: boolean
}
