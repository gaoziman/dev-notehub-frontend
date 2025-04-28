<template>
  <div class="document-card-container">
    <n-card class="document-card" hoverable>
      <!-- 顶部分类标签与时间 -->
      <div class="card-top">
        <n-tag :type="getCategoryType(document.categoryColor)" size="small" class="category-tag">
          {{ document.category }}
        </n-tag>
        <div class="time-indicator">
          <icon-font type="icon-shijian1" :size="12" />
          <span>{{ document.lastVisited }}</span>
        </div>
      </div>

      <!-- 文档标题 -->
      <h3 class="document-title">{{ document.title }}</h3>

      <!-- 精简的文档说明 -->
      <p class="document-description">{{ document.description }}</p>

      <!-- 文档元数据区 -->
      <div class="document-meta">
        <div class="meta-left">
          <div class="file-type">
            <icon-font :type="getFileTypeIcon(document.fileType)" :size="16" :color="getFileTypeColor(document.fileType)" />
            <span>{{ document.type }}</span>
          </div>

          <div v-if="document.pageCount" class="page-count">
            {{ document.pageCount }}页
          </div>
        </div>

        <div v-if="document.source" class="source-badge">
          <icon-font :type="getSourceIcon(document.source)" :size="14" />
          <span>{{ document.source }}</span>
        </div>
      </div>

      <!-- 底部进度条区域 -->
      <div class="progress-area">
        <div class="progress-info">
          <span class="progress-label">{{ document.progress > 0 ? '已学习' : '未开始' }}</span>
          <span class="progress-value" :class="getProgressTextColor(document.progress)">
            {{ document.progress > 0 ? `${document.progress}%` : '点击开始' }}
          </span>
        </div>

        <n-progress
            :percentage="document.progress"
            :height="6"
            :border-radius="3"
            :color="getProgressGradient(document.progress)"
            :rail-color="getRailColor()"
            :processing="document.progress > 0 && document.progress < 100"
        />
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons">
        <n-button quaternary circle size="small" class="action-button">
          <template #icon>
            <icon-font type="icon-dakaixiaoxi" :size="16" />
          </template>
        </n-button>

        <n-button quaternary circle size="small" class="action-button">
          <template #icon>
            <icon-font type="icon-icon_edit" :size="16" />
          </template>
        </n-button>

        <n-button quaternary circle size="small" class="action-button bookmark">
          <template #icon>
            <icon-font type="icon-bookmark" :size="16" />
          </template>
        </n-button>
      </div>

      <!-- 背景装饰元素 -->
      <div class="card-decoration" :class="getDecorationClass(document.categoryColor)"></div>
    </n-card>
  </div>
</template>

<script setup>
import { NCard, NTag, NProgress, NButton } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

defineProps({
  document: {
    type: Object,
    required: true
  }
});

// 根据分类颜色获取NTag类型
const getCategoryType = (color) => {
  const colorMap = {
    'blue': 'info',
    'green': 'success',
    'red': 'error',
    'yellow': 'warning',
    'purple': 'default'
  };
  return colorMap[color] || 'default';
};

// 获取装饰元素CSS类
const getDecorationClass = (color) => {
  return `decoration-${color}`;
};

// 根据文件类型获取图标
const getFileTypeIcon = (fileType) => {
  const iconMap = {
    'markdown': 'icon-icon_markdown_line',
    'pdf': 'icon-icon_pdf1',
    'link': 'icon-icon-link',
    'default': 'icon-wenjian1'
  };
  return iconMap[fileType] || iconMap['default'];
};

// 根据文件类型获取颜色
const getFileTypeColor = (fileType) => {
  const colorMap = {
    'markdown': '#7e57c2',
    'pdf': '#f44336',
    'link': '#2196f3',
    'default': '#607d8b'
  };
  return colorMap[fileType] || colorMap['default'];
};

// 根据来源获取图标
const getSourceIcon = (source) => {
  const iconMap = {
    'GitHub': 'icon-icon_github',
    'Zhihu': 'icon-zhihu',
    'Juejin': 'icon-juejin1',
    'Weixin': 'icon-weixingongzhonghao3',
    'default': 'icon-globe'
  };
  return iconMap[source] || iconMap['default'];
};

// 根据进度获取渐变色
const getProgressGradient = (progress) => {
  if (progress === 0) return 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
  if (progress < 50) return 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)';
  return 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
};

// 获取进度条轨道颜色
const getRailColor = () => {
  return 'rgba(0, 0, 0, 0.04)';
};

// 根据进度获取文本颜色
const getProgressTextColor = (progress) => {
  if (progress === 0) return 'text-yellow-600';
  if (progress < 50) return 'text-blue-600';
  return 'text-green-600';
};
</script>

<style scoped>
.document-card-container {
  height: 100%;
  perspective: 1000px;
  transition: all 0.3s ease;
}

.document-card {
  border-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: white;
  border: 1px solid rgba(230, 235, 240, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  padding: 6px;
}

.document-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 24px -6px rgba(0, 0, 0, 0.08);
  border-color: rgba(210, 220, 230, 0.9);
}

/* 顶部标签与时间 */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.category-tag {
  font-weight: 600;
  font-size: 0.7rem;
  padding: 0px 10px;
  height: 22px;
  line-height: 22px;
  border-radius: 4px;
}

.time-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #94a3b8;
}

/* 文档标题 */
.document-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.3px;
}

/* 文档描述 */
.document-description {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 文档元数据 */
.document-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.meta-left {
  display: flex;
  gap: 12px;
}

.file-type, .page-count, .source-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b;
  padding: 3px 8px;
  background-color: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
}

.source-badge {
  font-weight: 600;
  color: #475569;
  background-color: rgba(241, 245, 249, 0.9);
}

/* 进度区域 */
.progress-area {
  margin-top: auto;
  padding-top: 16px;
  margin-bottom: 6px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.75rem;
  color: #64748b;
}

.progress-value {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.text-yellow-600 {
  color: #d97706;
  background-color: rgba(217, 119, 6, 0.08);
}

.text-blue-600 {
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.08);
}

.text-green-600 {
  color: #059669;
  background-color: rgba(5, 150, 105, 0.08);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 14px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.document-card:hover .action-buttons {
  opacity: 1;
  transform: translateY(0);
}

.action-button {
  width: 30px;
  height: 30px;
  color: #64748b;
}

.action-button:hover {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.08);
}

.bookmark {
  color: #f59e0b;
}

.bookmark:hover {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.08);
}

/* 背景装饰 */
.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  opacity: 0.025;
  z-index: 0;
  transition: all 0.5s;
  background-position: top right;
  background-repeat: no-repeat;
  background-size: 75%;
}

.document-card:hover .card-decoration {
  opacity: 0.04;
  transform: scale(1.1) rotate(5deg);
}

/* 装饰元素样式 */
.decoration-blue {
  background-image: radial-gradient(circle at top right, rgba(59, 130, 246, 0.5) 0%, transparent 70%);
}

.decoration-green {
  background-image: radial-gradient(circle at top right, rgba(16, 185, 129, 0.5) 0%, transparent 70%);
}

.decoration-red {
  background-image: radial-gradient(circle at top right, rgba(239, 68, 68, 0.5) 0%, transparent 70%);
}

.decoration-yellow {
  background-image: radial-gradient(circle at top right, rgba(245, 158, 11, 0.5) 0%, transparent 70%);
}

.decoration-purple {
  background-image: radial-gradient(circle at top right, rgba(139, 92, 246, 0.5) 0%, transparent 70%);
}
</style>