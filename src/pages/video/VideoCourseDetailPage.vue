<!-- 改善可读性的课程详情页面 -->
<template>
  <div class="course-detail-page">
    <!-- 精美的面包屑导航 -->
    <div class="breadcrumb-section">
      <div class="breadcrumb-container">
        <nav class="breadcrumb-nav">
          <span @click="router.push('/video')" class="breadcrumb-item">
            <icon-font type="icon-home" :size="14" />
            <span>视频学习</span>
          </span>
          <span class="breadcrumb-separator">
            <icon-font type="icon-arrow-right" :size="12" />
          </span>
          <span v-if="currentCategory" @click="router.push(`/video/category/${currentCategory.id}`)" class="breadcrumb-item">
            {{ currentCategory.name }}
          </span>
          <span class="breadcrumb-separator" v-if="currentCategory">
            <icon-font type="icon-arrow-right" :size="12" />
          </span>
          <span class="breadcrumb-current">{{ currentCourse?.name || '课程详情' }}</span>
        </nav>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="videoStore.isLoading" class="loading-wrapper">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <span>课程信息加载中...</span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div v-else-if="currentCourse" class="course-content">
      <!-- 课程介绍头部 - 提高可读性版本 -->
      <div class="course-hero">
        <div class="hero-background">
          <div class="bg-gradient"></div>
          <div class="bg-pattern"></div>
        </div>

        <div class="hero-content">
          <div class="course-header">
            <h1 class="course-title">{{ currentCourse.name }}</h1>
            <p class="course-description">{{ currentCourse.description || '这是一门精心设计的课程，将带你深入了解相关技术知识。' }}</p>

            <!-- 课程元信息 - 改进对比度 -->
            <div class="course-metadata">
              <div class="meta-grid">
                <div class="meta-item">
                  <div class="meta-icon-wrapper">
                    <icon-font type="icon-video" :size="18" class="meta-icon" />
                  </div>
                  <div class="meta-info">
                    <span class="meta-label">视频数量</span>
                    <span class="meta-value">{{ currentCourse.videoCount || 0 }}个视频</span>
                  </div>
                </div>

                <div class="meta-item">
                  <div class="meta-icon-wrapper">
                    <icon-font type="icon-chapter" :size="18" class="meta-icon" />
                  </div>
                  <div class="meta-info">
                    <span class="meta-label">章节数量</span>
                    <span class="meta-value">{{ currentCourse.chapterCount || 0 }}个章节</span>
                  </div>
                </div>

                <div class="meta-item">
                  <div class="meta-icon-wrapper">
                    <icon-font type="icon-time" :size="18" class="meta-icon" />
                  </div>
                  <div class="meta-info">
                    <span class="meta-label">总时长</span>
                    <span class="meta-value">{{ currentCourse.totalDuration || '24小时' }}</span>
                  </div>
                </div>

                <div class="meta-item">
                  <div class="meta-icon-wrapper">
                    <icon-font type="icon-calendar" :size="18" class="meta-icon" />
                  </div>
                  <div class="meta-info">
                    <span class="meta-label">更新时间</span>
                    <span class="meta-value">{{ formatDate(currentCourse.createdAt) || '2023年10月15日' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮区域 - 改进按钮文本对比度 -->
            <div class="action-buttons">
              <button class="primary-btn" @click="startLearning">
                <icon-font type="icon-play" :size="18" />
                <span>开始学习</span>
              </button>

              <div class="secondary-actions">
                <button class="action-btn favorite-btn">
                  <icon-font type="icon-heart" :size="16" />
                  <span>收藏</span>
                </button>

                <button class="action-btn share-btn">
                  <icon-font type="icon-share-alt" :size="16" />
                  <span>分享</span>
                </button>

                <button class="action-btn download-btn">
                  <icon-font type="icon-download" :size="16" />
                  <span>下载</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 学习进度卡片 - 提高文本对比度 -->
          <div class="progress-card">
            <div class="progress-header">
              <div class="progress-info">
                <h3 class="progress-title">学习进度</h3>
                <span class="progress-stats">已学习 <span class="highlight">0</span> / {{ currentCourse.videoCount || 48 }} 个视频</span>
              </div>
              <span class="progress-percentage">0%</span>
            </div>

            <div class="progress-bar">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: '0%' }"></div>
              </div>
            </div>

            <div class="progress-footer">
              <button class="continue-btn">继续上次学习</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页内容 -->
      <div class="course-tabs">
        <div class="tabs-header">
          <button
              class="tab-btn"
              :class="{ active: activeTab === 'content' }"
              @click="activeTab = 'content'"
          >
            <icon-font type="icon-list" :size="16" />
            <span>课程内容</span>
          </button>

          <button
              class="tab-btn"
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
          >
            <icon-font type="icon-info" :size="16" />
            <span>课程详情</span>
          </button>
        </div>

        <div class="tabs-content">
          <!-- 课程内容标签页 -->
          <div v-show="activeTab === 'content'" class="tab-panel">
            <!-- 搜索和过滤区域 -->
            <div class="content-filters">
              <div class="search-box">
                <icon-font type="icon-search" :size="18" class="search-icon" />
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="搜索视频内容..."
                    class="search-input"
                />
                <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
                  <icon-font type="icon-close" :size="14" />
                </button>
              </div>

              <div class="sort-controls">
                <button
                    class="sort-btn"
                    @click="toggleSortDropdown"
                    :class="{ active: showSortDropdown }"
                >
                  <icon-font type="icon-sort" :size="16" />
                  <span>{{ sortText }}</span>
                  <icon-font type="icon-down" :size="12" />
                </button>

                <div class="sort-dropdown" v-if="showSortDropdown">
                  <button
                      v-for="option in sortOptions"
                      :key="option.key"
                      class="sort-option"
                      :class="{ active: sortOption === option.key }"
                      @click="handleSortChange(option.key)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 章节列表 -->
            <div class="chapters-list">
              <div v-for="(chapter, index) in groupedVideos" :key="chapter.id" class="chapter-section">
                <div class="chapter-header" @click="toggleChapter(chapter.id)">
                  <div class="chapter-info">
                    <div class="chapter-icon">
                      <icon-font
                          :type="expandedChapters.includes(chapter.id) ? 'icon-minus-circle' : 'icon-plus-circle'"
                          :size="20"
                      />
                    </div>
                    <div class="chapter-text">
                      <h3 class="chapter-title">
                        <span class="chapter-number">章节 {{ index + 1 }}</span>
                        <span class="chapter-name">{{ chapter.name }}</span>
                      </h3>
                      <div class="chapter-meta">
                        <span>{{ chapter.videos.length }} 个视频</span>
                        <span>·</span>
                        <span>{{ getChapterDuration(chapter) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="chapter-actions">
                    <span class="completion-status">{{ getChapterProgress(chapter) }}</span>
                  </div>
                </div>

                <div v-if="expandedChapters.includes(chapter.id)" class="videos-list">
                  <div
                      v-for="(video, vIndex) in filteredChapterVideos(chapter.videos)"
                      :key="video.id"
                      class="video-item"
                      @click="playVideo(video.id)"
                  >
                    <div class="video-index">{{ vIndex + 1 }}</div>

                    <div class="video-thumbnail">
                      <img :src="getVideoThumbnail(video.id)" :alt="video.title" />
                      <div class="play-overlay">
                        <icon-font type="icon-play" :size="24" />
                      </div>
                      <div class="video-duration">{{ video.duration || '15:30' }}</div>
                    </div>

                    <div class="video-info">
                      <h4 class="video-title">{{ video.title }}</h4>
                      <div class="video-meta">
                        <span class="view-count">
                          <icon-font type="icon-eye" :size="14" />
                          {{ formatViewCount(video.viewCount || 1245) }}
                        </span>
                        <span v-if="video.type !== 'upload'" class="video-source">
                          <icon-font :type="getSourceIcon(video.type)" :size="14" />
                          {{ getSourceName(video.type) }}
                        </span>
                      </div>
                    </div>

                    <div class="video-actions">
                      <div class="status-indicator" :class="getVideoStatus(video)">
                        {{ getVideoStatusText(video) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 课程详情标签页 -->
          <div v-show="activeTab === 'info'" class="tab-panel">
            <div class="info-sections">
              <!-- 课程简介 -->
              <section class="info-section">
                <h2 class="section-title">
                  <icon-font type="icon-document" :size="20" />
                  <span>课程简介</span>
                </h2>
                <div class="section-content">
                  <p class="description-text">{{ currentCourse.description || '这是一门专业的技术课程，将带你深入学习相关知识。' }}</p>
                  <p class="description-text">本课程内容丰富，适合不同水平的学习者。通过系统化的学习，您将掌握核心技能并能应用到实际项目中。</p>
                </div>
              </section>

              <!-- 学习目标 -->
              <section class="info-section">
                <h2 class="section-title">
                  <icon-font type="icon-target" :size="20" />
                  <span>学习目标</span>
                </h2>
                <div class="section-content">
                  <ul class="goals-list">
                    <li class="goal-item">
                      <icon-font type="icon-check" :size="16" />
                      <span>掌握 {{ currentCourse.name }} 的核心概念和基础知识</span>
                    </li>
                    <li class="goal-item">
                      <icon-font type="icon-check" :size="16" />
                      <span>了解行业最佳实践和开发标准</span>
                    </li>
                    <li class="goal-item">
                      <icon-font type="icon-check" :size="16" />
                      <span>能够独立完成相关项目开发</span>
                    </li>
                    <li class="goal-item">
                      <icon-font type="icon-check" :size="16" />
                      <span>提升问题解决能力和专业技能</span>
                    </li>
                  </ul>
                </div>
              </section>

              <!-- 适合人群 -->
              <section class="info-section">
                <h2 class="section-title">
                  <icon-font type="icon-users" :size="20" />
                  <span>适合人群</span>
                </h2>
                <div class="section-content">
                  <div class="audience-grid">
                    <div class="audience-item">
                      <div class="audience-icon">
                        <icon-font type="icon-student" :size="24" />
                      </div>
                      <div class="audience-text">
                        <h4>初学者</h4>
                        <p>希望系统学习的新手</p>
                      </div>
                    </div>

                    <div class="audience-item">
                      <div class="audience-icon">
                        <icon-font type="icon-developer" :size="24" />
                      </div>
                      <div class="audience-text">
                        <h4>在职人员</h4>
                        <p>需要提升技能的专业人士</p>
                      </div>
                    </div>

                    <div class="audience-item">
                      <div class="audience-icon">
                        <icon-font type="icon-team" :size="24" />
                      </div>
                      <div class="audience-text">
                        <h4>技术爱好者</h4>
                        <p>对技术有浓厚兴趣的学习者</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 课程标签 -->
              <section class="info-section">
                <h2 class="section-title">
                  <icon-font type="icon-tags" :size="20" />
                  <span>课程标签</span>
                </h2>
                <div class="section-content">
                  <div class="tags-container">
                    <span v-if="currentCategory" class="tag tag-primary">{{ currentCategory.name }}</span>
                    <span class="tag tag-level">基础入门</span>
                    <span class="tag tag-type">实战项目</span>
                    <span class="tag tag-hot">热门推荐</span>
                    <span class="tag tag-new">最新课程</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 未找到课程 -->
    <div v-else class="not-found">
      <div class="not-found-content">
        <div class="not-found-icon">
          <icon-font type="icon-empty" :size="80" />
        </div>
        <h2>课程不存在或已下架</h2>
        <p>该课程可能已被删除或暂时下架，请查看其他课程。</p>
        <button class="back-btn" @click="router.push('/video')">返回课程列表</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideoStore } from '@/stores/video'
import IconFont from "@/components/common/IconFont.vue";

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()

// 响应式数据
const courseId = computed(() => route.params.courseId as string)
const searchQuery = ref('')
const sortOption = ref('default')
const showSortDropdown = ref(false)
const expandedChapters = ref<string[]>([])
const activeTab = ref('content')

// 排序选项
const sortOptions = [
  { label: '默认排序', key: 'default' },
  { label: '按观看量', key: 'views' },
  { label: '按时长', key: 'duration' },
  { label: '最新发布', key: 'time' }
]

// 计算属性
const sortText = computed(() => {
  const option = sortOptions.find(opt => opt.key === sortOption.value)
  return option ? option.label : '默认排序'
})

const currentCourse = computed(() => {
  return videoStore.getCourseById(courseId.value)
})

const currentCategory = computed(() => {
  if (!currentCourse.value?.categoryId) return null
  return videoStore.categories.find(
      category => category.id === currentCourse.value?.categoryId
  )
})

const groupedVideos = computed(() => {
  if (!currentCourse.value) return []

  const courseVideos = videoStore.videos.filter(
      video => video.courseId === courseId.value
  )

  // 按章节分组
  const chapterIds = [...new Set(courseVideos.map(video => video.chapterId))]

  return chapterIds.map(chapterId => {
    const chapterVideos = courseVideos.filter(video => video.chapterId === chapterId)

    // 排序
    let sortedVideos = [...chapterVideos]
    switch (sortOption.value) {
      case 'views':
        sortedVideos.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        break
      case 'duration':
        sortedVideos.sort((a, b) => convertDurationToSeconds(b.duration || '') - convertDurationToSeconds(a.duration || ''))
        break
      case 'time':
        sortedVideos.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        break
    }

    return {
      id: chapterId,
      name: chapterVideos.length > 0 ? chapterVideos[0].chapterName || '未分类章节' : '未分类章节',
      videos: sortedVideos
    }
  })
})

// 方法
function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value
  // 点击外部关闭
  if (showSortDropdown.value) {
    document.addEventListener('click', handleClickOutside)
  }
}

function handleClickOutside(event: MouseEvent) {
  const dropdown = document.querySelector('.sort-dropdown')
  const button = document.querySelector('.sort-btn')

  if (dropdown && button && !dropdown.contains(event.target as Node) && !button.contains(event.target as Node)) {
    showSortDropdown.value = false
    document.removeEventListener('click', handleClickOutside)
  }
}

function handleSortChange(key: string) {
  sortOption.value = key
  showSortDropdown.value = false
  document.removeEventListener('click', handleClickOutside)
}

function toggleChapter(chapterId: string) {
  const index = expandedChapters.value.indexOf(chapterId)
  if (index === -1) {
    expandedChapters.value.push(chapterId)
  } else {
    expandedChapters.value.splice(index, 1)
  }
}

function startLearning() {
  const firstChapter = groupedVideos.value[0]
  if (firstChapter && firstChapter.videos.length > 0) {
    playVideo(firstChapter.videos[0].id)
  }
}

function playVideo(videoId: string) {
  router.push(`/video/watch/${videoId}`)
}

function filteredChapterVideos(videos: any[]) {
  if (!searchQuery.value.trim()) return videos

  const query = searchQuery.value.toLowerCase().trim()
  return videos.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query)
  )
}

// 工具函数
function convertDurationToSeconds(duration: string): number {
  const parts = duration.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return parts[0] || 0
}

function formatViewCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toString()
}

function formatDate(dateString: string): string {
  if (!dateString) return '未知'

  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getChapterDuration(chapter: any): string {
  const totalSeconds = chapter.videos.reduce((sum: number, video: any) => {
    return sum + convertDurationToSeconds(video.duration || '0')
  }, 0)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function getChapterProgress(chapter: any): string {
  // 简单示例，实际应基于用户学习进度
  return '0/0'
}

function getVideoThumbnail(videoId: string): string {
  return `https://picsum.photos/seed/${videoId}/640/360`
}

function getSourceIcon(type: string): string {
  switch (type) {
    case 'youtube': return 'icon-youtube'
    case 'bilibili': return 'icon-bilibili'
    default: return 'icon-video'
  }
}

function getSourceName(type: string): string {
  switch (type) {
    case 'youtube': return 'YouTube'
    case 'bilibili': return '哔哩哔哩'
    default: return '本站'
  }
}

function getVideoStatus(video: any): string {
  // 实际应基于用户学习进度
  return 'unwatched'
}

function getVideoStatusText(video: any): string {
  // 实际应基于用户学习进度
  return '未学习'
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    videoStore.fetchCourses(),
    videoStore.fetchVideos(),
    videoStore.fetchCategories()
  ])

  // 默认展开第一个章节
  if (groupedVideos.value.length > 0) {
    expandedChapters.value = [groupedVideos.value[0].id]
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 基础变量 */
.course-detail-page {
  background: #FAFAFA;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 面包屑导航 */
.breadcrumb-section {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 10;
}

.breadcrumb-container {
  padding: 12px 40px;
  max-width: 100%;
  margin: 0 auto;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s ease;
}

.breadcrumb-item:hover {
  color: #3B82F6;
}

.breadcrumb-separator {
  color: #CBD5E1;
}

.breadcrumb-current {
  color: #0F172A;
  font-weight: 500;
}

/* 加载状态 */
.loading-wrapper {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 课程内容区域 */
.course-content {
  padding: 0 40px 48px;
  max-width: 100%;
  margin: 0 auto;
}

/* 课程英雄区域 - 提高可读性 */
.course-hero {
  position: relative;
  background: linear-gradient(135deg, #1a2332 0%, #111827 100%);
  border-radius: 24px;
  overflow: hidden;
  margin: 24px 0;
  min-height: 500px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.12), transparent 70%),
  radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.12), transparent 70%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.04;
  background-image:
      linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%);
  background-size: 30px 30px;
  background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
}

.hero-content {
  position: relative;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  padding: 48px;
  z-index: 2;
}

/* 课程头部信息 - 提高文本对比度 */
.course-header {
  color: white;
}

.course-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.2;
  color: #FFFFFF;
}

.course-description {
  font-size: 17px;
  color: #E2E8F0;
  margin-bottom: 32px;
  line-height: 1.6;
  opacity: 0.95;
}

.course-metadata {
  margin-bottom: 40px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.10);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.meta-icon-wrapper {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.meta-icon {
  color: #93C5FD;
}

.meta-info {
  flex: 1;
}

.meta-label {
  display: block;
  font-size: 13px;
  color: #CBD5E1;
  margin-bottom: 5px;
  font-weight: 400;
}

.meta-value {
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
}

/* 操作按钮 - 改进按钮文本清晰度 */
.action-buttons {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #3B82F6, #1E40AF);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.secondary-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: rgba(255, 255, 255, 0.12);
  color: #E2E8F0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
}

/* 进度卡片 - 提高对比度 */
.progress-card {
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.progress-info {
  color: white;
}

.progress-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #FFFFFF;
}

.progress-stats {
  font-size: 14px;
  color: #E2E8F0;
  font-weight: 400;
}

.highlight {
  color: #93C5FD;
  font-weight: 700;
}

.progress-percentage {
  font-size: 32px;
  font-weight: 800;
  color: #FFFFFF;
}

.progress-bar {
  margin-bottom: 24px;
}

.progress-track {
  height: 10px;
  background: rgba(255, 255, 255, 0.10);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #1E40AF);
  border-radius: 5px;
  transition: width 0.6s ease;
}

.progress-footer {
  text-align: center;
}

.continue-btn {
  padding: 12px 28px;
  background: #3B82F6;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #1E40AF;
  transform: translateY(-1px);
}

/* 标签页区域 */
.course-tabs {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  margin-top: 32px;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
  background: #F8FAFC;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn.active {
  color: #3B82F6;
  background: white;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #3B82F6;
}

.tabs-content {
  padding: 32px;
}

/* 内容过滤区域 */
.content-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
}

.search-input {
  width: 100%;
  padding: 12px 44px 12px 44px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 15px;
  background: #F8FAFC;
  color: #0F172A;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
}

.sort-controls {
  position: relative;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn:hover,
.sort-btn.active {
  border-color: #3B82F6;
  background: white;
}

.sort-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 10;
  overflow: hidden;
}

.sort-option {
  display: block;
  width: 100%;
  padding: 12px 20px;
  text-align: left;
  border: none;
  background: none;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-option:hover {
  background: #F8FAFC;
}

.sort-option.active {
  background: #EFF6FF;
  color: #3B82F6;
}

/* 章节列表 */
.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chapter-section {
  background: #F8FAFC;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chapter-header:hover {
  background: #EFF6FF;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chapter-icon {
  color: #3B82F6;
  transition: transform 0.3s ease;
}

.chapter-text {
  flex: 1;
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.chapter-number {
  background: #3B82F6;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.chapter-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.chapter-meta {
  font-size: 13px;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-actions {
  font-size: 13px;
  color: #64748B;
}

/* 视频列表 */
.videos-list {
  padding: 8px 24px 24px;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 8px;
}

.video-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.video-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

.video-thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-item:hover .play-overlay {
  opacity: 1;
}

.video-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.video-info {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-size: 15px;
  font-weight: 500;
  color: #0F172A;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #64748B;
}

.view-count,
.video-source {
  display: flex;
  align-items: center;
  gap: 4px;
}

.video-actions {
  flex-shrink: 0;
}

.status-indicator {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  background: #F1F5F9;
  color: #64748B;
}

.status-indicator.complete {
  background: #DCFCE7;
  color: #166534;
}

.status-indicator.in-progress {
  background: #FEF3C7;
  color: #92400E;
}

/* 课程详情标签页 */
.info-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.info-section {
  background: #F8FAFC;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E5E7EB;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.section-content {
  line-height: 1.7;
}

.description-text {
  color: #475569;
  margin-bottom: 16px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.goal-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #475569;
}

.goal-item svg {
  color: #10B981;
  flex-shrink: 0;
  margin-top: 2px;
}

.audience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.audience-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.audience-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EFF6FF;
  border-radius: 12px;
  color: #3B82F6;
  flex-shrink: 0;
}

.audience-text h4 {
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 4px;
}

.audience-text p {
  font-size: 13px;
  color: #64748B;
  margin: 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #F1F5F9;
  color: #475569;
}

.tag-primary {
  background: #EFF6FF;
  color: #3B82F6;
}

.tag-level {
  background: #F0FDF4;
  color: #059669;
}

.tag-type {
  background: #FEF3C7;
  color: #D97706;
}

.tag-hot {
  background: #FEE2E2;
  color: #DC2626;
}

.tag-new {
  background: #EEF2FF;
  color: #4F46E5;
}

/* 未找到课程 */
.not-found {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.not-found-content {
  text-align: center;
  max-width: 400px;
}

.not-found-icon {
  margin-bottom: 24px;
  color: #CBD5E1;
}

.not-found-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 12px;
}

.not-found-content p {
  color: #64748B;
  margin-bottom: 32px;
}

.back-btn {
  padding: 12px 24px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #1E40AF;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .course-content {
    padding: 0 30px 48px;
  }

  .breadcrumb-container {
    padding: 12px 30px;
  }
}

@media (max-width: 1200px) {
  .course-content {
    padding: 0 25px 48px;
  }

  .breadcrumb-container {
    padding: 12px 25px;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .course-content {
    padding: 0 20px 40px;
  }

  .breadcrumb-container {
    padding: 10px 20px;
  }

  .hero-content {
    padding: 32px 24px;
  }

  .course-title {
    font-size: 28px;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    gap: 16px;
  }

  .primary-btn {
    width: 100%;
  }

  .secondary-actions {
    width: 100%;
    justify-content: space-between;
  }

  .tabs-content {
    padding: 24px;
  }

  .content-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .course-content {
    padding: 0 16px 32px;
  }

  .breadcrumb-container {
    padding: 8px 16px;
  }

  .hero-content {
    padding: 24px 20px;
  }

  .course-title {
    font-size: 24px;
  }

  .tab-btn {
    padding: 12px 16px;
    font-size: 14px;
  }

  .chapters-list {
    gap: 12px;
  }

  .video-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .video-thumbnail {
    width: 100%;
  }

  .video-actions {
    width: 100%;
    margin-top: 12px;
  }

  .audience-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .course-content {
    padding: 0 12px 24px;
  }

  .breadcrumb-container {
    padding: 6px 12px;
  }

  .breadcrumb-nav {
    font-size: 12px;
  }

  .hero-content {
    padding: 20px 16px;
  }

  .course-title {
    font-size: 20px;
  }

  .progress-card {
    padding: 24px;
  }

  .tabs-content {
    padding: 16px;
  }

  .info-section {
    padding: 16px;
  }
}
</style>