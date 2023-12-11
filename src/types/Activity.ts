import objectHash from 'object-hash'
import type { Feature } from 'geojson'
import { constants } from '@/constants/constants'

export class Activity {
  uid: string
  name: string
  sourceName: string
  layerName: string
  lineColor: string
  elevationProfileColor: string
  startTime?: Date
  endTime?: Date
  geoJsonFeature?: Feature

  constructor(
    geoJsonFeature: Feature
  ) {
    this.lineColor = constants.defaultTextColor
    this.elevationProfileColor = constants.defaultTextColor
    this.geoJsonFeature = geoJsonFeature
    this.uid = objectHash.sha1(geoJsonFeature)
    this.name = geoJsonFeature.properties?.name
    this.sourceName = this.uid
    this.layerName = `layer-${this.sourceName}`
    if (geoJsonFeature.properties?.coordinateProperties?.times) {
      const times = geoJsonFeature.properties.coordinateProperties.times
      this.startTime = new Date(times[0])
      this.endTime = new Date(times[times.length - 1])
    }
  }
}
