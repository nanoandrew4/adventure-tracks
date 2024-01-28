/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
  readonly VITE_ENABLE_ELEVATION_CORRECTION: string
  readonly VITE_ELEVATION_API_ENDPOINT: string
  readonly VITE_MAP_STYLES_FILE: string
  readonly VITE_GOOGLE_FONTS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
