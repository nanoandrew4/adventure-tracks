/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
  readonly VITE_ELEVATION_API_ENDPOINT: string
  readonly VITE_MAP_STYLES_FILE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
