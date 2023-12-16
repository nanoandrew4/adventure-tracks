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
import { ReducedActivity } from '../../types/ReducedActivity'
import { BoundingBoxCalculator } from '@/helpers/boundingBoxCalculator'
import { mapSourceTracker } from '@/helpers/mapSourceTracker'

const TARGET_REFRESH_RATE = 10.0
const MILLISECONDS_BETWEEN_FRAMES = 1000.0 / TARGET_REFRESH_RATE

let store: Store
let map: mapboxgl.Map

export default defineComponent({
  computed: {
    lineWidth: (): number => store.state.adventure.lineWidth,
    activities: (): Activity[] => store.state.adventure.activities,
    reducedActivities: (): ReducedActivity[] =>
      store.state.adventure.activities.map((activity: Activity) => new ReducedActivity(activity)),
    boundingCoordinateBox: (): [number, number, number, number] => store.state.boundingCoordinateBox
  },
  setup() {
    store = useStore()
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  },
  data() {
    return {
      lastRefreshTimestamp: 0,
      sourceTracker: new mapSourceTracker(),
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
      handler(modifiedActivities: ReducedActivity[]) {
        this.fpsCappedMapRefresh(modifiedActivities)
      }
    }
  },
  methods: {
    fpsCappedMapRefresh(modifiedActivities: ReducedActivity[]) {
      if (new Date().getTime() - this.lastRefreshTimestamp < MILLISECONDS_BETWEEN_FRAMES) {
        this.delayedRunner.runDelayedFunction(() => {
          this.refreshMap(modifiedActivities)
        }, MILLISECONDS_BETWEEN_FRAMES)
      } else {
        this.delayedRunner.clearTimeout()
        this.refreshMap(modifiedActivities)
      }
    },
    refreshMap(modifiedActivities: ReducedActivity[]) {
      const activitiesToRemove = this.sourceTracker.getMissingSources(modifiedActivities)
      const newActivities = this.sourceTracker.getNewActivities(modifiedActivities)
      let activitiesMap = this.activities.reduce((result, item) => {
        result.set(item.uid, item)
        return result
      }, new Map<string, Activity>())

      this.removeSourcesAndLayers(activitiesToRemove)
      newActivities.forEach((activity) => this.addSourceAndLayer(activitiesMap.get(activity.uid)!))

      modifiedActivities.forEach((activity) => {
        if (activity.lineColor != map.getPaintProperty(activity.layerName, 'line-color'))
          map.setPaintProperty(activity.layerName, 'line-color', activity.lineColor)
      })

      if (newActivities.length > 0) {
        this.recalculateActivitiesBoundingBox()
      }

      this.lastRefreshTimestamp = new Date().getTime()
    },
    removeSourcesAndLayers(sourcesToRemove: string[]) {
      if (sourcesToRemove) {
        sourcesToRemove.forEach((source) => {
          this.sourceTracker.unregisterSource(source)
          if (map.getSource(source)) {
            map.removeLayer(`layer-${source}`)
            map.removeSource(source)
          }
        })
      }
    },
    addSourceAndLayer(activity: Activity) {
      map.addSource(activity.sourceName, {
        type: 'geojson',
        data: activity.geoJsonFeature
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

      this.sourceTracker.registerActivity(activity)
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
    recalculateActivitiesBoundingBox() {
      let bboxCalculator = new BoundingBoxCalculator()
      this.activities.forEach((activity) => {
        activity.processCoordinates(bboxCalculator.processPosition.bind(bboxCalculator))
      })

      store.commit('SET_BOUNDING_COORDINATE_BOX', bboxCalculator.getBoundingBox())
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
      const zoom = Math.log2(containerWidth / width) - 0.75
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
  border-radius: 1vw;
  margin: 0.5vw;
}
</style>
