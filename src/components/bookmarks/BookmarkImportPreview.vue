<template>
  <n-modal
      v-model:show="localShow"
      preset="card"
      title="书签导入预览"
      style="max-width: 900px; width: 90vw"
      :bordered="false"
      :segmented="{ content: true, footer: 'soft' }"
  >
    <div class="preview-header">
      <div class="preview-meta">
        <div class="preview-source">
          <icon-font :type="getSourceIcon()" :size="20" />
          <span>从 <strong>{{ source }}</strong> 导入</span>
        </div>
        <div class="preview-count">
          <span>共 <strong>{{ bookmarks.length }}</strong> 条书签</span>
          <span v-if="duplicateCount > 0" class="duplicate-warning">
            <icon-font type="icon-warning" :size="16" />
            <span>发现 {{ duplicateCount }} 个可能重复的书签</span>
          </span>
        </div>
      </div>

      <n-alert title="导入提示" type="info" class="import-alert">
        <div class="import-tips">
          <div class="tip-item">
            <icon-font type="icon-info" :size="16" />
            <span>重复的链接会更新现有书签而不是创建新记录</span>
          </div>
          <div class="tip-item">
            <icon-font type="icon-info" :size="16" />
            <span>可以手动选择要导入的书签，取消勾选不需要的项目</span>
          </div>
          <div class="tip-item">
            <icon-font type="icon-info" :size="16" />
            <span>批量操作可以一次性修改多个书签的分类或标签</span>
          </div>
        </div>
      </n-alert>
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions">
      <div class="selection-info">
        <n-checkbox
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @update:checked="handleSelectAll"
        >
          {{ isAllSelected ? '取消全选' : '全选' }}
        </n-checkbox>
        <span class="selection-count" v-if="selectedBookmarks.length > 0">
          已选择 <strong>{{ selectedBookmarks.length }}</strong> 项
        </span>
      </div>

      <div class="batch-options">
        <n-button-group size="small">
          <n-button @click="batchSetCategory = true" :disabled="selectedBookmarks.length === 0">
            <template #icon>
              <icon-font type="icon-folder" :size="16" />
            </template>
            批量设置分类
          </n-button>
          <n-button @click="batchAddTags = true" :disabled="selectedBookmarks.length === 0">
            <template #icon>
              <icon-font type="icon-tag" :size="16" />
            </template>
            批量添加标签
          </n-button>
        </n-button-group>
      </div>
    </div>

    <!-- 预览列表 -->
    <div class="preview-list">
      <n-data-table
          size="small"
          :columns="columns"
          :data="bookmarks"
          :pagination="{ pageSize: 10, showSizePicker: true, pageSizes: [10, 20, 50] }"
          :row-key="row => row.id || row.url"
          :row-props="getRowProps"
          :max-height="tableMaxHeight"
      />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="form-actions">
        <div class="import-settings">
          <n-checkbox v-model:checked="options.detectDuplicates">检测并合并重复项</n-checkbox>
          <n-checkbox v-model:checked="options.autoClassify">智能分类</n-checkbox>
        </div>
        <div class="action-buttons">
          <n-button @click="$emit('cancel')">取消</n-button>
          <n-button
              type="primary"
              :disabled="selectedBookmarks.length === 0"
              @click="handleConfirmImport"
              round
          >
            导入 {{ selectedBookmarks.length }} 项
          </n-button>
        </div>
      </div>
    </template>

    <!-- 批量设置分类 -->
    <n-modal
        v-model:show="batchSetCategory"
        preset="dialog"
        title="批量设置分类"
    >
      <template #content>
        <n-form
            label-placement="left"
            label-width="80"
        >
          <n-form-item label="分类" required>
            <n-select
                v-model:value="batchCategory"
                placeholder="请选择分类"
                :options="categoryOptions"
            />
          </n-form-item>

          <div class="quick-categories">
            <div class="categories-list">
              <n-tag
                  v-for="category in categories"
                  :key="category.id"
                  size="small"
                  round
                  :type="batchCategory === category.id ? 'primary' : 'default'"
                  clickable
                  @click="batchCategory = category.id"
              >
                {{ category.name }}
              </n-tag>
            </div>
          </div>
        </n-form>
      </template>
      <template #action>
        <n-button @click="batchSetCategory = false">取消</n-button>
        <n-button
            type="primary"
            :disabled="!batchCategory"
            @click="applyBatchCategory"
        >
          应用
        </n-button>
      </template>
    </n-modal>

    <!-- 批量添加标签 -->
    <n-modal
        v-model:show="batchAddTags"
        preset="dialog"
        title="批量添加标签"
    >
      <template #content>
        <n-form
            label-placement="left"
            label-width="80"
        >
          <n-form-item label="标签" required>
            <n-dynamic-tags
                v-model:value="batchTagsList"
                placeholder="输入后回车添加标签"
            />
          </n-form-item>

          <div class="popular-tags">
            <div class="tags-list">
              <n-tag
                  v-for="tag in popularTags"
                  :key="tag"
                  size="small"
                  round
                  clickable
                  @click="addBatchTag(tag)"
              >
                {{ tag }}
              </n-tag>
            </div>
          </div>
        </n-form>
      </template>
      <template #action>
        <n-button @click="batchAddTags = false">取消</n-button>
        <n-button
            type="primary"
            :disabled="batchTagsList.length === 0"
            @click="applyBatchTags"
        >
          应用
        </n-button>
      </template>
    </n-modal>
  </n-modal>
</template>

<script setup>
import { h, ref, computed, reactive, onMounted, watch } from 'vue';
import { useMessage } from 'naive-ui';

// 消息提示
const message = useMessage();

// 组件属性
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  bookmarks: {
    type: Array,
    required: true
  },
  source: {
    type: String,
    default: '浏览器'
  },
  categories: {
    type: Array,
    default: () => []
  },
  popularTags: {
    type: Array,
    default: () => []
  }
});

// 组件事件
const emit = defineEmits(['update:show', 'import', 'cancel']);

// 本地状态
const localShow = ref(props.show);
const tableMaxHeight = ref(400);
const selectedBookmarks = ref([]);
const batchSetCategory = ref(false);
const batchAddTags = ref(false);
const batchCategory = ref(null);
const batchTagsList = ref([]);

// 导入选项
const options = reactive({
  detectDuplicates: true,
  autoClassify: true
});

// 计算属性
const isAllSelected = computed(() => {
  return props.bookmarks.length > 0 && selectedBookmarks.value.length === props.bookmarks.length;
});

const isIndeterminate = computed(() => {
  return selectedBookmarks.value.length > 0 && selectedBookmarks.value.length < props.bookmarks.length;
});

// 预计的重复书签数量
const duplicateCount = computed(() => {
  // 实际应用中，应该有更准确的重复检测逻辑
  return Math.floor(props.bookmarks.length * 0.2); // 假设20%可能重复
});

// 分类选项
const categoryOptions = computed(() => {
  return props.categories.map(category => ({
    label: category.name,
    value: category.id
  }));
});

// 获取来源图标
const getSourceIcon = () => {
  const sourceMap = {
    '浏览器': 'icon-chrome',
    '批量导入': 'icon-file',
    '粘贴导入': 'icon-paste'
  };
  return sourceMap[props.source] || 'icon-import';
};

// 表格列定义
const columns = [
  {
    type: 'selection',
    selectedRowKeys: selectedBookmarks.value,
    onUpdateCheckedRowKeys: (keys) => {
      selectedBookmarks.value = keys;
    }
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: true,
    render(row) {
      return h('div', { class: 'bookmark-title' }, [
        h('div', { class: 'title-text' }, row.title || '无标题'),
        h('div', { class: 'url-text' }, row.url)
      ]);
    }
  },
  {
    title: '分类',
    key: 'category',
    width: 120,
    render(row) {
      const category = props.categories.find(c => c.id === row.category);
      return category ? category.name : (row.category || '未分类');
    }
  },
  {
    title: '标签',
    key: 'tags',
    width: 180,
    render(row) {
      const tags = row.tags || [];
      if (tags.length === 0) {
        return '无标签';
      }

      return h('div', { class: 'tags-cell' },
          tags.slice(0, 3).map(tag =>
              h('span', { class: 'tag' }, tag)
          )
      );
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render(row) {
      return h('div', { class: 'actions-cell' }, [
        h('button', {
          class: 'action-button',
          onClick: (e) => {
            e.stopPropagation();
            editBookmark(row);
          }
        }, '编辑'),
        h('button', {
          class: 'action-button',
          onClick: (e) => {
            e.stopPropagation();
            removeBookmark(row);
          }
        }, '移除')
      ]);
    }
  }
];

// 行属性
const getRowProps = (row) => {
  return {
    style: 'cursor: pointer;',
    onClick: () => toggleRowSelection(row)
  };
};

// 全选/取消全选
const handleSelectAll = (checked) => {
  if (checked) {
    selectedBookmarks.value = props.bookmarks.map(bookmark => bookmark.id || bookmark.url);
  } else {
    selectedBookmarks.value = [];
  }
};

// 切换行选择
const toggleRowSelection = (row) => {
  const id = row.id || row.url;
  const index = selectedBookmarks.value.indexOf(id);
  if (index !== -1) {
    selectedBookmarks.value.splice(index, 1);
  } else {
    selectedBookmarks.value.push(id);
  }
};

// 编辑单个书签
const editBookmark = (bookmark) => {
  // 在实际应用中，这里可以打开一个编辑对话框
  message.info('编辑功能开发中');
};

// 从导入列表中移除
const removeBookmark = (bookmark) => {
  const id = bookmark.id || bookmark.url;
  const index = selectedBookmarks.value.indexOf(id);
  if (index !== -1) {
    selectedBookmarks.value.splice(index, 1);
  }
  message.success('已从导入列表中移除');
};

// 添加批量标签
const addBatchTag = (tag) => {
  if (!batchTagsList.value.includes(tag)) {
    batchTagsList.value.push(tag);
  }
};

// 应用批量分类
const applyBatchCategory = () => {
  if (!batchCategory.value) {
    message.warning('请选择分类');
    return;
  }

  // 应用到选中的书签
  message.success(`已将分类应用到 ${selectedBookmarks.value.length} 个书签`);
  batchSetCategory.value = false;
};

// 应用批量标签
const applyBatchTags = () => {
  if (batchTagsList.value.length === 0) {
    message.warning('请添加标签');
    return;
  }

  // 应用到选中的书签
  message.success(`已将标签应用到 ${selectedBookmarks.value.length} 个书签`);
  batchAddTags.value = false;
};

// 确认导入
const handleConfirmImport = () => {
  if (selectedBookmarks.value.length === 0) {
    message.warning('请选择要导入的书签');
    return;
  }

  // 收集选中的书签数据
  const bookmarksToImport = props.bookmarks.filter(bookmark =>
      selectedBookmarks.value.includes(bookmark.id || bookmark.url)
  );

  // 发送导入事件
  emit('import', {
    bookmarks: bookmarksToImport,
    options: {
      detectDuplicates: options.detectDuplicates,
      autoClassify: options.autoClassify
    }
  });
};

// 更新表格高度
const updateTableHeight = () => {
  const viewportHeight = window.innerHeight;
  tableMaxHeight.value = Math.min(viewportHeight * 0.5, 400);
};

// 监听show属性
watch(() => props.show, (newValue) => {
  localShow.value = newValue;
});

// 监听localShow变化
watch(localShow, (newValue) => {
  emit('update:show', newValue);
});

// 组件挂载和卸载
onMounted(() => {
  updateTableHeight();
  window.addEventListener('resize', updateTableHeight);

  // 默认全选
  selectedBookmarks.value = props.bookmarks.map(bookmark => bookmark.id || bookmark.url);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight);
});
</script>

<style scoped>
.preview-header {
  margin-bottom: 16px;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-source, .preview-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.duplicate-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--warning-color);
  font-size: 12px;
  margin-left: 12px;
}

.import-alert {
  margin-bottom: 16px;
}

.import-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 12px 0;
  border-top: 1px solid var(--divider-color);
  border-bottom: 1px solid var(--divider-color);
}

.selection-info {
  display: flex;
  align-items: center;
}

.selection-count {
  margin-left: 12px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.preview-list {
  margin-bottom: 16px;
}

.bookmark-title {
  display: flex;
  flex-direction: column;
}

.title-text {
  font-weight: 500;
}

.url-text {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 12px;
  background-color: var(--body-color);
  padding: 2px 6px;
  border-radius: 10px;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
  padding: 2px 6px;
}

.action-button:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-settings {
  display: flex;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.quick-categories {
  margin-top: 16px;
}

.categories-list, .tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.popular-tags {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: 16px;
  }

  .import-settings {
    flex-direction: column;
    gap: 8px;
  }
}
</style>