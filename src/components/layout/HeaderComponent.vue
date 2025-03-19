<template>
  <a-layout-header class="header">
    <div class="header-content">
      <!-- 左侧区域：Logo和菜单按钮 -->
      <div class="header-left">
        <div class="logo-container" @click="navigateHome">
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

      <!-- 中间区域：搜索栏 -->
      <div class="header-center">
        <div class="search-container">
          <div class="search-wrapper">
            <a-input
                v-model:value="searchValue"
                placeholder="搜索笔记、标签或关键词..."
                class="search-input"
                @pressEnter="onSearch"
            />
            <a-button
                type="primary"
                class="search-button"
                @click="onSearch"
            >
              <search-outlined />
            </a-button>
          </div>
        </div>
      </div>

      <!-- 右侧区域：根据登录状态显示不同内容 -->
      <div class="header-right">
        <!-- 登录状态下显示的内容 -->
        <template v-if="userStore.isLoggedIn()">
          <a-button type="text" class="action-button add-button" @click="showCreateMenu">
            <plus-outlined />
          </a-button>

          <a-badge :count="notificationCount" :dot="notificationCount > 0" size="small" class="notification-badge">
            <a-button type="text" class="action-button" @click="toggleNotifications">
              <bell-outlined />
            </a-button>
          </a-badge>

          <a-dropdown :trigger="['click']" placement="bottomRight">
            <div class="user-profile">
              <a-avatar :src="userAvatar" class="user-avatar">
                {{ userInitials }}
              </a-avatar>
              <span class="user-name">{{ displayUsername }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="goToProfile">
                  <user-outlined /> 个人中心
                </a-menu-item>
                <a-menu-item key="settings" @click="goToSettings">
                  <setting-outlined /> 系统设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <logout-outlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>

        <!-- 未登录状态下显示的内容 -->
        <template v-else>
          <a-button
              type="primary"
              class="login-button"
              @click="openAuthModal('login')"
          >
            登录
          </a-button>
          <a-button
              class="register-button"
              @click="openAuthModal('register')"
          >
            注册
          </a-button>
        </template>
      </div>
    </div>

    <!-- 创建菜单下拉面板 -->
    <a-dropdown
        v-model:visible="createMenuVisible"
        :trigger="['click']"
        placement="bottomRight"
        overlayClassName="create-menu-dropdown"
    >
      <template #overlay>
        <a-menu>
          <a-menu-item key="note" @click="createNote">
            <form-outlined /> 新建笔记
          </a-menu-item>
          <a-menu-item key="folder" @click="createFolder">
            <folder-add-outlined /> 新建文件夹
          </a-menu-item>
          <a-menu-item key="tag" @click="createTag">
            <tag-outlined /> 新建标签
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="import" @click="importContent">
            <import-outlined /> 导入内容
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <!-- 登录/注册模态框 -->
    <auth-modal ref="authModalRef" @login-success="onLoginSuccess" />
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  PlusOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  DownOutlined,
  CodeOutlined,
  FormOutlined,
  FolderAddOutlined,
  TagOutlined,
  ImportOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';
import AuthModal from '@/components/auth/AuthModal.vue';

// 创建路由实例
const router = useRouter();

// 获取用户状态
const userStore = useUserStore();

// 引用AuthModal组件
const authModalRef = ref();

// 搜索值
const searchValue = ref('');

// 侧边栏折叠状态
const collapsed = ref(false);

// 创建菜单可见性
const createMenuVisible = ref(false);

// 通知数量
const notificationCount = ref(0);

// 计算用户头像显示的内容
const userInitials = computed(() => {
  if (!userStore.userInfo?.username) return '';

  // 提取用户名的首字母
  const username = userStore.userInfo.username;
  if (username.length <= 2) return username.toUpperCase();

  // 如果有空格，返回首字母和姓氏首字母
  if (username.includes(' ')) {
    const parts = username.split(' ');
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // 否则返回前两个字符
  return username.substring(0, 2).toUpperCase();
});

// 用户头像URL（如果有）
const userAvatar = computed(() => {
  return userStore.userInfo?.avatar || '';
});

// 显示的用户名
const displayUsername = computed(() => {
  return userStore.userInfo?.username || '用户';
});

// 搜索方法
const onSearch = () => {
  if (searchValue.value.trim()) {
    console.log('正在搜索:', searchValue.value);
    // 此处实现搜索逻辑
    router.push({
      path: '/search',
      query: { q: searchValue.value.trim() }
    });
  }
};

// 折叠/展开侧边栏
const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
  // 触发事件通知父组件
  emit('update:collapsed', collapsed.value);
};

// 回到首页
const navigateHome = () => {
  router.push('/');
};

// 打开创建菜单
const showCreateMenu = () => {
  createMenuVisible.value = true;
};

// 创建笔记
const createNote = () => {
  createMenuVisible.value = false;
  router.push('/notes/create');
};

// 创建文件夹
const createFolder = () => {
  createMenuVisible.value = false;
  router.push('/folders/create');
};

// 创建标签
const createTag = () => {
  createMenuVisible.value = false;
  router.push('/tags/create');
};

// 导入内容
const importContent = () => {
  createMenuVisible.value = false;
  router.push('/import');
};

// 打开认证模态框
const openAuthModal = (tab: 'login' | 'register') => {
  authModalRef.value.openModal(tab);
};

// 登录成功后的回调
const onLoginSuccess = () => {
  message.success('欢迎回来，' + displayUsername.value);
  // 可以添加额外的逻辑，如跳转到仪表盘等
  if (router.currentRoute.value.query.redirect) {
    router.push(router.currentRoute.value.query.redirect as string);
  } else {
    router.push('/dashboard');
  }
};

// 切换通知面板
const toggleNotifications = () => {
  // 这里可以实现通知面板的显示逻辑
  console.log('打开通知面板');
};

// 前往个人中心
const goToProfile = () => {
  router.push('/profile');
};

// 前往系统设置
const goToSettings = () => {
  router.push('/settings');
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
  message.success('您已成功退出登录');
  router.push('/');
};

// 获取通知数量（示例）
const fetchNotificationCount = async () => {
  try {
    // 这里应该是真实的API调用
    // const response = await api.getNotificationCount();
    // notificationCount.value = response.data.count;

    // 模拟获取通知数量
    setTimeout(() => {
      notificationCount.value = Math.floor(Math.random() * 5);
    }, 1000);
  } catch (error) {
    console.error('获取通知数量失败:', error);
  }
};

// 监听用户登录状态变化
watch(() => userStore.isLoggedIn(), (newValue) => {
  if (newValue) {
    // 用户登录后获取通知数量
    fetchNotificationCount();
  } else {
    // 用户登出后重置通知数量
    notificationCount.value = 0;
  }
});

// 组件挂载时检查并获取通知
onMounted(() => {
  if (userStore.isLoggedIn()) {
    fetchNotificationCount();
  }
});

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
  cursor: pointer;
  transition: all 0.2s ease;
}

.logo-container:hover {
  opacity: 0.85;
}

.logo-box {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(28, 78, 216, 0.15);
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
  border-radius: 6px;
  transition: all 0.2s ease;
}

.menu-toggle:hover {
  color: #1C4ED8;
  background: rgba(28, 78, 216, 0.05);
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
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-wrapper {
  position: absolute;
  left: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.search-icon {
  color: #b0b0b0;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-container:hover .search-icon {
  color: #808080;
}

.search-container:focus-within .search-icon {
  color: #3662D9;
  transform: scale(1.1);
}

.search-wrapper {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid #eeeeee;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  background-color: #fafafa;
}

.search-container:hover .search-wrapper {
  border-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  background-color: #ffffff;
}

.search-container:focus-within .search-wrapper {
  border-color: #3662D9;
  box-shadow: 0 0 0 3px rgba(28, 78, 216, 0.12);
  background-color: #ffffff;
}

.search-input {
  flex: 1;
  border: none;
  box-shadow: none !important;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: transparent;
}

.search-input:focus {
  outline: none;
  box-shadow: none !important;
}

.search-input :deep(.ant-input) {
  border: none !important;
  box-shadow: none !important;
  padding-left: 36px;
  height: 42px;
  color: #333333;
  background-color: transparent;
  transition: all 0.3s ease;
}

.search-input :deep(.ant-input)::placeholder {
  color: #b0b0b0;
  transition: color 0.3s ease;
}

.search-container:hover .search-input :deep(.ant-input)::placeholder {
  color: #909090;
}

.search-button {
  height: 42px;
  border: none;
  border-radius: 0;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.search-button:hover {
  background: linear-gradient(135deg, #0F38A9 0%, #1C4ED8 100%);
  box-shadow: 0 0 12px rgba(28, 78, 216, 0.2);
}

.search-button:active {
  transform: scale(0.98);
}

.search-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.search-button:hover::after {
  transform: translate(-50%, -50%) scale(2);
  opacity: 1;
}

/* 右侧区域样式 */
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
  background-color: rgba(28, 78, 216, 0.05);
}

.add-button {
  font-size: 16px;
}

.notification-badge :deep(.ant-badge-count) {
  box-shadow: none;
  transform: translate(50%, -50%);
  background: #ff4d4f;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.user-profile:hover {
  background-color: rgba(28, 78, 216, 0.05);
}

.user-avatar {
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  color: white;
  box-shadow: 0 2px 5px rgba(28, 78, 216, 0.2);
}

.user-name {
  font-size: 14px;
  color: #262626;
  margin: 0 4px 0 8px;
  display: none;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.dropdown-icon {
  font-size: 12px;
  color: #8c9aad;
}

/* 登录注册按钮 */
.login-button {
  height: 36px;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  padding: 0 16px;
  box-shadow: 0 2px 6px rgba(28, 78, 216, 0.15);
  transition: all 0.2s;
}

.login-button:hover {
  background: linear-gradient(135deg, #0F38A9 0%, #1C4ED8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(28, 78, 216, 0.2);
}

.register-button {
  height: 36px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-weight: 500;
  padding: 0 16px;
  color: #595959;
  transition: all 0.2s;
}

.register-button:hover {
  color: #1C4ED8;
  border-color: #1C4ED8;
  background: rgba(28, 78, 216, 0.02);
}

/* 创建菜单下拉样式 */
:deep(.create-menu-dropdown .ant-dropdown-menu) {
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

:deep(.create-menu-dropdown .ant-dropdown-menu-item) {
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 2px;
  font-weight: 500;
}

:deep(.create-menu-dropdown .ant-dropdown-menu-item:hover) {
  background-color: rgba(28, 78, 216, 0.05);
  color: #1C4ED8;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .header-content {
    padding: 0 24px;
  }

  .user-name {
    display: inline-block;
  }
}
</style>