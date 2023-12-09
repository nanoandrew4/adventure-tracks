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
        <v-icon
          @click="open = false"
          icon="mdi-close-circle-outline"
        />
        <v-color-picker
          @update:model-value="(color) => $emit('color-updated', color)"
          :mode="'rgb'"
        ></v-color-picker>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['color-updated'],
  props: {
    color: {
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
  margin: 0.5em 0 0.5em 5px;
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

  & > i {
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
