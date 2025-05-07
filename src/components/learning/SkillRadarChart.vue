<template>
  <div class="skill-radar-wrapper" :style="{ height }">
    <div v-if="loading" class="skill-radar-loading">
      <n-spin size="medium" />
    </div>
    <div v-else-if="!skills || skills.length === 0" class="skill-radar-empty">
      <n-empty description="暂无技能数据" />
    </div>
    <div v-else ref="chartContainer" class="skill-radar-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

const props = defineProps({
  skills: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '技能雷达图'
  },
  height: {
    type: String,
    default: '300px'
  },
  loading: {
    type: Boolean,
    default: false
  },
  maxValue: {
    type: Number,
    default: 100
  }
})

const chartContainer = ref(null)
let chartInstance = null

// 获取主题颜色
const getThemeColors = () => {
  return {
    primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
    success: getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),
    warning: getComputedStyle(document.documentElement).getPropertyValue('--warning-color').trim(),
    info: getComputedStyle(document.documentElement).getPropertyValue('--info-color').trim(),
    error: getComputedStyle(document.documentElement).getPropertyValue('--error-color').trim(),
    textBase: getComputedStyle(document.documentElement).getPropertyValue('--text-color-base').trim(),
    textSecondary: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary').trim(),
    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
    dividerColor: getComputedStyle(document.documentElement).getPropertyValue('--divider-color').trim()
  }
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  // 如果图表已经存在，销毁它
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建新的图表实例
  chartInstance = echarts.init(chartContainer.value)

  // 配置图表选项
  const options = getChartOptions()

  // 设置图表选项
  chartInstance.setOption(options)

  // 设置响应式
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 获取技能级别描述
const getSkillLevelDescription = (value) => {
  if (value >= 90) return '专家'
  if (value >= 75) return '熟练'
  if (value >= 60) return '良好'
  if (value >= 40) return '基础'
  if (value >= 20) return '入门'
  return '初学'
}

// 获取图表配置选项
const getChartOptions = () => {
  const colors = getThemeColors()

  // 技能指标
  const indicator = props.skills.map(skill => ({
    name: skill.name,
    max: props.maxValue
  }))

  return {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        color: colors.textBase
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const data = params.value
        const index = params.dataIndex
        const name = props.skills[index].name
        const value = data[index]
        const levelDesc = getSkillLevelDescription(value)

        return `
          <div>
            <div style="margin-bottom:5px;font-weight:bold;">${name}</div>
            <div>技能值: ${value}</div>
            <div>水平: ${levelDesc}</div>
          </div>
        `
      }
    },
    radar: {
      indicator: indicator,
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: colors.textSecondary,
        // 在雷达图坐标轴外围添加背景提高可读性
        formatter: (name, indicator) => {
          return `{a|${name}}`
        },
        rich: {
          a: {
            color: colors.textSecondary,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            padding: [3, 5],
            borderRadius: 3
          }
        }
      },
      splitLine: {
        lineStyle: {
          color: colors.dividerColor
        }
      },
      axisLine: {
        lineStyle: {
          color: colors.borderColor
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)']
        }
      }
    },
    series: [
      {
        name: '技能值',
        type: 'radar',
        lineStyle: {
          width: 2,
          color: colors.primary
        },
        // 为雷达图添加内部填充渐变效果
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: echarts.color.modifyAlpha(colors.primary, 0.6)
            },
            {
              offset: 1,
              color: echarts.color.modifyAlpha(colors.primary, 0.1)
            }
          ])
        },
        data: [
          {
            value: props.skills.map(skill => skill.value),
            name: '当前水平',
            // 给数据点添加样式
            itemStyle: {
              color: colors.primary
            },
            // 强调拐点
            symbolSize: 6
          }
        ]
      }
    ],
    // 添加一些交互特性
    animation: true,
    animationDuration: 1000,
    animationEasing: 'elasticOut'
  }
}

// 监听数据变化
watch(() => props.skills, () => {
  nextTick(() => {
    if (chartInstance) {
      chartInstance.setOption(getChartOptions())
    } else {
      initChart()
    }
  })
}, { deep: true })

// 组件挂载时初始化图表
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

// 组件卸载前清理资源
const onBeforeUnmount = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
}
</script>

<style scoped>
.skill-radar-wrapper {
  width: 100%;
  position: relative;
}

.skill-radar-container {
  width: 100%;
  height: 100%;
}

.skill-radar-loading, .skill-radar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>