import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const ActivityMap = {
  template: `
        <div id="mapContainer" ref="mapContainer" class="map-container"></div>
    `,
  props: ['bbox', 'activities', 'orientation'],
  data: () => ({ map: null }),
  setup(props) {
    
  },
  mounted() {
    const bbox = this.bbox

    const map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: 'mapbox://styles/nanoandrew4/clppmhvwn00zp01qt8lcsh6py',
      center: [bbox[0][0], bbox[0][1]],
      bearing: 0,
      pitch: 0,
      zoom: 9,
      preserveDrawingBuffer: true,
      attributionControl: true
    })

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false, showPitch: false, showZoom: false })
    )
    // map.addControl(new mapboxgl.AttributionControl({
    //     customAttribution: "© Mapbox, © OpenStreetMap"
    // }))

    const calculatedZoomAndCenter = this.calculateZoomAndCenter(bbox, map)
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

    this.map = map
  },
  unmounted() {
    this.map.remove()
    this.map = null
  },
  watch: {
    orientation(next) {
      // if (next == "vertical") {
      // } else {
      // }
    },
    bbox(next) {
      const map = this.map
      const calculatedZoomAndCenter = this.calculateZoomAndCenter(next, map)
      map.setCenter({
        lng: calculatedZoomAndCenter.center[0],
        lat: calculatedZoomAndCenter.center[1]
      })
      map.setZoom(calculatedZoomAndCenter.zoom)
    },
    activities(old, next) {
      const map = this.map
      console.log(this.activities)

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
        map.addSource(newActivity.sourceName, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: newActivity.lineCoordinates
            }
          }
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
      this.map.resize()
    },
    getLocation() {
      return {
        ...this.map.getCenter(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch(),
        zoom: this.map.getZoom()
      }
    },
    recenter() {
      const map = this.map
      const calculatedZoomAndCenter = this.calculateZoomAndCenter(this.bbox, map)
      map.setCenter({
        lng: calculatedZoomAndCenter.center[0],
        lat: calculatedZoomAndCenter.center[1]
      })
      map.setZoom(calculatedZoomAndCenter.zoom)
    },
    calculateZoomAndCenter(bbox, map) {
      const bounds = new mapboxgl.LngLatBounds(bbox[0], bbox[1])

      const { lng, lat } = bounds.getCenter()
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      // Calculate the zoom level based on the bounding box dimensions
      const zoom = this.getZoom(ne.lng - sw.lng, map._canvas.clientWidth)

      return { center: [lng, lat], zoom }
    },
    getZoom(width, containerWidth) {
      const zoom = Math.log2(containerWidth / width) - 1
      return zoom
    },
    takeScreenshot() {
        const map = this.map
        const recenterFunc = this.recenter
        return new Promise(function (resolve, reject) {
            map.once("render", function () {
                resolve(map.getCanvas().toDataURL());
            });
            /* trigger render */
            map.triggerRepaint();
            recenterFunc();
        })
    },
    captureMap() {
      const dataURL = this.map.getCanvas().toDataURL('image/png')

      // Create an image element to display or download the screenshot
      const image = new Image()
      image.src = dataURL

      // Optionally, append the image to the document or open it in a new tab
      return image
    }
  }
}

export default ActivityMap
