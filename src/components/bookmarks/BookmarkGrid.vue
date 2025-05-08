<template>
  <div class="bookmark-grid-container">
    <!-- 书签卡片网格 -->
    <div class="bookmark-grid">
      <div
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="bookmark-card"
          :class="{ 'selected': isSelected(bookmark.id) }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="platform-badge" :class="`platform-${bookmark.platform}`">
            <icon-font :type="getPlatformIcon(bookmark.platform)" :size="14" />
          </div>

          <div class="card-actions" v-if="!batchMode">
            <n-dropdown
                trigger="click"
                :options="actionOptions"
                @select="key => handleActionSelect(key, bookmark)"
                placement="bottom-end"
            >
              <n-button quaternary circle size="small">
                <template #icon>
                  <icon-font type="icon-more" :size="14" />
                </template>
              </n-button>
            </n-dropdown>
          </div>

          <n-checkbox
              v-else
              :checked="isSelected(bookmark.id)"
              @update:checked="handleCheckboxChange(bookmark.id, $event)"
              class="card-checkbox"
          />
        </div>

        <!-- 卡片内容 -->
        <div
            class="card-content"
            @click="handleCardClick(bookmark)"
        >
          <div class="card-icon">
            <img
                :src="bookmark.icon || '/favicon.ico'"
                :alt="bookmark.title"
                @error="e => e.target.src = '/favicon.ico'"
            >
          </div>

          <div class="card-title" :title="bookmark.title">{{ bookmark.title }}</div>

          <div class="card-url" :title="bookmark.url">{{ getDisplayUrl(bookmark.url) }}</div>

          <div class="card-description" v-if="bookmark.description">
            {{ truncateText(bookmark.description, 120) }}
          </div>

          <div class="card-tags" v-if="bookmark.tags && bookmark.tags.length > 0">
            <n-tag
                v-for="(tag, index) in getDisplayTags(bookmark.tags)"
                :key="`${bookmark.id}-tag-${index}`"
                size="small"
                round
            >
              {{ tag }}
            </n-tag>
            <span class="more-tags" v-if="bookmark.tags.length > 3">+{{ bookmark.tags.length - 3 }}</span>
          </div>
        </div>

        <!-- 卡片底部 -->
        <div class="card-footer">
          <div class="card-info">
            <span class="info-item">
              <icon-font type="icon-time" :size="14" />
              {{ formatDate(bookmark.createdAt) }}
            </span>
            <span class="info-item">
              <icon-font type="icon-eye" :size="14" />
              {{ bookmark.visits || 0 }}
            </span>
          </div>

          <div class="card-category">
            <n-tag size="small" type="success" round>{{ getCategoryName(bookmark.category) }}</n-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!bookmarks || bookmarks.length === 0" class="empty-state">
      <icon-font type="icon-empty" :size="48" class="text-tertiary" />
      <p>暂无书签</p>
      <p class="text-sm text-tertiary">可以点击"添加书签"按钮添加新的书签</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { format } from 'date-fns';

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
  },
  platforms: {
    type: Array,
    default: () => []
  }
});

// 组件事件
const emit = defineEmits(['update:selected', 'edit', 'delete']);

// 本地状态
const selected = ref([]);

// 监听 props 变化
watch(() => props.selectedBookmarks, (newVal) => {
  selected.value = [...newVal];
}, { deep: true });

// 操作下拉选项
const actionOptions = [
  {
    label: '编辑',
    key: 'edit',
    icon: () => h('icon-font', { type: 'icon-edit', size: 16 })
  },
  {
    label: '加星标',
    key: 'star',
    icon: () => h('icon-font', { type: 'icon-star', size: 16 })
  },
  {
    label: '复制链接',
    key: 'copy',
    icon: () => h('icon-font', { type: 'icon-copy', size: 16 })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '删除',
    key: 'delete',
    icon: () => h('icon-font', { type: 'icon-delete', size: 16 })
  }
];

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy-MM-dd');
  } catch (error) {
    return dateString;
  }
};

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// 获取显示URL
const getDisplayUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
};

// 获取显示的标签（最多3个）
const getDisplayTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.slice(0, 3);
};

// 检查是否选中
const isSelected = (id) => {
  return selected.value.includes(id);
};

// 处理复选框变化
const handleCheckboxChange = (id, checked) => {
  if (checked) {
    if (!selected.value.includes(id)) {
      selected.value.push(id);
    }
  } else {
    const index = selected.value.indexOf(id);
    if (index !== -1) {
      selected.value.splice(index, 1);
    }
  }
  emit('update:selected', selected.value);
};

// 处理卡片点击
const handleCardClick = (bookmark) => {
  if (props.batchMode) {
    // 在批量模式下，点击卡片切换选中状态
    const id = bookmark.id;
    if (isSelected(id)) {
      const index = selected.value.indexOf(id);
      if (index !== -1) {
        selected.value.splice(index, 1);
      }
    } else {
      selected.value.push(id);
    }
    emit('update:selected', selected.value);
  } else {
    // 在正常模式下，点击卡片打开链接
    window.open(bookmark.url, '_blank');
  }
};

// 处理操作选择
const handleActionSelect = (key, bookmark) => {
  switch (key) {
    case 'edit':
      emit('edit', bookmark);
      break;
    case 'delete':
      emit('delete', bookmark.id);
      break;
    case 'copy':
      navigator.clipboard.writeText(bookmark.url)
          .then(() => {
            // 可以添加一个复制成功的提示
          })
          .catch(err => {
            console.error('无法复制链接:', err);
          });
      break;
    case 'star':
      // 实现加星标逻辑
      break;
  }
};

// 获取平台图标
const getPlatformIcon = (platformId) => {
  const platform = props.platforms.find(p => p.id === platformId);
  return platform ? platform.icon : 'icon-link';
};

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = props.categories.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
};
</script>

<style scoped>
.bookmark-grid-container {
  width: 100%;
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.bookmark-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  border: 1px solid var(--border-color-light);
  transition: all var(--transition-duration) var(--transition-timing-function);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bookmark-card:hover {
  box-shadow: var(--box-shadow-2);
  transform: translateY(-2px);
}

.bookmark-card.selected {
  border: 2px solid var(--primary-color);
}

.card-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color-light);
}

.platform-badge {
  background-color: var(--primary-color-suppl);
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.platform-github {
  background-color: #24292e;
  color: white;
}

.platform-juejin {
  background-color: #007fff;
  color: white;
}

.platform-zhihu {
  background-color: #0084ff;
  color: white;
}

.platform-csdn {
  background-color: #fc5531;
  color: white;
}

.platform-stackoverflow {
  background-color: #f48225;
  color: white;
}

.platform-medium {
  background-color: #00ab6c;
  color: white;
}

.card-checkbox {
  margin-left: auto;
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.card-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 12px;
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-url {
  font-size: 12px;
  color: var(--text-color-tertiary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
}

.more-tags {
  font-size: 12px;
  color: var(--text-color-tertiary);
  padding: 2px 6px;
}

.card-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-color-tertiary);
}

.empty-state p {
  margin: 8px 0;
}
</style>