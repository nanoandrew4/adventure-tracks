<template>
  <div class="customizable-text-container">
    <v-menu open-on-hover>
      <template v-slot:activator="{ props }">
        <v-icon
          class="active-mode"
          v-bind="props"
          :icon="getIconForCurrentlySelectedMode()"
        />
      </template>

      <v-list class="customizable-text-menu-list">
        <v-icon
          v-if="selectedEditMode != EDIT_MODE.TEXT"
          @click="selectedEditMode = EDIT_MODE.TEXT"
          icon="mdi-format-text-variant"
          class="customizable-text-menu-list-element"
        />
        <v-icon
          v-if="selectedEditMode != EDIT_MODE.COLOR"
          @click="selectedEditMode = EDIT_MODE.COLOR"
          icon="mdi-palette"
          class="customizable-text-menu-list-element"
        />
        <v-icon
          v-if="selectedEditMode != EDIT_MODE.FONT"
          @click="selectedEditMode = EDIT_MODE.FONT"
          icon="mdi-format-font"
          class="customizable-text-menu-list-element"
        />
      </v-list>
    </v-menu>

    <v-text-field
      v-if="selectedEditMode == EDIT_MODE.TEXT"
      :model-value="modelValue.text"
      :label="$t(labelPrefix)"
      hide-details
      rounded
      variant="solo"
      @update:model-value="(text) => emitUpdate((modelValue) => (modelValue.text = text))"
    />

    <ColorPicker
      v-if="selectedEditMode == EDIT_MODE.COLOR"
      :label="$t(labelPrefix + '-color')"
      :color="modelValue.color"
      @color-updated="(color) => emitUpdate((modelValue) => (modelValue.color = color))"
    />

    <div
      v-show="selectedEditMode == EDIT_MODE.FONT"
      :id="`font-picker-${pickerId}`"
      class="font-picker"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import FontPicker from 'font-picker'
import ColorPicker from './ColorPicker.vue'
const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY

import type { CustomText } from '@/types/CustomText'

enum EDIT_MODE {
  TEXT,
  COLOR,
  FONT
}

const modeToIconMap = new Map<EDIT_MODE, string>([
  [EDIT_MODE.TEXT, 'mdi-format-text-variant'],
  [EDIT_MODE.COLOR, 'mdi-palette'],
  [EDIT_MODE.FONT, 'mdi-format-font']
])

export default defineComponent({
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Object as PropType<CustomText>,
      required: true
    },
    labelPrefix: {
      type: String,
      required: true
    },
    pickerId: {
      type: String,
      required: true
    }
  },
  components: {
    ColorPicker
  },
  data() {
    return {
      modifiableCustomText: this.customText,
      selectedEditMode: EDIT_MODE.TEXT,
      EDIT_MODE
    }
  },
  mounted() {
    const t = this
    const fontPicker = new FontPicker(apiKey, 'Open Sans', { pickerId: this.pickerId })
    fontPicker.setOnChange((font) => {
      t.emitUpdate((updatedModel: CustomText) => (updatedModel.font = font.family))
    })
  },
  methods: {
    emitUpdate(fn: (updatedModel: CustomText) => void) {
      const modelValue = this.modelValue
      fn(modelValue)
      this.$emit('update:modelValue', modelValue)
    },
    getIconForCurrentlySelectedMode(): string | undefined {
      return modeToIconMap.get(this.selectedEditMode)
    }
  }
})
</script>

<style scoped>
.text-field {
  width: 10vw;
}

.customizable-text-container {
  display: flex;
  flex-direction: row;
  align-items: center;

  margin: 0.5vh 0 0.5vh 0;
}

.customizable-text-menu-list-element {
  display: block;
}

.active-mode {
  margin-right: 1vw;
}
</style>

<style>
.font-picker {
  border-radius: 100vw;
  width: 100% !important;
  ul {
    background-color: var(--color-background-soft) !important;
  }

  button {
    border-radius: 100vw;
    background-color: var(--color-background-soft) !important;

    .dropdown-icon::before {
      border-top: 6px solid var(--color-text) !important;
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
    }
  }
}
</style>
