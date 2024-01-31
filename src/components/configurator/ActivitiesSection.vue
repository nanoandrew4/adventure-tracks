<template>
  <v-expansion-panels
    theme="dark"
    multiple
    variant="accordion"
    class="activities-section"
  >
    <v-expansion-panel
      :key="activity.name"
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
    accept-extensions=".gpx"
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
import { gpxGen } from '@tmcw/togeojson'

import ActivityCard from './ActivityCard.vue'
import { Activity } from '../../types/Activity'
import { useStore, type State } from '../../vuex/store'
import { sortByDateAscending } from '../../helpers/activitySorter'
import type { Store } from 'vuex'
import type { Adventure } from '@/types/Adventure'

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
    handleFilesValidated(result: FsValidationResult, files: File[]) {
      console.log('Validation result: ' + result)
    },
    async handleFilesChanged(files: File[]) {
      console.log('Selected files: ')
      console.table(files)

      this.processFiles(files)
    },
    processIntoGeoJson(file: File) {
      const reader = new FileReader()

      reader.readAsText(file)
      reader.onload = (response) => {
        const rawFile = response.target?.result as string
        let geoJsonGen = gpxGen(new DOMParser().parseFromString(rawFile, 'text/xml'))
        let nextFeature = geoJsonGen.next()

        const activityLoadProgress = state.activitiesLoadProgress!
        if (nextFeature.done) {
          // No feature means the file contained no valid data
          activityLoadProgress.filesWithErrors.push(file.name)
        } else {
          while (!nextFeature.done) {
            store.commit('ADD_ACTIVITY', new Activity(nextFeature.value))
            nextFeature = geoJsonGen.next()
          }
        }

        activityLoadProgress.numOfActivitiesProcessed++
        store.commit('SET_ACTIVITY_LOAD_PROGRESS', activityLoadProgress)
      }

      reader.onloadend = (e) => {
        console.log(e)
        const adventure = store.state.adventure as Adventure
        let startDate = adventure.activities
          .filter((activity: Activity) => activity.startTime)
          .map((activity) => activity.startTime)
          .pop()
        if (startDate) adventure.secondaryText.text = startDate.toDateString()
        store.commit('SET_ADVENTURE', adventure)
      }
    },
    processFiles(files: File[]) {
      store.commit('SET_ACTIVITY_LOAD_PROGRESS', {
        numOfActivitiesToLoad: files.length,
        numOfActivitiesProcessed: 0,
        filesWithErrors: []
      })
      files.forEach((file) => {
        this.processIntoGeoJson(file)
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
  border-radius: 0.5vw;
  border: 1px solid gray;
}

.fs-btn-select {
  text-align: center;
  width: 100%;
  height: 100%;
}

.configurator-activity-name {
  width: 100%;
  text-align: center;
}

.activities-section {
  overflow-y: scroll;
  max-height: 60vh;
}

.activities-section::-webkit-scrollbar {
  display: block;
}
</style>
