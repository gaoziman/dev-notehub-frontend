<!-- SidebarComponent.vue -->
<template>
  <a-layout-sider
      class="sidebar"
      :width="200"
      :collapsed-width="56"
      :collapsed="collapsed"
      :trigger="null"
      collapsible
  >
    <div class="sidebar-content">
      <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          class="sidebar-menu main-nav-menu"
          :inline-collapsed="collapsed"
      >
        <a-menu-item-group :title="collapsed ? '' : '主导航'" class="menu-group main-nav-group">
          <a-menu-item key="dashboard" @click="handleMenuClick('dashboard')">
            <template #icon><home-outlined /></template>
            <span>仪表盘</span>
          </a-menu-item>
          <a-menu-item key="notes" @click="handleMenuClick('notes')">
            <template #icon><book-outlined /></template>
            <span>我的笔记</span>
          </a-menu-item>
          <a-menu-item key="progress" @click="handleMenuClick('progress')">
            <template #icon><bar-chart-outlined /></template>
            <span>学习进度</span>
          </a-menu-item>
          <a-menu-item key="resources" @click="handleMenuClick('resources')">
            <template #icon><link-outlined /></template>
            <span>收藏资源</span>
          </a-menu-item>
          <a-menu-item key="tags" @click="handleMenuClick('tags')">
            <template #icon><tag-outlined /></template>
            <span>标签管理</span>
          </a-menu-item>
        </a-menu-item-group>
      </a-menu>

      <!-- 技术分类菜单 - 使用v-if控制在折叠状态下是否显示标题 -->
      <div class="category-section">
        <h3 class="section-title" v-if="!collapsed">技术分类</h3>
        <a-menu
            v-model:selectedKeys="selectedKeys"
            mode="inline"
            class="sidebar-menu tech-menu"
            :inline-collapsed="collapsed"
        >
          <a-menu-item key="java" @click="handleMenuClick('java')">
            <template #icon>
              <code-outlined class="tech-icon java-icon" />
            </template>
            <span>Java基础</span>
            <div class="category-count" v-if="!collapsed">42</div>
          </a-menu-item>
          <a-menu-item key="mysql" @click="handleMenuClick('mysql')">
            <template #icon>
              <database-outlined class="tech-icon mysql-icon" />
            </template>
            <span>MySQL</span>
            <div class="category-count" v-if="!collapsed">28</div>
          </a-menu-item>
          <a-menu-item key="spring" @click="handleMenuClick('spring')">
            <template #icon>
              <experiment-outlined class="tech-icon spring-icon" />
            </template>
            <span>Spring系列</span>
            <div class="category-count" v-if="!collapsed">56</div>
          </a-menu-item>
          <a-menu-item key="redis" @click="handleMenuClick('redis')">
            <template #icon>
              <cloud-server-outlined class="tech-icon redis-icon" />
            </template>
            <span>Redis</span>
            <div class="category-count" v-if="!collapsed">17</div>
          </a-menu-item>
          <a-menu-item key="mq" @click="handleMenuClick('mq')">
            <template #icon>
              <message-outlined class="tech-icon mq-icon" />
            </template>
            <span>消息队列</span>
            <div class="category-count" v-if="!collapsed">14</div>
          </a-menu-item>
        </a-menu>
      </div>

      <!-- 添加新分类按钮 - 仅在展开状态显示 -->
      <div class="add-category-section" v-if="!collapsed">
        <div class="divider"></div>
        <a-button type="dashed" class="add-category-btn" block>
          <plus-outlined class="plus-icon" />
          <span>添加新分类</span>
        </a-button>
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  HomeOutlined,
  BookOutlined,
  BarChartOutlined,
  LinkOutlined,
  TagOutlined,
  PlusOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  CloudServerOutlined,
  MessageOutlined
} from '@ant-design/icons-vue';

// 接收父组件传递的折叠状态
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['menu-select']);

// 获取router实例和当前路由
const router = useRouter();
const route = useRoute();

// 路由映射表
const routeMap = {
  dashboard: '/dashboard',
  notes: '/notes',
  progress: '/progress',
  resources: '/resources',
  tags: '/tags',
  java: '/notes?category=java',
  mysql: '/notes?category=mysql',
  spring: '/notes?category=spring',
  redis: '/notes?category=redis',
  mq: '/notes?category=mq'
};

// 初始化选中状态
const selectedKeys = ref(['dashboard']);

// 根据当前路由设置选中的菜单项
const updateSelectedKeys = () => {
  const path = route.path;
  const query = route.query;

  // 先处理路径匹配
  if (path === '/dashboard') {
    selectedKeys.value = ['dashboard'];
  } else if (path === '/notes') {
    // 如果有分类参数，则选中对应的技术分类
    if (query.category) {
      selectedKeys.value = [query.category as string];
    } else {
      selectedKeys.value = ['notes'];
    }
  } else if (path === '/progress') {
    selectedKeys.value = ['progress'];
  } else if (path === '/resources') {
    selectedKeys.value = ['resources'];
  } else if (path === '/tags') {
    selectedKeys.value = ['tags'];
  } else {
    // 默认选中仪表盘
    selectedKeys.value = ['dashboard'];
  }
};

// 处理菜单点击事件
const handleMenuClick = (key: string) => {
  selectedKeys.value = [key];
  emit('menu-select', key);

  // 根据点击的菜单项导航到对应的路由
  const targetRoute = routeMap[key as keyof typeof routeMap];
  if (targetRoute) {
    router.push(targetRoute);
  }
};

// 为确保安全，再添加一个监听器，确保只有一个选中项
watch(selectedKeys, (newVal) => {
  if (newVal && newVal.length > 1) {
    selectedKeys.value = [newVal[newVal.length - 1]];
  }
});

// 监听路由变化，更新菜单选中状态
watch(
    () => route.path,
    () => {
      updateSelectedKeys();
    }
);

// 组件挂载时，根据当前路由设置选中的菜单项
onMounted(() => {
  updateSelectedKeys();
});
</script>

<style scoped>
.sidebar {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  height: calc(100vh - 56px);
  top: 56px;
  transition: all 0.3s;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 990;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px 0;
}

.sidebar-menu {
  border-right: none;
}

.main-nav-menu {
  flex: 0 0 auto;
}

.tech-menu {
  margin-bottom: 0;
}

/* 调整菜单项的文字颜色和加粗 */
.sidebar-menu :deep(.ant-menu-item) {
  margin: 0;
  padding-left: 16px !important;
  height: 40px;
  line-height: 40px;
  position: relative;
  color: #262626;
  font-weight: 500;
}

.sidebar-menu :deep(.ant-menu-item:hover) {
  color: #1C4ED8;
}

/* 移除右侧蓝色边框，保留选中样式 */
.sidebar-menu :deep(.ant-menu-item-selected) {
  background-color: #EBF1FE !important;
  color: #1C4ED8 !important;
  font-weight: 600;
  border-right: none !important;
}

/* 折叠状态下的菜单项样式 */
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu-item) {
  padding: 0 !important;
  width: 48px !important; /* Slightly reduced width */
  height: 40px;
  margin: 4px auto !important; /* Add margins between items */
  border-radius: 8px; /* Add rounded corners */
  text-align: center;
  display: flex !important; /* Use flexbox for centering */
  align-items: center !important; /* Center items vertically */
  justify-content: center !important; /* Center items horizontally */
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}


/* 折叠状态下选中项的样式 */
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu-item-selected) {
  background-color: rgba(28, 78, 216, 0.08) !important;
  border-left: 3px solid #1C4ED8 !important;
  border-radius: 0 8px 8px 0 !important;
  width: 47px !important;
  padding-left: 0 !important;
  box-shadow: none !important;
}

/* 折叠状态下选中项的图标样式 */
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu-item .anticon) {
  margin: 0 !important; /* Remove any margin that might affect centering */
  line-height: normal !important; /* Remove line-height that could affect vertical positioning */
  font-size: 18px;
  transition: all 0.3s;
  display: flex !important; /* Ensure the icon itself uses flexbox */
  align-items: center !important;
  justify-content: center !important;
  height: 100%; /* Make sure icon container takes full height */
}
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu-item span:not(.anticon)) {
  display: none !important;
}

/* 折叠状态下的悬停效果 */
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu-item:hover) {
  background-color: rgba(28, 78, 216, 0.05) !important;
  color: #1C4ED8 !important;
}

/* 专门针对技术分类菜单的选中效果 */
.tech-menu.ant-menu-inline-collapsed :deep(.ant-menu-item-selected) {
  background: linear-gradient(to right, rgba(28, 78, 216, 0.12), rgba(28, 78, 216, 0.03)) !important;
  border-left-color: #1C4ED8 !important;
}

/* 确保菜单容器不会有多余的边框 */
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu) {
  border-right: none !important;
  width: 56px;
}
/* 主导航组标题样式 */
.menu-group :deep(.ant-menu-item-group-title) {
  padding: 8px 16px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  height: 36px;
  line-height: 20px;
  letter-spacing: 0.5px;
}

/* 技术分类标题样式 */
.category-section {
  margin-top: 8px;
}

.section-title {
  padding: 8px 16px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 0.5px;
}

/* 图标样式优化 */
.tech-icon {
  font-size: 16px;
}

.java-icon {
  color: #e53e3e;
}

.mysql-icon {
  color: #3182ce;
}

.spring-icon {
  color: #38a169;
}

.redis-icon {
  color: #e53e3e;
}

.mq-icon {
  color: #dd6b20;
}

/* 数量圆圈样式 */
.category-count {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f0f0f0;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* 添加新分类按钮样式 */
.add-category-section {
  padding: 0 16px 20px;
  margin-top: 12px;
}

.divider {
  height: 1px;
  background-color: #f0f0f0;
  margin-bottom: 16px;
}

.add-category-btn {
  color: #1C4ED8;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}

.add-category-btn:hover {
  color: #0F38A9;
  border-color: #1C4ED8;
}

.plus-icon {
  color: #1C4ED8;
  font-size: 16px;
}

/* 改进图标显示效果 */
:deep(.anticon) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 18px;
}

/* 调整折叠状态下侧边栏样式 */
.sidebar[collapsed="true"] {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

/* 调整折叠状态下的内边距 */
.sidebar[collapsed="true"] .sidebar-content {
  padding: 8px 4px;
}

/* 在菜单组之间添加间隔 */
.main-nav-menu.ant-menu-inline-collapsed + .category-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}
</style>