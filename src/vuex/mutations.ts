import type { State } from './store'
import type { Adventure } from '../types/Adventure'
import type { Activity } from '../types/Activity'
import type { ActivityLoadProgress } from '@/types/ActivityLoadProgress'
import type { MapStyle } from '@/types/MapStyle'

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
  SET_RECENTER_MAP(state: State, newVal: boolean) {
    state.recenterMap = newVal
  },
  SET_ACTIVITY_LOAD_PROGRESS(state: State, newLoadProgress: ActivityLoadProgress) {
    state.activitiesLoadProgress = newLoadProgress
  },
  SET_ACTIVE_MAP_STYLE(state: State, activeMapStyle: MapStyle) {
    state.adventure.mapStyle = activeMapStyle
  },
  ADD_MAP_STYLES(state: State, mapStyles: MapStyle[]) {
    mapStyles.forEach((m) => {
      if (!state.mapStyles.has(m)) state.mapStyles.add(m)
    })
  },
  DELETE_MAP_STYLE(state: State, mapStyle: MapStyle) {
    state.mapStyles.delete(mapStyle)
  },
  SET_SNACKBAR_MESSAGE(state: State, message: string) {
    state.snackbarMessage = message
  }
}
