<template>
  <header>
    <img
      alt="Site logo"
      class="logo"
      src="@/assets/logo.svg"
      width="50"
      height="50"
      @click="$router.push({ path: '/' })"
    />

    <div class="wrapper">
      <div class="header-controls">
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>
    </div>
  </header>

  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import LocaleSwitcher from './components/header/LocaleSwitcher.vue'
import ThemeSwitcher from './components/header/ThemeSwitcher.vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const theme = useTheme()

const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
if (darkThemeMq.matches) {
  theme.global.name.value = 'dark'
}

const { t } = useI18n()
</script>

<style scoped>
header {
  line-height: 1.5;
  min-height: 5vh;
  max-height: 5vh;
  width: 100%;
}

.logo {
  display: block;
  max-height: 100%;
  margin-top: 1vh;
  cursor: pointer;
  z-index: 1;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    align-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    align-items: center;
    justify-content: end;
    width: 100%;
    height: fit-content;
    padding-right: 2.5vw;

    .header-controls {
      display: inherit;
      align-items: center;
    }
  }
}
</style>
