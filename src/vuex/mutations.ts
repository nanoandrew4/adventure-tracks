import type { State } from './store'
import type { Adventure } from '../types/Adventure.type'
import type { Activity } from '../types/Activity'
import type { ActivityLoadProgress } from '@/types/ActivityLoadProgress'

export default {
  SET_BOUNDING_COORDINATE_BOX(state: State, newBoundingBox: [number, number, number, number]) {
    state.boundingCoordinateBox = newBoundingBox
  },
  SET_ADVENTURE(state: State, updatedAdventure: Adventure) {
    state.adventure = updatedAdventure
  },
  SET_ADVENTURE_ACTIVITIES(state: State, updatedActivities: Activity[]) {
    state.adventure.activities = updatedActivities
  },
  ADD_ACTIVITY(state: State, activity: Activity) {
    state.adventure.activities.push(activity)
  },
  SET_ACTIVITY(state: State, activityToMutate: Activity) {
    state.adventure.activities.forEach((activity) => {
      if (activity.name == activityToMutate.name) activity = activityToMutate
    })
  },
  SET_REFRESH_DATA_GRAPH(state: State, newVal: boolean) {
    state.refreshDataGraph = newVal
  },
  SET_ACTIVITY_LOAD_PROGRESS(state: State, newLoadProgress: ActivityLoadProgress) {
    state.activitiesLoadProgress = newLoadProgress
  }
}
