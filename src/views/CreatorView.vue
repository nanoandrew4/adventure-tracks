<template>
  <div
    id="track-creator"
    class="track-creator"
  >
    <div
      id="adventure-track"
      class="adventure-track"
      :style="`background: ${adventure.backgroundColor};`"
    >
      <ActivityMap
        :class="`adventure-track-map${adventureTrackStyleSuffix}`"
        ref="activityMap"
      />
      <div
        class="adventure-track-details adventure-track-details"
        :class="`adventure track-details adventure-track-details${adventureTrackStyleSuffix}`"
      >
        <DataGraph :display="displayGraph" />
        <h1
          id="main-text"
          :style="`color: ${adventure.mainTextColor};`"
        >
          {{ adventure.mainText }}
        </h1>
        <h2
          id="secondary-text"
          :style="`color: ${adventure.secondaryTextColor};`"
        >
          {{ adventure.secondaryText }}
        </h2>
      </div>
    </div>
    <ConfigurationPanel @capture="capture" />
  </div>
  <div id="output"></div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import ActivityMap from '../components/map/ActivityMap.vue'
import DataGraph from '../components/DataGraph.vue'
import ConfigurationPanel from '../components/configurator/MainPanel.vue'
import '../../node_modules/mapbox-gl/dist/mapbox-gl.css'
import html2canvas from 'html2canvas'

import { type Adventure } from '../types/Adventure.type'
import { useStore } from '../vuex/store'
import type { Store } from 'vuex'

let store: Store

export default defineComponent({
  components: {
    ActivityMap,
    DataGraph,
    ConfigurationPanel
  },
  computed: {
    adventure: (): Adventure => store.state.adventure,
    displayGraph: function (): boolean {
      return store.state.adventure.displayElevationProfile && this?.adventure.activities.length > 0
    },
    adventureTrackStyleSuffix: function (): string {
      return this.displayGraph ? '--with-elevation' : '--without-elevation'
    }
  },
  data() {
    const rawGpxFiles: string[] = []
    return {
      lastStyleSuffix: '',
      activityMap: ref<InstanceType<typeof ActivityMap>>(),
      rawGpxFiles
    }
  },
  setup() {
    store = useStore()
  },
  methods: {
    async capture() {
      let captureElement = document.getElementById('adventure-track')
      let activityMapRef = this.$refs.activityMap as typeof ActivityMap

      if (captureElement != null && activityMapRef != null) {
        captureElement.style.width = '7680px'
        activityMapRef.resizeMap()
        activityMapRef.recenter()

        await new Promise((r) => setTimeout(r, 5000))

        html2canvas(captureElement).then((canvas) => {
          const newWindow = window.open()

          if (newWindow != null) {
            newWindow.document.write(`<html><body><div id="output"></body></html>`)

            let outputDiv = newWindow.document.getElementById('output')
            if (outputDiv != null) {
              outputDiv.appendChild(canvas)
            }

            newWindow.document.close()
          }
        })

        await new Promise((r) => setTimeout(r, 2000))

        captureElement.style.width = ''
        activityMapRef.resizeMap()
      } else {
        alert('Adventure track to save could not be located')
      }
    }
  },
  updated: function () {
    this.$nextTick(function () {
      if (this.lastStyleSuffix !== this.adventureTrackStyleSuffix) {
        let activityMapRef = this.$refs.activityMap as typeof ActivityMap
        activityMapRef.resizeMap()
        this.lastStyleSuffix = this.adventureTrackStyleSuffix
      }
    })
  }
})
</script>

<style>
.track-creator {
  width: 100%;
  height: fit-content;
  display: grid;
  grid-template-columns: 75% 25%;
  align-items: center;
  justify-content: center;
}

.adventure-track {
  width: 100%;
  height: 90vh;
  border-radius: 12px;
}

.adventure-track-map--with-elevation {
  height: calc(75% - 0.5vw);
  margin: 0.5vw;
}

.adventure-track-map--without-elevation {
  height: calc(80% - 0.5vw);
  margin: 0.5vw;
}

.adventure-track-details--with-elevation {
  height: calc(25% - 0.5vw * 2);
  margin: 0.5vw;
}

.adventure-track-details--without-elevation {
  height: calc(20% - 0.5vw * 2);
  margin: 0.5vw;
}

.adventure-track-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  h1 {
    width: 100%;
  }
  h2 {
    width: 100%;
  }
}
</style>
