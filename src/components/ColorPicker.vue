<template>
  <div class="color-picker">
    <div
      :style="`background: ${color}`"
      class="color-picker-circle"
    />
    <p>{{ label }}</p>
    <v-dialog
      activator="parent"
      width="fit-content"
      v-model="open"
    >
      <div class="color-picker-modal">
        <svg-icon
          @click="open = false"
          type="mdi"
          :path="closeIconPath"
        ></svg-icon>
        <v-color-picker
          v-model="color"
          @update:model-value="(color) => $emit('color-updated', color)"
          :mode="'rgb'"
        ></v-color-picker>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCloseCircleOutline } from '@mdi/js'

export default defineComponent({
  emits: ['color-updated'],
  components: {
    SvgIcon
  },
  props: {
    initialColor: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      open: false,
      color: this.initialColor,
      closeIconPath: mdiCloseCircleOutline
    }
  }
})
</script>

<style scoped>
.color-picker {
  & > p {
    margin: 0 0 0 1vw;
  }
  display: flex;
  align-items: center;
  cursor: pointer;
}

.color-picker-circle {
  width: 1.5vw;
  height: 1.5vw;
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  border-radius: 50%;
  border: 1px solid gray;
}

.color-picker-modal {
  position: absolute;
  overflow-x: hidden;

  right: -32vw;

  & > svg {
    right: 0;
    color: black;
    position: absolute;
    z-index: 1;
  }

  & > div {
    padding: 20px;
    margin: 0px;
    background-color: white;
    width: 15vw !important;
  }
}
</style>
