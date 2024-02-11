<template>
  <div
    :id="`label-container-${index}`"
    class="label-container resizable-container"
    resizable
    draggable
  >
    <p
      class="label-name"
      :style="`color: ${label.name.color}; font-family: ${label.name.font}`"
    >
      {{ label.name.text }}
    </p>
    <p
      class="label-value"
      :style="`color: ${label.value.color}; font-family: ${label.value.font}`"
    >
      {{ label.value.text }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import type { Label } from '@/types/Label'
import { registerResizableAdventureTrackElement } from '@/helpers/resizableManager'
import { registerDraggableElement } from '@/helpers/draggableManager'
import type { Store } from 'vuex'
import { useStore } from '@/vuex/store'

let store: Store

export default defineComponent({
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
    customizationEnabled: (): boolean => store.state.adventure.customizationEnabled
  },
  mounted() {
    if (this.customizationEnabled) {
      this.enableCustomization()
    }
  },
  methods: {
    enableCustomization() {
      const rootElem = document.getElementById('label-container-' + this.index)
      if (rootElem) {
        registerResizableAdventureTrackElement(rootElem, () => {})
        registerDraggableElement(rootElem)
      }
    }
  },
  watch: {
    customizationEnabled(enabled: boolean) {
      if (enabled) {
        this.enableCustomization()
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

.label-name {
  color: black;
  margin-right: 4%;
  width: max-content;
  font-size: 10cqw;
}

.label-value {
  color: black;
  width: max-content;
  font-size: 10cqw;
}
</style>
