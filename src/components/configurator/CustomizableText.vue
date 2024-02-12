<template>
  <div class="customizable-text-container">
    <v-menu open-on-hover>
      <template v-slot:activator="{ props }">
        <v-icon
          class="active-mode"
          v-bind="props"
          :icon="getIconForMode(selectedEditMode)"
        />
      </template>

      <v-list class="customizable-text-menu-list">
        <TextEditMode
          v-for="[editMode, props] in MODE_TO_PROPS_MAP"
          :key="editMode"
          :selected-edit-mode="selectedEditMode"
          :target-edit-mode="editMode"
          :label-suffix="props.labelSuffix"
          @selected="(clickedEditMode) => (selectedEditMode = clickedEditMode)"
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

    <v-text-field
      v-if="selectedEditMode == EDIT_MODE.FONT_SIZE"
      :model-value="modelValue.fontSize"
      :label="$t('creator.config-panel.customizable-text.font-size')"
      hide-details
      rounded
      type="number"
      variant="solo"
      @update:model-value="
        (fontSize) => emitUpdate((modelValue) => (modelValue.fontSize = fontSize))
      "
    />

    <div v-show="selectedEditMode == EDIT_MODE.FONT_STYLE">
      <v-btn @click="() => emitUpdate((modelValue) => (modelValue.bold = !modelValue.bold))">
        <v-icon icon="mdi-format-bold" />
      </v-btn>
      <v-btn @click="() => emitUpdate((modelValue) => (modelValue.italic = !modelValue.italic))">
        <v-icon icon="mdi-format-italic"
      /></v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import ColorPicker from './ColorPicker.vue'
import TextEditMode from './TextEditMode.vue'

import type { CustomText } from '@/types/CustomText'
import { getCachedPicker } from '@/helpers/fontPickerCache'

export enum EDIT_MODE {
  TEXT,
  COLOR,
  FONT,
  FONT_SIZE,
  FONT_STYLE
}

export interface EditModeProps {
  icon: string
  labelSuffix: string
}

export const MODE_TO_PROPS_MAP = new Map<EDIT_MODE, EditModeProps>([
  [EDIT_MODE.TEXT, { icon: 'mdi-format-text-variant', labelSuffix: 'text' }],
  [EDIT_MODE.COLOR, { icon: 'mdi-palette', labelSuffix: 'color' }],
  [EDIT_MODE.FONT, { icon: 'mdi-format-text', labelSuffix: 'font' }],
  [EDIT_MODE.FONT_SIZE, { icon: 'mdi-format-size', labelSuffix: 'font-size' }],
  [EDIT_MODE.FONT_STYLE, { icon: 'mdi-format-font', labelSuffix: 'font-style' }]
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
    ColorPicker,
    TextEditMode
  },
  data() {
    return {
      modifiableCustomText: this.customText,
      selectedEditMode: EDIT_MODE.TEXT,
      EDIT_MODE,
      MODE_TO_PROPS_MAP
    }
  },
  mounted() {
    const t = this
    const fontPicker = getCachedPicker(this.pickerId)
    fontPicker.setOnChange((font) => {
      t.emitUpdate((updatedModel: CustomText) => (updatedModel.font = font.family))
    })
  },
  methods: {
    getIconForMode(mode: EDIT_MODE): string | undefined {
      return MODE_TO_PROPS_MAP.get(mode)?.icon
    },
    emitUpdate(fn: (updatedModel: CustomText) => void) {
      const modelValue = this.modelValue
      fn(modelValue)
      this.$emit('update:modelValue', modelValue)
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
  display: flex;
  margin: 0 0.5vw 0 0.5vw;
  flex-direction: row;
  cursor: pointer;

  p {
    margin-left: 0.5vw;
  }
}

.customizable-text-menu-list-element:not(:first-child) {
  margin-top: 0.5vh;
}

.active-mode {
  margin-right: 0.5vw;
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
