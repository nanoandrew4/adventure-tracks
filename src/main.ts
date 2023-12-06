import './assets/main.css'
import 'vue-file-selector/dist/main.css';

import { createApp } from 'vue'
import { store, key } from './vuex/store'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
  })

import FileSelector from 'vue-file-selector';

const app = createApp(App)

app.use(router)
app.use(store, key)
app.use(FileSelector)
app.use(vuetify)
app.mount('#app')
