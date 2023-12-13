<template>
  <div class="configurator">
    <v-expansion-panels
      theme="dark"
      variant="accordion"
      :mandatory="'force'"
    >
      <v-expansion-panel class="configurator-section-header" :title="$t('creator.config-panel.activities')">
        <v-expansion-panel-text>
          <ActivitiesSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel class="configurator-section-header" :title="$t('creator.config-panel.map-styles')">
        <v-expansion-panel-text>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel class="configurator-section-header" :title="$t('creator.config-panel.adventure')">
        <v-expansion-panel-text>
          <AdventureSection/>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    
    <v-btn
      class="configurator-save-btn"
      :text="$t('creator.config-panel.save')"
      @click="$emit('capture')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ActivitiesSection from './ActivitiesSection.vue'
import AdventureSection from './AdventureSection.vue'

export default defineComponent({
  components: {
    ActivitiesSection,
    AdventureSection
  }
})
</script>

<style>
.configurator {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  margin-left: 1em;
}

.configurator-section-header {
  & > button {
    font-size: 1.5em;
  }
}

.configurator-save-btn {
  margin-top: 1vw;
  width: 80%;
  color: black;
}
</style>
