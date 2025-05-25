<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅区域 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            <icon-font type="icon-zhishiku1" :size="28" class="title-icon" />
            <span class="welcome-highlight">欢迎回来，{{ userName }}</span>
          </h1>
          <div class="datetime-info">
            <div class="time-display">{{ currentDateTime }}</div>
            <div class="motivation-text">让我们开始高效的知识管理之旅</div>
          </div>
        </div>
      </div>

      <!-- 简化的装饰元素 -->
      <div class="banner-decoration">
        <div class="decoration-blob blob-1"></div>
        <div class="decoration-blob blob-2"></div>
        <div class="decoration-blob blob-3"></div>
        <div class="floating-icon icon-1">
          <icon-font type="icon-book" :size="16" class="floating-element" />
        </div>
        <div class="floating-icon icon-2">
          <icon-font type="icon-bulb" :size="16" class="floating-element" />
        </div>
        <div class="floating-icon icon-3">
          <icon-font type="icon-star" :size="14" class="floating-element" />
        </div>
      </div>
    </div>

    <!-- 核心统计卡片 -->
    <div class="stats-section">
      <stats-cards
          :cards-data="overallStatsData"
          :columns="4"
          :show-waveform="true"
      />
    </div>

    <!-- 主要内容区域 - 重新设计为单列布局 -->
    <div class="main-content-wrapper">
      <!-- 快速操作区域 -->
      <div class="quick-actions-section">
        <quick-actions
            :actions="quickActionItems"
            @action="handleQuickAction"
        />
      </div>

      <!-- 数据概览图表 - 重新设计 -->
      <div class="charts-section">
        <data-overview-charts />
      </div>
    </div>

    <!-- 底部功能区域 - 重新设计为二列布局 -->
    <div class="bottom-section">
      <div class="bottom-cards-grid">
        <!-- 最近收藏的书签 -->
        <div class="recent-bookmarks-card">
          <div class="card-header">
            <icon-font type="icon-bookmark" :size="24" class="header-icon" />
            <h3 class="card-title">最近收藏的书签</h3>
            <n-button text @click="navigateToBookmarks">
              查看全部
              <template #icon>
                <icon-font type="icon-arrow-right" :size="14" />
              </template>
            </n-button>
          </div>
          <div class="recent-items-list">
            <div
                v-for="bookmark in recentBookmarks"
                :key="bookmark.id"
                class="bookmark-item"
                @click="openBookmark(bookmark)"
            >
              <div class="bookmark-favicon">
                <img :src="bookmark.favicon" :alt="bookmark.platform" />
              </div>
              <div class="bookmark-content">
                <h4 class="bookmark-title">{{ bookmark.title }}</h4>
                <p class="bookmark-description">{{ bookmark.description }}</p>
                <div class="bookmark-meta">
                  <span class="bookmark-platform">{{ bookmark.platform }}</span>
                  <span class="bookmark-time">{{ formatRelativeTime(bookmark.createdAt) }}</span>
                  <div class="bookmark-tags">
                    <span
                        v-for="tag in bookmark.tags.slice(0, 2)"
                        :key="tag"
                        class="bookmark-tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="bookmark-actions">
                <n-button quaternary circle size="small" @click.stop="favoriteBookmark(bookmark)">
                  <icon-font type="icon-heart" :size="14" />
                </n-button>
                <n-button quaternary circle size="small" @click.stop="shareBookmark(bookmark)">
                  <icon-font type="icon-share" :size="14" />
                </n-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近添加的文档 -->
        <div class="recent-documents-card">
          <div class="card-header">
            <icon-font type="icon-file-text" :size="24" class="header-icon" />
            <h3 class="card-title">最近添加的文档</h3>
            <n-button text @click="navigateToDocuments">
              查看全部
              <template #icon>
                <icon-font type="icon-arrow-right" :size="14" />
              </template>
            </n-button>
          </div>
          <div class="recent-items-list">
            <div
                v-for="document in recentDocuments"
                :key="document.id"
                class="document-item"
                @click="openDocument(document)"
            >
              <div class="document-icon">
                <icon-font :type="getDocumentIcon(document.type)" :size="24" />
              </div>
              <div class="document-content">
                <h4 class="document-title">{{ document.title }}</h4>
                <p class="document-description">{{ document.description }}</p>
                <div class="document-meta">
                  <span class="document-category">{{ document.category }}</span>
                  <span class="document-time">{{ formatRelativeTime(document.createdAt) }}</span>
                  <span class="document-size">{{ formatFileSize(document.size) }}</span>
                </div>
              </div>
              <div class="document-actions">
                <n-button quaternary circle size="small" @click.stop="editDocument(document)">
                  <icon-font type="icon-edit" :size="14" />
                </n-button>
                <n-button quaternary circle size="small" @click.stop="downloadDocument(document)">
                  <icon-font type="icon-download" :size="14" />
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加书签模态框 -->
    <n-modal v-model:show="showAddBookmarkModal" preset="card" style="width: 600px" title="快速添加书签">
      <n-form ref="bookmarkFormRef" :model="bookmarkForm" :rules="bookmarkFormRules">
        <n-form-item label="网址" path="url">
          <n-input v-model:value="bookmarkForm.url" placeholder="请输入网址" />
        </n-form-item>
        <n-form-item label="标题" path="title">
          <n-input v-model:value="bookmarkForm.title" placeholder="自动获取或手动输入" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input
              v-model:value="bookmarkForm.description"
              type="textarea"
              placeholder="可选描述"
              :rows="3"
          />
        </n-form-item>
        <n-form-item label="标签">
          <n-dynamic-tags v-model:value="bookmarkForm.tags" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showAddBookmarkModal = false">取消</n-button>
          <n-button type="primary" @click="handleAddBookmark">确定添加</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 全局搜索模态框 -->
    <n-modal v-model:show="showGlobalSearchModal" preset="card" style="width: 800px" title="全局搜索">
      <div class="global-search-container">
        <n-input
            v-model:value="globalSearchQuery"
            size="large"
            placeholder="搜索文档、书签、代码片段..."
            clearable
            @keyup.enter="performGlobalSearch"
        >
          <template #prefix>
            <icon-font type="icon-search" :size="18" />
          </template>
        </n-input>

        <div class="search-suggestions" v-if="searchSuggestions.length > 0">
          <div class="suggestions-header">搜索建议</div>
          <div
              v-for="suggestion in searchSuggestions"
              :key="suggestion.id"
              class="suggestion-item"
              @click="selectSearchSuggestion(suggestion)"
          >
            <icon-font :type="getSuggestionIcon(suggestion.type)" :size="16" />
            <span class="suggestion-text">{{ suggestion.text }}</span>
            <span class="suggestion-type">{{ suggestion.type }}</span>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import {useMessage} from 'naive-ui'
import StatsCards from '@/components/common/StatsCards.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import DataOverviewCharts from '@/components/dashboard/DataOverviewCharts.vue'
import IconFont from '@/components/common/IconFont.vue'

const router = useRouter()
const message = useMessage()

// 基础状态
const userName = ref('知识管理员')
const currentDateTime = ref('') // 统一的日期时间显示

// 定时器引用，用于清理
let timeUpdateTimer = null

// 模态框状态
const showAddBookmarkModal = ref(false)
const showGlobalSearchModal = ref(false)

// 表单数据
const bookmarkFormRef = ref(null)
const bookmarkForm = reactive({
  url: '',
  title: '',
  description: '',
  tags: []
})

const bookmarkFormRules = {
  url: {
    required: true,
    message: '请输入网址',
    trigger: 'blur'
  },
  title: {
    required: true,
    message: '请输入标题',
    trigger: 'blur'
  }
}

// 全局搜索
const globalSearchQuery = ref('')
const searchSuggestions = ref([
  {id: 1, text: 'Vue3 组合式API', type: '文档'},
  {id: 2, text: 'React Hooks', type: '书签'},
  {id: 3, text: '表单验证组件', type: '代码片段'}
])

// 整体统计数据
const overallStatsData = computed(() => {
  return [
    {
      id: 'total-content',
      title: '内容总数',
      subtitle: '所有知识内容统计',
      value: 1247,
      icon: 'icon-zhishiku1',
      color: '#6366f1',
      colorRgb: '99, 102, 241',
      trend: {value: 8, type: 'positive'},
      progress: {value: 100, label: '100%'}
    },
    {
      id: 'active-users',
      title: '活跃用户',
      subtitle: '本月活跃用户数量',
      value: 89,
      icon: 'icon-user-group',
      color: '#10b981',
      colorRgb: '16, 185, 129',
      trend: {value: 15, type: 'positive'},
      progress: {value: 75, label: '75%'}
    },
    {
      id: 'storage-used',
      title: '存储使用',
      subtitle: '已使用存储空间',
      value: 2.4,
      icon: 'icon-database',
      color: '#f59e0b',
      colorRgb: '245, 158, 11',
      trend: {value: 5, type: 'positive'},
      progress: {value: 60, label: '2.4GB / 4GB'}
    },
    {
      id: 'system-health',
      title: '系统健康',
      subtitle: '系统运行状态评分',
      value: 98,
      icon: 'icon-heart-pulse',
      color: '#ef4444',
      colorRgb: '239, 68, 68',
      trend: {value: 2, type: 'positive'},
      progress: {value: 98, label: '98%'}
    }
  ]
})

// 快速操作项目
const quickActionItems = [
  {
    id: 'add-document',
    title: '新建文档',
    description: '创建新的知识文档',
    icon: 'icon-file-add',
    type: 'primary',
    route: '/dashboard/documents'
  },
  {
    id: 'add-bookmark',
    title: '添加书签',
    description: '保存有价值的网页链接',
    icon: 'icon-bookmark-add',
    type: 'success',
    action: 'showAddBookmark'
  },
  {
    id: 'add-snippet',
    title: '保存代码',
    description: '收藏常用代码片段',
    icon: 'icon-code-add',
    type: 'warning',
    route: '/dashboard/code-snippets'
  },
  {
    id: 'search-all',
    title: '全局搜索',
    description: '在所有内容中搜索',
    icon: 'icon-search-all',
    type: 'info',
    action: 'showGlobalSearch'
  }
]

// 最近收藏的书签
const recentBookmarks = [
  {
    id: 1,
    title: 'Vue3 组合式API官方指南',
    description: 'Vue3 Composition API的完整使用指南和最佳实践',
    platform: 'Vue.js',
    favicon: 'https://vuejs.org/favicon.ico',
    url: 'https://vuejs.org/guide/extras/composition-api-faq.html',
    tags: ['Vue3', 'JavaScript', '前端'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    title: 'React Hooks最佳实践',
    description: 'React Hooks的使用技巧和性能优化方案',
    platform: 'React',
    favicon: 'https://reactjs.org/favicon.ico',
    url: 'https://reactjs.org/docs/hooks-intro.html',
    tags: ['React', 'JavaScript', '前端'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: 3,
    title: 'TypeScript高级类型',
    description: '深入理解TypeScript的高级类型系统',
    platform: 'TypeScript',
    favicon: 'https://www.typescriptlang.org/favicon-32x32.png',
    url: 'https://www.typescriptlang.org/docs/handbook/advanced-types.html',
    tags: ['TypeScript', 'JavaScript'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: 4,
    title: 'SpringBoot微服务架构设计',
    description: '基于SpringBoot的微服务架构设计模式与实现',
    platform: 'Spring',
    favicon: 'https://spring.io/favicon.ico',
    url: 'https://spring.io/microservices',
    tags: ['Java', 'Spring', '微服务'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: 5,
    title: 'Docker容器化最佳实践',
    description: 'Docker容器化应用的部署和优化策略',
    platform: 'Docker',
    favicon: 'https://www.docker.com/favicon.ico',
    url: 'https://docs.docker.com/get-started/',
    tags: ['Docker', 'DevOps', '容器'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
]

// 最近添加的文档
const recentDocuments = [
  {
    id: 1,
    title: 'Vue3项目架构设计文档',
    description: '详细描述了Vue3大型项目的架构设计原则和实施方案',
    category: '前端技术',
    type: 'markdown',
    size: 2048000, // 2MB
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 2,
    title: 'API接口设计规范',
    description: 'RESTful API设计规范和最佳实践指南',
    category: '后端开发',
    type: 'pdf',
    size: 1536000, // 1.5MB
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: 3,
    title: '数据库优化策略',
    description: 'MySQL数据库性能优化的具体策略和实施方法',
    category: '数据库',
    type: 'word',
    size: 3072000, // 3MB
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: 4,
    title: 'UI设计规范文档',
    description: '产品界面设计的统一规范和组件库使用指南',
    category: '设计资源',
    type: 'pdf',
    size: 4096000, // 4MB
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: 5,
    title: '项目部署流程说明',
    description: 'CI/CD流程配置和自动化部署的详细操作步骤',
    category: '运维部署',
    type: 'markdown',
    size: 1024000, // 1MB
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
  }
]

// 工具方法
const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const diff = now - new Date(timestamp)
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) {
    return '刚刚'
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const date = now.getDate()
  return `${month}月${date}日`
}

const getDocumentIcon = (type) => {
  const iconMap = {
    markdown: 'icon-markdown',
    pdf: 'icon-pdf',
    word: 'icon-word',
    excel: 'icon-excel',
    ppt: 'icon-powerpoint',
    text: 'icon-file-text'
  }
  return iconMap[type] || 'icon-file'
}

const getSuggestionIcon = (type) => {
  const typeMap = {
    '文档': 'icon-file-text',
    '书签': 'icon-bookmark',
    '代码片段': 'icon-code'
  }
  return typeMap[type] || 'icon-search'
}

// 事件处理方法
const handleQuickAction = (action) => {
  if (action.type === 'navigate') {
    router.push(action.payload)
  } else if (action.type === 'showAddBookmark') {
    showAddBookmarkModal.value = true
  } else if (action.type === 'showGlobalSearch') {
    showGlobalSearchModal.value = true
  }
}

const navigateToBookmarks = () => {
  router.push('/dashboard/bookmarks')
}

const navigateToDocuments = () => {
  router.push('/dashboard/documents')
}

const handleAddBookmark = () => {
  bookmarkFormRef.value?.validate((errors) => {
    if (!errors) {
      message.success('书签添加成功！')
      showAddBookmarkModal.value = false
      // 重置表单
      Object.assign(bookmarkForm, {
        url: '',
        title: '',
        description: '',
        tags: []
      })
    }
  })
}

const performGlobalSearch = () => {
  if (globalSearchQuery.value.trim()) {
    router.push(`/dashboard/search?q=${encodeURIComponent(globalSearchQuery.value)}`)
    showGlobalSearchModal.value = false
  }
}

const selectSearchSuggestion = (suggestion) => {
  globalSearchQuery.value = suggestion.text
  performGlobalSearch()
}

const openBookmark = (bookmark) => {
  window.open(bookmark.url, '_blank')
}

const favoriteBookmark = (bookmark) => {
  message.success(`已收藏: ${bookmark.title}`)
}

const shareBookmark = (bookmark) => {
  navigator.clipboard.writeText(bookmark.url)
  message.success('链接已复制到剪贴板')
}

const openDocument = (document) => {
  router.push(`/dashboard/documents/${document.id}`)
}

const editDocument = (document) => {
  router.push(`/dashboard/documents/${document.id}/edit`)
}

const downloadDocument = (document) => {
  message.success(`开始下载: ${document.title}`)
}

// 时间更新逻辑 - 重新设计
const updateTime = () => {
  const now = new Date()

  // 格式化为您要求的格式："现在是2025年5月24日 22：23 50 星期六"
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')

  // 获取星期
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[now.getDay()]

  // 组合完整的日期时间字符串
  currentDateTime.value = `现在是${year}年${month}月${date}日 ${hours}:${minutes} ${seconds} ${weekday}`
}

onMounted(() => {
  // 立即更新一次时间
  updateTime()

  // 每秒更新时间，确保秒数实时变化
  timeUpdateTimer = setInterval(updateTime, 1000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer)
    timeUpdateTimer = null
  }
})
</script>

<style scoped>
/* 整体容器 */
.dashboard-container {
  padding: var(--content-padding);
  width: 100%;
  min-height: calc(100vh - var(--header-height));
}

/* 重新设计的欢迎横幅样式 - 优雅的紫色渐变背景 */
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg,
  rgba(79, 45, 152, 0.65) 0%,   /* 优雅的深紫色起始 */ rgba(75, 17, 175, 0.6) 25%,  /* 中度紫色 */
  rgba(162, 123, 232, 0.55) 50%, /* 浅紫色过渡 */ rgba(57, 16, 136, 0.5) 75%,  /* 更浅的紫色 */ rgb(79, 138, 214) 100% /* 淡紫色收尾 */
  );
  border-radius: 20px;
  padding: 24px 28px;
  margin-bottom: 24px;
  overflow: hidden;
  backdrop-filter: blur(16px);
  box-shadow:
      0 8px 24px rgba(124, 95, 186, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
  gap: 28px;
  min-height: 100px;
}

.welcome-text {
  color: white;
  flex: 1;
  max-width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.welcome-highlight {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 3px 12px rgba(255, 255, 255, 0.4);
  position: relative;
}

.welcome-highlight::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.6), transparent);
  border-radius: 3px;
}

.title-icon {
  filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3));
}

.datetime-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
}

.time-display {
  font-size: 18px; /* 增大时间显示字体 */
  font-weight: 600;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  color: #fff;
  letter-spacing: 0.8px;
  position: relative;
}

.time-display::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
}

.motivation-text {
  font-size: 15px;
  opacity: 0.95;
  font-weight: 400;
  margin-top: 4px;
  line-height: 1.4;
}


/* 简化的装饰元素 */
.banner-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

/* 使用blob形状替代 */
.decoration-blob {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  animation: subtleFloat 10s ease-in-out infinite;
  backdrop-filter: blur(2px);
}

.blob-1 {
  width: 80px;
  height: 80px;
  top: -40px;
  right: 15%;
  animation-delay: 0s;
}

.blob-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 8%;
  animation-delay: 3s;
}

.blob-3 {
  width: 45px;
  height: 45px;
  bottom: -22px;
  right: 25%;
  animation-delay: 6s;
}

.floating-icon {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(3px);
  animation: subtleFloat 12s ease-in-out infinite;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-1 {
  top: 20%;
  right: 12%;
  animation-delay: 2s;
}

.icon-2 {
  bottom: 25%;
  right: 30%;
  animation-delay: 5s;
}

.icon-3 {
  top: 65%;
  left: 25%;
  animation-delay: 1s;
}

.floating-element {
  animation: gentlePulse 5s ease-in-out infinite;
}

/* 统计卡片区域 */
.stats-section {
  margin-bottom: 32px;
}

/* 主要内容区域 */
.main-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.quick-actions-section,
.charts-section {
  width: 100%;
}

/* 底部区域 */
.bottom-section {
  margin-bottom: 32px;
}

.bottom-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* 卡片基础样式 */
.recent-bookmarks-card,
.recent-documents-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.recent-bookmarks-card:hover,
.recent-documents-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.card-header .header-icon {
  margin-right: 12px;
  color: var(--primary-color);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0;
  display: flex;
  align-items: center;
}

/* 最近项目列表样式 */
.recent-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

/* 书签项目样式 */
.bookmark-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.bookmark-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.bookmark-favicon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.bookmark-favicon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bookmark-content {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-description {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.bookmark-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.bookmark-platform {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.bookmark-time {
  color: var(--text-color-tertiary);
}

.bookmark-tags {
  display: flex;
  gap: 4px;
}

.bookmark-tag {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-color-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.bookmark-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* 文档项目样式 */
.document-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.document-content {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-description {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.document-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.document-category {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.document-time {
  color: var(--text-color-tertiary);
}

.document-size {
  color: var(--text-color-tertiary);
}

.document-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* 搜索相关样式 */
.global-search-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-suggestions {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.suggestions-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin-bottom: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background: rgba(99, 102, 241, 0.05);
}

.suggestion-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-color-base);
}

.suggestion-type {
  font-size: 12px;
  color: var(--text-color-tertiary);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 - 优化大尺寸下的显示 */
@media (max-width: 1400px) {
  .info-panel {
    max-width: 460px;
    min-width: 420px;
  }

  .weather-card {
    width: 260px;
    min-width: 260px;
  }

  .daily-card {
    width: 200px;
    min-width: 200px;
  }
}

@media (max-width: 1200px) {
  .bottom-cards-grid {
    grid-template-columns: 1fr;
  }

  .recent-bookmarks-card,
  .recent-documents-card {
    height: auto;
    max-height: 500px;
  }

  .banner-content {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .welcome-text {
    max-width: 100%;
  }

  .info-panel {
    flex-direction: row;
    max-width: 100%;
    justify-content: center;
    gap: 20px;
  }

  .weather-card {
    width: 240px;
    min-width: 240px;
  }

  .daily-card {
    width: 180px;
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  .welcome-banner {
    padding: 28px 24px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .info-panel {
    flex-direction: row;
    max-width: 100%;
    margin: 0 auto;
    gap: 16px;
    justify-content: center;
  }

  .weather-card {
    width: 200px;
    min-width: 200px;
    padding: 16px;
  }

  .daily-card {
    width: 160px;
    min-width: 160px;
    padding: 16px;
  }

  .temperature {
    font-size: 28px;
  }

  .weather-status {
    font-size: 13px;
  }

  .weather-feeling,
  .air-quality {
    font-size: 11px;
  }

  .detail-label,
  .detail-value {
    font-size: 10px;
  }

  .stat-number {
    font-size: 15px;
  }

  .stat-label {
    font-size: 10px;
  }

  .bookmark-item,
  .document-item {
    padding: 12px;
  }

  .bookmark-meta,
  .document-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .welcome-banner {
    padding: 24px 20px;
  }

  .info-panel {
    gap: 12px;
  }

  .weather-card {
    width: 180px;
    min-width: 180px;
    padding: 14px;
  }

  .daily-card {
    width: 140px;
    min-width: 140px;
    padding: 14px;
  }

  .weather-details {
    gap: 8px 10px;
  }

  .city-name,
  .daily-title {
    font-size: 12px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .welcome-banner {
    background: linear-gradient(135deg,
    rgba(88, 28, 135, 0.7) 0%,
    rgba(109, 40, 217, 0.75) 25%,
    rgba(124, 58, 237, 0.65) 50%,
    rgba(147, 97, 244, 0.6) 75%,
    rgba(167, 139, 250, 0.55) 100%
    );
  }

  .recent-bookmarks-card,
  .recent-documents-card {
    background: rgba(30, 41, 59, 0.8);
  }

  .bookmark-item,
  .document-item {
    background: rgba(51, 65, 85, 0.7);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .weather-card,
  .daily-card {
    background: rgba(15, 23, 42, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }
}
</style>