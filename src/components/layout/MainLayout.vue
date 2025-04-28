<template>
  <div class="main-layout">
    <AppSidebar :is-collapsed="isSidebarCollapsed" />
    <div class="content-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <AppHeader :is-sidebar-collapsed="isSidebarCollapsed" @toggle-sidebar="toggleSidebar" />
      <div class="main-content">
        <router-view />
      </div>
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

// 在父组件中管理侧边栏状态，作为单一数据源
const isSidebarCollapsed = ref(false);

// 切换侧边栏状态的方法
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-duration) var(--transition-timing-function);
}

.content-container.sidebar-collapsed {
  margin-left: 80px;
}

.main-content {
  flex: 1;
  padding: var(--content-padding);
  background-color: var(--body-color);
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
}
</style>