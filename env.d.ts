/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MAPBOX_ACCESS_TOKEN: string
    readonly VITE_ELEVATION_API_ENDPOINT: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }