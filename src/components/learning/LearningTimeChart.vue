<template>
  <div class="chart-wrapper" :style="{ height }">
    <div v-if="loading" class="chart-loading">
      <n-spin size="medium" />
    </div>
    <div v-else-if="!chartData || chartData.length === 0" class="chart-empty">
      <n-empty description="暂无学习数据" />
    </div>
    <div v-else ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer
])

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  period: {
    type: String,
    default: 'weekly',
    validator: (value) => ['daily', 'weekly', 'monthly'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '300px'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartContainer = ref(null)
let chartInstance = null

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

// 获取图表配置选项
const getChartOptions = () => {
  const xAxisData = props.chartData.map(item => {
    if (props.period === 'weekly') return item.day
    if (props.period === 'monthly') return item.month
    return item.date
  })

  // 获取默认标题
  const defaultTitle = props.period === 'weekly'
      ? '每周学习时长统计'
      : props.period === 'monthly'
          ? '月度学习时长统计'
          : '学习时长统计'

  return {
    title: {
      text: props.title || defaultTitle,
      left: 'center',
      textStyle: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-base').trim()
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const hoursData = params[0]
        const completedData = params[1]

        return `
          <div class="tooltip-content">
            <div>${hoursData.name}</div>
            <div>
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${hoursData.color};margin-right:5px;"></span>
              学习时长: ${hoursData.value} 小时
            </div>
            <div>
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${completedData.color};margin-right:5px;"></span>
              完成项目: ${completedData.value} 个
            </div>
          </div>
        `
      }
    },
    legend: {
      data: ['学习时长(小时)', '完成项目数'],
      top: '30px',
      textStyle: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary').trim()
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
        }
      },
      axisLabel: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary').trim()
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '学习时长(小时)',
        axisLine: {
          lineStyle: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
          }
        },
        axisLabel: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary').trim()
        },
        splitLine: {
          lineStyle: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--divider-color').trim(),
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '完成项目数',
        axisLine: {
          lineStyle: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
          }
        },
        axisLabel: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary').trim()
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '学习时长(小时)',
        type: 'bar',
        data: props.chartData.map(item => item.hours),
        itemStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()
        },
        barMaxWidth: 50
      },
      {
        name: '完成项目数',
        type: 'line',
        yAxisIndex: 1,
        data: props.chartData.map(item => item.completed),
        itemStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim()
        },
        lineStyle: {
          width: 3
        },
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 8
      }
    ],
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' }
      }
    }
  }
}

// 监听图表数据变化
watch(() => props.chartData, () => {
  nextTick(() => {
    if (chartInstance) {
      chartInstance.setOption(getChartOptions())
    } else {
      initChart()
    }
  })
}, { deep: true })

// 监听期间变化
watch(() => props.period, () => {
  nextTick(() => {
    if (chartInstance) {
      chartInstance.setOption(getChartOptions())
    }
  })
})

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
.chart-wrapper {
  width: 100%;
  position: relative;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-loading, .chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>