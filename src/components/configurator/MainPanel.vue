<template>
  <div class="configurator">
    <v-expansion-panels
      theme="dark"
      variant="accordion"
    >
      <v-expansion-panel class="configurator-section-header">
        <!-- <v-expansion-panel-title expand-icon="mdi-chevron-down" collapse-icon="mdi-chevron-up"> -->
        <v-expansion-panel-title>
          {{ $t('creator.config-panel.activities') }}
          <template v-slot:actions="{ expanded }">
            <v-progress-circular
              v-if="processedActivitiesRatio > 0 && processedActivitiesRatio < 100"
              :model-value="processedActivitiesRatio"
            />
            <v-icon
              v-else-if="activityLoadCompletedSuccessfully"
              icon="mdi-check-circle"
              color="green"
            />
            <v-tooltip
              v-else-if="activityLoadCompletedWithErrors"
              :close-delay="500"
              width="20vw"
              :text="
                $t('creator.config-panel.activities-section.file-errors', {
                  files: filesWithErrors
                })
              "
            >
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-alert-circle-outline"
                  color="red"
                  @click.stop="activityLoadCompletedWithErrors = false"
                />
              </template>
            </v-tooltip>
            <v-icon
              v-else
              :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            ></v-icon>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <ActivitiesSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        class="configurator-section-header"
        :title="$t('creator.config-panel.map-styles')"
      >
        <v-expansion-panel-text>
          <div class="d-flex">
            <MapStyleView
              :key="mapStyle.name"
              v-for="mapStyle in defaultMapStyles"
              :map-style="mapStyle"
            />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        class="configurator-section-header"
        :title="$t('creator.config-panel.adventure')"
      >
        <v-expansion-panel-text>
          <AdventureSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-btn
      class="configurator-save-btn"
      :text="$t('creator.config-panel.save')"
      @click="$emit('capture')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ActivitiesSection from './ActivitiesSection.vue'
import AdventureSection from './AdventureSection.vue'
import MapStyleView from './MapStyleView.vue'
import { Store } from 'vuex'
import { useStore, type State } from '../../vuex/store'
import { retrieveDefaultMapStyles } from '../../helpers/retrieveDefaultMapStyles'
import type { MapStyle } from '@/types/MapStyle'

let store: Store
let state: State

export default defineComponent({
  computed: {
    filesWithErrors(): string {
      if (!state.activitiesLoadProgress) return ''
      return state.activitiesLoadProgress.filesWithErrors.join(', ')
    },
    processedActivitiesRatio(): number {
      if (!state.activitiesLoadProgress) return -1
      return (
        (state.activitiesLoadProgress.numOfActivitiesProcessed /
          state.activitiesLoadProgress.numOfActivitiesToLoad) *
        100
      )
    }
  },
  components: {
    ActivitiesSection,
    AdventureSection,
    MapStyleView
  },
  setup() {
    store = useStore()
    state = store.state
  },
  data() {
    const defaultMapStyles: MapStyle[] = []
    return {
      activityLoadCompletedSuccessfully: false,
      activityLoadCompletedWithErrors: false,
      defaultMapStyles
    }
  },
  mounted() {
    const t = this
    retrieveDefaultMapStyles().then((mapStyles) => (t.defaultMapStyles = mapStyles))
  },
  watch: {
    processedActivitiesRatio(newRatio: number) {
      const t = this
      if (newRatio === 100) {
        if (state.activitiesLoadProgress?.filesWithErrors.length == 0) {
          this.activityLoadCompletedSuccessfully = true
          setTimeout(() => {
            t.activityLoadCompletedSuccessfully = false
          }, 5000)
        } else if (state.activitiesLoadProgress!.filesWithErrors.length > 0) {
          this.activityLoadCompletedWithErrors = true
        }
      }
    }
  }
})
</script>

<style>
.configurator {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  margin-left: 1em;
}

.configurator-section-header {
  & > button {
    font-size: 1.5em;
  }
}

.map-styles-container {
  display: flex;
}

.configurator-save-btn {
  margin-top: 1vw;
  width: 80%;
  color: black;
}
</style>
