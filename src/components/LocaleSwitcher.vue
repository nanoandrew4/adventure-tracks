<template>
  <div class="locale-changer">
    <v-menu :location="'bottom'">
      <template v-slot:activator="{ props }">
        <v-btn
          theme="dark"
          v-bind="props"
        >
          {{ $i18n.locale }}
        </v-btn>
      </template>

      <v-list theme="dark">
        <v-list-item
          v-for="(locale, index) in $i18n.availableLocales"
          :key="index"
        >
          <v-list-item-title @click="$i18n.locale = locale">{{ locale }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>
.v-list-item {
  cursor: pointer;
}
</style>
