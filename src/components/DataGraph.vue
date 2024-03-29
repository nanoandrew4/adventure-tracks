<template>
  <div
    id="data-graph-root"
    class="data-graph-root"
  >
    <div
      id="elevation-display"
      class="elevation-display"
      v-show="display && showHighestAndLowestPoints"
    >
      <StylizedText
        class="highest-point"
        :model-value="dataGraph.graphText"
        :text="String(highestPoint)"
        :font-scaling-factor="0.1"
      />
      <div class="point-spacer"></div>
      <StylizedText
        class="lowest-point"
        :model-value="dataGraph.graphText"
        :text="String(lowestPoint)"
        :font-scaling-factor="0.1"
      />
    </div>
    <div
      id="data-graph-container"
      class="data-graph-container"
      v-show="display && hasSvgBeenDrawn"
    >
      <svg id="data-graph"></svg>
    </div>
    <v-tooltip
      v-if="customizationEnabled && showCustomTooltip"
      activator="parent"
      location="top"
    >
      {{ $t('creator.draggable-instructions') }}</v-tooltip
    >
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
import StylizedText from '@/components/text/StylizedText.vue'
import type { DataGraph } from '@/types/DataGraph'
import type { CustomTextStyle } from '@/types/CustomTextStyle'

let store: Store

const TARGET_REFRESH_RATE = 10.0
const MILLISECONDS_BETWEEN_FRAMES = 1000.0 / TARGET_REFRESH_RATE

export default defineComponent({
  components: {
    StylizedText
  },
  computed: {
    dataGraph: (): DataGraph => store.state.adventure.dataGraph,
    dataGraphText: (): CustomTextStyle => store.state.adventure.dataGraph.graphText,
    customizationEnabled: (): boolean => store.state.adventure.customizationEnabled,
    showCustomTooltip: () => store.state.showCustomTooltip,
    activities: (): Activity[] => store.state.adventure.activities,
    reducedActivities: (): ReducedActivity[] =>
      store.state.adventure.activities.map((activity: Activity) => new ReducedActivity(activity)),
    refreshDataGraph: (): boolean => store.state.refreshDataGraph,
    showHighestAndLowestPoints: (): boolean =>
      store.state.adventure.dataGraph.displayHighestAndLowestPoints
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
      delayedRunner: new DelayedRunner(),
      highestPoint: 0,
      lowestPoint: 0,
      resizeObserver: new ResizeObserver(() => {
        this.drawGraph(this.reducedActivities, undefined, true)
      })
    }
  },
  setup() {
    store = useStore()
  },
  mounted() {
    this.$nextTick(() => this.drawGraph(this.reducedActivities))
    if (this.customizationEnabled) {
      this.enableCustomization()
    }

    const dataGraphContainer = document.getElementById('data-graph-container')
    if (dataGraphContainer) this.resizeObserver.observe(dataGraphContainer)
  },
  unmounted() {
    const dataGraphContainer = document.getElementById('data-graph-container')
    if (dataGraphContainer) this.resizeObserver.unobserve(dataGraphContainer)
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
    },
    customizationEnabled(enabled: boolean) {
      if (enabled) {
        this.enableCustomization()
      }
    },
    dataGraphText: {
      deep: true,
      handler(newVal: CustomTextStyle, oldVal: CustomTextStyle) {
        if (newVal.color == oldVal.color) {
          // Anything other than color changes should cause the graph to be redrawn
          this.drawGraph(this.reducedActivities, undefined, true)
        }
      }
    }
  },
  methods: {
    enableCustomization() {
      const rootElem = document.getElementById('data-graph-container')
      if (rootElem != null) {
        const t = this
        registerResizableAdventureTrackElement(rootElem, () => {
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
        })
      }
    },
    async drawGraph(
      modifiedActivities: ReducedActivity[],
      oldActivities?: ReducedActivity[],
      force?: boolean
    ) {
      const activitiesMap = this.activities.reduce((result, item) => {
        result.set(item.uid, item)
        return result
      }, new Map<string, Activity>())

      if (force || this.doesGraphRequireFullRedraw(activitiesMap, oldActivities)) {
        this.$nextTick(() => {
          const activities: Activity[] = modifiedActivities
            .map((reducedActivity) => activitiesMap.get(reducedActivity.uid))
            .filter((activity) => activity !== undefined)
            .sort(sortByDateAscending) as Activity[]

          let componentWidth = 0,
            componentHeight = 0
          let dataGraphRootElement = document.getElementById('data-graph-root')
          let dataGraphContainerElement = document.getElementById('data-graph-container')
          let elevationDisplay = document.getElementById('elevation-display')
          if (dataGraphRootElement != null && dataGraphContainerElement != null) {
            componentWidth =
              dataGraphRootElement.getBoundingClientRect().width -
              (elevationDisplay?.getBoundingClientRect()?.width ?? 0)
            componentHeight = dataGraphRootElement.getBoundingClientRect().height
          } else {
            return
          }

          const newSvgWrapper = createElevationSvg(activities, componentWidth, componentHeight)

          let oldSvg = document.getElementById('data-graph')
          if (oldSvg && newSvgWrapper) {
            const newSvg = newSvgWrapper.svg
            dataGraphContainerElement.replaceChild(newSvg, oldSvg)
            this.lowestPoint = Math.trunc(newSvgWrapper.lowestPoint)
            this.highestPoint = Math.trunc(newSvgWrapper.highestPoint)
            this.hasSvgBeenDrawn = true
          } else {
            console.log('could not replace data graph')
            this.hasSvgBeenDrawn = false
          }
        })
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
  display: flex;
  width: calc(98cqw);
  max-width: calc(98cqw);
  margin: 0 1cqw 0 1cqw;
}

.data-graph-container {
  height: 10cqh;
  width: 100%;
}

.elevation-display {
  display: flex;
  flex-direction: column;
  height: 10cqh;
  font-size: 0.6em;
  color: black;
}

.highest-point {
  margin-top: -0.5em;
}

.point-spacer {
  height: 100%;
}

.lowest-point {
  margin-bottom: -0.5em;
  margin-right: 0.25vw;
}

svg g path {
  display: block;
  width: 100%;
}
</style>
