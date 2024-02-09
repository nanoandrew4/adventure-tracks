import './assets/main.css'
import 'vue-file-selector/dist/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { store, key } from './vuex/store'
import App from './App.vue'
import VueImageZoomer from 'vue-image-zoomer'
import 'vue-image-zoomer/dist/style.css';
import router from './router'

import en from '../locales/en.json'
import es from '../locales/es.json'

type MessageSchema = typeof en
const i18n = createI18n<[MessageSchema], 'en' | 'es'>({
  legacy: false,
  allowComposition: true,
  locale: 'en',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en: { ...en },
    es: { ...es }
  }
})

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
    },
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
