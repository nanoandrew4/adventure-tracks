<template>
  <div :class="show ? 'configurator' : 'configurator configurator--hidden'">
    <div class="title">
      <h2>{{ $t('creator.config-panel.title') }}</h2>
      <v-icon
        class="configurator-hide"
        :icon="mdiArrowCollapseRight"
        @click.stop="$emit('change-visibility')"
      />
    </div>
    <v-expansion-panels variant="accordion">
      <v-expansion-panel class="configurator-section-header">
        <v-expansion-panel-title>
          {{ $t('creator.config-panel.activities') }}
          <template v-slot:actions="{ expanded }">
            <v-progress-circular
              v-if="processedActivitiesRatio > 0 && processedActivitiesRatio < 100"
              :model-value="processedActivitiesRatio"
            />
            <v-icon
              v-else-if="activityLoadCompletedSuccessfully"
              :icon="mdiCheckCircle"
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
                  :icon="mdiAlertCircleOutline"
                  color="red"
                  @click.stop="activityLoadCompletedWithErrors = false"
                />
              </template>
            </v-tooltip>
            <v-icon
              v-else
              :icon="expanded ? mdiChevronUp : mdiChevronDown"
            ></v-icon>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <ActivitiesSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        class="configurator-section-header"
        :title="$t('creator.config-panel.map')"
      >
        <v-expansion-panel-text>
          <MapSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        class="configurator-section-header"
        :title="$t('creator.config-panel.data-graph')"
      >
        <v-expansion-panel-text>
          <DataGraphSection />
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
      <v-expansion-panel
        class="configurator-section-header"
        :title="$t('creator.config-panel.labels')"
      >
        <v-expansion-panel-text>
          <LabelsSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-btn
      class="configurator-save-btn"
      :text="$t('creator.config-panel.save')"
      @click="$emit('capture')"
    />
    <v-btn
      color="surface-light"
      class="configurator-reset-btn"
      :text="$t('creator.config-panel.reset')"
      @click="$emit('reset')"
    />
  </div>
  <div
    :class="!show ? 'show-configurator-btn' : 'show-configurator-btn--hidden'"
    @click.stop="$emit('change-visibility')"
  >
    <v-icon
      class="configurator-hide"
      :icon="mdiCog"
      @click.stop="$emit('change-visibility')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ActivitiesSection from './ActivitiesSection.vue'
import LabelsSection from './LabelsSection.vue'
import AdventureSection from './AdventureSection.vue'
import DataGraphSection from './DataGraphSection.vue'
import MapSection from './map/MapSection.vue'
import { Store } from 'vuex'
import { useStore, type State } from '../../vuex/store'

import { mdiCog, mdiChevronUp, mdiChevronDown, mdiAlertCircleOutline, mdiCheckCircle, mdiArrowCollapseRight } from '@mdi/js'

let store: Store
let state: State

export default defineComponent({
  emits: ['capture', 'reset', 'change-visibility'],
  computed: {
    filesWithErrors(): string {
      if (!state.activitiesLoadProgress) return ''
      return [...state.activitiesLoadProgress.filesWithErrors].join(', ')
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
    LabelsSection,
    MapSection,
    DataGraphSection
  },
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    store = useStore()
    state = store.state
  },
  data() {
    return {
      activityLoadCompletedSuccessfully: false,
      activityLoadCompletedWithErrors: false,
      mdiCog,
      mdiChevronUp,
      mdiChevronDown,
      mdiAlertCircleOutline,
      mdiCheckCircle,
      mdiArrowCollapseRight
    }
  },
  watch: {
    processedActivitiesRatio(newRatio: number) {
      const t = this
      if (newRatio === 100) {
        if (state.activitiesLoadProgress?.filesWithErrors.size == 0) {
          this.activityLoadCompletedSuccessfully = true
          setTimeout(() => {
            t.activityLoadCompletedSuccessfully = false
          }, 5000)
        } else if (state.activitiesLoadProgress!.filesWithErrors.size > 0) {
          this.activityLoadCompletedWithErrors = true
        }
      }
    }
  }
})
</script>

<style>
.configurator {
  position: absolute;
  right: 0;
  top: 0;
  width: calc(25% - 1rem);
  height: 90vh;
  transition: right 0.5s ease;

  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    h2 {
      text-align: center;
    }
    .configurator-hide {
      position: absolute;
      right: 1%;
      top: 4px;
      font-size: x-large;
    }
  }
}

.configurator--hidden {
  right: -30%;
}

.show-configurator-btn,
.show-configurator-btn--hidden {
  position: fixed;
  top: calc(-3.5vh);
  transition: right 0.5s 0.25s ease;

  display: flex;
  flex-direction: column;
  align-items: end;

  p {
    writing-mode: vertical-lr;
    text-wrap: nowrap;
    border: 2px solid white;
    padding: 8px 2px 8px 2px;
    border-radius: 1vw;
  }

  .configurator-show-btn {
    font-size: large;
  }
}

.show-configurator-btn {
  right: 0;
}

.show-configurator-btn--hidden {
  right: calc(-32px * 2);
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
  margin-top: 2vh;
  width: 80%;
}

.configurator-reset-btn {
  margin-top: 1vh;
  width: 80%;
}
</style>
