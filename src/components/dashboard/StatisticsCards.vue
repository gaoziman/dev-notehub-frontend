<template>
  <div class="statistics-section">
    <n-grid :x-gap="24" :y-gap="24" :cols="gridCols">
      <n-gi span="1">
        <statistics-card
            title="文档总数"
            :value="127"
            icon="icon-wendang1"
            color="blue"
            :change="+12"
            arrow-type="up"
            change-text="较上月增加"
            :progress="64"
            progress-text="上传进度"
        />
      </n-gi>
      <n-gi span="1">
        <statistics-card
            title="代码片段"
            :value="246"
            icon="icon-code"
            color="purple"
            :change="+24"
            arrow-type="up"
            change-text="较上月增加"
            :progress="87"
            progress-text="总计使用"
        />
      </n-gi>
      <n-gi span="1">
        <statistics-card
            title="书签总数"
            :value="186"
            icon="icon-bookmark"
            color="green"
            :change="+18"
            arrow-type="up"
            change-text="本周新增"
            :progress="65"
            progress-text="完成分类"
        />
      </n-gi>
      <n-gi span="1">
        <statistics-card
            title="学习内容"
            :value="12"
            icon="icon-xuexi"
            color="amber"
            :change="+3"
            arrow-type="up"
            change-text="本周新增"
            :progress="45"
            progress-text="完成度"
        />
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup>
import { h, ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import StatisticsCard from '@/components/dashboard/StatisticsCard.vue'

const { width } = useWindowSize()

// 根据窗口宽度计算布局列数
const gridCols = computed(() => {
  if (width.value < 640) return 1
  if (width.value < 1024) return 2
  return 4
})
</script>

<style scoped>
.statistics-section {
  margin-bottom: 8px;
}
</style>