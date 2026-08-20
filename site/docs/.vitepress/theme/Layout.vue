<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import InstallTerminal from './InstallTerminal.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-image>
      <InstallTerminal />
    </template>
  </DefaultTheme.Layout>
</template>
