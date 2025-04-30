<template>
  <div class="bookmarks-container">
    <!-- 全新顶部区域设计 -->
    <div class="header-wrapper">
      <!-- 装饰元素 -->
      <div class="header-decoration">
        <div class="decoration-item bookmark-icon-large"></div>
        <div class="decoration-item dots-pattern"></div>
        <div class="decoration-item wave-line"></div>
        <div class="decoration-item circle-group">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>

      <div class="header-content">
        <!-- 左侧：标题和统计 -->
        <div class="header-left">
          <div class="title-area">
            <div class="title-icon-wrapper">
              <icon-font type="icon-bookmark" class="title-icon" />
            </div>
            <div class="title-text">
              <h1 class="main-title">书签管理</h1>
              <p class="sub-title">管理您收藏的网页和链接资源</p>
            </div>
          </div>

          <!-- 统计卡片 -->
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-icon total-icon">
                <icon-font type="icon-bijiben" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ platformCounts.total }}</div>
                <div class="stat-label">总书签</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon starred-icon">
                <icon-font type="icon-star-fill" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ countStarred }}</div>
                <div class="stat-label">已收藏</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon tags-icon">
                <icon-font type="icon-tag" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ availableTags.length }}</div>
                <div class="stat-label">标签数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="header-right">
          <div class="action-buttons">
            <n-button type="primary" @click="showImportModal = true" class="import-button">
              <template #icon>
                <icon-font type="icon-daoru" />
              </template>
              导入书签
            </n-button>

            <n-button type="primary" @click="showAddBookmarkModal = true" class="add-button">
              <template #icon>
                <icon-font type="icon-add" />
              </template>
              添加书签
            </n-button>

            <!-- 新增选择按钮 -->
            <n-button
                type="info"
                @click="selectionMode ? exitSelectionMode() : enterSelectionMode()"
                class="selection-button"
            >
              <template #icon>
                <icon-font :type="selectionMode ? 'icon-close' : 'icon-check-square'" />
              </template>
              {{ selectionMode ? '退出选择' : '批量选择' }}
            </n-button>

            <n-dropdown trigger="click" :options="moreOptions" @select="handleMoreAction" placement="bottom-end">
              <n-button circle class="more-button">
                <icon-font type="icon-more" />
              </n-button>
            </n-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="search-filter-wrapper">
      <n-card class="mb-4 search-card">
        <div class="search-filter-section">
          <div class="search-box-wrapper">
            <n-input
                v-model:value="searchQuery"
                placeholder="搜索书签..."
                clearable
                @update:value="handleSearch"
                class="search-input"
            >
              <template #prefix>
                <icon-font type="icon-search" />
              </template>
              <template #suffix>
                <n-button quaternary circle size="small" v-if="searchQuery" @click="clearSearch">
                  <icon-font type="icon-close" />
                </n-button>
              </template>
            </n-input>

            <n-button type="info" class="filter-btn" @click="showFilterModal = true">
              <template #icon>
                <icon-font type="icon-filter" />
              </template>
              筛选
            </n-button>
          </div>

          <div class="active-filters-section">
            <div v-if="activeFilters.length > 0" class="active-filters">
              <span class="filters-label">已筛选:</span>
              <n-tag
                  v-for="filter in activeFilters"
                  :key="filter.value"
                  closable
                  @close="removeFilter(filter)"
                  :type="filter.type || 'default'"
                  class="filter-tag"
              >
                {{ filter.label }}
              </n-tag>
              <n-button text type="error" size="small" @click="clearFilters" class="clear-filters-btn">
                清除全部
              </n-button>
            </div>

            <div v-else class="quick-filters">
              <span class="filters-label">快速筛选:</span>
              <n-tag class="filter-tag quick-tag" @click="addFilter({label: '所有书签', value: 'all', type: 'primary'})">所有书签</n-tag>
              <n-tag class="filter-tag quick-tag" @click="addFilter({label: 'Java', value: 'java', type: 'info'})">Java</n-tag>
              <n-tag class="filter-tag quick-tag" @click="addFilter({label: 'Spring', value: 'spring', type: 'success'})">Spring</n-tag>
              <n-tag class="filter-tag quick-tag" @click="addFilter({label: '已收藏', value: 'starred', type: 'warning'})">已收藏</n-tag>
              <n-button text type="primary" size="small" @click="showFilterModal = true" class="add-filter-btn">
                <template #icon>
                  <icon-font type="icon-plus" />
                </template>
                更多筛选
              </n-button>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 主内容区 -->
    <div class="flex main-content-section">
      <!-- 左侧分类导航 -->
      <div class="category-nav mr-4" style="width: 260px;">
        <!-- 平台分类 -->
        <div class="platform-category mb-4">
          <div class="category-card">
            <div class="category-header">
              <h3 class="category-title">平台分类</h3>
            </div>
            <div class="category-body">
              <div class="platform-list">
                <div
                    v-for="platform in platformItems"
                    :key="platform.key"
                    class="platform-item"
                    :class="{'active': selectedPlatform === platform.key}"
                    @click="selectedPlatform = platform.key"
                >
                  <div class="platform-icon">
                    <icon-font :type="platform.icon" :size="18" :color="platform.iconColor" />
                  </div>
                  <div class="platform-name">{{ platform.label }}</div>
                  <div class="platform-count">{{ platform.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常用标签 -->
        <div class="tag-category">
          <div class="category-card">
            <div class="category-header">
              <h3 class="category-title">常用标签</h3>
              <n-button text size="small" type="primary" @click="manageTagsClick" class="manage-tags-btn">
                管理标签
              </n-button>
            </div>
            <div class="category-body">
              <div class="tag-list">
                <div
                    v-for="tag in popularTags"
                    :key="tag.key"
                    class="tag-item"
                    :class="{'active': selectedTag === tag.key}"
                    @click="selectedTag = tag.key"
                >
                  <div class="tag-name">{{ tag.label }}</div>
                  <div class="tag-count">{{ tag.count }}</div>
                </div>
                <div class="more-tags" v-if="tagMenuOptions.length > popularTags.length" @click="showMoreTags = !showMoreTags">
                  <div class="more-tags-text">{{ showMoreTags ? '收起' : '更多...' }}</div>
                  <icon-font :type="showMoreTags ? 'icon-up' : 'icon-down'" :size="14" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧书签列表 -->
      <div class="bookmark-list-section flex-1">
        <n-card>
          <div class="bookmark-header flex justify-between items-center mb-4">
            <n-tabs type="line" v-model:value="activeTab">
              <n-tab-pane name="all" tab="所有书签" />
              <n-tab-pane name="recent" tab="最近添加" />
              <n-tab-pane name="frequent" tab="常用书签" />
            </n-tabs>

            <n-dropdown :options="sortOptions" @select="handleSortChange">
              <n-button text>
                排序: {{ currentSort.label }}
                <template #icon>
                  <icon-font type="icon-arrow-down" />
                </template>
              </n-button>
            </n-dropdown>
          </div>

          <!-- 书签列表 -->
          <div class="bookmark-items">
            <div v-if="filteredBookmarks.length === 0" class="empty-state text-center p-8">
              <icon-font type="icon-empty" :size="48" color="var(--text-color-disabled)" />
              <p class="mt-3 text-tertiary">没有找到匹配的书签</p>
              <n-button class="mt-2" @click="clearFilters">清除筛选条件</n-button>
            </div>

            <bookmark-item
                v-for="bookmark in filteredBookmarks"
                :key="bookmark.id"
                :bookmark="bookmark"
                :is-selected="selectionMode && isBookmarkSelected(bookmark)"
                @edit="handleEditBookmark"
                @delete="handleDeleteBookmark"
                @toggle-star="handleToggleStar"
                @contextmenu="handleBookmarkContextMenu($event, bookmark)"
                @click="selectionMode ? toggleBookmarkSelection(bookmark) : null"
            >
              <!-- 新增选择指示器 -->
              <template #selection-indicator v-if="selectionMode">
                <div class="selection-indicator">
                  <icon-font
                      :type="isBookmarkSelected(bookmark) ? 'icon-check-square-filled' : 'icon-square'"
                      :color="isBookmarkSelected(bookmark) ? 'var(--primary-color)' : 'var(--text-color-tertiary)'"
                  />
                </div>
              </template>
            </bookmark-item>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 添加书签模态框 -->
    <n-modal v-model:show="showAddBookmarkModal" preset="card" title="添加书签" style="width: 800px">
      <add-bookmark-form @submit="handleAddBookmark" @cancel="showAddBookmarkModal = false" />
    </n-modal>

    <!-- 导入书签模态框 -->
    <n-modal v-model:show="showImportModal" preset="card" title="导入书签" style="width: 600px">
      <import-bookmarks-form @submit="handleImportBookmarks" @cancel="showImportModal = false" />
    </n-modal>

    <!-- 筛选模态框 -->
    <n-modal v-model:show="showFilterModal" preset="card" style="width: 800px">
      <filter-form :available-tags="availableTags" :total-bookmarks="bookmarks.length" @apply="applyFilters" @cancel="showFilterModal = false" />
    </n-modal>

    <!-- 导出书签模态框 -->
    <n-modal v-model:show="showExportModal" preset="card" title="导出书签" style="width: 800px">
      <export-bookmarks-form
          :bookmarks="bookmarks"
          :filtered-bookmarks="filteredBookmarks.length"
          :selected-bookmarks="selectedBookmarks"
          :has-active-filters="activeFilters.length > 0"
          @cancel="showExportModal = false"
          @export-complete="showExportModal = false"
      />
    </n-modal>

    <!-- 批量编辑模态框 -->
    <n-modal v-model:show="showBatchEditModal" preset="card" title="批量编辑书签" style="width: 800px">
      <batch-edit-form
          :bookmarks="bookmarks"
          @cancel="showBatchEditModal = false"
          @update-bookmarks="handleBatchUpdate"
      />
    </n-modal>


    <!-- 书签上下文菜单 -->
    <bookmark-context-menu
        ref="contextMenuRef"
        :bookmark="activeBookmark"
        @edit="handleEditBookmark"
        @delete="handleDeleteBookmark"
        @toggle-star="handleToggleStar"
        @select="toggleBookmarkSelection"
        @copy-url="() => {}"
        @open-url="() => {}"
        @add-to-folder="handleAddToFolder"
        @share="handleBookmarkShare"
    />

    <!-- 选择辅助面板 -->
    <bookmark-selection-helper
        :is-active="selectionMode"
        v-model:selected-bookmarks="selectedBookmarks"
        :all-bookmarks="filteredBookmarks"
        @batch-star="handleBatchStar"
        @batch-unstar="handleBatchUnstar"
        @batch-edit="showBatchEditModal = true"
        @batch-delete="handleBatchDelete"
        @exit-selection-mode="exitSelectionMode"
    />

    <!-- 悬浮操作按钮 -->
    <floating-action-button @action="handleFabAction" />

    <!-- 键盘快捷键管理器 -->
    <keyboard-shortcut-manager
        :shortcuts="currentSettings.advanced?.shortcuts || {
            addBookmark: { label: '添加书签', key: 'Ctrl+D' },
            search: { label: '搜索', key: 'Ctrl+F' },
            refresh: { label: '刷新', key: 'F5' },
            toggleSidebar: { label: '切换侧边栏', key: 'Ctrl+B' }
        }"
        @action="handleShortcutAction"
    />
  </div>
</template>

<script setup>
import {ref, computed, onMounted, h, nextTick} from 'vue'
import {useMessage} from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'
import BookmarkItem from '@/components/bookmarks/BookmarkItem.vue'
import AddBookmarkForm from '@/components/bookmarks/AddBookmarkForm.vue'
import ImportBookmarksForm from '@/components/bookmarks/ImportBookmarksForm.vue'
import FilterForm from '@/components/bookmarks/FilterForm.vue'
import ExportBookmarksForm from '@/components/bookmarks/ExportBookmarksForm.vue'
import BatchEditForm from '@/components/bookmarks/BatchEditForm.vue'
import BookmarkSelectionHelper from '@/components/bookmarks/BookmarkSelectionHelper.vue'
import BookmarkContextMenu from '@/components/bookmarks/BookmarkContextMenu.vue'
import FloatingActionButton from '@/components/bookmarks/FloatingActionButton.vue'
import KeyboardShortcutManager from '@/components/common/KeyboardShortcutManager.vue'

// 消息提示
const message = useMessage()

// 书签数据状态
const bookmarks = ref([
  {
    id: '1',
    title: 'SpringBoot 最佳实践',
    url: 'github.com/spring-projects/spring-boot',
    description: 'Spring Boot 官方仓库，包含最佳实践指南和示例代码。学习与 SpringBoot 的必备参考资源。',
    platform: 'github',
    tags: ['SpringBoot', 'Java'],
    createdTime: '5小时前添加',
    starred: true
  },
  {
    id: '2',
    title: 'Java 虚拟机深入解析',
    url: 'juejin.cn/post/jvm-advanced',
    description: '深入分析 JVM 内存模型、垃圾回收机制和性能调优技巧，适合进阶 Java 开发者阅读的高质量技术文章。',
    platform: 'juejin',
    tags: ['Java', 'JVM', '性能优化'],
    createdTime: '昨天添加',
    starred: false
  },
  {
    id: '3',
    title: 'MySQL 事务隔离级别详解',
    url: 'blog.csdn.net/mysql-transaction',
    description: '详细解析 MySQL 的四种事务隔离级别：读未提交、读已提交、可重复读和串行化，以及各级别的并发问题和实际应用场景。',
    platform: 'csdn',
    tags: ['MySQL', '数据库'],
    createdTime: '3天前添加',
    starred: false
  },
  {
    id: '4',
    title: 'RocketMQ 消息可靠性保证',
    url: 'mp.weixin.qq.com/article/123456',
    description: '探讨 RocketMQ 消息中间件如何保证消息不丢失，包括生产者确认机制、Broker 持久化策略和消费者 ACK 机制等内容。',
    platform: 'wechat',
    tags: ['RocketMQ', '消息中间件'],
    createdTime: '3天前添加',
    starred: false
  },
  {
    id: '5',
    title: 'Spring Cloud 微服务架构最佳实践',
    url: 'juejin.cn/post/spring-cloud-best-practices',
    description: '从实战角度介绍 Spring Cloud 微服务架构的设计与实现，涵盖服务注册与发现、配置中心、服务熔断、API 网关等核心组件。',
    platform: 'juejin',
    tags: ['Spring', '微服务'],
    createdTime: '上周添加',
    starred: true
  },
  {
    id: '6',
    title: 'Redis 高可用架构设计',
    url: 'www.cnblogs.com/redis-cluster-design',
    description: '分析 Redis 集群方案，哨兵模式和主从复制方案，以及各种高可用架构的优缺点和适用场景，附带实际部署案例。',
    platform: 'zhihu',
    tags: ['Redis', '分布式'],
    createdTime: '上周添加',
    starred: false
  }
])

// UI状态
const searchQuery = ref('')
const showAddBookmarkModal = ref(false)
const showImportModal = ref(false)
const showFilterModal = ref(false)
const activeTab = ref('all')
const selectedPlatform = ref('all')
const selectedTag = ref('')
const activeFilters = ref([])
const showMoreTags = ref(false)
const showExportModal = ref(false)
const showBatchEditModal = ref(false)
const selectedBookmarks = ref([])

// 添加选择模式相关状态
const selectionMode = ref(false)

// 添加上下文菜单相关状态
const contextMenuRef = ref(null)
const activeBookmark = ref(null)

// 排序选项
const sortOptions = ref([
  {label: '最近添加', key: 'recent'},
  {label: '标题升序', key: 'title-asc'},
  {label: '标题降序', key: 'title-desc'},
  {label: '收藏时间升序', key: 'date-asc'},
  {label: '收藏时间降序', key: 'date-desc'}
])
const currentSort = ref({label: '最近添加', key: 'recent'})

// 更多操作选项
const moreOptions = ref([
  {label: '导出书签', key: 'export', icon: () => h(IconFont, {type: 'icon-export'})},
  {label: '批量编辑', key: 'batch-edit', icon: () => h(IconFont, {type: 'icon-edit-square'})},
])

// 计算已收藏的书签数量
const countStarred = computed(() => {
  return bookmarks.value.filter(bookmark => bookmark.starred).length
})

// 平台统计
const platformCounts = computed(() => {
  const counts = {}
  let total = 0

  bookmarks.value.forEach(bookmark => {
    counts[bookmark.platform] = (counts[bookmark.platform] || 0) + 1
    total++
  })

  return {
    total,
    github: counts['github'] || 0,
    juejin: counts['juejin'] || 0,
    csdn: counts['csdn'] || 0,
    wechat: counts['wechat'] || 0,
    zhihu: counts['zhihu'] || 0,
    other: (counts['other'] || 0) + (counts['blog'] || 0)
  }
})

// 平台项目列表
const platformItems = computed(() => [
  {
    label: '全部平台',
    key: 'all',
    icon: 'icon-bijiben',
    count: platformCounts.value.total,
    iconColor: '#5b67eb'
  },
  {
    label: 'GitHub',
    key: 'github',
    icon: 'icon-icon_github',
    count: platformCounts.value.github,
    iconColor: '#24292e'
  },
  {
    label: '掘金',
    key: 'juejin',
    icon: 'icon-juejin',
    count: platformCounts.value.juejin,
    iconColor: '#1e80ff'
  },
  {
    label: 'CSDN',
    key: 'csdn',
    icon: 'icon-csdn1',
    count: platformCounts.value.csdn,
    iconColor: '#e33322'
  },
  {
    label: '微信公众号',
    key: 'wechat',
    icon: 'icon-weixingongzhonghao2',
    count: platformCounts.value.wechat,
    iconColor: '#07c160'
  },
  {
    label: '知乎',
    key: 'zhihu',
    icon: 'icon-zhihu',
    count: platformCounts.value.zhihu,
    iconColor: '#0066ff'
  },
  {
    label: '其他',
    key: 'other',
    icon: 'icon-link1',
    count: platformCounts.value.other,
    iconColor: '#888888'
  }
])

// 标签统计
const tagStats = computed(() => {
  const stats = {}

  bookmarks.value.forEach(bookmark => {
    bookmark.tags.forEach(tag => {
      stats[tag] = (stats[tag] || 0) + 1
    })
  })

  // 按数量排序
  return Object.entries(stats)
      .map(([tag, count]) => ({tag, count}))
      .sort((a, b) => b.count - a.count)
})

// 常用标签菜单
const tagMenuOptions = computed(() => {
  return tagStats.value.map(item => ({
    label: item.tag,
    key: item.tag.toLowerCase(),
    count: item.count
  }))
})

// 常用标签（显示前7个）
const popularTags = computed(() => {
  return tagMenuOptions.value.slice(0, 7)
})

// 可用标签列表
const availableTags = computed(() => {
  return tagStats.value.map(item => item.tag).sort()
})

// 筛选后的书签列表
const filteredBookmarks = computed(() => {
  let result = [...bookmarks.value]

  // 平台筛选
  if (selectedPlatform.value !== 'all') {
    result = result.filter(bookmark => bookmark.platform === selectedPlatform.value)
  }

  // 标签筛选
  if (selectedTag.value) {
    result = result.filter(bookmark =>
        bookmark.tags.some(tag => tag.toLowerCase() === selectedTag.value)
    )
  }

  // 活跃筛选条件
  if (activeFilters.value.length > 0) {
    activeFilters.value.forEach(filter => {
      if (filter.type === 'tag') {
        result = result.filter(bookmark =>
            bookmark.tags.some(tag => tag.toLowerCase() === filter.value.toLowerCase())
        )
      } else if (filter.type === 'platform') {
        result = result.filter(bookmark => bookmark.platform === filter.value)
      } else if (filter.value === 'starred') {
        result = result.filter(bookmark => bookmark.starred)
      }
    })
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 标签页筛选
  if (activeTab.value === 'recent') {
    result = result.filter(bookmark =>
        bookmark.createdTime.includes('小时') ||
        bookmark.createdTime.includes('昨天') ||
        bookmark.createdTime.includes('天前')
    )
  } else if (activeTab.value === 'frequent') {
    result = result.filter(bookmark => bookmark.starred)
  }

  // 排序
  switch (currentSort.value.key) {
    case 'title-asc':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'title-desc':
      result.sort((a, b) => b.title.localeCompare(a.title))
      break
    case 'date-asc':
      // 简化处理，实际应使用真实日期
      result.sort((a, b) => a.createdTime.localeCompare(b.createdTime))
      break
    case 'date-desc':
      result.sort((a, b) => b.createdTime.localeCompare(a.createdTime))
      break
    default:
      // 最近添加（默认排序）
      break
  }

  return result
})

// 计算当前书签是否被选中
function isBookmarkSelected(bookmark) {
  return selectedBookmarks.value.some(b => b.id === bookmark.id)
}

// 处理搜索
function handleSearch(value) {
  searchQuery.value = value
}

// 清除搜索
function clearSearch() {
  searchQuery.value = ''
}

// 添加筛选条件
function addFilter(filter) {
  if (!activeFilters.value.some(f => f.value === filter.value)) {
    activeFilters.value.push(filter)
  }
}

// 移除筛选条件
function removeFilter(filter) {
  activeFilters.value = activeFilters.value.filter(f => f.value !== filter.value)
}

// 清除所有筛选条件
function clearFilters() {
  activeFilters.value = []
  searchQuery.value = ''
  selectedPlatform.value = 'all'
  selectedTag.value = ''
  activeTab.value = 'all'
}

// 应用筛选
function applyFilters(filters) {
  activeFilters.value = filters
  showFilterModal.value = false
}

// 排序变更
function handleSortChange(key) {
  const option = sortOptions.value.find(opt => opt.key === key)
  if (option) {
    currentSort.value = option
  }
}

// 更多操作处理
function handleMoreAction(key) {
  switch (key) {
    case 'export':
      showExportModal.value = true
      break
    case 'batch-edit':
      showBatchEditModal.value = true
      break
  }
}

// 管理标签
function manageTagsClick() {
  message.info('标签管理功能开发中')
}

// 添加书签
function handleAddBookmark(data) {
  const newBookmark = {
    id: Date.now().toString(),
    title: data.title,
    url: data.url,
    description: data.description,
    platform: data.platform || detectPlatform(data.url),
    tags: data.tags || [],
    createdTime: '刚刚添加',
    starred: data.starred || false
  }

  bookmarks.value.unshift(newBookmark)
  showAddBookmarkModal.value = false
  message.success('书签添加成功')
}

// 导入书签
function handleImportBookmarks(data) {
  message.success(`成功导入 ${data.count || 5} 个书签`)
  showImportModal.value = false
}

// 编辑书签
function handleEditBookmark(bookmark) {
  message.info(`编辑书签: ${bookmark.title}`)
}

// 删除书签
function handleDeleteBookmark(bookmark) {
  bookmarks.value = bookmarks.value.filter(b => b.id !== bookmark.id)
  message.success('书签已删除')
}

// 收藏/取消收藏
function handleToggleStar(bookmark) {
  const index = bookmarks.value.findIndex(b => b.id === bookmark.id)
  if (index !== -1) {
    bookmarks.value[index].starred = !bookmarks.value[index].starred
  }
}

// 根据URL检测平台
function detectPlatform(url) {
  if (url.includes('github')) return 'github'
  if (url.includes('juejin')) return 'juejin'
  if (url.includes('csdn')) return 'csdn'
  if (url.includes('weixin') || url.includes('wechat')) return 'wechat'
  if (url.includes('zhihu')) return 'zhihu'
  if (url.includes('blog')) return 'blog'
  return 'other'
}

// 处理批量编辑更新的函数
function handleBatchUpdate(updatedBookmarks) {
  bookmarks.value = updatedBookmarks
  message.success('书签已批量更新')
}


// 获取当前设置的计算属性
const currentSettings = computed(() => {
  // 从本地存储或默认值获取设置
  const savedSettings = localStorage.getItem('bookmarkSettings')
  return savedSettings ? JSON.parse(savedSettings) : {
    theme: {
      colorMode: 'light',
      primaryColor: 'blue'
    },
    layout: {
      cardStyle: 'default',
      defaultView: 'card',
      sidebarOptions: ['autoCollapse']
    },
    data: {
      storageType: 'local',
      syncOptions: ['autoSync'],
      autoBackupOptions: [],
      backupFrequency: 'weekly',
      isLoggedIn: false
    },
    advanced: {
      performanceOptions: ['lazyLoadImages'],
      updateThrottle: 300,
      shortcuts: {
        addBookmark: {label: '添加书签', key: 'Ctrl+D'},
        search: {label: '搜索', key: 'Ctrl+F'},
        refresh: {label: '刷新', key: 'F5'},
        toggleSidebar: {label: '切换侧边栏', key: 'Ctrl+B'}
      }
    }
  }
})

// 选择模式相关函数
function enterSelectionMode() {
  selectionMode.value = true
  selectedBookmarks.value = []
}

function exitSelectionMode() {
  selectionMode.value = false
  selectedBookmarks.value = []
}

function toggleBookmarkSelection(bookmark) {
  const index = selectedBookmarks.value.findIndex(b => b.id === bookmark.id)
  if (index === -1) {
    selectedBookmarks.value.push(bookmark)
  } else {
    selectedBookmarks.value.splice(index, 1)
  }
}

// 批量操作相关函数
function handleBatchStar() {
  if (selectedBookmarks.value.length === 0) return

  const updatedBookmarks = [...bookmarks.value]
  const selectedIds = new Set(selectedBookmarks.value.map(b => b.id))

  updatedBookmarks.forEach(bookmark => {
    if (selectedIds.has(bookmark.id)) {
      bookmark.starred = true
    }
  })

  bookmarks.value = updatedBookmarks
  message.success(`已将 ${selectedBookmarks.value.length} 个书签标记为收藏`)
}

function handleBatchUnstar() {
  if (selectedBookmarks.value.length === 0) return

  const updatedBookmarks = [...bookmarks.value]
  const selectedIds = new Set(selectedBookmarks.value.map(b => b.id))

  updatedBookmarks.forEach(bookmark => {
    if (selectedIds.has(bookmark.id)) {
      bookmark.starred = false
    }
  })

  bookmarks.value = updatedBookmarks
  message.success(`已取消 ${selectedBookmarks.value.length} 个书签的收藏标记`)
}

function handleBatchDelete() {
  if (selectedBookmarks.value.length === 0) return

  const selectedIds = new Set(selectedBookmarks.value.map(b => b.id))
  bookmarks.value = bookmarks.value.filter(bookmark => !selectedIds.has(bookmark.id))

  message.success(`已删除 ${selectedBookmarks.value.length} 个书签`)
  exitSelectionMode()
}

// 上下文菜单相关函数
function handleBookmarkContextMenu(event, bookmark) {
  event.preventDefault()
  activeBookmark.value = bookmark
  nextTick(() => {
    if (contextMenuRef.value) {
      contextMenuRef.value.open(event)
    }
  })
}

// 分享和文件夹功能的处理函数
function handleBookmarkShare(bookmark, type) {
  switch (type) {
    case 'copy':
      navigator.clipboard.writeText(`${window.location.origin}/share?id=${bookmark.id}`)
          .then(() => message.success('分享链接已复制'))
          .catch(() => message.error('复制失败'))
      break
    case 'qrcode':
      message.info('二维码分享功能开发中')
      break
    case 'wechat':
      message.info('微信分享功能开发中')
      break
  }
}

function handleAddToFolder(bookmark, folderName) {
  if (folderName === '新建文件夹') {
    message.info('新建文件夹功能开发中')
  } else {
    message.success(`已将 "${bookmark.title}" 添加到 "${folderName}" 文件夹`)
  }
}

// 处理 FAB 操作的函数
function handleFabAction(action) {
  switch (action) {
    case 'add-bookmark':
      showAddBookmarkModal.value = true
      break
    case 'import-bookmarks':
      showImportModal.value = true
      break
    case 'scan-qrcode':
      message.info('扫描二维码功能开发中')
      break
    case 'browser-extension':
      message.info('浏览器插件功能开发中')
      break
  }
}

// 处理快捷键动作的函数
function handleShortcutAction(action) {
  switch (action) {
    case 'addBookmark':
      showAddBookmarkModal.value = true
      break
    case 'search':
      // 聚焦到搜索框
      const searchInput = document.querySelector('.search-input input')
      if (searchInput) {
        searchInput.focus()
      }
      break
    case 'refresh':
      // 刷新数据
      message.info('刷新数据')
      // 这里可以添加实际的刷新逻辑
      break
    case 'toggleSidebar':
      // 切换侧边栏
      message.info('切换侧边栏')
      // 这里可以添加侧边栏切换逻辑
      break
  }
}

// 组件挂载后初始化
onMounted(() => {
  // 加载数据或其他初始化操作
})
</script>

<style scoped>
.bookmarks-container {
  padding: var(--content-padding);
}

/* 全新顶部区域样式 */
.header-wrapper {
  position: relative;
  margin-bottom: 28px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
  box-shadow: 0 10px 30px rgba(51, 83, 216, 0.07),
  0 4px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  height: 220px;
}

.header-wrapper:hover {
  box-shadow: 0 15px 35px rgba(51, 83, 216, 0.09),
  0 6px 10px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

/* 装饰元素 */
.header-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;
}

.decoration-item {
  position: absolute;
}

.bookmark-icon-large {
  top: -40px;
  right: 15%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(99, 102, 241, 0) 70%);
  border-radius: 50%;
}

.bookmark-icon-large::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 80px;
  transform: translate(-50%, -50%) rotate(-15deg);
  background-color: rgba(99, 102, 241, 0.05);
  clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
}

.dots-pattern {
  bottom: 40px;
  left: 15%;
  width: 150px;
  height: 60px;
  opacity: 0.07;
  background-image: radial-gradient(circle, var(--primary-color) 2px, transparent 2px);
  background-size: 12px 12px;
}

.wave-line {
  top: 30px;
  right: 0;
  width: 40%;
  height: 120px;
  opacity: 0.04;
  background: linear-gradient(90deg, transparent, var(--info-color) 20%, var(--primary-color) 40%, var(--success-color) 60%, transparent 100%);
  height: 2px;
  transform: rotate(-5deg);
}

.circle-group {
  position: absolute;
  top: 40px;
  left: 20%;
}

.circle {
  position: absolute;
  border-radius: 50%;
}

.circle-1 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(255, 106, 97, 0.05) 0%, rgba(255, 106, 97, 0) 70%);
}

.circle-2 {
  width: 40px;
  height: 40px;
  left: 70px;
  top: 40px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 70%);
}

.circle-3 {
  width: 60px;
  height: 60px;
  left: -30px;
  top: 50px;
  background: radial-gradient(circle, rgba(5, 196, 107, 0.05) 0%, rgba(5, 196, 107, 0) 70%);
}

/* 内容样式 */
.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 28px 32px;
}

.header-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 70%;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.title-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.2);
}

.title-icon {
  font-size: 28px;
  color: white;
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color-base);
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(135deg, #333333 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.sub-title {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0;
  opacity: 0.8;
}

/* 统计卡片样式 */
.stats-cards {
  display: flex;
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(235, 238, 245, 0.9);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  margin-right: 12px;
  font-size: 18px;
  color: white;
}

.total-icon {
  background: linear-gradient(135deg, #5b67eb 0%, #7b68ee 100%);
}

.starred-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.tags-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-base);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

/* 右侧按钮样式 */
.header-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.import-button, .add-button {
  padding: 0 20px;
  height: 44px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.import-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
}

.add-button {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
}

.import-button:hover, .add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.more-button {
  width: 44px;
  height: 44px;
  font-size: 18px;
  background-color: white;
  border: 1px solid rgba(235, 238, 245, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.more-button:hover {
  background-color: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 搜索和筛选区样式 */
.search-filter-wrapper {
  margin-bottom: 24px;
}

.search-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.search-card:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
}

.search-filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box-wrapper {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input:focus-within {
  transform: translateY(-1px);
}

.filter-btn {
  border-radius: 8px;
  min-width: 80px;
}

.active-filters-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filters-label {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-right: 8px;
}

.active-filters, .quick-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.filter-tag {
  border-radius: 16px;
  padding: 0 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.filter-tag:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.quick-tag {
  cursor: pointer;
}

.clear-filters-btn, .add-filter-btn {
  font-size: 12px;
}

/* 主内容区域样式 */
.main-content-section {
  align-items: flex-start; /* 使左侧分类栏和右侧内容顶部对齐 */
}

.bookmark-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 自定义左侧分类导航样式 */
.category-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  overflow: hidden;
  height: 100%;
  transition: box-shadow 0.3s ease;
}

.category-card:hover {
  box-shadow: var(--box-shadow-2);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--divider-color);
}

.category-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color-base);
  margin: 0;
}

.manage-tags-btn {
  font-size: 13px;
  padding: 0;
  height: auto;
}

.category-body {
  padding: 8px 0;
}

/* 平台列表样式 */
.platform-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.platform-item::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.platform-item:hover::before {
  width: 100%;
}

.platform-item.active::before {
  width: 100%;
  height: 3px;
}

.platform-item:hover {
  background-color: rgba(99, 102, 241, 0.06);
}

.platform-item.active {
  background-color: rgba(99, 102, 241, 0.1);
}

.platform-item.active .platform-name {
  color: var(--primary-color);
  font-weight: 500;
}

.platform-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.platform-name {
  flex: 1;
  color: var(--text-color-base);
}

.platform-count {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--text-color-secondary);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 30px;
  text-align: center;
}

/* 标签列表样式 */
.tag-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.tag-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--primary-color);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  border-radius: 4px;
}

.tag-item:hover::before {
  opacity: 0.05;
}

.tag-item.active::before {
  opacity: 0.1;
}

.tag-item:hover {
  background-color: rgba(99, 102, 241, 0.06);
}

.tag-item.active {
  background-color: rgba(99, 102, 241, 0.1);
}

.tag-item.active .tag-name {
  color: var(--primary-color);
  font-weight: 500;
}

.tag-name {
  flex: 1;
  color: var(--text-color-base);
}

.tag-count {
  color: var(--text-color-tertiary);
  font-size: 12px;
  min-width: 24px;
  text-align: center;
}

.more-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--primary-color);
  transition: background-color 0.2s ease;
  margin-top: 4px;
}

.more-tags:hover {
  background-color: rgba(99, 102, 241, 0.06);
}

.more-tags-text {
  margin-right: 4px;
  font-size: 13px;
}

/* 改善书签项淡入效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bookmark-items > * {
  animation: fadeIn 0.3s ease forwards;
}

.bookmark-items > *:nth-child(1) {
  animation-delay: 0.05s;
}

.bookmark-items > *:nth-child(2) {
  animation-delay: 0.1s;
}

.bookmark-items > *:nth-child(3) {
  animation-delay: 0.15s;
}

.bookmark-items > *:nth-child(4) {
  animation-delay: 0.2s;
}

.bookmark-items > *:nth-child(5) {
  animation-delay: 0.25s;
}

.bookmark-items > *:nth-child(6) {
  animation-delay: 0.3s;
}

.bookmark-items > *:nth-child(7) {
  animation-delay: 0.35s;
}

.bookmark-items > *:nth-child(8) {
  animation-delay: 0.4s;
}

/* 改善空状态效果 */
.empty-state {
  transition: all 0.3s ease;
}

.empty-state:hover {
  transform: scale(1.02);
}

/* 添加新按钮样式 */
.selection-button {
  padding: 0 20px;
  height: 44px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border: none;
}

.selection-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.18);
}

/* 改善页面淡入效果 */
.bookmarks-container {
  animation: fadeIn 0.5s ease;
}

/* 改善顶部区域效果 */
.header-wrapper {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.header-wrapper:hover {
  box-shadow: 0 15px 40px rgba(51, 83, 216, 0.12),
  0 8px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-4px);
}

:deep(.n-card-header) {
  padding-bottom: 8px;
}

:deep(.n-card-header__main) {
  font-weight: 500;
  font-size: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-wrapper {
    height: auto;
    padding-bottom: 24px;
  }

  .header-left {
    max-width: 100%;
  }

  .stats-cards {
    flex-wrap: wrap;
    width: 100%;
  }

  .stat-card {
    flex: 1;
    min-width: 100px;
  }

  .header-right {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .import-button, .add-button, .selection-button {
    flex: 1;
  }

  .main-content-section {
    flex-direction: column;
  }

  .category-nav {
    width: 100% !important;
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>