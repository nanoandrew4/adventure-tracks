import type { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

import { type Adventure } from '../types/Adventure.type'
import { buildSampleAdventure } from '../helpers/buildSampleAdventure'
import mutations from './mutations'

// define your typings for the store state
export interface State {
  adventure: Adventure
  boundingCoordinateBox: [number, number, number, number]
  refreshDataGraph: boolean
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    adventure: buildSampleAdventure(new Date().toLocaleDateString()),
    boundingCoordinateBox: [
      -74.04728500751165, 40.68392799015035, -73.91058699000139, 40.87764500765852
    ],
    refreshDataGraph: false
  },
  mutations
})

export function useStore() {
  return baseUseStore(key)
}
