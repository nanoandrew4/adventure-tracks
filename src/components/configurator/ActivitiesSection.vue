<template>
  <v-expansion-panels
    theme="dark"
    multiple
    variant="accordion"
  >
    <v-expansion-panel
      :key="activity.name"
      v-for="activity in adventure.activities"
    >
      <v-expansion-panel-title class="configurator-activity-title">
        <v-icon
          class="configurator-activity-delete"
          icon="mdi-delete"
          @click="deleteActivity(activity.uid)"
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
import GpxParser from 'gpxparser'

import ActivityCard from './ActivityCard.vue'
import { constants } from '../../constants/constants'
import { buildSampleAdventure } from '../../helpers/buildSampleAdventure'
import { Activity } from '../../types/Activity'
import { GeoPoint } from '../../types/GeoPoint'
import { useStore } from '../../vuex/store'
import { Store } from '../../../vuex'

let store: Store

export default defineComponent({
  components: {
    ActivityCard
  },
  computed: {
    adventure: () => store.state.adventure
  },
  data() {
    const rawGpxFiles: string[] = []
    return {
      rawGpxFiles
    }
  },
  setup() {
    store = useStore()
  },
  methods: {
    deleteActivity(uidToDelete: string) {
      const modifiedActivities = this.adventure.activities.flatMap((activity: Activity) =>
        activity.uid != uidToDelete ? [activity] : []
      )
      store.commit('UPDATE_ADVENTURE_ACTIVITIES', modifiedActivities)
    },
    handleFilesValidated(result: FsValidationResult, files: File[]) {
      console.log('Validation result: ' + result)
    },
    async handleFilesChanged(files: File[]) {
      console.log('Selected files: ')
      console.table(files)

      const promiseArr = files.map((f) => this.loadGpx(f))
      this.rawGpxFiles = await Promise.all(promiseArr)

      this.draw()
    },
    async loadGpx(file: File) {
      const decodedGpx: string = await new Promise((resolve) => {
        const reader = new FileReader()

        reader.readAsText(file)
        reader.onload = (e) => resolve(e.target?.result as string)
      })

      return decodedGpx || ''
    },
    draw() {
      var gpx = new GpxParser()
      let minLat = 1000,
        minLong = 1000
      let maxLat = -1000,
        maxLong = -1000

      let activities: Activity[] = []
      this.rawGpxFiles.forEach((rawGpxFile) => {
        gpx.parse(rawGpxFile)
      })

      gpx.tracks.forEach((track) => {
        let activityName = track.name
        let activityGeoPoints: GeoPoint[] = []
        // let heartRateData: number[] = []
        track.points.forEach((point) => {
          maxLat = Math.max(point.lat, maxLat)
          minLat = Math.min(point.lat, minLat)
          maxLong = Math.max(point.lon, maxLong)
          minLong = Math.min(point.lon, minLong)
          activityGeoPoints.push(new GeoPoint(point.lon, point.lat, point.ele))
        })

        activities.push(
          new Activity(
            activityName,
            activityGeoPoints,
            constants.defaultTextColor,
            constants.defaultBackgroundColor,
            track.points[0].time,
            track.points[track.points.length - 1].time
          )
        )
      })

      store.commit(
        'UPDATE_ADVENTURE',
        buildSampleAdventure(gpx.tracks[0].points[0].time.toDateString())
      )
      store.commit(
        'UPDATE_ADVENTURE_ACTIVITIES',
        activities.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      )
      store.commit('UPDATE_BOUNDING_COORDINATE_BOX', [minLong, minLat, maxLong, maxLat])
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
</style>
