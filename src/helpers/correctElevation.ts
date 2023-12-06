import { type GeoPoint } from '../types/GeoPoint'
import { type Activity } from '../types/Activity.type'
import objectHash from 'object-hash'

const requestURL = import.meta.env.VITE_ELEVATION_API_ENDPOINT

const headers: Headers = new Headers()
headers.set('Content-Type', 'application/json')
headers.set('Accept', 'application/json')

interface RequestLocation {
  longitude: number
  latitude: number
}

interface ResponseLocation extends RequestLocation {
  elevation: number
}

interface ElevationResponse {
  results: ResponseLocation[]
}

const cache: Map<string, number[]> = new Map()

async function correctElevation(activity: Activity) {
  calculateElevation(activity.activityGeoPoints).then((elevationData) => {
    if (activity.activityGeoPoints.length == elevationData.length) {
      for (let i = 0; i < activity.activityGeoPoints.length; i++) {
        activity.activityGeoPoints[i].setElevation(elevationData[i])
      }
    }
  })
}

async function calculateElevation(activityCoordinates: GeoPoint[]): Promise<number[]> {
  const activityCoordinatesHash = objectHash.sha1(activityCoordinates)
  if (cache.has(activityCoordinatesHash)) {
    return new Promise<number[]>(() => {
      return cache.get(activityCoordinatesHash)
    })
  }

  const coordsToCorrect = activityCoordinates.flatMap((geoPoint) => [
    { longitude: geoPoint.longitude(), latitude: geoPoint.latitude() }
  ])
  const request: RequestInfo = new Request(requestURL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ locations: coordsToCorrect })
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

      if (activityCoordinates.length == elevationPoints.length)
        cache.set(activityCoordinatesHash, elevationPoints)
      else
        alert(
          'Elevation correction failed due to not being supplied with enough data from the server'
        )

      return elevationPoints
    })
}

export { correctElevation }
