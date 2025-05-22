<template>
  <div class="stats-dashboard" :style="gridStyle">
    <div
        v-for="(card, index) in cardsData"
        :key="card.id"
        class="stat-card"
        :class="[`${card.id}-card`, card.colorClass]"
        :style="{ '--card-color': card.color, '--card-color-rgb': card.colorRgb }"
    >
      <div class="card-glow"></div>
      <div class="card-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-line"></div>
      </div>
      <div class="card-content">
        <div class="card-top">
          <div class="icon-container">
            <div class="icon-inner">
              <icon-font :type="card.icon" :size="26" />
            </div>
          </div>
          <div class="trend-indicator" :class="card.trend.type" v-if="card.trend">
            <div class="trend-value">{{ formatTrend(card.trend.value, card.trend.type) }}</div>
            <div class="trend-arrow">
              <icon-font :type="getTrendIcon(card.trend.type)" :size="14" />
            </div>
          </div>
        </div>

        <div class="card-middle">
          <div class="stat-value-wrapper">
            <div class="stat-value">{{ formatNumber(card.value) }}</div>
            <div class="stat-animation-layer"></div>
          </div>
          <div class="stat-title">{{ card.title }}</div>
        </div>

        <!-- 音频波形图 -->
        <div class="waveform-container" v-if="showWaveform">
          <div class="waveform">
            <div class="wave-bar" v-for="(height, waveIndex) in generateWaveform(7, card.id)" :key="waveIndex"
                 :style="{ height: `${height}px` }"></div>
          </div>
        </div>

        <!-- 底部区域 -->
        <div class="card-bottom-container">
          <div class="card-bottom">
            <div class="stat-subtitle-box">
              <span class="stat-subtitle">{{ card.subtitle }}</span>
            </div>
            <div class="progress-container" v-if="card.progress">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${card.progress.value}%` }"></div>
              </div>
              <div class="progress-value">{{ card.progress.label || `${card.progress.value}%` }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  // 卡片数据数组
  cardsData: {
    type: Array,
    required: true,
    default: () => []
  },
  // 网格列数，支持响应式
  columns: {
    type: [Number, Object],
    default: 4
  },
  // 是否显示波形图
  showWaveform: {
    type: Boolean,
    default: true
  },
  // 卡片间距
  gap: {
    type: String,
    default: '24px'
  },
  // 卡片高度
  cardHeight: {
    type: String,
    default: '240px'
  }
})

// 计算网格样式
const gridStyle = computed(() => {
  let gridColumns

  if (typeof props.columns === 'object') {
    // 响应式列数配置
    gridColumns = `repeat(${props.columns.default || 4}, 1fr)`
  } else {
    gridColumns = `repeat(${props.columns}, 1fr)`
  }

  return {
    'grid-template-columns': gridColumns,
    'gap': props.gap,
    '--card-height': props.cardHeight
  }
})

// 数字格式化，添加千位分隔符
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

// 格式化趋势值
const formatTrend = (value, type) => {
  const prefix = type === 'positive' ? '+' : type === 'negative' ? '-' : ''
  return `${prefix}${Math.abs(value)}%`
}

// 获取趋势图标
const getTrendIcon = (type) => {
  switch (type) {
    case 'positive':
      return 'icon-up'
    case 'negative':
      return 'icon-down'
    default:
      return 'icon-minus'
  }
}

// 生成波形数据
const generateWaveform = (count, cardId) => {
  const heights = []
  const minHeight = 15
  const maxHeight = 35

  // 根据卡片ID生成不同的波形模式
  const sequences = {
    total: [0.8, 0.9, 0.7, 1, 0.8, 0.9, 0.7],
    weekly: [0.7, 0.9, 0.7, 0.8, 0.9, 0.7, 0.8],
    monthly: [0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6],
    important: [0.9, 0.8, 0.7, 0.8, 0.9, 1, 0.9]
  }

  const baseSequence = sequences[cardId] || sequences.total

  for (let i = 0; i < count; i++) {
    const multiplier = baseSequence[i % baseSequence.length]
    heights.push(minHeight + (maxHeight - minHeight) * multiplier)
  }

  return heights
}

// 组件挂载后添加动画
onMounted(() => {
  const statCards = document.querySelectorAll('.stat-card')

  // 为每个卡片添加进入动画，延迟顺序入场
  statCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate-in')
    }, index * 150)
  })

  // 为波形条添加动画，延迟启动
  if (props.showWaveform) {
    setTimeout(() => {
      document.querySelectorAll('.waveform').forEach(waveform => {
        waveform.classList.add('animate-waveform')
      })
    }, 800)
  }
})
</script>

<style scoped>
.stats-dashboard {
  display: grid;
  margin-bottom: 32px;
  padding: 8px 0;
  width: 100%;
  max-width: 100%;
}

/* 卡片基础样式 */
.stat-card {
  position: relative;
  height: var(--card-height, 240px);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.06),
      0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.stat-card.animate-in {
  transform: translateY(0);
  opacity: 1;
}

/* 卡片装饰元素 */
.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  overflow: hidden;
  opacity: 0.1;
  z-index: 0;
  pointer-events: none;
  color: var(--card-color);
}

.decoration-circle {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 5px solid currentColor;
  opacity: 0.2;
}

.decoration-line {
  position: absolute;
  top: 30px;
  right: -10px;
  width: 60px;
  height: 3px;
  background-color: currentColor;
  transform: rotate(-45deg);
  opacity: 0.5;
}

/* 卡片光晕效果 */
.card-glow {
  position: absolute;
  top: -60px;
  left: -100px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
  transition: all 0.4s ease;
  background: rgba(var(--card-color-rgb), 0.4);
}

/* 卡片内容布局 */
.card-content {
  position: relative;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-middle {
  text-align: left;
  margin-bottom: 12px;
  flex-grow: 0;
  position: relative;
  height: 80px;
}

/* 波形图样式 */
.waveform-container {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  height: 40px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.waveform {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  gap: 4px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.5s ease;
  color: var(--card-color);
}

.waveform.animate-waveform {
  opacity: 1;
  transform: translateX(0);
}

.wave-bar {
  width: 4px;
  background-color: currentColor;
  border-radius: 2px;
  animation: wave-animation 1.2s ease-in-out infinite;
  transform-origin: center bottom;
  will-change: height;
}

.wave-bar:nth-child(1) { animation-delay: -1.2s; }
.wave-bar:nth-child(2) { animation-delay: -1.0s; }
.wave-bar:nth-child(3) { animation-delay: -0.8s; }
.wave-bar:nth-child(4) { animation-delay: -0.6s; }
.wave-bar:nth-child(5) { animation-delay: -0.4s; }
.wave-bar:nth-child(6) { animation-delay: -0.2s; }
.wave-bar:nth-child(7) { animation-delay: 0s; }

@keyframes wave-animation {
  0%, 100% {
    transform: scaleY(0.8);
  }
  50% {
    transform: scaleY(1.1);
  }
}

/* 底部区域容器 */
.card-bottom-container {
  position: relative;
  margin-top: auto;
  width: 100%;
  height: 60px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.35));
  margin-left: -24px;
  padding: 0 24px;
  width: calc(100% + 48px);
  border-radius: 0 0 20px 20px;
}

/* 底部内容样式 */
.card-bottom {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

/* 图标样式 */
.icon-container {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  position: relative;
  box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 12px 24px rgba(0, 0, 0, 0.04);
}

.icon-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  color: var(--card-color);
  background: linear-gradient(135deg, rgba(var(--card-color-rgb), 0.1) 0%, rgba(var(--card-color-rgb), 0.2) 100%);
}

/* 趋势指标样式 */
.trend-indicator {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.trend-indicator.positive {
  background: rgba(24, 160, 88, 0.1);
  color: #18a058;
}

.trend-indicator.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.trend-indicator.neutral {
  background: rgba(156, 163, 175, 0.1);
  color: #9ca3af;
}

.trend-value {
  margin-right: 4px;
}

/* 数值样式 */
.stat-value-wrapper {
  position: relative;
  overflow: hidden;
  width: 60%;
}

.stat-value {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  font-feature-settings: "tnum";
  letter-spacing: -1px;
  background: linear-gradient(120deg, var(--card-color) 20%, var(--card-color) 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: transform 0.5s ease;
  transform-origin: left center;
  display: block;
  position: relative;
  white-space: nowrap;
  filter: brightness(0.8);
}

.stat-animation-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.8) 50%,
      transparent 100%
  );
  transform: translateX(-100%);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  20% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}

.stat-title {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  margin-top: 4px;
  white-space: nowrap;
}

/* 底部标题样式盒子 */
.stat-subtitle-box {
  display: inline-block;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

/* 底部标题文字 */
.stat-subtitle {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  background-color: rgba(255, 255, 255, 0.65);
  padding: 4px 10px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: inline-block;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* 进度条样式 */
.progress-container {
  width: 100%;
  margin-top: 6px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-track {
  height: 8px;
  flex-grow: 1;
  background: rgba(226, 232, 240, 0.7);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--card-color), var(--card-color));
  border-radius: 4px;
  transition: width 1s ease-in-out;
  box-shadow: 0 0 4px rgba(var(--card-color-rgb), 0.5);
  transform-origin: left center;
  filter: brightness(1.1);
}

.progress-value {
  font-size: 14px;
  font-weight: 700;
  min-width: 42px;
  text-align: right;
  color: var(--card-color);
  filter: brightness(0.8);
}

/* 卡片悬停效果 */
.stat-card:hover {
  transform: translateY(-8px);
  box-shadow:
      0 20px 30px rgba(0, 0, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.stat-card:hover .card-glow {
  opacity: 0.8;
  transform: scale(1.5);
}

.stat-card:hover .icon-inner {
  transform: scale(1.1) rotate(5deg);
}

.stat-card:hover .stat-value {
  transform: scale(1.05);
}

.stat-card:hover .wave-bar {
  animation-duration: 0.8s;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .stats-dashboard {
    gap: 20px;
  }
}

@media (max-width: 1200px) {
  .stats-dashboard {
    gap: 16px;
  }

  .stat-card {
    height: 220px;
  }

  .card-content {
    padding: 20px;
  }

  .card-bottom-container {
    margin-left: -20px;
    padding: 0 20px;
    width: calc(100% + 40px);
    height: 55px;
  }

  .stat-subtitle {
    font-size: 13px;
    padding: 3px 8px;
  }

  .waveform-container {
    width: 70px;
  }

  .stat-value {
    font-size: 48px;
  }
}

@media (max-width: 1024px) {
  .stats-dashboard {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 20px;
  }

  .stat-card {
    height: 220px;
  }

  .card-middle {
    margin-bottom: 10px;
  }

  .card-bottom-container {
    height: 52px;
  }

  .waveform-container {
    width: 80px;
  }

  .stat-value {
    font-size: 54px;
    width: 70%;
  }
}

@media (max-width: 768px) {
  .stats-dashboard {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 16px;
  }

  .stat-card {
    height: 200px;
  }

  .card-content {
    padding: 16px;
  }

  .card-bottom-container {
    margin-left: -16px;
    padding: 0 16px;
    width: calc(100% + 32px);
    height: 50px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 46px;
  }

  .card-middle {
    margin-bottom: 6px;
    height: 70px;
  }

  .stat-subtitle {
    font-size: 12px;
    font-weight: 700;
    padding: 3px 6px;
  }

  .progress-track {
    height: 6px;
  }

  .waveform-container {
    width: 70px;
    height: 35px;
  }

  .wave-bar {
    width: 3px;
  }
}

@media (max-width: 480px) {
  .stats-dashboard {
    grid-template-columns: 1fr !important;
  }

  .stat-card {
    height: 180px;
  }

  .card-top {
    margin-bottom: 12px;
  }

  .card-middle {
    margin-bottom: 6px;
    height: 60px;
  }

  .card-bottom-container {
    height: 48px;
  }

  .card-bottom {
    padding: 8px 0;
  }

  .stat-subtitle {
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 800;
    background-color: rgba(255, 255, 255, 0.8);
  }

  .waveform-container {
    width: 80px;
    height: 40px;
  }

  .stat-value {
    font-size: 52px;
  }
}

/* 适配暗色模式 */
@media (prefers-color-scheme: dark) {
  .stat-card {
    background: rgba(30, 41, 59, 0.7);
  }

  .icon-container {
    background: rgba(51, 65, 85, 0.8);
  }

  .stat-title {
    color: #cbd5e1;
  }

  .card-decoration {
    opacity: 0.15;
  }

  .card-bottom-container {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.3));
  }

  .stat-subtitle {
    color: #f8fafc;
    background-color: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(51, 65, 85, 0.6);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    font-weight: 700;
  }

  .progress-track {
    background: rgba(51, 65, 85, 0.6);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .progress-value {
    color: #e2e8f0;
  }
}
</style>