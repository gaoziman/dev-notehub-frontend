<template>
  <header class="header">
    <div class="flex items-center">
      <n-button text @click="handleToggleSidebar">
        <template #icon>
          <n-icon size="20">
            <icon-font :type="isSidebarCollapsed ? 'icon-zhedie2' : 'icon-zhedie-01'" />
          </n-icon>
        </template>
      </n-button>
    </div>

    <div class="search-container">
      <n-input
          v-model:value="searchValue"
          placeholder="搜索知识..."
          class="search-input"
      >
        <template #prefix>
          <n-icon>
            <SearchOutline />
          </n-icon>
        </template>
      </n-input>
    </div>

    <div class="flex items-center gap-2">
      <n-button circle secondary>
        <template #icon>
          <n-icon>
            <AddOutline />
          </n-icon>
        </template>
      </n-button>

      <n-badge dot>
        <n-button circle secondary>
          <template #icon>
            <n-icon>
              <NotificationsOutline />
            </n-icon>
          </template>
        </n-button>
      </n-badge>

      <n-dropdown :options="userOptions" trigger="click">
        <n-avatar round size="medium" color="#6366F1">J</n-avatar>
      </n-dropdown>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import {
  SearchOutline,
  AddOutline,
  NotificationsOutline
} from '@vicons/ionicons5';
import IconFont from "@/components/common/IconFont.vue"; // 确保导入IconFont组件

// 从父组件接收侧边栏状态
const props = defineProps({
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  }
});

// 定义向父组件发送的事件
const emit = defineEmits(['toggle-sidebar']);

const searchValue = ref('');

const userOptions = [
  {
    label: '个人设置',
    key: 'settings'
  },
  {
    label: '退出登录',
    key: 'logout'
  }
];

// 修改为向父组件发送事件
const handleToggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>

<style scoped>
.header {
  height: var(--header-height);
  background-color: var(--card-color);
  border-bottom: 1px solid var(--divider-color);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 9;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 24px;
}

.search-input {
  border-radius: 20px;
}
</style>