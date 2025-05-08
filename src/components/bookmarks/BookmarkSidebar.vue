<template>
  <div class="sidebar-container">
    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="section-title">平台</h3>
      </div>
      <div class="sidebar-items">
        <div
            class="sidebar-item"
            :class="{ 'active': selectedPlatform === 'all' }"
            @click="$emit('update:platform', 'all')"
        >
          <icon-font type="icon-bookmark-fill" :size="16" />
          <span class="item-text">全部平台</span>
          <span class="item-count">{{ getTotalCount() }}</span>
        </div>

        <div
            v-for="platform in platforms"
            :key="platform.id"
            class="sidebar-item"
            :class="{ 'active': selectedPlatform === platform.id }"
            @click="$emit('update:platform', platform.id)"
        >
          <icon-font :type="platform.icon" :size="16" />
          <span class="item-text">{{ platform.name }}</span>
          <span class="item-count">{{ getPlatformCount(platform.id) }}</span>
        </div>
      </div>
    </div>

    <n-divider style="margin: 12px 0;" />

    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="section-title">分类</h3>
      </div>
      <div class="sidebar-items">
        <div
            class="sidebar-item"
            :class="{ 'active': selectedCategory === 'all' }"
            @click="$emit('update:category', 'all')"
        >
          <icon-font type="icon-folder" :size="16" />
          <span class="item-text">全部分类</span>
          <span class="item-count">{{ getTotalCount() }}</span>
        </div>

        <div
            v-for="category in categories"
            :key="category.id"
            class="sidebar-item"
            :class="{ 'active': selectedCategory === category.id }"
            @click="$emit('update:category', category.id)"
        >
          <icon-font type="icon-folder-open" :size="16" v-if="selectedCategory === category.id" />
          <icon-font type="icon-folder" :size="16" v-else />
          <span class="item-text">{{ category.name }}</span>
          <span class="item-count">{{ getCategoryCount(category.id) }}</span>
        </div>
      </div>
    </div>

    <n-divider style="margin: 12px 0;" />

    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="section-title">常用标签</h3>
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <n-button quaternary circle size="small">
              <template #icon>
                <icon-font type="icon-info" :size="14" />
              </template>
            </n-button>
          </template>
          点击标签进行筛选
        </n-tooltip>
      </div>
      <div class="tag-cloud">
        <div
            v-for="tag in tags"
            :key="tag"
            class="tag-item"
            :class="{ 'active': selectedTag === tag }"
            @click="handleTagClick(tag)"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <n-divider style="margin: 12px 0;" />

    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="section-title">收藏状态</h3>
      </div>
      <div class="sidebar-items">
        <div class="sidebar-item">
          <icon-font type="icon-time" :size="16" />
          <span class="item-text">最近添加</span>
        </div>
        <div class="sidebar-item">
          <icon-font type="icon-star-fill" :size="16" />
          <span class="item-text">已加星标</span>
        </div>
        <div class="sidebar-item">
          <icon-font type="icon-archive" :size="16" />
          <span class="item-text">已归档</span>
        </div>
        <div class="sidebar-item">
          <icon-font type="icon-tag" :size="16" />
          <span class="item-text">未分类</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 组件属性
const props = defineProps({
  platforms: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  },
  selectedPlatform: {
    type: String,
    default: 'all'
  },
  selectedCategory: {
    type: String,
    default: 'all'
  },
  selectedTag: {
    type: String,
    default: ''
  },
  // 这个属性可以用来获取每个分类/平台的数量，这里使用模拟数据
  stats: {
    type: Object,
    default: () => ({
      platforms: {
        github: 42,
        juejin: 38,
        zhihu: 29,
        csdn: 35,
        stackoverflow: 22,
        medium: 18
      },
      categories: {
        frontend: 68,
        backend: 45,
        devops: 32,
        design: 24,
        learning: 38,
        tools: 25
      },
      total: 246
    })
  }
});

// 定义事件
const emit = defineEmits(['update:platform', 'update:category', 'update:tag']);

// 获取总数
const getTotalCount = () => {
  return props.stats.total || 0;
};

// 获取平台数量
const getPlatformCount = (platformId) => {
  return props.stats.platforms[platformId] || 0;
};

// 获取分类数量
const getCategoryCount = (categoryId) => {
  return props.stats.categories[categoryId] || 0;
};

// 处理标签点击
const handleTagClick = (tag) => {
  if (props.selectedTag === tag) {
    // 如果已选中，则取消选中
    emit('update:tag', '');
  } else {
    // 否则选中该标签
    emit('update:tag', tag);
  }
};
</script>

<style scoped>
.sidebar-container {
  width: 240px;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--box-shadow-1);
  flex-shrink: 0;
}

.sidebar-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-color-base);
}

.sidebar-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing-function);
}

.sidebar-item:hover {
  background-color: var(--body-color);
}

.sidebar-item.active {
  background-color: var(--primary-color-suppl);
  color: var(--primary-color);
}

.item-text {
  flex: 1;
  margin-left: 8px;
}

.item-count {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-item {
  padding: 4px 12px;
  border-radius: 12px;
  background-color: var(--body-color);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing-function);
}

.tag-item:hover {
  background-color: var(--primary-color-suppl);
  color: var(--primary-color);
}

.tag-item.active {
  background-color: var(--primary-color);
  color: var(--text-color-inverse);
}

@media (max-width: 768px) {
  .sidebar-container {
    width: 100%;
    margin-bottom: 16px;
  }
}
</style>