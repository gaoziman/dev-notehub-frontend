<template>
  <a-layout class="main-layout">
    <header-component
        @update:collapsed="sidebarCollapsed = $event"
        :collapsed="sidebarCollapsed"
    />
    <a-layout>
      <sidebar-component :collapsed="sidebarCollapsed" />
      <a-layout-content
          class="main-content"
          :class="{ 'content-collapsed': sidebarCollapsed }"
      >
        <div class="content-container">
          <slot></slot>
        </div>
        <footer-component />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeaderComponent from './HeaderComponent.vue';
import SidebarComponent from './SidebarComponent.vue';
import FooterComponent from './FooterComponent.vue';

const sidebarCollapsed = ref(false);
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.main-content {
  margin-left: 200px;
  margin-top: 56px;
  padding: 0;
  background-color: #f7fafc;
  min-height: calc(100vh - 56px);
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;
}

.content-container {
  flex: 1;
  padding: 20px;
}

.content-collapsed {
  margin-left: 56px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .content-container {
    padding: 16px;
  }
}
</style>