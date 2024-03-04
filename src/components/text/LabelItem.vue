<template>
  <div
    :id="`label-container-${index}`"
    class="label-container"
    draggable
  >
    <CustomText
      class="label-name"
      :model-value="label.name"
    />
    <CustomText
      class="label-value"
      :model-value="label.value"
    />
  </div>
  <v-tooltip
    v-if="customizationEnabled && showCustomTooltip"
    activator="parent"
    location="top"
  >
    {{ $t('creator.draggable-instructions') }}</v-tooltip
  >
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import CustomText from './CustomText.vue'
import type { Label } from '@/types/Label'
import {
  adjustMapSizeToFitDetails,
  registerResizableAdventureTrackElement
} from '@/helpers/resizableManager'
import { registerDraggableElement } from '@/helpers/draggableManager'
import type { Store } from 'vuex'
import { useStore } from '@/vuex/store'

let store: Store

export default defineComponent({
  components: {
    CustomText
  },
  props: {
    index: {
      type: Number,
      required: true
    },
    label: {
      type: Object as PropType<Label>,
      required: true
    }
  },
  setup() {
    store = useStore()
  },
  computed: {
    showCustomTooltip: () => store.state.showCustomTooltip,
    customizationEnabled: (): boolean => store.state.adventure.customizationEnabled
  },
  mounted() {
    this.checkIfLabelExceedsAdventureTrackBounds()
    if (this.customizationEnabled) {
      this.enableCustomization()
    }
  },
  methods: {
    enableCustomization() {
      const rootElem = document.getElementById('label-container-' + this.index)
      if (rootElem) {
        registerResizableAdventureTrackElement(rootElem, () => {})
        registerDraggableElement(rootElem, store)
      }
    },
    checkIfLabelExceedsAdventureTrackBounds() {
      this.$nextTick(() => {
        adjustMapSizeToFitDetails(store)
      })
    }
  },
  watch: {
    customizationEnabled(enabled: boolean) {
      if (enabled) {
        this.enableCustomization()
      }
    },
    label: {
      deep: true,
      handler() {
        this.checkIfLabelExceedsAdventureTrackBounds()
      }
    }
  }
})
</script>

<style scoped>
.label-container {
  width: 20%;
  height: max-content;
  container-type: inline-size;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0 1vw 0 1vw;
}

.label-name,
.label-value {
  /* max-width: 50%; */
  overflow-wrap: break-word;
  color: black;
  font-size: 10cqw;
  width: max-content;
}

.label-name {
  margin-right: 4%;
}
</style>
