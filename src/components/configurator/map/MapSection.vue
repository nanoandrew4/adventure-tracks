<template>
  <div class="styles-container">
    <MapStyleView
      v-for="mapStyle in mapStyles"
      :key="mapStyle.name"
      :map-style="mapStyle"
    />
  </div>
  <div class="import-custom-style">
    <v-btn
      color="surface-light-bluish"
      @click="showAddCustomStyleDialog = true"
    >
      {{ $t('creator.config-panel.map-config.import-custom-style.activator-btn') }}
    </v-btn>
  </div>
  <v-dialog
    v-model="showAddCustomStyleDialog"
    width="fit-content"
    height="fit-content"
  >
    <v-card>
      <v-card-text class="custom-style-dialog-card">
        <p>
          {{ $t('creator.config-panel.map-config.import-custom-style.text') }}
        </p>
        <v-text-field
          class="custom-style-input"
          v-model="customStyleName"
          :label="$t('creator.config-panel.map-config.import-custom-style.style-name')"
          hide-details
          rounded
          variant="solo"
        />
        <v-text-field
          class="custom-style-input"
          v-model="customStyleUsername"
          :label="$t('creator.config-panel.map-config.import-custom-style.style-username')"
          hide-details
          rounded
          variant="solo"
        />
        <v-text-field
          class="custom-style-input"
          v-model="customStyleID"
          :label="$t('creator.config-panel.map-config.import-custom-style.style-id')"
          hide-details
          rounded
          variant="solo"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :text="$t('creator.config-panel.map-config.import-custom-style.close')"
          @click="showAddCustomStyleDialog = false"
        />
        <v-btn
          :text="$t('creator.config-panel.map-config.import-custom-style.save')"
          @click="saveNewStyle"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useStore } from '@/vuex/store'
import { Store } from '../../../../vuex'
import MapStyleView from '@/components/configurator/map/MapStyleView.vue'
import type { MapStyle } from '@/types/MapStyle'

let store: Store

export default defineComponent({
  components: {
    MapStyleView
  },
  computed: {
    activeMapStyle: (): MapStyle => store.state.activeMapStyle,
    mapStyles(): MapStyle[] {
      return [...store.state.mapStyles].filter(
        (style: MapStyle) => style.styleID != this.activeMapStyle.styleID
      )
    }
  },
  setup() {
    store = useStore()
  },
  data() {
    return {
      showAddCustomStyleDialog: false,
      customStyleName: '',
      customStyleUsername: '',
      customStyleID: ''
    }
  },
  methods: {
    saveNewStyle() {
      store.commit('ADD_MAP_STYLES', [
        {
          name: this.customStyleName,
          username: this.customStyleUsername,
          styleID: this.customStyleID,
          custom: true
        }
      ])
      this.showAddCustomStyleDialog = false
      this.customStyleName = ''
      this.customStyleUsername = ''
      this.customStyleID = ''
    }
  }
})
</script>

<style scoped>
.styles-container {
  display: flex;
  flex-wrap: wrap;
}

.import-custom-style {
  padding-top: 2vh;
  text-align: center;
}

.custom-style-input {
  padding-top: 1vh;
}
</style>
