<template>
  <div id="mapContainer" class="map-container"></div>
</template>

<script lang="ts">
import mapboxgl from 'mapbox-gl'
import { defineComponent } from 'vue';
import type { Activity } from '../types/Activity.type';
import { useStore } from '../vuex/store';
import type { Store } from 'vuex';

let store: Store
let map: mapboxgl.Map

export default defineComponent({
  computed: {
    activities: (): Activity[] => store.state.adventure.activities,
    boundingCoordinateBox: (): [number, number, number, number] => store.state.boundingCoordinateBox
  },
  setup(props) {
    store = useStore()
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  },
  mounted() {
    const mapContainerElement = document.getElementById('mapContainer')
    if (mapContainerElement == null)
      return

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

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false, showZoom: false })
    )
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
    activities(old: Activity[], next: Activity[]) {
      if (old !== undefined) {
        old.forEach((oldActivity) => {
          console.log('Old activity: ' + oldActivity.name)
          if (map.getSource(oldActivity.sourceName)) {
            map.removeLayer(`layer-${oldActivity.sourceName}`)
            map.removeSource(oldActivity.sourceName)
          }
        })
      }

      this.activities.forEach((newActivity) => {
        console.log(newActivity)
        let data: GeoJSON.Feature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: newActivity.activityGeoPoints.map(geoPoint => geoPoint.position)
          },
          properties: null
        }
        map.addSource(newActivity.sourceName, {
          type: 'geojson',
          data
        })
        // Add a layer to display the line
        map.addLayer({
          id: 'layer-' + newActivity.sourceName,
          type: 'line',
          source: newActivity.sourceName,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888',
            'line-width': 4
          }
        })
      })
    }
  },
  methods: {
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
});

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