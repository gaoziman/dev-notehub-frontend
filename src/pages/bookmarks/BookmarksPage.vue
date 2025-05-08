<template>
  <div class="bookmarks-container">
    <!-- 顶部统计卡片 -->
    <BookmarkStatistics :statistics="statistics" />

    <div class="content-wrapper">
      <!-- 左侧边栏 -->
      <BookmarkSidebar
          :platforms="platforms"
          :categories="categories"
          :tags="popularTags"
          :selectedPlatform="selectedPlatform"
          :selectedCategory="selectedCategory"
          :selectedTag="selectedTag"
          @update:platform="handlePlatformChange"
          @update:category="handleCategoryChange"
          @update:tag="handleTagChange"
      />

      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 搜索和基础筛选 -->
        <BookmarkFilter
            v-model:search="searchQuery"
            :view-mode="viewMode"
            :sort-type="sortType"
            @update:view-mode="viewMode = $event"
            @update:sort-type="sortType = $event"
            @advanced-filter="showAdvancedFilter = true"
            @add-bookmark="showAddBookmarkModal = true"
            @import-bookmarks="showImportModal = true"
            @export-bookmarks="exportBookmarks"
            @batch-edit="batchEditMode = !batchEditMode"
        />

        <!-- 标签页 -->
        <n-tabs v-model:value="activeTab" type="line" animated>
          <n-tab-pane name="all" tab="所有书签">
            <!-- 列表/卡片视图 -->
            <BookmarkList
                v-if="viewMode === 'list'"
                :bookmarks="filteredBookmarks"
                :batch-mode="batchEditMode"
                :selected-bookmarks="selectedBookmarks"
                @update:selected="handleSelectionChange"
                @edit="handleEdit"
                @delete="handleDelete"
            />
            <BookmarkGrid
                v-else
                :bookmarks="filteredBookmarks"
                :batch-mode="batchEditMode"
                :selected-bookmarks="selectedBookmarks"
                @update:selected="handleSelectionChange"
                @edit="handleEdit"
                @delete="handleDelete"
            />

            <!-- 分页 -->
            <div class="pagination-container">
              <n-pagination
                  v-model:page="currentPage"
                  :page-count="totalPages"
                  :page-size="pageSize"
                  :page-slot="5"
                  show-size-picker
                  :page-sizes="[10, 20, 50]"
                  @update:page-size="handlePageSizeChange"
              />
            </div>
          </n-tab-pane>

          <n-tab-pane name="recent" tab="最近添加">
            <!-- 最近添加内容 -->
            <BookmarkList
                v-if="viewMode === 'list'"
                :bookmarks="recentBookmarks"
                :batch-mode="batchEditMode"
                :selected-bookmarks="selectedBookmarks"
                @update:selected="handleSelectionChange"
                @edit="handleEdit"
                @delete="handleDelete"
            />
            <BookmarkGrid
                v-else
                :bookmarks="recentBookmarks"
                :batch-mode="batchEditMode"
                :selected-bookmarks="selectedBookmarks"
                @update:selected="handleSelectionChange"
                @edit="handleEdit"
                @delete="handleDelete"
            />
          </n-tab-pane>

          <n-tab-pane name="frequent" tab="常用书签">
            <!-- 常用书签内容 -->
            <BookmarkList
                v-if="viewMode === 'list'"
                :bookmarks="frequentBookmarks"
                :batch-mode="batchEditMode"
                :selected-bookmarks="selectedBookmarks"
                @update:selected="handleSelectionChange"
                @edit="handleEdit"
                @delete="handleDelete"
            />
            <BookmarkGrid
                v-else
                :bookmarks="frequentBookmarks"
                :batch-mode="batchEditMode"
                :selected-bookmarks="selectedBookmarks"
                @update:selected="handleSelectionChange"
                @edit="handleEdit"
                @delete="handleDelete"
            />
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

    <!-- 高级筛选弹窗 -->
    <BookmarkAdvancedFilter
        v-model:show="showAdvancedFilter"
        :platforms="platforms"
        :categories="categories"
        :tags="allTags"
        :programming-languages="programmingLanguages"
        :frameworks="frameworks"
        :databases="databases"
        :filter-conditions="advancedFilterConditions"
        @apply="applyAdvancedFilters"
        @reset="resetAdvancedFilters"
        @save-preset="saveFilterPreset"
    />

    <!-- 添加书签模态框 -->
    <n-modal
        v-model:show="showAddBookmarkModal"
        preset="card"
        style="width: 800px; max-width: 95vw;"
        :bordered="false"
        :title="null"
        :close-on-esc="true"
    >
      <BookmarkForm
          :categories="categories"
          :platforms="platforms"
          :tags="allTags"
          @submit="addBookmark"
          @cancel="showAddBookmarkModal = false"
      />
    </n-modal>

    <!-- 编辑书签模态框 -->
    <n-modal
        v-model:show="showEditBookmarkModal"
        preset="card"
        style="width: 800px; max-width: 95vw;"
        :bordered="false"
        :title="null"
        :close-on-esc="true"
    >
      <BookmarkForm
          v-if="currentEditingBookmark"
          :bookmark="currentEditingBookmark"
          :categories="categories"
          :platforms="platforms"
          :tags="allTags"
          @submit="updateBookmark"
          @cancel="showEditBookmarkModal = false"
      />
    </n-modal>

    <!-- 导入书签组件 -->
    <BookmarkImport
        v-model:show="showImportModal"
        :categories="categories"
        :popularTags="allTags.slice(0, 10)"
        @import="handleImportBookmarks"
    />

    <!-- 批量操作工具栏 -->
    <div v-if="batchEditMode && selectedBookmarks.length > 0" class="batch-toolbar">
      <span>已选择 {{ selectedBookmarks.length }} 项</span>
      <div class="batch-actions">
        <n-button size="small" @click="batchAddTags">添加标签</n-button>
        <n-button size="small" @click="batchChangeCategory">移动分类</n-button>
        <n-button size="small" type="error" @click="batchDelete">删除</n-button>
        <n-button size="small" @click="batchEditMode = false">取消</n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useMessage } from 'naive-ui';
import BookmarkStatistics from '@/components/bookmarks/BookmarkStatistics.vue';
import BookmarkFilter from '@/components/bookmarks/BookmarkFilter.vue';
import BookmarkList from '@/components/bookmarks/BookmarkList.vue';
import BookmarkGrid from '@/components/bookmarks/BookmarkGrid.vue';
import BookmarkSidebar from '@/components/bookmarks/BookmarkSidebar.vue';
import BookmarkAdvancedFilter from '@/components/bookmarks/BookmarkAdvancedFilter.vue';
import BookmarkForm from '@/components/bookmarks/BookmarkForm.vue';
import BookmarkImport from '@/components/bookmarks/BookmarkImport.vue';
import IconFont from "@/components/common/IconFont.vue";

// 通知消息
const message = useMessage();

// 基础状态
const searchQuery = ref('');
const viewMode = ref('list'); // 'list' 或 'grid'
const sortType = ref('recent'); // 'recent', 'title', 'visits'
const activeTab = ref('all');
const currentPage = ref(1);
const pageSize = ref(20);
const batchEditMode = ref(false);
const selectedBookmarks = ref([]);

// 弹窗状态
const showAdvancedFilter = ref(false);
const showAddBookmarkModal = ref(false);
const showEditBookmarkModal = ref(false);
const showImportModal = ref(false);
const currentEditingBookmark = ref(null);

// 筛选状态
const selectedPlatform = ref('all');
const selectedCategory = ref('all');
const selectedTag = ref('');
const advancedFilterConditions = ref({
  platforms: [],
  categories: [],
  tags: [],
  programmingLanguages: [],
  frameworks: [],
  databases: [],
  dateRange: null
});

// 模拟数据 - 实际应用中应从API获取
const statistics = ref({
  total: 246,
  recent: 18,
  frequent: 57,
  categorized: 215
});

// 平台列表
const platforms = ref([
  {id: 'github', name: 'GitHub', icon: 'icon-github'},
  {id: 'juejin', name: '掘金', icon: 'icon-juejin'},
  {id: 'zhihu', name: '知乎', icon: 'icon-zhihu'},
  {id: 'csdn', name: 'CSDN', icon: 'icon-csdn'},
  {id: 'stackoverflow', name: 'Stack Overflow', icon: 'icon-stackoverflow'},
  {id: 'medium', name: 'Medium', icon: 'icon-medium'}
]);

// 分类列表
const categories = ref([
  {id: 'frontend', name: '前端技术'},
  {id: 'backend', name: '后端开发'},
  {id: 'devops', name: 'DevOps'},
  {id: 'design', name: '设计资源'},
  {id: 'learning', name: '学习资料'},
  {id: 'tools', name: '实用工具'}
]);

// 标签列表
const allTags = ref([
  'Vue', 'React', 'Angular', 'JavaScript', 'TypeScript', 'CSS', 'HTML',
  'Java', 'Spring', 'Python', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
  'UI/UX', 'Figma', 'Design System', 'Database', 'MySQL', 'MongoDB',
  'Redis', 'AWS', 'Azure', 'Google Cloud', 'Performance', 'Security'
]);

// 常用标签
const popularTags = computed(() => {
  return allTags.value.slice(0, 10);
});

// 编程语言列表
const programmingLanguages = ref([
  'JavaScript', 'TypeScript', 'Java', 'Python', 'Go', 'Rust', 'C++', 'PHP', 'C#'
]);

// 框架列表
const frameworks = ref([
  'Vue', 'React', 'Angular', 'Spring', 'Django', 'Express', 'Laravel', 'Flask'
]);

// 数据库列表
const databases = ref([
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'ElasticSearch', 'SQLite'
]);

// 模拟书签数据 - 实际应用中应从API获取
const bookmarks = ref([
  {
    id: 1,
    title: 'Vue3组合式API完全指南',
    url: 'https://vuejs.org/guide/extras/composition-api-faq.html',
    description: '详细介绍Vue3组合式API的使用方法和最佳实践',
    platform: 'github',
    icon: 'https://github.com/favicon.ico',
    category: 'frontend',
    tags: ['Vue', 'JavaScript', 'Frontend'],
    visits: 32,
    createdAt: '2024-04-15T10:30:00Z',
    lastVisited: '2024-05-02T16:45:00Z'
  },
  {
    id: 2,
    title: 'TypeScript高级类型系统详解',
    url: 'https://www.typescriptlang.org/docs/handbook/advanced-types.html',
    description: '深入理解TypeScript的类型系统，掌握高级类型特性',
    platform: 'juejin',
    icon: 'https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/static/favicons/favicon-32x32.png',
    category: 'frontend',
    tags: ['TypeScript', 'JavaScript', 'Frontend'],
    visits: 45,
    createdAt: '2024-03-24T14:20:00Z',
    lastVisited: '2024-05-05T09:15:00Z'
  },
  {
    id: 3,
    title: 'SpringBoot微服务架构实战',
    url: 'https://spring.io/microservices',
    description: '使用SpringBoot构建可扩展的微服务架构',
    platform: 'csdn',
    icon: 'https://g.csdnimg.cn/static/logo/favicon32.ico',
    category: 'backend',
    tags: ['Java', 'Spring', 'Microservices', 'Backend'],
    visits: 27,
    createdAt: '2024-04-02T11:35:00Z',
    lastVisited: '2024-05-01T13:20:00Z'
  },
  {
    id: 4,
    title: 'Docker容器化应用部署指南',
    url: 'https://docs.docker.com/get-started/',
    description: 'Docker入门到精通完全教程',
    platform: 'zhihu',
    icon: 'https://static.zhihu.com/heifetz/favicon.ico',
    category: 'devops',
    tags: ['Docker', 'DevOps', 'Containers'],
    visits: 56,
    createdAt: '2024-02-15T09:45:00Z',
    lastVisited: '2024-05-06T10:30:00Z'
  },
  {
    id: 5,
    title: 'React Hooks深入解析',
    url: 'https://reactjs.org/docs/hooks-intro.html',
    description: '全面讲解React Hooks的使用方法和原理',
    platform: 'github',
    icon: 'https://github.com/favicon.ico',
    category: 'frontend',
    tags: ['React', 'JavaScript', 'Frontend'],
    visits: 38,
    createdAt: '2024-03-18T16:50:00Z',
    lastVisited: '2024-05-03T14:25:00Z'
  },
  // 添加更多模拟数据...
]);

// 根据当前筛选条件过滤书签
const filteredBookmarks = computed(() => {
  let result = bookmarks.value;

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query)
    );
  }

  // 平台筛选
  if (selectedPlatform.value !== 'all') {
    result = result.filter(bookmark => bookmark.platform === selectedPlatform.value);
  }

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(bookmark => bookmark.category === selectedCategory.value);
  }

  // 标签筛选
  if (selectedTag.value) {
    result = result.filter(bookmark =>
        bookmark.tags.some(tag => tag.toLowerCase() === selectedTag.value.toLowerCase())
    );
  }

  // 高级筛选
  if (advancedFilterConditions.value.platforms.length > 0) {
    result = result.filter(bookmark =>
        advancedFilterConditions.value.platforms.includes(bookmark.platform)
    );
  }

  if (advancedFilterConditions.value.categories.length > 0) {
    result = result.filter(bookmark =>
        advancedFilterConditions.value.categories.includes(bookmark.category)
    );
  }

  if (advancedFilterConditions.value.tags.length > 0) {
    result = result.filter(bookmark =>
        advancedFilterConditions.value.tags.some(tag =>
            bookmark.tags.includes(tag)
        )
    );
  }

  if (advancedFilterConditions.value.programmingLanguages.length > 0) {
    result = result.filter(bookmark =>
        advancedFilterConditions.value.programmingLanguages.some(lang =>
            bookmark.tags.includes(lang)
        )
    );
  }

  if (advancedFilterConditions.value.frameworks.length > 0) {
    result = result.filter(bookmark =>
        advancedFilterConditions.value.frameworks.some(framework =>
            bookmark.tags.includes(framework)
        )
    );
  }

  if (advancedFilterConditions.value.databases.length > 0) {
    result = result.filter(bookmark =>
        advancedFilterConditions.value.databases.some(db =>
            bookmark.tags.includes(db)
        )
    );
  }

  if (advancedFilterConditions.value.dateRange) {
    const [startDate, endDate] = advancedFilterConditions.value.dateRange;
    result = result.filter(bookmark => {
      const createdDate = new Date(bookmark.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });
  }

  // 排序
  result = result.sort((a, b) => {
    if (sortType.value === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortType.value === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortType.value === 'visits') {
      return b.visits - a.visits;
    }
    return 0;
  });

  return result;
});

// 最近添加的书签
const recentBookmarks = computed(() => {
  return [...bookmarks.value]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20); // 只显示最近20项
});

// 常用书签
const frequentBookmarks = computed(() => {
  return [...bookmarks.value]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 20); // 只显示访问最多的20项
});

// 分页相关计算
const totalPages = computed(() => {
  return Math.ceil(filteredBookmarks.value.length / pageSize.value);
});

const paginatedBookmarks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBookmarks.value.slice(start, end);
});

// 事件处理方法
function handlePlatformChange(platform) {
  selectedPlatform.value = platform;
  currentPage.value = 1;
}

function handleCategoryChange(category) {
  selectedCategory.value = category;
  currentPage.value = 1;
}

function handleTagChange(tag) {
  selectedTag.value = tag;
  currentPage.value = 1;
}

function handlePageSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1;
}

function handleSelectionChange(selected) {
  selectedBookmarks.value = selected;
}

function handleEdit(bookmark) {
  currentEditingBookmark.value = {...bookmark};
  showEditBookmarkModal.value = true;
}

function handleDelete(bookmarkId) {
  // 实际应用中应调用API删除书签
  bookmarks.value = bookmarks.value.filter(item => item.id !== bookmarkId);
  message.success('书签已删除');
}

function applyAdvancedFilters(filters) {
  advancedFilterConditions.value = {...filters};
  showAdvancedFilter.value = false;
  currentPage.value = 1;
}

function resetAdvancedFilters() {
  advancedFilterConditions.value = {
    platforms: [],
    categories: [],
    tags: [],
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    dateRange: null
  };
  currentPage.value = 1;
}

function saveFilterPreset(presetName) {
  // 实际应用中应将预设保存到数据库或本地存储
  message.success(`筛选条件已保存为"${presetName}"`);
}

function addBookmark(bookmarkData) {
  // 实际应用中应调用API添加书签
  const newBookmark = {
    id: bookmarks.value.length + 1,
    ...bookmarkData,
    visits: 0,
    createdAt: new Date().toISOString(),
    lastVisited: null
  };

  bookmarks.value.push(newBookmark);
  showAddBookmarkModal.value = false;
  message.success('书签添加成功');
}

function updateBookmark(bookmarkData) {
  // 实际应用中应调用API更新书签
  const index = bookmarks.value.findIndex(item => item.id === bookmarkData.id);
  if (index !== -1) {
    bookmarks.value[index] = {...bookmarks.value[index], ...bookmarkData};
    message.success('书签更新成功');
  }
  showEditBookmarkModal.value = false;
}

function handleImportBookmarks(data) {
  // 处理导入的书签数据
  const {bookmarks: importedBookmarks, options} = data;

  // 将导入的书签添加到书签列表
  importedBookmarks.forEach(bookmark => {
    // 检查是否已存在相同URL的书签
    const existingIndex = bookmarks.value.findIndex(item => item.url === bookmark.url);

    if (existingIndex !== -1 && options.detectDuplicates) {
      // 更新现有书签
      bookmarks.value[existingIndex] = {
        ...bookmarks.value[existingIndex],
        ...bookmark,
        lastUpdated: new Date().toISOString()
      };
    } else {
      // 添加新书签
      bookmarks.value.push({
        id: bookmarks.value.length + 1,
        ...bookmark,
        visits: 0,
        createdAt: bookmark.createdAt || new Date().toISOString(),
        lastVisited: null
      });
    }
  });

  // 更新统计信息
  updateStatistics();

  message.success(`成功导入 ${importedBookmarks.length} 个书签`);
}

function exportBookmarks() {
  // 实际应用中应生成HTML文件并提供下载
  message.success('书签导出成功');
}

function batchAddTags() {
  // 实现批量添加标签的逻辑
  message.info('批量添加标签功能');
}

function batchChangeCategory() {
  // 实现批量更改分类的逻辑
  message.info('批量更改分类功能');
}

function batchDelete() {
  // 实现批量删除的逻辑
  const idsToDelete = selectedBookmarks.value;
  bookmarks.value = bookmarks.value.filter(item => !idsToDelete.includes(item.id));
  selectedBookmarks.value = [];
  message.success(`已删除${idsToDelete.length}个书签`);
}

// 更新统计信息
function updateStatistics() {
  // 计算最近添加的书签数量（本周添加）
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentCount = bookmarks.value.filter(
      bookmark => new Date(bookmark.createdAt) >= oneWeekAgo
  ).length;

  // 计算已分类的书签数量
  const categorizedCount = bookmarks.value.filter(
      bookmark => bookmark.category
  ).length;

  // 更新统计数据
  statistics.value = {
    total: bookmarks.value.length,
    recent: recentCount,
    frequent: bookmarks.value.filter(bookmark => bookmark.visits > 5).length,
    categorized: categorizedCount
  };
}

// 页面加载时获取数据
onMounted(() => {
  // 实际应用中应从API获取数据
  console.log('书签管理页面已加载');
});

// 监听标签页切换重置分页
watch(activeTab, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.bookmarks-container {
  width: 100%;
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  padding: var(--content-padding);
  background-color: var(--body-color);
}

.content-wrapper {
  display: flex;
  margin-top: 16px;
  gap: 16px;
}

.main-content {
  flex: 1;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  padding: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.batch-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 16px;
  background-color: var(--card-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.batch-actions {
  display: flex;
  gap: 8px;
}
</style>