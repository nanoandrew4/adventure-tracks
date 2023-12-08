<template>
  <div
    id="mapContainer"
    class="map-container"
  ></div>
</template>

<script lang="ts">
import mapboxgl from 'mapbox-gl'
import { defineComponent } from 'vue'
import type { Activity } from '../types/Activity'
import { useStore } from '../vuex/store'
import type { Store } from 'vuex'

let store: Store
let map: mapboxgl.Map

export default defineComponent({
  computed: {
    activities: (): Activity[] => store.state.adventure.activities,
    boundingCoordinateBox: (): [number, number, number, number] => store.state.boundingCoordinateBox
  },
  setup() {
    store = useStore()
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  },
  mounted() {
    const mapContainerElement = document.getElementById('mapContainer')
    if (mapContainerElement == null) return

    const bounds = new mapboxgl.LngLatBounds(this.boundingCoordinateBox)
    map = new mapboxgl.Map({
      container: mapContainerElement,
      style: 'mapbox://styles/nanoandrew4/clppmhvwn00zp01qt8lcsh6py',
      center: bounds.getCenter(),
      bearing: 0,
      pitch: 0,
      zoom: 9,
      preserveDrawingBuffer: true,
      attributionControl: true
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: false }))
    // map.addControl(new mapboxgl.AttributionControl({
    //     customAttribution: "© Mapbox, © OpenStreetMap"
    // }))

    const calculatedZoomAndCenter = this.calculateZoomAndCenter()
    map.setCenter({
      lng: calculatedZoomAndCenter.center[0],
      lat: calculatedZoomAndCenter.center[1]
    })
    map.setZoom(calculatedZoomAndCenter.zoom)

    map.on('rotate', () => {
      map.setBearing(0)
    })
    map.on('pitch', () => {
      // Reset the pitch to 0 whenever it changes
      map.setPitch(0)
    })
  },
  unmounted() {
    map.remove()
  },
  watch: {
    boundingCoordinateBox() {
      const calculatedZoomAndCenter = this.calculateZoomAndCenter()
      map.setCenter({
        lng: calculatedZoomAndCenter.center[0],
        lat: calculatedZoomAndCenter.center[1]
      })
      map.setZoom(calculatedZoomAndCenter.zoom)
    },
    activities: {
      deep: true,
      handler(modifiedActivities: Activity[], oldActivities: Activity[]) {
        let fullRedrawRequired = !oldActivities || oldActivities.length !== modifiedActivities.length
        if (!fullRedrawRequired) {
          const currentActivityUids = modifiedActivities.flatMap((activity) => [activity.uid])
          const oldActivityUids = oldActivities.flatMap((activity) => [activity.uid])
          fullRedrawRequired = !this.arraysEqual(currentActivityUids, oldActivityUids)
        }

        if (oldActivities !== undefined) {
          oldActivities.forEach((oldActivity) => {
            if (fullRedrawRequired && map.getSource(oldActivity.sourceName)) {
              map.removeLayer(oldActivity.layerName)
              map.removeSource(oldActivity.sourceName)
            }
          })
        }

        modifiedActivities.forEach((modifiedActivity) => {
          if (fullRedrawRequired) {
            let data: GeoJSON.Feature = {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: modifiedActivity.activityGeoPoints.map((geoPoint) => geoPoint.position)
              },
              properties: null
            }
            map.addSource(modifiedActivity.sourceName, {
              type: 'geojson',
              data
            })

            map.addLayer({
              id: modifiedActivity.layerName,
              type: 'line',
              source: modifiedActivity.sourceName,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': modifiedActivity.lineColor,
                'line-width': 4
              }
            })
          } else if (map.getPaintProperty(modifiedActivity.layerName, 'line-color') != modifiedActivity.lineColor) {
            map.setPaintProperty(modifiedActivity.layerName, 'line-color', modifiedActivity.lineColor)
          } else {
            console.log(`${map.getPaintProperty(modifiedActivity.layerName, 'line-color')} != ${modifiedActivity.lineColor}`)
          }
        })
      }
    }
  },
  methods: {
    arraysEqual<T>(a: T[], b: T[]): boolean {
      if (a.length !== b.length) {
        return false
      }

      const sortedA = [...a].sort()
      const sortedB = [...b].sort()

      for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) {
          return false
        }
      }

      return true
    },
    resizeMap() {
      map.resize()
    },
    recenter() {
      const calculatedZoomAndCenter = this.calculateZoomAndCenter()
      map.setCenter({
        lng: calculatedZoomAndCenter.center[0],
        lat: calculatedZoomAndCenter.center[1]
      })
      map.setZoom(calculatedZoomAndCenter.zoom)
    },
    calculateZoomAndCenter() {
      const bounds = new mapboxgl.LngLatBounds(this.boundingCoordinateBox)

      const { lng, lat } = bounds.getCenter()
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      // Calculate the zoom level based on the bounding box dimensions
      const zoom = this.getZoom(ne.lng - sw.lng, map.getCanvas().clientWidth)

      return { center: [lng, lat], zoom }
    },
    getZoom(width: number, containerWidth: number) {
      const zoom = Math.log2(containerWidth / width) - 1
      return zoom
    }
  }
})
</script>

<style>
.map-container {
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 16/9;
  border-radius: 12px;
}
</style>
