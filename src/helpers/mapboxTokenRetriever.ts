const requestURL = import.meta.env.VITE_MAPBOX_TOKEN_MANAGER

async function retrieveMapBoxToken(): Promise<string> {
  const request: RequestInfo = new Request(requestURL, {
    method: 'GET',
  })

  return await fetch(request)
    .then((res) => {
      return res.text()
    }).then((token) => {
      return token
    }).catch(() => {
      throw new Error("Error retrieving token")
    })
}

export { retrieveMapBoxToken }
