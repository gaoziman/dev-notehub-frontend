<template>
  <div class="data-overview-container">
    <div class="section-header">
      <div class="header-content">
        <icon-font type="icon-chart-bar" :size="24" class="header-icon" />
        <h3 class="section-title">数据概览</h3>
      </div>
      <div class="time-selector">
        <n-button-group>
          <n-button
              v-for="period in timePeriods"
              :key="period.value"
              :type="selectedPeriod === period.value ? 'primary' : 'default'"
              size="small"
              @click="handlePeriodChange(period.value)"
          >
            {{ period.label }}
          </n-button>
        </n-button-group>
      </div>
    </div>

    <!-- 重新设计的简洁双列布局 - 左侧图表，右侧标签云 -->
    <div class="charts-grid">
      <!-- 左侧主要图表区域 - 内容增长趋势图 -->
      <div class="main-chart-section">
        <div class="chart-card growth-chart">
          <div class="chart-header">
            <h4 class="chart-title">内容增长趋势</h4>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-dot" style="background: #6366f1"></div>
                <span>文档</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot" style="background: #10b981"></div>
                <span>书签</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot" style="background: #f59e0b"></div>
                <span>代码片段</span>
              </div>
            </div>
          </div>
          <div class="chart-content" ref="chartContainerRef">
            <canvas
                ref="growthChartRef"
                class="chart-canvas"
                :width="canvasWidth"
                :height="canvasHeight"
                @click="handleChartClick"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- 右侧热门标签区域 - 重新设计以匹配左侧高度 -->
      <div class="tags-panel">
        <div class="chart-card tags-cloud-enhanced">
          <div class="tags-header">
            <div class="tags-header-content">
              <div class="tags-icon-wrapper">
                <icon-font type="icon-tag" :size="20" class="tags-main-icon" />
              </div>
              <div class="tags-title-section">
                <h4 class="tags-title">热门标签</h4>
                <p class="tags-subtitle">{{ selectedPeriod === 'week' ? '本周' : selectedPeriod === 'month' ? '本月' : '本季度' }}统计</p>
              </div>
            </div>
            <div class="tags-count-badge">
              <div class="tags-total">{{ popularTags.length }}</div>
              <div class="tags-label">标签总数</div>
            </div>
          </div>

          <div class="tags-content-enhanced">
            <!-- 标签统计概览 -->
            <div class="tags-stats-row">
              <div class="tag-stat-item">
                <div class="stat-number">{{ getTotalTagUsage() }}</div>
                <div class="stat-label">总使用次数</div>
              </div>
              <div class="tag-stat-item">
                <div class="stat-number">{{ getTopTagUsage() }}</div>
                <div class="stat-label">最高使用</div>
              </div>
              <div class="tag-stat-item">
                <div class="stat-number">{{ getAverageTagUsage() }}</div>
                <div class="stat-label">平均使用</div>
              </div>
            </div>

            <!-- 分类标签展示 -->
            <div class="tags-categories">
              <div class="category-section">
                <h5 class="category-title">前端技术</h5>
                <div class="category-tags">
                  <div
                      v-for="tag in frontendTags"
                      :key="tag.name"
                      class="modern-tag category-tag"
                      :class="getTagClass(tag.count)"
                      @click="handleTagClick(tag)"
                  >
                    <div class="tag-glow" :style="{ background: tag.color }"></div>
                    <div class="tag-content">
                      <span class="tag-name">{{ tag.name }}</span>
                      <span class="tag-count">{{ tag.count }}</span>
                    </div>
                    <div class="tag-shine"></div>
                  </div>
                </div>
              </div>

              <div class="category-section">
                <h5 class="category-title">后端技术</h5>
                <div class="category-tags">
                  <div
                      v-for="tag in backendTags"
                      :key="tag.name"
                      class="modern-tag category-tag"
                      :class="getTagClass(tag.count)"
                      @click="handleTagClick(tag)"
                  >
                    <div class="tag-glow" :style="{ background: tag.color }"></div>
                    <div class="tag-content">
                      <span class="tag-name">{{ tag.name }}</span>
                      <span class="tag-count">{{ tag.count }}</span>
                    </div>
                    <div class="tag-shine"></div>
                  </div>
                </div>
              </div>

              <div class="category-section">
                <h5 class="category-title">开发工具</h5>
                <div class="category-tags">
                  <div
                      v-for="tag in toolTags"
                      :key="tag.name"
                      class="modern-tag category-tag"
                      :class="getTagClass(tag.count)"
                      @click="handleTagClick(tag)"
                  >
                    <div class="tag-glow" :style="{ background: tag.color }"></div>
                    <div class="tag-content">
                      <span class="tag-name">{{ tag.name }}</span>
                      <span class="tag-count">{{ tag.count }}</span>
                    </div>
                    <div class="tag-shine"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 标签云词汇墙效果 -->
            <div class="tags-word-cloud">
              <h5 class="cloud-title">标签云</h5>
              <div class="cloud-container">
                <div
                    v-for="tag in allTagsSorted"
                    :key="tag.name"
                    class="cloud-tag"
                    :class="getCloudTagClass(tag.count)"
                    :style="getCloudTagStyle(tag)"
                    @click="handleTagClick(tag)"
                >
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

// Canvas引用和尺寸控制
const growthChartRef = ref(null)
const chartContainerRef = ref(null)

// 优化Canvas尺寸以适应新的双列布局
const canvasWidth = ref(700)
const canvasHeight = ref(440)

// 状态管理
const selectedPeriod = ref('week')
const isDrawing = ref(false)

const timePeriods = [
  { label: '7天', value: 'week' },
  { label: '30天', value: 'month' },
  { label: '90天', value: 'quarter' }
]

// 增强的标签数据 - 按技术类别分组
const popularTags = ref([
  // 前端技术
  { name: 'Vue3', count: 45, color: '#6366f1', category: 'frontend' },
  { name: 'JavaScript', count: 38, color: '#10b981', category: 'frontend' },
  { name: 'TypeScript', count: 32, color: '#f59e0b', category: 'frontend' },
  { name: 'React', count: 28, color: '#ef4444', category: 'frontend' },
  { name: 'CSS', count: 25, color: '#8b5cf6', category: 'frontend' },
  { name: 'Vue Router', count: 18, color: '#6366f1', category: 'frontend' },
  { name: 'Pinia', count: 15, color: '#10b981', category: 'frontend' },

  // 后端技术
  { name: 'Node.js', count: 22, color: '#06b6d4', category: 'backend' },
  { name: 'Python', count: 20, color: '#84cc16', category: 'backend' },
  { name: 'MySQL', count: 16, color: '#14b8a6', category: 'backend' },
  { name: 'Redis', count: 12, color: '#f97316', category: 'backend' },

  // 开发工具
  { name: 'Docker', count: 19, color: '#f97316', category: 'tools' },
  { name: 'Git', count: 17, color: '#ec4899', category: 'tools' },
  { name: 'VS Code', count: 14, color: '#6366f1', category: 'tools' },
  { name: 'Webpack', count: 11, color: '#8b5cf6', category: 'tools' }
])

// 计算属性 - 按类别分组标签
const frontendTags = computed(() =>
    popularTags.value.filter(tag => tag.category === 'frontend')
)

const backendTags = computed(() =>
    popularTags.value.filter(tag => tag.category === 'backend')
)

const toolTags = computed(() =>
    popularTags.value.filter(tag => tag.category === 'tools')
)

const allTagsSorted = computed(() =>
    [...popularTags.value].sort((a, b) => b.count - a.count)
)

// 标签统计计算
const getTotalTagUsage = () => {
  return popularTags.value.reduce((sum, tag) => sum + tag.count, 0)
}

const getTopTagUsage = () => {
  return Math.max(...popularTags.value.map(tag => tag.count))
}

const getAverageTagUsage = () => {
  const total = getTotalTagUsage()
  return Math.round(total / popularTags.value.length)
}

// 模拟增长数据
const growthData = {
  week: {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    documents: [5, 8, 12, 7, 15, 10, 6],
    bookmarks: [3, 6, 8, 4, 12, 8, 5],
    snippets: [2, 4, 6, 3, 8, 5, 3]
  },
  month: {
    labels: ['第1周', '第2周', '第3周', '第4周'],
    documents: [45, 52, 38, 48],
    bookmarks: [32, 28, 35, 40],
    snippets: [18, 22, 16, 24]
  },
  quarter: {
    labels: ['第1月', '第2月', '第3月'],
    documents: [156, 178, 142],
    bookmarks: [124, 108, 136],
    snippets: [68, 84, 72]
  }
}

// 工具方法 - 标签样式计算
const getTagClass = (count) => {
  const maxCount = Math.max(...popularTags.value.map(tag => tag.count))
  const ratio = count / maxCount

  if (ratio >= 0.8) return 'tag-xl'
  if (ratio >= 0.6) return 'tag-lg'
  if (ratio >= 0.4) return 'tag-md'
  return 'tag-sm'
}

// 云标签样式计算
const getCloudTagClass = (count) => {
  const maxCount = Math.max(...popularTags.value.map(tag => tag.count))
  const ratio = count / maxCount

  if (ratio >= 0.9) return 'cloud-xl'
  if (ratio >= 0.7) return 'cloud-lg'
  if (ratio >= 0.5) return 'cloud-md'
  if (ratio >= 0.3) return 'cloud-sm'
  return 'cloud-xs'
}

const getCloudTagStyle = (tag) => {
  const maxCount = Math.max(...popularTags.value.map(tag => tag.count))
  const ratio = tag.count / maxCount

  return {
    color: tag.color,
    opacity: 0.7 + (ratio * 0.3) // 根据使用频率调整透明度
  }
}

// Canvas操作方法
const getCanvasContext = (canvasRef) => {
  if (!canvasRef.value) return null
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return null
  return ctx
}

const updateCanvasSize = () => {
  if (!chartContainerRef.value) return
  const containerRect = chartContainerRef.value.getBoundingClientRect()
  const newWidth = Math.max(450, Math.min(800, Math.floor(containerRect.width)))
  const newHeight = Math.max(350, Math.min(480, 440))
  canvasWidth.value = newWidth
  canvasHeight.value = newHeight
}

const drawGrowthChart = () => {
  if (isDrawing.value) return
  isDrawing.value = true

  try {
    const ctx = getCanvasContext(growthChartRef)
    if (!ctx) return

    const width = canvasWidth.value
    const height = canvasHeight.value

    ctx.clearRect(0, 0, width, height)

    const data = growthData[selectedPeriod.value]
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const allValues = [...data.documents, ...data.bookmarks, ...data.snippets].filter(v => typeof v === 'number' && !isNaN(v))
    if (allValues.length === 0) return

    const maxValue = Math.max(...allValues) * 1.2
    const minValue = 0

    // 绘制背景网格
    ctx.strokeStyle = '#f1f5f9'
    ctx.lineWidth = 1
    ctx.fillStyle = '#64748b'
    ctx.font = '12px system-ui, -apple-system, sans-serif'

    // Y轴网格线和标签
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      const value = Math.round(maxValue - (maxValue / 5) * i)

      if (y >= padding && y <= padding + chartHeight) {
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + chartWidth, y)
        ctx.stroke()

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(value.toString(), padding - 10, y)
      }
    }

    // X轴标签
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    data.labels.forEach((label, i) => {
      const x = padding + (chartWidth / (data.labels.length - 1)) * i
      if (x >= padding && x <= padding + chartWidth) {
        ctx.fillText(label, x, height - padding + 10)
      }
    })

    // 绘制数据线
    const colors = ['#6366f1', '#10b981', '#f59e0b']
    const datasets = [data.documents, data.bookmarks, data.snippets]

    datasets.forEach((dataset, datasetIndex) => {
      if (!Array.isArray(dataset)) return

      ctx.strokeStyle = colors[datasetIndex]
      ctx.fillStyle = colors[datasetIndex]
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // 绘制线条
      ctx.beginPath()
      let firstPoint = true

      dataset.forEach((value, i) => {
        if (typeof value !== 'number' || isNaN(value)) return

        const x = padding + (chartWidth / (dataset.length - 1)) * i
        const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight

        if (x >= padding && x <= padding + chartWidth && y >= padding && y <= padding + chartHeight) {
          if (firstPoint) {
            ctx.moveTo(x, y)
            firstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()

      // 绘制数据点
      dataset.forEach((value, i) => {
        if (typeof value !== 'number' || isNaN(value)) return

        const x = padding + (chartWidth / (dataset.length - 1)) * i
        const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight

        if (x >= padding && x <= padding + chartWidth && y >= padding && y <= padding + chartHeight) {
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = colors[datasetIndex]
        }
      })
    })
  } catch (error) {
    console.warn('绘制增长图表时出错:', error)
  } finally {
    isDrawing.value = false
  }
}

// 事件处理方法
const handleTagClick = (tag) => {
  console.log('点击标签:', tag.name)
}

const handlePeriodChange = (newPeriod) => {
  if (selectedPeriod.value === newPeriod) return
  selectedPeriod.value = newPeriod
  nextTick(() => {
    setTimeout(drawGrowthChart, 50)
  })
}

const handleChartClick = (event) => {
  console.log('图表被点击', event)
}

// 响应式处理
let resizeTimer = null
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    updateCanvasSize()
    nextTick(() => {
      drawGrowthChart()
    })
  }, 150)
}

// 监听周期变化
watch(selectedPeriod, () => {
  nextTick(() => {
    setTimeout(drawGrowthChart, 100)
  })
})

// 组件挂载和卸载处理
onMounted(() => {
  updateCanvasSize()
  nextTick(() => {
    setTimeout(() => {
      drawGrowthChart()
    }, 200)
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
})
</script>

<style scoped>
.data-overview-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: #f59e0b;
  filter: drop-shadow(0 2px 4px rgba(240, 160, 32, 0.3));
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* 简洁的双列布局 - 左图表右标签 */
.charts-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr; /* 左侧图表获得更多空间，右侧标签区域充分利用 */
  gap: 32px;
  min-height: 500px;
  align-items: stretch;
}

.main-chart-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tags-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chart-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.growth-chart {
  min-height: 500px;
}

/* 🎨 增强的标签云设计 */
.tags-cloud-enhanced {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 255, 0.9) 100%);
  border: 1px solid rgba(139, 92, 246, 0.1);
  box-shadow:
      0 4px 16px rgba(139, 92, 246, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.tags-cloud-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #10b981 100%);
  border-radius: 16px 16px 0 0;
}

/* 标签区域头部设计 */
.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 2px;
}

.tags-header-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tags-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.tags-main-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.tags-title-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tags-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.025em;
}

.tags-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.tags-count-badge {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
  position: relative;
  overflow: hidden;
}

.tags-count-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 3s infinite;
}

.tags-total {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tags-label {
  font-size: 10px;
  margin-top: 2px;
  opacity: 0.9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 标签内容增强区域 */
.tags-content-enhanced {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* 标签统计行 */
.tags-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 4px;
}

.tag-stat-item {
  background: rgba(139, 92, 246, 0.05);
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid rgba(139, 92, 246, 0.1);
  transition: all 0.3s ease;
}

.tag-stat-item:hover {
  background: rgba(139, 92, 246, 0.08);
  transform: translateY(-1px);
}

.stat-number {
  font-size: 16px;
  font-weight: 700;
  color: #8b5cf6;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
}

/* 分类标签展示 */
.tags-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.category-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 现代化标签设计 */
.modern-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.category-tag {
  font-size: 11px;
}

.tag-glow {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  border-radius: 8px;
  transition: opacity 0.3s ease;
}

.tag-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}

.tag-name {
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 0.02em;
}

.tag-count {
  background: rgba(0, 0, 0, 0.08);
  color: #6b7280;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  min-width: 16px;
  text-align: center;
}

.tag-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

/* 标签尺寸变体 */
.modern-tag.tag-xl .tag-content { padding: 6px 10px; font-size: 12px; }
.modern-tag.tag-lg .tag-content { padding: 5px 9px; font-size: 11px; }
.modern-tag.tag-md .tag-content { padding: 4px 8px; font-size: 11px; }
.modern-tag.tag-sm .tag-content { padding: 4px 7px; font-size: 10px; }

/* 标签悬停效果 */
.modern-tag:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.modern-tag:hover .tag-glow {
  opacity: 0.18;
}

.modern-tag:hover .tag-shine {
  left: 100%;
}

.modern-tag:hover .tag-count {
  background: rgba(0, 0, 0, 0.12);
  color: #374151;
}

/* 标签云词汇墙 */
.tags-word-cloud {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(99, 102, 241, 0.02) 100%);
  border-radius: 10px;
  padding: 16px;
  border: 1px solid rgba(139, 92, 246, 0.08);
}

.cloud-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  text-align: center;
}

.cloud-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: center;
  align-items: center;
  line-height: 1.6;
}

.cloud-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 2px 4px;
  border-radius: 4px;
  position: relative;
}

.cloud-tag:hover {
  transform: scale(1.1);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 云标签尺寸 */
.cloud-xl { font-size: 18px; font-weight: 800; }
.cloud-lg { font-size: 16px; font-weight: 700; }
.cloud-md { font-size: 14px; font-weight: 600; }
.cloud-sm { font-size: 12px; font-weight: 600; }
.cloud-xs { font-size: 11px; font-weight: 500; }

/* 动画定义 */
@keyframes shimmer {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .charts-grid {
    grid-template-columns: 1.2fr 1fr;
    gap: 28px;
  }
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    min-height: auto;
  }

  .main-chart-section {
    order: 1;
    height: auto;
  }

  .tags-panel {
    order: 2;
    height: auto;
  }

  .growth-chart {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .time-selector {
    width: 100%;
  }

  .chart-legend {
    flex-direction: column;
    gap: 8px;
  }

  .charts-grid {
    gap: 20px;
  }

  .tags-stats-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .category-tags {
    justify-content: center;
  }

  .tags-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tags-count-badge {
    align-self: stretch;
    text-align: center;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .data-overview-container {
    background: rgba(30, 41, 59, 0.8);
  }

  .chart-card {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .tags-cloud-enhanced {
    background: linear-gradient(145deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
    border-color: rgba(139, 92, 246, 0.2);
  }

  .category-section {
    background: rgba(51, 65, 85, 0.6);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .modern-tag {
    background: rgba(51, 65, 85, 0.6);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .modern-tag .tag-name {
    color: #f1f5f9;
  }

  .modern-tag .tag-count {
    background: rgba(0, 0, 0, 0.3);
    color: #94a3b8;
  }

  .modern-tag:hover .tag-count {
    background: rgba(0, 0, 0, 0.4);
    color: #e2e8f0;
  }

  .tags-word-cloud {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%);
    border-color: rgba(139, 92, 246, 0.15);
  }
}
</style>