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
        id="adventure-track-details"
        :class="`adventure-track-details adventure-track-details${adventureTrackChildrenStyleSuffix}`"
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
          <v-tooltip
            v-if="customizationEnabled && showCustomTooltip"
            activator="parent"
            location="top"
          >
            {{ $t('creator.draggable-instructions') }}</v-tooltip
          >
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
          <v-tooltip
            v-if="customizationEnabled && showCustomTooltip"
            activator="parent"
            location="top"
          >
            {{ $t('creator.draggable-instructions') }}</v-tooltip
          >
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
      @reset="showResetDialog = true"
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
    <v-dialog
      v-model="showResetDialog"
      width="fit-content"
      height="fit-content"
    >
      <v-card class="reset-adventure-dialog">
        <v-card-text>
          {{ $t('creator.config-panel.reset-adventure.text') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :text="$t('creator.config-panel.reset-adventure.cancel')"
            @click="showResetDialog=false"
          />
          <v-btn
            :text="$t('creator.config-panel.reset-adventure.confirm')"
            @click="resetAdventure"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="showSnackbar"
      color="red"
      rounded
      multi-line
      close-on-content-click
    >
      {{ snackbarMessage.length ? $t(snackbarMessage) : '' }}
    </v-snackbar>
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
  adjustMapSizeToFitDetails,
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
import invert from 'invert-color'
import { buildSampleAdventure } from '@/helpers/buildSampleAdventure'

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
    showCustomTooltip: () => store.state.showCustomTooltip,
    snackbarMessage: (): string => store.state.snackbarMessage,
    defaultStyleFonts: (): string[] =>
      [...store.state.mapStyles]
        .map((style: MapStyle) => style.mainTextFont)
        .filter((f: any) => f !== undefined) as string[],
    adventure: (): Adventure => store.state.adventure,
    adventureBackgroundColor: () => store.state.adventure.backgroundColor,
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
      ),
    mainText: () => store.state.adventure.mainText,
    secondaryText: () => store.state.adventure.secondaryText
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
      showResetDialog: false,
      isSaving: false,
      lastAdventureTrackClassSuffix: '',
      generatedImageDataURL: '',
      generatedImageThumbnailDataURL: '',
      showSnackbar: false
    }
  },
  setup() {
    store = useStore()
    if (!store.state.mapStyles || store.state.mapStyles.size === 0) {
      retrieveDefaultMapStyles().then((mapStyles) => store.commit('ADD_MAP_STYLES', mapStyles))
    }
  },
  mounted() {
    this.setInvertedAdventureBackgroundColor()
  },
  methods: {
    async capture() {
      this.isSaving = true

      let captureElement = document.getElementById('adventure-track')
      let activityMapRef = this.$refs.activityMap as typeof ActivityMap

      if (captureElement != null && activityMapRef != null) {
        this.showConfigurationPanel = false

        captureElement.style.borderRadius = '0px'
        const originalMapboxAttributionFontSize = document.documentElement.style.getPropertyValue(
          '--mapbox-attribution-font-size'
        )
        document.documentElement.style.setProperty('--mapbox-attribution-font-size', '8px')

        setHiResDPR(captureElement.getBoundingClientRect())

        activityMapRef.repaintForCapture(() => {
          html2canvas(captureElement!, {
            width: captureElement?.getBoundingClientRect().width,
            height: captureElement?.getBoundingClientRect().height
          }).then((canvas) => {
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
            document.documentElement.style.setProperty(
              '--mapbox-attribution-font-size',
              originalMapboxAttributionFontSize
            )

            this.isSaving = false
            this.showConfigurationPanel = true
          })
        })
      } else {
        alert('Adventure track to save could not be located')
      }
    },
    resetAdventure() {
      store.commit('SET_ADVENTURE', buildSampleAdventure())
      this.showResetDialog = false
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
    },
    setInvertedAdventureBackgroundColor() {
      document.documentElement.style.setProperty(
        '--adventure-background-color',
        this.adventureBackgroundColor
      )
      document.documentElement.style.setProperty(
        '--inverted-adventure-background-color',
        invert(this.adventureBackgroundColor)
      )
    }
  },
  watch: {
    customizationEnabled(enabled: boolean) {
      if (enabled) {
        registerResizableTaggedElements()
        registerDraggableTaggedElements(store)
      } else {
        unregisterAllResizableElements()
        unregisterAllDraggableElements()
        this.resizeMap()
      }
    },
    snackbarMessage(newMessage: string) {
      if (newMessage.length > 0) {
        this.showSnackbar = true
        setTimeout(() => {
          this.showSnackbar = false
          store.commit('SET_SNACKBAR_MESSAGE', '')
        }, 5500) // snackbar stays open 5000ms by default
      }
    },
    mainText: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          adjustMapSizeToFitDetails(store)
        })
      }
    },
    secondaryText: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          adjustMapSizeToFitDetails(store)
        })
      }
    },
    adventureBackgroundColor(newVal: string) {
      this.setInvertedAdventureBackgroundColor()
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

/* .adventure-track-details--with-elevation {
  max-height: calc(30% - 0.5vw * 2);
}

.adventure-track-details--without-elevation {
  max-height: calc(25% - 0.5vw * 2);
} */

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

.reset-adventure-dialog {
  max-width: 50%;
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
