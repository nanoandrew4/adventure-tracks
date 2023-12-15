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

  longLatCoords: number[][]
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
    this.longLatCoords = []
    this.elevation = []
  }

  getLongLatCoords(): number[][] {
    this.processCoordinates(this.gatherLongLatCoords.bind(this))
    const latLongCoords = this.longLatCoords
    this.longLatCoords = [] // Since it should not be needed often, we can empty the memory
    return latLongCoords
  }

  getElevation(): number[] {
    if (!this.elevation || this.elevation.length == 0)
      this.processCoordinates(this.gatherElevationData.bind(this))
    return this.elevation
  }

  gatherLongLatCoords(pos: Position) {
    if (pos.length > 1) this.longLatCoords.push([pos[0], pos[1]])
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
      posFunc(this.geoJsonFeature?.geometry.coordinates)
    } else if (geometryType == 'MultiPolygon') {
      for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
        for (let j = 0; j < this.geoJsonFeature.geometry.coordinates[i].length; j++)
          for (let k = 0; this.geoJsonFeature.geometry.coordinates[i][j].length; k++)
            posFunc(this.geoJsonFeature.geometry.coordinates[i][j][k])
    }
  }

  // Future me, I'm sorry for this
  updateElevation(updatedElevationValues: number[]): boolean {
    if (!this.geoJsonFeature || !updatedElevationValues) return false

    const geometryType = this.geoJsonFeature.geometry.type
    if (geometryType == 'LineString' || geometryType == 'MultiPoint') {
      if (
        this.geoJsonFeature.geometry.coordinates.length &&
        this.geoJsonFeature.geometry.coordinates.length == updatedElevationValues.length
      ) {
        for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
          this.setElevation(this.geoJsonFeature.geometry.coordinates[i], updatedElevationValues[i])
        this.elevation = updatedElevationValues
        return true
      }
    } else if (geometryType == 'MultiLineString' || geometryType == 'Polygon') {
      let coordCount = 0
      for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
        coordCount += this.geoJsonFeature.geometry.coordinates[i].length
      if (
        this.geoJsonFeature.geometry.coordinates.length &&
        coordCount == updatedElevationValues.length
      ) {
        coordCount = 0
        for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
          for (let j = 0; j < this.geoJsonFeature.geometry.coordinates[i].length; j++) {
            this.setElevation(
              this.geoJsonFeature.geometry.coordinates[i][j],
              updatedElevationValues[coordCount++]
            )
          }
        this.elevation = updatedElevationValues
        return true
      }
    } else if (geometryType == 'Point') {
      if (updatedElevationValues.length === 1) {
        this.setElevation(this.geoJsonFeature?.geometry.coordinates, updatedElevationValues[0])
        return true
      }
    } else if (geometryType == 'MultiPolygon') {
      let coordCount = 0
      for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
        for (let j = 0; j < this.geoJsonFeature.geometry.coordinates[i].length; j++)
          coordCount += this.geoJsonFeature.geometry.coordinates[i][j].length

      if (
        this.geoJsonFeature.geometry.coordinates.length &&
        coordCount == updatedElevationValues.length
      ) {
        coordCount = 0
        for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
          for (let j = 0; j < this.geoJsonFeature.geometry.coordinates[i].length; j++)
            for (let k = 0; this.geoJsonFeature.geometry.coordinates[i][j].length; k++)
              this.setElevation(
                this.geoJsonFeature.geometry.coordinates[i][j][k],
                updatedElevationValues[coordCount++]
              )
        this.elevation = updatedElevationValues
        return true
      }
    }
    return false
  }

  private setElevation(pos: Position, elevationVal: number) {
    if (pos.length === 2) pos.push(elevationVal)
    else if (pos.length === 3) pos[2] = elevationVal
  }
}
