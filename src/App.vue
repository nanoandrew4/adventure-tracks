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
      <nav>
        <RouterLink to="/">{{ t('header.home') }}</RouterLink>
        <RouterLink to="/create">{{ t('header.creator') }}</RouterLink>
      </nav>
      <div class="header-controls">
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>
    </div>
  </header>

  <RouterView />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
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

nav {
  position: absolute;
  width: 100vw;
  left: 0;
  font-size: 1rem;
  text-align: center;
}

nav a.router-link-exact-active {
  color: rgb(var(--v-theme-text-selected));
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  color: rgb(var(--v-theme-text));
}

nav a:first-of-type {
  border: 0;
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
      padding-top: 1vh;
    }
  }
}
</style>
