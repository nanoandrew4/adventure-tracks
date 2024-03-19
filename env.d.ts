/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_ELEVATION_CORRECTION: string
  readonly VITE_ELEVATION_API_ENDPOINT: string
  readonly VITE_MAP_STYLES_FILE: string
  readonly VITE_GOOGLE_FONTS_API_KEY: string
  readonly VITE_MAPBOX_TOKEN_MANAGER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
