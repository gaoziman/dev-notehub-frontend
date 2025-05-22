<template>
  <div class="document-card-list">
    <!-- 空状态 -->
    <n-empty
        v-if="!loading && (!documents || documents.length === 0)"
        description="暂无匹配的文档"
        size="large"
    >
      <template #icon>
        <icon-font type="icon-empty-data" :size="64" />
      </template>
      <template #extra>
        <n-button type="primary" class="create-button">
          <template #icon>
            <icon-font type="icon-add-file" />
          </template>
          创建文档
        </n-button>
      </template>
    </n-empty>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-state">
      <n-spin size="large" description="加载文档中..."></n-spin>
    </div>

    <!-- 卡片网格视图 -->
    <template v-else>
      <transition-group
          name="document-grid"
          tag="div"
          class="cards-grid"
      >
        <document-card
            v-for="document in documents"
            :key="document.id"
            :document="document"
            @view="$emit('view', document.id)"
            @edit="$emit('edit', document.id)"
            @delete="$emit('delete', document.id)"
            @download="$emit('download', document.id)"
            @share="$emit('share', document.id)"
            @star="(isStarred) => $emit('star', document.id, isStarred)"
        />
      </transition-group>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import IconFont from '@/components/common/IconFont.vue'
import DocumentCard from './DocumentCard.vue'

const props = defineProps({
  documents: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'edit', 'delete', 'download', 'share', 'star'])

// 添加进入动画延迟和错落有致的动画效果
onMounted(() => {
  setTimeout(() => {
    const cards = document.querySelectorAll('.document-card')
    cards.forEach((card, index) => {
      // 计算延迟，使卡片按行列交错出现
      const row = Math.floor(index / 3)
      const col = index % 3
      const delay = (row + col) * 50
      card.style.transitionDelay = `${delay}ms`
    })
  }, 0)
})
</script>

<style scoped>
.document-card-list {
  min-height: 300px;
  margin-bottom: 30px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.01);
  border: 1px dashed rgba(0, 0, 0, 0.08);
}

.create-button {
  border-radius: 10px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 30px;
}

/* 响应式网格布局 */
@media (max-width: 1700px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 1400px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 25px;
  }
}

@media (max-width: 1200px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    gap: 16px;
  }
}

/* 卡片网格动画 */
.document-grid-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.document-grid-leave-active {
  transition: all 0.4s ease;
  position: absolute;
}

.document-grid-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.document-grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.document-grid-move {
  transition: transform 0.5s ease;
}
</style>