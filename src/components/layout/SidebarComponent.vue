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
          class="sidebar-menu"
          :inline-collapsed="collapsed"
      >
        <a-menu-item-group :title="collapsed ? '' : '主导航'" class="menu-group">
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

        <a-menu-item-group :title="collapsed ? '' : '技术分类'" class="menu-group tech-group">
          <a-menu-item key="java">
            <template #icon>
              <code-outlined class="tech-icon java-icon" />
            </template>
            <span>Java基础</span>
            <span class="category-count" v-if="!collapsed">42</span>
          </a-menu-item>
          <a-menu-item key="mysql">
            <template #icon>
              <database-outlined class="tech-icon mysql-icon" />
            </template>
            <span>MySQL</span>
            <span class="category-count" v-if="!collapsed">28</span>
          </a-menu-item>
          <a-menu-item key="spring">
            <template #icon>
              <experiment-outlined class="tech-icon spring-icon" />
            </template>
            <span>Spring系列</span>
            <span class="category-count" v-if="!collapsed">56</span>
          </a-menu-item>
          <a-menu-item key="redis">
            <template #icon>
              <cloud-server-outlined class="tech-icon redis-icon" />
            </template>
            <span>Redis</span>
            <span class="category-count" v-if="!collapsed">17</span>
          </a-menu-item>
          <a-menu-item key="mq">
            <template #icon>
              <message-outlined class="tech-icon mq-icon" />
            </template>
            <span>消息队列</span>
            <span class="category-count" v-if="!collapsed">14</span>
          </a-menu-item>
        </a-menu-item-group>
      </a-menu>

      <div class="add-category-section" v-if="!collapsed">
        <a-button type="dashed" class="add-category-btn" block>
          <plus-outlined />
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
  flex: 1;
}

.sidebar-menu :deep(.ant-menu-item) {
  margin: 0;
  padding-left: 16px !important;
  height: 40px;
  line-height: 40px;
}

.sidebar-menu :deep(.ant-menu-item-selected) {
  background-color: #e6f7ff;
}

.menu-group :deep(.ant-menu-item-group-title) {
  padding: 8px 16px;
  color: #8c9aad;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  height: 36px;
  line-height: 20px;
}

.tech-group {
  margin-top: 16px;
}

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

.category-count {
  position: absolute;
  right: 16px;
  background-color: #f5f5f5;
  color: #8c8c8c;
  font-size: 12px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
}

.add-category-section {
  padding: 16px 16px 24px;
  margin-top: 8px;
}

.add-category-btn {
  color: #1890ff;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>