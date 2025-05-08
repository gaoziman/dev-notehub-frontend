<template>
  <div class="card-container">
    <!-- 总书签数 -->
    <div class="knowledge-card" style="background-color: var(--primary-color-suppl); color: var(--primary-color-pressed);">
      <div class="card-header">
        <h3 class="card-title">书签总数</h3>
        <icon-font type="icon-bookmark-fill" :size="24" />
      </div>
      <div class="card-value">{{ statistics.total }}</div>
      <div class="card-description">共计收藏的网页资源</div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${getCategorizedPercentage()}%` }"></div>
      </div>
      <div class="progress-description">
        {{ getCategorizedPercentage() }}% 已分类
      </div>
    </div>

    <!-- 最近添加 -->
    <div class="knowledge-card" style="background-color: var(--success-color-suppl); color: var(--success-color-pressed);">
      <div class="card-header">
        <h3 class="card-title">最近添加</h3>
        <icon-font type="icon-add-circle" :size="24" />
      </div>
      <div class="card-value">{{ statistics.recent }}</div>
      <div class="card-description">本周新增书签</div>
      <div class="card-tags">
        <div class="tag-action">View (8)</div>
        <div class="tag-action">React (5)</div>
        <div class="tag-action">More (10+)</div>
      </div>
    </div>

    <!-- 常用书签 -->
    <div class="knowledge-card" style="background-color: var(--warning-color-suppl); color: var(--warning-color-pressed);">
      <div class="card-header">
        <h3 class="card-title">常用书签</h3>
        <icon-font type="icon-star-fill" :size="24" />
      </div>
      <div class="card-value">{{ statistics.frequent }}</div>
      <div class="card-description">访问次数最多的书签</div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${getFrequentPercentage()}%` }"></div>
      </div>
      <div class="progress-description">
        占总数的{{ getFrequentPercentage() }}%
      </div>
    </div>

    <!-- 待整理 -->
    <div class="knowledge-card" style="background-color: var(--error-color-suppl); color: var(--error-color-pressed);">
      <div class="card-header">
        <h3 class="card-title">待整理</h3>
        <icon-font type="icon-tag" :size="24" />
      </div>
      <div class="card-value">{{ statistics.total - statistics.categorized }}</div>
      <div class="card-description">{{ getUncategorizedPercentage() }}% 未添加标签或分类</div>
      <div class="card-action">
        一键整理书签
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 接收统计数据
const props = defineProps({
  statistics: {
    type: Object,
    required: true,
    default: () => ({
      total: 0,
      recent: 0,
      frequent: 0,
      categorized: 0
    })
  }
});

// 计算分类百分比
const getCategorizedPercentage = () => {
  if (props.statistics.total === 0) return 0;
  return Math.round((props.statistics.categorized / props.statistics.total) * 100);
};

// 计算常用书签百分比
const getFrequentPercentage = () => {
  if (props.statistics.total === 0) return 0;
  return Math.round((props.statistics.frequent / props.statistics.total) * 100);
};

// 计算未分类百分比
const getUncategorizedPercentage = () => {
  if (props.statistics.total === 0) return 0;
  return Math.round(((props.statistics.total - props.statistics.categorized) / props.statistics.total) * 100);
};
</script>

<style scoped>
.card-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.knowledge-card {
  border-radius: var(--border-radius);
  padding: 16px;
  transition: box-shadow var(--transition-duration) var(--transition-timing-function);
}

.knowledge-card:hover {
  box-shadow: var(--box-shadow-2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.card-value {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-description {
  font-size: 14px;
  margin-bottom: 16px;
}

.progress-container {
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background-color: currentColor;
  border-radius: 4px;
}

.progress-description {
  font-size: 12px;
  text-align: right;
}

.card-tags {
  display: flex;
  gap: 8px;
}

.tag-action {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
}

.tag-action:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.card-action {
  margin-top: 16px;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.card-action:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1200px) {
  .card-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .card-container {
    grid-template-columns: 1fr;
  }
}
</style>