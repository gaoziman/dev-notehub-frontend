<template>
  <div class="welcome-section">
    <div class="welcome-content">
      <div class="welcome-main">
        <div class="welcome-header">
          <h1 class="welcome-title">
            欢迎回来，<span class="username">{{ username }}</span>
          </h1>
          <div class="live-clock">
            <div class="clock-display">
              <div class="time">{{ currentTime }}</div>
              <div class="date">{{ today }}</div>
            </div>
          </div>
        </div>

        <p class="welcome-subtitle">继续您的学习之旅</p>

        <div class="stats-summary">
          <div class="stats-item">
            <icon-font type="icon-clock" :size="16" />
            <span>今日学习 <strong>{{ dailyStudyHours }}</strong> 小时</span>
          </div>
          <div class="stats-item">
            <icon-font type="icon-check-circle" :size="16" />
            <span>完成任务 <strong>{{ completedTasks }}</strong> 项</span>
          </div>
          <div class="stats-item">
            <icon-font type="icon-star" :size="16" />
            <span>学习积分 <strong>{{ studyPoints }}</strong> 分</span>
          </div>
        </div>
      </div>

      <div class="welcome-aside">
        <div class="date-card">
          <div class="date-calendar">
            <div class="calendar-header">
              <span class="month">{{ currentMonth }}</span>
              <span class="year">{{ currentYear }}</span>
            </div>
            <span class="day">{{ currentDay }}</span>
            <span class="weekday">{{ currentWeekday }}</span>
          </div>

          <div class="weather-info">
            <div class="weather-icon">
              <icon-font type="icon-sun" :size="22" />
            </div>
            <div class="weather-details">
              <div class="temperature">25°C</div>
              <div class="location">北京市</div>
            </div>
          </div>
        </div>

        <div class="motivation-quote">
          "学习是一个持续的旅程，而不是目的地。"
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-pattern"></div>
    <div class="bg-glow"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import IconFont from '@/components/common/IconFont.vue';

// 接收传入的用户信息
const props = defineProps({
  username: {
    type: String,
    default: 'Java开发者'
  }
});

// 学习统计
const dailyStudyHours = ref('3.5');
const completedTasks = ref('2');
const studyPoints = ref('185');

// 时间相关
const currentTime = ref('');
const today = computed(() => {
  const date = new Date();
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
});

const currentYear = computed(() => {
  return new Date().getFullYear();
});

const currentMonth = computed(() => {
  const date = new Date();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return monthNames[date.getMonth()];
});

const currentDay = computed(() => {
  return new Date().getDate();
});

const currentWeekday = computed(() => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[new Date().getDay()];
});

// 更新时间的定时器
let timeInterval = null;

// 更新时间的方法
const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  // 初始更新一次时间
  updateTime();

  // 设置定时器，每秒更新一次时间
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
/* 欢迎区域样式 */
.welcome-section {
  display: flex;
  position: relative;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid rgba(240, 245, 255, 0.8);
}

.welcome-content {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 20px;
}

.welcome-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.5px;
  position: relative;
}

.username {
  color: #3b82f6;
  position: relative;
}

.username::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 2px;
}

.welcome-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 20px 0;
}

.live-clock {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(240, 245, 255, 0.8);
}

.clock-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}

.date {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.stats-summary {
  display: flex;
  gap: 20px;
  margin-top: auto;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(240, 245, 255, 0.8);
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.stats-item strong {
  color: #334155;
  font-weight: 600;
}

.welcome-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 240px;
}

.date-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(240, 245, 255, 0.8);
}

.date-calendar {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.calendar-header {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 8px;
}

.month {
  font-size: 0.85rem;
  font-weight: 500;
}

.year {
  font-size: 0.85rem;
  opacity: 0.9;
}

.day {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
  margin: 4px 0;
}

.weekday {
  font-size: 0.85rem;
  opacity: 0.9;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
}

.weather-icon {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 12px -2px rgba(245, 158, 11, 0.3);
}

.weather-details {
  display: flex;
  flex-direction: column;
}

.temperature {
  font-size: 1.25rem;
  font-weight: 700;
  color: #334155;
}

.location {
  font-size: 0.75rem;
  color: #64748b;
}

.motivation-quote {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 14px;
  font-size: 0.9rem;
  font-style: italic;
  color: #4b5563;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(240, 245, 255, 0.8);
}

/* 背景装饰 */
.bg-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background-image: radial-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
  z-index: 1;
}

.bg-glow {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 40%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  opacity: 0.6;
  z-index: 1;
  transform: rotate(-15deg);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .welcome-content {
    flex-direction: column;
  }

  .welcome-aside {
    width: 100%;
    flex-direction: row;
  }

  .date-card {
    flex: 1;
  }

  .motivation-quote {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    gap: 16px;
  }

  .live-clock {
    align-self: flex-start;
  }

  .welcome-aside {
    flex-direction: column;
  }

  .stats-summary {
    flex-direction: column;
    gap: 10px;
  }
}
</style>