<template>
  <n-card class="note-card" hoverable @click="$emit('click', note)">
    <template #header>
      <div class="note-header">
        <div class="note-title">{{ note.title }}</div>
        <n-space>
          <n-tooltip v-for="tag in note.tags" :key="tag" :trigger="['hover']">
            <template #trigger>
              <n-tag size="small" round>{{ tag }}</n-tag>
            </template>
            {{ tag }}
          </n-tooltip>
        </n-space>
      </div>
    </template>

    <div class="note-content">
      {{ truncatedContent }}
    </div>

    <template #footer>
      <div class="note-footer">
        <div class="note-date">
          <icon-font type="icon-shijian" :size="14" />
          <span>{{ formatDate(note.createdAt) }}</span>
        </div>
        <div class="note-actions">
          <n-space>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button quaternary circle size="small" @click.stop="handleEdit">
                  <template #icon>
                    <icon-font type="icon-bianji" :size="14" />
                  </template>
                </n-button>
              </template>
              编辑笔记
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button quaternary circle size="small" @click.stop="toggleFavorite">
                  <template #icon>
                    <icon-font :type="isFavorite ? 'icon-favorite-filled' : 'icon-favorite'" :size="14" :color="isFavorite ? 'var(--warning-color)' : ''" />
                  </template>
                </n-button>
              </template>
              {{ isFavorite ? '取消收藏' : '收藏笔记' }}
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button quaternary circle size="small" @click.stop="handleDelete">
                  <template #icon>
                    <icon-font type="icon-delete" :size="14" />
                  </template>
                </n-button>
              </template>
              删除笔记
            </n-tooltip>
          </n-space>
        </div>
      </div>
    </template>
  </n-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  note: {
    type: Object,
    required: true,
    validator: (note) => {
      return note.id && note.title && note.content
    }
  }
})

const emit = defineEmits(['click', 'edit', 'delete', 'favorite'])

const dialog = useDialog()
const message = useMessage()

// 收藏状态 (模拟本地状态)
const isFavorite = ref(props.note.favorite || false)

// 截断内容以适应卡片高度
const truncatedContent = computed(() => {
  const maxLength = 150
  if (props.note.content.length <= maxLength) {
    return props.note.content
  }
  return props.note.content.substring(0, maxLength) + '...'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // 今天，显示具体时间
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    // 超过一周，显示完整日期
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }
}

// 处理编辑按钮点击
const handleEdit = () => {
  emit('edit', props.note)
}

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  emit('favorite', {
    id: props.note.id,
    favorite: isFavorite.value
  })

  message.success(isFavorite.value ? '已加入收藏' : '已取消收藏')
}

// 处理删除按钮点击
const handleDelete = () => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除笔记"${props.note.title}"吗？此操作不可撤销。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      emit('delete', props.note.id)
      message.success('笔记已删除')
    }
  })
}
</script>

<style scoped>
.note-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--box-shadow-2);
}

.note-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-title {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.4;
  word-break: break-word;
}

.note-content {
  flex: 1;
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  position: relative;
}

.note-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  height: 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), var(--card-color));
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.note-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.note-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.note-card:hover .note-actions {
  opacity: 1;
}
</style>