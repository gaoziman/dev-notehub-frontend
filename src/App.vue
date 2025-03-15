<template>
  <a-config-provider :theme="theme">
    <main-layout>
      <router-view />
    </main-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MainLayout from './components/layout/MainLayout.vue';

// 定义自定义主题
const theme = ref({
  token: {
    colorPrimary: '#3490dc',
    colorSuccess: '#38b2ac',
    colorWarning: '#ecc94b',
    colorError: '#e53e3e',
    colorInfo: '#3490dc',
    borderRadius: 8,
    wireframe: false,
  },
});
</script>

<style>
@import './assets/styles/base.css';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
  'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>