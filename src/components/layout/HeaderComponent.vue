<template>
  <a-layout-header class="header">
    <div class="header-content">
      <!-- 左侧区域：Logo和品牌标识 -->
      <div class="header-left">
        <div class="logo-container">
          <div class="logo-box">
            <code-outlined class="logo-icon" />
          </div>
          <span class="logo-text">DevNoteHub</span>
        </div>

        <!-- 将折叠按钮移至左侧，更符合原型图设计 -->
        <a-button
            type="text"
            class="menu-toggle"
            @click="toggleSidebar"
        >
          <menu-outlined />
        </a-button>
      </div>

      <!-- 中间区域：搜索栏 -->
      <div class="header-center">
        <div class="search-container">
          <a-input-search
              placeholder="搜索笔记、标签或关键词..."
              class="search-input"
              :style="{ width: '100%' }"
              allow-clear
              v-model:value="searchValue"
              @search="onSearch"
          >
            <template #prefix>
              <search-outlined />
            </template>
          </a-input-search>
        </div>
      </div>

      <!-- 右侧区域：功能按钮和用户头像 -->
      <div class="header-right">
        <a-button type="text" class="action-button add-button">
          <plus-outlined />
        </a-button>

        <a-badge count="2" size="small" class="notification-badge">
          <a-button type="text" class="action-button">
            <bell-outlined />
          </a-button>
        </a-badge>

        <a-dropdown :trigger="['click']" placement="bottomRight">
          <div class="user-profile">
            <a-avatar class="user-avatar">JS</a-avatar>
            <span class="user-name">Java开发者</span>
            <down-outlined class="dropdown-icon" />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile">
                <user-outlined /> 个人中心
              </a-menu-item>
              <a-menu-item key="settings">
                <setting-outlined /> 系统设置
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout">
                <logout-outlined /> 退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  PlusOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  DownOutlined,
  CodeOutlined
} from '@ant-design/icons-vue';

// 搜索值
const searchValue = ref('');

// 侧边栏折叠状态
const collapsed = ref(false);

// 搜索方法
const onSearch = (value: string) => {
  console.log('搜索:', value);
};

// 折叠/展开侧边栏
const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
  // 触发事件通知父组件
  emit('update:collapsed', collapsed.value);
};

// 定义事件
const emit = defineEmits(['update:collapsed']);
</script>

<style scoped>
.header {
  background: #fff;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 56px; /* 根据原型图调整高度 */
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

/* 左侧区域样式 */
.header-left {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.logo-box {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  color: white;
  font-size: 18px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.menu-toggle {
  color: #595959;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0 12px;
  margin-right: 8px;
}

.menu-toggle:hover {
  color: var(--primary-color);
  background: transparent;
}

/* 中间区域样式 */
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
}

.search-container {
  width: 100%;
  max-width: 500px;
}

.search-input {
  border-radius: 4px;
  transition: all 0.3s;
}

.search-input:hover {
  border-color: #d9d9d9;
}

.search-input :deep(.ant-input) {
  background-color: transparent;
  font-size: 14px;
  height: 32px;
}

.search-input :deep(.ant-input-prefix) {
  color: #bfbfbf;
  margin-right: 8px;
}

/* 修复搜索按钮样式 */
.search-input :deep(.ant-input-search-button) {
  height: 32px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右侧区域样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #595959;
  background: transparent;
  transition: all 0.2s;
  padding: 0;
  margin: 0;
}

.action-button:hover {
  color: var(--primary-color);
  background-color: #f0f5ff;
}

.add-button {
  font-size: 16px;
}

.notification-badge :deep(.ant-badge-count) {
  box-shadow: none;
  transform: translate(50%, -50%);
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.user-profile:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background: var(--primary-gradient);
  color: white;
}

.user-name {
  font-size: 14px;
  color: #262626;
  margin: 0 4px 0 8px;
  display: none; /* 默认隐藏，在大屏幕上显示 */
}

.dropdown-icon {
  font-size: 12px;
  color: #8c9aad;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .header-content {
    padding: 0 24px;
  }

  .user-name {
    display: inline-block; /* 在较大屏幕上显示 */
  }
}

@media (min-width: 992px) {
  .search-container {
    max-width: 500px;
  }
}

@media (min-width: 1200px) {
  .search-container {
    max-width: 600px;
  }
}
</style>