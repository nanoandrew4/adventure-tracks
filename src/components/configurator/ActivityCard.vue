<template>
  <div class="activity-card">
    <div class="activity-details">
      <ColorPicker
        :label="$t('creator.config-panel.activity.line-color')"
        :color="activity.lineColor"
        @color-updated="
          (color) => updateActivity((activity: Activity) => (activity.lineColor = color))
        "
      />
      <ColorPicker
        :label="$t('creator.config-panel.activity.elevation-color')"
        :color="activity.elevationProfileColor"
        @color-updated="
          (color) =>
            updateActivity((activity: Activity) => (activity.elevationProfileColor = color))
        "
      />
      <v-btn
        :text="$t('creator.config-panel.activity.correct-elevation')"
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
      elevationCorrectionInProgress: false
    }
  },
  setup() {
    store = useStore()
  },
  methods: {
    updateActivity(modifierFunc: (activityToUpdate: Activity) => void) {
      const updatedActivity = this.activity
      modifierFunc(updatedActivity)
      store.commit('UPDATE_ACTIVITY', updatedActivity)
    },
    correctElevationAndUpdateRefreshFlag() {
      const t = this
      t.elevationCorrectionInProgress = true
      correctElevation(this.activity).then((updated) => {
        if (updated) store.commit('UPDATE_REFRESH_DATA_GRAPH', true)
      }).finally(() => {
        t.elevationCorrectionInProgress = false
      })
    }
  }
})
</script>

<style></style>
