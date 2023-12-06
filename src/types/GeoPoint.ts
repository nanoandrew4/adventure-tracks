import type { Position } from 'geojson'

export class GeoPoint {
  position: Position

  constructor(longitude: number, latitude: number, elevation: number | undefined) {
    if (elevation) this.position = [longitude, latitude, elevation]
    else this.position = [longitude, latitude]
  }

  longitude(): number {
    return this.position[0]
  }
  latitude(): number {
    return this.position[1]
  }
  elevation(): number | undefined {
    return this.position.length == 3 ? this.position[2] : undefined
  }
  setElevation(newElevation: number) {
    if (this.position.length == 2) this.position = this.position.concat(newElevation)
    else this.position[2] = newElevation
  }
}
