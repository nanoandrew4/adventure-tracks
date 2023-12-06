<template>
    <div id="track-creator" class="track-creator">
        <div id="adventure-track" class="adventure-track">
            <ActivityMap id="activityMap" ref="activityMap" :bbox="bbox" :activities="adventure.activities" />
            <DataGraph :display="displayGraph" />
            <h1 id="main-text">{{ adventure.mainText }}</h1>
            <h2 id="secondary-text">{{ adventure.secondaryText }}</h2>
        </div>
        <ConfigurationPanel />
    </div>
    <div id="output"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ActivityMap from '../components/ActivityMap.js'
import DataGraph from '../components/DataGraph.vue'
import ConfigurationPanel from '../components/ConfigurationPanel.vue'
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
        const bbox: number[][] = [
            [-74.04728500751165, 40.68392799015035],
            [-73.91058699000139, 40.87764500765852],
        ]
        return {
            bbox,
            rawGpxFiles
        }
    },
    setup(props) {
        store = useStore()
    },
    mounted() {
        let creatorElement = document.getElementById('adventure-track')
        if (creatorElement != null) {
            creatorElement.style.background = this.adventure.backgroundColor
        }
        document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(rawElement => {
            const element = rawElement as HTMLElement
            if (element.id == 'main-text') {
                element.style.color = this.adventure.mainTextColor
            } else if (element.id == 'secondary-text') {
                element.style.color = this.adventure.secondaryTextColor
            }
        });
    },
    methods: {
        async capture() {
            const activityMapComponent = this.$refs.activityMap as Vue & { resizeMap: () => void, recenter: () => void };
            // const activityMapImage = activityMapComponent.captureMap();

            let captureElement = document.getElementById("adventure-track")
            if (captureElement != null) {
                captureElement.style.width = '7680px'
                activityMapComponent.resizeMap()
                activityMapComponent.recenter()

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
                activityMapComponent.resizeMap()
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
