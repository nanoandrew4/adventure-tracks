<template>
  <div
    id="track-creator"
    class="track-creator"
  >
    <div
      id="adventure-track"
      :class="`adventure-track${adventureTrackClassSuffix}`"
      :style="`background: ${adventure.backgroundColor};`"
    >
      <ActivityMap
        :class="`adventure-track-map${adventureTrackChildrenStyleSuffix}`"
        ref="activityMap"
      />
      <div
        class="adventure-track-details adventure-track-details"
        :class="`adventure track-details adventure-track-details${adventureTrackChildrenStyleSuffix}`"
      >
        <DataGraph
          :display="displayGraph"
          class="draggable"
          draggable
        />
        <div
          id="main-text-container"
          class="resizable-container"
          draggable
          resizable
        >
          <h1
            id="main-text"
            :style="`color: ${adventure.mainText.color}; font-family: ${adventure.mainText.font}`"
          >
            {{ adventure.mainText.text }}
          </h1>
        </div>
        <div
          id="secondary-text-container"
          class="resizable-container"
          draggable
          resizable
        >
          <h2
            id="secondary-text"
            :style="`color: ${adventure.secondaryText.color}; font-family: ${adventure.secondaryText.font}`"
          >
            {{ adventure.secondaryText.text }}
          </h2>
        </div>

        <div class="labels-container">
          <LabelItem
            :key="idx"
            :index="idx"
            :label="label"
            v-for="(label, idx) in labels"
          />
        </div>
      </div>
    </div>
    <ConfigurationPanel
      @capture="capture"
      @change-visibility="showConfigurationPanel = !showConfigurationPanel"
      :show="showConfigurationPanel"
    />
  </div>
  <div id="output"></div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import ActivityMap from '../components/map/ActivityMap.vue'
import DataGraph from '../components/DataGraph.vue'
import ConfigurationPanel from '../components/configurator/MainPanel.vue'
import LabelItem from '../components/LabelItem.vue'
import '../../node_modules/mapbox-gl/dist/mapbox-gl.css'
import html2canvas from 'html2canvas'

import { LayoutMode, type Adventure } from '../types/Adventure'
import { useStore } from '../vuex/store'
import type { Store } from 'vuex'
import type { Label } from '@/types/Label'
import {
  registerDraggableTaggedElements,
  unregisterAllDraggableElements
} from '@/helpers/draggableManager'
import {
  adjustAllRegisteredElementDimensionsIfNecessary,
  registerResizableTaggedElements,
  unregisterAllResizableElements
} from '@/helpers/resizableManager'

let store: Store

export default defineComponent({
  components: {
    ActivityMap,
    DataGraph,
    ConfigurationPanel,
    LabelItem
  },
  computed: {
    adventure: (): Adventure => store.state.adventure,
    customizationEnabled: (): boolean => store.state.adventure.customizationEnabled,
    displayGraph: function (): boolean {
      return store.state.adventure.displayElevationProfile && this?.adventure.activities.length > 0
    },
    adventureTrackClassSuffix: function (): string {
      if (this.adventure.layoutMode == LayoutMode.PORTRAIT) {
        if (this.showConfigurationPanel) return '--portrait'
        else return '--portrait-full'
      } else {
        if (this.showConfigurationPanel) return '--landscape'
        else return '--landscape-full'
      }
    },
    adventureTrackChildrenStyleSuffix: function (): string {
      adjustAllRegisteredElementDimensionsIfNecessary() // to adjust size when graph is added
      return this.displayGraph ? '--with-elevation' : '--without-elevation'
    },
    labels: () =>
      store.state.adventure.labels.filter(
        (label: Label) => label.name.length > 0 && label.value.length > 0
      )
  },
  data() {
    const rawGpxFiles: string[] = []
    return {
      lastStyleSuffix: '',
      activityMap: ref<InstanceType<typeof ActivityMap>>(),
      rawGpxFiles,
      showConfigurationPanel: true,
      lastAdventureTrackClassSuffix: ''
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
    },
    resizeMap() {
      let activityMapRef = this.$refs.activityMap as typeof ActivityMap
      activityMapRef.resizeMap()
    }
  },
  watch: {
    customizationEnabled(enabled: boolean) {
      if (enabled) {
        registerResizableTaggedElements()
        registerDraggableTaggedElements()
      } else {
        unregisterAllResizableElements()
        unregisterAllDraggableElements()
        this.resizeMap()
      }
    }
  },
  updated: function () {
    this.$nextTick(async () => {
      if (this.lastStyleSuffix !== this.adventureTrackChildrenStyleSuffix) {
        this.resizeMap()
        this.lastStyleSuffix = this.adventureTrackChildrenStyleSuffix
      } else if (
        this.lastAdventureTrackClassSuffix !== this.adventureTrackClassSuffix
      ) {
        this.resizeMap()
        store.commit('SET_REFRESH_DATA_GRAPH', true)
        this.lastAdventureTrackClassSuffix = this.adventureTrackClassSuffix
      }
    })
  }
})
</script>

<style>
.track-creator {
  width: 100%;
  height: fit-content;
  contain: layout;
}

.adventure-track--landscape,
.adventure-track--landscape-full,
.adventure-track--portrait,
.adventure-track--portrait-full {
  position: absolute;
  transition: all 0.5s ease;
  transition-property: width, left;
  max-height: var(--max-height);
  border-radius: 12px;

  --max-height: 93vh;
}

.adventure-track--portrait,
.adventure-track--portrait-full {
  max-width: calc(var(--max-height) * (1 / sqrt(2)));
  aspect-ratio: 1 / sqrt(2);
}

.adventure-track--portrait {
  width: 75%;
  left: max(calc((75% - var(--max-height) * (1 / sqrt(2))) / 2), 0px);
}

.adventure-track--portrait-full {
  width: 100%;
  left: max(calc((100% - var(--max-height) * (1 / sqrt(2))) / 2), 0px);
}

.adventure-track--landscape,
.adventure-track--landscape-full {
  max-width: calc(var(--max-height) * sqrt(2));
  aspect-ratio: sqrt(2);
}

.adventure-track--landscape {
  width: 75%;
  left: max(calc((75% - var(--max-height) * sqrt(2)) / 2), 0px);
}

.adventure-track--landscape-full {
  width: 100%;
  left: max(calc((100% - var(--max-height) * sqrt(2)) / 2), 0px);
}

.adventure-track-map--with-elevation {
  height: calc(70% - 0.5vw);
}

.adventure-track-map--without-elevation {
  height: calc(75% - 0.5vw);
}

.adventure-track-details--with-elevation {
  max-height: calc(30% - 0.5vw * 2);
  /* margin: 0.5vw; */
}

.adventure-track-details--without-elevation {
  max-height: calc(25% - 0.5vw * 2);
  /* margin: 0.5vw; */
}

.adventure-track-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* height: 100%; */

  .labels-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    width: 90%;
  }
}

.labels-container {
  flex-direction: row;
}

div#main-text-container,
div#secondary-text-container {
  width: 25%;
}

.resizable-container {
  container-type: inline-size;

  h1 {
    text-wrap: wrap;
    font-size: 10cqw;
  }

  h2 {
    font-size: 7.5cqw;
  }
}
</style>
