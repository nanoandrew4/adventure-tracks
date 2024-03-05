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
  activitiesLoadProgress: ActivityLoadProgress
  mapStyles: Set<MapStyle>
  activeMapStyle: MapStyle
  
  showCustomTooltip: boolean
  recenterMap: boolean
  resizeMapToFitSiblings: boolean
  refreshDataGraph: boolean
  snackbarMessage: string
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    adventure: buildSampleAdventure(),
    boundingCoordinateBox: [
      -74.04728500751165, 40.68392799015035, -73.91058699000139, 40.87764500765852
    ],
    mapBoxToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    mapStyles: new Set(),

    showCustomTooltip: true,
    recenterMap: false,
    refreshDataGraph: false,
    resizeMapToFitSiblings: false,
    snackbarMessage: ''
  },
  mutations
})

export function useStore() {
  return baseUseStore(key)
}
