<template>
  <v-alert
    v-if="!activitiesExist"
    :text="$t('creator.config-panel.data-graph-section.no-activities')"
    type="info"
    variant="tonal"
  />

  <v-checkbox
    :label="$t('creator.config-panel.data-graph-section.show-elevation')"
    hide-details
    :disabled="!activitiesExist"
    v-model="isDataGraphEnabled"
    @update:model-value="
      (display) => updateDataGraph((dataGraph) => (dataGraph.displayElevationProfile = !!display))
    "
  />

  <v-checkbox
    v-if="isDataGraphEnabled"
    :label="$t('creator.config-panel.data-graph-section.show-highest-lowest-points')"
    hide-details
    v-model="dataGraph.displayHighestAndLowestPoints"
    @update:model-value="
      (display) =>
        updateDataGraph((dataGraph) => (dataGraph.displayHighestAndLowestPoints = !!display))
    "
  />

  <CustomizableText
    v-if="isDataGraphEnabled"
    :model-value="dataGraph.graphText"
    :label-prefix="'creator.config-panel.data-graph-section.text'"
    :picker-id="'graphtext'"
    @update:model-value="
      (updatedTextObj) =>
        updateDataGraph((dataGraph: DataGraph) => (dataGraph.graphText = updatedTextObj))
    "
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LayoutMode, type Adventure } from '@/types/Adventure'
import CustomizableText from '@/components/configurator/CustomizableText.vue'

import { useStore } from '@/vuex/store'
import { Store } from '../../../vuex'
import type { DataGraph } from '@/types/DataGraph'

let store: Store

export default defineComponent({
  components: {
    CustomizableText
  },
  computed: {
    activitiesExist: (): boolean => store.state.adventure.activities.length > 0,
    dataGraph: () => store.state.adventure.dataGraph as DataGraph,
    isDataGraphEnabled(): boolean {
      return this.dataGraph.display() && this.activitiesExist
    }
  },
  setup() {
    store = useStore()
  },
  data() {
    return {
      showDisableCustomizationDialog: false,
      LayoutMode
    }
  },
  methods: {
    updateDataGraph(modifierFunc: (dataGraph: DataGraph) => void) {
      const updatedAdventure = store.state.adventure as Adventure
      modifierFunc(updatedAdventure.dataGraph)
      store.commit('SET_ADVENTURE', updatedAdventure)
    }
  }
})
</script>

<style scoped></style>
