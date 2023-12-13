import objectHash from 'object-hash'
import type { Feature, Position } from 'geojson'
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

  elevation: number[]

  constructor(geoJsonFeature: Feature) {
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
    this.elevation = []
  }

  getElevation(): number[] {
    if (!this.elevation || this.elevation.length == 0)
      this.processCoordinates(this.gatherElevationData.bind(this))
    return this.elevation
  }

  gatherElevationData(pos: Position) {
    pos.length === 3 ? this.elevation.push(pos[2]) : this.elevation.push(0)
  }

  processCoordinates(posFunc: (pos: Position) => void) {
    if (!this.geoJsonFeature) return

    const geometryType = this.geoJsonFeature.geometry.type
    if (geometryType == 'LineString' || geometryType == 'MultiPoint') {
      for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
        posFunc(this.geoJsonFeature.geometry.coordinates[i])
    } else if (geometryType == 'MultiLineString' || geometryType == 'Polygon') {
      for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
        for (let j = 0; j < this.geoJsonFeature.geometry.coordinates[i].length; j++)
          posFunc(this.geoJsonFeature.geometry.coordinates[i][j])
    } else if (geometryType == 'Point') {
      const coords = this.geoJsonFeature?.geometry.coordinates
      if (coords && coords.length === 3) posFunc([coords[0], coords[1], coords[2]])
      if (coords && coords.length === 2) posFunc([coords[0], coords[1]])
    } else if (geometryType == 'MultiPolygon') {
      for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
        for (let j = 0; j < this.geoJsonFeature.geometry.coordinates[i].length; j++)
          for (let k = 0; this.geoJsonFeature.geometry.coordinates[i][j].length; k++)
            posFunc(this.geoJsonFeature.geometry.coordinates[i][j][k])
    }
  }
}
