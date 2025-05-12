<!-- 调整间距的视频分类页面 -->
<template>
  <div class="video-category-page">
    <!-- 页面头部区域 - 全新设计 -->
    <div class="hero-header">
      <div class="header-container">
        <!-- 背景装饰 -->
        <div class="header-bg">
          <div class="bg-pattern"></div>
          <div class="bg-gradient"></div>
        </div>

        <!-- 面包屑导航 -->
        <nav class="breadcrumb-nav">
          <a @click="router.push('/video')" class="breadcrumb-item">
            <icon-font type="icon-video-camera" :size="16" />
            <span>视频学习</span>
          </a>
          <span class="breadcrumb-separator">
            <icon-font type="icon-arrow-right" :size="14" />
          </span>
          <span class="breadcrumb-current">
            {{ currentCategory?.name || '分类' }}
          </span>
        </nav>

        <!-- 分类信息展示 -->
        <div class="category-showcase">
          <div class="category-info">
            <div class="category-header">
              <div class="category-icon-wrapper" v-if="currentCategory">
                <icon-font :type="currentCategory.icon" :size="48" class="category-icon" />
              </div>
              <h1 class="category-title">
                {{ currentCategory?.name || '视频分类' }}
              </h1>
            </div>

            <p class="category-description" v-if="currentCategory?.description">
              {{ currentCategory.description }}
            </p>

            <!-- 分类统计信息 -->
            <div class="category-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <icon-font type="icon-course" :size="20" />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ categoryCourses.length }}</span>
                  <span class="stat-label">门课程</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon">
                  <icon-font type="icon-video" :size="20" />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ categoryVideos.length }}</span>
                  <span class="stat-label">个视频</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon">
                  <icon-font type="icon-eye" :size="20" />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ formatViews(totalViews) }}</span>
                  <span class="stat-label">总观看</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 搜索和筛选区域 -->
          <div class="filters-container">
            <div class="search-section">
              <div class="search-wrapper">
                <icon-font type="icon-search" :size="20" class="search-icon" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索课程或视频..."
                    class="search-input"
                />
                <button class="search-button" @click="handleSearch">
                  搜索
                </button>
              </div>
            </div>

            <div class="sort-section">
              <button
                  class="filter-button"
                  :class="{ active: filterType === 'all' }"
                  @click="setFilterType('all')"
              >
                <icon-font type="icon-all" :size="16" />
                全部
              </button>

              <button
                  class="filter-button"
                  :class="{ active: filterType === 'courses' }"
                  @click="setFilterType('courses')"
              >
                <icon-font type="icon-course" :size="16" />
                课程
              </button>

              <button
                  class="filter-button"
                  :class="{ active: filterType === 'videos' }"
                  @click="setFilterType('videos')"
              >
                <icon-font type="icon-video" :size="16" />
                视频
              </button>

              <!-- 排序下拉框 -->
              <div class="sort-dropdown" :class="{ open: showSortDropdown }">
                <button
                    class="sort-button"
                    @click="toggleSortDropdown"
                >
                  <icon-font type="icon-sort" :size="16" />
                  <span>{{ sortText }}</span>
                  <icon-font type="icon-down" :size="14" />
                </button>

                <div class="dropdown-menu" v-if="showSortDropdown">
                  <button
                      v-for="option in sortOptions"
                      :key="option.key"
                      class="dropdown-item"
                      :class="{ active: sortOption === option.key }"
                      @click="handleSortChange(option.key)"
                  >
                    <icon-font :type="option.icon" :size="16" />
                    <span>{{ option.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="videoStore.isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 内容展示 -->
        <template v-else>
          <!-- 课程区块 -->
          <section v-if="(filterType === 'all' || filterType === 'courses') && filteredCourses.length > 0" class="content-section">
            <div class="section-header">
              <div class="section-title-wrapper">
                <h2 class="section-title">
                  <icon-font type="icon-course" :size="24" />
                  <span>课程</span>
                  <span class="count-badge">{{ filteredCourses.length }}</span>
                </h2>
                <p class="section-subtitle">系统化学习，从入门到精通</p>
              </div>

              <button v-if="filterType === 'all' && filteredCourses.length > 6" class="view-all-button">
                查看全部课程
                <icon-font type="icon-arrow-right" :size="14" />
              </button>
            </div>

            <div class="courses-grid">
              <div
                  v-for="course in displayedCourses"
                  :key="course.id"
                  class="course-card"
                  @click="router.push(`/video/course/${course.id}`)"
              >
                <div class="card-image">
                  <img :src="course.thumbnail || getDefaultThumbnail(course.id)" :alt="course.name" class="course-image" />
                  <div class="image-overlay">
                    <button class="play-button">
                      <icon-font type="icon-play" :size="32" />
                    </button>
                  </div>
                  <div class="card-badges">
                    <span class="badge level-badge" :class="getLevelClass(course.level)">
                      {{ course.level || '初级' }}
                    </span>
                    <span v-if="course.isHot" class="badge hot-badge">HOT</span>
                    <span v-if="course.isNew" class="badge new-badge">NEW</span>
                  </div>
                  <div class="duration-badge">
                    <icon-font type="icon-time" :size="14" />
                    <span>{{ formatDuration(course.duration) }}</span>
                  </div>
                </div>

                <div class="card-content">
                  <h3 class="course-title">{{ course.name }}</h3>
                  <p class="course-description">{{ course.description || '精心设计的课程，带你从零开始掌握核心技能。' }}</p>

                  <div class="course-meta">
                    <div class="instructor-info">
                      <img :src="course.instructorAvatar || getDefaultAvatar(course.instructor)" :alt="course.instructor" class="instructor-avatar" />
                      <span class="instructor-name">{{ course.instructor || '资深讲师' }}</span>
                    </div>

                    <div class="course-stats">
                      <div class="stat-item">
                        <icon-font type="icon-user" :size="14" />
                        <span>{{ formatNumber(course.studentsCount || Math.floor(Math.random() * 5000 + 500)) }}</span>
                      </div>
                      <div class="stat-item rating">
                        <icon-font type="icon-star" :size="14" />
                        <span>{{ (Math.random() * 1 + 4).toFixed(1) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer">
                    <div class="progress-info" v-if="course.progress">
                      <div class="progress-text">
                        <span>学习进度</span>
                        <span class="progress-value">{{ course.progress }}%</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
                      </div>
                    </div>

                    <button class="action-button">
                      <icon-font :type="course.progress ? 'icon-continue' : 'icon-start'" :size="16" />
                      <span>{{ course.progress ? '继续学习' : '开始学习' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 视频区块 -->
          <section v-if="(filterType === 'all' || filterType === 'videos') && filteredVideos.length > 0" class="content-section">
            <div class="section-header">
              <div class="section-title-wrapper">
                <h2 class="section-title">
                  <icon-font type="icon-video" :size="24" />
                  <span>单个视频</span>
                  <span class="count-badge">{{ filteredVideos.length }}</span>
                </h2>
                <p class="section-subtitle">精选视频内容，快速掌握关键知识点</p>
              </div>

              <button v-if="filterType === 'all' && filteredVideos.length > 8" class="view-all-button">
                查看全部视频
                <icon-font type="icon-arrow-right" :size="14" />
              </button>
            </div>

            <div class="videos-grid">
              <div
                  v-for="video in displayedVideos"
                  :key="video.id"
                  class="video-card"
                  @click="router.push(`/video/watch/${video.id}`)"
              >
                <div class="video-thumbnail">
                  <img :src="video.thumbnail || getDefaultThumbnail(video.id)" :alt="video.title" class="video-image" />
                  <div class="video-overlay">
                    <button class="play-button play-button-small">
                      <icon-font type="icon-play" :size="24" />
                    </button>
                  </div>
                  <div class="video-badges">
                    <span v-if="video.isHot" class="badge hot-badge">HOT</span>
                    <span v-if="video.isNew" class="badge new-badge">NEW</span>
                  </div>
                  <div class="duration-badge">
                    <icon-font type="icon-time" :size="12" />
                    <span>{{ formatDuration(video.duration) }}</span>
                  </div>
                  <div class="video-progress" v-if="video.progress" :style="{ width: video.progress + '%' }"></div>
                </div>

                <div class="video-info">
                  <h4 class="video-title">{{ video.title }}</h4>
                  <div class="video-meta">
                    <div class="instructor-info">
                      <img :src="video.instructorAvatar || getDefaultAvatar(video.instructor)" :alt="video.instructor" class="instructor-avatar" />
                      <span class="instructor-name">{{ video.instructor || '资深讲师' }}</span>
                    </div>

                    <div class="video-stats">
                      <div class="stat-item">
                        <icon-font type="icon-eye" :size="12" />
                        <span>{{ formatNumber(video.views || Math.floor(Math.random() * 10000 + 100)) }}</span>
                      </div>
                      <div class="stat-item">
                        <icon-font type="icon-like" :size="12" />
                        <span>{{ formatNumber(video.likes || Math.floor(Math.random() * 500 + 10)) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="video-tags" v-if="video.tags && video.tags.length">
                    <span v-for="tag in video.tags.slice(0, 3)" :key="tag" class="tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 空状态 -->
          <div v-if="filteredCourses.length === 0 && filteredVideos.length === 0" class="empty-state">
            <div class="empty-illustration">
              <div class="empty-icon">
                <icon-font type="icon-empty-search" :size="64" />
              </div>
              <div class="empty-text">
                <h3>未找到相关内容</h3>
                <p>试试调整搜索条件，或者探索其他分类</p>
              </div>
              <div class="empty-actions">
                <button class="primary-button" @click="clearFilters">
                  <icon-font type="icon-refresh" :size="16" />
                  清空筛选
                </button>
                <button class="secondary-button" @click="router.push('/video/upload')">
                  <icon-font type="icon-upload" :size="16" />
                  上传视频
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideoStore } from '@/stores/video'
import IconFont from "@/components/common/IconFont.vue";

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()

// 响应式数据
const categoryId = computed(() => route.params.categoryId as string)
const searchQuery = ref('')
const sortOption = ref('default')
const filterType = ref('all') // 'all', 'courses', 'videos'
const showSortDropdown = ref(false)

// 排序选项
const sortOptions = [
  { label: '综合排序', key: 'default', icon: 'icon-sort' },
  { label: '最新发布', key: 'time-desc', icon: 'icon-calendar' },
  { label: '最多学习', key: 'popular', icon: 'icon-hot' },
  { label: '按名称', key: 'name', icon: 'icon-font' }
]

// 计算属性
const sortText = computed(() => {
  const option = sortOptions.find(opt => opt.key === sortOption.value)
  return option ? option.label : '综合排序'
})

const currentCategory = computed(() => {
  return videoStore.categories.find(category => category.id === categoryId.value)
})

const categoryCourses = computed(() => {
  return videoStore.courses.filter(course => course.categoryId === categoryId.value)
})

const categoryVideos = computed(() => {
  return videoStore.videos.filter(video => {
    const course = videoStore.courses.find(c => c.id === video.courseId)
    return course && course.categoryId === categoryId.value
  })
})

const totalViews = computed(() => {
  return [...categoryCourses.value, ...categoryVideos.value].reduce((sum, item) =>
      sum + (item.views || Math.floor(Math.random() * 10000 + 100)), 0
  )
})

// 过滤和排序逻辑
const filteredCourses = computed(() => {
  let filtered = [...categoryCourses.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query)
    )
  }

  return sortItems(filtered)
})

const filteredVideos = computed(() => {
  let filtered = [...categoryVideos.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return sortItems(filtered)
})

const displayedCourses = computed(() => {
  if (filterType.value === 'all') {
    return filteredCourses.value.slice(0, 6)
  }
  return filteredCourses.value
})

const displayedVideos = computed(() => {
  if (filterType.value === 'all') {
    return filteredVideos.value.slice(0, 8)
  }
  return filteredVideos.value
})

// 方法
function sortItems(items) {
  const sortedItems = [...items]

  switch (sortOption.value) {
    case 'time-desc':
      return sortedItems.sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )
    case 'popular':
      return sortedItems.sort((a, b) =>
          (b.studentsCount || b.views || 0) - (a.studentsCount || a.views || 0)
      )
    case 'name':
      return sortedItems.sort((a, b) =>
          (a.name || a.title || '').localeCompare(b.name || b.title || '')
      )
    default:
      return sortedItems
  }
}

function setFilterType(type) {
  filterType.value = type
}

function handleSortChange(key) {
  sortOption.value = key
  showSortDropdown.value = false
}

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value
}

function handleSearch() {
  // 搜索逻辑已在计算属性中实现
}

function clearFilters() {
  searchQuery.value = ''
  sortOption.value = 'default'
  filterType.value = 'all'
}

function formatDuration(seconds) {
  if (!seconds) return '00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

function formatViews(views) {
  return formatNumber(views)
}

function getLevelClass(level) {
  switch (level) {
    case '初级': return 'level-beginner'
    case '中级': return 'level-intermediate'
    case '高级': return 'level-advanced'
    default: return 'level-beginner'
  }
}

function getDefaultThumbnail(id) {
  return `https://picsum.photos/seed/${id}/640/360`
}

function getDefaultAvatar(instructor) {
  return `https://i.pravatar.cc/150?u=${instructor || 'default'}`
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    videoStore.fetchCategories(),
    videoStore.fetchCourses(),
    videoStore.fetchVideos()
  ])

  // 点击外部关闭下拉框
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  const dropdown = document.querySelector('.sort-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    showSortDropdown.value = false
  }
}

// 搜索防抖
const searchTimeoutId = ref(null)
watch(searchQuery, () => {
  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value)
  }

  searchTimeoutId.value = setTimeout(() => {
    // 搜索逻辑会在计算属性中自动执行
  }, 300)
})
</script>

<style scoped>
/* 基础变量 */
.video-category-page {
  background: #FAFAFA;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 页面头部区域 - 调整宽度和内边距 */
.hero-header {
  position: relative;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  overflow: hidden;
}

.header-container {
  max-width: 100%; /* 改为100%充满屏幕宽度 */
  margin: 0 auto;
  padding: 32px 40px; /* 和主页保持一致的内边距 */
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image:
      linear-gradient(45deg, #0F172A 25%, transparent 25%),
      linear-gradient(-45deg, #0F172A 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #0F172A 75%),
      linear-gradient(-45deg, transparent 75%, #0F172A 75%);
  background-size: 30px 30px;
  background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
}

/* 面包屑导航 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  position: relative;
  z-index: 2;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3B82F6;
  cursor: pointer;
  transition: color 0.2s ease;
  font-weight: 500;
}

.breadcrumb-item:hover {
  color: #1E40AF;
}

.breadcrumb-separator {
  color: #CBD5E1;
}

.breadcrumb-current {
  color: #475569;
  font-weight: 600;
}

/* 分类展示区域 */
.category-showcase {
  position: relative;
  z-index: 2;
}

.category-info {
  margin-bottom: 32px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.category-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

.category-title {
  font-size: 32px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  line-height: 1.1;
}

.category-description {
  font-size: 16px;
  color: #64748B;
  line-height: 1.6;
  max-width: 600px;
  margin-bottom: 24px;
}

.category-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3B82F6;
  transition: all 0.3s ease;
}

.stat-item:hover .stat-icon {
  background: #E0E7FF;
  transform: scale(1.1);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748B;
}

/* 搜索和筛选区域 */
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-section {
  width: 100%;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 480px;
}

.search-wrapper:focus-within {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  color: #94A3B8;
  margin: 0 16px;
}

.search-input {
  flex: 1;
  padding: 12px 0;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: #0F172A;
}

.search-input::placeholder {
  color: #94A3B8;
}

.search-button {
  padding: 12px 24px;
  background: #3B82F6;
  color: white;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-button:hover {
  background: #1E40AF;
}

.sort-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  border-color: #CBD5E1;
  background: #F8FAFC;
}

.filter-button.active {
  border-color: #3B82F6;
  background: #EFF6FF;
  color: #3B82F6;
}

.sort-dropdown {
  position: relative;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.sort-button:hover {
  border-color: #CBD5E1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  color: #475569;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #F8FAFC;
}

.dropdown-item.active {
  background: #EFF6FF;
  color: #3B82F6;
}

/* 内容区域 - 调整宽度和内边距 */
.content-area {
  background: #FAFAFA;
}

.content-container {
  max-width: 100%; /* 改为100%充满屏幕宽度 */
  margin: 0 auto;
  padding: 32px 40px; /* 和主页保持一致的内边距 */
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E2E8F0;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 内容区块 */
.content-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px 32px;
  border-bottom: 1px solid #F1F5F9;
  background: linear-gradient(135deg, #FAFAFA 0%, #F8FAFC 100%);
}

.section-title-wrapper {
  flex: 1;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 4px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: #3B82F6;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.section-subtitle {
  font-size: 14px;
  color: #64748B;
}

.view-all-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-button:hover {
  border-color: #3B82F6;
  color: #3B82F6;
  transform: translateX(4px);
}

/* 课程网格 - 调整最小宽度 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 进一步减小最小宽度 */
  gap: 20px; /* 减小间距 */
  padding: 24px; /* 减小内边距 */
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #F1F5F9;
  position: relative;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
  border-color: #E0E7FF;
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.course-card:hover .course-image {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .image-overlay {
  opacity: 1;
}

.play-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  transition: all 0.3s ease;
  transform: scale(0.8);
}

.course-card:hover .play-button {
  transform: scale(1);
  background: white;
}

.card-badges {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  color: white;
}

.level-beginner {
  background: rgba(59, 130, 246, 0.9);
}

.level-intermediate {
  background: rgba(245, 158, 11, 0.9);
}

.level-advanced {
  background: rgba(220, 38, 38, 0.9);
}

.hot-badge {
  background: rgba(220, 38, 38, 0.9);
}

.new-badge {
  background: rgba(16, 185, 129, 0.9);
}

.duration-badge {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-content {
  padding: 24px;
}

.course-title {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-description {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instructor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.instructor-name {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.course-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748B;
}

.rating {
  color: #F59E0B;
}

.card-footer {
  margin-top: 20px;
}

.progress-info {
  margin-bottom: 12px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
}

.progress-value {
  color: #3B82F6;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #1E40AF);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.action-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #F8FAFC;
  color: #3B82F6;
  border: 1px solid #E0E7FF;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

/* 视频网格 - 调整最小宽度 */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); /* 进一步减小最小宽度 */
  gap: 20px; /* 减小间距 */
  padding: 24px; /* 减小内边距 */
}

.video-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #F1F5F9;
}

.video-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: #E0E7FF;
}

.video-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.video-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.video-card:hover .video-image {
  transform: scale(1.08);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .video-overlay {
  opacity: 1;
}

.play-button-small {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  transition: all 0.3s ease;
}

.video-card:hover .play-button-small {
  background: white;
  transform: scale(1.1);
}

.video-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
}

.video-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: #3B82F6;
  transition: width 0.6s ease;
}

.video-info {
  padding: 20px;
}

.video-title {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.video-stats {
  display: flex;
  gap: 12px;
}

.video-stats .stat-item {
  font-size: 12px;
}

.video-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 8px;
  background: #F1F5F9;
  color: #64748B;
  border-radius: 4px;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 32px;
}

.empty-illustration {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  margin: 0 auto 24px;
}

.empty-text {
  margin-bottom: 32px;
}

.empty-text h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 8px;
}

.empty-text p {
  font-size: 15px;
  color: #64748B;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.primary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background: #1E40AF;
  transform: translateY(-2px);
}

.secondary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #475569;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  border-color: #CBD5E1;
  background: #F8FAFC;
}

/* 响应式设计 - 调整断点和内边距 */
@media (max-width: 1600px) {
  .header-container,
  .content-container {
    padding: 32px 30px; /* 在较大屏幕上减少内边距 */
  }
}

@media (max-width: 1400px) {
  .header-container,
  .content-container {
    padding: 24px 25px;
  }

  .category-title {
    font-size: 28px;
  }

  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 1200px) {
  .header-container,
  .content-container {
    padding: 24px 20px;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .category-stats {
    gap: 24px;
  }

  .filters-container {
    flex-direction: column;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .sort-section {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .header-container,
  .content-container {
    padding: 20px 16px;
  }

  .category-title {
    font-size: 24px;
  }

  .courses-grid,
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding: 20px;
  }

  .section-header {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .section-title {
    flex-wrap: wrap;
  }

  .view-all-button {
    align-self: flex-start;
  }
}

@media (max-width: 640px) {
  .header-container,
  .content-container {
    padding: 16px 12px;
  }

  .category-stats {
    flex-direction: column;
    gap: 16px;
  }

  .courses-grid,
  .videos-grid {
    grid-template-columns: 1fr;
  }

  .sort-section {
    gap: 4px;
  }

  .filter-button,
  .sort-button {
    flex: 1;
    justify-content: center;
  }

  .empty-state {
    padding: 40px 16px;
  }
}

@media (max-width: 480px) {
  .header-container,
  .content-container {
    padding: 12px 8px;
  }

  .category-title {
    font-size: 20px;
  }

  .category-icon-wrapper {
    width: 52px;
    height: 52px;
  }

  .category-stats {
    gap: 12px;
  }

  .stat-item {
    flex: 1;
  }
}
</style>