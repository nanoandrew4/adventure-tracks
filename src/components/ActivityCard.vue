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
        @color-updated="(color) => updateLineColor(color)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import ColorPicker from './ColorPicker.vue'

import { constants } from '../constants/constants'
import { type Activity } from '../types/Activity.type'
import { GeoPoint } from '../types/GeoPoint'
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
      lineColor: this.activity.lineColor,
      elevationColor: this.activity.elevationProfileColor
    }
  },
  setup(props) {
    store = useStore()
  },
  methods: {
    updateLineColor(color: string) {
        const updatedActivity = this.activity
        updatedActivity.lineColor = color
        store.commit('UPDATE_ACTIVITY', updatedActivity)
    }
  }
})
</script>

<style></style>
