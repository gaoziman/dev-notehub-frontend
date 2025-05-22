<template>
  <stats-cards
      :cards-data="documentCardsData"
      :columns="4"
      :show-waveform="true"
  />
</template>

<script setup>
import {computed} from 'vue'
import StatsCards from '@/components/common/StatsCards.vue'

const props = defineProps({
  totalCount: {
    type: Number,
    default: 0
  },
  weeklyCount: {
    type: Number,
    default: 0
  },
  monthlyCount: {
    type: Number,
    default: 0
  },
  importantCount: {
    type: Number,
    default: 0
  }
})

// 将颜色转换为RGB值用于CSS变量
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '99, 102, 241' // 默认值
}

// 文档相关的卡片数据配置
const documentCardsData = computed(() => {
  // 计算各个指标的百分比
  const weeklyPercentage = props.totalCount === 0 ? 0 :
      Math.min(100, Math.round((props.weeklyCount / props.totalCount) * 100))

  const monthlyPercentage = props.totalCount === 0 ? 0 :
      Math.min(100, Math.round((props.monthlyCount / props.totalCount) * 100))

  const importantPercentage = props.totalCount === 0 ? 0 :
      Math.min(100, Math.round((props.importantCount / props.totalCount) * 100))

  return [
    {
      id: 'total',
      title: '文档总数',
      subtitle: '共计收录文档数量',
      value: props.totalCount,
      icon: 'icon-folder',
      color: '#6366f1',
      colorRgb: hexToRgb('#6366f1'),
      colorClass: 'total-card',
      trend: {
        value: 5, // 实际项目中应从后端获取
        type: 'positive'
      },
      progress: {
        value: 100,
        label: '100%'
      }
    },
    {
      id: 'weekly',
      title: '本周新增',
      subtitle: '最近7天新增文档数',
      value: props.weeklyCount,
      icon: 'icon-calendar-week',
      color: '#18a058',
      colorRgb: hexToRgb('#18a058'),
      colorClass: 'weekly-card',
      trend: {
        value: 12, // 实际项目中应从后端获取
        type: 'positive'
      },
      progress: {
        value: weeklyPercentage,
        label: `${weeklyPercentage}%`
      }
    },
    {
      id: 'monthly',
      title: '本月新增',
      subtitle: '最近30天新增文档数',
      value: props.monthlyCount,
      icon: 'icon-calendar-month',
      color: '#f0a020',
      colorRgb: hexToRgb('#f0a020'),
      colorClass: 'monthly-card',
      trend: {
        value: 8, // 实际项目中应从后端获取
        type: 'positive'
      },
      progress: {
        value: monthlyPercentage,
        label: `${monthlyPercentage}%`
      }
    },
    {
      id: 'important',
      title: '重要文档',
      subtitle: '已标记重要文档数',
      value: props.importantCount,
      icon: 'icon-star-filled',
      color: '#d03050',
      colorRgb: hexToRgb('#d03050'),
      colorClass: 'important-card',
      trend: {
        value: 15, // 实际项目中应从后端获取
        type: 'positive'
      },
      progress: {
        value: importantPercentage,
        label: `${importantPercentage}%`
      }
    }
  ]
})
</script>

<style scoped>
</style>