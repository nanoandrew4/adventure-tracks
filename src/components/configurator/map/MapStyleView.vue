<template>
  <div class="map-style">
    <v-tooltip class="map-style-tooltip">
      <img
        :src="`https://api.mapbox.com/styles/v1/${mapStyle.username}/${mapStyle.styleID}/static/${coords},13/${resolution}?access_token=${mapBoxToken}`"
      />
      <template v-slot:activator="{ props }">
        <div class="style-button-container">
          <v-btn
            :color="mapStyle.custom ? 'surface-light-bluish' : 'primary'"
            v-bind="props"
            :text="mapStyle.name"
            @click="setStyleAsActive"
          />
          <v-icon
            v-if="mapStyle.custom"
            class="delete-style"
            :icon="mdiCloseCircleOutline"
            @click="deleteCustomStyle"
          />
        </div>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import { useStore } from '../../../vuex/store'
import { Store } from 'vuex'
import type { MapStyle } from '@/types/MapStyle'
import type { Adventure } from '@/types/Adventure'

import {
  mdiCloseCircleOutline
} from '@mdi/js'

let store: Store

export default defineComponent({
  computed: {
    activeMapStyle: (): MapStyle => store.state.adventure.mapStyle,
    mapBoxToken: (): string => store.state.mapBoxToken
  },
  props: {
    mapStyle: {
      type: Object as PropType<MapStyle>,
      required: true
    }
  },
  setup() {
    store = useStore()
  },
  data() {
    return {
      coords: '-9.418679382652044,38.694794308394194',
      resolution: '400x400',
      mdiCloseCircleOutline
    }
  },
  methods: {
    setStyleAsActive() {
      store.commit('SET_ACTIVE_MAP_STYLE', this.mapStyle)
      if (
        this.activeMapStyle.backgroundColor ||
        this.activeMapStyle.mainTextColor ||
        this.activeMapStyle.mainTextFont ||
        this.activeMapStyle.secondaryTextColor ||
        this.activeMapStyle.secondaryTextFont ||
        this.activeMapStyle.labelNameTextColor ||
        this.activeMapStyle.labelNameTextFont ||
        this.activeMapStyle.labelValueTextColor ||
        this.activeMapStyle.labelValueTextFont
      ) {
        const modifiedAdventure = store.state.adventure as Adventure
        modifiedAdventure.backgroundColor =
          this.mapStyle.backgroundColor ?? modifiedAdventure.backgroundColor
        modifiedAdventure.mainText.color =
          this.mapStyle.mainTextColor ?? modifiedAdventure.mainText.color
        modifiedAdventure.mainText.font =
          this.mapStyle.mainTextFont ?? modifiedAdventure.mainText.font
        modifiedAdventure.secondaryText.color =
          this.mapStyle.secondaryTextColor ?? modifiedAdventure.secondaryText.color
        modifiedAdventure.secondaryText.font =
          this.mapStyle.secondaryTextFont ?? modifiedAdventure.secondaryText.font
        modifiedAdventure.dataGraph.graphText.color = this.mapStyle.secondaryTextColor ?? modifiedAdventure.secondaryText.color 
        modifiedAdventure.dataGraph.graphText.font = this.mapStyle.secondaryTextFont ?? modifiedAdventure.secondaryText.font 
        if (modifiedAdventure.labels) {
          modifiedAdventure.labels.forEach((l) => {
            l.name.color = this.mapStyle.labelNameTextColor ?? l.name.color
            l.name.font = this.mapStyle.labelNameTextFont ?? l.name.font
            l.value.color = this.mapStyle.labelValueTextColor ?? l.value.color
            l.value.font = this.mapStyle.labelValueTextFont ?? l.value.font
          })
        }
        modifiedAdventure.activities.forEach((activity) => {
          activity.lineColor = modifiedAdventure.mainText.color
          activity.elevationProfileColor = modifiedAdventure.mainText.color
        })
        store.commit('SET_ADVENTURE', modifiedAdventure)
      }
    },
    deleteCustomStyle() {
      if (this.activeMapStyle == this.mapStyle)
        store.commit('SET_ACTIVE_MAP_STYLE', [...store.state.mapStyles][0])
      store.commit('DELETE_MAP_STYLE', this.mapStyle)
    }
  }
})
</script>

<style>
.map-style {
  margin: 0.5vh;
  width: fit-content;
}

.map-style-tooltip {
  .v-overlay__content {
    padding: 0 !important;
    height: 400px !important;
    img {
      border-radius: 1vh !important;
    }
  }
}

.style-button-container {
  position: relative;
}

.delete-style {
  position: absolute;
  font-size: 1.2em;
  top: -0.5vh;
  right: -0.5vw;
}
</style>
