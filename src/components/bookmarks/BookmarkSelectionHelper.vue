<template>
  <div class="selection-helper-container" :class="{ 'active': isActive }">
    <div class="selection-panel">
      <div class="selection-count">
        <icon-font type="icon-check-square" class="count-icon" />
        <span class="count-text">已选择 {{ selectedCount }} 个书签</span>
      </div>

      <div class="selection-actions">
        <n-button-group size="small">
          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button @click="selectAll">
                <icon-font type="icon-check-all" />
              </n-button>
            </template>
            全选
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button @click="invertSelection">
                <icon-font type="icon-invert-selection" />
              </n-button>
            </template>
            反选
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button @click="clearSelection">
                <icon-font type="icon-clear-selection" />
              </n-button>
            </template>
            清除选择
          </n-tooltip>
        </n-button-group>

        <n-divider vertical />

        <n-button-group size="small">
          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button @click="$emit('batch-star')" :disabled="selectedCount === 0">
                <icon-font type="icon-star-filled" color="#f0a020" />
              </n-button>
            </template>
            收藏所选
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button @click="$emit('batch-unstar')" :disabled="selectedCount === 0">
                <icon-font type="icon-star" />
              </n-button>
            </template>
            取消收藏
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button @click="$emit('batch-edit')" :disabled="selectedCount === 0">
                <icon-font type="icon-edit" />
              </n-button>
            </template>
            批量编辑
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button @click="$emit('batch-delete')" :disabled="selectedCount === 0">
                <icon-font type="icon-delete" />
              </n-button>
            </template>
            删除所选
          </n-tooltip>
        </n-button-group>
      </div>

      <div class="close-selection-mode">
        <n-button quaternary circle size="small" @click="$emit('exit-selection-mode')">
          <icon-font type="icon-close" />
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  selectedBookmarks: {
    type: Array,
    default: () => []
  },
  allBookmarks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:selectedBookmarks',
  'batch-star',
  'batch-unstar',
  'batch-edit',
  'batch-delete',
  'exit-selection-mode'
])

// 计算选中的书签数量
const selectedCount = computed(() => props.selectedBookmarks.length)

// 全选
function selectAll() {
  emit('update:selectedBookmarks', [...props.allBookmarks])
}

// 反选
function invertSelection() {
  const selectedIds = new Set(props.selectedBookmarks.map(b => b.id))
  const invertedSelection = props.allBookmarks.filter(bookmark => !selectedIds.has(bookmark.id))
  emit('update:selectedBookmarks', invertedSelection)
}

// 清除选择
function clearSelection() {
  emit('update:selectedBookmarks', [])
}
</script>

<style scoped>
.selection-helper-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card-color);
  border-top: 1px solid var(--divider-color);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 100;
  padding: 0 16px;
}

.selection-helper-container.active {
  transform: translateY(0);
}

.selection-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.selection-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-icon {
  color: var(--primary-color);
  font-size: 18px;
}

.count-text {
  font-weight: 500;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-selection-mode {
  margin-left: 8px;
}
</style>