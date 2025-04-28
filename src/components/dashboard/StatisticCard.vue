<template>
  <div class="statistic-card-wrapper">
    <n-card class="statistic-card" hoverable>
      <div class="card-content">
        <div
            class="icon-wrapper"
            :style="{
            background: `linear-gradient(135deg, ${getGradientColors(iconColor).light} 0%, ${getGradientColors(iconColor).dark} 100%)`
          }"
        >
          <div class="icon-inner">
            <icon-font :type="icon" :size="28" color="#fff" />
          </div>
          <!-- 装饰元素 -->
          <div class="decoration-dot dot-1"></div>
          <div class="decoration-dot dot-2"></div>
          <div class="decoration-circle"></div>
        </div>

        <div class="info-container">
          <h3 class="card-title">{{ title }}</h3>
          <div class="value-container">
            <p class="card-value">{{ animatedValue }}</p>
            <div v-if="growth !== null" class="growth-indicator" :class="{ 'positive': growth > 0, 'negative': growth < 0 }">
              <icon-font :type="growth > 0 ? 'icon-arrow-up' : 'icon-arrow-down'" :size="14" />
              <span>{{ Math.abs(growth) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { NCard } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: '#6366F1'
  },
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  growth: {
    type: Number,
    default: null
  }
});

// 动画数值
const animatedValue = ref(0);

// 数值动画效果
const animateValue = () => {
  const targetValue = Number(props.value);
  const duration = 1500; // 动画持续时间（毫秒）
  const startTime = Date.now();
  const startValue = 0;

  const updateValue = () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;

    if (elapsed < duration) {
      // 使用easeOutQuart缓动函数使动画更加生动
      const progress = 1 - Math.pow(1 - elapsed / duration, 4);
      animatedValue.value = Math.round(startValue + (targetValue - startValue) * progress);
      requestAnimationFrame(updateValue);
    } else {
      animatedValue.value = targetValue;
    }
  };

  updateValue();
};

// 根据主色生成渐变色
const getGradientColors = (baseColor) => {
  // 这里简化处理，实际可以使用色彩算法更精确地生成渐变
  return {
    light: baseColor,
    dark: adjustColor(baseColor, -20) // 稍微暗一点的颜色
  };
};

// 简单的颜色调整函数
const adjustColor = (hex, percent) => {
  // 简化处理，仅用于示例
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;

  return '#' + (
      0x1000000 +
      (r < 255 ? (r < 0 ? 0 : r) : 255) * 0x10000 +
      (g < 255 ? (g < 0 ? 0 : g) : 255) * 0x100 +
      (b < 255 ? (b < 0 ? 0 : b) : 255)
  ).toString(16).slice(1);
};

// 监听value变化，重新开始动画
watch(() => props.value, () => {
  animateValue();
});

onMounted(() => {
  animateValue();
});
</script>

<style scoped>
.statistic-card-wrapper {
  perspective: 1000px;
  height: 100%;
}

.statistic-card {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
  background: white;
  border: 1px solid rgba(235, 238, 245, 0.8);
}

.statistic-card:hover {
  transform: translateY(-8px) rotateX(2deg);
  box-shadow: 0 16px 30px -12px rgba(39, 56, 106, 0.18),
  0 4px 8px -2px rgba(82, 95, 127, 0.06);
}

.statistic-card:hover .icon-wrapper {
  transform: scale(1.08) rotate(2deg);
}

.statistic-card:hover .decoration-dot {
  opacity: 1;
}

.card-content {
  display: flex;
  padding: 16px;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 66px;
  height: 66px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.icon-inner {
  position: relative;
  z-index: 2;
}

/* 装饰元素 */
.decoration-dot {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  opacity: 0.5;
  transition: opacity 0.5s ease;
}

.dot-1 {
  width: 8px;
  height: 8px;
  top: 12px;
  right: 12px;
}

.dot-2 {
  width: 6px;
  height: 6px;
  bottom: 14px;
  left: 14px;
}

.decoration-circle {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  bottom: -20px;
  right: -20px;
}

.info-container {
  flex: 1;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  margin: 0 0 6px 0;
  letter-spacing: 0.3px;
}

.value-container {
  display: flex;
  align-items: flex-end;
}

.card-value {
  font-size: 1.85rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.5px;
}

.growth-indicator {
  display: flex;
  align-items: center;
  padding: 3px 8px;
  margin-left: 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.positive {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.negative {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}
</style>