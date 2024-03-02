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
import { registerResizableAdventureTrackElement } from '@/helpers/resizableManager'
import type { MapStyle } from '@/types/MapStyle'
import { initializeDevicePixelRatio } from '@/helpers/devicePixelRatioManager'

const TARGET_DRAW_REFRESH_RATE = 10.0
const TARGET_DRAW_RESIZE_RATE = 2.0
const DRAW_MILLISECONDS_BETWEEN_FRAMES = 1000.0 / TARGET_DRAW_REFRESH_RATE
const RESIZE_MILLISECONDS_BETWEEN_FRAMES = 1000.0 / TARGET_DRAW_RESIZE_RATE

let store: Store
let state: State
let map: mapboxgl.Map

const layersToPutOnTop = ['settlement-major-label', 'settlement-minor-label']

export default defineComponent({
  computed: {
    lineWidth: (): number => state.adventure.lineWidth,
    activities: (): Activity[] => state.adventure.activities,
    customizationEnabled: (): boolean => store.state.adventure.customizationEnabled,
    reducedActivities: (): ReducedActivity[] =>
      state.adventure.activities.map((activity: Activity) => new ReducedActivity(activity)),
    boundingCoordinateBox: (): [number, number, number, number] => state.boundingCoordinateBox,
    activeMapStyle: (): MapStyle => state.adventure.mapStyle,
    recenterMap: (): boolean => store.state.recenterMap
  },
  setup() {
    store = useStore()
    state = store.state
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  },
  data() {
    return {
      lastRefreshTimestamp: 0,
      lastResizeTimestamp: 0,
      attribution: new mapboxgl.AttributionControl(),
      sourceTracker: new mapSourceTracker(),
      delayedRunner: new DelayedRunner()
    }
  },
  mounted() {
    const mapContainerElement = document.getElementById('mapContainer')
    if (mapContainerElement == null) return

    initializeDevicePixelRatio()

    this.initMap()

    map.on('load', () => {
      this.fpsCappedMapRefresh(this.reducedActivities)
      this.recenter()
    })
  },
  unmounted() {
    map.remove()
  },
  watch: {
    activeMapStyle(newMapStyle: MapStyle) {
      map.setStyle(`mapbox://styles/${newMapStyle.username}/${newMapStyle.styleID}`)
      const t = this
      map.once('style.load', () => {
        t.removeSourcesAndLayers(this.sourceTracker.getAllSources())
        t.activities.forEach((activity) => this.addSourceAndLayer(activity))
      })
    },
    customizationEnabled(enabled: boolean) {
      if (enabled) {
        const t = this
        const rootElem = document.getElementById('mapContainer')
        if (rootElem) {
          registerResizableAdventureTrackElement(rootElem, () => {
            if (new Date().getTime() - t.lastResizeTimestamp < RESIZE_MILLISECONDS_BETWEEN_FRAMES) {
              t.delayedRunner.runDelayedFunction(() => {
                t.resizeMap()
              }, RESIZE_MILLISECONDS_BETWEEN_FRAMES)
            } else {
              t.delayedRunner.clearTimeout()
              t.resizeMap()
            }
          })
        }
      }
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
    },
    recenterMap(newVal: boolean) {
      if (newVal) {
        this.recenter()
        store.commit('SET_RECENTER_MAP', false)
      }
    }
  },
  methods: {
    initMap() {
      const mapContainerElement = document.getElementById('mapContainer')

      const bounds = new mapboxgl.LngLatBounds(this.boundingCoordinateBox)
      map = new mapboxgl.Map({
        container: mapContainerElement!,
        style: `mapbox://styles/${this.activeMapStyle.username}/${this.activeMapStyle.styleID}`,
        antialias: true,
        trackResize: true,
        center: bounds.getCenter(),
        bearing: 0,
        pitch: 0,
        preserveDrawingBuffer: true,
        attributionControl: false
      })

      map.fitBounds(bounds, { padding: this.getBoundsPadding(bounds), animate: false })

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: false }))
      // map.addControl(new mapboxgl.AttributionControl({
      //     customAttribution: "© Mapbox, © OpenStreetMap"
      // }))
      map.addControl(this.attribution)

      map.on('rotate', () => {
        map.setBearing(0)
      })
      map.on('pitch', () => {
        map.setPitch(0)
      })
    },
    fpsCappedMapRefresh(modifiedActivities: ReducedActivity[]) {
      if (new Date().getTime() - this.lastRefreshTimestamp < DRAW_MILLISECONDS_BETWEEN_FRAMES) {
        this.delayedRunner.runDelayedFunction(() => {
          this.refreshMap(modifiedActivities)
        }, DRAW_MILLISECONDS_BETWEEN_FRAMES)
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

      layersToPutOnTop.forEach((l) => {
        map.moveLayer(activity.layerName, l)
      })

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
    resizeMap(recenter?: boolean) {
      const b = map.getBounds()
      map.once('resize', () => {
        if (recenter) {
          this.recenter()
        } else {
          map.fitBounds(b, { padding: this.getBoundsPadding(b), animate: false })
        }
      })
      map.resize()

      this.lastResizeTimestamp = new Date().getTime()
    },
    repaintForCapture(postResizeFunc?: () => void) {
      const originalBounds = map.getBounds()
      map.remove()
      this.initMap()
      map.once('load', () => {
        map.fitBounds(originalBounds, { padding: this.getBoundsPadding(originalBounds), animate: false })
        this.sourceTracker = new mapSourceTracker()
        this.refreshMap(this.reducedActivities)
        map.once('idle', () => {
          if (postResizeFunc) postResizeFunc()
        })
      })
    },
    recalculateActivitiesBoundingBox() {
      let bboxCalculator = new BoundingBoxCalculator()
      this.activities.forEach((activity) => {
        activity.processCoordinates(bboxCalculator.processPosition.bind(bboxCalculator))
      })

      store.commit('SET_BOUNDING_COORDINATE_BOX', bboxCalculator.getBoundingBox())
    },
    recenter() {
      const bounds = new mapboxgl.LngLatBounds(this.boundingCoordinateBox)
      map.fitBounds(bounds, { padding: this.getBoundsPadding(bounds) })
    },
    getBoundsPadding(bounds: mapboxgl.LngLatBounds): number {
      if (
        (bounds.getEast() - bounds.getWest()) / (bounds.getNorth() - bounds.getSouth()) >
        Math.sqrt(2)
      ) {
        return map.getCanvas().clientHeight / 100
      } else {
        return map.getCanvas().clientWidth / 100
      }
    }
  }
})
</script>

<style>
.map-container {
  /*
   Solves the issue of attribution and map jumping around on resize.
   References:
   - https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
   - https://developer.mozilla.org/en-US/docs/Web/CSS/contain
  */
  contain: layout;

  max-width: inherit;
  max-height: inherit;
  .mapboxgl-canvas-container {
    max-width: inherit;
    canvas {
      max-width: inherit;
      border-radius: 12px;
    }
  }
}

.mapboxgl-ctrl-attrib {
  border-radius: 12px;
  font-size: small;
}

.mapbox-improve-map {
  display: none;
}
</style>
