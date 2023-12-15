import { type Activity } from '../types/Activity'
import objectHash from 'object-hash'

// Check the following for possibly better accuracy data
// https://github.com/ajnisbet/opentopodata
// https://github.com/sacridini/Awesome-Geospatial?tab=readme-ov-file#go
// https://github.com/airbusgeo/godal

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

async function correctElevation(activity: Activity): Promise<boolean | undefined> {
  const longLatCoords = activity.getLongLatCoords()

  return calculateElevation(longLatCoords).then((elevationData) => {
    if (activity.geoJsonFeature) {
      return activity.updateElevation(elevationData)
    }
  })
}

async function calculateElevation(longLatCoords: number[][]): Promise<number[]> {
  const activityCoordinatesHash = objectHash.sha1(longLatCoords)
  if (cache.has(activityCoordinatesHash)) {
    return new Promise<number[]>(() => {
      return cache.get(activityCoordinatesHash)
    })
  }

  const coordsToCorrect = longLatCoords.flatMap((longLatCoord) => [
    { longitude: longLatCoord[0], latitude: longLatCoord[1] }
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

      const parsedResponse: ElevationResponse = res
      const elevationPoints: number[] = []

      parsedResponse.results.forEach((result) => {
        elevationPoints.push(result.elevation)
      })

      if (longLatCoords.length == elevationPoints.length)
        cache.set(activityCoordinatesHash, elevationPoints)
      else {
        const rejectionMessage =
          'Elevation correction failed due to not being supplied with enough data from the server'
        alert(rejectionMessage)
        Promise.reject(rejectionMessage)
      }

      return elevationPoints
    })
}

export { correctElevation }
