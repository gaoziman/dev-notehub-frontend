<template>
  <n-card class="resource-card" hoverable @click="$emit('click', resource)">
    <div class="resource-content">
      <div class="resource-icon">
        <icon-font :type="getIconType(resource.type)" :size="28" :color="getIconColor(resource.type)" />
      </div>
      <div class="resource-info">
        <div class="resource-title">{{ resource.title }}</div>
        <div class="resource-type">{{ getTypeLabel(resource.type) }}</div>
        <div class="resource-meta">
          <div class="resource-access">
            <icon-font type="icon-shijian" :size="14" />
            <span>{{ resource.lastAccessed }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="resource-footer">
        <n-space>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary circle size="small" @click.stop="openResource">
                <template #icon>
                  <icon-font type="icon-open" :size="14" />
                </template>
              </n-button>
            </template>
            打开资源
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary circle size="small" @click.stop="toggleFavorite">
                <template #icon>
                  <icon-font :type="resource.favorite ? 'icon-favorite-filled' : 'icon-favorite'" :size="14" :color="resource.favorite ? 'var(--warning-color)' : ''" />
                </template>
              </n-button>
            </template>
            {{ resource.favorite ? '取消收藏' : '收藏资源' }}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary circle size="small" @click.stop="showInfo">
                <template #icon>
                  <icon-font type="icon-info" :size="14" />
                </template>
              </n-button>
            </template>
            资源信息
          </n-tooltip>
        </n-space>
      </div>
    </template>
  </n-card>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  resource: {
    type: Object,
    required: true,
    validator: (resource) => {
      return resource.id && resource.title && resource.type
    }
  }
})

const emit = defineEmits(['click', 'favorite', 'open', 'info'])

const message = useMessage()

// 获取图标类型
const getIconType = (type) => {
  switch (type) {
    case 'documentation': return 'icon-wendang'
    case 'tutorial': return 'icon-jiaocheng'
    case 'video': return 'icon-shipin'
    case 'article': return 'icon-article'
    case 'ebook': return 'icon-book'
    case 'code': return 'icon-code'
    case 'tool': return 'icon-tool'
    default: return 'icon-resource'
  }
}

// 获取图标颜色
const getIconColor = (type) => {
  switch (type) {
    case 'documentation': return 'var(--primary-color)'
    case 'tutorial': return 'var(--success-color)'
    case 'video': return 'var(--error-color)'
    case 'article': return 'var(--info-color)'
    case 'ebook': return 'var(--warning-color)'
    case 'code': return 'var(--primary-color)'
    case 'tool': return 'var(--info-color)'
    default: return 'var(--text-color-tertiary)'
  }
}

// 获取类型标签
const getTypeLabel = (type) => {
  switch (type) {
    case 'documentation': return '技术文档'
    case 'tutorial': return '教程指南'
    case 'video': return '视频课程'
    case 'article': return '技术文章'
    case 'ebook': return '电子书籍'
    case 'code': return '代码示例'
    case 'tool': return '实用工具'
    default: return '学习资源'
  }
}

// 打开资源
const openResource = () => {
  emit('open', props.resource)
  if (props.resource.url) {
    window.open(props.resource.url, '_blank')
  } else {
    message.info('资源链接不可用')
  }
}

// 切换收藏状态
const toggleFavorite = () => {
  emit('favorite', {
    id: props.resource.id,
    favorite: !props.resource.favorite
  })

  message.success(props.resource.favorite ? '已取消收藏' : '已加入收藏')
}

// 显示资源详情
const showInfo = () => {
  emit('info', props.resource)
  message.info(`资源信息：${props.resource.title}`)
}
</script>

<style scoped>
.resource-card {
  height: 100%;
  transition: all 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--box-shadow-2);
}

.resource-content {
  display: flex;
  gap: 16px;
}

.resource-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
}

.resource-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.resource-title {
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.resource-type {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-access {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-actions {
  display: flex;
  gap: 8px;
}
</style>