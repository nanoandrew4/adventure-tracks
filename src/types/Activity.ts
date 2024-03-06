import objectHash from 'object-hash'
import type { Feature, Position } from 'geojson'
import { constants } from '@/constants/constants'
import { fetchCorrectedElevationData } from '@/helpers/correctElevation'

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
  originalElevation: number[]
  elevation: number[]

  constructor(geoJsonFeature: Feature, defaultTextColor?: string) {
    this.lineColor = defaultTextColor ?? constants.defaultTextColor
    this.elevationProfileColor = defaultTextColor ?? constants.defaultTextColor
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
    this.originalElevation = []
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

  revertElevationCorrection() {
    if (!this.geoJsonFeature) return
    this.elevation = this.originalElevation

    const geometryType = this.geoJsonFeature.geometry.type
    if (geometryType == 'LineString' || geometryType == 'MultiPoint') {
      if (this.geoJsonFeature.geometry.coordinates) {
        for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
          this.geoJsonFeature.geometry.coordinates[i][2] = this.elevation[i]
      }
    } else if (geometryType == 'MultiLineString') {
      let coordCount = 0
      if (this.geoJsonFeature.geometry.coordinates) {
        for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++) {
          for (let j = 0; j < this.geoJsonFeature.geometry.coordinates[i].length; j++)
            this.geoJsonFeature.geometry.coordinates[i][j][2] = this.elevation[coordCount++]
        }
      }
    }
  }

  async correctElevation(smoothingFactor: number): Promise<boolean> {
    if (!this.geoJsonFeature) return false

    if (this.originalElevation.length === 0) this.originalElevation = this.elevation

    const geometryType = this.geoJsonFeature.geometry.type
    if (geometryType == 'LineString' || geometryType == 'MultiPoint') {
      if (this.geoJsonFeature.geometry.coordinates) {
        await this.correctElevationForCoordinates(
          this.geoJsonFeature.geometry.coordinates,
          smoothingFactor
        ).then((newElevation) => (this.elevation = newElevation))
        return true
      }
    } else if (geometryType == 'MultiLineString') {
      let coordCount = 0
      for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++)
        coordCount += this.geoJsonFeature.geometry.coordinates[i].length
      if (this.geoJsonFeature.geometry.coordinates) {
        let promises: Promise<number[]>[] = []
        let aggregatedNewElevation: number[] = []
        for (let i = 0; i < this.geoJsonFeature.geometry.coordinates.length; i++) {
          promises.push(
            this.correctElevationForCoordinates(
              this.geoJsonFeature.geometry.coordinates[i],
              smoothingFactor
            ).then((newElevation) => aggregatedNewElevation.concat(newElevation))
          )
        }
        for (const p of promises) await p
        this.elevation = aggregatedNewElevation
        return true
      }
    }
    return false
  }

  private async correctElevationForCoordinates(
    coords: Position[],
    smoothingFactor: number
  ): Promise<number[]> {
    return fetchCorrectedElevationData(coords, smoothingFactor).then((correctedElevationValues) => {
      let elevationCorrection = 0
      let newElevation = []
      if (correctedElevationValues.length > 0) {
        for (let i = 0; i < correctedElevationValues.length; i++)
          elevationCorrection += this.elevation[i] - correctedElevationValues[i]
        elevationCorrection /= correctedElevationValues.length

        for (let i = 0; i < coords.length; i++) {
          coords[i][2] = coords[i][2] - elevationCorrection
          if (coords[i][2] < 0) coords[i][2] = 0
          newElevation.push(coords[i][2])
        }
      }
      return newElevation
    })
  }
}
