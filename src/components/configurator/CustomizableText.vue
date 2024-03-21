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
          v-for="[editMode, props] in modesToShowMap"
          :key="editMode"
          :selected-edit-mode="selectedEditMode"
          :target-edit-mode="editMode"
          :label-suffix="props.labelSuffix"
          :icon="getIconForMode(editMode)"
          @selected="(clickedEditMode) => (selectedEditMode = clickedEditMode)"
        />
      </v-list>
    </v-menu>

    <v-text-field
      v-if="selectedEditMode == EDIT_MODE.TEXT && 'text' in modelValue"
      :model-value="modelValue.text"
      :label="$t(labelPrefix)"
      hide-details
      rounded
      variant="solo"
      @update:model-value="(text) => emitCustomTextUpdate((modelValue) => (modelValue.text = text))"
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
        <v-icon :icon="mdiFormatBold" />
      </v-btn>
      <v-btn @click="() => emitUpdate((modelValue) => (modelValue.italic = !modelValue.italic))">
        <v-icon :icon="mdiFormatItalic"
      /></v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import ColorPicker from './ColorPicker.vue'
import TextEditMode from './TextEditMode.vue'

import type { CustomText } from '@/types/CustomText'
import FontPicker from 'font-picker'
import type { CustomTextStyle } from '@/types/CustomTextStyle'

import {
  mdiFormatBold,
  mdiFormatItalic,
  mdiPalette,
  mdiFormatText,
  mdiFormatSize,
  mdiFormatFont,
  mdiFormatTextVariant
} from '@mdi/js'

const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY

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

const CUSTOM_TEXT_STYLES_MODE_TO_PROPS_MAP = new Map<EDIT_MODE, EditModeProps>([
  [EDIT_MODE.COLOR, { icon: mdiPalette, labelSuffix: 'color' }],
  [EDIT_MODE.FONT, { icon: mdiFormatText, labelSuffix: 'font' }],
  [EDIT_MODE.FONT_SIZE, { icon: mdiFormatSize, labelSuffix: 'font-size' }],
  [EDIT_MODE.FONT_STYLE, { icon: mdiFormatFont, labelSuffix: 'font-style' }]
])

const CUSTOM_TEXT_MODE_TO_PROPS_MAP = new Map<EDIT_MODE, EditModeProps>(
  CUSTOM_TEXT_STYLES_MODE_TO_PROPS_MAP
)
CUSTOM_TEXT_MODE_TO_PROPS_MAP.set(EDIT_MODE.TEXT, {
  icon: mdiFormatTextVariant,
  labelSuffix: 'text'
})

export default defineComponent({
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Object as PropType<CustomText | CustomTextStyle>,
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
      selectedEditMode: this.isCustomText() ? EDIT_MODE.TEXT : EDIT_MODE.COLOR,
      EDIT_MODE,
      modesToShowMap: this.isCustomText()
        ? CUSTOM_TEXT_MODE_TO_PROPS_MAP
        : CUSTOM_TEXT_STYLES_MODE_TO_PROPS_MAP,
      mdiFormatBold,
      mdiFormatItalic
    }
  },
  methods: {
    getIconForMode(mode: EDIT_MODE): string {
      return this.modesToShowMap.get(mode)!.icon
    },
    emitUpdate(fn: (updatedModel: CustomText | CustomTextStyle) => void) {
      const modelValue = this.modelValue
      fn(modelValue)
      this.$emit('update:modelValue', modelValue)
    },
    emitCustomTextUpdate(fn: (updatedModel: CustomText) => void) {
      const modelValue = this.modelValue as CustomText
      fn(modelValue)
      this.$emit('update:modelValue', modelValue)
    },
    isCustomText(): boolean {
      return 'text' in this.modelValue
    }
  },
  watch: {
    selectedEditMode(newEditMode: number) {
      if (newEditMode === EDIT_MODE.FONT) {
        const t = this
        const fontPicker = new FontPicker(apiKey, this.modelValue.font, {
          pickerId: this.pickerId,
          limit: 300
        })
        fontPicker.setOnChange((font) => {
          t.emitUpdate(
            (updatedModel: CustomText | CustomTextStyle) => (updatedModel.font = font.family)
          )
        })
      }
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
    background-color: rgb(var(--v-theme-surface)) !important;
  }

  button {
    border-radius: 100vw;
    background-color: rgb(var(--v-theme-surface-light-bluish)) !important;

    .dropdown-icon::before {
      border-top: 6px solid rgb(var(--v-theme-text)) !important;
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
    }
  }
}
</style>
