<template>
  <a-layout-header class="header">
    <div class="header-content">
      <!-- 左侧区域：Logo和菜单按钮 -->
      <div class="header-left">
        <div class="logo-container">
          <div class="logo-box">
            <code-outlined class="logo-icon" />
          </div>
          <span class="logo-text">DevNoteHub</span>
        </div>

        <a-button
            type="text"
            class="menu-toggle"
            @click="toggleSidebar"
        >
          <menu-outlined />
        </a-button>
      </div>

      <!-- 中间区域：搜索栏 - 全新设计 -->
      <div class="header-center">
        <div class="search-wrapper">
          <a-input
              v-model:value="searchValue"
              placeholder="搜索笔记、标签或关键词..."
              class="search-input"
              @pressEnter="onSearch"
          >
            <template #prefix>
              <search-outlined class="search-icon" />
            </template>
          </a-input>
          <a-button
              type="primary"
              class="search-button"
              @click="onSearch"
          >
            <search-outlined />
          </a-button>
        </div>
      </div>

      <!-- 右侧区域保持不变 -->
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
const onSearch = () => {
  if (searchValue.value.trim()) {
    console.log('正在搜索:', searchValue.value);
    // 此处实现搜索逻辑
  }
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
  height: 56px;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

/* 左侧区域样式保持不变 */
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
  color: #1C4ED8;
  background: transparent;
}

/* 中间区域样式 - 全新搜索框设计 */
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
}

.search-wrapper {
  width: 100%;
  max-width: 500px;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.search-wrapper:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-wrapper:focus-within {
  border-color: #1C4ED8;
  box-shadow: 0 0 0 2px rgba(28, 78, 216, 0.1);
}

.search-input {
  flex: 1;
  border: none;
  box-shadow: none !important;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  box-shadow: none !important;
}

.search-input :deep(.ant-input) {
  border: none !important;
  box-shadow: none !important;
  padding-left: 12px;
  height: 36px;
  color: #333333;
}

.search-input :deep(.ant-input-prefix) {
  margin-right: 8px;
}

.search-input :deep(.ant-input)::placeholder {
  color: #9ca3af;
}

.search-icon {
  color: #9ca3af;
  font-size: 16px;
}

.search-button {
  height: 36px;
  border: none;
  border-radius: 0;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  background-color: #1C4ED8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  padding: 0;
  transition: all 0.3s ease;
}

.search-button:hover {
  background-color: #0F38A9;
}

/* 右侧区域样式保持不变，但调整一下图标和按钮 */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  background: transparent;
  transition: all 0.2s;
  padding: 0;
  margin: 0;
}

.action-button:hover {
  color: #1C4ED8;
  background-color: #f5f7fa;
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
  border-radius: 6px;
  transition: all 0.2s;
}

.user-profile:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
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
</style>