<template>
  <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
  />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="true"
  />
  <link
    v-for="fontName in fonts"
    :key="fontName"
    :href="`https://fonts.googleapis.com/css2?family=${encodeURI(fontName)}&display=swap`"
    rel="stylesheet"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    fonts: {
      type: Array<string>,
      required: true
    }
  }
})
</script>
