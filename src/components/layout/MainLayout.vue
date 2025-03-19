<template>
  <a-layout class="main-layout">
    <header-component @update:collapsed="onCollapsedChange" />

    <a-layout>
      <sidebar-component
          v-if="userStore.isLoggedIn()"
          :collapsed="collapsed"
      />

      <a-layout-content
          class="main-content"
          :class="{ 'with-sidebar': userStore.isLoggedIn() }"
      >
        <slot></slot>
      </a-layout-content>
    </a-layout>

    <footer-component />
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeaderComponent from './HeaderComponent.vue';
import SidebarComponent from './SidebarComponent.vue';
import FooterComponent from './FooterComponent.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 侧边栏折叠状态
const collapsed = ref(false);

// 侧边栏折叠状态变更
const onCollapsedChange = (value: boolean) => {
  collapsed.value = value;
};
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.main-content {
  padding: 24px;
  margin-top: 56px; /* 为固定的header留出空间 */
  min-height: calc(100vh - 56px - 60px); /* 减去header和footer的高度 */
  background-color: var(--bg-secondary);
  transition: padding-left 0.3s ease;
}

.main-content.with-sidebar {
  padding-left: 200px; /* 侧边栏展开时的内容区域左边距 */
}

.main-content.with-sidebar.collapsed {
  padding-left: 80px; /* 侧边栏折叠时的内容区域左边距 */
}

@media (max-width: 768px) {
  .main-content.with-sidebar {
    padding-left: 0;
  }
}
</style>