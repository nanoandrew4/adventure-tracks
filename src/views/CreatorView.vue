<template>
  <div
    v-if="!isMobile"
    id="track-creator"
    class="track-creator"
  >
    <FontRetriever :fonts="defaultStyleFonts" />
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
          ref="dataGraph"
          class="draggable"
          draggable
        />
        <div
          id="main-text-container"
          class="resizable-container"
          draggable
          resizable
        >
          <CustomText
            id="main-text"
            :model-value="adventure.mainText"
          />
        </div>
        <div
          id="secondary-text-container"
          class="resizable-container"
          draggable
          resizable
        >
          <CustomText
            id="secondary-text"
            :model-value="adventure.secondaryText"
          />
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
      @capture="showSaveAdventureDialog = true"
      @change-visibility="showConfigurationPanel = !showConfigurationPanel"
      :show="showConfigurationPanel"
    />
    <v-dialog
      v-model="showSaveAdventureDialog"
      width="fit-content"
      height="fit-content"
    >
      <v-card
        v-show="!showGeneratedImageDialog"
        :class="'save-adventure-dialog' + layoutSuffix"
      >
        <v-card-text>
          {{ $t('creator.config-panel.save-adventure.text') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :text="$t('creator.config-panel.save-adventure.cancel')"
            @click="closeSaveAdventureDialog"
          />
          <v-btn
            :text="$t('creator.config-panel.save-adventure.confirm')"
            :loading="isSaving"
            @click="capture"
          />
        </v-card-actions>
      </v-card>
      <v-card
        v-show="showGeneratedImageDialog"
        style="overflow: hidden"
        :class="'generated-image-dialog' + layoutSuffix"
      >
        <v-card-text class="centered-dialog-text">
          {{ $t('creator.config-panel.save-adventure.generated-image-text') }}
        </v-card-text>

        <div
          id="generated-image-container"
          class="generated-image-container"
        >
          <vue-image-zoomer
            :img-class="'generated-image' + layoutSuffix"
            :regular="generatedImageThumbnailDataURL"
            :zoom="generatedImageDataURL"
            :zoom-amount="4"
          />
        </div>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :text="$t('creator.config-panel.save-adventure.discard')"
            @click="closeSaveAdventureDialog"
          />
          <v-btn
            :text="$t('creator.config-panel.save-adventure.save')"
            :loading="isSaving"
            @click="saveGeneratedImage"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <div
    v-else
    class="mobile-creator"
  >
    <p>{{ $t('creator.mobile') }}</p>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import ActivityMap from '../components/map/ActivityMap.vue'
import DataGraph from '../components/DataGraph.vue'
import FontRetriever from '../components/FontRetriever.vue'
import CustomText from '../components/text/CustomText.vue'
import ConfigurationPanel from '../components/configurator/MainPanel.vue'
import LabelItem from '../components/text/LabelItem.vue'
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
import {
  generateImageToDownloadDataURL,
  generatePortraitThumbnailDataURL,
  generateLandscapeThumbnailDataURL
} from '@/helpers/generatedImage'
import FileSaver from 'file-saver'
import { retrieveDefaultMapStyles } from '@/helpers/retrieveDefaultMapStyles'
import type { MapStyle } from '@/types/MapStyle'
import { setHiResDPR, setStdResDPR } from '@/helpers/devicePixelRatioManager'

let store: Store

export default defineComponent({
  components: {
    ActivityMap,
    DataGraph,
    ConfigurationPanel,
    LabelItem,
    CustomText,
    FontRetriever
  },
  computed: {
    defaultStyleFonts: (): string[] =>
      [...store.state.mapStyles]
        .map((style: MapStyle) => style.mainTextFont)
        .filter((f: any) => f !== undefined) as string[],
    adventure: (): Adventure => store.state.adventure,
    isMobile: (): boolean => screen.width < 760,
    customizationEnabled: (): boolean => store.state.adventure.customizationEnabled,
    displayGraph: function (): boolean {
      return store.state.adventure.dataGraph.display() && this?.adventure.activities.length > 0
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
    layoutSuffix: function (): string {
      if (this.adventure.layoutMode == LayoutMode.PORTRAIT) {
        return '--portrait'
      } else {
        return '--landscape'
      }
    },
    adventureTrackChildrenStyleSuffix: function (): string {
      adjustAllRegisteredElementDimensionsIfNecessary() // to adjust size when graph is added
      return this.displayGraph ? '--with-elevation' : '--without-elevation'
    },
    labels: () =>
      store.state.adventure.labels.filter(
        (label: Label) => label.name.text.length > 0 && label.value.text.length > 0
      )
  },
  data() {
    const rawGpxFiles: string[] = []
    return {
      lastStyleSuffix: '',
      activityMap: ref<InstanceType<typeof ActivityMap>>(),
      rawGpxFiles,
      showConfigurationPanel: true,
      showSaveAdventureDialog: false,
      showGeneratedImageDialog: false,
      isSaving: false,
      lastAdventureTrackClassSuffix: '',
      generatedImageDataURL: '',
      generatedImageThumbnailDataURL: ''
    }
  },
  setup() {
    store = useStore()
    retrieveDefaultMapStyles().then((mapStyles) => store.commit('ADD_MAP_STYLES', mapStyles))
  },
  methods: {
    async capture() {
      this.isSaving = true

      let captureElement = document.getElementById('adventure-track')
      let activityMapRef = this.$refs.activityMap as typeof ActivityMap

      if (captureElement != null && activityMapRef != null) {
        this.showConfigurationPanel = false

        captureElement.style.borderRadius = '0px'

        setHiResDPR(captureElement.getBoundingClientRect())

        activityMapRef.repaintForCapture(() => {
          html2canvas(captureElement!).then((canvas) => {
            console.log(canvas)
            if (canvas.getBoundingClientRect().width > canvas.getBoundingClientRect().height) {
              canvas.style.height = ''
            } else {
              canvas.style.width = ''
            }
            canvas.style.aspectRatio = captureElement!.style.aspectRatio

            this.showGeneratedImageDialog = true

            this.$nextTick(() => {
              this.generatedImageDataURL = generateImageToDownloadDataURL(canvas)
              this.generatedImageThumbnailDataURL =
                this.adventure.layoutMode == LayoutMode.PORTRAIT
                  ? generatePortraitThumbnailDataURL(canvas, 2)
                  : generateLandscapeThumbnailDataURL(canvas, 2)
            })

            setStdResDPR()

            activityMapRef.repaintForCapture()

            captureElement!.style.borderRadius = ''

            this.isSaving = false
            this.showConfigurationPanel = true
          })
        })
      } else {
        alert('Adventure track to save could not be located')
      }
    },
    saveGeneratedImage() {
      FileSaver.saveAs(this.generatedImageDataURL, 'image.png')
      this.closeSaveAdventureDialog()
    },
    async closeSaveAdventureDialog() {
      this.showSaveAdventureDialog = false
      setTimeout(() => {
        this.showGeneratedImageDialog = false
        this.showConfigurationPanel = true
      }, 500)
    },
    resizeMap(recenter?: boolean) {
      let activityMapRef = this.$refs.activityMap as typeof ActivityMap
      activityMapRef.resizeMap(recenter)
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
        this.resizeMap(!this.isSaving) // Do not recenter while capturing adventure
        this.lastStyleSuffix = this.adventureTrackChildrenStyleSuffix
      } else if (this.lastAdventureTrackClassSuffix !== this.adventureTrackClassSuffix) {
        if (!this.isSaving) {
          // Do not recenter while capturing adventure
          this.resizeMap(true)
          store.commit('SET_REFRESH_DATA_GRAPH', true)
          this.lastAdventureTrackClassSuffix = this.adventureTrackClassSuffix
        }
      }
    })
  }
})
</script>

<style scoped>
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
  container-type: size;
  transition: left 0.5s ease;
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
}

.adventure-track-details--without-elevation {
  max-height: calc(25% - 0.5vw * 2);
}

.adventure-track-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* height: 100%; */
  padding-top: 2cqh;

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

.generated-image-container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 80vh;
}

.save-adventure-dialog--portrait,
.save-adventure-dialog--landscape {
  max-width: 50%;
}

.generated-image-dialog--portrait,
.generated-image-dialog--landscape {
  width: 100%;
  height: 100%;
  max-height: 90vh;
}

.centered-dialog-text {
  text-align: center;
}

.mobile-creator {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;

  p {
    width: 50%;
  }
}
</style>

<style>
.v-overlay__content {
  display: flex;
  align-items: center;
}

.generated-image--portrait {
  aspect-ratio: calc(1 / sqrt(2));
  width: calc(80vh * (1 / sqrt(2)));
}

.generated-image--landscape {
  aspect-ratio: sqrt(2);
  width: calc(80vh * sqrt(2));
}

.generated-image--portrait,
.generated-image--landscape {
  display: flex;
  justify-content: center;
}
</style>
