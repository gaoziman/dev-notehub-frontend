<template>
  <div class="result-item-detailed" :class="{ 'external-link': result.type === 'external' }">
    <!-- 内容类型图标 -->
    <div class="result-icon">
      <n-icon size="24" class="type-icon">
        <icon-font :type="getContentTypeIcon(result.contentType)" />
      </n-icon>
    </div>

    <!-- 结果内容 -->
    <div class="result-content">
      <!-- 标题和来源信息 -->
      <div class="result-header">
        <h3 class="result-title">
          <n-ellipsis :line-clamp="1">
            <router-link
                v-if="result.type !== 'external'"
                :to="`/document/view/${result.id}`"
                class="title-link"
            >
              {{ result.title }}
            </router-link>
            <a
                v-else
                :href="result.url"
                target="_blank"
                rel="noopener noreferrer"
                class="title-link external"
            >
              {{ result.title }}
              <n-icon size="14" class="external-icon">
                <icon-font type="icon-external-link" />
              </n-icon>
            </a>
          </n-ellipsis>
        </h3>

        <!-- 分类信息 -->
        <div class="result-category">
          <n-tag size="small" :bordered="false" type="info">
            {{ result.category }}
          </n-tag>
        </div>
      </div>

      <!-- 描述文本 -->
      <div class="result-description">
        <n-ellipsis :line-clamp="2">
          {{ result.description }}
        </n-ellipsis>
      </div>

      <!-- 标签信息 -->
      <div class="result-tags">
        <n-space size="small">
          <n-tag
              v-for="tag in result.tags"
              :key="tag"
              size="small"
              :bordered="false"
              :color="{ color: 'rgba(99, 102, 241, 0.1)', textColor: '#6366f1' }"
          >
            {{ tag }}
          </n-tag>
        </n-space>
      </div>

      <!-- 底部信息 -->
      <div class="result-footer">
        <div class="result-meta">
          <span class="update-time">{{ result.updatedAt }}</span>
          <n-divider vertical />
          <span class="content-type">
            <n-icon size="14">
              <icon-font :type="getContentTypeIcon(result.contentType)" />
            </n-icon>
            {{ getContentTypeName(result.contentType) }}
          </span>
        </div>

        <div class="result-actions">
          <!-- 学习进度 -->
          <div class="progress-wrapper">
            <n-progress
                type="line"
                :percentage="result.progress"
                :show-indicator="false"
                :height="6"
                :color="getProgressColor(result.progress)"
                :rail-color="'rgba(99, 102, 241, 0.1)'"
                :processing="result.progress > 0 && result.progress < 100"
            />
            <span class="progress-text" :style="{ color: getProgressColor(result.progress) }">
              {{ result.progress }}%
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <n-tooltip placement="top">
              <template #trigger>
                <n-button
                    text
                    class="action-btn"
                    :class="{ 'is-favorite': result.isFavorite }"
                    @click="$emit('toggle-favorite', result.id)"
                >
                  <template #icon>
                    <n-icon>
                      <icon-font :type="result.isFavorite ? 'icon-star-filled' : 'icon-star'" />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              {{ result.isFavorite ? '取消收藏' : '添加收藏' }}
            </n-tooltip>

            <n-tooltip placement="top">
              <template #trigger>
                <n-button text class="action-btn" @click="$emit('share', result.id)">
                  <template #icon>
                    <n-icon>
                      <icon-font type="icon-share" />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              分享
            </n-tooltip>

            <n-dropdown :options="moreOptions" placement="bottom-end">
              <n-button text class="action-btn">
                <template #icon>
                  <n-icon>
                    <icon-font type="icon-more" />
                  </n-icon>
                </template>
              </n-button>
            </n-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, computed } from 'vue';
import IconFont from "@/components/common/IconFont.vue";

// 属性定义
const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

// 更多选项菜单 - 修复JSX语法为h函数
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
</script>

<style scoped>
.result-item-detailed {
  display: flex;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--box-shadow-1);
  transition: box-shadow 0.3s;
}

.result-item-detailed:hover {
  box-shadow: var(--box-shadow-2);
}

.result-item-detailed.external-link {
  border-left-color: var(--warning-color);
}

.result-icon {
  margin-right: 16px;
}

.type-icon {
  color: var(--primary-color);
  background-color: rgba(99, 102, 241, 0.1);
  padding: 8px;
  border-radius: 8px;
}

.external-link .type-icon {
  color: var(--warning-color);
  background-color: rgba(240, 160, 32, 0.1);
}

.result-content {
  flex: 1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 6px;
}

.result-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  max-width: 80%;
}

.title-link {
  color: var(--text-color-base);
  text-decoration: none;
  transition: color 0.2s;
}

.title-link:hover {
  color: var(--primary-color);
}

.title-link.external {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--warning-color);
}

.external-icon {
  opacity: 0.7;
}

.result-category {
  margin-left: 12px;
}

.result-description {
  margin: 8px 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.result-tags {
  margin: 10px 0;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.result-meta {
  display: flex;
  align-items: center;
  color: var(--text-color-tertiary);
  font-size: 13px;
}

.update-time {
  display: flex;
  align-items: center;
}

.content-type {
  display: flex;
  align-items: center;
  gap: 4px;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
}

.progress-text {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  color: var(--text-color-tertiary);
  transition: color 0.2s;
}

.action-btn:hover {
  color: var(--primary-color);
}

.action-btn.is-favorite {
  color: var(--warning-color);
}
</style>