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
    colorPrimary: '#1C4ED8', // 修改为#1C4ED8蓝色
    colorSuccess: '#38b2ac',
    colorWarning: '#ecc94b',
    colorError: '#e53e3e',
    colorInfo: '#1C4ED8',
    colorText: '#1a202c', // 更深的文本颜色
    colorTextSecondary: '#4a5568', // 更深的次要文本颜色
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
  color: #262626; /* 更深的基础文本颜色 */
}

/* 全局文本颜色增强 */
h1, h2, h3, h4, h5, h6 {
  color: #111827; /* 标题使用更深的颜色 */
}

p, span, div {
  color: #262626; /* 普通文本使用较深的颜色 */
}

/* 改进菜单文本样式 */
.ant-menu-item {
  color: #262626 !important;
  font-weight: 500 !important;
}

/* 链接样式优化 */
a {
  color: #1C4ED8;
  text-decoration: none;
}

a:hover {
  color: #0F38A9;
}
</style>