<template>
  <div class="document-page">
    <!-- 顶部统计卡片 - 使用重构后的组件 -->
    <document-stats-cards
        :total-count="statisticsData.totalCount"
        :weekly-count="statisticsData.weeklyCount"
        :monthly-count="statisticsData.monthlyCount"
        :important-count="statisticsData.importantCount"
    />

    <!-- 搜索和筛选区域 -->
    <n-card class="search-filter-card mb-4" :bordered="false">
      <document-search-form @search="handleSearch" />
      <document-advanced-filter @filter="handleFilter" />
    </n-card>

    <!-- 文档列表工具栏 - 重新设计的部分 -->
    <div class="document-toolbar mb-3">
      <div class="toolbar-content">
        <div class="left-section">
          <div class="sort-control">
            <span class="sort-label">排序方式</span>
            <div class="sort-options">
              <div
                  v-for="option in sortOptionsGrouped.time"
                  :key="option.key"
                  class="sort-option"
                  :class="{ active: currentSort === option.key }"
                  @click="handleSort(option.key)"
              >
                <icon-font :type="getSortIcon(option.key)" :size="16" />
                <span>{{ option.label }}</span>
              </div>
            </div>
          </div>

          <n-divider vertical class="divider" />

          <div class="sort-control">
            <div class="sort-options">
              <div
                  v-for="option in sortOptionsGrouped.title"
                  :key="option.key"
                  class="sort-option"
                  :class="{ active: currentSort === option.key }"
                  @click="handleSort(option.key)"
              >
                <icon-font :type="getSortIcon(option.key)" :size="16" />
                <span>{{ option.label }}</span>
              </div>
            </div>
          </div>

          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button
                  circle
                  text
                  class="view-mode-toggle ml-4"
                  @click="toggleViewMode"
              >
                <icon-font :type="viewMode === 'grid' ? 'icon-grid' : 'icon-list'" :size="18" />
              </n-button>
            </template>
            {{ viewMode === 'grid' ? '网格视图' : '列表视图' }}
          </n-tooltip>
        </div>

        <div class="right-section">
          <n-button type="primary" @click="handleAddDocument" class="add-button">
            <template #icon>
              <icon-font type="icon-add-file" />
            </template>
            新增文档
          </n-button>
        </div>
      </div>
    </div>

    <!-- 文档卡片列表 -->
    <document-card-list
        :documents="filteredDocuments"
        :loading="loading"
        :view-mode="viewMode"
        @view="handleViewDocument"
        @edit="handleEditDocument"
        @delete="handleDeleteDocument"
        @download="handleDownloadDocument"
        @share="handleShareDocument"
        @star="handleStarDocument"
    />

    <!-- 分页 -->
    <div class="pagination-container flex justify-center mt-4">
      <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="totalDocuments"
          :page-sizes="[12, 24, 36, 48]"
          show-size-picker
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useMessage} from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'
import DocumentStatsCards from '@/components/document/DocumentStatsCards.vue'
import DocumentSearchForm from '@/components/document/DocumentSearchForm.vue'
import DocumentAdvancedFilter from '@/components/document/DocumentAdvancedFilter.vue'
import DocumentCardList from '@/components/document/DocumentCardList.vue'

// 路由和消息
const router = useRouter()
const message = useMessage()

// 视图模式
const viewMode = ref('grid') // grid或list

// 排序选项配置
const sortOptions = [
  {
    label: '最近创建',
    key: 'createdTime-desc',
    group: 'time'
  },
  {
    label: '最早创建',
    key: 'createdTime-asc',
    group: 'time'
  },
  {
    label: '最近更新',
    key: 'updatedTime-desc',
    group: 'time'
  },
  {
    label: '最早更新',
    key: 'updatedTime-asc',
    group: 'time'
  },
  {
    label: '按标题升序',
    key: 'title-asc',
    group: 'title'
  },
  {
    label: '按标题降序',
    key: 'title-desc',
    group: 'title'
  }
]

// 分组排序选项，便于UI渲染
const sortOptionsGrouped = computed(() => {
  return {
    time: sortOptions.filter(option => option.group === 'time'),
    title: sortOptions.filter(option => option.group === 'title')
  }
})

// 获取排序选项对应的图标
const getSortIcon = (key) => {
  if (key.includes('desc')) {
    return key.includes('title') ? 'icon-sort-alpha-desc' : 'icon-sort-desc'
  } else {
    return key.includes('title') ? 'icon-sort-alpha-asc' : 'icon-sort-asc'
  }
}

// 当前排序方式
const currentSort = ref('createdTime-desc')
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.key === currentSort.value)
  return option ? option.label : '最近创建'
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(12)
const totalDocuments = ref(0)

// 加载状态
const loading = ref(false)

// 统计数据 - 使用响应式对象管理统计信息
const statisticsData = reactive({
  totalCount: 0,
  weeklyCount: 0,
  monthlyCount: 0,
  importantCount: 0
})

// 搜索条件
const searchParams = reactive({
  keyword: '',
  dateRange: null,
  categories: [],
  tags: [],
  types: []
})

// 文档数据存储
const documents = ref([])

// 计算筛选后的文档列表
const filteredDocuments = computed(() => {
  // 在实际项目中，这里的筛选逻辑应该在后端处理
  // 这里仅做前端展示的分页处理
  return documents.value.slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value
  )
})

// 获取文档数据的异步函数
const fetchDocuments = async () => {
  loading.value = true
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 生成模拟文档数据
    const mockDocuments = generateMockDocuments()

    documents.value = mockDocuments
    totalDocuments.value = mockDocuments.length

    // 更新统计数据，这些计算在实际项目中应该由后端完成
    updateStatisticsData(mockDocuments)

  } catch (error) {
    console.error('获取文档数据失败:', error)
    message.error('获取文档数据失败')
  } finally {
    loading.value = false
  }
}

// 生成模拟文档数据的辅助函数
const generateMockDocuments = () => {
  const mockDocuments = []
  const docTypes = ['markdown', 'pdf', 'word', 'excel', 'ppt', 'text']
  const categories = ['前端技术', '后端开发', '数据库', '人工智能', '运维部署', '设计资源']
  const tags = ['Vue3', 'React', 'Java', 'Python', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'UI设计', '架构']

  for (let i = 1; i <= 100; i++) {
    const randomType = docTypes[Math.floor(Math.random() * docTypes.length)]
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]

    // 随机选择1-3个标签
    const docTags = []
    const tagCount = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < tagCount; j++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)]
      if (!docTags.includes(randomTag)) {
        docTags.push(randomTag)
      }
    }

    mockDocuments.push({
      id: i,
      title: `文档示例 ${i} - ${randomCategory}指南`,
      description: `这是一份关于${randomCategory}的详细文档，包含了完整的示例代码和说明，适合初学者和有经验的开发者参考。`,
      category: randomCategory,
      tags: docTags,
      type: randomType,
      fileSize: Math.floor(Math.random() * 10000) + 100, // kb
      createdTime: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 3600 * 1000),
      updatedTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 3600 * 1000),
      isImportant: Math.random() > 0.8,
      viewCount: Math.floor(Math.random() * 1000)
    })
  }

  return mockDocuments
}

// 更新统计数据的辅助函数
const updateStatisticsData = (docs) => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000)

  statisticsData.totalCount = docs.length
  statisticsData.weeklyCount = docs.filter(doc => doc.createdTime >= weekAgo).length
  statisticsData.monthlyCount = docs.filter(doc => doc.createdTime >= monthAgo).length
  statisticsData.importantCount = docs.filter(doc => doc.isImportant).length
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchDocuments()
})

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// 事件处理函数
const handleSearch = (params) => {
  // 更新搜索参数
  searchParams.keyword = params.keyword
  searchParams.dateRange = params.dateRange
  currentPage.value = 1
  // 重新获取数据
  fetchDocuments()
}

const handleFilter = (filters) => {
  // 更新筛选参数
  searchParams.categories = filters.categories
  searchParams.tags = filters.tags
  searchParams.types = filters.types
  currentPage.value = 1
  // 重新获取数据
  fetchDocuments()
}

const handleSort = (key) => {
  currentSort.value = key
  // 重新获取数据
  fetchDocuments()
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleAddDocument = () => {
  router.push('/document/create')
}

const handleViewDocument = (id) => {
  router.push(`/document/view/${id}`)
}

const handleEditDocument = (id) => {
  router.push(`/document/edit/${id}`)
}

const handleDeleteDocument = (id) => {
  // 实际项目中这里应该调用API进行删除
  message.success(`删除文档 ${id} 成功`)
  documents.value = documents.value.filter(doc => doc.id !== id)
  totalDocuments.value--
  // 重新计算统计数据
  updateStatisticsData(documents.value)
}

const handleDownloadDocument = (id) => {
  message.success(`文档 ${id} 已开始下载`)
}

const handleShareDocument = (id) => {
  message.success(`文档 ${id} 分享链接已复制到剪贴板`)
}

const handleStarDocument = (id, isStarred) => {
  // 更新文档星标状态
  const doc = documents.value.find(d => d.id === id)
  if (doc) {
    doc.isImportant = isStarred
    message.success(`${isStarred ? '标记' : '取消标记'}文档为重要文档`)
    // 重新计算统计数据
    updateStatisticsData(documents.value)
  }
}
</script>

<style scoped>
.document-page {
  padding: var(--content-padding);
}

.search-filter-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  transition: box-shadow 0.3s ease;
}

.search-filter-card:hover {
  box-shadow: var(--box-shadow-2);
}

/* 工具栏样式保持原有设计 */
.document-toolbar {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  overflow: hidden;
  position: relative;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  height: 56px;
}

.left-section {
  display: flex;
  align-items: center;
  height: 100%;
}

.sort-control {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 100%;
}

.sort-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-2);
  margin-right: 12px;
}

.sort-options {
  display: flex;
  gap: 2px;
}

.sort-option {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: var(--text-color-2);
}

.sort-option:hover {
  background-color: rgba(99, 102, 241, 0.08);
  color: var(--primary-color);
}

.sort-option.active {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-weight: 500;
}

.sort-option span {
  margin-left: 6px;
}

.divider {
  height: 24px;
  margin: 0 4px;
}

.view-mode-toggle {
  margin-left: 12px;
  color: var(--text-color-2);
  transition: color 0.2s ease;
}

.view-mode-toggle:hover {
  color: var(--primary-color);
}

.right-section {
  display: flex;
  align-items: center;
  padding-right: 12px;
}

.add-button {
  padding: 0 20px;
  height: 36px;
  border-radius: 18px;
  font-weight: 500;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.25);
}
</style>