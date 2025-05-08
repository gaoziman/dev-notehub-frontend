<template>
  <div class="search-results-container">
    <!-- 搜索结果页面头部 -->
    <div class="search-header">
      <div class="search-info">
        <h2 class="search-title">搜索结果: <span class="search-keyword">{{ searchKeyword }}</span></h2>
        <div class="search-meta">找到 {{ totalResults }} 条结果，用时 {{ searchTime }} 秒</div>
      </div>
      <div class="search-actions">
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-button class="action-btn" secondary circle @click="saveSearch">
              <template #icon>
                <n-icon>
                  <icon-font type="icon-shoucang" />
                </n-icon>
              </template>
            </n-button>
          </template>
          保存搜索
        </n-tooltip>
        <n-button type="primary" @click="reSearch">
          <template #icon>
            <n-icon>
              <icon-font type="icon-sousuo" />
            </n-icon>
          </template>
          重新搜索
        </n-button>
      </div>
    </div>

    <!-- 搜索结果主体内容 -->
    <div class="search-content">
      <!-- 左侧过滤面板 -->
      <div class="filter-panel">
        <search-filter-panel
            :categories="categories"
            :tags="tags"
            :selected-filters="selectedFilters"
            @update:filters="updateFilters"
        />
      </div>

      <!-- 右侧搜索结果展示区 -->
      <div class="results-panel">
        <!-- 工具栏：排序方式和视图切换 -->
        <div class="results-toolbar">
          <div class="sort-options">
            <span class="sort-label">排序方式:</span>
            <n-select
                v-model:value="sortOption"
                :options="sortOptions"
                size="small"
                style="width: 120px"
            />
          </div>

          <div class="display-options">
            <span class="display-label">显示:</span>
            <n-select
                v-model:value="displayOption"
                :options="displayOptions"
                size="small"
                style="width: 120px"
            />

            <div class="view-toggle">
              <n-button-group>
                <template v-for="view in viewModes" :key="view.value">
                  <n-tooltip placement="top">
                    <template #trigger>
                      <n-button
                          :type="currentView === view.value ? 'primary' : 'default'"
                          :ghost="currentView === view.value"
                          @click="currentView = view.value"
                      >
                        <template #icon>
                          <n-icon>
                            <icon-font :type="view.icon" />
                          </n-icon>
                        </template>
                      </n-button>
                    </template>
                    {{ view.label }}
                  </n-tooltip>
                </template>
              </n-button-group>
            </div>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div class="search-results">
          <!-- 详细视图 -->
          <template v-if="currentView === 'detailed'">
            <search-result-detailed
                v-for="(result, index) in displayResults"
                :key="index"
                :result="result"
                @toggle-favorite="toggleFavorite"
                @share="shareResult"
            />
          </template>


          <!-- 网格视图 -->
          <template v-else-if="currentView === 'grid'">
            <div class="grid-view">
              <search-result-grid
                  v-for="(result, index) in displayResults"
                  :key="index"
                  :result="result"
                  @toggle-favorite="toggleFavorite"
                  @share="shareResult"
              />
            </div>
          </template>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <n-pagination
              v-model:page="currentPage"
              :page-size="pageSize"
              :page-slot="7"
              :item-count="totalResults"
              show-size-picker
              :page-sizes="[10, 20, 30, 50]"
              show-quick-jumper
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
          />
        </div>

        <!-- 无搜索结果时的空状态 -->
        <div v-if="displayResults.length === 0" class="empty-results">
          <n-empty description="暂无搜索结果">
            <template #icon>
              <n-icon size="80" color="#e5e6eb">
                <icon-font type="icon-zanwushuju" />
              </n-icon>
            </template>
            <template #extra>
              <n-button type="primary" @click="reSearch">
                修改搜索条件
              </n-button>
            </template>
          </n-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SearchFilterPanel from '@/components/search/SearchFilterPanel.vue';
import SearchResultDetailed from '@/components/search/SearchResultDetailed.vue';
import SearchResultGrid from '@/components/search/SearchResultGrid.vue';

// 路由参数
const route = useRoute();
const router = useRouter();

// 搜索关键词
const searchKeyword = ref(route.query.keyword || 'Java 开发编程');
const searchTime = ref('0.18');
const totalResults = ref(32);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value));

// 视图模式
const currentView = ref('detailed');
const viewModes = [
  { label: '详细视图', value: 'detailed', icon: 'icon-xiangqing' },
  { label: '网格视图', value: 'grid', icon: 'icon-wangge' }
];

// 排序选项
const sortOption = ref('relevance');
const sortOptions = [
  { label: '相关度优先', value: 'relevance' },
  { label: '学习进度', value: 'progress' },
  { label: '最新创建', value: 'newest' },
  { label: '最近更新', value: 'updated' }
];

// 显示选项
const displayOption = ref('detailed');
const displayOptions = [
  { label: '详细视图', value: 'detailed' },
  { label: '仅标题', value: 'title' }
];

// 筛选选项
const selectedFilters = ref({
  categories: ['Java基础'],
  tags: ['#并发'],
  dateRange: '最近一周',
  status: ['进行中']
});

// 模拟的分类和标签数据
const categories = ref([
  { name: 'Java基础', count: 12 },
  { name: 'Spring系列', count: 8 },
  { name: '微服务', count: 5 },
  { name: '数据库', count: 4 },
  { name: '缓存', count: 3 }
]);

const tags = ref([
  { name: '#并发', count: 5 },
  { name: '#线程池', count: 3 },
  { name: '#性能优化', count: 4 },
  { name: '#JUC', count: 6 },
  { name: '#设计模式', count: 2 }
]);

// 模拟搜索结果数据
const searchResults = ref([
  {
    id: 1,
    type: 'document',
    title: 'Java多线程与并发编程',
    description: '详细讲解Java中的线程模型、线程安全、锁机制以及并发工具类的使用方法和最佳实践，包含大量代码示例和性能优化建议。适合有一定Java基础的开发者入学习。',
    tags: ['#并发', '#线程池', '#性能优化'],
    category: 'Java基础',
    progress: 75,
    updatedAt: '更新于 2天前',
    isFavorite: false,
    contentType: 'markdown'
  },
  {
    id: 2,
    type: 'document',
    title: 'Java开发编程实战指南',
    description: '全面介绍Java开发编程的核心原理和实战技巧，包括Java开发工具和工具链、程序安全的设计模式、高效开发数据操作以及实际案例分析，本文档详细讨论了Java开发中各个环节的最佳实践。',
    tags: ['#开发', '#JUC', '#性能优化'],
    category: 'Java基础',
    progress: 100,
    updatedAt: '更新于 1周前',
    isFavorite: true,
    contentType: 'markdown'
  },
  {
    id: 3,
    type: 'external',
    title: '深入理解Java开发系列: ConcurrentHashMap源码分析',
    description: '详细剖析Java并发包中重要的并发容器ConcurrentHashMap的实现原理、性能特点和内部机制，以及JDK 1.7到JDK 1.8的变化，分段锁设计与优化方向。',
    tags: ['#并发', '#容器', '#源码分析'],
    category: 'Java基础',
    progress: 60,
    updatedAt: '更新于 2周前',
    isFavorite: false,
    contentType: 'external',
    url: 'https://blog.csdn.net/user123456/article/java-concurrent-hashmap'
  },
  {
    id: 4,
    type: 'document',
    title: 'Spring框架中的并发处理',
    description: '分析Spring框架中并发处理的相关特性，包括ThreadPoolTaskExecutor、@Async注解、定时任务以及Spring整合Java并发框架的最佳实践。',
    tags: ['#Spring并发', '#并发框架', '#任务调度'],
    category: 'Spring系列',
    progress: 45,
    updatedAt: '更新于 1月前',
    isFavorite: false,
    contentType: 'markdown'
  },
  {
    id: 5,
    type: 'external',
    title: '微服务架构中的并发控制与限流',
    description: '探讨微服务架构中的并发控制策略，包括分布式锁设计、流量控制、服务降级以及基于Java的实现方案，结合Spring Cloud和Java开发工具的实战案例。',
    tags: ['#微服务并发', '#限流', '#Spring Cloud'],
    category: '微服务',
    progress: 0,
    updatedAt: '更新于 3周前',
    isFavorite: false,
    contentType: 'external',
    url: 'https://github.com/username/microservice-concurrency-example'
  },
  {
    id: 6,
    type: 'document',
    title: 'Java并发编程实战笔记',
    description: '《Java并发编程实战》一书的详细学习笔记和实践总结，包含并发基础知识、线程池使用、锁优化、并发容器以及实际案例分析。',
    tags: ['#并发', '#读书笔记', '#实战'],
    category: 'Java基础',
    progress: 88,
    updatedAt: '更新于 5天前',
    isFavorite: true,
    contentType: 'markdown'
  },
  {
    id: 7,
    type: 'document',
    title: 'Java NIO与异步编程模型',
    description: '深入探讨Java NIO的工作原理、Channel/Buffer/Selector的使用方法，以及基于NIO的异步编程模型和实际应用场景。',
    tags: ['#NIO', '#异步编程', '#性能优化'],
    category: 'Java基础',
    progress: 30,
    updatedAt: '更新于 2周前',
    isFavorite: false,
    contentType: 'markdown'
  },
  {
    id: 8,
    type: 'document',
    title: 'CompletableFuture详解与实战',
    description: '全面介绍Java 8引入的CompletableFuture API，包括异步任务编排、异常处理、组合操作以及在实际项目中的应用案例。',
    tags: ['#异步编程', '#Java 8', '#并发'],
    category: 'Java基础',
    progress: 65,
    updatedAt: '更新于 4天前',
    isFavorite: false,
    contentType: 'markdown'
  },
  {
    id: 9,
    type: 'document',
    title: 'Spring Boot中的异步处理机制',
    description: '详解Spring Boot框架中提供的异步处理能力，包括@Async注解、WebFlux响应式编程以及与传统并发模型的对比分析。',
    tags: ['#Spring Boot', '#异步', '#WebFlux'],
    category: 'Spring系列',
    progress: 50,
    updatedAt: '更新于 1周前',
    isFavorite: false,
    contentType: 'markdown'
  },
  {
    id: 10,
    type: 'external',
    title: 'Java虚拟机并发垃圾回收机制分析',
    description: '分析Java虚拟机中的并发垃圾回收算法，包括CMS、G1、ZGC等收集器的工作原理、适用场景以及调优策略。',
    tags: ['#JVM', '#垃圾回收', '#性能调优'],
    category: 'Java高级',
    progress: 40,
    updatedAt: '更新于 3周前',
    isFavorite: false,
    contentType: 'external',
    url: 'https://tech-blog.com/java-concurrent-gc-analysis'
  }
]);

// 根据当前页码和每页条数计算显示的结果
const displayResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return searchResults.value.slice(start, end);
});

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 处理每页数量变化
const handlePageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置为第一页
};

// 更新筛选条件
const updateFilters = (filters) => {
  selectedFilters.value = { ...filters };

  // 实现筛选逻辑
  applyFilters();
};

// 应用筛选逻辑
const applyFilters = () => {
  // 这里应该根据筛选条件过滤搜索结果
  // 简单模拟筛选逻辑
  const filteredResults = searchResults.value.filter(result => {
    // 检查分类
    if (selectedFilters.value.categories.length > 0 &&
        !selectedFilters.value.categories.includes(result.category)) {
      return false;
    }

    // 检查标签（至少匹配一个）
    if (selectedFilters.value.tags.length > 0 &&
        !result.tags.some(tag => selectedFilters.value.tags.includes(tag))) {
      return false;
    }

    return true;
  });

  // 更新结果数量
  totalResults.value = filteredResults.length;

  // 重置页码
  currentPage.value = 1;
};

// 收藏/取消收藏结果
const toggleFavorite = (resultId) => {
  const result = searchResults.value.find(item => item.id === resultId);
  if (result) {
    result.isFavorite = !result.isFavorite;
  }
};

// 分享结果
const shareResult = (resultId) => {
  // 实现分享功能
  console.log('分享结果:', resultId);
};

// 保存搜索
const saveSearch = () => {
  // 实现保存搜索功能
  console.log('保存搜索:', searchKeyword.value);
};

// 重新搜索 - 修复：将路径改为'/search'与AppHeader保持一致
const reSearch = () => {
  // 跳转到搜索页面
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value }
  });
};

// 监听路由变化，更新搜索关键词
watch(
    () => route.query.keyword,
    (newKeyword) => {
      if (newKeyword) {
        searchKeyword.value = newKeyword;
        // 可以在这里调用API获取新的搜索结果
      }
    }
);

// 页面加载时处理
onMounted(() => {
  // 初始化数据 - 这里可以调用API获取搜索结果
  // 如果是API调用，应该使用try-catch处理异常
  try {
    // 模拟API调用
    console.log('搜索关键词:', searchKeyword.value);
    // 在实际应用中，这里应该调用API获取搜索结果
    // const response = await api.search(searchKeyword.value);
    // searchResults.value = response.data.results;
    // totalResults.value = response.data.total;

    // 应用初始筛选条件
    applyFilters();
  } catch (error) {
    console.error('搜索失败:', error);
  }
});
</script>

<style scoped>
.search-results-container {
  padding: 8px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.search-title {
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 4px;
  color: var(--text-color-base);
}

.search-keyword {
  color: var(--primary-color);
}

.search-meta {
  font-size: 14px;
  color: var(--text-color-tertiary);
}

.search-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-content {
  display: flex;
  gap: 12px;
}

.filter-panel {
  width: 200px;
  flex-shrink: 0;
}

.results-panel {
  flex: 1;
  min-width: 0; /* 确保弹性项可以缩小到小于其内容尺寸 */
}

.results-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 12px;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
}

.sort-options,
.display-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label,
.display-label {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.view-toggle {
  margin-left: 12px;
}

.search-results {
  margin-bottom: 16px;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.empty-results {
  padding: 40px 0;
  text-align: center;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .search-content {
    flex-direction: column;
  }

  .filter-panel {
    width: 100%;
    margin-bottom: 12px;
  }
}

@media screen and (max-width: 768px) {
  .results-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .display-options {
    width: 100%;
    justify-content: space-between;
  }

  .search-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>