<template>
  <div class="activity-card">
    <div class="activity-details">
      <v-checkbox
        class="activity-checkbox"
        :true-icon="'mdi-toggle-switch'"
        :false-icon="'mdi-toggle-switch-off'"
        :hide-details="true"
        :density="'compact'"
        :label="$t('creator.config-panel.activities-section.activity.use-same-color')"
        v-model:model-value="useSameColor"
      />
      <div v-if="useSameColor">
        <ColorPicker
          :label="$t('creator.config-panel.activities-section.activity.activity-color')"
          :color="activity.lineColor"
          @color-updated="
            (color) =>
              updateActivity(
                (activity: Activity) =>
                  (activity.lineColor = activity.elevationProfileColor = color)
              )
          "
        />
      </div>
      <div v-else>
        <ColorPicker
          :label="$t('creator.config-panel.activities-section.activity.line-color')"
          :color="activity.lineColor"
          @color-updated="
            (color) => updateActivity((activity: Activity) => (activity.lineColor = color))
          "
        />
        <ColorPicker
          :label="$t('creator.config-panel.activities-section.activity.elevation-color')"
          :color="activity.elevationProfileColor"
          @color-updated="
            (color) =>
              updateActivity((activity: Activity) => (activity.elevationProfileColor = color))
          "
        />
      </div>
      <v-btn
        :text="$t('creator.config-panel.activities-section.activity.correct-elevation')"
        :loading="elevationCorrectionInProgress"
        @click="correctElevationAndUpdateRefreshFlag"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import ColorPicker from './ColorPicker.vue'

import { type Activity } from '../../types/Activity'
import { useStore } from '../../vuex/store'
import { Store } from '../../../vuex'
import { correctElevation } from '../../helpers/correctElevation'

let store: Store

export default defineComponent({
  components: {
    ColorPicker
  },
  props: {
    activity: {
      type: Object as PropType<Activity>,
      required: true
    }
  },
  data() {
    return {
      unfolded: false,
      elevationCorrectionInProgress: false,
      useSameColor: false
    }
  },
  setup() {
    store = useStore()
  },
  methods: {
    updateActivity(modifierFunc: (activityToUpdate: Activity) => void) {
      const updatedActivity = this.activity
      modifierFunc(updatedActivity)
      store.commit('SET_ACTIVITY', updatedActivity)
    },
    correctElevationAndUpdateRefreshFlag() {
      const t = this
      t.elevationCorrectionInProgress = true
      correctElevation(this.activity)
        .then((updated) => {
          if (updated) store.commit('SET_REFRESH_DATA_GRAPH', true)
        })
        .finally(() => {
          t.elevationCorrectionInProgress = false
        })
    }
  }
})
</script>

<style>
.activity-checkbox {
  .v-input__control {
    .v-selection-control {
      height: fit-content;
      font-size: 1vw;
      div {
        width: 1.5vw;
      }
      label {
        margin-left: 1vw;
      }
    }
  }
}
</style>
