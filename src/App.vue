<template>
  <header :class="headerClass">
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
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import LocaleSwitcher from './components/header/LocaleSwitcher.vue'
import ThemeSwitcher from './components/header/ThemeSwitcher.vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
if (darkThemeMq.matches) {
  theme.global.name.value = 'dark'
}

let headerClass = ref('')
const isHomePage = computed(() => document.location.pathname == '/')
if (isHomePage.value) {
  headerClass.value = 'header--faded'
  setTimeout(() => {
    headerClass.value = 'header--visible'
  }, 2000)
}
</script>

<style scoped>
header {
  line-height: 1.5;
  min-height: 42px;
  max-height: 5vh;
  width: 100%;

  display: flex;
  /* justify-content: end; */
  flex-direction: row;
  align-items: center;
}

.logo {
  display: block;
  max-height: 100%;
  margin-top: 1vh;
  margin-right: auto;
  cursor: pointer;
  z-index: 1;
}

header .wrapper {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: end;
  width: fit-content;
  height: fit-content;
  padding-right: 2.5vw;

  .header-controls {
    display: inherit;
    align-items: center;
  }
}

@media (min-width: 1024px) {
  header {
    display: flex;
    align-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}

.header--faded,
.header--visible {
  transition: opacity 1s 2s ease;
}

.header--faded {
  opacity: 0;
}

.header--visible {
  opacity: 1;
}
</style>
