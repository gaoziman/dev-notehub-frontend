<template>
  <div class="quick-actions-container">
    <div class="section-header">
      <div class="header-content">
        <icon-font type="icon-lightning" :size="24" class="header-icon" />
        <h3 class="section-title">快速操作</h3>
      </div>
      <div class="header-decoration"></div>
    </div>

    <div class="actions-grid">
      <div
          v-for="action in actions"
          :key="action.id"
          class="action-card"
          :class="[`action-${action.type}`, { 'disabled': action.disabled }]"
          @click="handleAction(action)"
      >
        <div class="action-icon-container">
          <div class="action-icon-bg"></div>
          <icon-font :type="action.icon" :size="28" class="action-icon" />
          <div class="action-glow"></div>
        </div>

        <div class="action-content">
          <h4 class="action-title">{{ action.title }}</h4>
          <p class="action-description">{{ action.description }}</p>
        </div>

        <div class="action-arrow">
          <icon-font type="icon-arrow-right" :size="16" />
        </div>

        <div class="action-bg-pattern"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  actions: {
    type: Array,
    default: () => [
      {
        id: 'add-document',
        title: '新建文档',
        description: '创建新的知识文档',
        icon: 'icon-file-add',
        type: 'primary',
        route: '/documents/create'
      },
      {
        id: 'add-bookmark',
        title: '添加书签',
        description: '保存有价值的网页链接',
        icon: 'icon-bookmark-add',
        type: 'success',
        action: 'showAddBookmark'
      },
      {
        id: 'add-snippet',
        title: '保存代码',
        description: '收藏常用代码片段',
        icon: 'icon-code-add',
        type: 'warning',
        route: '/code-snippets'
      },
      {
        id: 'search-all',
        title: '全局搜索',
        description: '在所有内容中搜索',
        icon: 'icon-search-all',
        type: 'info',
        action: 'showGlobalSearch'
      }
    ]
  }
})

const emit = defineEmits(['action'])

const handleAction = (action) => {
  if (action.disabled) return

  if (action.route) {
    // 路由跳转
    emit('action', { type: 'navigate', payload: action.route })
  } else if (action.action) {
    // 触发特定动作
    emit('action', { type: action.action, payload: action })
  }
}
</script>

<style scoped>
.quick-actions-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: var(--primary-color);
  filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0;
  background: linear-gradient(135deg, var(--text-color-base), var(--text-color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-decoration {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  border-radius: 2px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.action-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

.action-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-icon-container {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.action-icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.action-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: all 0.3s ease;
}

.action-glow {
  position: absolute;
  inset: -8px;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(12px);
}

.action-card:hover .action-glow {
  opacity: 0.6;
}

.action-card:hover .action-icon {
  transform: translate(-50%, -50%) scale(1.1);
}

/* 不同类型的样式 */
.action-primary .action-icon-bg {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.2));
}

.action-primary .action-icon {
  color: var(--primary-color);
}

.action-primary .action-glow {
  background: var(--primary-color);
}

.action-success .action-icon-bg {
  background: linear-gradient(135deg, rgba(24, 160, 88, 0.1), rgba(24, 160, 88, 0.2));
}

.action-success .action-icon {
  color: var(--success-color);
}

.action-success .action-glow {
  background: var(--success-color);
}

.action-warning .action-icon-bg {
  background: linear-gradient(135deg, rgba(240, 160, 32, 0.1), rgba(240, 160, 32, 0.2));
}

.action-warning .action-icon {
  color: var(--warning-color);
}

.action-warning .action-glow {
  background: var(--warning-color);
}

.action-info .action-icon-bg {
  background: linear-gradient(135deg, rgba(32, 128, 240, 0.1), rgba(32, 128, 240, 0.2));
}

.action-info .action-icon {
  color: var(--info-color);
}

.action-info .action-glow {
  background: var(--info-color);
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0 0 4px 0;
}

.action-description {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.4;
}

.action-arrow {
  color: var(--text-color-tertiary);
  transition: all 0.3s ease;
  opacity: 0.7;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
  opacity: 1;
  color: var(--primary-color);
}

.action-bg-pattern {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 50%);
  transform: rotate(45deg);
  transition: all 0.5s ease;
  pointer-events: none;
}

.action-card:hover .action-bg-pattern {
  transform: rotate(45deg) scale(1.5);
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-card {
    padding: 16px;
  }

  .action-icon-container {
    width: 48px;
    height: 48px;
  }

  .action-icon {
    font-size: 24px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .quick-actions-container {
    background: rgba(30, 41, 59, 0.8);
  }

  .action-card {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .action-card:hover {
    border-color: rgba(99, 102, 241, 0.5);
  }
}
</style>