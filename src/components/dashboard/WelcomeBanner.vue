<template>
  <div class="welcome-banner">
    <div class="welcome-content">
      <div class="welcome-text">
        <h1 class="welcome-title">欢迎回来，{{ username }}</h1>
        <p class="welcome-subtitle">
          继续您的学习之旅，今天是{{ currentDate }}
          <span class="clock">{{ currentTime }}</span>
        </p>

        <!-- 技能掌握度分析卡片 - 全新设计 -->
        <div class="skills-mastery-card">
          <div class="skills-header">
            <div class="skills-title">技术能力分析</div>
            <div class="skills-action">查看详情</div>
          </div>

          <div class="skills-chart">
            <div class="skill-item" v-for="(skill, index) in skillsData" :key="index">
              <div class="skill-info">
                <div class="skill-label">{{ skill.name }}</div>
                <div class="skill-percentage">{{ skill.percentage }}%</div>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" :style="{ width: `${skill.percentage}%`, backgroundColor: skill.color }"></div>
              </div>
            </div>
          </div>

          <div class="skills-summary">
            <div class="summary-item">
              <div class="summary-value">3</div>
              <div class="summary-label">待提升领域</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">2</div>
              <div class="summary-label">精通技能</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">178</div>
              <div class="summary-label">学习小时</div>
            </div>
          </div>
        </div>

        <!-- 今日推荐学习 -->
        <div class="daily-recommendation">
          <div class="recommendation-icon">
            <check-circle-outlined />
          </div>
          <div class="recommendation-content">
            <div class="recommendation-title">今日推荐学习：Spring MVC深入解析</div>
            <div class="recommendation-meta">
              <span class="time-estimate"><clock-circle-outlined /> 预计30分钟</span>
              <span class="difficulty"><trophy-outlined /> 中级难度</span>
            </div>
            <a-progress :percent="0" :stroke-color="progressColor" class="recommendation-progress" />
          </div>
          <div class="start-button-container">
            <a-button type="primary" shape="round" size="small" class="start-button">
              开始学习
            </a-button>
          </div>
        </div>
      </div>

      <div class="welcome-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-dots">
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import dayjs from 'dayjs';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue';

defineProps<{
  username: string;
  currentDate: string;
}>();

// 当前时间
const currentTime = ref('');

// 更新时间的计时器
let timer: number | null = null;

// 技能掌握度数据
const skillsData = reactive([
  { name: 'Java基础', percentage: 85, color: '#4285F4' },
  { name: 'Spring框架', percentage: 62, color: '#34A853' },
  { name: 'MySQL', percentage: 70, color: '#FBBC05' },
  { name: 'Redis', percentage: 45, color: '#EA4335' },
  { name: '消息队列', percentage: 30, color: '#9C27B0' }
]);

// 进度条颜色
const progressColor = computed(() => {
  return {
    from: '#1C4ED8',
    to: '#3490dc'
  };
});

// 更新时间函数
const updateTime = () => {
  currentTime.value = dayjs().format('HH:mm:ss');
};

// 组件挂载时启动计时器
onMounted(() => {
  // 立即更新一次时间
  updateTime();

  // 设置每秒更新一次的计时器
  timer = window.setInterval(() => {
    updateTime();
  }, 1000);
});

// 组件卸载前清除计时器
onBeforeUnmount(() => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(to right, #f0f5ff, #e6f7ff);
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1C4ED8;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 16px;
  color: #4b5563;
  margin: 0 0 16px 0;
  font-weight: 500;
}

/* 时钟样式 */
.clock {
  display: inline-block;
  background-color: rgba(28, 78, 216, 0.1);
  color: #1C4ED8;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
  min-width: 76px;
  text-align: center;
  transition: all 0.3s ease;
}

/* 技能掌握度模块 - 全新设计 */
.skills-mastery-card {
  background-color: white;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.skills-title {
  font-size: 16px;
  font-weight: 600;
  color: #1C4ED8;
}

.skills-action {
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}

.skills-action:hover {
  color: #1C4ED8;
  text-decoration: underline;
}

.skills-chart {
  margin-bottom: 20px;
}

.skill-item {
  margin-bottom: 12px;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.skill-label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.skill-percentage {
  font-size: 13px;
  font-weight: 600;
  color: #1a202c;
}

.skill-bar {
  height: 6px;
  background-color: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.skills-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1C4ED8;
  margin-bottom: 2px;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
}

/* 今日推荐学习 - 设计 */
.daily-recommendation {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.daily-recommendation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.recommendation-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(16, 185, 129, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10B981;
  margin-right: 16px;
  flex-shrink: 0;
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.recommendation-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.time-estimate, .difficulty {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.time-estimate :deep(svg), .difficulty :deep(svg) {
  font-size: 12px;
  margin-right: 4px;
}

.recommendation-progress {
  margin-top: 4px;
}

.start-button-container {
  margin-left: 16px;
  flex-shrink: 0;
}

.start-button {
  background: linear-gradient(135deg, #10B981, #059669);
  border: none;
  transition: all 0.3s ease;
}

.start-button:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.welcome-decoration {
  position: relative;
  width: 120px;
  height: 120px;
  display: none;
}

.decoration-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5B8FF9, #1C4ED8);
  position: absolute;
  right: 10px;
  top: 10px;
  opacity: 0.8;
}

.decoration-dots {
  position: absolute;
  width: 100%;
  height: 100%;
}

.dot {
  position: absolute;
  border-radius: 50%;
  background-color: #1C4ED8;
  opacity: 0.2;
}

.dot-1 {
  width: 20px;
  height: 20px;
  left: 0;
  top: 20px;
}

.dot-2 {
  width: 15px;
  height: 15px;
  right: 0;
  bottom: 10px;
}

.dot-3 {
  width: 10px;
  height: 10px;
  left: 30px;
  bottom: 30px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .welcome-decoration {
    display: block;
  }

  .welcome-banner {
    padding: 32px 40px;
  }

  .welcome-title {
    font-size: 32px;
  }
}
</style>