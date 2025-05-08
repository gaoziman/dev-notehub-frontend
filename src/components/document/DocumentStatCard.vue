<template>
  <div class="stat-card" :style="{ '--card-color': color }">
    <div class="icon-wrapper">
      <icon-font :type="icon" :size="24" :color="color" />
    </div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="value-row">
        <span class="value">{{ value }}</span>
        <div v-if="change !== undefined" class="change" :class="{ 'positive': change > 0, 'negative': change < 0 }">
          <icon-font :type="change > 0 ? 'icon-shangsheng' : 'icon-xiajiang'" :size="14" />
          <span>{{ Math.abs(change) }} {{ changeLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconFont from "@/components/common/IconFont.vue";

defineProps({
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
    default: '#6366f1'
  },
  change: {
    type: Number,
    default: undefined
  },
  changeLabel: {
    type: String,
    default: '较上月'
  }
})
</script>

<style scoped>
.stat-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  padding: 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-2);
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--card-color);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(var(--card-color-rgb, 99, 102, 241), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.content {
  flex: 1;
}

.title {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.value-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-base);
}

.change {
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 4px;
}

.positive {
  color: var(--success-color);
}

.negative {
  color: var(--error-color);
}
</style>