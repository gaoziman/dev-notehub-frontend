<template>
  <div class="dashboard-page">
    <!-- 欢迎消息组件 -->
    <welcome-banner :username="'Java开发者'" :current-date="formattedDate" />

    <!-- 概览卡片组件 -->
    <statistics-overview :stats="statisticsData" />

    <!-- 最近访问组件 -->
    <recent-notes :notes="recentNotes" />

    <!-- 学习进度组件 -->
    <learning-progress
        :progress-items="progressItems"
        :learning-plans="learningPlans"
        :get-status-color="getStatusColor"
        :get-status-text="getStatusText"
    />

    <!-- 最新收藏组件 -->
    <latest-collections
        :collections="collections"
        :columns="columns"
        :get-source-icon="getSourceIcon"
        :get-category-color="getCategoryColor"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import dayjs from 'dayjs';

import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue';
import StatisticsOverview from '@/components/dashboard/StatisticsOverview.vue';
import RecentNotes from '@/components/dashboard/RecentNotes.vue';
import LearningProgress from '@/components/dashboard/LearningProgress.vue';
import LatestCollections from '@/components/dashboard/LatestCollections.vue';

import {
  GithubOutlined,
  GlobalOutlined,
  LaptopOutlined
} from '@ant-design/icons-vue';

// 日期格式化 - 只包含日期部分
const formattedDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日');
});

// 统计数据
const statisticsData = [
  { key: 'total', value: 157, icon: 'book', label: '总笔记数' },
  { key: 'completed', value: 32, icon: 'check', label: '已完成学习' },
  { key: 'inProgress', value: 14, icon: 'clock', label: '进行中' },
  { key: 'external', value: 86, icon: 'bookmark', label: '外部收藏' }
];

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

// 获取分类颜色
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
  max-width: 1400px;
  margin: 0 auto;
}
</style>