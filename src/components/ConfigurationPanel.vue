<template>
    <div class="configurator">
        <FileSelector class="configurator_file-selector" accept-extensions=".gpx" :multiple="true"
            :max-file-size="20 * 1024 * 1024" @validated="handleFilesValidated" @changed="handleFilesChanged">
            Select GPX files
        </FileSelector>
        <v-btn class="configurator_save-btn" @click="$emit('capture')">
            Save Adventure
        </v-btn>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { type FsValidationResult } from 'vue-file-selector/dist';
import GpxParser from 'gpxparser'
import html2canvas from 'html2canvas';

import { constants } from '../constants/constants'
import { buildSampleAdventure } from '../helpers/buildSampleAdventure'
import { type Activity } from '../types/Activity.type'
import { GeoPoint } from '../types/GeoPoint.type'
import {useStore} from '../vuex/store'
import {Store} from '../../vuex'

let store: Store;

export default defineComponent({
    computed: {
        adventure: () => store.state.adventure
    },
    data() {
        const rawGpxFiles: string[] = []
        const bbox: number[][] = [
            [-74.04728500751165, 40.68392799015035],
            [-73.91058699000139, 40.87764500765852],
        ]
        return {
            bbox,
            store: useStore(),
            rawGpxFiles
        }
    },
    setup(props) {
        store = useStore()
    },
    methods: {
        handleFilesValidated(result: FsValidationResult, files: File[]) {
            console.log('Validation result: ' + result);
        },
        async handleFilesChanged(files: File[]) {
            console.log('Selected files: ');
            console.table(files);

            const promiseArr = files.map(f => this.loadGpx(f));
            this.rawGpxFiles = await Promise.all(promiseArr);

            // console.log(this.rawGpxFiles)

            this.draw();
        },
        async loadGpx(file: File) {
            const decodedGpx: string = await new Promise((resolve) => {
                const reader = new FileReader();

                reader.readAsText(file);
                reader.onload = (e) => resolve(e.target?.result as string);
            });

            return decodedGpx || '';
        },
        draw() {
            var gpx = new GpxParser()
            let minLat = 1000, minLong = 1000
            let maxLat = -1000, maxLong = -1000

            let activities: Activity[] = []
            this.rawGpxFiles.forEach(rawGpxFile => {
                gpx.parse(rawGpxFile)
            });

            gpx.tracks.forEach(track => {
                let activityName = track.name
                let activitySourceName = track.name.toLowerCase().replace(/\s/g, '_',)
                // console.log(activitySourceName)
                let activityGeoPoints: GeoPoint[] = []
                // let heartRateData: number[] = []
                track.points.forEach(point => {
                    maxLat = Math.max(point.lat, maxLat)
                    minLat = Math.min(point.lat, minLat)
                    maxLong = Math.max(point.lon, maxLong)
                    minLong = Math.min(point.lon, minLong)
                    activityGeoPoints.push(new GeoPoint(point.lon, point.lat, point.ele))
                })

                activities.push({
                    name: activityName,
                    sourceName: activitySourceName,
                    activityGeoPoints,
                    elevationProfileColor: constants.defaultTextColor,
                    lineColor: constants.defaultBackgroundColor
                })
            });

            this.bbox = [
                [minLong, minLat],
                [maxLong, maxLat],
            ]
            console.log(gpx.tracks[0].points[0].time.toDateString())
            store.commit('UPDATE_ADVENTURE', buildSampleAdventure(gpx.tracks[0].points[0].time.toDateString()))
            store.commit('UPDATE_ADVENTURE_ACTIVITIES', activities)
        },
    }
})
</script>

<style>
.track-creator {
    width: 100%;
    height: fit-content;
    display: grid;
    grid-template-columns: 80% 20%;
    align-items: center;
    justify-content: center;
}

.adventure-track {
    width: 60vw;
}

.map-container {
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 16/9;
    border-radius: 12px;
}

.configurator {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    &_save-btn {
        width: 100%;
    }

    &_file-selector {
        cursor: pointer;
        width: 100%;
    }
}

@media (min-width: 1024px) {
    .create {
        /* min-height: 100vh; */
        display: flex;
        align-items: center;
    }

}
</style>
