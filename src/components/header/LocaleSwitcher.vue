<template>
  <div class="locale-changer">
    <v-menu
      open-on-hover
      :location="'bottom'"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="selected-locale text-none"
          >{{ $t('lang.' + $i18n.locale) }}</v-btn
        >
      </template>

      <v-list>
        <v-list-item
          v-for="(locale, index) in $i18n.availableLocales.filter((l) => l != $i18n.locale)"
          :key="index"
        >
          <v-list-item-title @click="$i18n.locale = locale">{{
            $t('lang.' + locale)
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>
.selected-locale,
.v-list-item {
  cursor: pointer;
}

.selected-locale {
  font-size: 1.2rem;
  color: unset !important;
}
</style>
