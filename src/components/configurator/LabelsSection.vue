<template>
  <div class="labels-section">
    <div
      class="label-container"
      :key="idx"
      v-for="(label, idx) in labels"
    >
      <CustomizableText
        class="text-field"
        :model-value="label.name"
        :label-prefix="'creator.config-panel.labels-section.label-name'"
        :picker-id="`labelname${idx}`"
        @update:model-value="(text: any) => updateLabelName(idx, text)"
      />

      <CustomizableText
        class="text-field"
        :model-value="label.value"
        :label-prefix="'creator.config-panel.labels-section.label-value'"
        :picker-id="`labelvalue${idx}`"
        @update:model-value="(text: any) => updateLabelValue(idx, text)"
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
import { createEmptyLabel } from '@/types/Label'
import { Store } from '../../../vuex'
import type { CustomText } from '@/types/CustomText'
import CustomizableText from '@/components/configurator/CustomizableText.vue'
import type { Adventure } from '@/types/Adventure'

let store: Store

export default defineComponent({
  components: {
    CustomizableText
  },
  computed: {
    adventure: () => store.state.adventure as Adventure,
    labels: () => store.state.adventure.labels
  },
  setup() {
    store = useStore()
  },
  methods: {
    addEmptyLabel() {
      const updatedAdventure = this.adventure
      updatedAdventure.labels.push(createEmptyLabel(this.adventure.mainText.font))
      store.commit('SET_ADVENTURE', updatedAdventure)
    },
    updateLabelName(idx: number, newName: CustomText) {
      const updatedAdventure = this.adventure
      updatedAdventure.labels[idx].name = newName
      store.commit('SET_ADVENTURE', updatedAdventure)
    },
    updateLabelValue(idx: number, newValue: CustomText) {
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
