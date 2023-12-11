import { Store, createStore, useStore } from 'vuex'
import { State } from './src/vuex/store'

declare module '@vue/runtime-core' {
  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}

export {
  createStore,
  useStore,
  Store // declare your own store states
}
