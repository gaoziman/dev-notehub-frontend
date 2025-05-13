<template>
  <div class="dashboard-container">
    <!-- 欢迎与统计模块 -->
    <DashboardHeader />

    <!-- 卡片统计区 -->
    <StatisticsCards />

    <!-- 内容区 -->
    <div class="dashboard-content">
      <!-- 左侧模块 -->
      <div class="dashboard-main">
        <!-- 学习进度模块 -->
        <LearningProgress />

        <!-- 最近活动模块 -->
        <RecentActivity />
      </div>

      <!-- 右侧模块 -->
      <div class="dashboard-sidebar">
        <!-- 快速访问 -->
        <QuickAccess />

        <!-- 热门资源 -->
        <PopularResources />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import StatisticsCards from '@/components/dashboard/StatisticsCards.vue'
import LearningProgress from '@/components/dashboard/LearningProgress.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import QuickAccess from '@/components/dashboard/QuickAccess.vue'
import PopularResources from '@/components/dashboard/PopularResources.vue'

onMounted(() => {
  console.log('Dashboard component mounted')
})
</script>

<style scoped>
.dashboard-container {
  padding: var(--content-padding);
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  background-color: var(--body-color);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>