<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-container">
      <!-- 引入新的欢迎组件 -->
      <welcome-section :username="username" />

      <!-- 快速操作区 -->
      <div class="quick-actions">
        <n-button type="primary" class="action-button">
          <template #icon>
            <icon-font type="icon-foller" :size="16" />
          </template>
          新建笔记
        </n-button>
        <n-button class="action-button" ghost>
          <template #icon>
            <icon-font type="icon-shangchuan2" :size="16" />
          </template>
          上传资料
        </n-button>
        <n-button class="action-button" ghost>
          <template #icon>
            <icon-font type="icon-tianjiashoucang-" :size="16" />
          </template>
          添加收藏
        </n-button>
        <n-button class="action-button" ghost>
          <template #icon>
            <icon-font type="icon-xuexijihua1" :size="16" />
          </template>
          学习计划
        </n-button>
      </div>

      <!-- 统计卡片区 -->
      <n-grid :cols="4" :x-gap="20" :y-gap="20" class="stats-grid">
        <n-grid-item v-for="(stat, index) in statistics" :key="index">
          <statistic-card
              :icon="stat.icon"
              :icon-color="stat.iconColor"
              :title="stat.title"
              :value="stat.value"
              :growth="stat.growth"
          />
        </n-grid-item>
      </n-grid>

      <!-- 学习进度追踪区 -->
      <div class="section progress-section">
        <div class="section-header">
          <h2 class="section-title">学习进度追踪</h2>
          <n-button text type="primary" class="view-more-button">
            <template #icon>
              <icon-font type="icon-chart" :size="14" />
            </template>
            查看详情
          </n-button>
        </div>

        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <learning-progress :skills="skillProgress" />
          </n-grid-item>
          <n-grid-item>
            <learning-plan :plans="learningPlans" />
          </n-grid-item>
        </n-grid>
      </div>

      <!-- 最近访问区 -->
      <div class="section recent-documents-section">
        <div class="section-header">
          <h2 class="section-title">最近访问</h2>
          <n-button text type="primary" class="view-more-button">
            <template #icon>
              <icon-font type="icon-list" :size="14" />
            </template>
            查看全部
          </n-button>
        </div>

        <!-- 调整网格间距更大 -->
        <n-grid :cols="3" :x-gap="32" :y-gap="36">
          <n-grid-item v-for="(doc, index) in recentDocuments" :key="index">
            <recent-document-card :document="doc" />
          </n-grid-item>
        </n-grid>
      </div>

      <!-- 最新收藏区 -->
      <div class="section bookmark-section">
        <bookmark-table :bookmarks="recentBookmarks" />
      </div>
    </div>

    <!-- 背景装饰元素 -->
    <div class="bg-decoration decoration-1"></div>
    <div class="bg-decoration decoration-2"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {NGrid, NGridItem, NButton} from 'naive-ui';
import StatisticCard from '@/components/dashboard/StatisticCard.vue';
import RecentDocumentCard from '@/components/dashboard/RecentDocumentCard.vue';
import LearningProgress from '@/components/dashboard/LearningProgress.vue';
import LearningPlan from '@/components/dashboard/LearningPlan.vue';
import BookmarkTable from '@/components/dashboard/BookmarkTable.vue';
import IconFont from '@/components/common/IconFont.vue';
// 引入欢迎组件
import WelcomeSection from '@/components/dashboard/WelcomeSection.vue';

// 用户信息
const username = ref('Java开发者');

// 统计数据
const statistics = ref([
  {
    icon: 'icon-bijijilu',
    iconColor: '#3b82f6',
    title: '总笔记数',
    value: 157,
    growth: 12
  },
  {
    icon: 'icon-yiwancheng1',
    iconColor: '#10b981',
    title: '已完成学习',
    value: 32,
    growth: 8
  },
  {
    icon: 'icon-jinhangzhong3',
    iconColor: '#f59e0b',
    title: '进行中',
    value: 14,
    growth: 5
  },
  {
    icon: 'icon-bookmark',
    iconColor: '#8b5cf6',
    title: '外部收藏',
    value: 86,
    growth: 15
  }
]);

// 最近访问的文档
const recentDocuments = ref([
  {
    id: 1,
    category: 'Java基础',
    categoryColor: 'blue',
    title: 'Java多线程与并发编程',
    description: '详细讲解Java中的线程模型、线程池、锁机制以及并发工具类的使用方法和最佳实践。',
    type: 'Markdown',
    pageCount: 12,
    lastVisited: '2天前',
    progress: 75,
    fileType: 'markdown'
  },
  {
    id: 2,
    category: 'Spring Boot',
    categoryColor: 'green',
    title: 'Spring Boot自动配置原理解析',
    description: '深入剖析Spring Boot的自动配置机制，包括条件注解、starter依赖、配置类加载顺序等核心概念。',
    type: 'PDF',
    pageCount: 8,
    lastVisited: '昨天',
    progress: 45,
    fileType: 'pdf'
  },
  {
    id: 3,
    category: 'Redis',
    categoryColor: 'red',
    title: 'Redis高可用方案实践',
    description: '详细介绍Redis的主从复制、哨兵模式和集群模式，以及在生产环境中的最佳实践和性能优化技巧。',
    type: '外部链接',
    source: 'GitHub',
    lastVisited: '今天',
    progress: 0,
    fileType: 'link'
  }
]);

// 技能进度
const skillProgress = ref([
  { name: 'Java基础', progress: 85 },
  { name: 'Spring系列', progress: 62 },
  { name: 'MySQL', progress: 70 },
  { name: 'Redis', progress: 45 },
  { name: '消息队列', progress: 30 }
]);

// 学习计划
const learningPlans = ref([
  {
    id: 1,
    title: '完成Spring Boot笔记整理',
    deadline: '计划于下周完成',
    status: 'processing',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Redis缓存实战总结',
    deadline: '计划下个月开始',
    status: 'not-started',
    color: 'red'
  },
  {
    id: 3,
    title: 'JVM调优实践',
    deadline: '昨天更新',
    status: 'completed',
    color: 'green'
  },
  {
    id: 4,
    title: 'Java高级并发编程',
    deadline: '本周五前',
    status: 'processing',
    color: 'purple'
  }
]);

// 最新收藏
const recentBookmarks = ref([
  {
    id: 1,
    title: 'Spring Cloud Gateway实战',
    source: 'GitHub',
    sourceIcon: 'github',
    category: 'Spring Cloud',
    categoryColor: 'green',
    bookmarkTime: '今天'
  },
  {
    id: 2,
    title: 'Java 17新特性全解析',
    source: '掘金',
    sourceIcon: 'juejin',
    category: 'Java基础',
    categoryColor: 'blue',
    bookmarkTime: '昨天'
  },
  {
    id: 3,
    title: 'MySQL索引优化最佳实践',
    source: 'CSDN',
    sourceIcon: 'csdn',
    category: 'MySQL',
    categoryColor: 'red',
    bookmarkTime: '3天前'
  },
  {
    id: 4,
    title: 'Kafka实时流处理架构设计',
    source: 'InfoQ',
    sourceIcon: 'zhihu',
    category: '消息队列',
    categoryColor: 'yellow',
    bookmarkTime: '上周'
  },
  {
    id: 5,
    title: 'Docker容器化部署Java应用',
    source: 'GitHub',
    sourceIcon: 'github',
    category: 'DevOps',
    categoryColor: 'purple',
    bookmarkTime: '上周'
  }
]);
</script>

<style scoped>
/* 整体布局样式 */
.dashboard-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.dashboard-container {
  max-width: 98%;
  margin: 0 auto;
  padding: 24px 16px 32px;
  position: relative;
  z-index: 2;
}

/* 快速操作区 */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 8px 16px;
  height: auto;
  border-radius: 10px;
  transition: all 0.3s;
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* 统计卡片区域 */
.stats-grid {
  margin-bottom: 40px;
}

/* 内容区块通用样式 */
.section {
  margin-bottom: 42px;
}

.progress-section {
  margin-bottom: 45px;
}

.recent-documents-section {
  margin-bottom: 60px;
}

.bookmark-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 32px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 2px;
}

.view-more-button {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}

.view-more-button:hover {
  background-color: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  z-index: 1;
}

.decoration-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation: float 15s ease-in-out infinite;
}

.decoration-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  bottom: -200px;
  left: -200px;
  animation: float 20s ease-in-out infinite reverse;
}

@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, 30px);
  }
  100% {
    transform: translate(0, 0);
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .dashboard-container {
    padding: 24px 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .section-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>