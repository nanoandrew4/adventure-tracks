<template>
  <div class="color-picker">
    <div
      :style="`background: ${color}`"
      ref="circle"
      class="color-picker-circle"
    />
    <p>{{ label }}</p>
    <v-dialog
      activator="parent"
      width="fit-content"
      :scrim="false"
      v-model="open"
    >
      <div
        class="color-picker-modal"
        :style="`top: calc(${circleBoundingClient?.y}px - 50vh); left: calc(${circleBoundingClient?.x}px - 65vw);`"
      >
        <v-icon
          @click="open = false"
          :icon="mdiCloseCircleOutline"
        />
        <v-color-picker
          :model-value="color"
          @update:model-value="(color) => $emit('color-updated', color)"
          :mode="'rgb'"
        ></v-color-picker>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mdiCloseCircleOutline } from '@mdi/js'

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
  mounted() {
    const t = this
    this.$nextTick(() => {
      t.circleBoundingClient = (this.$refs?.circle as HTMLElement)?.getBoundingClientRect()
    })
    addEventListener('resize', () => {
      t.circleBoundingClient = (this.$refs?.circle as HTMLElement)?.getBoundingClientRect()
    })
  },
  data() {
    let circleBoundingClient: DOMRect | undefined
    return {
      open: false,
      circleBoundingClient,
      mdiCloseCircleOutline
    }
  }
})
</script>

<style scoped>
.color-picker {
  p {
    margin: 0 0 0 1vw;
  }
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0.5vh 0 1vh 0;
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

  i {
    right: 0;
    color: white;
    position: absolute;
    z-index: 1;
  }

  div {
    padding: 20px;
    margin: 0px;
    width: 15vw !important;
    min-width: 300px;
    background-color: rgb(var(--v-theme-surface-light-bluish));
    /* border: 1px solid white; */
  }
}
</style>
