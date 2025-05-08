<template>
  <div class="document-list-container">
    <!-- 加载态 -->
    <div v-if="loading" class="premium-loader">
      <div class="loader-animation">
        <div class="loader-circle"></div>
        <div class="loader-line-mask">
          <div class="loader-line"></div>
        </div>
      </div>
      <div class="loader-text">正在载入您的文档库</div>
    </div>

    <!-- 文档列表内容 -->
    <div v-else-if="documents.length > 0" class="documents-wrapper">
      <!-- 表头部分 -->
      <div class="list-header">
        <div class="header-cell select-cell">
          <div class="select-all-box"></div>
        </div>
        <div class="header-cell title-cell">文档信息</div>
        <div class="header-cell category-cell">分类 / 标签</div>
        <div class="header-cell source-cell">来源</div>
        <div class="header-cell time-cell">更新时间</div>
        <div class="header-cell actions-cell">操作</div>
      </div>

      <!-- 列表主体 -->
      <div class="list-body">
        <div
            v-for="doc in documents"
            :key="doc.id"
            class="list-row"
            :class="{'row-selected': selectedIds.includes(doc.id)}"
            @click="emit('toggle-select', doc.id)"
        >
          <!-- 选择区域 -->
          <div class="row-cell select-cell">
            <div class="select-indicator" :class="{'is-selected': selectedIds.includes(doc.id)}">
              <svg v-if="selectedIds.includes(doc.id)" viewBox="0 0 24 24" class="check-mark">
                <path d="M9,16.2L4.8,12l-1.4,1.4L9,19L21,7l-1.4-1.4L9,16.2z"></path>
              </svg>
            </div>
          </div>

          <!-- 文档信息区域 -->
          <div class="row-cell title-cell">
            <div class="document-info">
              <div class="doc-icon-wrapper">
                <div class="doc-type-icon" :class="`type-${doc.type}`">
                  <icon-font :type="getDocumentTypeIcon(doc.type)" :size="20" />
                </div>
                <div v-if="doc.starred" class="star-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M12,17.27L18.18,21l-1.64-7.03L22,9.24l-7.19-0.61L12,2L9.19,8.63L2,9.24l5.46,4.73L5.82,21L12,17.27z"></path>
                  </svg>
                </div>
              </div>

              <div class="doc-details">
                <div class="doc-title-wrapper">
                  <span class="doc-title" @click.stop="emit('view', doc.id)">{{ doc.title }}</span>
                </div>
                <p class="doc-description">{{ doc.description || '暂无描述' }}</p>
              </div>
            </div>
          </div>

          <!-- 分类与标签 -->
          <div class="row-cell category-cell">
            <div class="category-wrapper">
              <div class="category-badge" :class="`cat-${doc.category.toLowerCase()}`">
                {{ doc.category }}
              </div>

              <div class="tags-wrapper">
                <div
                    v-for="(tag, index) in doc.tags.slice(0, 2)"
                    :key="index"
                    class="tag-item"
                >
                  <span class="tag-text">{{ tag }}</span>
                </div>
                <div
                    v-if="doc.tags.length > 2"
                    class="more-tag"
                >
                  +{{ doc.tags.length - 2 }}
                </div>
              </div>
            </div>
          </div>

          <!-- 来源平台 -->
          <div class="row-cell source-cell">
            <div class="source-badge" :class="`platform-${doc.platform}`">
              <div class="platform-icon">
                <icon-font :type="getPlatformIcon(doc.platform)" :size="16" />
              </div>
              <span class="platform-name">{{ getPlatformName(doc.platform) }}</span>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="row-cell time-cell">
            <div class="time-wrapper">
              <span class="time-ago">{{ formatTimeAgo(doc.updateTime) }}</span>
              <span class="time-date">{{ formatDate(doc.updateTime) }}</span>
            </div>
          </div>

          <!-- 操作按钮区 -->
          <div class="row-cell actions-cell">
            <div class="actions-wrapper">
              <button
                  class="action-btn view-btn"
                  title="查看"
                  @click.stop="emit('view', doc.id)"
              >
                <div class="btn-icon">
                  <icon-font type="icon-chakan" :size="16" />
                </div>
                <span class="btn-text">查看</span>
              </button>

              <button
                  class="action-btn edit-btn"
                  title="编辑"
                  @click.stop="emit('edit', doc.id)"
              >
                <div class="btn-icon">
                  <icon-font type="icon-bianji" :size="16" />
                </div>
                <span class="btn-text">编辑</span>
              </button>

              <button
                  class="action-btn star-btn"
                  :class="{'is-starred': doc.starred}"
                  title="收藏"
                  @click.stop="emit('toggle-star', doc.id)"
              >
                <div class="btn-icon">
                  <icon-font
                      :type="doc.starred ? 'icon-shoucang-fill' : 'icon-shoucang'"
                      :size="16"
                  />
                </div>
              </button>

              <n-dropdown
                  trigger="click"
                  :options="dropdownOptions"
                  @select="(key) => handleDropdownSelect(key, doc.id)"
                  @click.stop
              >
                <button class="action-btn more-btn" title="更多操作">
                  <div class="btn-icon">
                    <icon-font type="icon-gengduo" :size="16" />
                  </div>
                </button>
              </n-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态设计 -->
    <div v-else class="elegant-empty-state">
      <div class="empty-graphic">
        <div class="graphic-deco-1"></div>
        <div class="graphic-deco-2"></div>
        <div class="graphic-deco-3"></div>
        <div class="graphic-deco-4"></div>
        <div class="graphic-doc-1"></div>
        <div class="graphic-doc-2"></div>
        <div class="graphic-doc-3"></div>
        <div class="graphic-center-icon">
          <icon-font type="icon-wendang-kong" :size="80" />
        </div>
      </div>

      <div class="empty-content">
        <h2 class="empty-title">您的知识库尚未启程</h2>
        <p class="empty-description">
          创建或导入您的第一篇文档，开启知识管理之旅。<br>每一份珍贵的文档都值得妥善保存与管理。
        </p>

        <div class="empty-actions">
          <n-button type="primary" size="large" class="create-doc-btn" @click="$emit('create')">
            <template #icon>
              <icon-font type="icon-xinjian" :size="18" />
            </template>
            创建文档
          </n-button>

          <n-button size="large" class="upload-doc-btn" @click="$emit('upload')">
            <template #icon>
              <icon-font type="icon-shangchuan" :size="18" />
            </template>
            上传文档
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, computed, ref } from 'vue';

const props = defineProps({
  documents: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['toggle-select', 'view', 'edit', 'delete', 'toggle-star', 'create', 'upload']);

// 文档类型图标映射
const getDocumentTypeIcon = (type) => {
  const iconMap = {
    markdown: 'icon-markdown',
    pdf: 'icon-pdf',
    word: 'icon-word',
    excel: 'icon-excel',
    html: 'icon-html',
    code: 'icon-code'
  };
  return iconMap[type] || 'icon-wendang1';
};

// 文档类型名称
const getTypeName = (type) => {
  const nameMap = {
    markdown: 'Markdown',
    pdf: 'PDF',
    word: 'Word',
    excel: 'Excel',
    html: 'HTML',
    code: '代码'
  };
  return nameMap[type] || '文档';
};

// 平台图标映射
const getPlatformIcon = (platform) => {
  const iconMap = {
    github: 'icon-github',
    juejin: 'icon-juejin',
    csdn: 'icon-csdn',
    zhihu: 'icon-zhihu',
    wechat: 'icon-wechat',
    local: 'icon-bendiwenjian'
  };
  return iconMap[platform] || 'icon-pingtai';
};

// 平台名称映射
const getPlatformName = (platform) => {
  const nameMap = {
    github: 'GitHub',
    juejin: '掘金',
    csdn: 'CSDN',
    zhihu: '知乎',
    wechat: '微信',
    local: '本地'
  };
  return nameMap[platform] || platform;
};

// 格式化时间为相对时间
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  }

  return `${Math.floor(diffInMonths / 12)}年前`;
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 下拉菜单选项
const dropdownOptions = [
  {
    label: '下载文档',
    key: 'download',
    icon: () => h('icon-font', { type: 'icon-xiazai', size: 16 })
  },
  {
    label: '分享文档',
    key: 'share',
    icon: () => h('icon-font', { type: 'icon-fenxiang', size: 16 })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '删除文档',
    key: 'delete',
    icon: () => h('icon-font', { type: 'icon-shanchu', size: 16 })
  }
];

// 下拉菜单选择处理
const handleDropdownSelect = (key, docId) => {
  if (key === 'delete') {
    emit('delete', docId);
  }
};
</script>

<style scoped>
/* ---------- 基础样式与容器 ---------- */
.document-list-container {
  --primary-color: #6366f1;
  --primary-hover: #818cf8;
  --primary-light: rgba(99, 102, 241, 0.1);
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-tertiary: #9ca3af;
  --border-light: rgba(0, 0, 0, 0.05);
  --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 0 8px rgba(0, 0, 0, 0.02);
  --row-bg: #ffffff;
  --row-hover: rgba(249, 250, 251, 0.5);
  --row-selected: rgba(99, 102, 241, 0.04);

  position: relative;
  border-radius: 24px;
  box-shadow: var(--card-shadow);
  background: linear-gradient(to bottom, #fcfcfc, #ffffff);
  overflow: hidden;
  min-height: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif;
  border: 1px solid #f1f5f9;
  backdrop-filter: blur(10px);
}

/* ---------- 加载动画 ---------- */
.premium-loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  z-index: 50;
}

.loader-animation {
  position: relative;
  width: 80px;
  height: 80px;
}

.loader-circle {
  position: absolute;
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.loader-line-mask {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  mask-image: linear-gradient(transparent 50%, black 50%);
  -webkit-mask-image: linear-gradient(transparent 50%, black 50%);
}

.loader-line {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-bottom-color: var(--primary-color);
  animation: spin 1.5s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader-text {
  margin-top: 24px;
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* ---------- 文档列表样式 ---------- */
.documents-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 表头样式 */
.list-header {
  display: flex;
  padding: 0 24px;
  height: 54px;
  align-items: center;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-cell {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-cell {
  width: 56px;
  display: flex;
  align-items: center;
}

.title-cell {
  flex: 1;
  min-width: 200px;
  padding-right: 16px;
}

.category-cell {
  width: 220px;
  padding: 0 16px;
}

.source-cell {
  width: 130px;
  padding: 0 16px;
}

.time-cell {
  width: 130px;
  padding: 0 16px;
}

.actions-cell {
  width: 170px;
  text-align: right;
  padding-left: 16px;
}

/* 列表主体 */
.list-body {
  display: flex;
  flex-direction: column;
}

/* 行样式 */
.list-row {
  display: flex;
  align-items: center;
  padding: 0 24px;
  min-height: 76px;
  position: relative;
  cursor: pointer;
  background: var(--row-bg);
  border-bottom: 1px solid var(--border-light);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-row:hover {
  background: var(--row-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.list-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  opacity: 0;
  background: linear-gradient(to bottom, var(--primary-color), var(--primary-hover));
  transition: opacity 0.2s ease;
}

.row-selected {
  background: var(--row-selected) !important;
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.1);
}

.row-selected::before {
  opacity: 1;
}

/* 选择器样式 */
.select-indicator {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.select-indicator::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.select-indicator.is-selected {
  border-color: transparent;
}

.select-indicator.is-selected::before {
  opacity: 1;
}

.check-mark {
  width: 18px;
  height: 18px;
  fill: white;
  position: relative;
  z-index: 1;
}

/* 文档信息 */
.document-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.doc-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.doc-type-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.doc-type-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5));
  opacity: 0.5;
}

.doc-type-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%);
}

/* 文档类型图标样式 */
.type-markdown {
  color: #5074E6;
  background: linear-gradient(135deg, rgba(80, 116, 230, 0.08), rgba(80, 116, 230, 0.16));
}

.type-pdf {
  color: #EB5757;
  background: linear-gradient(135deg, rgba(235, 87, 87, 0.08), rgba(235, 87, 87, 0.16));
}

.type-word {
  color: #2196F3;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.08), rgba(33, 150, 243, 0.16));
}

.type-excel {
  color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.16));
}

.type-html {
  color: #FF9800;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.08), rgba(255, 152, 0, 0.16));
}

.type-code {
  color: #9C27B0;
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.08), rgba(156, 39, 176, 0.16));
}

.list-row:hover .doc-type-icon {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
}

.star-icon {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  z-index: 1;
}

.star-icon svg {
  fill: #f59e0b;
}

.doc-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.doc-title-wrapper {
  position: relative;
  overflow: hidden;
}

.doc-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.2s;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}

.doc-title::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform 0.3s ease;
}

.doc-title:hover {
  color: var(--primary-color);
}

.doc-title:hover::after {
  transform: scaleX(1);
}

.doc-description {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 分类与标签样式 */
.category-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-badge {
  align-self: flex-start;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  letter-spacing: 0.03em;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.category-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2));
  z-index: -1;
}

.list-row:hover .category-badge {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
}

/* 分类颜色 */
.cat-vue {
  color: #42b883;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.08), rgba(66, 184, 131, 0.16));
}

.cat-react {
  color: #3698cf;
  background: linear-gradient(135deg, rgba(97, 218, 251, 0.08), rgba(97, 218, 251, 0.16));
}

.cat-javascript {
  color: #c6a700;
  background: linear-gradient(135deg, rgba(247, 223, 30, 0.08), rgba(247, 223, 30, 0.16));
}

.cat-typescript {
  color: #3178c6;
  background: linear-gradient(135deg, rgba(49, 120, 198, 0.08), rgba(49, 120, 198, 0.16));
}

.cat-node\.js {
  color: #68a063;
  background: linear-gradient(135deg, rgba(104, 160, 99, 0.08), rgba(104, 160, 99, 0.16));
}

.cat-css {
  color: #2965f1;
  background: linear-gradient(135deg, rgba(41, 101, 241, 0.08), rgba(41, 101, 241, 0.16));
}

.cat-tools {
  color: #ff7d50;
  background: linear-gradient(135deg, rgba(255, 125, 80, 0.08), rgba(255, 125, 80, 0.16));
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.tag-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.more-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

/* 来源平台样式 */
.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.source-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
  z-index: -1;
}

.list-row:hover .source-badge {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

/* 平台颜色 */
.platform-github {
  color: #24292e;
  background: linear-gradient(135deg, rgba(36, 41, 46, 0.06), rgba(36, 41, 46, 0.12));
}

.platform-juejin {
  color: #1e80ff;
  background: linear-gradient(135deg, rgba(30, 128, 255, 0.06), rgba(30, 128, 255, 0.12));
}

.platform-csdn {
  color: #fc5531;
  background: linear-gradient(135deg, rgba(252, 85, 49, 0.06), rgba(252, 85, 49, 0.12));
}

.platform-zhihu {
  color: #0084ff;
  background: linear-gradient(135deg, rgba(0, 132, 255, 0.06), rgba(0, 132, 255, 0.12));
}

.platform-wechat {
  color: #09bb07;
  background: linear-gradient(135deg, rgba(9, 187, 7, 0.06), rgba(9, 187, 7, 0.12));
}

.platform-local {
  color: #545a62;
  background: linear-gradient(135deg, rgba(84, 90, 98, 0.06), rgba(84, 90, 98, 0.12));
}

.platform-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.platform-name {
  font-weight: 500;
  z-index: 1;
}

/* 时间信息样式 */
.time-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-ago {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.time-date {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 操作按钮样式 */
.actions-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  height: 36px;
  border-radius: 8px;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.view-btn, .edit-btn {
  width: auto;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.03);
  color: var(--text-secondary);
  font-weight: 500;
}

.star-btn, .more-btn {
  width: 36px;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.03);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.btn-text {
  font-size: 13px;
  font-weight: 500;
  z-index: 1;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.action-btn:hover::before {
  opacity: 1;
}

.view-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.edit-btn:hover {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.star-btn:hover, .star-btn.is-starred {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.star-btn.is-starred::before {
  opacity: 1;
}

.more-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

/* ---------- 空状态设计 ---------- */
.elegant-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 80px 40px;
  position: relative;
  overflow: hidden;
}

.empty-graphic {
  position: relative;
  width: 280px;
  height: 280px;
  margin-right: 60px;
}

/* 装饰元素 */
.graphic-deco-1, .graphic-deco-2, .graphic-deco-3, .graphic-deco-4 {
  position: absolute;
  border-radius: 50%;
}

.graphic-deco-1 {
  width: 16px;
  height: 16px;
  background: rgba(99, 102, 241, 0.15);
  top: 40px;
  left: 60px;
  animation: float-particle 7s infinite ease-in-out;
}

.graphic-deco-2 {
  width: 24px;
  height: 24px;
  background: rgba(124, 58, 237, 0.1);
  bottom: 70px;
  right: 30px;
  animation: float-particle 10s infinite ease-in-out;
}

.graphic-deco-3 {
  width: 12px;
  height: 12px;
  background: rgba(79, 70, 229, 0.15);
  bottom: 40px;
  left: 80px;
  animation: float-particle 8s infinite ease-in-out;
}

.graphic-deco-4 {
  width: 20px;
  height: 20px;
  background: rgba(139, 92, 246, 0.1);
  top: 70px;
  right: 50px;
  animation: float-particle 6s infinite ease-in-out;
}

@keyframes float-particle {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-10px, 10px); }
  50% { transform: translate(10px, -15px); }
  75% { transform: translate(5px, 10px); }
}

/* 文档形状 */
.graphic-doc-1, .graphic-doc-2, .graphic-doc-3 {
  position: absolute;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.graphic-doc-1 {
  width: 100px;
  height: 120px;
  top: 20px;
  left: 30px;
  transform: rotate(-12deg);
  animation: float-doc1 8s infinite ease-in-out;
  background: linear-gradient(135deg, white, #f9fafb);
}

.graphic-doc-2 {
  width: 120px;
  height: 140px;
  bottom: 30px;
  right: 20px;
  transform: rotate(10deg);
  animation: float-doc2 9s infinite ease-in-out;
  background: linear-gradient(135deg, white, #f8fafc);
}

.graphic-doc-3 {
  width: 90px;
  height: 110px;
  bottom: 50px;
  left: 60px;
  transform: rotate(-5deg);
  animation: float-doc3 7s infinite ease-in-out;
  background: linear-gradient(135deg, white, #f9fafb);
}

@keyframes float-doc1 {
  0%, 100% { transform: rotate(-12deg) translate(0, 0); }
  50% { transform: rotate(-8deg) translate(0, -20px); }
}

@keyframes float-doc2 {
  0%, 100% { transform: rotate(10deg) translate(0, 0); }
  50% { transform: rotate(14deg) translate(0, -15px); }
}

@keyframes float-doc3 {
  0%, 100% { transform: rotate(-5deg) translate(0, 0); }
  50% { transform: rotate(-2deg) translate(0, -25px); }
}

.graphic-center-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(99, 102, 241, 0.2);
  z-index: 2;
}

.empty-content {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.empty-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.create-doc-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-doc-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(139, 92, 246, 0.3);
}

.upload-doc-btn {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-doc-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
}

/* ---------- 响应式样式 ---------- */
@media screen and (max-width: 1200px) {
  .category-cell {
    width: 180px;
  }

  .source-cell, .time-cell {
    width: 120px;
  }

  .actions-cell {
    width: 160px;
  }

  .btn-text {
    display: none;
  }

  .view-btn, .edit-btn {
    width: 36px;
    padding: 0;
  }
}

@media screen and (max-width: 992px) {
  .list-header, .list-row {
    padding: 0 16px;
  }

  .source-cell, .time-cell {
    display: none;
  }

  .category-cell {
    width: 160px;
  }

  .actions-cell {
    width: 120px;
  }

  .elegant-empty-state {
    flex-direction: column;
    text-align: center;
    padding: 60px 20px;
  }

  .empty-graphic {
    margin-right: 0;
    margin-bottom: 40px;
  }

  .empty-content {
    align-items: center;
  }
}

@media screen and (max-width: 768px) {
  .category-cell {
    display: none;
  }

  .title-cell {
    min-width: 0;
  }

  .doc-type-icon {
    width: 40px;
    height: 40px;
  }

  .document-info {
    gap: 12px;
  }
}

/* ---------- 暗黑模式 ---------- */
@media (prefers-color-scheme: dark) {
  .document-list-container {
    --primary-color: #818cf8;
    --primary-hover: #a5b4fc;
    --primary-light: rgba(129, 140, 248, 0.15);
    --text-primary: rgba(255, 255, 255, 0.95);
    --text-secondary: rgba(255, 255, 255, 0.7);
    --text-tertiary: rgba(255, 255, 255, 0.45);
    --border-light: rgba(255, 255, 255, 0.08);
    --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 0 8px rgba(0, 0, 0, 0.1);
    --row-bg: #111827;
    --row-hover: rgba(30, 41, 59, 0.5);
    --row-selected: rgba(129, 140, 248, 0.15);

    background: linear-gradient(to bottom, #0f172a, #111827);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .premium-loader {
    background: rgba(15, 23, 42, 0.8);
  }

  .list-header {
    background: linear-gradient(to bottom, #1e293b, #1a1f2b);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .list-row {
    background: var(--row-bg);
    border-bottom-color: var(--border-light);
  }

  .select-indicator {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
  }

  .select-indicator::before {
    background: linear-gradient(135deg, #818cf8, #a5b4fc);
  }

  .doc-type-icon {
    background: rgba(255, 255, 255, 0.05);
  }

  .doc-type-icon::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  }

  .star-icon {
    background: #111827;
  }

  .category-badge::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  }

  .tag-item {
    background: rgba(255, 255, 255, 0.06);
  }

  .more-tag {
    background: rgba(255, 255, 255, 0.04);
  }

  .source-badge::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  }

  .view-btn, .edit-btn, .star-btn, .more-btn {
    background: rgba(255, 255, 255, 0.06);
  }

  .action-btn::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  }

  .view-btn:hover {
    background: rgba(129, 140, 248, 0.2);
    color: var(--primary-color);
  }

  .edit-btn:hover {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }

  .star-btn:hover, .star-btn.is-starred {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }

  .more-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .graphic-doc-1, .graphic-doc-2, .graphic-doc-3 {
    background: #1e293b;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .empty-title {
    background: linear-gradient(135deg, #818cf8, #c4b5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .create-doc-btn {
    background: linear-gradient(135deg, #818cf8, #a5b4fc);
  }

  .upload-doc-btn {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>