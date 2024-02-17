<template>
  <v-icon
    :class="`theme-switcher--${selectedTheme}`"
    icon="mdi-theme-light-dark"
    @click="switchTheme"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useTheme, type ThemeInstance } from 'vuetify'

let theme: ThemeInstance

export default defineComponent({
  computed: {
    selectedTheme: (): string => theme.global.name.value
  },
  setup() {
    theme = useTheme()
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
  font-size: 2rem;
  padding-right: 2vw;
  padding-left: 2vw;
}

.theme-switcher--light {
  transform: rotate(180deg);
}

.theme-switcher--dark {
  transform: rotate(0deg);
}
</style>
