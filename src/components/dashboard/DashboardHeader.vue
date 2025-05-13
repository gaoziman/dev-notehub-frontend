<template>
  <div class="header-card">
    <div class="header-content">
      <div class="welcome-section">
        <div class="welcome-icon">
          <icon-font type="icon-zhishiku1" :size="40" color="var(--primary-color)" />
        </div>
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎回到智慧知识库</h1>
          <p class="welcome-subtitle">{{ getGreeting() }}，继续您的学习之旅</p>
        </div>
      </div>
      <div class="user-stats">
        <n-space>
          <n-badge :value="5" :max="99" color="var(--primary-color)">
            <n-button circle>
              <template #icon>
                <icon-font type="icon-notification" :size="20" />
              </template>
            </n-button>
          </n-badge>
          <n-badge :value="3" :max="99" color="var(--warning-color)">
            <n-button circle>
              <template #icon>
                <icon-font type="icon-task" :size="20" />
              </template>
            </n-button>
          </n-badge>
          <n-button strong secondary>
            <template #icon>
              <icon-font type="icon-add" :size="16" />
            </template>
            新增内容
          </n-button>
        </n-space>
      </div>
    </div>
    <div class="last-activity">
      <n-progress
          type="line"
          :percentage="todayProgress"
          :indicator-placement="'inside'"
          :rail-style="{ background: 'var(--primary-color-suppl)' }"
          :color="progressColor"
      />
      <div class="activity-stats">
        <div class="activity-item">
          <span class="activity-label">今日学习目标</span>
          <span class="activity-value">{{ todayCompleted }}/{{ todayTotal }}</span>
        </div>
        <div class="activity-item">
          <span class="activity-label">本周学习时间</span>
          <span class="activity-value">{{ weeklyHours }}小时</span>
        </div>
        <div class="activity-item">
          <span class="activity-label">学习连续天数</span>
          <span class="activity-value">{{ streakDays }}天</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import IconFont from '@/components/common/IconFont.vue';

// 模拟数据
const todayCompleted = ref(3);
const todayTotal = ref(5);
const weeklyHours = ref(12.5);
const streakDays = ref(7);

// 计算今日进度百分比
const todayProgress = computed(() => {
  return (todayCompleted.value / todayTotal.value) * 100;
});

// 根据进度设置颜色
const progressColor = computed(() => {
  if (todayProgress.value >= 80) return 'var(--success-color)';
  if (todayProgress.value >= 50) return 'var(--primary-color)';
  if (todayProgress.value >= 20) return 'var(--warning-color)';
  return 'var(--error-color)';
});

// 根据时间段获取问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '早安';
  if (hour < 11) return '上午好';
  if (hour < 13) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
};
</script>

<style scoped>
.header-card {
  background: linear-gradient(135deg, var(--primary-color-suppl) 0%, var(--card-color) 100%);
  border-radius: var(--border-radius-large);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: var(--box-shadow-1);
}

.welcome-text {
  display: flex;
  flex-direction: column;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color-base);
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-subtitle {
  font-size: 16px;
  margin: 4px 0 0 0;
  color: var(--text-color-secondary);
}

.last-activity {
  margin-top: 8px;
}

.activity-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.activity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.activity-label {
  font-size: 14px;
  color: var(--text-color-tertiary);
}

.activity-value {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color-base);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .user-stats {
    align-self: flex-end;
  }

  .activity-stats {
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
}
</style>