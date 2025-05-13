<template>
  <n-card title="热门资源" class="popular-resources-card">
    <template #header-extra>
      <n-dropdown :options="resourceTypeOptions" @select="handleResourceTypeChange">
        <n-button text size="small">
          {{ getResourceTypeLabel(resourceType) }}
          <template #icon>
            <icon-font type="icon-arrow-down" :size="14" />
          </template>
        </n-button>
      </n-dropdown>
    </template>

    <div class="resources-list">
      <div
          v-for="(resource, index) in filteredResources"
          :key="resource.id"
          class="resource-item"
          @click="openResource(resource)"
      >
        <div class="resource-icon" :style="{ backgroundColor: getResourceColor(resource.type) }">
          <icon-font :type="getResourceIcon(resource.type)" :size="18" color="#fff" />
        </div>
        <div class="resource-content">
          <div class="resource-title">{{ resource.title }}</div>
          <div class="resource-meta">
            <span class="resource-type">{{ getResourceTypeLabel(resource.type) }}</span>
            <span class="resource-views">{{ resource.views }}次阅读</span>
          </div>
        </div>
        <div class="resource-actions">
          <n-button quaternary circle size="small" @click.stop="toggleFavorite(resource)">
            <template #icon>
              <icon-font :type="resource.favorite ? 'icon-star-filled' : 'icon-star'" :size="16" />
            </template>
          </n-button>
        </div>
      </div>

      <n-empty
          v-if="filteredResources.length === 0"
          description="暂无资源"
          size="small"
      >
        <template #icon>
          <icon-font type="icon-empty-data" :size="48" />
        </template>
      </n-empty>
    </div>

    <n-space justify="center" class="recommendations-section">
      <n-tag v-for="tag in recommendedTags" :key="tag.name" round size="small" class="tag-item" :style="{ backgroundColor: tag.bg }" @click="searchByTag(tag.name)">
        {{ tag.name }}
      </n-tag>
    </n-space>

    <template #footer>
      <div class="view-all-link">
        <n-button text @click="viewAllResources">
          查看全部资源
          <template #icon>
            <icon-font type="icon-arrow-right" :size="14" />
          </template>
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

const router = useRouter();
const message = useMessage();

// 资源类型
const resourceType = ref('all');
const resourceTypeOptions = [
  {
    label: '全部资源',
    key: 'all'
  },
  {
    label: '文档',
    key: 'document'
  },
  {
    label: '代码片段',
    key: 'snippet'
  },
  {
    label: '书签',
    key: 'bookmark'
  },
  {
    label: '学习路径',
    key: 'learning'
  }
];

// 推荐标签
const recommendedTags = [
  { name: 'Vue3', bg: 'rgba(66, 184, 131, 0.1)' },
  { name: 'TypeScript', bg: 'rgba(0, 122, 204, 0.1)' },
  { name: 'Naive UI', bg: 'rgba(24, 160, 88, 0.1)' },
  { name: '微前端', bg: 'rgba(99, 102, 241, 0.1)' },
  { name: 'Spring Boot', bg: 'rgba(239, 71, 111, 0.1)' }
];

// 资源列表
const resources = ref([
  {
    id: 1,
    title: 'Vue3组合式API完全指南',
    type: 'document',
    views: 423,
    favorite: true,
    route: '/document/view/1'
  },
  {
    id: 2,
    title: 'TypeScript高级类型体操',
    type: 'snippet',
    views: 356,
    favorite: true,
    route: '/dashboard/code-snippets/view/1'
  },
  {
    id: 3,
    title: 'SpringBoot JWT认证工具类',
    type: 'snippet',
    views: 289,
    favorite: false,
    route: '/dashboard/code-snippets/view/4'
  },
  {
    id: 4,
    title: 'React Hooks深入解析',
    type: 'bookmark',
    views: 264,
    favorite: true,
    route: '/dashboard/bookmarks'
  },
  {
    id: 5,
    title: 'Docker容器化应用部署指南',
    type: 'bookmark',
    views: 241,
    favorite: false,
    route: '/dashboard/bookmarks'
  },
  {
    id: 6,
    title: 'Vue3前端开发路径',
    type: 'learning',
    views: 235,
    favorite: true,
    route: '/dashboard/learning-tracks'
  }
]);

// 根据类型筛选资源
const filteredResources = computed(() => {
  if (resourceType.value === 'all') {
    return resources.value;
  }
  return resources.value.filter(resource => resource.type === resourceType.value);
});

// 获取资源类型标签
const getResourceTypeLabel = (type) => {
  const option = resourceTypeOptions.find(option => option.key === type);
  return option ? option.label : type;
};

// 获取资源图标
const getResourceIcon = (type) => {
  switch (type) {
    case 'document':
      return 'icon-wendang1';
    case 'snippet':
      return 'icon-code';
    case 'bookmark':
      return 'icon-bookmark';
    case 'learning':
      return 'icon-xuexi';
    default:
      return 'icon-file';
  }
};

// 获取资源颜色
const getResourceColor = (type) => {
  switch (type) {
    case 'document':
      return '#6366f1';
    case 'snippet':
      return '#f97316';
    case 'bookmark':
      return '#10b981';
    case 'learning':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

// 切换收藏状态
const toggleFavorite = (resource) => {
  resource.favorite = !resource.favorite;
  message.success(resource.favorite ? '已添加到收藏' : '已取消收藏');
};

// 打开资源
const openResource = (resource) => {
  router.push(resource.route);
};

// 查看全部资源
const viewAllResources = () => {
  router.push('/search?type=all');
};

// 根据标签搜索
const searchByTag = (tag) => {
  router.push(`/search?tag=${tag}`);
};

// 处理资源类型变更
const handleResourceTypeChange = (key) => {
  resourceType.value = key;
};
</script>

<style scoped>
.popular-resources-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resources-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: var(--border-radius);
  background-color: var(--body-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.resource-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-1);
}

.resource-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.resource-content {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-weight: 500;
  color: var(--text-color-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.resource-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.resource-type {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1px 6px;
  border-radius: 4px;
  margin-right: 8px;
}

.resource-views {
  flex-shrink: 0;
}

.resource-actions {
  margin-left: 8px;
}

.recommendations-section {
  margin: 4px 0 12px;
}

.tag-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.tag-item:hover {
  transform: scale(1.05);
}

.view-all-link {
  text-align: center;
}
</style>