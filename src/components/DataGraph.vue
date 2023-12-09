<template>
  <div
    id="data-graph-container"
    class="data-graph"
  >
    <svg
      v-show="display"
      id="data-graph"
    ></svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { type Adventure } from '../types/Adventure.type'
import { type Activity } from '../types/Activity'
import { useStore } from '../vuex/store'
import type { Store } from 'vuex'

const graphHeightPx = 80
let store: Store

export default defineComponent({
  computed: {
    adventure: () => store.state.adventure
  },
  props: {
    display: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isReady: false
    }
  },
  setup(props) {
    store = useStore()
  },
  beforeMount() {
    if (this.adventure.value) this.drawGraph(this.adventure.value.activities)
  },
  watch: {
    adventure(newValue: Adventure) {
      if (this.display) this.drawGraph(newValue.activities)
    }
  },
  methods: {
    drawGraph(activities: Activity[]) {
      let componentWidth = 0
      let componentHeight = `${graphHeightPx}px`
      let dataGraphContainerElement = document.getElementById('data-graph-container')
      if (dataGraphContainerElement != null) {
        componentWidth = dataGraphContainerElement.getBoundingClientRect().width
      } else {
        return
      }

      let numOfElevationPoints = 0
      let highestPoint = 0
      activities.forEach((activity) => {
        const elevationProfile = activity.activityGeoPoints.flatMap((geoPoint) =>
          geoPoint.elevation() !== undefined ? [geoPoint?.elevation() as number] : []
        )
        numOfElevationPoints += activity.activityGeoPoints.length
        highestPoint = Math.max(...elevationProfile, highestPoint)
      })

      console.log(highestPoint)

      let newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      newSvg.id = 'data-graph'
      newSvg.setAttribute('width', `${componentWidth}px`)
      newSvg.setAttribute('height', componentHeight)
      newSvg.setAttribute('viewBox', `0 0 ${componentWidth} ${graphHeightPx}`)
      let numOfProcessedElevationPoints = 0
      activities.forEach((activity) => {
        const elevationProfile = activity.activityGeoPoints.flatMap((geoPoint) =>
          geoPoint.elevation() !== undefined ? [geoPoint?.elevation() as number] : []
        )

        let svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        svgGroup.style.width = `${
          (elevationProfile.length / numOfElevationPoints) * componentWidth
        }px`
        svgGroup.style.height = componentHeight
        let activitySvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        activitySvgPath.style.width = `${
          (elevationProfile.length / numOfElevationPoints) * componentWidth
        }px`
        activitySvgPath.style.height = componentHeight
        activitySvgPath.setAttribute('fill', activity.elevationProfileColor)
        activitySvgPath.setAttribute('vector-effect', 'non-scaling-stroke')

        const stepSize = componentWidth / numOfElevationPoints
        let currPx = (numOfProcessedElevationPoints / numOfElevationPoints) * componentWidth
        let d = 'M ' + currPx + ' ' + graphHeightPx
        elevationProfile.forEach((elevationPoint) => {
          d +=
            ' L ' + currPx + ' ' + (graphHeightPx - (elevationPoint / highestPoint) * graphHeightPx)
          currPx += stepSize
        })
        d += ' L ' + currPx + ' ' + graphHeightPx
        activitySvgPath.setAttribute('d', d)
        svgGroup.appendChild(activitySvgPath)

        newSvg.appendChild(svgGroup)

        numOfProcessedElevationPoints += elevationProfile.length
      })

      let oldSvg = document.getElementById('data-graph')
      if (oldSvg != null) {
        dataGraphContainerElement.replaceChild(newSvg, oldSvg)
      } else {
        console.log('could not replace data graph')
      }
    }
  }
})
</script>

<style>
.data-graph {
  width: 100%;
  height: 80px;
}

svg g path {
  display: block;
  width: 100%;
  height: 80px;
}
</style>
