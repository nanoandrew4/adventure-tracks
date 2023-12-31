<template>
  <v-text-field
    v-model="adventure.mainText"
    label="Main text"
    hide-details
    rounded
    variant="solo"
    @update:model-value="
      (text) => updateAdventure((adventure: Adventure) => (adventure.mainText = text))
    "
  />

  <v-text-field
    v-model="adventure.secondaryText"
    label="Secondary text"
    hide-details
    rounded
    variant="solo"
    @update:model-value="
      (text) => updateAdventure((adventure: Adventure) => (adventure.secondaryText = text))
    "
  />

  <ColorPicker
    :label="$t('creator.config-panel.adventure-section.background-color')"
    :color="adventure.backgroundColor"
    @color-updated="
      (color) => updateAdventure((adventure: Adventure) => (adventure.backgroundColor = color))
    "
  />

  <ColorPicker
    :label="$t('creator.config-panel.adventure-section.main-text-color')"
    :color="adventure.mainTextColor"
    @color-updated="
      (color) => updateAdventure((adventure: Adventure) => (adventure.mainTextColor = color))
    "
  />

  <ColorPicker
    :label="$t('creator.config-panel.adventure-section.secondary-text-color')"
    :color="adventure.secondaryTextColor"
    @color-updated="
      (color) => updateAdventure((adventure: Adventure) => (adventure.secondaryTextColor = color))
    "
  />

  <v-checkbox
    :label="$t('creator.config-panel.adventure-section.show-elevation')"
    hide-details
    v-model="adventure.displayElevationProfile"
    @update:model-value="
      (display) => updateAdventure((adventure) => (adventure.displayElevationProfile = display))
    "
  />

  <v-text-field
    class="text-field"
    :label="$t('creator.config-panel.adventure-section.line-width')"
    hide-details
    rounded
    type="number"
    variant="solo"
    oninput="if(this.value < 0) this.value = 0"
    v-model="adventure.lineWidth"
    @update:model-value="(lineWidth) => updateAdventureLineWidth(lineWidth)"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { type Adventure } from '@/types/Adventure.type'
import ColorPicker from './ColorPicker.vue'

import { useStore } from '@/vuex/store'
import { Store } from '../../../vuex'

let store: Store

export default defineComponent({
  components: {
    ColorPicker
  },
  computed: {
    adventure: () => store.state.adventure
  },
  setup() {
    store = useStore()
  },
  methods: {
    updateAdventure(modifierFunc: (adventureToUpdate: Adventure) => void) {
      const updatedAdventure = this.adventure
      modifierFunc(updatedAdventure)
      store.commit('SET_ADVENTURE', updatedAdventure)
    },
    updateAdventureLineWidth(lineWidthStr: string) {
      const updatedAdventure = this.adventure
      const lineWidth = Number(lineWidthStr)
      updatedAdventure.lineWidth = lineWidth >= 0 ? lineWidth : 0
      store.commit('SET_ADVENTURE', updatedAdventure)
    }
  }
})
</script>

<style scoped>
.text-field {
  width: 10vw;
}
</style>
