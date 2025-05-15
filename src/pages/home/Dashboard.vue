<template>
  <div class="dashboard-container">
    <!-- 欢迎区域 - 更现代化设计 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <n-gradient-text :size="28" type="primary" class="welcome-title">
          欢迎回来，{{ userStore.userInfo.name || '用户' }}
        </n-gradient-text>
        <p class="welcome-subtitle">{{ getGreeting() }} 今天是 {{ formattedDate }}</p>
      </div>
      <div class="global-search-wrapper">
        <div class="search-input-wrapper" :class="{ 'is-focused': isSearchFocused }">
          <icon-font type="icon-search" :size="20" class="search-icon" />
          <input
              ref="searchInputRef"
              class="global-search-input"
              placeholder="搜索文档、书签、代码片段..."
              v-model="searchKeyword"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
              @keyup.enter="performSearch"
          />
          <n-button
              v-if="searchKeyword"
              quaternary
              circle
              size="small"
              class="clear-button"
              @click="searchKeyword = ''"
          >
            <template #icon>
              <icon-font type="icon-close" :size="14" />
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - 更精美的卡片设计 -->
    <div class="stat-cards-container">
      <n-card class="stat-card" :class="{'hovering': hoveredCard === 'documents'}"
              @mouseenter="hoveredCard = 'documents'" @mouseleave="hoveredCard = null"
              hoverable>
        <div class="stat-card-header">
          <div class="stat-icon-wrapper primary-bg">
            <icon-font type="icon-document" :size="24" color="white" />
          </div>
          <div class="stat-actions">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <n-button quaternary circle size="small" @click="navigateTo('/dashboard/documents')">
                  <template #icon>
                    <icon-font type="icon-arrow-right" :size="16" />
                  </template>
                </n-button>
              </template>
              查看全部文档
            </n-tooltip>
          </div>
        </div>
        <div class="stat-card-body">
          <div class="stat-value">{{ stats.documents }}</div>
          <div class="stat-label">文档总数</div>
        </div>
        <div class="stat-card-footer">
          <div class="stat-trend">
            <icon-font type="icon-rise" :size="16" color="var(--success-color)" />
            <span class="trend-value">{{ stats.recentDocuments }} 本周新增</span>
          </div>
          <n-progress type="line" :percentage="stats.documentProgress" :show-indicator="false"
                      :height="6" color="var(--primary-color)" rail-color="rgba(99, 102, 241, 0.1)" />
        </div>
      </n-card>

      <n-card class="stat-card" :class="{'hovering': hoveredCard === 'bookmarks'}"
              @mouseenter="hoveredCard = 'bookmarks'" @mouseleave="hoveredCard = null"
              hoverable>
        <div class="stat-card-header">
          <div class="stat-icon-wrapper success-bg">
            <icon-font type="icon-bookmark" :size="24" color="white" />
          </div>
          <div class="stat-actions">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <n-button quaternary circle size="small" @click="navigateTo('/dashboard/bookmarks')">
                  <template #icon>
                    <icon-font type="icon-arrow-right" :size="16" />
                  </template>
                </n-button>
              </template>
              查看全部书签
            </n-tooltip>
          </div>
        </div>
        <div class="stat-card-body">
          <div class="stat-value">{{ stats.bookmarks }}</div>
          <div class="stat-label">书签总数</div>
        </div>
        <div class="stat-card-footer">
          <div class="stat-trend">
            <icon-font type="icon-rise" :size="16" color="var(--success-color)" />
            <span class="trend-value">{{ stats.recentBookmarks }} 本周新增</span>
          </div>
          <n-progress type="line" :percentage="stats.bookmarkProgress" :show-indicator="false"
                      :height="6" color="var(--success-color)" rail-color="rgba(24, 160, 88, 0.1)" />
        </div>
      </n-card>

      <n-card class="stat-card" :class="{'hovering': hoveredCard === 'codeSnippets'}"
              @mouseenter="hoveredCard = 'codeSnippets'" @mouseleave="hoveredCard = null"
              hoverable>
        <div class="stat-card-header">
          <div class="stat-icon-wrapper warning-bg">
            <icon-font type="icon-code" :size="24" color="white" />
          </div>
          <div class="stat-actions">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <n-button quaternary circle size="small" @click="navigateTo('/dashboard/code-snippets')">
                  <template #icon>
                    <icon-font type="icon-arrow-right" :size="16" />
                  </template>
                </n-button>
              </template>
              查看全部代码片段
            </n-tooltip>
          </div>
        </div>
        <div class="stat-card-body">
          <div class="stat-value">{{ stats.codeSnippets }}</div>
          <div class="stat-label">代码片段</div>
        </div>
        <div class="stat-card-footer">
          <div class="stat-trend">
            <icon-font type="icon-rise" :size="16" color="var(--success-color)" />
            <span class="trend-value">{{ stats.recentCodeSnippets }} 本周新增</span>
          </div>
          <n-progress type="line" :percentage="stats.codeSnippetProgress" :show-indicator="false"
                      :height="6" color="var(--warning-color)" rail-color="rgba(240, 160, 32, 0.1)" />
        </div>
      </n-card>

      <n-card class="stat-card" :class="{'hovering': hoveredCard === 'videos'}"
              @mouseenter="hoveredCard = 'videos'" @mouseleave="hoveredCard = null"
              hoverable>
        <div class="stat-card-header">
          <div class="stat-icon-wrapper info-bg">
            <icon-font type="icon-video" :size="24" color="white" />
          </div>
          <div class="stat-actions">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <n-button quaternary circle size="small" @click="navigateTo('/video/learning')">
                  <template #icon>
                    <icon-font type="icon-arrow-right" :size="16" />
                  </template>
                </n-button>
              </template>
              查看全部视频
            </n-tooltip>
          </div>
        </div>
        <div class="stat-card-body">
          <div class="stat-value">{{ stats.videos }}</div>
          <div class="stat-label">学习视频</div>
        </div>
        <div class="stat-card-footer">
          <div class="stat-trend">
            <icon-font type="icon-play-circle" :size="16" color="var(--info-color)" />
            <span class="trend-value">{{ stats.watchedVideos }} 已观看</span>
          </div>
          <n-progress type="line" :percentage="stats.videoProgress" :show-indicator="false"
                      :height="6" color="var(--info-color)" rail-color="rgba(32, 128, 240, 0.1)" />
        </div>
      </n-card>
    </div>

    <!-- 快速访问按钮组 -->
    <div class="quick-action-buttons">
      <n-button
          v-for="(item, index) in actionButtons"
          :key="index"
          class="quick-action-button"
          :type="item.type"
          size="large"
          @click="navigateTo(item.route)"
      >
        <template #icon>
          <icon-font :type="item.icon" :size="20" />
        </template>
        {{ item.label }}
      </n-button>
    </div>

    <!-- 主体内容区域 - 双列布局 -->
    <div class="main-content-container">
      <!-- 左侧列 -->
      <div class="content-column">
        <!-- 最近添加的书签模块 -->
        <n-card title="最近添加的书签" class="content-card bookmarks-card" hoverable>
          <template #header-extra>
            <n-button text type="primary" size="small" @click="navigateTo('/dashboard/bookmarks')">
              查看全部
              <template #icon>
                <icon-font type="icon-arrow-right" :size="14" />
              </template>
            </n-button>
          </template>

          <div class="bookmarks-list">
            <div v-for="(bookmark, index) in recentBookmarks" :key="index"
                 class="bookmark-item" @click="openBookmark(bookmark.url)">
              <div class="bookmark-icon" :style="{ backgroundColor: bookmark.color }">
                <icon-font :type="bookmark.icon || 'icon-link'" :size="18" color="white" />
              </div>
              <div class="bookmark-content">
                <div class="bookmark-title">{{ bookmark.title }}</div>
                <div class="bookmark-url">{{ formatUrl(bookmark.url) }}</div>
              </div>
              <div class="bookmark-meta">
                <div class="bookmark-date">{{ bookmark.addedDate }}</div>
                <div class="bookmark-actions">
                  <n-tooltip placement="top" trigger="hover">
                    <template #trigger>
                      <n-button quaternary circle size="small">
                        <template #icon>
                          <icon-font type="icon-share" :size="16" />
                        </template>
                      </n-button>
                    </template>
                    分享
                  </n-tooltip>
                  <n-tooltip placement="top" trigger="hover">
                    <template #trigger>
                      <n-button quaternary circle size="small">
                        <template #icon>
                          <icon-font type="icon-edit" :size="16" />
                        </template>
                      </n-button>
                    </template>
                    编辑
                  </n-tooltip>
                </div>
              </div>
            </div>

            <div class="bookmark-add-btn">
              <n-button block dashed @click="navigateTo('/dashboard/bookmarks')">
                <template #icon>
                  <icon-font type="icon-add" :size="18" />
                </template>
                添加新书签
              </n-button>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 右侧列 -->
      <div class="content-column">
        <!-- 待办事项模块 -->
        <n-card title="待办事项" class="content-card todo-card" hoverable>
          <template #header-extra>
            <n-button circle text size="small" @click="showAddTodoModal = true">
              <template #icon>
                <icon-font type="icon-add" :size="18" />
              </template>
            </n-button>
          </template>

          <div class="todo-list">
            <n-empty v-if="todos.length === 0" description="暂无待办事项" size="small">
              <template #extra>
                <n-button size="small" @click="showAddTodoModal = true">添加待办</n-button>
              </template>
            </n-empty>

            <transition-group name="list" tag="div" class="todo-items-container">
              <div v-for="(todo, index) in todos" :key="todo.id" class="todo-item"
                   :class="{ 'completed': completedTodos.includes(todo.id) }">
                <div class="todo-checkbox">
                  <n-checkbox :value="completedTodos.includes(todo.id)"
                              @update:value="toggleTodoComplete(todo.id)" />
                </div>
                <div class="todo-content">
                  <div class="todo-text" :class="{ 'line-through': completedTodos.includes(todo.id) }">
                    {{ todo.content }}
                  </div>
                  <div class="todo-meta">
                    <n-tag :type="getPriorityType(todo.priority)" size="small" round>
                      {{ getPriorityLabel(todo.priority) }}
                    </n-tag>
                    <span class="todo-due" :class="isDueNear(todo.dueDate) ? 'due-near' : ''">
                      {{ formatDueDate(todo.dueDate) }}
                    </span>
                  </div>
                </div>
                <div class="todo-actions">
                  <n-button quaternary circle size="small" @click="removeTodo(todo.id)">
                    <template #icon>
                      <icon-font type="icon-delete" :size="16" />
                    </template>
                  </n-button>
                </div>
              </div>
            </transition-group>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 热门标签模块 -->
    <n-card title="热门标签" class="content-card tags-card" hoverable>
      <div class="tags-cloud">
        <n-tag
            v-for="tag in popularTags"
            :key="tag.id"
            :type="tag.type"
            :color="tag.color"
            size="medium"
            round
            :style="{ fontSize: getTagSize(tag.count) }"
            class="tag-item"
            @click="navigateWithTag(tag.name)"
        >
          {{ tag.name }}
          <template #avatar v-if="tag.icon">
            <icon-font :type="tag.icon" :size="14" />
          </template>
        </n-tag>
      </div>
    </n-card>

    <!-- 添加待办事项对话框 -->
    <n-modal
        v-model:show="showAddTodoModal"
        preset="card"
        title="添加待办事项"
        class="todo-modal"
        :style="{ width: '400px' }"
    >
      <n-form ref="todoFormRef" :model="newTodo">
        <n-form-item label="内容" required>
          <n-input v-model:value="newTodo.content" placeholder="请输入待办事项内容" />
        </n-form-item>
        <n-form-item label="优先级">
          <n-select
              v-model:value="newTodo.priority"
              :options="priorityOptions"
              placeholder="请选择优先级"
          />
        </n-form-item>
        <n-form-item label="截止日期">
          <n-date-picker v-model:value="newTodo.dueDate" type="date" clearable />
        </n-form-item>
      </n-form>
      <div class="action-buttons">
        <n-button type="primary" @click="addTodo">保存</n-button>
        <n-button @click="showAddTodoModal = false">取消</n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import IconFont from '@/components/common/IconFont.vue'

const router = useRouter()
const userStore = useUserStore()

// 状态变量
const hoveredCard = ref(null)
const showAddTodoModal = ref(false)
const isSearchFocused = ref(false)
const searchKeyword = ref('')
const searchInputRef = ref(null)
const todoFormRef = ref(null)

// 日期格式化
const now = new Date()
const formattedDate = computed(() => {
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 问候语
const getGreeting = () => {
  const hour = now.getHours()
  if (hour < 6) return '凌晨好！'
  if (hour < 9) return '早上好！'
  if (hour < 12) return '上午好！'
  if (hour < 14) return '中午好！'
  if (hour < 18) return '下午好！'
  if (hour < 22) return '晚上好！'
  return '夜深了，注意休息！'
}

// 统计数据
const stats = reactive({
  documents: 127,
  recentDocuments: 12,
  documentProgress: 65,

  bookmarks: 246,
  recentBookmarks: 18,
  bookmarkProgress: 87,

  codeSnippets: 85,
  recentCodeSnippets: 6,
  codeSnippetProgress: 42,

  videos: 25,
  watchedVideos: 12,
  videoProgress: 48
})

// 最近添加的书签
const recentBookmarks = ref([
  {
    title: 'Vue3组合式API完全指南',
    url: 'https://v3.cn.vuejs.org/api/composition-api.html',
    icon: 'icon-vue',
    color: 'var(--success-color)',
    addedDate: '刚刚'
  },
  {
    title: 'TypeScript高级类型详解',
    url: 'https://www.typescriptlang.org/docs/handbook/advanced-types.html',
    icon: 'icon-typescript',
    color: 'var(--info-color)',
    addedDate: '2小时前'
  },
  {
    title: 'React Hooks深入解析',
    url: 'https://reactjs.org/docs/hooks-intro.html',
    icon: 'icon-react',
    color: 'var(--primary-color)',
    addedDate: '昨天'
  },
  {
    title: 'Docker容器化应用部署指南',
    url: 'https://docs.docker.com/get-started/',
    icon: 'icon-docker',
    color: 'var(--info-color)',
    addedDate: '3天前'
  },
  {
    title: 'SpringBoot微服务架构实战',
    url: 'https://spring.io/projects/spring-boot',
    icon: 'icon-spring',
    color: 'var(--success-color)',
    addedDate: '5天前'
  }
])

// 热门标签
const popularTags = ref([
  { id: 1, name: 'Vue3', count: 42, type: 'success', icon: 'icon-vue' },
  { id: 2, name: 'React', count: 36, type: 'primary', icon: 'icon-react' },
  { id: 3, name: 'TypeScript', count: 31, type: 'info', icon: 'icon-typescript' },
  { id: 4, name: 'JavaScript', count: 28, type: 'warning', icon: 'icon-javascript' },
  { id: 5, name: 'CSS', count: 25, type: 'success', icon: 'icon-css' },
  { id: 6, name: 'HTML', count: 23, type: 'error', icon: 'icon-html' },
  { id: 7, name: '前端开发', count: 20, type: 'default' },
  { id: 8, name: '后端开发', count: 18, type: 'default' },
  { id: 9, name: 'Node.js', count: 16, type: 'success', icon: 'icon-nodejs' },
  { id: 10, name: 'Spring', count: 15, type: 'success', icon: 'icon-spring' },
  { id: 11, name: 'Java', count: 14, type: 'info', icon: 'icon-java' },
  { id: 12, name: 'Python', count: 12, type: 'primary', icon: 'icon-python' },
  { id: 13, name: 'Docker', count: 10, type: 'info', icon: 'icon-docker' },
  { id: 14, name: '微服务', count: 9, type: 'default' },
  { id: 15, name: '数据库', count: 8, type: 'default' }
])

// 快速访问按钮
const actionButtons = [
  { label: '上传文档', icon: 'icon-upload', route: '/document/upload', type: 'primary' },
  { label: '代码片段', icon: 'icon-code', route: '/dashboard/code-snippets', type: 'info' },
  { label: '视频学习', icon: 'icon-video', route: '/video/learning', type: 'success' },
  { label: '我的书签', icon: 'icon-bookmark', route: '/dashboard/bookmarks', type: 'warning' },
  { label: '开发工具', icon: 'icon-tool', route: '/dashboard/tools', type: 'error' },
  { label: '搜索中心', icon: 'icon-search', route: '/search', type: 'default' }
]

// 待办事项
const todos = ref([
  { id: 1, content: '完成Vue3组件库文档编写', priority: 'high', dueDate: Date.now() + 86400000 },
  { id: 2, content: '学习TypeScript装饰器模式', priority: 'medium', dueDate: Date.now() + 86400000 * 2 },
  { id: 3, content: '优化首页响应式布局', priority: 'high', dueDate: Date.now() + 86400000 * 3 },
  { id: 4, content: '阅读Vue3源码解析', priority: 'low', dueDate: Date.now() + 86400000 * 5 },
])
const completedTodos = ref([3])

// 新增待办
const newTodo = reactive({
  content: '',
  priority: 'medium',
  dueDate: null
})

// 导航方法
const navigateTo = (route) => {
  router.push(route)
}

// 导航到带标签的搜索页面
const navigateWithTag = (tagName) => {
  router.push({
    path: '/search',
    query: { tag: tagName }
  })
}

// 添加待办事项
const addTodo = () => {
  if (!newTodo.content) return

  todos.value.push({
    id: Date.now(),
    content: newTodo.content,
    priority: newTodo.priority,
    dueDate: newTodo.dueDate
  })

  newTodo.content = ''
  newTodo.priority = 'medium'
  newTodo.dueDate = null
  showAddTodoModal.value = false
}

// 切换待办事项完成状态
const toggleTodoComplete = (id) => {
  const index = completedTodos.value.indexOf(id)
  if (index > -1) {
    completedTodos.value.splice(index, 1)
  } else {
    completedTodos.value.push(id)
  }
}

// 移除待办事项
const removeTodo = (id) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
  const index = completedTodos.value.indexOf(id)
  if (index > -1) {
    completedTodos.value.splice(index, 1)
  }
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const types = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'default'
}

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const labels = {
    high: '高优',
    medium: '中优',
    low: '低优'
  }
  return labels[priority] || '普通'
}

// 格式化到期日期
const formatDueDate = (timestamp) => {
  if (!timestamp) return '无截止日期'

  const date = new Date(timestamp)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天截止'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天截止'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日截止`
  }
}

// 检查截止日期是否临近
const isDueNear = (timestamp) => {
  if (!timestamp) return false

  const date = new Date(timestamp)
  const today = new Date()

  // 3天内视为临近
  return (date - today) / (1000 * 60 * 60 * 24) <= 3
}

// 格式化URL
const formatUrl = (url) => {
  if (!url) return ''

  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (e) {
    return url
  }
}

// 打开书签链接
const openBookmark = (url) => {
  window.open(url, '_blank')
}

// 执行搜索
const performSearch = () => {
  if (!searchKeyword.value.trim()) return

  router.push({
    path: '/search',
    query: { q: searchKeyword.value }
  })
}

// 获取标签大小
const getTagSize = (count) => {
  // 根据标签出现次数动态设置字体大小
  const minSize = 12
  const maxSize = 20
  const maxCount = Math.max(...popularTags.value.map(tag => tag.count))

  const size = minSize + (count / maxCount) * (maxSize - minSize)
  return `${size}px`
}

// 页面加载
onMounted(() => {
  // 这里可以添加初始化数据的API调用
  // 例如: fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  padding: var(--content-padding);
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--card-color);
  padding: 24px;
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-1);
}

.welcome-title {
  font-weight: 600;
  line-height: 1.2;
}

.welcome-subtitle {
  margin-top: 8px;
  color: var(--text-color-tertiary);
  font-size: 15px;
}

/* 全局搜索框 */
.global-search-wrapper {
  flex: 0 0 400px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: rgba(245, 247, 250, 0.8);
  border-radius: 24px;
  height: 48px;
  padding: 0 16px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-input-wrapper.is-focused {
  background-color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.search-icon {
  color: var(--text-color-tertiary);
  margin-right: 10px;
}

.global-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-color-base);
}

.global-search-input::placeholder {
  color: var(--text-color-tertiary);
}

.clear-button {
  margin-left: 8px;
}

/* 统计卡片 */
.stat-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius-large);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--box-shadow-1);
  height: 100%;
}

.stat-card.hovering {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-2);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-bg {
  background-color: var(--primary-color);
}

.success-bg {
  background-color: var(--success-color);
}

.warning-bg {
  background-color: var(--warning-color);
}

.info-bg {
  background-color: var(--info-color);
}

.stat-card-body {
  margin-bottom: 16px;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-color-base);
  line-height: 1.2;
}

.stat-label {
  font-size: 15px;
  color: var(--text-color-secondary);
  margin-top: 2px;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.trend-value {
  font-size: 13px;
  color: var(--text-color-tertiary);
}

/* 快速操作按钮组 */
.quick-action-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.quick-action-button {
  height: 44px;
  transition: all 0.3s ease;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.quick-action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

/* 主体内容区域 */
.main-content-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.content-column {
  display: flex;
  flex-direction: column;
}

.content-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius-large);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--box-shadow-1);
  height: 100%;
}

.content-card:hover {
  box-shadow: var(--box-shadow-2);
}

/* 最近添加的书签模块 */
.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bookmark-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: var(--border-radius);
  background-color: rgba(245, 247, 250, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.bookmark-item:hover {
  background-color: rgba(245, 247, 250, 0.8);
  transform: translateY(-2px);
}

.bookmark-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.bookmark-content {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-url {
  font-size: 12px;
  color: var(--text-color-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.bookmark-date {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.bookmark-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.bookmark-item:hover .bookmark-actions {
  opacity: 1;
}

.bookmark-add-btn {
  margin-top: 12px;
}

/* 待办事项模块 */
.todo-list {
  max-height: 400px;
  overflow-y: auto;
}

.todo-items-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  display: flex;
  padding: 12px;
  border-radius: var(--border-radius);
  background-color: rgba(245, 247, 250, 0.5);
  transition: all 0.3s ease;
}

.todo-item:hover {
  background-color: rgba(245, 247, 250, 0.8);
}

.todo-item.completed {
  background-color: rgba(245, 247, 250, 0.3);
}

.todo-checkbox {
  margin-right: 12px;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-text {
  font-size: 14px;
  margin-bottom: 6px;
  word-break: break-word;
  transition: all 0.3s ease;
}

.line-through {
  text-decoration: line-through;
  color: var(--text-color-tertiary);
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.todo-due {
  color: var(--text-color-tertiary);
}

.due-near {
  color: var(--error-color);
  font-weight: 500;
}

.todo-actions {
  display: flex;
  align-items: flex-start;
}

/* 热门标签 */
.tags-card {
  margin-bottom: 28px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 4px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tag-item:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

/* 对话框 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 动画效果 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 1280px) {
  .stat-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-action-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 991px) {
  .welcome-section {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .global-search-wrapper {
    flex: 0 0 auto;
    width: 100%;
  }

  .main-content-container {
    grid-template-columns: 1fr;
  }

  .content-card {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .stat-cards-container {
    grid-template-columns: 1fr;
  }

  .quick-action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .quick-action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>