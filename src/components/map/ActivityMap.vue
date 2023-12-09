<template>
  <div
    id="mapContainer"
    class="map-container"
  ></div>
</template>

<script lang="ts">
import mapboxgl from 'mapbox-gl'
import { defineComponent } from 'vue'

import type { Activity } from '../../types/Activity'
import { useStore } from '../../vuex/store'
import type { Store } from 'vuex'
import { DelayedRunner } from '../../helpers/delayedRunner'
import { ReducedActivity } from './ReducedActivity'

const TARGET_REFRESH_RATE = 10.0
const MILLISECONDS_BETWEEN_FRAMES = 1000.0 / TARGET_REFRESH_RATE

let store: Store
let map: mapboxgl.Map

export default defineComponent({
  computed: {
    lineWidth: (): number => store.state.adventure.lineWidth,
    activities: (): Activity[] => store.state.adventure.activities,
    reducedActivities: (): ReducedActivity[] => store.state.adventure.activities.map((activity: Activity) => new ReducedActivity(activity)),
    boundingCoordinateBox: (): [number, number, number, number] => store.state.boundingCoordinateBox
  },
  setup() {
    store = useStore()
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  },
  data() {
    return {
      lastRefreshTimestamp: 0,
      delayedRunner: new DelayedRunner()
    }
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
    lineWidth() {
      this.activities.forEach((activity) => {
        map.setPaintProperty(activity.layerName, 'line-width', this.lineWidth * 0.25)
      })
    },
    reducedActivities: {
      deep: true,
      handler(modifiedActivities: ReducedActivity[], oldActivities: ReducedActivity[]) {
        this.fpsCappedMapRefresh(modifiedActivities, oldActivities)
      }
    }
  },
  methods: {
    fpsCappedMapRefresh(modifiedActivities: ReducedActivity[], oldActivities?: ReducedActivity[]) {
      if (new Date().getTime() - this.lastRefreshTimestamp < MILLISECONDS_BETWEEN_FRAMES) {
        this.delayedRunner.runDelayedFunction(() => {
          this.refreshMap(modifiedActivities, oldActivities)
        }, MILLISECONDS_BETWEEN_FRAMES)
      } else {
        this.delayedRunner.clearTimeout()
        this.refreshMap(modifiedActivities, oldActivities)
      }
    },
    refreshMap(modifiedActivities: ReducedActivity[], oldActivities?: ReducedActivity[]) {
      let oldActivitiesMap = oldActivities?.reduce((result, item) => {
        result.set(item.uid, item)
        return result
      }, new Map<string, ReducedActivity>())
      let modifiedActivitiesMap = modifiedActivities.reduce((result, item) => {
        result.set(item.uid, item)
        return result
      }, new Map<string, ReducedActivity>())
      let activitiesMap = this.activities.reduce((result, item) => {
        result.set(item.uid, item)
        return result
      }, new Map<string, Activity>())

      let activitiesToRemove: ReducedActivity[] | undefined = oldActivities?.flatMap((activity) =>
        !modifiedActivitiesMap.has(activity.uid) ? [activity] : []
      )
      let activitiesToAdd: ReducedActivity[] = modifiedActivities.flatMap((activity) => {
        if (oldActivitiesMap && !oldActivitiesMap.has(activity.uid) || !map.getLayer(activity.layerName)) {
          return [activity]
        }
        return []
      })
      let activitiesWithChangedColor = modifiedActivities.flatMap((activity) => {
        const oldActivity = oldActivitiesMap?.get(activity.uid)
        if (oldActivities && activity.lineColor != oldActivity?.lineColor) return [activity]
        return []
      })

      this.removeSourcesAndLayers(activitiesToRemove)
      activitiesToAdd.forEach((activity) => this.addSourceAndLayer(activitiesMap.get(activity.uid)!))
      activitiesWithChangedColor.forEach(activity => {
        map.setPaintProperty(activity.layerName, 'line-color', activity.lineColor)
      })

      this.lastRefreshTimestamp = new Date().getTime()
    },
    removeSourcesAndLayers(activitiesToRemove: ReducedActivity[] | undefined) {
      if (activitiesToRemove) {
        activitiesToRemove.forEach((oldActivity) => {
          if (map.getSource(oldActivity.sourceName)) {
            map.removeLayer(oldActivity.layerName)
            map.removeSource(oldActivity.sourceName)
          }
        })
      }
    },
    addSourceAndLayer(activity: Activity) {
      let data: GeoJSON.Feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: activity.activityGeoPoints.map((geoPoint) => geoPoint.position)
        },
        properties: null
      }
      map.addSource(activity.sourceName, {
        type: 'geojson',
        data
      })

      map.addLayer({
        id: activity.layerName,
        type: 'line',
        source: activity.sourceName,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': activity.lineColor,
          'line-width': this.lineWidth * 0.25
        }
      })
    },
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
