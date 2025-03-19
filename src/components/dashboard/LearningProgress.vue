<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">学习进度追踪</h2>
      <a-button type="link">查看详情</a-button>
    </div>
    <a-card>
      <a-row :gutter="24">
        <!-- 技术领域完成度 -->
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

        <!-- 学习计划 -->
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
</template>

<script setup lang="ts">
defineProps<{
  progressItems: Array<{
    label: string;
    value: number;
  }>;
  learningPlans: Array<{
    title: string;
    schedule: string;
    status: string;
  }>;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}>();
</script>

<style scoped>
/* 章节容器通用样式 */
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
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
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

/* 进度条样式 */
.progress-bar {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.progress-value {
  position: absolute;
  height: 100%;
  background: linear-gradient(to right, #3490dc, #6366f1);
  left: 0;
  top: 0;
  border-radius: 3px;
  transition: width 0.5s ease;
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
  transition: all 0.3s ease;
}

.learning-plan-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
</style>