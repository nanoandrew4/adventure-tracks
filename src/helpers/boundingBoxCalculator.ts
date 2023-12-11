import type { Position } from "geojson"

export class BoundingBoxCalculator {
  private minLat = 1000
  private minLong = 1000
  private maxLat = -1000
  private maxLong = -1000

  processCoordinatePair(longitude: number, latitude: number) {
    this.maxLong = Math.max(longitude, this.maxLong)
    this.minLong = Math.min(longitude, this.minLong)
    this.maxLat = Math.max(latitude, this.maxLat)
    this.minLat = Math.min(latitude, this.minLat)
  }

  processPosition(position: Position) {
    this.processCoordinatePair(position[0], position[1])
  }

  getBoundingBox(): [number, number, number, number] {
    return [this.minLong, this.minLat, this.maxLong, this.maxLat]
  }
}
