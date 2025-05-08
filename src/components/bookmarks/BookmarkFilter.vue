<template>
  <div class="filter-container">
    <div class="search-section">
      <!-- 搜索框 -->
      <n-input-group>
        <n-input
            v-model:value="localSearch"
            placeholder="搜索书签标题、内容或URL..."
            clearable
            @update:value="handleSearchChange"
        >
          <template #prefix>
            <icon-font type="icon-search" :size="18" />
          </template>
        </n-input>
        <n-button type="primary" @click="$emit('advanced-filter')">
          高级筛选
        </n-button>
      </n-input-group>

      <!-- 标签列表 -->
      <div class="tags-container" v-if="popularTags.length > 0">
        <div
            v-for="tag in popularTags"
            :key="tag"
            :class="['tag', selectedTag === tag ? 'tag-selected' : '']"
            @click="toggleTag(tag)"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <div class="action-section">
      <!-- 视图切换 -->
      <div class="view-mode-switch">
        <div
            :class="['view-mode', localViewMode === 'list' ? 'view-mode-selected' : '']"
            @click="switchViewMode('list')"
        >
          <icon-font type="icon-list" :size="18" />
        </div>
        <div
            :class="['view-mode', localViewMode === 'grid' ? 'view-mode-selected' : '']"
            @click="switchViewMode('grid')"
        >
          <icon-font type="icon-grid" :size="18" />
        </div>
      </div>

      <!-- 排序方式 -->
      <n-dropdown
          trigger="click"
          :options="sortOptions"
          @select="handleSortChange"
      >
        <div class="sort-button">
          <icon-font type="icon-sort" :size="18" />
          <span>{{ getSortLabel() }}</span>
          <icon-font type="icon-arrow-down" :size="16" />
        </div>
      </n-dropdown>

      <!-- 功能按钮 -->
      <div class="function-buttons">
        <n-button type="primary" @click="$emit('add-bookmark')">
          <template #icon>
            <icon-font type="icon-add" :size="18" />
          </template>
          添加书签
        </n-button>

        <n-dropdown trigger="click" :options="actionOptions" @select="handleActionSelect">
          <n-button>
            <template #icon>
              <icon-font type="icon-more" :size="18" />
            </template>
            更多操作
          </n-button>
        </n-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h, watch } from 'vue';
import IconFont from "@/components/common/IconFont.vue";

// 组件属性
const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  viewMode: {
    type: String,
    default: 'list'
  },
  sortType: {
    type: String,
    default: 'recent'
  },
  popularTags: {
    type: Array,
    default: () => ['前端', 'Vue3', 'React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Java', 'Python', 'Node.js']
  }
});

// 组件事件
const emit = defineEmits([
  'update:search',
  'update:view-mode',
  'update:sort-type',
  'advanced-filter',
  'add-bookmark',
  'import-bookmarks',
  'export-bookmarks',
  'batch-edit'
]);

// 本地状态
const localSearch = ref(props.search);
const localViewMode = ref(props.viewMode);
const localSortType = ref(props.sortType);
const selectedTag = ref('');

// 排序选项
const sortOptions = [
  {
    label: '最近添加',
    key: 'recent',
    icon: () => h('icon-font', { type: 'icon-time', size: 16 })
  },
  {
    label: '标题排序',
    key: 'title',
    icon: () => h('icon-font', { type: 'icon-sort-alpha', size: 16 })
  },
  {
    label: '访问次数',
    key: 'visits',
    icon: () => h('icon-font', { type: 'icon-eye', size: 16 })
  }
];

// 更多操作选项
const actionOptions = [
  {
    label: '导入书签',
    key: 'import',
    icon: () => h('icon-font', { type: 'icon-upload', size: 16 })
  },
  {
    label: '导出书签',
    key: 'export',
    icon: () => h('icon-font', { type: 'icon-download', size: 16 })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '批量编辑',
    key: 'batch-edit',
    icon: () => h('icon-font', { type: 'icon-edit', size: 16 })
  }
];

// 获取当前排序方式的标签
const getSortLabel = () => {
  const option = sortOptions.find(opt => opt.key === localSortType.value);
  return option ? option.label : '排序';
};

// 处理搜索变化
const handleSearchChange = (value) => {
  emit('update:search', value);
};

// 切换视图模式
const switchViewMode = (mode) => {
  localViewMode.value = mode;
  emit('update:view-mode', mode);
};

// 处理排序变化
const handleSortChange = (key) => {
  localSortType.value = key;
  emit('update:sort-type', key);
};

// 处理更多操作选择
const handleActionSelect = (key) => {
  switch (key) {
    case 'import':
      emit('import-bookmarks');
      break;
    case 'export':
      emit('export-bookmarks');
      break;
    case 'batch-edit':
      emit('batch-edit');
      break;
  }
};

// 切换标签
const toggleTag = (tag) => {
  if (selectedTag.value === tag) {
    selectedTag.value = '';
  } else {
    selectedTag.value = tag;
  }
  // 这里可以发出自定义事件通知父组件标签筛选已更改
};

// 监听父组件传入的属性变化
watch(() => props.search, (newVal) => {
  localSearch.value = newVal;
});

watch(() => props.viewMode, (newVal) => {
  localViewMode.value = newVal;
});

watch(() => props.sortType, (newVal) => {
  localSortType.value = newVal;
});
</script>

<style scoped>
.filter-container {
  margin-bottom: 16px;
}

.search-section {
  margin-bottom: 16px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  font-size: 14px;
  border-radius: 14px;
  background-color: var(--body-color);
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing-function);
}

.tag:hover {
  background-color: var(--primary-color-suppl);
  color: var(--primary-color);
}

.tag-selected {
  background-color: var(--primary-color);
  color: var(--text-color-inverse);
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-mode-switch {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.view-mode {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing-function);
}

.view-mode:hover {
  background-color: var(--body-color);
}

.view-mode-selected {
  background-color: var(--primary-color);
  color: var(--text-color-inverse);
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing-function);
}

.sort-button:hover {
  background-color: var(--body-color);
}

.function-buttons {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .action-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .function-buttons {
    width: 100%;
    justify-content: space-between;
  }
}
</style>