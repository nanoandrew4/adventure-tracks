<template>
  <div
    id="data-graph-root"
    resizable
    class="data-graph-root resizable-container"
  >
    <div
      id="data-graph-container"
      class="data-graph-container"
      v-show="display && hasSvgBeenDrawn"
    >
      <svg id="data-graph"></svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from '../vuex/store'
import { sortByDateAscending } from '../helpers/activitySorter'
import type { Store } from 'vuex'
import { ReducedActivity } from '@/types/ReducedActivity'
import type { Activity } from '@/types/Activity'
import { createElevationSvg } from '@/helpers/svgManager'
import { DelayedRunner } from '@/helpers/delayedRunner'
import { registerResizableAdventureTrackElement } from '@/helpers/resizableManager'

let store: Store

const TARGET_REFRESH_RATE = 10.0
const MILLISECONDS_BETWEEN_FRAMES = 1000.0 / TARGET_REFRESH_RATE

export default defineComponent({
  computed: {
    activities: (): Activity[] => store.state.adventure.activities,
    reducedActivities: (): ReducedActivity[] =>
      store.state.adventure.activities.map((activity: Activity) => new ReducedActivity(activity)),
    refreshDataGraph: (): boolean => store.state.refreshDataGraph
  },
  props: {
    display: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isReady: false,
      hasSvgBeenDrawn: false,
      lastDrawTimestamp: new Date().getTime(),
      delayedRunner: new DelayedRunner()
    }
  },
  setup() {
    store = useStore()
  },
  mounted() {
    const rootElem = document.getElementById('data-graph-root')
    if (rootElem != null) {
      const t = this
      let onResize = function () {
        if (t.display) {
          if (new Date().getTime() - t.lastDrawTimestamp < MILLISECONDS_BETWEEN_FRAMES) {
            t.delayedRunner.runDelayedFunction(() => {
              t.drawGraph(t.reducedActivities, undefined, true)
            }, MILLISECONDS_BETWEEN_FRAMES)
          } else {
            t.delayedRunner.clearTimeout()
            t.drawGraph(t.reducedActivities, undefined, true)
          }
        }
      }

      registerResizableAdventureTrackElement(rootElem, onResize)
    } else {
      console.log('no resize event')
    }
    this.drawGraph(this.reducedActivities)
  },
  watch: {
    reducedActivities: {
      deep: true,
      handler(modifiedActivities: ReducedActivity[], oldActivities: ReducedActivity[]) {
        this.drawGraph(modifiedActivities, oldActivities)
      }
    },
    refreshDataGraph(newVal: boolean) {
      if (newVal) {
        this.drawGraph(this.reducedActivities, undefined, true)
        store.commit('SET_REFRESH_DATA_GRAPH', false)
      }
    }
  },
  methods: {
    drawGraph(
      modifiedActivities: ReducedActivity[],
      oldActivities?: ReducedActivity[],
      force?: boolean
    ) {
      const activitiesMap = this.activities.reduce((result, item) => {
        result.set(item.uid, item)
        return result
      }, new Map<string, Activity>())

      if (force || this.doesGraphRequireFullRedraw(activitiesMap, oldActivities)) {
        const activities: Activity[] = modifiedActivities
          .map((reducedActivity) => activitiesMap.get(reducedActivity.uid))
          .filter((activity) => activity !== undefined)
          .sort(sortByDateAscending) as Activity[]

        let componentWidth = 0, componentHeight = 0
        let dataGraphRootElement = document.getElementById('data-graph-root')
        let dataGraphContainerElement = document.getElementById('data-graph-container')
        if (dataGraphRootElement != null && dataGraphContainerElement != null) {
          componentWidth = dataGraphRootElement.getBoundingClientRect().width
          componentHeight = dataGraphRootElement.getBoundingClientRect().height
        } else {
          return
        }

        const newSvg = createElevationSvg(activities, componentWidth, componentHeight)

        let oldSvg = document.getElementById('data-graph')
        if (oldSvg && newSvg) {
          dataGraphContainerElement.replaceChild(newSvg, oldSvg)
          this.hasSvgBeenDrawn = true
        } else {
          console.log('could not replace data graph')
          this.hasSvgBeenDrawn = false
        }
      } else if (oldActivities) {
        oldActivities
          .filter((oldActivity) =>
            this.hasElevationColorChanged(activitiesMap.get(oldActivity.uid), oldActivity)
          )
          .forEach((reducedActivityWithChangedColor) => {
            const activityWithChangedColor = activitiesMap.get(reducedActivityWithChangedColor.uid)
            if (!activityWithChangedColor?.sourceName) return
            const activitySvgGroup = document.getElementById(activityWithChangedColor?.sourceName)
            if (activitySvgGroup != null) {
              activitySvgGroup.style.fill = activityWithChangedColor.elevationProfileColor
            }
          })
      }
    },
    hasElevationColorChanged(
      modifiedActivity: Activity | undefined,
      oldActivity: ReducedActivity
    ): boolean {
      if (!modifiedActivity || !oldActivity) return false
      return modifiedActivity.elevationProfileColor !== oldActivity.elevationProfileColor
    },
    doesGraphRequireFullRedraw(
      currentActivitiesMap: Map<String, Activity>,
      oldActivities?: ReducedActivity[]
    ): boolean {
      if (
        !currentActivitiesMap ||
        !oldActivities ||
        currentActivitiesMap.size !== oldActivities.length
      )
        return true
      return oldActivities.filter((activity) => !currentActivitiesMap.has(activity.uid)).length > 0
    }
  }
})
</script>

<style>
.data-graph-root {
  width: calc(100% - 1vw);
  height: fit-content;
}

.data-graph-container {
  height: 80px;
  margin: 0 0.5vw 0 0.5vw;
}

svg g path {
  display: block;
  width: 100%;
  height: 80px;
}
</style>
