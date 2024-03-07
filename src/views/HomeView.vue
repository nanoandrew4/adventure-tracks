<template>
  <main class="main">
    <div class="main-text">
      <h1>You've done something great.</h1>
      <h2>Let immortalize it.</h2>
      <a href="/create">Begin</a>
    </div>
  </main>
</template>

<style scoped>
.main {
  height: 100%;
}
.main-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  height: 100%;
}

a {
  text-decoration: none;
  color: rgb(var(--v-theme-text));
}
</style>
