import { type GeoPoint } from '../types/GeoPoint.type'
import objectHash from 'object-hash'

const requestURL = import.meta.env.VITE_ELEVATION_API_ENDPOINT

const headers: Headers = new Headers()
headers.set('Content-Type', 'application/json')
headers.set('Accept', 'application/json')

interface GeoPointWithElevation extends GeoPoint {
  elevation: number
}

interface ElevationResponse {
  results: GeoPointWithElevation[]
}

const cache: Map<string, number[]> = new Map()

export async function calculateElevation(activityCoordinates: GeoPoint[]): Promise<number[]> {
  const activityCoordinatesHash = objectHash.sha1(activityCoordinates)
  if (cache.has(activityCoordinatesHash)) {
    return new Promise<number[]>(() => {
      return cache.get(activityCoordinatesHash)
    })
  }

  const request: RequestInfo = new Request(requestURL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ locations: activityCoordinates })
  })

  return fetch(request)
    .then((res) => res.json())
    .then((res) => {
      console.log(res)

      const parsedResponse: ElevationResponse = JSON.parse(res)
      const elevationPoints: number[] = []

      parsedResponse.results.forEach((result) => {
        elevationPoints.push(result.elevation)
      })

      cache.set(activityCoordinatesHash, elevationPoints)

      return elevationPoints
    })
}
