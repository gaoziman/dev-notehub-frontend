<template>
  <div class="dashboard-page">
    <!-- 欢迎消息 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎回来，Java开发者</h1>
      <p class="welcome-date">继续您的学习之旅，今天是{{ currentDate }}</p>
    </div>

    <!-- 概览卡片 -->
    <a-row :gutter="24" class="overview-cards">
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-icon book-icon">
              <book-outlined />
            </div>
            <div class="stat-info">
              <span class="stat-label">总笔记数</span>
              <span class="stat-value">157</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-icon check-icon">
              <check-circle-outlined />
            </div>
            <div class="stat-info">
              <span class="stat-label">已完成学习</span>
              <span class="stat-value">32</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-icon clock-icon">
              <clock-outlined />
            </div>
            <div class="stat-info">
              <span class="stat-label">进行中</span>
              <span class="stat-value">14</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-icon bookmark-icon">
              <bookmark-outlined />
            </div>
            <div class="stat-info">
              <span class="stat-label">外部收藏</span>
              <span class="stat-value">86</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近访问 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">最近访问</h2>
        <a-button type="link">查看全部</a-button>
      </div>
      <a-row :gutter="24">
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" v-for="(note, index) in recentNotes" :key="index">
          <a-card class="note-card card-hover">
            <div class="note-content">
              <div class="note-header">
                <a-tag :color="note.tagColor">{{ note.tag }}</a-tag>
                <span class="note-time">{{ note.time }}</span>
              </div>
              <h3 class="note-title">{{ note.title }}</h3>
              <p class="note-description">{{ note.description }}</p>
              <div class="note-meta">
                <file-outlined />
                <span>{{ note.format }}</span>
                <span class="meta-divider">•</span>
                <span>{{ note.pages }}页</span>
              </div>
            </div>
            <div class="note-footer">
              <div class="progress-info">
                <span class="progress-label">学习进度</span>
                <span class="progress-value-text">{{ note.progress }}%</span>
              </div>
              <div class="note-actions">
                <a-button type="text" class="action-button">
                  <template #icon><edit-outlined /></template>
                </a-button>
                <a-button type="text" class="action-button">
                  <template #icon><export-outlined /></template>
                </a-button>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-value" :style="{ width: `${note.progress}%` }"></div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 学习进度 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">学习进度追踪</h2>
        <a-button type="link">查看详情</a-button>
      </div>
      <a-card>
        <a-row :gutter="24">
          <a-col :xs="24" :md="12">
            <h3 class="subsection-title">技术领域完成度</h3>
            <div class="progress-list">
              <div class="progress-item" v-for="(item, index) in progressItems" :key="index">
                <div class="progress-item-header">
                  <span class="progress-item-label">{{ item.label }}</span>
                  <span class="progress-item-value">{{ item.value }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-value" :style="{ width: `${item.value}%` }"></div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :md="12">
            <h3 class="subsection-title">学习计划</h3>
            <div class="learning-plans">
              <div v-for="(plan, index) in learningPlans" :key="index"
                   class="learning-plan-item"
                   :class="`plan-${plan.status}`">
                <div class="plan-dot"></div>
                <div class="plan-content">
                  <h4 class="plan-title">{{ plan.title }}</h4>
                  <p class="plan-schedule">{{ plan.schedule }}</p>
                </div>
                <a-tag :color="getStatusColor(plan.status)">{{ getStatusText(plan.status) }}</a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 最新收藏 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">最新收藏</h2>
        <a-button type="link">查看全部</a-button>
      </div>
      <a-card>
        <a-table :columns="columns" :data-source="collections" :pagination="false" class="collection-table">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'source'">
              <div class="source-cell">
                <component :is="getSourceIcon(record.sourceType)" />
                <span>{{ record.source }}</span>
              </div>
            </template>
            <template v-if="column.key === 'category'">
              <a-tag :color="getCategoryColor(record.category)">{{ record.category }}</a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <div class="action-buttons">
                <a-button type="text" class="table-action-button">
                  <template #icon><export-outlined /></template>
                </a-button>
                <a-button type="text" class="table-action-button star-button">
                  <template #icon><star-outlined /></template>
                </a-button>
                <a-button type="text" class="table-action-button delete-button">
                  <template #icon><delete-outlined /></template>
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  BookOutlined,
  CheckCircleOutlined,
  FileOutlined,
  EditOutlined,
  ExportOutlined,
  GithubOutlined,
  GlobalOutlined,
  LaptopOutlined,
  StarOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// 当前日期
const currentDate = dayjs().format('YYYY年MM月DD日');

// 最近访问笔记数据
const recentNotes = ref([
  {
    tag: 'Java基础',
    tagColor: 'blue',
    time: '2天前',
    title: 'Java多线程与并发编程',
    description: '详细讲解Java中的线程模型、线程池、锁机制以及并发工具类的使用方法和最佳实践。',
    format: 'Markdown',
    pages: 12,
    progress: 75
  },
  {
    tag: 'Spring Boot',
    tagColor: 'green',
    time: '昨天',
    title: 'Spring Boot自动配置原理解析',
    description: '深入剖析Spring Boot的自动配置机制，包括条件注解、starter依赖、配置类加载顺序等核心概念。',
    format: 'PDF',
    pages: 8,
    progress: 45
  },
  {
    tag: 'Redis',
    tagColor: 'red',
    time: '今天',
    title: 'Redis高可用方案实践',
    description: '详细介绍Redis的主从复制、哨兵模式和集群模式，以及在生产环境中的最佳实践和性能优化技巧。',
    format: '外部链接',
    pages: 0,
    progress: 0
  }
]);

// 学习进度数据
const progressItems = ref([
  { label: 'Java基础', value: 85 },
  { label: 'Spring系列', value: 62 },
  { label: 'MySQL', value: 70 },
  { label: 'Redis', value: 45 },
  { label: '消息队列', value: 30 }
]);

// 学习计划数据
const learningPlans = ref([
  {
    title: '完成Spring Boot笔记整理',
    schedule: '计划于下周完成',
    status: 'ongoing'
  },
  {
    title: 'Redis缓存实战总结',
    schedule: '计划下个月开始',
    status: 'pending'
  },
  {
    title: 'JVM调优实践',
    schedule: '昨天更新',
    status: 'completed'
  }
]);

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colors = {
    ongoing: 'warning',
    pending: 'error',
    completed: 'success'
  };
  return colors[status as keyof typeof colors];
};

// 获取状态文本
const getStatusText = (status: string) => {
  const texts = {
    ongoing: '进行中',
    pending: '未开始',
    completed: '已完成'
  };
  return texts[status as keyof typeof texts];
};

// 收藏表格列定义
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '来源',
    dataIndex: 'source',
    key: 'source',
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: '收藏时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '操作',
    key: 'actions',
    align: 'right',
  },
];

// 收藏数据
const collections = ref([
  {
    key: '1',
    title: 'Spring Cloud Gateway实战',
    source: 'GitHub',
    sourceType: 'github',
    category: 'Spring Cloud',
    time: '今天',
  },
  {
    key: '2',
    title: 'Java 17新特性全解析',
    source: '掘金',
    sourceType: 'website',
    category: 'Java基础',
    time: '昨天',
  },
  {
    key: '3',
    title: 'MySQL索引优化最佳实践',
    source: 'CSDN',
    sourceType: 'code',
    category: 'MySQL',
    time: '3天前',
  },
]);

// 获取来源图标
const getSourceIcon = (sourceType: string) => {
  const icons = {
    github: GithubOutlined,
    website: GlobalOutlined,
    code: LaptopOutlined
  };
  return icons[sourceType as keyof typeof icons];
};

// 获取分类颜色 - 补全函数
const getCategoryColor = (category: string) => {
  const colors = {
    'Spring Cloud': 'green',
    'Java基础': 'red',
    'MySQL': 'blue',
    'Redis': 'orange',
    '消息队列': 'purple',
    '分布式系统': 'cyan',
    '微服务': 'lime'
  };
  return colors[category as keyof typeof colors] || 'default';
};
</script>

<style scoped>
.dashboard-page {
  max-width: 1500px;
  margin: 0 auto;
}

/* 欢迎区域样式 */
.welcome-section {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.welcome-date {
  color: #64748b;
  margin: 0;
}

/* 概览卡片样式 */
.overview-cards {
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.book-icon {
  background-color: #ebf8ff;
  color: #3490dc;
}

.check-icon {
  background-color: #e6fffa;
  color: #38b2ac;
}

.clock-icon {
  background-color: #fffbeb;
  color: #ecc94b;
}

.bookmark-icon {
  background-color: #f3e8ff;
  color: #9f7aea;
}

.stat-info {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

/* 章节容器 */
.section-container {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

/* 笔记卡片样式 */
.note-card {
  border-radius: 12px;
  height: 100%;
  overflow: hidden;
}

.note-content {
  padding-bottom: 16px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-time {
  font-size: 12px;
  color: #a0aec0;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.note-description {
  font-size: 14px;
  color: #4a5568;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 12px;
}

.note-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #a0aec0;
}

.meta-divider {
  margin: 0 8px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
}

.progress-info {
  display: flex;
  align-items: center;
}

.progress-label {
  font-size: 12px;
  color: #64748b;
  margin-right: 8px;
}

.progress-value-text {
  font-size: 12px;
  font-weight: 500;
  color: #3490dc;
}

.note-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  color: #a0aec0;
  font-size: 14px;
}

.action-button:hover {
  color: #3490dc;
}

/* 学习进度样式 */
.subsection-title {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 16px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.progress-item-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
}

.progress-item-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
}

/* 学习计划样式 */
.learning-plans {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.learning-plan-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
}

.plan-ongoing {
  background-color: #ebf8ff;
}

.plan-pending {
  background-color: #fff5f7;
}

.plan-completed {
  background-color: #f0fff4;
}

.plan-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
}

.plan-ongoing .plan-dot {
  background-color: #3490dc;
}

.plan-pending .plan-dot {
  background-color: #e53e3e;
}

.plan-completed .plan-dot {
  background-color: #38a169;
}

.plan-content {
  flex: 1;
}

.plan-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.plan-schedule {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* 收藏表格样式 */
.collection-table :deep(.ant-table) {
  border-radius: 12px;
  overflow: hidden;
}

.source-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.table-action-button {
  color: #a0aec0;
}

.star-button:hover {
  color: #ecc94b;
}

.delete-button:hover {
  color: #e53e3e;
}
</style>