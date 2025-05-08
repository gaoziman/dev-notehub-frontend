<template>
  <header class="header">
    <!-- 左侧区域：折叠按钮和应用名称 -->
    <div class="header-left">
      <n-tooltip placement="bottom">
        <template #trigger>
          <n-button text class="sidebar-toggle" @click="handleToggleSidebar">
            <template #icon>
              <n-icon size="20">
                <icon-font :type="isSidebarCollapsed ? 'icon-zhedie2' : 'icon-zhedie1'" />
              </n-icon>
            </template>
          </n-button>
        </template>
        {{ isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏' }}
      </n-tooltip>
    </div>

    <!-- 中间区域：增强版搜索框 -->
    <div class="enhanced-search-container">
      <div class="search-wrapper">
        <div class="search-icon-wrapper">
          <n-icon size="18" class="search-icon">
            <SearchOutline />
          </n-icon>
        </div>

        <input
            v-model="searchValue"
            class="enhanced-search-input"
            placeholder="搜索知识库、文档、代码片段..."
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            @keyup.enter="handleSearch"
        />

        <div class="search-actions" v-if="searchValue || searchFocused">
          <n-tooltip placement="bottom">
            <template #trigger>
              <n-button text class="search-action-btn" v-if="searchValue" @click="clearSearch">
                <n-icon size="16">
                  <CloseCircleOutline />
                </n-icon>
              </n-button>
            </template>
            清除搜索内容
          </n-tooltip>

          <div class="search-divider"></div>

          <n-tooltip placement="bottom">
            <template #trigger>
              <n-button text class="search-action-btn filter-btn">
                <n-icon size="16">
                  <FilterOutline />
                </n-icon>
                <span class="action-text">筛选</span>
              </n-button>
            </template>
            高级筛选选项
          </n-tooltip>
        </div>

        <n-tooltip placement="bottom">
          <template #trigger>
            <n-button
                class="search-primary-btn"
                :class="{ 'btn-active': searchValue }"
                type="primary"
                secondary
                size="small"
                @click="handleSearch"
            >
              <template #icon>
                <n-icon>
                  <SearchOutline />
                </n-icon>
              </template>
              搜索
            </n-button>
          </template>
          执行搜索
        </n-tooltip>
      </div>

      <div class="search-tags" v-if="searchFocused">
        <span class="search-tag">Spring Boot</span>
        <span class="search-tag">Vue3组件</span>
        <span class="search-tag">微服务架构</span>
        <span class="search-tag">RabbitMQ</span>
      </div>
    </div>

    <!-- 右侧区域：操作按钮和用户头像 -->
    <div class="header-right">
      <!-- 新建按钮 -->
      <n-tooltip placement="bottom">
        <template #trigger>
          <n-button circle secondary class="action-btn">
            <template #icon>
              <n-icon>
                <AddOutline />
              </n-icon>
            </template>
          </n-button>
        </template>
        创建新内容
      </n-tooltip>

      <!-- 通知按钮 -->
      <n-tooltip placement="bottom">
        <template #trigger>
          <n-badge dot class="notification-badge">
            <n-button circle secondary class="action-btn">
              <template #icon>
                <n-icon>
                  <NotificationsOutline />
                </n-icon>
              </template>
            </n-button>
          </n-badge>
        </template>
        查看通知
      </n-tooltip>

      <!-- 日历按钮 -->
      <n-tooltip placement="bottom">
        <template #trigger>
          <n-button circle secondary class="action-btn calendar-btn">
            <template #icon>
              <n-icon>
                <CalendarOutline />
              </n-icon>
            </template>
          </n-button>
        </template>
        日程管理
      </n-tooltip>

      <!-- 用户头像或登录按钮 - 修改后的代码 -->
      <div v-if="userStore.isLoggedIn">
        <n-dropdown
            :options="userMenuOptions"
            trigger="click"
            @select="handleUserAction"
        >
          <div class="user-avatar-wrapper">
            <n-avatar
                v-if="userStore.userInfo?.avatar"
                round
                size="small"
                :src="userStore.userInfo.avatar"
                :color="getUserAvatarColor()"
                :fallback-src="'/avatar-fallback.png'"
            />
            <n-avatar
                v-else
                round
                size="small"
                :color="getUserAvatarColor()"
            >
              {{ userStore.userInfo?.username?.charAt(0).toUpperCase() || 'U' }}
            </n-avatar>
            <span class="user-name">{{ userStore.userInfo?.username || '用户' }}</span>
            <n-icon size="14" class="dropdown-arrow">
              <ChevronDownOutline />
            </n-icon>
          </div>
        </n-dropdown>
      </div>
      <n-button
          v-else
          type="primary"
          class="login-button"
          @click="showAuthModal = true; authModalMode = 'login'"
      >
        登录
      </n-button>
    </div>
  </header>

  <!-- 图标库管理示例 - 仅作为参考，实际图标库可能在其他组件中 -->
  <div class="icon-library-example" v-if="showIconLibraryExample">
    <div class="icon-grid">
      <n-tooltip v-for="icon in iconExamples" :key="icon.name" placement="top">
        <template #trigger>
          <div class="icon-item">
            <n-icon size="24" class="icon">
              <icon-font :type="icon.type" />
            </n-icon>
            <div class="icon-name">{{ icon.name }}</div>
          </div>
        </template>
        {{ icon.description }}
      </n-tooltip>
    </div>
  </div>

  <!-- 登录模态框 -->
  <auth-modal v-model:show="showAuthModal" :default-mode="authModalMode" @login-success="handleLoginSuccess" />
</template>

<script setup>
import {ref, computed, h} from 'vue';
import {
  SearchOutline,
  AddOutline,
  NotificationsOutline,
  CalendarOutline,
  ChevronDownOutline,
  FilterOutline,
  CloseCircleOutline,
  PersonOutline,
  LogOutOutline
} from '@vicons/ionicons5';
import {useRouter} from 'vue-router';
import {useUserStore} from '@/stores/user';
import {useMessage} from 'naive-ui';
import AuthModal from '@/components/auth/AuthModal.vue';
import IconFont from "@/components/common/IconFont.vue";

// 获取用户头像颜色
const getUserAvatarColor = () => {
  return '#6366F1';
};

// 从父组件接收侧边栏状态
const props = defineProps({
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  },
  showIconLibraryExample: {
    type: Boolean,
    default: false
  }
});

// 定义向父组件发送的事件
const emit = defineEmits(['toggle-sidebar']);

const searchValue = ref('');
const searchFocused = ref(false);
const showAuthModal = ref(false);
const authModalMode = ref('login');

// 使用store和路由
const router = useRouter();
const message = useMessage();
const userStore = useUserStore();

// 用户菜单选项 - 新增
const userMenuOptions = computed(() => [
  {
    label: '个人中心',
    key: 'settings',
    icon: () => h(IconFont, {type: 'icon-shijian2'})
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(IconFont, {type: 'icon-sousuo-'})
  }
]);

// 清除搜索内容
const clearSearch = () => {
  searchValue.value = '';
};

// 处理用户菜单操作
const handleUserAction = (key) => {
  switch (key) {
    case 'logout':
      userStore.logout();
      message.success('已成功退出登录');
      router.push('/');
      break;
    case 'settings':
      router.push('/settings');
      break;
  }
};

// 处理头像URL
const processAvatarUrl = (url) => {
  if (!url) return '';

  try {
    // 移除查询参数，仅使用基本URL
    // 这解决了带有复杂签名参数的MinIO URL的问题
    const urlObj = new URL(url);
    // 移除所有查询参数
    urlObj.search = '';
    console.log('处理后的头像URL:', urlObj.toString());
    return urlObj.toString();
  } catch (e) {
    console.error('处理头像URL时出错:', e);
    return '';
  }
};

// 处理登录成功
const handleLoginSuccess = () => {
  showAuthModal.value = false;
  message.success('登录成功，欢迎回来！');
};

// 向父组件发送折叠事件
const handleToggleSidebar = () => {
  emit('toggle-sidebar');
};

// 处理搜索
const handleSearch = () => {
  if (searchValue.value.trim()) {
    router.push({
      path: '/search',
      query: {keyword: searchValue.value}
    });
  }
};

// 图标示例数据 - 这里仅用于演示，实际应用中可能来自API或其他组件
const iconExamples = [
  {
    type: 'icon-zhedie1',
    name: 'icon-zhedie1',
    description: '折叠/展开侧边栏（展开状态）'
  },
  {
    type: 'icon-zhedie2',
    name: 'icon-zhedie2',
    description: '折叠/展开侧边栏（折叠状态）'
  },
  {
    type: 'icon-zhedie3',
    name: 'icon-zhedie3',
    description: '折叠菜单（变体3）'
  },
  {
    type: 'icon-zhedie4',
    name: 'icon-zhedie4',
    description: '折叠菜单（变体4）'
  },
  {
    type: 'icon-zhedie21',
    name: 'icon-zhedie21',
    description: '折叠菜单（变体21）'
  },
  {
    type: 'icon-caidanzhedie',
    name: 'icon-caidanzhedie',
    description: '菜单折叠控制'
  },
  {
    type: 'icon-xiangzuozhankai',
    name: 'icon-xiangzuozhankai',
    description: '向左展开菜单'
  },
  {
    type: 'icon-tubiaoku',
    name: 'icon-tubiaoku',
    description: '图标库'
  },
  {
    type: 'icon-tubiaoku-1',
    name: 'icon-tubiaoku-1',
    description: '图标库（变体1）'
  },
  {
    type: 'icon-tubiaoku-2',
    name: 'icon-tubiaoku-2',
    description: '图标库（变体2）'
  },
  {
    type: 'icon-link',
    name: 'icon-link',
    description: '链接'
  },
  {
    type: 'icon-links',
    name: 'icon-links',
    description: '多链接/链接列表'
  },
  {
    type: 'icon-link_flat',
    name: 'icon-link_flat',
    description: '扁平风格链接'
  },
  {
    type: 'icon-biji',
    name: 'icon-biji',
    description: '笔记/文档'
  },
  {
    type: 'icon-icon-moon',
    name: 'icon-icon-moon',
    description: '夜间模式'
  },
  {
    type: 'icon-icon-sun',
    name: 'icon-icon-sun',
    description: '日间模式'
  }
];
</script>

<style scoped>
.header {
  height: var(--header-height, 60px);
  background-color: #fff;
  border-bottom: 1px solid rgba(229, 231, 235, 0.6);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 左侧区域样式 */
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 100px;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366F1;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background-color: rgba(99, 102, 241, 0.08);
}

.app-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-left: 4px;
}

/* 增强的搜索区域样式 */
.enhanced-search-container {
  flex: 1;
  max-width: 600px;
  margin: 0 16px;
  position: relative;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  height: 42px;
  padding: 0 6px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-wrapper:hover, .search-wrapper:focus-within {
  border-color: #6366F1;
  background-color: #fff;
  box-shadow: 0 1px 8px rgba(99, 102, 241, 0.15);
}

.search-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.search-icon {
  color: #6366F1;
}

.enhanced-search-input {
  flex: 1;
  border: none;
  background: transparent;
  height: 100%;
  padding: 0 8px;
  font-size: 14px;
  color: #374151;
  outline: none;
}

.enhanced-search-input::placeholder {
  color: #9ca3af;
}

.search-actions {
  display: flex;
  align-items: center;
  height: 100%;
}

.search-action-btn {
  color: #6b7280;
  padding: 0 4px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-action-btn:hover {
  color: #6366F1;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-text {
  font-size: 12px;
}

.search-divider {
  width: 1px;
  height: 20px;
  background-color: #e5e7eb;
  margin: 0 4px;
}

.search-primary-btn {
  height: 32px;
  margin-left: 6px;
  border-radius: 6px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-primary-btn:hover, .btn-active {
  background-color: #6366F1;
  color: white;
}

.search-tags {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  z-index: 10;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-tag {
  font-size: 12px;
  padding: 2px 10px;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-tag:hover {
  background-color: #6366F1;
  color: white;
}

/* 右侧区域样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  color: #64748b;
  background-color: rgba(226, 232, 240, 0.5);
  transition: all 0.2s;
  height: 36px;
  width: 36px;
}

.action-btn:hover {
  color: #6366F1;
  background-color: rgba(99, 102, 241, 0.08);
}

.notification-badge {
  margin-top: 2px;
}

/* 用户头像样式 - 重新设计 */
.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  background-color: rgba(245, 247, 250, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.user-avatar-wrapper:hover {
  background-color: rgba(236, 239, 253, 0.9);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.08);
  transform: translateY(-1px);
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-right: 2px;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.user-avatar-wrapper:hover .dropdown-arrow {
  color: #6366F1;
  transform: translateY(1px);
}

/* 登录按钮样式 */
.login-button {
  background-color: #6366F1;
  color: #ffffff;
  border-radius: 6px;
  font-weight: 500;
  padding: 0 16px;
  height: 36px;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
}

.login-button:hover {
  background-color: #4f46e5;
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

/* 图标库示例样式 */
.icon-library-example {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.icon-item:hover {
  background-color: rgba(99, 102, 241, 0.08);
}

.icon {
  color: #6366F1;
  margin-bottom: 8px;
}

.icon-name {
  font-size: 12px;
  color: #64748b;
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
}

/* Naive UI Dropdown 样式覆盖 */
:deep(.n-dropdown-menu) {
  min-width: 140px !important;
  padding: 6px !important;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(229, 231, 235, 0.6) !important;
}

:deep(.n-dropdown-option) {
  border-radius: 6px !important;
  padding: 8px 10px !important;
  margin: 2px 0 !important;
  transition: all 0.2s ease !important;
}

:deep(.n-dropdown-option:hover) {
  background-color: rgba(99, 102, 241, 0.08) !important;
}

:deep(.n-dropdown-option-icon) {
  color: #6366F1 !important;
  margin-right: 8px !important;
}

:deep(.n-dropdown-option-body__prefix) {
  width: 16px !important;
  font-size: 16px !important;
}

:deep(.n-dropdown-option-body__label) {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #4b5563 !important;
}

:deep(.n-dropdown-divider) {
  margin: 4px 0 !important;
}
</style>