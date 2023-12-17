import type { MapStyle } from '@/types/MapStyle'

const requestURL = import.meta.env.VITE_MAP_STYLES_FILE
const stylesAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const headers: Headers = new Headers()
headers.set('Content-Type', 'application/json')
headers.set('Accept', 'application/json')

async function retrieveDefaultMapStyles(): Promise<MapStyle[]> {
  const request: RequestInfo = new Request(requestURL, {
    method: 'GET',
    headers: headers
  })

  return fetch(request)
    .then((res) => res.json())
    .then((res) => {
      return res.flatMap((elem: any) => [
        {
          name: elem.name,
          username: elem.username,
          styleID: elem.style_id,
          accessToken: stylesAccessToken
        }
      ])
    })
}

export { retrieveDefaultMapStyles }
