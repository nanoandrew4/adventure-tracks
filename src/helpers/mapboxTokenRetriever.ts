const requestURL = import.meta.env.VITE_MAPBOX_TOKEN_MANAGER

async function retrieveMapBoxToken(): Promise<string> {
  return "pk.eyJ1IjoibmFub2FuZHJldzQiLCJhIjoiY2xwb3EyNmhnMTJtNzJtb2JqeTdtN2k1NiJ9.eoU_QR6tlHovUMdnE238Bg"
}

export { retrieveMapBoxToken }
