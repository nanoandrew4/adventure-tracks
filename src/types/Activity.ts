import { type GeoPoint } from './GeoPoint'
import objectHash from 'object-hash'

export class Activity {
  readonly uid: string
  name: string
  readonly sourceName: string
  readonly layerName: string
  // heartRateData: number[]
  activityGeoPoints: GeoPoint[]
  lineColor: string
  elevationProfileColor: string
  startTime: Date
  endTime: Date

  constructor(
    name: string,
    activityGeoPoints: GeoPoint[],
    lineColor: string,
    elevationProfileColor: string,
    startTime: Date,
    endTime: Date
  ) {
    this.name = name
    this.sourceName = name.toLowerCase().replace(/\s/g, '_')
    this.layerName = `layer-${this.sourceName}`
    this.activityGeoPoints = activityGeoPoints
    this.lineColor = lineColor
    this.elevationProfileColor = elevationProfileColor
    this.startTime = startTime
    this.endTime = endTime
    this.uid = objectHash.sha1(activityGeoPoints)
  }
}
