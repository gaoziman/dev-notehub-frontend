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
          <a-menu-item key="dashboard">
            <template #icon><home-outlined /></template>
            <span>仪表盘</span>
          </a-menu-item>
          <a-menu-item key="notes">
            <template #icon><book-outlined /></template>
            <span>我的笔记</span>
          </a-menu-item>
          <a-menu-item key="progress">
            <template #icon><bar-chart-outlined /></template>
            <span>学习进度</span>
          </a-menu-item>
          <a-menu-item key="resources">
            <template #icon><link-outlined /></template>
            <span>收藏资源</span>
          </a-menu-item>
          <a-menu-item key="tags">
            <template #icon><tag-outlined /></template>
            <span>标签管理</span>
          </a-menu-item>
        </a-menu-item-group>
      </a-menu>

      <!-- 技术分类菜单 -->
      <div class="category-section">
        <h3 class="section-title">技术分类</h3>
        <a-menu
            mode="inline"
            class="sidebar-menu tech-menu"
            :inline-collapsed="collapsed"
        >
          <a-menu-item key="java">
            <template #icon>
              <code-outlined class="tech-icon java-icon" />
            </template>
            <span>Java基础</span>
            <div class="category-count" v-if="!collapsed">42</div>
          </a-menu-item>
          <a-menu-item key="mysql">
            <template #icon>
              <database-outlined class="tech-icon mysql-icon" />
            </template>
            <span>MySQL</span>
            <div class="category-count" v-if="!collapsed">28</div>
          </a-menu-item>
          <a-menu-item key="spring">
            <template #icon>
              <experiment-outlined class="tech-icon spring-icon" />
            </template>
            <span>Spring系列</span>
            <div class="category-count" v-if="!collapsed">56</div>
          </a-menu-item>
          <a-menu-item key="redis">
            <template #icon>
              <cloud-server-outlined class="tech-icon redis-icon" />
            </template>
            <span>Redis</span>
            <div class="category-count" v-if="!collapsed">17</div>
          </a-menu-item>
          <a-menu-item key="mq">
            <template #icon>
              <message-outlined class="tech-icon mq-icon" />
            </template>
            <span>消息队列</span>
            <div class="category-count" v-if="!collapsed">14</div>
          </a-menu-item>
        </a-menu>
      </div>

      <!-- 添加新分类按钮 - 调整间距 -->
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
import { ref } from 'vue';
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

const selectedKeys = ref(['dashboard']);
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
  width: 56px !important; /* 确保宽度与侧边栏宽度一致 */
  text-align: center;
}

/* 折叠状态下选中项的样式 */
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu-item-selected) {
  background-color: #EBF1FE !important;
  width: 56px !important;
  padding: 0 !important;
}

/* 确保图标在折叠状态下居中 */
.sidebar-menu.ant-menu-inline-collapsed :deep(.ant-menu-item .anticon) {
  margin: 0 auto;
  line-height: 40px;
  font-size: 18px;
}

.sidebar-menu :deep(.ant-menu-item-active) {
  color: #1C4ED8;
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
</style>