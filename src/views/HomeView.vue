<template>
  <main class="main">
    <div :class="'main-text' + (areImagesLoaded() ? '--bottom' : '')">
      <h1>You've done something great.</h1>
      <h2>Let immortalize it.</h2>
      <a href="/create">Begin</a>
    </div>

    <Carousel3d
      :autoplay="true"
      :autoplay-timeout="7000"
      :animation-speed="1000"
      :border="0"
      :width="areImagesLoaded() ? 1000 : 0"
      :height="areImagesLoaded() ? 1000 / Math.SQRT2 : 0"
    >
      <Slide
        v-for="(image, idx) in carouselImages"
        :index="idx"
        :key="idx"
      >
        <v-img
          :src="image"
          @load="loadedImages += 1"
        ></v-img>
      </Slide>
    </Carousel3d>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      loadedImages: 0,
      carouselImages: ['/sample_hor_1.png', '/sample_hor_2.png', '/sample_hor_3.png']
    }
  },
  methods: {
    areImagesLoaded(): boolean {
      return this.loadedImages == this.carouselImages.length
    }
  }
})
</script>

<style scoped>
.main {
  height: 100%;
  overflow: hidden;
}
.main-text,
.main-text--bottom {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  transition: top 0.5s ease;

  z-index: 2;
}

.main-text {
  height: 100%;
  justify-content: center;
  align-items: center;
}

.main-text--bottom {
  display: block;
  top: 800px;
}

a {
  text-decoration: none;
  color: rgb(var(--v-theme-text));
}
</style>
