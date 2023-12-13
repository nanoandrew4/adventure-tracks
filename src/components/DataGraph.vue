<template>
  <div
    id="data-graph-container"
    class="data-graph"
    v-show="display"
  >
    <svg id="data-graph"></svg>
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

let store: Store

export default defineComponent({
  computed: {
    activities: (): Activity[] => store.state.adventure.activities,
    reducedActivities: (): ReducedActivity[] =>
      store.state.adventure.activities.map((activity: Activity) => new ReducedActivity(activity))
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
  setup() {
    store = useStore()
  },
  mounted() {
    this.drawGraph(this.reducedActivities)
  },
  watch: {
    reducedActivities: {
      deep: true,
      handler(modifiedActivities: ReducedActivity[], oldActivities: ReducedActivity[]) {
        this.drawGraph(modifiedActivities, oldActivities)
      }
    }
  },
  methods: {
    drawGraph(modifiedActivities: ReducedActivity[], oldActivities?: ReducedActivity[]) {
      const activitiesMap = this.activities.reduce((result, item) => {
        result.set(item.uid, item)
        return result
      }, new Map<string, Activity>())

      if (this.doesGraphRequireFullRedraw(activitiesMap, oldActivities)) {
        const activities: Activity[] = modifiedActivities
          .map((reducedActivity) => activitiesMap.get(reducedActivity.uid))
          .filter((activity) => activity !== undefined)
          .sort(sortByDateAscending) as Activity[]

        let componentWidth = 0
        let dataGraphContainerElement = document.getElementById('data-graph-container')
        if (dataGraphContainerElement != null) {
          componentWidth = dataGraphContainerElement.getBoundingClientRect().width
        } else {
          return
        }

        const newSvg = createElevationSvg(activities, componentWidth)

        let oldSvg = document.getElementById('data-graph')
        if (oldSvg != null) {
          dataGraphContainerElement.replaceChild(newSvg, oldSvg)
        } else {
          console.log('could not replace data graph')
        }
      } else if (oldActivities) {
        oldActivities
          .filter((oldActivity) =>
            this.hasElevationColorChanged(activitiesMap.get(oldActivity.uid), oldActivity)
          )
          .forEach((reducedActivityWithChangedColor) => {
            const activityWithChangedColor = activitiesMap.get(reducedActivityWithChangedColor.uid)
            if (!activityWithChangedColor?.sourceName) return
            console.log(activityWithChangedColor.sourceName)
            const activitySvgGroup = document.getElementById(activityWithChangedColor?.sourceName)
            if (activitySvgGroup != null) {
              console.log('changed color')
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
.data-graph {
  width: calc(100% - 1vw);
  height: 80px;
  margin: 0 0.5vw 0 0.5vw;
}

svg g path {
  display: block;
  width: 100%;
  height: 80px;
}
</style>
