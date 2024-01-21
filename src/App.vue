<template>
    <header>
        <img
            alt="Vue logo"
            class="logo"
            src="@/assets/logo.svg"
            width="50"
            height="50"
        />

        <div class="wrapper">
            <nav>
                <RouterLink to="/">{{ t('header.home') }}</RouterLink>
                <RouterLink to="/create">{{ t('header.creator') }}</RouterLink>
                <RouterLink to="/about">{{ t('header.about') }}</RouterLink>
            </nav>
            <LocaleSwitcher/>
        </div>
    </header>

    <RouterView />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LocaleSwitcher from './components/LocaleSwitcher.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
header {
    line-height: 1.5;
    min-height: 5vh;
    max-height: 5vh;
    width: 100%;
}

.logo {
    display: block;
    max-height: 100%;
}

nav {
    width: 100%;
    font-size: 12px;
    text-align: center;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        align-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        /* margin: 1rem 1rem 0 1rem; */
    }

    header .wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: fit-content;
    }

    nav {
        text-align: center;
        margin-left: -1rem;
        font-size: 1rem;

        /* padding: 1rem 0; */
    }
}
</style>
