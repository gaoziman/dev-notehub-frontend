<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">最新收藏</h2>
      <a-button type="link">查看全部</a-button>
    </div>
    <a-card>
      <a-table :columns="columns" :data-source="collections" :pagination="false" class="collection-table">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'source'">
            <div class="source-cell">
              <component :is="getSourceIcon(record.sourceType)" />
              <span>{{ record.source }}</span>
            </div>
          </template>
          <template v-if="column.key === 'category'">
            <a-tag :color="getCategoryColor(record.category)">{{ record.category }}</a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <div class="action-buttons">
              <a-button type="text" class="table-action-button">
                <template #icon><export-outlined /></template>
              </a-button>
              <a-button type="text" class="table-action-button star-button">
                <template #icon><star-outlined /></template>
              </a-button>
              <a-button type="text" class="table-action-button delete-button">
                <template #icon><delete-outlined /></template>
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {
  ExportOutlined,
  StarOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';

defineProps<{
  collections: Array<{
    key: string;
    title: string;
    source: string;
    sourceType: string;
    category: string;
    time: string;
  }>;
  columns: Array<any>;
  getSourceIcon: (sourceType: string) => any;
  getCategoryColor: (category: string) => string;
}>();
</script>

<style scoped>
/* 章节容器通用样式 */
.section-container {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* 收藏表格样式 */
.collection-table :deep(.ant-table) {
  border-radius: 12px;
  overflow: hidden;
}

.collection-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc;
  font-weight: 500;
  color: #4b5563;
}

.collection-table :deep(.ant-table-row:hover) {
  background-color: #f8fafc;
}

.source-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.table-action-button {
  color: #a0aec0;
  transition: all 0.2s ease;
}

.table-action-button:hover {
  background-color: #f1f5f9;
}

.star-button:hover {
  color: #ecc94b;
}

.delete-button:hover {
  color: #e53e3e;
}
</style>