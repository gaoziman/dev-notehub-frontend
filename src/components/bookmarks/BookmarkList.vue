<template>
  <div class="bookmark-list-container">
    <!-- 书签列表 -->
    <div class="bookmark-list" v-if="bookmarks && bookmarks.length > 0">
      <div
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="bookmark-card"
          :class="{ 'selected': batchMode && selectedBookmarks.includes(bookmark.id) }"
          @click="handleCardClick(bookmark)"
      >
        <div v-if="batchMode" class="selection-checkbox">
          <n-checkbox
              :checked="selectedBookmarks.includes(bookmark.id)"
              @update:checked="handleCheckboxChange(bookmark.id, $event)"
              @click.stop
          />
        </div>

        <div class="bookmark-icon-container">
          <img
              :src="bookmark.icon || '/favicon.ico'"
              class="bookmark-icon"
              @error="handleIconError"
              :alt="bookmark.title"
          />
          <div class="platform-badge" :class="`platform-${bookmark.platform}`">
            <icon-font :type="`icon-${bookmark.platform}`" :size="12" />
          </div>
        </div>

        <div class="bookmark-content">
          <div class="bookmark-header">
            <h3 class="bookmark-title" :title="bookmark.title">{{ bookmark.title }}</h3>
            <div class="bookmark-meta">
              <span class="bookmark-date" :title="`添加于 ${formatDate(bookmark.createdAt, 'yyyy-MM-dd HH:mm')}`">
                <icon-font type="icon-time" :size="14" />
                {{ formatRelativeTime(bookmark.createdAt) }}
              </span>
              <span class="bookmark-visits" :title="`访问次数: ${bookmark.visits}`">
                <icon-font type="icon-eye" :size="14" />
                {{ bookmark.visits }}
              </span>
            </div>
          </div>

          <div class="bookmark-url" :title="bookmark.url">
            <icon-font type="icon-link" :size="14" />
            {{ formatUrl(bookmark.url) }}
          </div>

          <div class="bookmark-description" v-if="bookmark.description">
            {{ truncateText(bookmark.description, 80) }}
          </div>

          <div class="bookmark-footer">
            <div class="bookmark-tags">
              <n-tag
                  v-if="bookmark.category"
                  class="category-tag"
                  size="small"
                  round
              >
                <template #icon>
                  <icon-font type="icon-folder" :size="12" />
                </template>
                {{ getCategoryName(bookmark.category) }}
              </n-tag>

              <template v-if="bookmark.tags && bookmark.tags.length > 0">
                <n-tag
                    v-for="(tag, index) in bookmark.tags.slice(0, 2)"
                    :key="index"
                    class="tag-item"
                    size="small"
                    round
                >
                  {{ tag }}
                </n-tag>

                <n-popover v-if="bookmark.tags.length > 2" trigger="hover" placement="top">
                  <template #trigger>
                    <n-tag size="small" round class="tag-item more-tag">
                      +{{ bookmark.tags.length - 2 }}
                    </n-tag>
                  </template>
                  <div class="tags-popover">
                    <n-tag
                        v-for="(tag, index) in bookmark.tags.slice(2)"
                        :key="index"
                        size="small"
                        round
                        class="tag-item"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                </n-popover>
              </template>
            </div>

            <div class="bookmark-actions">
              <n-tooltip trigger="hover" placement="top">
                <template #trigger>
                  <n-button
                      quaternary
                      circle
                      size="small"
                      class="action-button visit-button"
                      @click.stop="visitBookmark(bookmark.url)"
                  >
                    <icon-font type="icon-external-link" :size="16" />
                  </n-button>
                </template>
                访问链接
              </n-tooltip>

              <n-tooltip trigger="hover" placement="top">
                <template #trigger>
                  <n-button
                      quaternary
                      circle
                      size="small"
                      class="action-button edit-button"
                      @click.stop="$emit('edit', bookmark)"
                  >
                    <icon-font type="icon-edit" :size="16" />
                  </n-button>
                </template>
                编辑书签
              </n-tooltip>

              <n-dropdown
                  trigger="click"
                  placement="bottom-end"
                  :options="actionOptions"
                  @select="(key) => handleAction(key, bookmark)"
                  @click.stop
              >
                <n-button
                    quaternary
                    circle
                    size="small"
                    class="action-button more-button"
                >
                  <icon-font type="icon-more" :size="16" />
                </n-button>
              </n-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-illustration">
        <icon-font type="icon-bookmark-empty" :size="64" class="empty-icon" />
      </div>
      <h3 class="empty-title">暂无书签</h3>
      <p class="empty-desc">添加你的第一个书签，开始整理你的网络收藏</p>
      <n-button type="primary" round>
        <template #icon>
          <icon-font type="icon-add" :size="18" />
        </template>
        添加书签
      </n-button>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="bookmarks && bookmarks.length > 0">
      <n-pagination
          v-model:page="currentPage"
          :page-count="pageCount"
          :page-size="pageSize"
          :page-slot="5"
          size="medium"
          show-quick-jumper
      />
    </div>
  </div>
</template>

<script setup>
import { h, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { format, formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 组件属性
const props = defineProps({
  bookmarks: {
    type: Array,
    default: () => []
  },
  batchMode: {
    type: Boolean,
    default: false
  },
  selectedBookmarks: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
});

// 组件事件
const emit = defineEmits(['update:selected', 'edit', 'delete']);

// 本地状态
const currentPage = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(props.bookmarks.length / pageSize.value));

// 下拉菜单选项
const actionOptions = [
  {
    label: '加入收藏夹',
    key: 'favorite',
    icon: () => h('icon-font', { type: 'icon-star', size: 16 })
  },
  {
    label: '复制链接',
    key: 'copy',
    icon: () => h('icon-font', { type: 'icon-copy', size: 16 })
  },
  {
    label: '分享书签',
    key: 'share',
    icon: () => h('icon-font', { type: 'icon-share', size: 16 })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '删除书签',
    key: 'delete',
    icon: () => h('icon-font', { type: 'icon-delete', size: 16 })
  }
];

// 处理图标加载错误
const handleIconError = (e) => {
  e.target.src = '/favicon.ico';
};

// 格式化日期
const formatDate = (dateString, formatStr = 'yyyy-MM-dd') => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), formatStr);
  } catch (error) {
    return dateString;
  }
};

// 格式化相对时间
const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
      locale: zhCN
    });
  } catch (error) {
    return formatDate(dateString);
  }
};

// 格式化URL，截取域名部分
const formatUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
};

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = props.categories.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
};

// 处理卡片点击
const handleCardClick = (bookmark) => {
  if (props.batchMode) {
    toggleSelection(bookmark.id);
  } else {
    visitBookmark(bookmark.url);
  }
};

// 切换选择状态
const toggleSelection = (id) => {
  const selectedList = [...props.selectedBookmarks];
  const index = selectedList.indexOf(id);

  if (index !== -1) {
    selectedList.splice(index, 1);
  } else {
    selectedList.push(id);
  }

  emit('update:selected', selectedList);
};

// 处理复选框状态变化
const handleCheckboxChange = (id, checked) => {
  const selectedList = [...props.selectedBookmarks];
  const index = selectedList.indexOf(id);

  if (checked && index === -1) {
    selectedList.push(id);
  } else if (!checked && index !== -1) {
    selectedList.splice(index, 1);
  }

  emit('update:selected', selectedList);
};

// 访问书签链接
const visitBookmark = (url) => {
  if (url) {
    window.open(url, '_blank');
  }
};

// 处理下拉菜单操作
const handleAction = (key, bookmark) => {
  switch (key) {
    case 'delete':
      emit('delete', bookmark.id);
      break;
    case 'favorite':
      // 实现收藏功能
      break;
    case 'copy':
      // 复制链接到剪贴板
      navigator.clipboard.writeText(bookmark.url)
          .then(() => {
            // 显示成功提示
          })
          .catch(err => {
            console.error('复制失败: ', err);
          });
      break;
    case 'share':
      // 实现分享功能
      break;
  }
};
</script>

<style scoped>
.bookmark-list-container {
  width: 100%;
  padding: 0 0 16px 0;
}

.bookmark-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

.bookmark-card {
  position: relative;
  display: flex;
  background-color: var(--card-color);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  border: 1px solid var(--border-color-light);
  overflow: hidden;
}

.bookmark-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-color-suppl);
}

.bookmark-card.selected {
  background-color: var(--primary-color-suppl);
  border-color: var(--primary-color);
}

.selection-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.bookmark-icon-container {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  margin-right: 16px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.bookmark-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.platform-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color-light);
}

.platform-github {
  background-color: #2D333B;
  color: white;
}

.platform-juejin {
  background-color: #1E80FF;
  color: white;
}

.platform-zhihu {
  background-color: #0066FF;
  color: white;
}

.platform-csdn {
  background-color: #FC5531;
  color: white;
}

.platform-stackoverflow {
  background-color: #F48024;
  color: white;
}

.platform-medium {
  background-color: #000000;
  color: white;
}

.bookmark-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bookmark-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.bookmark-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  padding-right: 16px;
}

.bookmark-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-color-tertiary);
  white-space: nowrap;
}

.bookmark-date, .bookmark-visits {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bookmark-url {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.bookmark-description {
  font-size: 14px;
  color: var(--text-color-base);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.bookmark-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.bookmark-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 70%;
}

.category-tag {
  background-color: var(--success-color-suppl) !important;
  color: var(--success-color) !important;
  font-weight: 500;
}

.tag-item {
  background-color: var(--body-color) !important;
}

.more-tag {
  background-color: var(--body-color) !important;
  cursor: pointer;
}

.tags-popover {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 200px;
}

.bookmark-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.bookmark-card:hover .bookmark-actions {
  opacity: 1;
}

.action-button {
  color: var(--text-color-secondary);
  transition: all 0.2s ease;
}

.visit-button:hover {
  color: var(--primary-color);
  background-color: var(--primary-color-suppl);
}

.edit-button:hover {
  color: var(--success-color);
  background-color: var(--success-color-suppl);
}

.more-button:hover {
  color: var(--info-color);
  background-color: var(--info-color-suppl);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-illustration {
  margin-bottom: 16px;
  background-color: var(--body-color);
  width: 120px;
  height: 120px;
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  color: var(--text-color-disabled);
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color-base);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-color-tertiary);
  margin: 0 0 24px 0;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .bookmark-list {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (min-width: 1200px) {
  .bookmark-list {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 640px) {
  .bookmark-card {
    flex-direction: column;
  }

  .bookmark-icon-container {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .bookmark-meta {
    flex-direction: column;
    gap: 4px;
  }

  .bookmark-header {
    flex-direction: column;
  }

  .bookmark-title {
    margin-bottom: 8px;
  }
}
</style>