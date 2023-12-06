import { type GeoPoint } from './GeoPoint'

export interface Activity {
  name: string
  sourceName: string
  // heartRateData: number[]
  activityGeoPoints: GeoPoint[]
  lineColor: string
  elevationProfileColor: string
  startTime: Date
  endTime: Date
}
