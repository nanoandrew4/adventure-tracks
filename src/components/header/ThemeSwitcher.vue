<template>
  <v-icon
    :class="`theme-switcher--${selectedTheme}`"
    :icon="iconPath"
    @click="switchTheme"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useTheme, type ThemeInstance } from 'vuetify'
import { mdiThemeLightDark } from '@mdi/js'

let theme: ThemeInstance

export default defineComponent({
  computed: {
    selectedTheme: (): string => theme.global.name.value
  },
  setup() {
    theme = useTheme()
  },
  data() {
    return {
      iconPath: mdiThemeLightDark
    }
  },
  methods: {
    switchTheme() {
      if (this.selectedTheme === 'light') {
        theme.global.name.value = 'dark'
      } else {
        theme.global.name.value = 'light'
      }
    }
  }
})
</script>

<style scoped>
.theme-switcher--light,
.theme-switcher--dark {
  font-size: 4rem;
  width: clamp(16px, max(1.5vw, 4vh), 32px);
  height: clamp(16px, max(1.5vw, 4vh), 32px);
}

.theme-switcher--light {
  transform: rotate(180deg);
}

.theme-switcher--dark {
  transform: rotate(0deg);
}
</style>
