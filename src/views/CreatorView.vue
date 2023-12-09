<template>
    <div id="track-creator" class="track-creator">
        <div id="adventure-track" class="adventure-track" :style="`background: ${adventure.backgroundColor};`">
            <ActivityMap ref="activityMap" />
            <DataGraph v-if="adventure.displayElevationProfile" :display="displayGraph" />
            <h1 id="main-text" :style="`color: ${adventure.mainTextColor};`">{{ adventure.mainText }}</h1>
            <h2 id="secondary-text" :style="`color: ${adventure.secondaryTextColor};`">{{ adventure.secondaryText }}</h2>
        </div>
        <ConfigurationPanel @capture="capture"/>
    </div>
    <div id="output"></div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import ActivityMap from '../components/ActivityMap.vue'
import DataGraph from '../components/DataGraph.vue'
import ConfigurationPanel from '../components/configurator/MainPanel.vue'
import "../../node_modules/mapbox-gl/dist/mapbox-gl.css"
import html2canvas from 'html2canvas';

import { type Adventure } from '../types/Adventure.type'
import { useStore } from '../vuex/store'
import type { Store } from 'vuex'

let store: Store

export default defineComponent({
    components: {
        ActivityMap,
        DataGraph,
        ConfigurationPanel
    },
    computed: {
        adventure: (): Adventure => store.state.adventure,
        displayGraph: function (): boolean {
            return this?.adventure.displayElevationProfile && this?.adventure.activities.length > 0
        }
    },
    data() {
        const rawGpxFiles: string[] = []
        return {
            activityMap: ref<InstanceType<typeof ActivityMap>>(),
            rawGpxFiles
        }
    },
    setup() {
        store = useStore()
    },
    methods: {
        async capture() {
            let captureElement = document.getElementById("adventure-track")
            let activityMapRef = this.$refs.activityMap as typeof ActivityMap

            if (captureElement != null && activityMapRef != null) {
                captureElement.style.width = '7680px'
                activityMapRef.resizeMap()
                activityMapRef.recenter()

                await new Promise(r => setTimeout(r, 5000));

                html2canvas(captureElement).then((canvas) => {
                    const newWindow = window.open();

                    if (newWindow != null) {
                        newWindow.document.write(`<html><body><div id="output"></body></html>`);

                        let outputDiv = newWindow.document.getElementById('output')
                        if (outputDiv != null) {
                            outputDiv.appendChild(canvas);
                        }

                        newWindow.document.close();
                    }
                })

                await new Promise(r => setTimeout(r, 2000));

                captureElement.style.width = ''
                activityMapRef.resizeMap()
            } else {
                alert("Adventure track to save could not be located")
            }
        }
    }
})
</script>

<style>
.track-creator {
    width: 100%;
    height: fit-content;
    display: grid;
    grid-template-columns: 75% 25%;
    align-items: center;
    justify-content: center;
}

.adventure-track {
    width: 100%;
    border-radius: 0.5em;
}

.map-container {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    margin: 20px;
}

@media (min-width: 1024px) {
    .create {
        /* min-height: 100vh; */
        display: flex;
        align-items: center;
    }

}
</style>
