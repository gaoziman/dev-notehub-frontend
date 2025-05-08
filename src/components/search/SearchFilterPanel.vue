<template>
  <div class="filter-panel-container">
    <h3 class="filter-panel-title">过滤结果</h3>

    <!-- 分类过滤 -->
    <div class="filter-section">
      <div class="filter-header">
        <h4 class="filter-title">分类</h4>
        <n-button text size="small" @click="clearFilter('categories')">
          清除
        </n-button>
      </div>
      <div class="filter-content">
        <n-checkbox-group v-model:value="filters.categories">
          <div v-for="category in categories" :key="category.name" class="filter-item">
            <n-checkbox :value="category.name">
              <div class="filter-label">
                <span>{{ category.name }}</span>
                <span class="filter-count">{{ category.count }}</span>
              </div>
            </n-checkbox>
          </div>
        </n-checkbox-group>
      </div>
    </div>

    <!-- 标签过滤 -->
    <div class="filter-section">
      <div class="filter-header">
        <h4 class="filter-title">标签</h4>
        <n-button text size="small" @click="clearFilter('tags')">
          清除
        </n-button>
      </div>
      <div class="filter-content">
        <n-checkbox-group v-model:value="filters.tags">
          <div v-for="tag in tags" :key="tag.name" class="filter-item">
            <n-checkbox :value="tag.name">
              <div class="filter-label">
                <span>{{ tag.name }}</span>
                <span class="filter-count">{{ tag.count }}</span>
              </div>
            </n-checkbox>
          </div>
        </n-checkbox-group>
      </div>
    </div>

    <!-- 时间范围过滤 -->
    <div class="filter-section">
      <div class="filter-header">
        <h4 class="filter-title">时间范围</h4>
      </div>
      <div class="filter-content">
        <n-radio-group v-model:value="filters.dateRange" size="small" class="time-filter">
          <n-space vertical>
            <n-radio value="全部时间">全部时间</n-radio>
            <n-radio value="最近一周">最近一周</n-radio>
            <n-radio value="最近一个月">最近一个月</n-radio>
            <n-radio value="最近三个月">最近三个月</n-radio>
            <n-radio value="自定义...">
              自定义...
              <template #checked>
                <n-date-picker
                    v-model:value="customDateRange"
                    type="daterange"
                    clearable
                    size="small"
                    style="margin-top: 8px; width: 100%"
                />
              </template>
            </n-radio>
          </n-space>
        </n-radio-group>
      </div>
    </div>

    <!-- 学习状态过滤 -->
    <div class="filter-section">
      <div class="filter-header">
        <h4 class="filter-title">学习状态</h4>
        <n-button text size="small" @click="clearFilter('status')">
          清除
        </n-button>
      </div>
      <div class="filter-content">
        <n-checkbox-group v-model:value="filters.status">
          <div class="filter-item status-item">
            <n-checkbox value="未开始">
              <div class="filter-label">
                <div class="status-dot" style="background-color: #ef4444;"></div>
                <span>未开始</span>
                <span class="filter-count">5</span>
              </div>
            </n-checkbox>
          </div>
          <div class="filter-item status-item">
            <n-checkbox value="进行中">
              <div class="filter-label">
                <div class="status-dot" style="background-color: #3b82f6;"></div>
                <span>进行中</span>
                <span class="filter-count">18</span>
              </div>
            </n-checkbox>
          </div>
          <div class="filter-item status-item">
            <n-checkbox value="已完成">
              <div class="filter-label">
                <div class="status-dot" style="background-color: #22c55e;"></div>
                <span>已完成</span>
                <span class="filter-count">9</span>
              </div>
            </n-checkbox>
          </div>
        </n-checkbox-group>
      </div>
    </div>

    <!-- 内容类型过滤 -->
    <div class="filter-section">
      <div class="filter-header">
        <h4 class="filter-title">内容类型</h4>
        <n-button text size="small" @click="clearFilter('contentType')">
          清除
        </n-button>
      </div>
      <div class="filter-content">
        <n-checkbox-group v-model:value="filters.contentType">
          <div class="filter-item content-type-item">
            <n-checkbox value="Markdown">
              <div class="filter-label">
                <n-icon size="16" class="content-type-icon">
                  <icon-font type="icon-markdown" />
                </n-icon>
                <span>Markdown</span>
                <span class="filter-count">15</span>
              </div>
            </n-checkbox>
          </div>
          <div class="filter-item content-type-item">
            <n-checkbox value="PDF">
              <div class="filter-label">
                <n-icon size="16" class="content-type-icon">
                  <icon-font type="icon-pdf" />
                </n-icon>
                <span>PDF</span>
                <span class="filter-count">8</span>
              </div>
            </n-checkbox>
          </div>
          <div class="filter-item content-type-item">
            <n-checkbox value="外部链接">
              <div class="filter-label">
                <n-icon size="16" class="content-type-icon">
                  <icon-font type="icon-links" />
                </n-icon>
                <span>外部链接</span>
                <span class="filter-count">9</span>
              </div>
            </n-checkbox>
          </div>
        </n-checkbox-group>
      </div>
    </div>

    <!-- 重置和应用过滤器按钮 -->
    <div class="filter-actions">
      <n-button size="small" @click="resetFilters">重置全部</n-button>
      <n-button type="primary" size="small" @click="applyFilters">应用过滤器</n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import IconFont from "@/components/common/IconFont.vue";

// 接收属性
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  },
  selectedFilters: {
    type: Object,
    default: () => ({
      categories: [],
      tags: [],
      dateRange: '全部时间',
      status: [],
      contentType: []
    })
  }
});

// 定义事件
const emit = defineEmits(['update:filters']);

// 本地筛选状态
const filters = ref({
  categories: [],
  tags: [],
  dateRange: '全部时间',
  status: [],
  contentType: []
});

// 自定义日期范围
const customDateRange = ref(null);

// 初始化筛选器
onMounted(() => {
  if (props.selectedFilters) {
    filters.value = { ...props.selectedFilters };
  }
});

// 监听属性变化
watch(() => props.selectedFilters, (newVal) => {
  if (newVal) {
    filters.value = { ...newVal };
  }
}, { deep: true });

// 清除特定筛选器
const clearFilter = (filterType) => {
  if (Array.isArray(filters.value[filterType])) {
    filters.value[filterType] = [];
  } else if (filterType === 'dateRange') {
    filters.value.dateRange = '全部时间';
    customDateRange.value = null;
  }
  emit('update:filters', { ...filters.value });
};

// 重置所有筛选器
const resetFilters = () => {
  filters.value = {
    categories: [],
    tags: [],
    dateRange: '全部时间',
    status: [],
    contentType: []
  };
  customDateRange.value = null;
  emit('update:filters', { ...filters.value });
};

// 应用筛选器
const applyFilters = () => {
  emit('update:filters', { ...filters.value });
};
</script>

<style scoped>
.filter-panel-container {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  padding: 16px;
}

.filter-panel-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 16px;
  color: var(--text-color-base);
}

.filter-section {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--divider-color);
  padding-bottom: 16px;
}

.filter-section:last-of-type {
  border-bottom: none;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.filter-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: var(--text-color-base);
}

.filter-content {
  margin-top: 8px;
}

.filter-item {
  margin-bottom: 6px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-count {
  font-size: 12px;
  color: var(--text-color-tertiary);
  background-color: var(--body-color);
  padding: 1px 6px;
  border-radius: 12px;
}

.time-filter {
  display: block;
  width: 100%;
}

.status-item {
  margin-bottom: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 2px;
}

.content-type-item {
  margin-bottom: 8px;
}

.content-type-icon {
  color: var(--text-color-secondary);
}

.filter-actions {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 20px;
}
</style>