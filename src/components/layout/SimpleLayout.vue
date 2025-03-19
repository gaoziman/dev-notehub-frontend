<template>
  <a-layout class="simple-layout">
    <!-- 不包含顶部导航和侧边栏，仅包含主内容区域和页脚 -->
    <a-layout-content class="main-content">
      <slot></slot>
    </a-layout-content>

    <footer-component />
  </a-layout>
</template>

<script setup lang="ts">
import FooterComponent from './FooterComponent.vue';
</script>

<style scoped>
.simple-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background-color: var(--bg-secondary);
}
</style>