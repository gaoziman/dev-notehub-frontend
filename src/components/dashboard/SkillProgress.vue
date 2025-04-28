<template>
  <div class="skill-progress">
    <h3 class="text-lg font-bold text-gray-800 mb-4">技能掌握度</h3>
    <div class="space-y-5">
      <div v-for="(skill, index) in skills" :key="index" class="skill-item">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center">
            <div class="skill-icon" :class="getSkillIconClass(skill.name)">
              <icon-font :type="getSkillIcon(skill.name)" :size="16" color="#fff" />
            </div>
            <span class="text-sm font-medium text-gray-800 ml-2">{{ skill.name }}</span>
          </div>
          <div class="flex items-center">
            <div class="relative skill-level">
              <div v-for="i in 5" :key="i"
                   class="skill-dot"
                   :class="{ 'active': getSkillLevel(skill.progress) >= i }">
              </div>
            </div>
            <span class="text-sm font-semibold ml-3" :class="getProgressTextColor(skill.progress)">
              {{ skill.progress }}%
            </span>
          </div>
        </div>
        <div class="skill-bar-container">
          <div class="skill-bar" :style="{ width: `${skill.progress}%`, backgroundColor: getProgressColor(skill.progress) }"></div>
          <div class="skill-milestones">
            <div v-for="milestone in [20, 40, 60, 80, 100]" :key="milestone"
                 class="milestone"
                 :class="{ 'reached': skill.progress >= milestone }">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui';
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
    'Java基础': 'icon-java',
    'Spring系列': 'icon-spring',
    'MySQL': 'icon-database',
    'Redis': 'icon-redis',
    '消息队列': 'icon-message'
  };
  return iconMap[name] || 'icon-code';
};

// 根据技能名称获取图标背景色类
const getSkillIconClass = (name) => {
  const classMap = {
    'Java基础': 'bg-blue-600',
    'Spring系列': 'bg-green-600',
    'MySQL': 'bg-indigo-600',
    'Redis': 'bg-red-600',
    '消息队列': 'bg-amber-600'
  };
  return classMap[name] || 'bg-gray-600';
};

// 根据进度获取颜色
const getProgressColor = (progress) => {
  if (progress < 30) return 'var(--warning-color)';
  if (progress < 70) return 'var(--info-color)';
  return 'var(--success-color)';
};

// 根据进度获取文本颜色
const getProgressTextColor = (progress) => {
  if (progress < 30) return 'text-yellow-600';
  if (progress < 70) return 'text-blue-600';
  return 'text-green-600';
};

// 根据百分比计算技能等级（1-5）
const getSkillLevel = (progress) => {
  return Math.ceil(progress / 20);
};
</script>

<style scoped>
.skill-progress {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.skill-item {
  position: relative;
}

.skill-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-bar-container {
  height: 8px;
  background-color: #f1f5f9;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.skill-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.skill-level {
  display: flex;
  gap: 3px;
}

.skill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e2e8f0;
  transition: all 0.3s ease;
}

.skill-dot.active {
  background-color: var(--success-color);
}

.skill-milestones {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  pointer-events: none;
}

.milestone {
  width: 2px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 0.5;
}

.milestone.reached {
  opacity: 1;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-green-600 {
  background-color: #16a34a;
}

.bg-indigo-600 {
  background-color: #4f46e5;
}

.bg-red-600 {
  background-color: #dc2626;
}

.bg-amber-600 {
  background-color: #d97706;
}

.bg-gray-600 {
  background-color: #4b5563;
}
</style>