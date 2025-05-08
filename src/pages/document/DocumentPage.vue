<template>
  <div class="document-page">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-left">
        <div class="icon-wrapper">
          <icon-font type="icon-wendang1" :size="32" />
        </div>
        <div class="header-info">
          <h1 class="page-title">文档管理</h1>
          <p class="page-desc">管理和组织您的所有学习文档</p>
        </div>
      </div>
      <div class="header-actions">
        <n-button type="primary" size="medium" @click="navigateToUpload">
          <template #icon>
            <icon-font type="icon-shangchuan" />
          </template>
          上传文档
        </n-button>
        <n-button type="default" size="medium" @click="navigateToCreate">
          <template #icon>
            <icon-font type="icon-xinjian" />
          </template>
          新建文档
        </n-button>
        <n-button-group>
          <n-tooltip trigger="hover" placement="top" :delay="500">
            <template #trigger>
              <n-button @click="refreshDocuments">
                <template #icon>
                  <icon-font type="icon-shuaxin" />
                </template>
              </n-button>
            </template>
            刷新
          </n-tooltip>
          <n-tooltip trigger="hover" placement="top" :delay="500">
            <template #trigger>
              <n-button @click="showBatchActions = !showBatchActions">
                <template #icon>
                  <icon-font type="icon-caozuo" />
                </template>
              </n-button>
            </template>
            批量操作
          </n-tooltip>
        </n-button-group>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <!-- 文档总数卡片 -->
      <div class="stat-card blue-card">
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">文档总数</h3>
            <div class="badge positive">
              <icon-font type="icon-shangsheng" :size="14" />
              <span>{{ documentStats.totalChange }}</span>
            </div>
          </div>

          <div class="card-value">{{ documentStats.total }}</div>

          <div class="card-info-text">较上月增加</div>

          <div class="icon-bg">
            <icon-font type="icon-wendang1" :size="60" />
          </div>
        </div>

        <div class="card-footer">
          <div class="progress-label">
            <span>上传进度</span>
            <span>{{ Math.round((documentStats.total / 200) * 100) }}%</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar" :style="{ width: `${Math.min(Math.round((documentStats.total / 200) * 100), 100)}%` }"></div>
          </div>
        </div>
      </div>

      <!-- 最近添加卡片 -->
      <div class="stat-card green-card">
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">最近添加</h3>
            <div class="badge positive">
              <icon-font type="icon-shangsheng" :size="14" />
              <span>{{ documentStats.recentChange }}</span>
            </div>
          </div>

          <div class="card-value">{{ documentStats.recent }}</div>

          <div class="card-info-text">本周新增文档</div>

          <div class="icon-bg">
            <icon-font type="icon-xinzeng" :size="60" />
          </div>
        </div>

        <div class="card-footer">
          <div class="tag-container">
            <div class="tag blue-tag">Vue (5)</div>
            <div class="tag teal-tag">React (3)</div>
            <div class="tag amber-tag">其他 (16)</div>
          </div>
        </div>
      </div>

      <!-- 已阅文档卡片 -->
      <div class="stat-card amber-card">
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">已阅文档</h3>
            <div class="badge positive">
              <icon-font type="icon-shangsheng" :size="14" />
              <span>{{ documentStats.readChange }}</span>
            </div>
          </div>

          <div class="card-value">{{ documentStats.read }}</div>

          <div class="card-info-text">阅读完成率 {{ Math.round((documentStats.read / documentStats.total) * 100) }}%</div>

          <div class="icon-bg">
            <icon-font type="icon-yuedu" :size="60" />
          </div>
        </div>

        <div class="card-footer">
          <div class="progress-label">
            <span>本月阅读目标</span>
            <span>{{ documentStats.read }}/100</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar" :style="{ width: `${Math.min(documentStats.read, 100)}%` }"></div>
          </div>
        </div>
      </div>

      <!-- 重要文档卡片 -->
      <div class="stat-card red-card">
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">标记重要</h3>
            <div class="badge positive">
              <icon-font type="icon-shangsheng" :size="14" />
              <span>{{ documentStats.importantChange }}</span>
            </div>
          </div>

          <div class="card-value">{{ documentStats.important }}</div>

          <div class="card-info-text">{{ Math.round((documentStats.important / documentStats.total) * 100) }}% 的文档被标记</div>

          <div class="icon-bg">
            <icon-font type="icon-zhongyao" :size="60" />
          </div>
        </div>

        <div class="card-footer">
          <button class="card-action-button" @click="viewImportantDocs">
            <icon-font type="icon-filter" :size="14" />
            <span>筛选重要文档</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 改进的搜索和筛选区域 -->
    <div class="main-content-container">
      <!-- 搜索组件 -->
      <improved-document-search-bar
          v-model:keyword="searchKeyword"
          @search="handleSearch"
          @advanced-search="handleAdvancedSearch"
      />

      <!-- 筛选组件 -->
      <improved-document-filter-bar
          v-model:categories="selectedCategories"
          v-model:tags="selectedTags"
          v-model:types="selectedTypes"
          v-model:platforms="selectedPlatforms"
          @filter="handleFilter"
      />
    </div>

    <!-- 批量操作工具栏（条件渲染） -->
    <div v-if="showBatchActions" class="batch-action-bar">
      <div class="flex items-center">
        <n-checkbox :checked="allSelected" :indeterminate="someSelected" @update:checked="toggleSelectAll">
          全选
        </n-checkbox>
        <span class="ml-2 text-tertiary" v-if="selectedDocumentIds.length > 0">
          已选择 {{ selectedDocumentIds.length }} 项
        </span>
      </div>
      <div class="flex gap-2">
        <n-button @click="batchAddTags">
          <template #icon>
            <icon-font type="icon-biaoqian" />
          </template>
          添加标签
        </n-button>
        <n-button @click="batchMove">
          <template #icon>
            <icon-font type="icon-yidong" />
          </template>
          移动分类
        </n-button>
        <n-button type="error" @click="confirmBatchDelete">
          <template #icon>
            <icon-font type="icon-shanchu" />
          </template>
          删除文档
        </n-button>
      </div>
    </div>

    <!-- 视图切换与排序 -->
    <div class="view-controls">
      <div class="flex items-center">
        <document-view-switch v-model:viewMode="viewMode" />
        <span class="ml-4 text-tertiary">共 {{ filteredDocuments.length }} 个文档</span>
      </div>
      <n-select
          v-model:value="sortOption"
          :options="sortOptions"
          size="small"
          placeholder="排序方式"
          style="width: 150px"
      />
    </div>

    <!-- 文档展示区域 -->
    <document-card-view
        v-if="viewMode === 'card'"
        :documents="displayedDocuments"
        :loading="loading"
        :selected-ids="selectedDocumentIds"
        @toggle-select="toggleSelectDocument"
        @view="viewDocument"
        @edit="editDocument"
        @delete="confirmDeleteDocument"
    />

    <document-list-view
        v-else
        :documents="displayedDocuments"
        :loading="loading"
        :selected-ids="selectedDocumentIds"
        @toggle-select="toggleSelectDocument"
        @view="viewDocument"
        @edit="editDocument"
        @delete="confirmDeleteDocument"
    />

    <!-- 分页 -->
    <div class="pagination-container">
      <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="filteredDocuments.length"
          :page-sizes="[12, 24, 48, 96]"
          show-size-picker
          show-quick-jumper
      />
    </div>

    <!-- 空状态展示 -->
    <n-empty
        v-if="!loading && filteredDocuments.length === 0"
        description="暂无文档"
        class="empty-state"
    >
      <template #extra>
        <n-button type="primary" @click="navigateToUpload">上传文档</n-button>
        <n-button class="ml-2" @click="navigateToCreate">新建文档</n-button>
      </template>
    </n-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import DocumentViewSwitch from '@/components/document/DocumentViewSwitch.vue'
import DocumentCardView from '@/components/document/DocumentCardView.vue'
import DocumentListView from '@/components/document/DocumentListView.vue'
import ImprovedDocumentSearchBar from '@/components/document/DocumentSearchBar.vue'
import ImprovedDocumentFilterBar from '@/components/document/DocumentFilterBar.vue'

const router = useRouter()
const message = useMessage()

// 统计数据
const documentStats = ref({
  total: 127,
  totalChange: 12,
  recent: 24,
  recentChange: 8,
  read: 76,
  readChange: 5,
  important: 43,
  importantChange: 7
})

// 视图控制状态
const viewMode = ref('card') // 'card' 或 'list'
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(24)
const showBatchActions = ref(false)

// 筛选与搜索状态
const searchKeyword = ref('')
const searchDateRange = ref(null)
const searchAdvancedOptions = ref(null)
const selectedCategories = ref([])
const selectedTags = ref([])
const selectedTypes = ref([])
const selectedPlatforms = ref([])

// 排序选项
const sortOption = ref('recent')
const sortOptions = [
  { label: '最近添加', value: 'recent' },
  { label: '最近更新', value: 'updated' },
  { label: '最多访问', value: 'visits' },
  { label: '名称排序', value: 'name' },
  { label: '创建时间', value: 'created' }
]

// 选择状态
const selectedDocumentIds = ref([])
const allSelected = computed(() =>
    selectedDocumentIds.value.length > 0 && selectedDocumentIds.value.length === displayedDocuments.value.length
)
const someSelected = computed(() =>
    selectedDocumentIds.value.length > 0 && selectedDocumentIds.value.length < displayedDocuments.value.length
)

// 模拟文档数据
const documents = ref([
  {
    id: 1,
    title: 'Vue3 组合式API最佳实践',
    description: '详细介绍Vue3组合式API的使用技巧与最佳实践方案。',
    type: 'markdown',
    category: 'Vue',
    tags: ['前端', 'Vue3', '组合式API'],
    platform: 'github',
    createTime: '2024-02-15',
    updateTime: '2024-04-20',
    visits: 156,
    starred: true
  },
  {
    id: 2,
    title: 'JavaScript异步编程精讲',
    description: '从Promise到async/await，全面解析JavaScript异步编程范式。',
    type: 'pdf',
    category: 'JavaScript',
    tags: ['前端', 'JavaScript', '异步编程'],
    platform: 'juejin',
    createTime: '2024-03-22',
    updateTime: '2024-04-18',
    visits: 189,
    starred: false
  },
  {
    id: 3,
    title: 'TypeScript高级类型体操',
    description: '深入TypeScript类型系统，实现复杂的类型推导和转换。',
    type: 'markdown',
    category: 'TypeScript',
    tags: ['前端', 'TypeScript', '类型编程'],
    platform: 'github',
    createTime: '2024-04-10',
    updateTime: '2024-05-01',
    visits: 120,
    starred: true
  },
  {
    id: 4,
    title: 'Vite构建优化与插件开发',
    description: '探索Vite的构建优化技巧和自定义插件开发方法。',
    type: 'markdown',
    category: 'Tools',
    tags: ['前端', 'Vite', '构建工具'],
    platform: 'csdn',
    createTime: '2024-03-05',
    updateTime: '2024-04-15',
    visits: 78,
    starred: false
  },
  {
    id: 5,
    title: 'React性能优化实战指南',
    description: '全面解析React应用性能优化的关键技术和实践方法。',
    type: 'pdf',
    category: 'React',
    tags: ['前端', 'React', '性能优化'],
    platform: 'juejin',
    createTime: '2024-01-20',
    updateTime: '2024-03-18',
    visits: 210,
    starred: true
  },
  {
    id: 6,
    title: 'Node.js微服务架构设计',
    description: '基于Node.js实现可扩展的微服务架构设计与最佳实践。',
    type: 'markdown',
    category: 'Node.js',
    tags: ['后端', 'Node.js', '微服务'],
    platform: 'github',
    createTime: '2024-02-28',
    updateTime: '2024-04-25',
    visits: 165,
    starred: false
  },
  {
    id: 7,
    title: 'CSS动画与交互设计',
    description: '探索现代CSS动画技术与交互设计模式。',
    type: 'html',
    category: 'CSS',
    tags: ['前端', 'CSS', '动画'],
    platform: 'juejin',
    createTime: '2024-03-15',
    updateTime: '2024-04-28',
    visits: 145,
    starred: true
  },
  {
    id: 8,
    title: 'Vue3状态管理进阶：Pinia详解',
    description: '深入解析Pinia的设计理念、使用方法与最佳实践。',
    type: 'markdown',
    category: 'Vue',
    tags: ['前端', 'Vue3', 'Pinia', '状态管理'],
    platform: 'csdn',
    createTime: '2024-04-05',
    updateTime: '2024-05-02',
    visits: 98,
    starred: false
  }
])

// 计算属性：过滤后的文档列表
const filteredDocuments = computed(() => {
  let result = [...documents.value]

  // 基本关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(doc =>
        doc.title.toLowerCase().includes(keyword) ||
        doc.description.toLowerCase().includes(keyword) ||
        doc.category.toLowerCase().includes(keyword) ||
        doc.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 高级搜索选项
  if (searchAdvancedOptions.value) {
    const options = searchAdvancedOptions.value

    // 标题筛选
    if (options.title) {
      result = result.filter(doc =>
          doc.title.toLowerCase().includes(options.title.toLowerCase())
      )
    }

    // 内容筛选
    if (options.content) {
      result = result.filter(doc =>
          doc.description.toLowerCase().includes(options.content.toLowerCase())
      )
    }

    // 作者筛选
    if (options.authors && options.authors.length) {
      // 模拟作者筛选逻辑
      if (options.authors.includes('me')) {
        // 筛选自己创建的文档（示例逻辑）
        result = result.filter(doc => doc.platform !== 'system')
      }
    }

    // 最小阅读量筛选
    if (options.minVisits !== null && options.minVisits !== undefined) {
      result = result.filter(doc => doc.visits >= options.minVisits)
    }

    // 日期范围筛选
    if (options.dateRange && options.dateRange.length === 2) {
      const startDate = new Date(options.dateRange[0])
      const endDate = new Date(options.dateRange[1])

      result = result.filter(doc => {
        const createDate = new Date(doc.createTime)
        return createDate >= startDate && createDate <= endDate
      })
    }
  }

  // 分类筛选
  if (selectedCategories.value.length > 0) {
    result = result.filter(doc => selectedCategories.value.includes(doc.category))
  }

  // 标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter(doc =>
        selectedTags.value.some(tag => doc.tags.includes(tag))
    )
  }

  // 类型筛选
  if (selectedTypes.value.length > 0) {
    result = result.filter(doc => selectedTypes.value.includes(doc.type))
  }

  // 平台筛选
  if (selectedPlatforms.value.length > 0) {
    result = result.filter(doc => selectedPlatforms.value.includes(doc.platform))
  }

  return result
})

// 计算属性：当前页显示的文档
const displayedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  // 根据排序选项排序
  let sorted = [...filteredDocuments.value]
  switch(sortOption.value) {
    case 'recent':
      sorted.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      break
    case 'updated':
      sorted.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
      break
    case 'visits':
      sorted.sort((a, b) => b.visits - a.visits)
      break
    case 'name':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'created':
      sorted.sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
      break
  }

  return sorted.slice(start, end)
})

// 导航方法
const navigateToUpload = () => {
  router.push('/document/upload')
}

const navigateToCreate = () => {
  router.push('/document/create')
}

// 方法：刷新文档列表
const refreshDocuments = () => {
  loading.value = true

  // 模拟API请求
  setTimeout(() => {
    loading.value = false
    message.success('文档列表已刷新')
  }, 800)
}

// 方法：处理基本搜索
const handleSearch = (searchData) => {
  searchKeyword.value = searchData.keyword
  searchDateRange.value = searchData.dateRange
  searchAdvancedOptions.value = null
  currentPage.value = 1
  message.info(`正在搜索：${searchKeyword.value}`)
}

// 方法：处理高级搜索
const handleAdvancedSearch = (options) => {
  searchKeyword.value = options.keyword
  searchAdvancedOptions.value = options
  currentPage.value = 1
  message.info('已应用高级搜索条件')
}

// 方法：处理筛选
const handleFilter = () => {
  currentPage.value = 1
  message.info('筛选条件已应用')
}

// 方法：切换选择所有文档
const toggleSelectAll = (checked) => {
  if (checked) {
    selectedDocumentIds.value = displayedDocuments.value.map(doc => doc.id)
  } else {
    selectedDocumentIds.value = []
  }
}

// 方法：切换选择单个文档
const toggleSelectDocument = (id) => {
  const index = selectedDocumentIds.value.indexOf(id)
  if (index === -1) {
    selectedDocumentIds.value.push(id)
  } else {
    selectedDocumentIds.value.splice(index, 1)
  }
}

// 方法：查看文档
const viewDocument = (id) => {
  router.push(`/document/view/${id}`)
}

// 方法：编辑文档
const editDocument = (id) => {
  router.push(`/document/edit/${id}`)
}

// 方法：确认删除文档
const confirmDeleteDocument = (id) => {
  // 实现确认删除逻辑
  message.warning(`确认删除文档ID: ${id}`)
}

// 方法：批量添加标签
const batchAddTags = () => {
  message.info(`为${selectedDocumentIds.value.length}个文档添加标签`)
}

// 方法：批量移动文档
const batchMove = () => {
  message.info(`移动${selectedDocumentIds.value.length}个文档`)
}

// 方法：确认批量删除
const confirmBatchDelete = () => {
  message.warning(`确认删除${selectedDocumentIds.value.length}个文档`)
}

// 方法：查看重要文档
const viewImportantDocs = () => {
  // 应用"重要"标签筛选
  selectedTags.value = ['重要']
  handleFilter()
  message.info('已筛选重要文档')
}

// 生命周期钩子
onMounted(() => {
  refreshDocuments()
})
</script>

<style scoped>
.document-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: var(--content-padding);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--divider-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background-color: var(--primary-color-suppl);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color-base);
  line-height: 1.3;
}

.page-desc {
  font-size: 14px;
  color: var(--text-color-tertiary);
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  height: 220px;
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-body {
  flex: 1;
  padding: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
}

.badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.positive {
  background-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.negative {
  background-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.card-value {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-info-text {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  z-index: 2;
}

.icon-bg {
  position: absolute;
  right: -10px;
  bottom: -10px;
  opacity: 0.15;
  transform: rotate(-5deg);
  z-index: 1;
}

.card-footer {
  padding: 12px 20px;
  background-color: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
}

.progress-bar-wrapper {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  transition: width 0.3s ease;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.blue-tag {
  background-color: rgba(99, 102, 241, 0.8);
}

.teal-tag {
  background-color: rgba(20, 184, 166, 0.8);
}

.amber-tag {
  background-color: rgba(251, 191, 36, 0.8);
}

.card-action-button {
  width: 100%;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.2s ease;
}

.card-action-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 卡片颜色方案 */
.blue-card {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
}

.green-card {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.amber-card {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
}

.red-card {
  background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
}

/* 主要内容容器 */
.main-content-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* 批量操作栏 */
.batch-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--card-color);
  padding: 12px 16px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
}

/* 视图控制 */
.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 空状态 */
.empty-state {
  margin: 48px 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    height: 200px;
  }
}
</style>