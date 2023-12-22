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
import { useStore, type State } from '../../vuex/store'
import type { Store } from 'vuex'
import { DelayedRunner } from '../../helpers/delayedRunner'
import { ReducedActivity } from '../../types/ReducedActivity'
import { BoundingBoxCalculator } from '@/helpers/boundingBoxCalculator'
import { mapSourceTracker } from '@/helpers/mapSourceTracker'
import type { MapStyle } from '@/types/MapStyle'

const TARGET_REFRESH_RATE = 10.0
const MILLISECONDS_BETWEEN_FRAMES = 1000.0 / TARGET_REFRESH_RATE

let store: Store
let state: State
let map: mapboxgl.Map

export default defineComponent({
  computed: {
    lineWidth: (): number => state.adventure.lineWidth,
    activities: (): Activity[] => state.adventure.activities,
    reducedActivities: (): ReducedActivity[] =>
      state.adventure.activities.map((activity: Activity) => new ReducedActivity(activity)),
    boundingCoordinateBox: (): [number, number, number, number] => state.boundingCoordinateBox,
    activeMapStyle: (): MapStyle => state.activeMapStyle
  },
  setup() {
    const basePixelRatio = window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      get() {
        return basePixelRatio > 1 ? basePixelRatio : 2
      }
    })

    store = useStore()
    state = store.state
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
      style: 'mapbox://styles/nanoandrew4/clq85wo0o000z01qyfu4j338x',
      antialias: true,
      trackResize: true,
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
    activeMapStyle(newMapStyle: MapStyle) {
      map.setStyle(`mapbox://styles/${newMapStyle.username}/${newMapStyle.styleID}`)
      const t = this
      map.on('style.load', () => {
        t.removeSourcesAndLayers(this.sourceTracker.getAllSources())
        t.activities.forEach((activity) => this.addSourceAndLayer(activity))
      })
    },
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

      this.addLayer(activity)

      this.sourceTracker.registerActivity(activity)
    },
    addLayer(activity: Activity) {
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

      console.log((bounds.getNorth() - bounds.getSouth()) / (bounds.getEast() - bounds.getWest()))
      let containerSize = 0
      if (
        (bounds.getNorth() - bounds.getSouth()) / (bounds.getEast() - bounds.getWest()) >
        9 / 16
      ) {
        containerSize = map.getCanvas().clientHeight
      } else {
        containerSize = map.getCanvas().clientWidth
      }
      // Calculate the zoom level based on the bounding box dimensions
      const zoom = this.getZoom(ne.lng - sw.lng, containerSize)

      return { center: [lng, lat], zoom }
    },
    getZoom(width: number, containerSize: number) {
      const zoom = Math.log2(containerSize / width) - 0.75
      return zoom
    }
  }
})
</script>

<style>
.map-container {
  .mapboxgl-canvas-container {
    canvas {
      border-radius: 12px;
      position: unset;
    }
  }
}
</style>
