<template>
  <main class="main">
    <div :class="'main-text' + (areImagesLoaded ? '--bottom' : '')">
      <h1>{{ $t('home.main-text') }}</h1>
      <v-btn
        :variant="areImagesLoaded ? 'outlined' : 'text'"
        :color="areImagesLoaded ? 'primary' : 'text-color'"
        href="/create"
        >{{ $t('home.button-text') }}</v-btn
      >
      <p :class="'subtext' + (showSubtext ? '' : '--faded')">
        {{ $t('home.subtext') }}
        <a href="https://github.com/nanoandrew4/adventure-tracks">{{ $t('home.source-code') }}</a>
      </p>
    </div>

    <Carousel3d
      v-if="carouselImages.length > 0"
      :class="carouselClass"
      :autoplay="true"
      :autoplay-timeout="7000"
      :animation-speed="1000"
      :border="0"
      :width="slideWidth"
      :height="slideHeight"
    >
      <Slide
        class="carousel-slide"
        v-for="(image, idx) in carouselImages"
        :index="idx"
        :key="idx"
      >
        <v-img
          :src="image"
          alt="Sample image"
          :eager="true"
          @load="loadedImagesSet.add(image)"
        ></v-img>
      </Slide>
    </Carousel3d>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { Carousel3d, Slide } from '@nanoandrew4/vue3-carousel-3d'

export default defineComponent({
  components: {
    Carousel3d,
    Slide
  },
  mounted() {
    this.assignCarouselImages()
    setTimeout(() => {
      this.loadCarousel = true
    }, 4000)
  },
  data() {
    const carouselImages: string[] = []
    return {
      loadCarousel: false,
      carouselClass: 'carousel--faded',
      carouselImages,
      loadedImagesSet: new Set<string>()
    }
  },
  methods: {
    getScaledImage(img: string): string {
      const size = Math.max(this.slideWidth, this.slideHeight)
      if (size > 960 * 0.75) {
        return img.replace('.png', '_high.webp')
      } else if (size > 480 * 0.75) {
        return img.replace('.png', '_mid.webp')
      } else {
        return img.replace('.png', '_low.webp')
      }
    },
    assignCarouselImages() {
      this.loadedImagesSet.clear()
      if (this.isPortrait) {
        this.carouselImages = [
          this.getScaledImage('/images/sample_vert_1.png'),
          this.getScaledImage('/images/sample_vert_2.png'),
          this.getScaledImage('/images/sample_vert_3.png')
        ]
      } else {
        this.carouselImages = [
          this.getScaledImage('/images/sample_hor_1.png'),
          this.getScaledImage('/images/sample_hor_2.png'),
          this.getScaledImage('/images/sample_hor_3.png')
        ]
      }
    }
  },
  computed: {
    isPortrait(): boolean {
      return document.documentElement.clientWidth < document.documentElement.clientHeight
    },
    areImagesLoaded(): boolean {
      return this.loadCarousel && this.loadedImagesSet.size == this.carouselImages.length
    },
    showSubtext(): boolean {
      return this.areImagesLoaded && document.documentElement.clientWidth < document.documentElement.clientHeight *2
    },
    slideWidth(): number {
      if (this.isPortrait) {
        return document.documentElement.clientWidth * 0.55
      } else {
        return document.documentElement.clientWidth / 2
      }
    },
    slideHeight(): number {
      if (this.isPortrait) {
        return this.slideWidth * Math.SQRT2
      } else {
        return this.slideWidth / Math.SQRT2
      }
    }
  },
  watch: {
    areImagesLoaded(loaded: boolean) {
      if (loaded) {
        this.carouselClass = 'carousel--visible'
      } else {
        this.carouselClass = 'carousel--faded'
      }
    },
    isPortrait() {
      this.assignCarouselImages()
    }
  }
})
</script>

<style scoped>
.main {
  height: 90vh;
  overflow: hidden;
  display: flex;
  align-items: center;
}
@media (max-height: 500px) {
  .main {
    height: calc((100vh / 2) * sqrt(2));
  }
}
@media (max-width: 768px) {
  .main {
    height: fit-content;
  }
}

h1 {
  font-size: 1.5rem;
  padding-bottom: 2vh;
}

.main-text,
.main-text--bottom {
  position: absolute;
  top: calc(45%);
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  padding-left: 5vw;
  padding-right: 5vw;

  transition: top 0.5s ease;

  z-index: 2;
}

.subtext--faded,
.subtext {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 10px;
  text-align: center;

  transition: opacity 1s 1s ease;
}

.subtext--faded {
  opacity: 0;
}

.subtext {
  opacity: 1;
}

.main-text {
  justify-content: center;
  align-items: center;
}

.main-text--bottom {
  display: block;
  top: calc(80%);
}

@media (max-width: 768px) {
  .main-text--bottom {
    top: calc(60%);
  }
}

.carousel--faded,
.carousel--visible {
  transition: opacity 1s 1s ease;
}

.carousel--faded {
  opacity: 0;
}

.carousel--visible {
  opacity: 1;
}

.carousel-slide {
  border-radius: 4px;
}

a {
  text-decoration: none;
  color: rgb(var(--v-theme-text));
}
</style>
