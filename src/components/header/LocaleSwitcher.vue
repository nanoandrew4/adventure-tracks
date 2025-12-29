<template>
  <div class="locale-changer">
    <v-menu
      open-on-hover
      open-on-click
      :location="'bottom'"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="selected-locale text-none"
          >{{ $t('lang.' + i18n.locale.value) }}</v-btn
        >
      </template>

      <v-list>
        <v-list-item
          v-for="(locale, index) in i18n.availableLocales.filter((l) => l != i18n.locale.value)"
          :key="index"
        >
          <v-list-item-title @click="i18n.locale.value = locale">{{
            $t('lang.' + locale)
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
</script>

<style scoped>
.locale-changer {
  width: fit-content;
}

.selected-locale,
.v-list-item {
  cursor: pointer;
}

.selected-locale {
  font-size: 1.2rem;
  color: unset !important;
}
</style>
