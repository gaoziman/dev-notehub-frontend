<template>
  <div class="activity-timeline-container">
    <div class="section-header">
      <div class="header-content">
        <icon-font type="icon-clock" :size="24" class="header-icon" />
        <h3 class="section-title">最近活动</h3>
      </div>
      <div class="view-all-btn" @click="$emit('viewAll')">
        <span>查看全部</span>
        <icon-font type="icon-arrow-right" :size="14" />
      </div>
    </div>

    <div class="timeline-container">
      <div class="timeline-track"></div>

      <div
          v-for="(activity, index) in activities"
          :key="activity.id"
          class="timeline-item"
          :class="[`activity-${activity.type}`, { 'active': index === 0 }]"
      >
        <div class="timeline-dot">
          <div class="dot-inner">
            <icon-font :type="getActivityIcon(activity.type)" :size="16" />
          </div>
          <div class="dot-ripple"></div>
        </div>

        <div class="timeline-content">
          <div class="activity-card">
            <div class="activity-header">
              <h4 class="activity-title">{{ activity.title }}</h4>
              <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            </div>

            <p class="activity-description">{{ activity.description }}</p>

            <div class="activity-meta">
              <div class="activity-tags">
                <span
                    v-for="tag in activity.tags"
                    :key="tag"
                    class="activity-tag"
                    :class="`tag-${activity.type}`"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="activity-actions" v-if="activity.actionable">
                <button class="action-btn" @click="handleAction(activity)">
                  <icon-font type="icon-eye" :size="12" />
                  查看
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="timeline-end">
        <div class="end-dot"></div>
        <span class="end-text">更多历史记录...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => [
      {
        id: 1,
        type: 'document',
        title: '创建了新文档',
        description: '《Vue3 组合式API 最佳实践指南》已成功创建并保存',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10分钟前
        tags: ['前端技术', 'Vue3'],
        actionable: true
      },
      {
        id: 2,
        type: 'bookmark',
        title: '添加了新书签',
        description: '保存了来自GitHub的React最佳实践文档',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
        tags: ['React', 'GitHub'],
        actionable: true
      },
      {
        id: 3,
        type: 'snippet',
        title: '收藏了代码片段',
        description: '保存了一个响应式表单验证的Vue组件',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
        tags: ['Vue3', '表单组件'],
        actionable: true
      },
      {
        id: 4,
        type: 'system',
        title: '系统备份完成',
        description: '定时备份任务已完成，共备份了1,247个文件',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
        tags: ['系统', '备份'],
        actionable: false
      }
    ]
  }
})

const emit = defineEmits(['viewAll', 'action'])

const getActivityIcon = (type) => {
  const iconMap = {
    document: 'icon-file-text',
    bookmark: 'icon-bookmark',
    snippet: 'icon-code',
    system: 'icon-settings',
    user: 'icon-user'
  }
  return iconMap[type] || 'icon-info'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - new Date(timestamp)
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }
}

const handleAction = (activity) => {
  emit('action', activity)
}
</script>

<style scoped>
.activity-timeline-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
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
  color: var(--success-color);
  filter: drop-shadow(0 2px 4px rgba(24, 160, 88, 0.3));
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-color);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.05);
}

.view-all-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateX(2px);
}

.timeline-container {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.timeline-track {
  position: absolute;
  left: 28px;
  top: 32px;
  bottom: 60px;
  width: 2px;
  background: linear-gradient(to bottom, var(--primary-color), rgba(99, 102, 241, 0.3));
  border-radius: 1px;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-left: 0;
}

.timeline-item.active .timeline-dot .dot-inner {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.timeline-item.active .timeline-dot .dot-ripple {
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.timeline-dot {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.dot-inner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.dot-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  margin-left: 16px;
  margin-top: -8px;
}

.activity-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-item:hover .activity-card {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.timeline-item:hover .activity-card::before {
  opacity: 1;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0;
}

.activity-time {
  font-size: 12px;
  color: var(--text-color-tertiary);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
}

.activity-description {
  font-size: 14px;
  color: var(--text-color-secondary);
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.activity-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.activity-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.activity-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-color-secondary);
  transition: all 0.3s ease;
}

.tag-document {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.tag-bookmark {
  background: rgba(24, 160, 88, 0.1);
  color: var(--success-color);
}

.tag-snippet {
  background: rgba(240, 160, 32, 0.1);
  color: var(--warning-color);
}

.tag-system {
  background: rgba(32, 128, 240, 0.1);
  color: var(--info-color);
}

.activity-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.timeline-end {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-left: 16px;
}

.end-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border-color);
  flex-shrink: 0;
}

.end-text {
  font-size: 14px;
  color: var(--text-color-tertiary);
  font-style: italic;
}

/* 不同活动类型的点样式 */
.activity-document .dot-inner {
  color: var(--primary-color);
  border-color: rgba(99, 102, 241, 0.3);
}

.activity-bookmark .dot-inner {
  color: var(--success-color);
  border-color: rgba(24, 160, 88, 0.3);
}

.activity-snippet .dot-inner {
  color: var(--warning-color);
  border-color: rgba(240, 160, 32, 0.3);
}

.activity-system .dot-inner {
  color: var(--info-color);
  border-color: rgba(32, 128, 240, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timeline-item {
    margin-bottom: 20px;
  }

  .timeline-dot {
    width: 48px;
    height: 48px;
  }

  .dot-inner {
    width: 32px;
    height: 32px;
  }

  .activity-card {
    padding: 16px;
  }

  .timeline-track {
    left: 24px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .activity-timeline-container {
    background: rgba(30, 41, 59, 0.8);
  }

  .activity-card {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .dot-inner {
    background: rgba(51, 65, 85, 0.9);
    border-color: rgba(71, 85, 105, 0.5);
  }

  .activity-tag {
    background: rgba(71, 85, 105, 0.3);
  }
}
</style>