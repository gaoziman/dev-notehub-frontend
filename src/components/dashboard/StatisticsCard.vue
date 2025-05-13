<template>
  <n-card :bordered="false" class="statistics-card" :class="colorClass">
    <div class="card-body">
      <div class="card-title-row">
        <h3 class="card-title">{{ title }}</h3>
        <div class="badge" :class="arrowType === 'up' ? 'positive' : 'negative'">
          <icon-font :type="arrowType === 'up' ? 'icon-arrow-up' : 'icon-arrow-down'" :size="14" />
          <span>{{ change > 0 ? `+${change}` : change }}</span>
        </div>
      </div>

      <div class="card-value">{{ typeof value === 'number' ? value.toLocaleString() : value }}</div>

      <div class="card-info-text">{{ changeText }}</div>

      <div class="icon-bg">
        <icon-font :type="icon" :size="60" />
      </div>
    </div>

    <div class="card-footer" v-if="progress !== undefined">
      <div class="progress-label">
        <span>{{ progressText }}</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="progress-bar-wrapper">
        <div class="progress-bar" :style="{ width: `${Math.min(progress, 100)}%` }"></div>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'amber', 'red', 'purple'].includes(value)
  },
  change: {
    type: Number,
    default: 0
  },
  arrowType: {
    type: String,
    default: 'up',
    validator: (value) => ['up', 'down'].includes(value)
  },
  changeText: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: undefined
  },
  progressText: {
    type: String,
    default: '完成度'
  }
})

const colorClass = computed(() => {
  return `${props.color}-card`
})
</script>

<style scoped>
.statistics-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  height: 220px;
  display: flex;
  flex-direction: column;
}

.statistics-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-body {
  flex: 1;
  padding: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
}

.badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.positive {
  background-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.negative {
  background-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.card-value {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-info-text {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  z-index: 2;
}

.icon-bg {
  position: absolute;
  right: -10px;
  bottom: -10px;
  opacity: 0.15;
  transform: rotate(-5deg);
  z-index: 1;
}

.card-footer {
  padding: 12px 20px;
  background-color: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
}

.progress-bar-wrapper {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  transition: width 0.3s ease;
}

/* 卡片颜色方案 */
.blue-card {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
}

.green-card {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.amber-card {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
}

.red-card {
  background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
}

.purple-card {
  background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
}
</style>