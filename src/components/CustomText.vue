<template>
  <p
    class="custom-text"
    :style="`color: ${modelValue.color}; font-family: ${modelValue.font}; font-size: ${
      modelValue.fontSize
    }cqw; font-weight: ${modelValue.bold ? 'bold' : 'normal'}; font-style: ${
      modelValue.italic ? 'italic' : 'normal'
    }`"
  >
    {{ modelValue.text }}
  </p>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import type { CustomText } from '@/types/CustomText'

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<CustomText>,
      required: true
    }
  }
})
</script>

<style scoped></style>
