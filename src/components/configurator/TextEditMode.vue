<template>
  <div
    v-if="selectedEditMode != targetEditMode"
    @click="$emit('selected', targetEditMode)"
    class="customizable-text-menu-list-element"
  >
    <v-icon :icon="getIconForMode(targetEditMode)" />
    <p>{{ $t('creator.config-panel.customizable-text.' + labelSuffix) }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EDIT_MODE, MODE_TO_PROPS_MAP } from './CustomizableText.vue'

export default defineComponent({
  emits: ['selected'],
  props: {
    selectedEditMode: {
      type: Number,
      required: true
    },
    targetEditMode: {
      type: Number,
      required: true
    },
    labelSuffix: {
      type: String,
      required: true
    }
  },
  methods: {
    getIconForMode(mode: EDIT_MODE): string | undefined {
      return MODE_TO_PROPS_MAP.get(mode)?.icon
    },
  }
})
</script>

<style scoped>
.customizable-text-menu-list-element {
  display: flex;
  margin: 0 0.5vw 0 0.5vw;
  flex-direction: row;
  cursor: pointer;

  p {
    margin-left: 0.5vw;
  }
}

.customizable-text-menu-list-element:not(:first-child) {
  margin-top: 0.5vh;
}

.active-mode {
  margin-right: 0.5vw;
}
</style>
