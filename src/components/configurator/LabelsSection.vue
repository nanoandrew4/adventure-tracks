<template>
  <div class="labels-section">
    <div
      class="label-container"
      :key="idx"
      v-for="(label, idx) in labels"
    >
      <v-text-field
        v-model="label.name"
        class="text-field"
        :label="$t('creator.config-panel.labels-section.label-name')"
        hide-details
        rounded
        variant="solo"
        @update:model-value="(text) => updateLabelName(idx, text)"
      />

      <v-text-field
        v-model="label.value"
        class="text-field"
        :label="$t('creator.config-panel.labels-section.label-value')"
        hide-details
        rounded
        variant="solo"
        @update:model-value="(text) => updateLabelValue(idx, text)"
      />
      <v-icon
          class="configurator-activity-delete"
          icon="mdi-delete"
          @click.stop="deleteLabel(idx)"
        />
    </div>

    <v-btn
      :text="$t('creator.config-panel.labels-section.add-label')"
      @click="addEmptyLabel"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useStore } from '@/vuex/store'
import { Store } from '../../../vuex'

let store: Store

export default defineComponent({
  computed: {
    adventure: () => store.state.adventure,
    labels: () => store.state.adventure.labels
  },
  setup() {
    store = useStore()
  },
  methods: {
    addEmptyLabel() {
      const updatedAdventure = this.adventure
      updatedAdventure.labels.push({ name: '', value: '' })
      store.commit('SET_ADVENTURE', updatedAdventure)
    },
    updateLabelName(idx: number, newName: string) {
      const updatedAdventure = this.adventure
      updatedAdventure.labels[idx].name = newName
      store.commit('SET_ADVENTURE', updatedAdventure)
    },
    updateLabelValue(idx: number, newValue: string) {
      const updatedAdventure = this.adventure
      updatedAdventure.labels[idx].value = newValue
      store.commit('SET_ADVENTURE', updatedAdventure)
    },
    deleteLabel(idxToDelete: number) {
      const updatedAdventure = this.adventure
      updatedAdventure.labels.splice(idxToDelete, 1)
      store.commit('SET_ADVENTURE', updatedAdventure)
    }
  }
})
</script>

<style scoped>
.labels-section {
  display: flex;
  flex-direction: column;
}

.label-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1vh;
}

.label-container * {
  margin: 0 0.25vw 0 0.25vw;
}

.text-field {
  width: 50%;
}
</style>
