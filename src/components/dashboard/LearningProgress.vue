<template>
  <div class="learning-progress-container">
    <div class="header">
      <div class="title-section">
        <h3 class="title">技术掌握度</h3>
        <div class="sparkle-decoration"></div>
      </div>
      <n-tooltip trigger="hover" placement="top">
        <template #trigger>
          <div class="info-icon">
            <icon-font type="icon-fenxi" :size="16" color="#64748b" />
          </div>
        </template>
        <span class="tooltip-content">基于已完成学习的内容计算出的技术掌握程度分析</span>
      </n-tooltip>
    </div>

    <div class="skills-list">
      <transition-group
          name="skill-item"
          tag="div"
          class="skill-transition-container"
      >
        <div
            v-for="(skill, index) in skills"
            :key="skill.name"
            class="skill-item"
            :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="skill-header">
            <div class="skill-name-section">
              <div class="skill-icon-wrapper" :class="getSkillIconClass(skill.name)">
                <div class="skill-icon-inner">
                  <icon-font :type="getSkillIcon(skill.name)" :size="14" color="#fff" />
                </div>
              </div>
              <span class="skill-name">{{ skill.name }}</span>
            </div>

            <div class="skill-stats">
              <div class="skill-level" :class="getSkillLevelClass(skill.progress)">
                {{ getSkillLevelText(skill.progress) }}
              </div>
              <span class="skill-percentage" :class="getProgressTextColor(skill.progress)">
                {{ skill.progress }}%
              </span>
            </div>
          </div>

          <div class="progress-track">
            <div
                class="progress-track-milestone"
                :class="{ 'milestone-active': skill.progress >= 50 }"
            ></div>
            <n-progress
                :percentage="skill.progress"
                :height="10"
                :border-radius="5"
                :color="getProgressGradient(skill.progress)"
                :rail-color="getRailColor()"
                :processing="true"
            />
          </div>
        </div>
      </transition-group>
    </div>

    <div class="footer">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color beginner-color"></div>
          <span>初学者</span>
        </div>
        <div class="legend-item">
          <div class="legend-color intermediate-color"></div>
          <span>进阶中</span>
        </div>
        <div class="legend-item">
          <div class="legend-color advanced-color"></div>
          <span>熟练</span>
        </div>
      </div>

      <n-button text type="primary" size="small" class="detail-button">
        <template #icon>
          <icon-font type="icon-chart" :size="14" />
        </template>
        详细分析
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { NProgress, NTooltip, NButton } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

defineProps({
  skills: {
    type: Array,
    required: true
  }
});

// 根据技能名称获取图标
const getSkillIcon = (name) => {
  const iconMap = {
    'Java基础': 'icon-udf-jar',
    'Spring系列': 'icon-spring1',
    'MySQL': 'icon-mysql1',
    'Redis': 'icon-redis',
    '消息队列': 'icon-xiaoxiduilieKafka'
  };
  return iconMap[name] || 'icon-code';
};

// 根据技能名称获取图标背景色类
const getSkillIconClass = (name) => {
  const classMap = {
    'Java基础': 'java-bg',
    'Spring系列': 'spring-bg',
    'MySQL': 'mysql-bg',
    'Redis': 'redis-bg',
    '消息队列': 'mq-bg'
  };
  return classMap[name] || 'default-bg';
};

// 根据进度获取渐变颜色
const getProgressGradient = (progress) => {
  if (progress < 30) return 'linear-gradient(90deg, #f97316 0%, #fdba74 100%)';
  if (progress < 70) return 'linear-gradient(90deg, #0ea5e9 0%, #7dd3fc 100%)';
  return 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
};

// 获取进度条轨道颜色
const getRailColor = () => {
  return 'rgba(241, 245, 249, 0.8)';
};

// 根据进度获取文本颜色
const getProgressTextColor = (progress) => {
  if (progress < 30) return 'text-warning';
  if (progress < 70) return 'text-info';
  return 'text-success';
};

// 根据进度获取技能等级文本
const getSkillLevelText = (progress) => {
  if (progress < 30) return '初学者';
  if (progress < 70) return '进阶中';
  return '熟练';
};

// 根据进度获取技能等级类
const getSkillLevelClass = (progress) => {
  if (progress < 30) return 'level-beginner';
  if (progress < 70) return 'level-intermediate';
  return 'level-advanced';
};
</script>

<style scoped>
.learning-progress-container {
  background-color: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.title-section {
  flex: 1;
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

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.info-icon:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
}

.tooltip-content {
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 240px;
  line-height: 1.5;
}

.skills-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* 添加一些内边距，为自定义滚动条留出空间 */
  padding-right: 6px;
  overflow-y: auto;
  /* 滚动条自定义 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.skills-list::-webkit-scrollbar {
  width: 6px;
  border-radius: 3px;
}

.skills-list::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.skills-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.skill-transition-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-item {
  position: relative;
  animation: slide-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.skill-name-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skill-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.skill-icon-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.skill-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  filter: blur(2px) brightness(1.1);
  z-index: 1;
  transform: scale(1.05);
}

.skill-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
  letter-spacing: -0.3px;
}

.skill-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-level {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.level-beginner {
  background-color: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.level-intermediate {
  background-color: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
}

.level-advanced {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.skill-percentage {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.text-warning {
  color: #f97316;
}

.text-info {
  color: #0ea5e9;
}

.text-success {
  color: #10b981;
}

.progress-track {
  position: relative;
}

/* 50%里程碑标记 */
.progress-track-milestone {
  position: absolute;
  width: 2px;
  height: 10px;
  background-color: rgba(203, 213, 225, 0.5);
  left: 50%;
  z-index: 1;
  top: 0;
  transition: background-color 0.3s;
}

.milestone-active {
  background-color: rgba(255, 255, 255, 0.7);
}

.footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px dashed rgba(203, 213, 225, 0.5);
}

.legend {
  display: flex;
  gap: 18px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.beginner-color {
  background: linear-gradient(135deg, #f97316 0%, #fdba74 100%);
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.25);
}

.intermediate-color {
  background: linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%);
  box-shadow: 0 2px 4px rgba(14, 165, 233, 0.25);
}

.advanced-color {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
}

.legend-item span {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.detail-button {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}

.detail-button:hover {
  background-color: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

/* 背景色类 */
.java-bg {
  background: linear-gradient(135deg, #0d47a1 0%, #1976d2 100%);
}

.spring-bg {
  background: linear-gradient(135deg, #1b5e20 0%, #4caf50 100%);
}

.mysql-bg {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
}

.redis-bg {
  background: linear-gradient(135deg, #b71c1c 0%, #e53935 100%);
}

.mq-bg {
  background: linear-gradient(135deg, #e65100 0%, #ff9800 100%);
}

.default-bg {
  background: linear-gradient(135deg, #455a64 0%, #78909c 100%);
}

/* 组项目动画 */
.skill-item-move,
.skill-item-enter-active,
.skill-item-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.skill-item-enter-from,
.skill-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保离开的项目不会影响布局 */
.skill-item-leave-active {
  position: absolute;
}
</style>