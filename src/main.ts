import './assets/main.css'
import 'vue-file-selector/dist/main.css'
import '@nanoandrew4/vue3-carousel-3d/dist/style.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { store, key } from './vuex/store'
import App from './App.vue'
import VueImageZoomer from 'vue-image-zoomer'
import 'vue-image-zoomer/dist/style.css'
import router from './router'

import en from '../locales/en.json'
import es from '../locales/es.json'

type MessageSchema = typeof en
const i18n = createI18n<[MessageSchema], 'en' | 'es'>({
  legacy: false,
  allowComposition: true,
  locale: navigator.language.split('-')[0],
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en: { ...en },
    es: { ...es }
  }
})

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    },
  },
  defaults: {
    VBtn: { color: 'primary' },
    VCheckbox: { color: 'primary' },
    VTextField: { bgColor: 'surface-light-bluish' }
  },
  theme: {
    themes: {
      light: {
        dark: false,
        variables: {},
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          'surface-bright': '#FFFFFF',
          'surface-light': '#EEEEEE',
          'surface-light-bluish': '#DDE5E9',
          'surface-variant': '#424242',
          'on-surface-variant': '#EEEEEE',
          primary: '#1D6FB3',
          'primary-darken-1': '#1F5592',
          secondary: '#48A9A6',
          'secondary-darken-1': '#018786',
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          text: '#000000',
          'text-selected': '#1D6FB3'
        }
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#212121',
          'surface-bright': '#ccbfd6',
          'surface-light': '#424242',
          'surface-light-bluish': '#293236',
          'surface-variant': '#a3a3a3',
          'on-surface-variant': '#424242',
          primary: '#376489',
          'primary-darken-1': '#277CC1',
          secondary: '#54B6B2',
          'secondary-darken-1': '#48A9A6',
          error: '#CF6679',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          text: '#FFFFFF',
          'text-selected': '#376489'
        }
      }
    }
  }
})

import FileSelector from 'vue-file-selector'

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(store, key)
app.use(FileSelector)
app.use(vuetify)
app.use(VueImageZoomer)
app.mount('#app')

// app.config.performance = true
