<template>
  <n-card
      class="snippet-card"
      :bordered="false"
      @click="$emit('click')"
  >
    <!-- 卡片内容区域 -->
    <div class="card-content">
      <!-- 顶部区域：技术标签和分类 -->
      <div class="card-top">
        <tech-badge :tech="snippet.technology" class="tech-badge" />
        <div class="category-tags">
          <n-tag size="small" :type="getCategoryType(snippet.category)" class="category-tag">
            {{ getCategoryLabel(snippet.category) }}
          </n-tag>
          <n-tag size="small" type="warning" class="usage-tag">
            {{ getUsageLabel(snippet.usage) }}
          </n-tag>
        </div>
      </div>

      <!-- 标题和描述 -->
      <div class="card-header">
        <h3 class="card-title">{{ snippet.title }}</h3>
        <p class="card-description">{{ snippet.description }}</p>
      </div>

      <!-- 代码预览 -->
      <div class="code-preview">
        <pre class="code-block"><code>{{ getCodePreview() }}</code></pre>
        <div class="code-gradient"></div>
      </div>

      <!-- 元数据和标签区域 -->
      <div class="card-footer">
        <div class="meta-section">
          <div class="author-date">
            <span class="author-info">
              <icon-font type="icon-user" :size="14" />
              {{ snippet.author }}
            </span>
            <span class="date-info">
              <icon-font type="icon-calendar" :size="14" />
              {{ formatDate(snippet.createdAt) }}
            </span>
          </div>
          <div class="stats">
            <span class="views-count">
              <icon-font type="icon-view" :size="14" />
              {{ snippet.views }}
            </span>
            <span class="likes-count">
              <icon-font type="icon-like" :size="14" />
              {{ snippet.likes }}
            </span>
          </div>
        </div>

        <div class="card-tags">
          <n-tag v-for="tag in displayTags" :key="tag" size="tiny" round class="tag">
            {{ tag }}
          </n-tag>
          <n-tag v-if="snippet.tags.length > maxTags" size="tiny" round type="info">
            +{{ snippet.tags.length - maxTags }}
          </n-tag>
        </div>
      </div>
    </div>

    <!-- 查看按钮 -->
    <div class="card-action">
      <div class="view-button">
        查看详情
        <icon-font type="icon-right" :size="12" class="arrow-icon" />
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import IconFont from '@/components/common/IconFont.vue'
import TechBadge from './TechBadge.vue'

defineEmits(['click'])

const props = defineProps({
  snippet: {
    type: Object,
    required: true
  }
})

// 最多显示的标签数量
const maxTags = 2

// 计算需要显示的标签
const displayTags = computed(() => {
  return props.snippet.tags.slice(0, maxTags)
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return `${diffDays}天前`
  } else {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

// 获取代码预览（前几行）
const getCodePreview = () => {
  // 检查 code 是否存在且为字符串
  if (!props.snippet.code || typeof props.snippet.code !== 'string') {
    return '// 无代码内容'
  }

  const code = props.snippet.code
  const lines = code.split('\n')
  const previewLines = lines.slice(0, 4)  // 减少为4行以使卡片更紧凑
  const preview = previewLines.join('\n')

  if (lines.length > 4) {
    return preview + '\n...'
  }

  return preview
}

// 获取分类标签类型
const getCategoryType = (category) => {
  const typeMap = {
    'form': 'success',
    'navigation': 'info',
    'data-display': 'warning',
    'utility': 'default',
    'layout': 'primary',
    'animation': 'error'
  }

  return typeMap[category] || 'default'
}

// 获取分类标签文本
const getCategoryLabel = (category) => {
  const labelMap = {
    'form': '表单组件',
    'navigation': '导航组件',
    'data-display': '数据展示',
    'utility': '功能组件',
    'layout': '布局组件',
    'animation': '动画效果'
  }

  return labelMap[category] || category
}

// 获取使用场景标签文本
const getUsageLabel = (usage) => {
  const labelMap = {
    'admin': '后台管理',
    'mobile': '移动端应用',
    'data-viz': '数据可视化',
    'auth': '用户认证',
    'business-logic': '业务逻辑'
  }

  return labelMap[usage] || usage
}
</script>

<style scoped>
.snippet-card {
  height: 100%;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  position: relative;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tech-badge {
  margin-right: 8px;
}

.category-tags {
  display: flex;
  gap: 6px;
}

.category-tag, .usage-tag {
  font-size: 11px;
  padding: 0 8px;
  height: 20px;
  line-height: 20px;
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--text-color-base);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-description {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.code-preview {
  position: relative;
  background-color: var(--body-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  height: 100px;
}

.code-block {
  margin: 0;
  padding: 10px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-color-base);
  overflow: hidden;
  height: 100%;
}

.code-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, rgba(245, 247, 250, 0), rgba(245, 247, 250, 1));
  pointer-events: none;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.meta-section {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.author-date, .stats {
  display: flex;
  gap: 10px;
}

.author-info,
.date-info,
.views-count,
.likes-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  font-size: 11px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
}

.card-action {
  background: linear-gradient(to right, var(--primary-color), var(--info-color));
  padding: 10px 16px;
  color: #fff;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s;
  text-align: center;
}

.view-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.arrow-icon {
  transition: transform 0.3s;
}

.snippet-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.snippet-card:hover .arrow-icon {
  transform: translateX(3px);
}

@media (max-width: 640px) {
  .card-content {
    padding: 14px;
  }

  .card-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .category-tags {
    align-self: flex-end;
  }

  .meta-section {
    flex-direction: column;
    gap: 6px;
  }
}
</style>