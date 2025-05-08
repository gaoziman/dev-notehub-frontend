<template>
  <div class="document-library">
    <n-spin :show="loading">
      <div class="document-grid">
        <div
            v-for="doc in documents"
            :key="doc.id"
            class="document-card"
            :class="[`type-${doc.type}`, { 'selected': selectedIds.includes(doc.id) }]"
            @click="handleCardClick(doc)"
        >
          <!-- 顶部装饰元素 -->
          <div class="card-decoration" :class="`decoration-${doc.type}`"></div>

          <!-- 文档类型图标 -->
          <div class="doc-type-badge" :class="`type-${doc.type}`">
            <icon-font :type="getDocumentTypeIcon(doc.type)" :size="16" />
          </div>

          <!-- 平台标识 -->
          <div class="platform-badge" :class="`platform-${doc.platform}`">
            <icon-font :type="getPlatformIcon(doc.platform)" :size="14" />
            <span>{{ getPlatformName(doc.platform) }}</span>
          </div>

          <!-- 收藏按钮 -->
          <div
              class="favorite-button"
              :class="{ 'is-favorited': doc.starred }"
              @click.stop="toggleStar(doc)"
          >
            <icon-font
                :type="doc.starred ? 'icon-shoucang-fill' : 'icon-shoucang'"
                :size="18"
            />
          </div>

          <!-- 卡片内容区 -->
          <div class="card-body">
            <!-- 卡片标题 -->
            <h3 class="doc-title" :title="doc.title">{{ doc.title }}</h3>

            <!-- 文档描述 -->
            <p class="doc-description" :title="doc.description">{{ doc.description || '暂无描述' }}</p>

            <!-- 标签区域 -->
            <div class="tag-section">
              <div class="category-tag" :class="`category-${doc.category.toLowerCase()}`">
                {{ doc.category }}
              </div>

              <div class="secondary-tags">
                <div v-for="(tag, index) in doc.tags.slice(0, 2)"
                     :key="index"
                     class="tag-item">{{ tag }}</div>
                <div v-if="doc.tags.length > 2" class="tag-more">+{{ doc.tags.length - 2 }}</div>
              </div>
            </div>
          </div>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <div class="meta-info">
              <div class="meta-item views">
                <icon-font type="icon-yuedu" :size="14" />
                <span>{{ doc.visits }}</span>
              </div>
              <div class="meta-item time">
                <icon-font type="icon-shijian" :size="14" />
                <span>{{ formatTimeAgo(doc.updateTime) }}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="action-btn view-btn" @click.stop="emit('view', doc.id)" title="查看">
                <icon-font type="icon-chakan" :size="16" />
              </button>
              <button class="action-btn edit-btn" @click.stop="emit('edit', doc.id)" title="编辑">
                <icon-font type="icon-bianji" :size="16" />
              </button>
              <button
                  v-if="selectedIds.length > 0 || showCheckbox"
                  class="action-btn select-btn"
                  @click.stop="toggleSelect(doc.id)"
                  :class="{ 'is-selected': selectedIds.includes(doc.id) }"
              >
                <icon-font type="icon-xuanze" :size="16" />
              </button>
              <n-dropdown
                  :options="getDocumentActions(doc)"
                  trigger="click"
                  placement="bottom-end"
                  @select="handleAction($event, doc)"
              >
                <button class="action-btn more-btn" @click.stop>
                  <icon-font type="icon-gengduo" :size="16" />
                </button>
              </n-dropdown>
            </div>
          </div>
        </div>
      </div>
    </n-spin>

    <!-- 空状态 -->
    <div v-if="!loading && documents.length === 0" class="empty-state">
      <div class="empty-illustration">
        <div class="illustration-background"></div>
        <icon-font type="icon-wendang-kong" :size="80" />
      </div>
      <div class="empty-content">
        <div class="empty-title">暂无文档</div>
        <div class="empty-description">快来创建或上传您的第一个文档吧！</div>
        <div class="empty-actions">
          <n-button type="primary" @click="$emit('create')" class="create-btn">
            <template #icon>
              <icon-font type="icon-xinjian" :size="16" />
            </template>
            创建文档
          </n-button>
          <n-button @click="$emit('upload')" class="upload-btn">
            <template #icon>
              <icon-font type="icon-shangchuan" :size="16" />
            </template>
            上传文档
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue';

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
  },
  showCheckbox: {
    type: Boolean,
    default: false
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

// 获取文档操作菜单
const getDocumentActions = (doc) => {
  return [
    {
      label: '查看文档',
      key: 'view',
      icon: () => h('icon-font', { type: 'icon-chakan', size: 16 })
    },
    {
      label: '编辑文档',
      key: 'edit',
      icon: () => h('icon-font', { type: 'icon-bianji', size: 16 })
    },
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
      icon: () => h('icon-font', { type: 'icon-shanchu', size: 16 }),
      props: {
        type: 'error'
      }
    }
  ];
};

// 处理卡片点击
const handleCardClick = (doc) => {
  if (props.selectedIds.length > 0) {
    // 如果有选中模式，点击卡片切换选中状态
    toggleSelect(doc.id);
  } else {
    // 否则查看文档
    emit('view', doc.id);
  }
};

// 处理菜单操作
const handleAction = (key, doc) => {
  switch (key) {
    case 'view':
      emit('view', doc.id);
      break;
    case 'edit':
      emit('edit', doc.id);
      break;
    case 'delete':
      emit('delete', doc.id);
      break;
    case 'download':
      // 实现下载逻辑
      break;
    case 'share':
      // 实现分享逻辑
      break;
  }
};

// 切换选中状态
const toggleSelect = (id) => {
  emit('toggle-select', id);
};

// 切换收藏状态
const toggleStar = (doc) => {
  emit('toggle-star', doc.id);
};
</script>

<style scoped>
.document-library {
  padding: 20px;
  background-color: var(--bg-color, #f5f7fa);
}

/* 网格布局 */
.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* 卡片基本样式 */
.document-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  min-height: 200px;
}

.document-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.document-card.selected {
  box-shadow: 0 0 0 2px var(--primary-color, #4263eb), 0 8px 20px rgba(66, 99, 235, 0.16);
}

/* 顶部装饰元素 */
.card-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(120deg, #f3f4f6 0%, #e5e7eb 100%);
  opacity: 0.8;
  z-index: 0;
  clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
}

.decoration-markdown {
  background: linear-gradient(120deg, #e0e7ff 0%, #c7d2fe 100%);
}

.decoration-pdf {
  background: linear-gradient(120deg, #fee2e2 0%, #fecaca 100%);
}

.decoration-word {
  background: linear-gradient(120deg, #dbeafe 0%, #bfdbfe 100%);
}

.decoration-excel {
  background: linear-gradient(120deg, #d1fae5 0%, #a7f3d0 100%);
}

.decoration-html {
  background: linear-gradient(120deg, #ffedd5 0%, #fed7aa 100%);
}

.decoration-code {
  background: linear-gradient(120deg, #f3e8ff 0%, #e9d5ff 100%);
}

/* 文档类型徽章 */
.doc-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 3;
  color: #666;
}

.doc-type-badge.type-markdown {
  color: #5074E6;
}

.doc-type-badge.type-pdf {
  color: #EB5757;
}

.doc-type-badge.type-word {
  color: #2196F3;
}

.doc-type-badge.type-excel {
  color: #4CAF50;
}

.doc-type-badge.type-html {
  color: #FF9800;
}

.doc-type-badge.type-code {
  color: #9C27B0;
}

/* 平台标识 */
.platform-badge {
  position: absolute;
  top: 12px;
  right: 52px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 3;
}

.platform-github {
  color: #24292e;
}

.platform-juejin {
  color: #1e80ff;
}

.platform-csdn {
  color: #fc5531;
}

.platform-zhihu {
  color: #0084ff;
}

.platform-wechat {
  color: #09bb07;
}

/* 收藏按钮 */
.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 3;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #bbb;
}

.favorite-button:hover {
  transform: scale(1.1);
  color: #f59e0b;
}

.favorite-button.is-favorited {
  color: #f59e0b;
  background-color: #fffbeb;
}

/* 卡片内容区 */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-top: 72px;
  position: relative;
  z-index: 1;
}

/* 卡片标题 */
.doc-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-height: 50px;
}

/* 文档描述 */
.doc-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  flex-grow: 1;
  position: relative;
}

.doc-description::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40%;
  height: 24px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
}

/* 标签区域 */
.tag-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  margin-bottom: 16px;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
}

/* 分类标签样式 */
.category-vue {
  background-color: rgba(66, 184, 131, 0.08);
  color: #42b883;
  border-color: rgba(66, 184, 131, 0.2);
}

.category-react {
  background-color: rgba(97, 218, 251, 0.08);
  color: #3698cf;
  border-color: rgba(97, 218, 251, 0.2);
}

.category-javascript {
  background-color: rgba(247, 223, 30, 0.08);
  color: #c6a700;
  border-color: rgba(247, 223, 30, 0.2);
}

.category-typescript {
  background-color: rgba(49, 120, 198, 0.08);
  color: #3178c6;
  border-color: rgba(49, 120, 198, 0.2);
}

.category-node\.js {
  background-color: rgba(104, 160, 99, 0.08);
  color: #68a063;
  border-color: rgba(104, 160, 99, 0.2);
}

.category-css {
  background-color: rgba(41, 101, 241, 0.08);
  color: #2965f1;
  border-color: rgba(41, 101, 241, 0.2);
}

.category-tools {
  background-color: rgba(255, 125, 80, 0.08);
  color: #ff7d50;
  border-color: rgba(255, 125, 80, 0.2);
}

.secondary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  font-size: 12px;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
}

.tag-more {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #f3f4f6;
  color: #6b7280;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
  background-color: #f3f4f6;
  transform: translateY(-2px);
}

.view-btn:hover {
  color: #4263eb;
}

.edit-btn:hover {
  color: #10b981;
}

.select-btn.is-selected {
  background-color: #4263eb;
  color: white;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.empty-illustration {
  position: relative;
  margin-bottom: 24px;
  color: #9ca3af;
}

.illustration-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  background-color: #f3f4f6;
  border-radius: 50%;
  z-index: -1;
}

.empty-content {
  max-width: 400px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.empty-actions .n-button {
  min-width: 120px;
}

.create-btn {
  background-color: #4263eb;
  box-shadow: 0 4px 12px rgba(66, 99, 235, 0.2);
}

.create-btn:hover {
  background-color: #3151c9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(66, 99, 235, 0.3);
}

.upload-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .document-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .document-library {
    padding: 16px;
  }

  .tag-section {
    flex-direction: column;
    gap: 8px;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
  }

  .meta-info {
    width: 100%;
    justify-content: space-between;
  }

  .card-actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  .document-library {
    background-color: var(--bg-color-dark, #111827);
  }

  .document-card {
    background-color: #1f2937;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .document-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .card-decoration {
    opacity: 0.15;
  }

  .doc-type-badge, .platform-badge, .favorite-button {
    background-color: #374151;
    color: #d1d5db;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .favorite-button.is-favorited {
    background-color: rgba(245, 158, 11, 0.1);
  }

  .doc-title {
    color: #f3f4f6;
  }

  .doc-description {
    color: #9ca3af;
  }

  .doc-description::after {
    background: linear-gradient(to right, rgba(31, 41, 55, 0), rgba(31, 41, 55, 1));
  }

  .category-tag {
    background-color: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }

  .tag-item {
    background-color: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }

  .tag-more {
    background-color: #374151;
    color: #d1d5db;
  }

  .card-footer {
    background-color: #111827;
    border-top-color: #374151;
  }

  .meta-item {
    color: #9ca3af;
  }

  .action-btn {
    background-color: #374151;
    color: #d1d5db;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .action-btn:hover {
    background-color: #4b5563;
  }

  .illustration-background {
    background-color: #374151;
  }

  .empty-title {
    color: #f3f4f6;
  }

  .empty-description {
    color: #9ca3af;
  }
}
</style>