<template>
  <CustomizableText
    :model-value="adventure.mainText"
    :label-prefix="'creator.config-panel.adventure-section.main-text'"
    :picker-id="'maintext'"
    @update:model-value="
      (updatedTextObj) =>
        updateAdventure((adventure: Adventure) => (adventure.mainText = updatedTextObj))
    "
  />

  <CustomizableText
    :model-value="adventure.secondaryText"
    :label-prefix="'creator.config-panel.adventure-section.secondary-text'"
    :picker-id="'secondarytext'"
    @update:model-value="
      (updatedTextObj) =>
        updateAdventure((adventure: Adventure) => (adventure.secondaryText = updatedTextObj))
    "
  />

  <ColorPicker
    :label="$t('creator.config-panel.adventure-section.background-color')"
    :color="adventure.backgroundColor"
    @color-updated="
      (color) => updateAdventure((adventure: Adventure) => (adventure.backgroundColor = color))
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

  <v-checkbox
    :label="$t('creator.config-panel.adventure-section.enable-customization')"
    hide-details
    v-model="adventure.customizationEnabled"
    @click="() => (showDisableCustomizationDialog = adventure.customizationEnabled)"
    @update:model-value="
      (enable) =>
        updateAdventure((adventure) => {
          if (!adventure.customizationEnabled) {
            showDisableCustomizationDialog = true
          }
          adventure.customizationEnabled = true
        })
    "
  />

  <v-dialog
    width="500"
    v-model="showDisableCustomizationDialog"
  >
    <v-card>
      <v-card-text>
        {{ $t('creator.config-panel.adventure-section.disable-customization-dialog.text') }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          :text="$t('creator.config-panel.adventure-section.disable-customization-dialog.cancel')"
          @click="
            () => {
              showDisableCustomizationDialog = false
              adventure.customizationEnabled = true
            }
          "
        />
        <v-btn
          :text="$t('creator.config-panel.adventure-section.disable-customization-dialog.confirm')"
          @click="
            () => {
              showDisableCustomizationDialog = false
              adventure.customizationEnabled = false
            }
          "
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

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
import { type Adventure } from '@/types/Adventure'
import ColorPicker from './ColorPicker.vue'
import CustomizableText from './CustomizableText.vue'

import { useStore } from '@/vuex/store'
import { Store } from '../../../vuex'

let store: Store

export default defineComponent({
  components: {
    ColorPicker,
    CustomizableText
  },
  computed: {
    adventure: () => store.state.adventure
  },
  setup() {
    store = useStore()
  },
  data() {
    return {
      showDisableCustomizationDialog: false
    }
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
