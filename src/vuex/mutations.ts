import type { State } from './store'
import type { Adventure } from '../types/Adventure.type'
import type { Activity } from '../types/Activity'

export default {
  UPDATE_BOUNDING_COORDINATE_BOX(state: State, newBoundingBox: [number, number, number, number]) {
    state.boundingCoordinateBox = newBoundingBox
  },
  UPDATE_ADVENTURE(state: State, updatedAdventure: Adventure) {
    state.adventure = updatedAdventure
  },
  UPDATE_ADVENTURE_ACTIVITIES(state: State, updatedActivities: Activity[]) {
    state.adventure.activities = updatedActivities
  },
  UPDATE_ACTIVITY(state: State, activityToMutate: Activity) {
    state.adventure.activities.forEach((activity) => {
      if (activity.name == activityToMutate.name) activity = activityToMutate
    })
  }
}
