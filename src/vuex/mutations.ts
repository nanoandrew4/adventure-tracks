import type { State } from './store'
import type { Adventure } from '../types/Adventure.type'
import type { Activity } from '../types/Activity.type'

export default {
  UPDATE_ADVENTURE(state: State, updatedAdventure: Adventure) {
    state.adventure = updatedAdventure
  },
  UPDATE_ADVENTURE_ACTIVITIES(state: State, updatedActivities: Activity[]) {
    state.adventure.activities = updatedActivities
  }
}
