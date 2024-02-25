import type { MapStyle } from '@/types/MapStyle'

const requestURL = import.meta.env.VITE_MAP_STYLES_FILE

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
          backgroundColor: elem.background_color,
          mainTextColor: elem.main_text_color,
          mainTextFont: elem.main_text_font,
          secondaryTextColor: elem.secondary_text_color,
          secondaryTextFont: elem.secondary_text_font,
          labelNameTextColor: elem.label_name_text_color,
          labelNameTextFont: elem.label_name_text_font,
          labelValueTextColor: elem.label_value_text_color,
          labelValueTextFont: elem.label_value_text_font,
          custom: false
        }
      ])
    })
}

export { retrieveDefaultMapStyles }
