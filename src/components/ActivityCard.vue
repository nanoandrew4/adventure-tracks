<template>
  <div class="activity-card">
    <h3 @click="unfolded = !unfolded">{{ activity.name }}</h3>
    <div
      v-if="unfolded"
      class="activity-details"
    >
      <ColorPicker
        :label="$t('creator.config-panel.activity.line-color')"
        :initial-color="activity.lineColor"
        @color-updated="
          (color) => updateActivity((activity: Activity) => (activity.lineColor = color))
        "
      />
      <ColorPicker
        :label="$t('creator.config-panel.activity.elevation-color')"
        :initial-color="activity.elevationProfileColor"
        @color-updated="
          (color) =>
            updateActivity((activity: Activity) => (activity.elevationProfileColor = color))
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import ColorPicker from './ColorPicker.vue'

import { type Activity } from '../types/Activity.type'
import { useStore } from '../vuex/store'
import { Store } from '../../vuex'

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
    }
  }
})
</script>

<style></style>
