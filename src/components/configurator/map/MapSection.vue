<template>
  <div class="container">
    <MapStyleView
      v-for="mapStyle in mapStyles"
      :key="mapStyle.name"
      :map-style="mapStyle"
    />
  </div>
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
      return [...store.state.mapStyles].filter((style: MapStyle) => style.styleID != this.activeMapStyle.styleID)
    }
  },
  setup() {
    store = useStore()
  }
})
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
}
</style>
