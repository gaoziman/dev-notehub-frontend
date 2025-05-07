<template>
  <n-card
      class="tool-card"
      :class="{ 'tool-card-popular': isPopular }"
      hoverable
      @click="navigateToTool"
  >
    <div class="tool-card-content">
      <div class="tool-icon">
        <icon-font :type="iconType" :size="48" :color="iconColor" />
      </div>
      <div class="tool-info">
        <h3 class="tool-title">{{ title }}</h3>
        <p class="tool-description">{{ description }}</p>
      </div>
    </div>
    <template #footer>
      <div class="tool-footer">
        <div class="tool-tags">
          <n-tag v-if="isNew" type="success" size="small" round>新上线</n-tag>
          <n-tag v-if="isPopular" type="warning" size="small" round>热门</n-tag>
          <n-tag size="small" round>{{ category }}</n-tag>
        </div>
        <n-button
            quaternary
            circle
            size="small"
            @click.stop="toggleFavorite"
        >
          <icon-font :type="isFavorite ? 'icon-star-fill' : 'icon-star'" :size="16" :color="isFavorite ? '#f0a020' : undefined" />
        </n-button>
      </div>
    </template>
  </n-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: undefined
  },
  route: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const message = useMessage();

// 模拟收藏状态
const isFavorite = ref(false);

// 导航到工具详情页
const navigateToTool = () => {
  router.push(props.route);
};

// 切换收藏状态
const toggleFavorite = (event) => {
  event.stopPropagation();
  isFavorite.value = !isFavorite.value;
  message.success(isFavorite.value ? `已添加 ${props.title} 到收藏` : `已从收藏中移除 ${props.title}`);
};
</script>

<style scoped>
.tool-card {
  transition: all var(--transition-duration) var(--transition-timing-function);
  height: 100%;
}

.tool-card:hover {
  transform: translateY(-4px);
}

.tool-card-popular {
  border-left: 3px solid var(--warning-color);
}

.tool-card-content {
  display: flex;
  gap: 16px;
  align-items: center;
  min-height: 100px;
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background-color: rgba(99, 102, 241, 0.1);
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
}

.tool-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color-base);
}

.tool-description {
  margin: 0;
  font-size: 13px;
  color: var(--text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-tags {
  display: flex;
  gap: 8px;
}
</style>