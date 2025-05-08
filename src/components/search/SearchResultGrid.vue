<template>
  <div class="result-card"
       :class="{
         'external-link': result.type === 'external',
         'is-favorite': result.isFavorite,
         'high-progress': result.progress >= 70,
         'medium-progress': result.progress >= 30 && result.progress < 70,
         'low-progress': result.progress > 0 && result.progress < 30,
         'no-progress': result.progress === 0
       }">

    <!-- 卡片顶部状态指示器 -->
    <div class="card-status-indicator"></div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div class="content-type">
          <div class="type-icon-wrapper" :class="result.contentType">
            <n-icon size="16" class="type-icon">
              <icon-font :type="getContentTypeIcon(result.contentType)" />
            </n-icon>
          </div>
          <span class="type-name">{{ getContentTypeName(result.contentType) }}</span>
        </div>

        <div class="card-actions">
          <n-tooltip placement="top">
            <template #trigger>
              <n-button
                  circle
                  text
                  size="small"
                  class="action-btn favorite-btn"
                  :class="{ 'is-active': result.isFavorite }"
                  @click.stop="$emit('toggle-favorite', result.id)"
              >
                <template #icon>
                  <n-icon>
                    <icon-font :type="result.isFavorite ? 'icon-star-filled' : 'icon-star'" />
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ result.isFavorite ? '取消收藏' : '收藏' }}
          </n-tooltip>

          <n-dropdown :options="moreOptions" placement="bottom-end" @select="handleMoreAction">
            <n-button circle text size="small" class="action-btn more-btn">
              <template #icon>
                <n-icon>
                  <icon-font type="icon-more" />
                </n-icon>
              </template>
            </n-button>
          </n-dropdown>
        </div>
      </div>

      <!-- 卡片内容区 -->
      <div class="card-content" @click="navigateToResult">
        <!-- 标题 -->
        <h3 class="card-title">
          <n-ellipsis :line-clamp="2">
            {{ result.title }}
            <n-icon v-if="result.type === 'external'" size="14" class="external-icon">
              <icon-font type="icon-external-link" />
            </n-icon>
          </n-ellipsis>
        </h3>

        <!-- 描述 -->
        <div class="card-description">
          <n-ellipsis :line-clamp="2">
            {{ result.description }}
          </n-ellipsis>
        </div>

        <!-- 标签区 -->
        <div class="card-tags">
          <n-tag
              v-for="tag in result.tags.slice(0, 2)"
              :key="tag"
              size="tiny"
              :bordered="false"
              :color="{ color: 'rgba(99, 102, 241, 0.1)', textColor: '#6366f1' }"
          >
            {{ tag }}
          </n-tag>
          <n-tag
              v-if="result.tags.length > 2"
              size="tiny"
              :bordered="false"
              :color="{ color: 'rgba(148, 163, 184, 0.1)', textColor: '#94a3b8' }"
          >
            +{{ result.tags.length - 2 }}
          </n-tag>
        </div>
      </div>

      <!-- 卡片底部信息区 -->
      <div class="card-footer">
        <div class="meta-info">
          <!-- 分类 -->
          <div class="category">
            <n-icon size="14" class="category-icon">
              <icon-font type="icon-folder" />
            </n-icon>
            <span class="category-name">{{ result.category }}</span>
          </div>

          <!-- 时间 -->
          <div class="update-time">
            <n-icon size="14" class="time-icon">
              <icon-font type="icon-calendar" />
            </n-icon>
            <span class="time-text">{{ result.updatedAt }}</span>
          </div>
        </div>

        <!-- 进度指示器 -->
        <div class="progress-wrapper">
          <div class="progress-bar">
            <n-progress
                type="line"
                :percentage="result.progress"
                :show-indicator="false"
                :height="4"
                :color="getProgressColor(result.progress)"
                :rail-color="'rgba(99, 102, 241, 0.1)'"
                :processing="result.progress > 0 && result.progress < 100"
            />
          </div>
          <div class="progress-info">
            <div class="progress-status" :class="getProgressClass(result.progress)">
              <n-icon size="14" class="status-icon">
                <icon-font :type="getProgressIcon(result.progress)" />
              </n-icon>
            </div>
            <span class="progress-text" :style="{ color: getProgressColor(result.progress) }">
              {{ result.progress }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="card-actions-bar">
      <n-tooltip placement="top">
        <template #trigger>
          <n-button text size="small" class="action-btn share-btn" @click.stop="$emit('share', result.id)">
            <template #icon>
              <n-icon>
                <icon-font type="icon-share" />
              </n-icon>
            </template>
            <span>分享</span>
          </n-button>
        </template>
        分享此内容
      </n-tooltip>

      <n-tooltip placement="top">
        <template #trigger>
          <n-button text size="small" class="action-btn" @click.stop="navigateToResult">
            <template #icon>
              <n-icon>
                <icon-font :type="result.type === 'external' ? 'icon-external-link' : 'icon-eye'" />
              </n-icon>
            </template>
            <span>{{ result.type === 'external' ? '访问' : '查看' }}</span>
          </n-button>
        </template>
        {{ result.type === 'external' ? '访问外部链接' : '查看详情' }}
      </n-tooltip>
    </div>
  </div>
</template>

<script setup>
import { h, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import IconFont from "@/components/common/IconFont.vue";

// 路由
const router = useRouter();

// 属性定义
const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

// 事件定义
const emit = defineEmits(['toggle-favorite', 'share']);

// 更多选项菜单
const moreOptions = [
  {
    label: '添加到学习列表',
    key: 'add-to-learning-list',
    icon: () => h('n-icon', {}, [h(IconFont, { type: 'icon-liebiao' })])
  },
  {
    label: '下载',
    key: 'download',
    icon: () => h('n-icon', {}, [h(IconFont, { type: 'icon-download' })])
  },
  {
    label: '复制链接',
    key: 'copy-link',
    icon: () => h('n-icon', {}, [h(IconFont, { type: 'icon-link' })])
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '举报内容',
    key: 'report',
    icon: () => h('n-icon', {}, [h(IconFont, { type: 'icon-report' })])
  }
];

// 处理更多操作菜单选择
const handleMoreAction = (key) => {
  console.log('更多操作:', key, props.result.id);
};

// 跳转到结果详情
const navigateToResult = () => {
  if (props.result.type === 'external') {
    window.open(props.result.url, '_blank');
  } else {
    router.push(`/document/view/${props.result.id}`);
  }
};

// 获取内容类型图标
const getContentTypeIcon = (contentType) => {
  switch (contentType) {
    case 'markdown':
      return 'icon-markdown';
    case 'pdf':
      return 'icon-pdf';
    case 'external':
      return 'icon-links';
    default:
      return 'icon-document';
  }
};

// 获取内容类型名称
const getContentTypeName = (contentType) => {
  switch (contentType) {
    case 'markdown':
      return 'Markdown';
    case 'pdf':
      return 'PDF';
    case 'external':
      return '外部链接';
    default:
      return '文档';
  }
};

// 获取进度颜色
const getProgressColor = (progress) => {
  if (progress === 0) return '#94a3b8';
  if (progress < 30) return '#60a5fa';
  if (progress < 70) return '#6366f1';
  if (progress < 100) return '#8b5cf6';
  return '#22c55e';
};

// 获取进度类名
const getProgressClass = (progress) => {
  if (progress === 0) return 'no-progress';
  if (progress < 30) return 'low-progress';
  if (progress < 70) return 'medium-progress';
  if (progress < 100) return 'high-progress';
  return 'complete-progress';
};

// 获取进度图标
const getProgressIcon = (progress) => {
  if (progress === 0) return 'icon-clock';
  if (progress < 30) return 'icon-progress-low';
  if (progress < 70) return 'icon-progress-medium';
  if (progress < 100) return 'icon-progress-high';
  return 'icon-check-circle';
};
</script>

<style scoped>
.result-card {
  position: relative;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(240, 242, 245, 0.8);
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  border-color: rgba(99, 102, 241, 0.2);
}

/* 顶部状态指示器 */
.card-status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0.4));
  z-index: 2;
}

.external-link .card-status-indicator {
  background: linear-gradient(90deg, rgba(255, 152, 0, 0.8), rgba(255, 152, 0, 0.4));
}

.is-favorite .card-status-indicator {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.8), rgba(251, 191, 36, 0.4));
}

.high-progress .card-status-indicator {
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(139, 92, 246, 0.4));
}

.medium-progress .card-status-indicator {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0.4));
}

.low-progress .card-status-indicator {
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.8), rgba(96, 165, 250, 0.4));
}

.no-progress .card-status-indicator {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.8), rgba(148, 163, 184, 0.4));
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.content-type {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background-color: rgba(99, 102, 241, 0.08);
}

.type-icon-wrapper.markdown {
  background-color: rgba(99, 102, 241, 0.08);
}

.type-icon-wrapper.pdf {
  background-color: rgba(239, 68, 68, 0.08);
}

.type-icon-wrapper.external {
  background-color: rgba(255, 152, 0, 0.08);
}

.type-icon {
  color: var(--primary-color, #6366f1);
}

.type-icon-wrapper.external .type-icon {
  color: var(--warning-color, #ff9800);
}

.type-icon-wrapper.pdf .type-icon {
  color: #ef4444;
}

.type-name {
  font-size: 12px;
  color: var(--text-color-secondary, #64748b);
  font-weight: 500;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  color: var(--text-color-tertiary, #94a3b8);
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.15);
}

.favorite-btn:hover, .favorite-btn.is-active {
  color: #fbbf24;
}

.more-btn:hover {
  color: var(--primary-color, #6366f1);
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  cursor: pointer;
}

.card-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-color-base, #334155);
  transition: color 0.2s;
}

.card-content:hover .card-title {
  color: var(--primary-color, #6366f1);
}

.external-link .card-title {
  color: var(--warning-color, #ff9800);
}

.external-icon {
  margin-left: 4px;
  color: var(--warning-color, #ff9800);
}

.card-description {
  font-size: 13px;
  color: var(--text-color-secondary, #64748b);
  margin-bottom: 14px;
  line-height: 1.5;
  flex: 1;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.card-footer {
  border-top: 1px solid rgba(240, 242, 245, 0.8);
  padding-top: 12px;
  margin-top: auto;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.category, .update-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-color-tertiary, #94a3b8);
}

.category-icon, .time-icon {
  color: var(--text-color-tertiary, #94a3b8);
}

.category-name, .time-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-wrapper {
  margin-top: 8px;
}

.progress-bar {
  margin-bottom: 6px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-status {
  display: flex;
  align-items: center;
}

.status-icon {
  color: var(--text-color-tertiary, #94a3b8);
}

.no-progress .status-icon {
  color: #94a3b8;
}

.low-progress .status-icon {
  color: #60a5fa;
}

.medium-progress .status-icon {
  color: #6366f1;
}

.high-progress .status-icon {
  color: #8b5cf6;
}

.complete-progress .status-icon {
  color: #22c55e;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
}

.card-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: rgba(249, 250, 251, 0.9);
  border-top: 1px solid rgba(240, 242, 245, 0.9);
}

.card-actions-bar .action-btn {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.card-actions-bar .action-btn:hover {
  background-color: rgba(240, 242, 245, 0.6);
  transform: none;
}

.share-btn {
  color: var(--primary-color, #6366f1);
}
</style>