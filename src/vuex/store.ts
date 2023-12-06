import type { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

import { type Adventure } from '../types/Adventure.type'
import { buildSampleAdventure } from '../helpers/buildSampleAdventure'
import mutations from './mutations'

// define your typings for the store state
export interface State {
  adventure: Adventure
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    adventure: buildSampleAdventure(new Date().toLocaleDateString())
  },
  mutations
})

export function useStore() {
  return baseUseStore(key)
}
