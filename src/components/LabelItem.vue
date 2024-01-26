<template>
  <div
    :id="`label-container-${index}`"
    class="label-container resizable-container"
    resizable
    draggable
  >
    <p class="label-name">{{ label.name }}</p>
    <p class="label-value">{{ label.value }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import type { Label } from '@/types/Label'
import { registerResizableAdventureTrackElement } from '@/helpers/resizableManager'
import { registerDraggableElement } from '@/helpers/draggableManager'

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
  mounted() {
    const rootElem = document.getElementById('label-container-' + this.index)
    if (rootElem) {
      registerResizableAdventureTrackElement(rootElem, () => {})
      registerDraggableElement(rootElem)
    }
  }
})
</script>

<style scoped>
.label-container {
  width: 100px;
  height: fit-content;
  container-type: inline-size;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0 1vw 0 1vw;
}

.label-name {
  color: black;
  padding-top: 2px;
  margin-right: 0.5vw;
  font-size: 12cqw;
}

.label-value {
  color: black;
  /* font-size: large; */
  font-size: 15cqw;
}
</style>
