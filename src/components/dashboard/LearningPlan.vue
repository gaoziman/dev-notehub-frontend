<template>
  <div class="learning-plan-container">
    <div class="plan-header">
      <div class="title-section">
        <h3 class="title">学习计划</h3>
        <div class="sparkle-decoration"></div>
      </div>
      <n-tooltip trigger="hover" placement="top">
        <template #trigger>
          <n-button quaternary circle size="small" class="add-button">
            <template #icon>
              <icon-font type="icon-xinzeng1" :size="14" />
            </template>
          </n-button>
        </template>
        添加计划
      </n-tooltip>
    </div>

    <div class="plan-timeline">
      <transition-group name="plan-list" tag="div" class="plan-items-wrapper">
        <div
            v-for="(plan, index) in plans"
            :key="plan.id"
            class="plan-item"
            :class="{'completed': plan.status === 'completed'}"
            :style="{animationDelay: `${index * 100}ms`}"
        >
          <div class="plan-content" :class="`plan-color-${plan.color}`">
            <div class="plan-status-indicator">
              <div class="status-icon" :class="getStatusIconClass(plan.status)">
                <icon-font :type="getStatusIcon(plan.status)" :size="12" color="#fff" />
              </div>
              <div class="connector-line" v-if="index < plans.length - 1"></div>
            </div>

            <div class="plan-details">
              <div class="plan-info">
                <h4 class="plan-title">{{ plan.title }}</h4>
                <p class="plan-deadline">
                  <icon-font type="icon-jintian" :size="12" />
                  <span>{{ plan.deadline }}</span>
                </p>
              </div>

              <div class="plan-actions">
                <n-tag :type="getStatusType(plan.status)" size="small" class="status-tag">
                  {{ getStatusText(plan.status) }}
                </n-tag>
                <n-button quaternary circle size="small" class="edit-button">
                  <template #icon>
                    <icon-font type="icon-edit" :size="12" />
                  </template>
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <div class="empty-state" v-if="!plans || plans.length === 0">
      <div class="empty-icon">
        <icon-font type="icon-clipboard" :size="36" color="#e2e8f0" />
      </div>
      <p class="empty-text">暂无学习计划</p>
      <n-button size="small" type="primary" class="create-button">创建计划</n-button>
    </div>

    <div class="plan-footer">
      <n-button text type="primary" class="view-all-button">
        <template #icon>
          <icon-font type="icon-list" :size="14" />
        </template>
        查看所有计划
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { NTag, NButton, NTooltip } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

defineProps({
  plans: {
    type: Array,
    required: true
  }
});

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    'completed': 'icon-check',
    'processing': 'icon-clock',
    'not-started': 'icon-circle'
  };
  return iconMap[status] || 'icon-circle';
};

// 获取状态图标类
const getStatusIconClass = (status) => {
  const classMap = {
    'completed': 'status-completed',
    'processing': 'status-processing',
    'not-started': 'status-not-started'
  };
  return classMap[status] || '';
};

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    'completed': 'success',
    'processing': 'warning',
    'not-started': 'default'
  };
  return statusMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'processing': '进行中',
    'not-started': '未开始'
  };
  return textMap[status] || '未知';
};
</script>

<style scoped>
.learning-plan-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 18px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  position: relative;
}

.title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  position: relative;
  z-index: 2;
}

/* 标题装饰 */
.sparkle-decoration {
  position: absolute;
  width: 16px;
  height: 16px;
  top: -6px;
  left: -6px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  opacity: 0.15;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  z-index: 1;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 50%;
  transition: all 0.3s;
}

.add-button:hover {
  background-color: rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(59, 130, 246, 0.2);
}

.plan-timeline {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.plan-timeline::-webkit-scrollbar {
  width: 4px;
}

.plan-timeline::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 2px;
}

.plan-timeline::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2px;
}

.plan-items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-item {
  position: relative;
  animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.plan-content {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  border: 1px solid rgba(241, 245, 249, 0.8);
}

.plan-content:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.plan-status-indicator {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  position: relative;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.status-completed {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.status-processing {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.status-not-started {
  background: linear-gradient(135deg, #64748b, #94a3b8);
}

.connector-line {
  width: 2px;
  flex: 1;
  background: rgba(203, 213, 225, 0.5);
  margin: 8px 0;
}

.plan-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding: 14px 14px 14px 0;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plan-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.plan-deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.plan-actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.status-tag {
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.edit-button {
  opacity: 0;
  transition: all 0.2s;
}

.plan-content:hover .edit-button {
  opacity: 1;
}

/* 计划项颜色样式 */
.plan-color-blue {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent 30%);
}

.plan-color-green {
  background: linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent 30%);
}

.plan-color-red {
  background: linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent 30%);
}

.plan-color-purple {
  background: linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent 30%);
}

.plan-color-yellow {
  background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent 30%);
}

/* 已完成状态 */
.completed .plan-title {
  text-decoration: line-through;
  color: #94a3b8;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #94a3b8;
}

.empty-icon {
  margin-bottom: 12px;
}

.empty-text {
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.create-button {
  border-radius: 20px;
  font-weight: 500;
  padding: 2px 16px;
}

/* 页脚 */
.plan-footer {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.view-all-button {
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 组项目动画 */
.plan-list-move,
.plan-list-enter-active,
.plan-list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.plan-list-enter-from,
.plan-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.plan-list-leave-active {
  position: absolute;
}
</style>