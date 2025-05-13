<template>
  <n-card title="学习进度" class="learning-progress">
    <template #header-extra>
      <n-select
          v-model:value="timeRange"
          :options="timeRangeOptions"
          size="small"
          style="width: 120px"
      />
    </template>

    <div class="chart-container">
      <div class="chart-tabs">
        <n-tabs v-model:value="activeChart" type="line" animated>
          <n-tab-pane name="weekly" tab="学习时长">
            <div ref="weeklyChartRef" class="chart"></div>
          </n-tab-pane>
          <n-tab-pane name="progress" tab="完成进度">
            <div ref="progressChartRef" class="chart"></div>
          </n-tab-pane>
          <n-tab-pane name="skills" tab="技能雷达">
            <div ref="skillsChartRef" class="chart"></div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

    <div class="skill-progress">
      <div class="skill-progress-header">
        <h3 class="skill-progress-title">热门学习路径</h3>
        <n-button text size="small">查看全部</n-button>
      </div>

      <div class="skill-items">
        <div v-for="(skill, index) in skillsPaths" :key="index" class="skill-item">
          <div class="skill-info">
            <div class="skill-icon" :style="{ backgroundColor: skill.iconBg }">
              <icon-font :type="skill.icon" :size="20" color="#fff" />
            </div>
            <div class="skill-detail">
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-stats">{{ skill.completed }}/{{ skill.total }} 已完成</div>
            </div>
          </div>
          <n-progress
              type="line"
              :percentage="(skill.completed / skill.total) * 100"
              :color="skill.color"
              :rail-color="skill.railColor"
          />
        </div>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import IconFont from '@/components/common/IconFont.vue';
import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart,
  RadarChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必需的组件
echarts.use([
  BarChart,
  LineChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  DataZoomComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

// 用于保存图表实例的引用
let weeklyChart = null;
let progressChart = null;
let skillsChart = null;

// 图表DOM引用
const weeklyChartRef = ref(null);
const progressChartRef = ref(null);
const skillsChartRef = ref(null);

// 活动图表标签
const activeChart = ref('weekly');

// 时间范围选择
const timeRange = ref('month');
const timeRangeOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' }
];

// 学习路径数据
const skillsPaths = [
  {
    name: 'Vue3前端开发',
    icon: 'icon-vue',
    iconBg: 'rgba(66, 184, 131, 0.1)',
    color: '#42b883',
    railColor: 'rgba(66, 184, 131, 0.1)',
    completed: 24,
    total: 30
  },
  {
    name: 'Spring Boot后端开发',
    icon: 'icon-java',
    iconBg: 'rgba(239, 71, 111, 0.1)',
    color: '#ef476f',
    railColor: 'rgba(239, 71, 111, 0.1)',
    completed: 18,
    total: 25
  },
  {
    name: 'TypeScript进阶',
    icon: 'icon-typescript',
    iconBg: 'rgba(0, 122, 204, 0.1)',
    color: '#007acc',
    railColor: 'rgba(0, 122, 204, 0.1)',
    completed: 12,
    total: 20
  },
  {
    name: 'Docker容器化部署',
    icon: 'icon-docker',
    iconBg: 'rgba(13, 95, 166, 0.1)',
    color: '#0d5fa6',
    railColor: 'rgba(13, 95, 166, 0.1)',
    completed: 8,
    total: 15
  }
];

// 周学习时长数据
const weeklyLearningData = [
  { day: '周一', hours: 2.5, completed: 2 },
  { day: '周二', hours: 1.8, completed: 1 },
  { day: '周三', hours: 3.2, completed: 3 },
  { day: '周四', hours: 0.5, completed: 0 },
  { day: '周五', hours: 1.5, completed: 1 },
  { day: '周六', hours: 4.2, completed: 2 },
  { day: '周日', hours: 2.3, completed: 2 }
];

// 学习进度数据
const progressData = [
  { month: '1月', progress: 28 },
  { month: '2月', progress: 35 },
  { month: '3月', progress: 42 },
  { month: '4月', progress: 58 },
  { month: '5月', progress: 68 }
];

// 技能雷达数据
const skillsData = [
  { name: 'Vue', value: 85 },
  { name: 'TypeScript', value: 65 },
  { name: 'CSS', value: 70 },
  { name: '性能优化', value: 55 },
  { name: '组件设计', value: 75 },
  { name: '状态管理', value: 80 }
];

// 初始化周学习时长图表
const initWeeklyChart = () => {
  if (!weeklyChartRef.value) return;

  const chartDom = weeklyChartRef.value;
  weeklyChart = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const data = params[0].data;
        return `${params[0].name}<br/>学习时长: ${data.hours}小时<br/>完成任务: ${data.completed}个`;
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
      data: weeklyLearningData.map(item => item.day),
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '学习时长(小时)',
      nameTextStyle: {
        color: '#666'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: '学习时长',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#6366f1' },
            { offset: 1, color: '#818cf8' }
          ])
        },
        data: weeklyLearningData.map(item => ({
          value: item.hours,
          hours: item.hours,
          completed: item.completed
        }))
      }
    ]
  };

  weeklyChart.setOption(option);
};

// 初始化学习进度图表
const initProgressChart = () => {
  if (!progressChartRef.value) return;

  const chartDom = progressChartRef.value;
  progressChart = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>完成进度: ${params[0].value}%`;
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
      data: progressData.map(item => item.month),
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '完成进度(%)',
      min: 0,
      max: 100,
      interval: 20,
      nameTextStyle: {
        color: '#666'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: '完成进度',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 4,
          color: '#18a058'
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#18a058'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 160, 88, 0.4)' },
            { offset: 1, color: 'rgba(24, 160, 88, 0.1)' }
          ])
        },
        data: progressData.map(item => item.progress)
      }
    ]
  };

  progressChart.setOption(option);
};

// 初始化技能雷达图表
const initSkillsChart = () => {
  if (!skillsChartRef.value) return;

  const chartDom = skillsChartRef.value;
  skillsChart = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: skillsData.map(item => ({
        name: item.name,
        max: 100
      })),
      radius: '60%',
      splitNumber: 5,
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: ['#eee']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.5)', 'rgba(245, 245, 245, 0.5)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      }
    },
    series: [
      {
        name: '技能掌握度',
        type: 'radar',
        data: [
          {
            value: skillsData.map(item => item.value),
            name: '当前水平',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(99, 102, 241, 0.6)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0.2)' }
              ])
            },
            lineStyle: {
              color: '#6366f1',
              width: 2
            },
            itemStyle: {
              color: '#6366f1'
            }
          }
        ]
      }
    ]
  };

  skillsChart.setOption(option);
};

// 监听活动图表变化
watch(activeChart, (newVal) => {
  setTimeout(() => {
    if (newVal === 'weekly' && !weeklyChart) {
      initWeeklyChart();
    } else if (newVal === 'progress' && !progressChart) {
      initProgressChart();
    } else if (newVal === 'skills' && !skillsChart) {
      initSkillsChart();
    }

    // 如果图表已经存在，则调整大小以适应容器
    if (newVal === 'weekly' && weeklyChart) {
      weeklyChart.resize();
    } else if (newVal === 'progress' && progressChart) {
      progressChart.resize();
    } else if (newVal === 'skills' && skillsChart) {
      skillsChart.resize();
    }
  }, 0);
});

// 处理窗口大小变化
const handleResize = () => {
  if (weeklyChart) weeklyChart.resize();
  if (progressChart) progressChart.resize();
  if (skillsChart) skillsChart.resize();
};

// 生命周期钩子
onMounted(() => {
  // 初始化默认的图表
  initWeeklyChart();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理资源
const onUnmounted = () => {
  window.removeEventListener('resize', handleResize);

  if (weeklyChart) {
    weeklyChart.dispose();
    weeklyChart = null;
  }

  if (progressChart) {
    progressChart.dispose();
    progressChart = null;
  }

  if (skillsChart) {
    skillsChart.dispose();
    skillsChart = null;
  }
};
</script>

<style scoped>
.learning-progress {
  height: 100%;
}

.chart-container {
  width: 100%;
  margin-bottom: 20px;
}

.chart-tabs {
  height: 380px;
}

.chart {
  height: 320px;
  width: 100%;
}

.skill-progress {
  margin-top: 16px;
}

.skill-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.skill-progress-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-color-base);
}

.skill-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.skill-item {
  background-color: var(--body-color);
  padding: 16px;
  border-radius: var(--border-radius);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.skill-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-1);
}

.skill-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.skill-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skill-detail {
  display: flex;
  flex-direction: column;
}

.skill-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color-base);
}

.skill-stats {
  font-size: 13px;
  color: var(--text-color-tertiary);
}

@media (max-width: 768px) {
  .skill-items {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 260px;
  }
}
</style>