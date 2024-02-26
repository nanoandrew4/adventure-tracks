<template>
  <p
    class="custom-text"
    :style="`color: ${modelValue.color}; font-family: ${modelValue.font}; font-size: ${
      parseInt(modelValue.fontSize) * fontScalingFactor
    }cqw; font-weight: ${modelValue.bold ? 'bold' : 'normal'}; font-style: ${
      modelValue.italic ? 'italic' : 'normal'
    }`"
  >
    {{ text }}
  </p>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import type { CustomTextStyle } from '@/types/CustomTextStyle';

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<CustomTextStyle>,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    fontScalingFactor: {
      type: Number,
      default: 1
    }
  }
})
</script>

<style scoped></style>
