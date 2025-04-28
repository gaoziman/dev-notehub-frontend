<template>
  <n-card class="bookmark-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <icon-font type="icon-bookmark" :size="18" class="header-icon" />
          <h3 class="title">收藏资源</h3>
        </div>
        <div class="header-actions">
          <n-input-group>
            <n-input placeholder="搜索收藏..." class="search-input">
              <template #prefix>
                <icon-font type="icon-sousuo-" :size="16" color="#94a3b8" />
              </template>
            </n-input>
            <n-button type="primary" ghost>
              <template #icon>
                <icon-font type="icon-shaixuan2" :size="14" />
              </template>
              筛选
            </n-button>
          </n-input-group>
        </div>
      </div>
    </template>

    <n-data-table
        :columns="columns"
        :data="bookmarks"
        :pagination="tablePagination"
        :bordered="false"
        class="bookmark-table"
    />

    <template #footer>
      <div class="card-footer">
        <n-button text type="primary" size="small" class="view-all-button">
          <template #icon>
            <icon-font type="icon-chakanxiangqing3" :size="14" />
          </template>
          查看全部收藏
        </n-button>

        <n-button type="primary" ghost size="small" class="add-button">
          <template #icon>
            <icon-font type="icon-tianjiashoucang-" :size="14" />
          </template>
          添加收藏
        </n-button>
      </div>
    </template>
  </n-card>
</template>

<script setup>
import { h, defineProps, computed, ref } from 'vue';
import { NCard, NDataTable, NTag, NButton, NIcon, NInput, NInputGroup } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  bookmarks: {
    type: Array,
    required: true
  }
});

// 表格分页设置
const tablePagination = {
  pageSize: 5,
  showSizePicker: true,
  pageSizes: [5, 10, 15],
  prefix: ({ itemCount }) => `共 ${itemCount} 条收藏`
};

// 获取源图标
const getSourceIcon = (sourceType) => {
  const iconMap = {
    'github': 'icon-icon_github',
    'csdn': 'icon-csdn1',
    'juejin': 'icon-juejin1',
    'zhihu': 'icon-zhihu1',
    'default': 'icon-link'
  };
  return iconMap[sourceType] || iconMap['default'];
};

// 表格列配置
const columns = computed(() => [
  {
    title: '标题',
    key: 'title',
    render(row) {
      return h('div', { class: 'title-cell' }, [
        h('div', { class: 'title-text' }, row.title),
        h('div', { class: 'title-time' }, row.bookmarkTime)
      ]);
    }
  },
  {
    title: '来源',
    key: 'source',
    render(row) {
      return h('div', { class: 'source-cell' }, [
        h(IconFont, {
          type: getSourceIcon(row.sourceIcon),
          size: 16,
          color: getSourceColor(row.sourceIcon),
          class: 'mr-2'
        }),
        h('span', { class: 'source-text' }, row.source)
      ]);
    }
  },
  {
    title: '分类',
    key: 'category',
    width: 150,
    render(row) {
      const typeMap = {
        'blue': 'info',
        'green': 'success',
        'red': 'error',
        'yellow': 'warning',
        'purple': 'default'
      };
      return h(NTag, {
        type: typeMap[row.categoryColor] || 'default',
        size: 'small',
        round: true,
        class: 'category-tag'
      }, { default: () => row.category });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'right',
    render() {
      return h('div', { class: 'actions-cell' }, [
        h(NButton, {
          quaternary: true,
          circle: true,
          size: 'small',
          class: 'action-button view-button'
        }, {
          icon: () => h(IconFont, { type: 'icon-external-link', size: 16 })
        }),
        h(NButton, {
          quaternary: true,
          circle: true,
          size: 'small',
          class: 'action-button star-button'
        }, {
          icon: () => h(IconFont, { type: 'icon-star', size: 16 })
        }),
        h(NButton, {
          quaternary: true,
          circle: true,
          size: 'small',
          class: 'action-button delete-button'
        }, {
          icon: () => h(IconFont, { type: 'icon-trash', size: 16 })
        })
      ]);
    }
  }
]);

// 获取来源颜色
const getSourceColor = (sourceIcon) => {
  const colorMap = {
    'github': '#333333',
    'csdn': '#2563eb',
    'juejin': '#f97316',
    'default': '#64748b'
  };
  return colorMap[sourceIcon] || colorMap['default'];
};
</script>

<style scoped>
.bookmark-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  color: #f59e0b;
}

.title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  position: relative;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.bookmark-table {
  margin: 0 -16px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 0;
}

.view-all-button,
.add-button {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.view-all-button:hover,
.add-button:hover {
  transform: translateY(-2px);
}

/* 表格单元格样式 */
.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.title-time {
  color: #94a3b8;
  font-size: 0.75rem;
}

.source-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-text {
  font-size: 0.875rem;
  color: #64748b;
}

.category-tag {
  font-weight: 500;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.action-button {
  transition: all 0.2s;
}

.view-button {
  color: #3b82f6;
}

.view-button:hover {
  background-color: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.star-button {
  color: #f59e0b;
}

.star-button:hover {
  background-color: rgba(245, 158, 11, 0.1);
  transform: translateY(-2px);
}

.delete-button {
  color: #ef4444;
}

.delete-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
  transform: translateY(-2px);
}

/* 表格悬停行样式 */
:deep(.n-data-table .n-data-table-tr:hover) {
  background-color: rgba(241, 245, 249, 0.8) !important;
}

/* 表格头部样式 */
:deep(.n-data-table-thead) {
  background-color: #f8fafc !important;
}

:deep(.n-data-table-th) {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: #64748b !important;
}
</style>