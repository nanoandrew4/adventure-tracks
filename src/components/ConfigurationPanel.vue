<template>
  <div class="configurator">
    <h2>{{ $t('creator.config-panel.activities') }}</h2>
    <div
      :key="activity.name"
      v-for="activity in adventure.activities"
    >
      <ActivityCard :activity="activity" />
    </div>
    <FileSelector
      class="configurator-file-selector"
      accept-extensions=".gpx"
      :multiple="true"
      :max-file-size="20 * 1024 * 1024"
      @validated="handleFilesValidated"
      @changed="handleFilesChanged"
    >
      {{ $t('creator.config-panel.select-gpx-files') }}
    </FileSelector>
    <v-btn
      class="configurator-save-btn"
      :text="$t('creator.config-panel.save')"
      :theme="undefined"
      @click="$emit('capture')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { type FsValidationResult } from 'vue-file-selector/dist'
import GpxParser from 'gpxparser'

import ActivityCard from './ActivityCard.vue'
import { constants } from '../constants/constants'
import { buildSampleAdventure } from '../helpers/buildSampleAdventure'
import { Activity } from '../types/Activity'
import { GeoPoint } from '../types/GeoPoint'
import { useStore } from '../vuex/store'
import { Store } from '../../vuex'

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
      store: useStore(),
      rawGpxFiles
    }
  },
  setup(props) {
    store = useStore()
  },
  methods: {
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
.configurator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.configurator-save-btn {
  width: 80%;
  color: black;
}

.configurator-file-selector {
  cursor: pointer;
  width: 100%;
}
</style>
