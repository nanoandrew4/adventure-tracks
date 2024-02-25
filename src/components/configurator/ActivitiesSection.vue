<template>
  <v-expansion-panels
    multiple
    variant="accordion"
    class="activities-section"
  >
    <v-expansion-panel
      :key="activity.uid"
      v-for="activity in sortedActivities"
    >
      <v-expansion-panel-title class="configurator-activity-title">
        <v-icon
          class="configurator-activity-delete"
          icon="mdi-delete"
          @click.stop="deleteActivity(activity.uid)"
        />
        <h3 class="configurator-activity-name">{{ activity.name }}</h3>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <ActivityCard :activity="activity" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
  <FileSelector
    class="configurator-file-selector"
    accept-extensions=".gpx,.kml,.tcx"
    :multiple="true"
    @validated="handleFilesValidated"
    @changed="handleFilesChanged"
  >
    {{ $t('creator.config-panel.select-gpx-files') }}
  </FileSelector>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { type FsValidationResult } from 'vue-file-selector/dist'
import { gpxGen, kmlGen, type F, tcxGen } from '@tmcw/togeojson'

import ActivityCard from './ActivityCard.vue'
import { Activity } from '../../types/Activity'
import { useStore, type State } from '../../vuex/store'
import { sortByDateAscending } from '../../helpers/activitySorter'
import type { Store } from 'vuex'
import type { Adventure } from '@/types/Adventure'
import type { Feature, Geometry, GeoJsonProperties } from 'geojson'

let store: Store
let state: State

export default defineComponent({
  components: {
    ActivityCard
  },
  computed: {
    adventure: (): Adventure => store.state.adventure,
    sortedActivities: (): Activity[] => {
      return state.adventure.activities.sort(sortByDateAscending)
    }
  },
  setup() {
    store = useStore()
    state = store.state
  },
  methods: {
    deleteActivity(uidToDelete: string) {
      const modifiedActivities = this.adventure.activities.flatMap((activity: Activity) =>
        activity.uid != uidToDelete ? [activity] : []
      )
      store.commit('SET_ADVENTURE_ACTIVITIES', modifiedActivities)
    },
    handleFilesValidated(_result: FsValidationResult, files: File[]) {
      this.initActivityLoadProgress(files.length)
      const activityLoadProgress = state.activitiesLoadProgress!
      files.forEach((file) => {
        activityLoadProgress.filesWithErrors.add(file.name)
        activityLoadProgress.numOfActivitiesProcessed++
        store.commit('SET_ACTIVITY_LOAD_PROGRESS', activityLoadProgress)
      })
    },
    async handleFilesChanged(files: File[]) {
      this.initActivityLoadProgress(files.length)
      files.forEach((file) => {
        this.processIntoGeoJson(file)
      })
    },
    processIntoGeoJson(file: File) {
      const reader = new FileReader()
      const activityLoadProgress = state.activitiesLoadProgress!

      reader.readAsText(file)
      reader.onload = (response) => {
        const rawFile = response.target?.result as string
        let geoJsonGen: Generator<F, any, unknown>
        if (file.name.includes('gpx')) {
          geoJsonGen = gpxGen(new DOMParser().parseFromString(rawFile, 'text/xml'))
        } else if (file.name.includes('kml')) {
          geoJsonGen = kmlGen(new DOMParser().parseFromString(rawFile, 'text/xml'))
        } else if (file.name.includes('tcx')) {
          geoJsonGen = tcxGen(new DOMParser().parseFromString(rawFile, 'text/xml'))
        } else {
          activityLoadProgress.filesWithErrors.add(file.name)
          return
        }
        let nextFeature = geoJsonGen.next()

        if (nextFeature.done) {
          // No feature means the file contained no valid data
          activityLoadProgress.filesWithErrors.add(file.name)
        } else {
          while (!nextFeature.done) {
            const nextFeatVal = nextFeature.value
            if (
              nextFeatVal.geometry &&
              'coordinates' in nextFeatVal.geometry &&
              nextFeatVal.geometry.coordinates.length > 0
            ) {
              if (nextFeatVal.properties && !nextFeatVal.properties.name) {
                nextFeatVal.properties.name = file.name
              }
              store.commit(
                'ADD_ACTIVITY',
                new Activity(
                  nextFeatVal as Feature<Geometry, GeoJsonProperties>,
                  this.adventure.mainText.color
                )
              )
            } else {
              activityLoadProgress.filesWithErrors.add(file.name)
            }
            nextFeature = geoJsonGen.next()
          }
        }

        activityLoadProgress.numOfActivitiesProcessed++
        store.commit('SET_ACTIVITY_LOAD_PROGRESS', activityLoadProgress)
      }

      reader.onloadend = () => {
        const adventure = store.state.adventure as Adventure
        let startDate = adventure.activities
          .filter((activity: Activity) => activity.startTime)
          .map((activity) => activity.startTime)
          .pop()
        if (startDate) adventure.secondaryText.text = startDate.toDateString()
        store.commit('SET_ADVENTURE', adventure)
      }
    },
    initActivityLoadProgress(numOfActivitiesToLoad: number) {
      store.commit('SET_ACTIVITY_LOAD_PROGRESS', {
        numOfActivitiesToLoad: numOfActivitiesToLoad,
        numOfActivitiesProcessed: 0,
        filesWithErrors: new Set()
      })
    }
  }
})
</script>

<style>
.configurator-file-selector {
  cursor: pointer;
  width: 100%;
  padding: 1em;
  margin: 1em 0 0 0;
  border-radius: 0.25vw;
  background-color: rgb(var(--v-theme-primary));
}

.fs-btn-select {
  text-align: center;
  width: 100%;
  height: 100%;
  color: white;
}

.configurator-activity-name {
  width: 100%;
  text-align: center;
}

.activities-section {
  overflow-y: scroll;
  max-height: 45vh;
}

.activities-section::-webkit-scrollbar {
  display: block;
}
</style>
