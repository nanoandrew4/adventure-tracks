<template>
  <div class="map-style">
    <v-tooltip
      class="map-style-tooltip"
    >
      <img
        :src="`https://api.mapbox.com/styles/v1/${mapStyle.username}/${mapStyle.styleID}/static/${coords},13/${resolution}?access_token=${mapStyle.accessToken}`"
      />
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :text="mapStyle.name"
          @click="setStyleAsActive"
        />
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import { useStore } from '../../vuex/store'
import { Store } from '../../../vuex'
import type { MapStyle } from '@/types/MapStyle'

let store: Store

export default defineComponent({
  components: {},
  props: {
    mapStyle: {
      type: Object as PropType<MapStyle>,
      required: true
    }
  },
  data() {
    return {
      coords: '-9.418679382652044,38.694794308394194',
      resolution: '400x400'
    }
  },
  setup() {
    store = useStore()
  },
  methods: {
    setStyleAsActive() {
      store.commit('SET_ACTIVE_MAP_STYLE', this.mapStyle)
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
</style>
