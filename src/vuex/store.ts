import type { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

import { type Adventure } from '../types/Adventure'
import { buildSampleAdventure } from '../helpers/buildSampleAdventure'
import mutations from './mutations'
import type { ActivityLoadProgress } from '@/types/ActivityLoadProgress'
import type { MapStyle } from '@/types/MapStyle'

// define your typings for the store state
export interface State {
  adventure: Adventure
  boundingCoordinateBox: [number, number, number, number]
  refreshDataGraph: boolean
  recenterMap: boolean
  activitiesLoadProgress: ActivityLoadProgress
  mapStyles: Set<MapStyle>
  activeMapStyle: MapStyle,
  snackbarMessage: string
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    adventure: buildSampleAdventure(new Date().toLocaleDateString()),
    boundingCoordinateBox: [
      -74.04728500751165, 40.68392799015035, -73.91058699000139, 40.87764500765852
    ],
    refreshDataGraph: false,
    recenterMap: false,
    mapBoxToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    mapStyles: new Set(),
    snackbarMessage: ''
  },
  mutations
})

export function useStore() {
  return baseUseStore(key)
}
