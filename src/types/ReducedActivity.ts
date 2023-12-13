import { type Activity } from './Activity'

// Lightweight activity model to be watched deeply by ActivityMap
export class ReducedActivity {
  readonly uid: string
  name: string
  readonly sourceName: string
  readonly layerName: string
  lineColor: string
  elevationProfileColor: string
  startTime?: Date
  endTime?: Date

  constructor(activity: Activity) {
    this.name = activity.name
    this.sourceName = activity.sourceName
    this.layerName = activity.layerName
    this.lineColor = activity.lineColor
    this.elevationProfileColor = activity.elevationProfileColor
    this.startTime = activity.startTime
    this.endTime = activity.endTime
    this.uid = activity.uid
  }
}
