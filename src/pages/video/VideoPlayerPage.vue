<!-- src/pages/video/VideoPlayerPage.vue -->
<template>
  <div class="video-player-page">
    <!-- 顶部导航栏 - 重新设计 -->
    <div class="video-header">
      <div class="container">
        <div class="header-content">
          <div class="header-left">
            <button class="back-button" @click="router.back()">
              <icon-font type="icon-arrow-left" :size="18" />
              <span>返回</span>
            </button>

            <div class="breadcrumb">
              <span class="breadcrumb-item clickable" @click="router.push('/video')">视频学习</span>
              <span class="breadcrumb-divider">›</span>
              <span v-if="currentVideo?.courseId" class="breadcrumb-item clickable" @click="router.push(`/video/course/${currentVideo.courseId}`)">
                {{ currentCourseName }}
              </span>
              <span v-if="currentVideo?.courseId" class="breadcrumb-divider">›</span>
              <span class="breadcrumb-item current">{{ currentVideo?.title || '视频播放' }}</span>
            </div>
          </div>

          <div class="header-right">
            <button class="action-button" :class="{'active': isFavorite}" @click="toggleFavorite">
              <icon-font :type="isFavorite ? 'icon-heart-fill' : 'icon-heart'" :size="20" />
              <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
            </button>

            <button class="action-button" @click="showShareModal = true">
              <icon-font type="icon-share" :size="20" />
              <span>分享</span>
            </button>

            <button class="action-button" @click="toggleTheaterMode">
              <icon-font :type="isTheaterMode ? 'icon-shrink' : 'icon-expand'" :size="20" />
              <span>{{ isTheaterMode ? '退出剧场模式' : '剧场模式' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container" :class="{'theater-mode': isTheaterMode}">
      <!-- 视频信息简介 - 顶部 - 重新设计 -->
      <div class="video-info-header" v-if="currentVideo">
        <div class="video-title-section">
          <div class="title-wrapper">
            <h1 class="video-primary-title">{{ currentVideo.title }}</h1>
            <h2 class="video-subtitle" v-if="currentVideo.subtitle">{{ currentVideo.subtitle }}</h2>
          </div>

          <div class="video-source-info">
            <div class="video-tags">
              <div class="tag primary-tag" v-if="currentVideo.primaryTag">{{ currentVideo.primaryTag }}</div>
              <div class="tag" v-for="tag in currentVideo.tags" :key="tag">{{ tag }}</div>
            </div>

            <div class="source-badge" v-if="currentVideo.type !== 'upload'">
              <icon-font
                  :type="currentVideo.type === 'youtube' ? 'icon-youtube' : 'icon-bilibili'"
                  :size="16"
              />
              <span>{{ currentVideo.type === 'youtube' ? 'YouTube' : '哔哩哔哩' }}</span>
            </div>
          </div>
        </div>

        <div class="video-meta-stats">
          <div class="meta-item">
            <icon-font type="icon-play-count" :size="16" />
            <span>{{ formatViewCount(currentVideo.viewCount || 0) }} 次观看</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <icon-font type="icon-calendar" :size="16" />
            <span>{{ formatDate(currentVideo.createdAt) }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <icon-font type="icon-time" :size="16" />
            <span>时长 {{ currentVideo.duration }}</span>
          </div>
        </div>

        <div class="video-description" v-if="currentVideo.description">
          <div class="description-text">{{ truncateDescription(currentVideo.description) }}</div>
          <button v-if="currentVideo.description.length > 100" class="more-button" @click="showDescriptionModal = true">
            更多内容
          </button>
        </div>
      </div>

      <div class="video-content-wrapper">
        <!-- 视频播放区域 -->
        <div class="video-main-content">
          <div class="video-player-container">
            <div v-if="isLoading" class="video-loading">
              <n-spin size="large" />
            </div>
            <div v-else-if="!currentVideo" class="video-error">
              <n-empty description="视频未找到">
                <template #extra>
                  <n-button @click="router.push('/video')">返回视频首页</n-button>
                </template>
              </n-empty>
            </div>
            <div v-else>
              <!-- 使用Video.js播放器 -->
              <div class="video-player">
                <video
                    ref="videoRef"
                    class="video-js vjs-big-play-centered vjs-fluid"
                    controls
                    preload="auto"
                    :poster="currentVideo.coverImage"
                    data-setup="{}"
                >
                  <source v-if="videoSources.mp4" :src="videoSources.mp4" type="video/mp4" />
                  <source v-if="videoSources.webm" :src="videoSources.webm" type="video/webm" />
                  <p class="vjs-no-js">
                    请启用JavaScript并使用支持HTML5视频的浏览器观看视频
                  </p>
                </video>

                <!-- 当无法使用Video.js播放时的备用iframe播放器 -->
                <iframe
                    v-if="useIframePlayer"
                    class="iframe-player"
                    :src="currentVideo.videoUrl"
                    frameborder="0"
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- B站风格章节列表 -->
        <div class="bilibili-sidebar">
          <div class="playlist-header">
            <div class="playlist-title">
              <span class="main-title">课程章节</span>
              <span class="sub-title">({{ getTotalVideosCount() }}/{{ getTotalVideosCount() }})</span>
            </div>

            <div class="playlist-actions">
              <div class="search-wrapper">
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="搜索视频..."
                    class="search-input"
                />
                <icon-font v-if="!searchQuery" type="icon-search" :size="16" class="search-icon" />
                <icon-font v-else type="icon-close" :size="16" class="clear-icon" @click="searchQuery = ''" />
              </div>
              <div class="playlist-toggle" @click="togglePlaylistExpand">
                <icon-font :type="isPlaylistExpanded ? 'icon-chevron-up' : 'icon-chevron-down'" :size="16" />
              </div>
            </div>

            <div class="playlist-stats">
              <span class="stat-item">
                <icon-font type="icon-play-count" :size="14" />
                {{ formatViewCount(getCourseViewCount()) }}播放
              </span>
              <span class="stat-item">
                <icon-font type="icon-time" :size="14" />
                {{ getCourseDuration() }}
              </span>
              <span class="stat-item">简介</span>
            </div>
          </div>

          <div class="playlist-content" v-show="isPlaylistExpanded">
            <template v-if="currentVideo">
              <div class="playlist-section" v-for="(chapter, chapterIndex) in groupedVideos" :key="chapter.id">
                <div class="chapter-header" @click="toggleChapter(chapter.id)">
                  <div class="chapter-index">{{ chapterIndex + 1 }}</div>
                  <div class="chapter-info">
                    <span class="chapter-name">{{ chapter.name }}</span>
                    <span class="chapter-count">{{ chapter.videos.length }}个视频</span>
                  </div>
                  <div class="chapter-toggle">
                    <icon-font :type="expandedChapters.includes(chapter.id) ? 'icon-chevron-up' : 'icon-chevron-down'" :size="14" />
                  </div>
                </div>

                <div class="video-list" v-show="expandedChapters.includes(chapter.id)">
                  <div
                      v-for="(video, videoIndex) in filteredVideos(chapter.videos)"
                      :key="video.id"
                      class="bilibili-video-item"
                      :class="{ 'active': video.id === videoId }"
                      @click="handleVideoClick(video.id)"
                  >
                    <div class="video-index">{{ videoIndex + 1 }}</div>
                    <div class="video-thumbnail">
                      <img :src="video.coverImage" :alt="video.title">
                      <div class="video-duration">{{ video.duration }}</div>
                      <div class="playing-indicator" v-if="video.id === videoId">
                        <icon-font type="icon-playing" :size="16" />
                      </div>
                    </div>
                    <div class="video-detail">
                      <div class="video-title">{{ video.title }}</div>
                      <div class="video-stats">
                        <span class="view-count">{{ formatViewCount(video.viewCount || 0) }}播放</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div class="empty-playlist" v-else>
              <icon-font type="icon-video-not-found" :size="40" />
              <p>没有可用的视频</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享模态框 -->
    <n-modal v-model:show="showShareModal" preset="card" title="分享视频" style="max-width: 500px">
      <template #header>
        <div class="modal-header">
          <icon-font type="icon-share" :size="20" class="mr-2 text-primary" />
          <span>分享视频</span>
        </div>
      </template>

      <div class="share-content">
        <div class="share-video-info">
          <div class="share-thumbnail">
            <img :src="currentVideo?.coverImage" :alt="currentVideo?.title" />
          </div>
          <div class="share-title">{{ currentVideo?.title }}</div>
        </div>

        <div class="share-link">
          <input :value="shareUrl" readonly class="share-input" />
          <button class="copy-button" @click="copyShareUrl">复制链接</button>
        </div>

        <div class="share-platforms">
          <div class="platform-title">分享到社交平台</div>
          <div class="platform-icons">
            <button class="platform-icon wechat">
              <icon-font type="icon-wechat" :size="20" />
            </button>
            <button class="platform-icon weibo">
              <icon-font type="icon-weibo" :size="20" />
            </button>
            <button class="platform-icon qq">
              <icon-font type="icon-qq" :size="20" />
            </button>
            <button class="platform-icon twitter">
              <icon-font type="icon-twitter" :size="20" />
            </button>
            <button class="platform-icon facebook">
              <icon-font type="icon-facebook" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 播放完成提示 -->
    <n-modal v-model:show="showCompletionModal" preset="card" style="max-width: 500px">
      <template #header>
        <div class="modal-header">
          <icon-font type="icon-success" :size="20" class="mr-2 text-success" />
          <span>视频播放完成</span>
        </div>
      </template>

      <div class="completion-content">
        <p>恭喜您完成了本视频的学习！</p>
        <div class="completion-actions">
          <button class="cancel-button" @click="showCompletionModal = false">关闭</button>
          <button class="next-button" @click="handleNextVideo">
            <icon-font type="icon-next" :size="16" />
            <span>下一个视频</span>
          </button>
        </div>
      </div>
    </n-modal>

    <!-- 视频描述详情模态框 -->
    <n-modal v-model:show="showDescriptionModal" preset="card" style="max-width: 600px">
      <template #header>
        <div class="modal-header">
          <icon-font type="icon-info-circle" :size="20" class="mr-2 text-primary" />
          <span>视频详情</span>
        </div>
      </template>

      <div class="description-content" v-if="currentVideo">
        <h2>{{ currentVideo.title }}</h2>
        <p>{{ currentVideo.description }}</p>

        <div class="description-meta">
          <div class="meta-row">
            <span class="meta-label">上传时间：</span>
            <span>{{ formatDate(currentVideo.createdAt) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">观看次数：</span>
            <span>{{ formatViewCount(currentVideo.viewCount || 0) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">时长：</span>
            <span>{{ currentVideo.duration }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">标签：</span>
            <div class="tag-list">
              <span
                  v-for="tag in currentVideo.tags"
                  :key="tag"
                  class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideoStore } from '@/stores/video'
import { useMessage } from 'naive-ui'
import VideoCard from '@/components/video/VideoCard.vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()
const message = useMessage()

const videoId = computed(() => route.params.videoId as string)
const isLoading = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)
const player = ref<any>(null)
const commentText = ref('')
const isFavorite = ref(false)
const useIframePlayer = ref(false)
const isTheaterMode = ref(false)
const showShareModal = ref(false)
const showCompletionModal = ref(false)
const showDescriptionModal = ref(false)
const searchQuery = ref('')
const expandedChapters = ref<string[]>([])
const isPlaylistExpanded = ref(true)

// 视频源
const videoSources = ref({
  mp4: '',
  webm: '',
  hls: ''
})

// 分享链接
const shareUrl = computed(() => {
  if (!currentVideo.value) return window.location.href
  return `${window.location.origin}/video/watch/${currentVideo.value.id}`
})

// 当前视频
const currentVideo = computed(() => {
  const video = videoStore.videos.find(video => video.id === videoId.value);
  if (video) {
    // 增加额外属性用于新UI元素
    return {
      ...video,
      subtitle: 'Java JDK安装与开发环境配置', // 假设这个是子标题数据
      primaryTag: 'Java'  // 假设这是主标签
    };
  }
  return null;
})

// 当前课程名称
const currentCourseName = computed(() => {
  if (!currentVideo.value?.courseId) return ''

  // 直接从courses数组中查找课程
  const course = videoStore.courses.find(course => course.id === currentVideo.value.courseId)
  return course?.name || ''
})

// 章节分组的视频
const groupedVideos = computed(() => {
  if (!currentVideo.value) return []

  // 获取当前视频所属课程的所有视频
  const courseVideos = videoStore.videos
      .filter(video => video.courseId === currentVideo.value?.courseId)

  // 获取所有章节ID
  const chapterIds = [...new Set(courseVideos.map(video => video.chapterId))]

  return chapterIds.map(chapterId => {
    const chapterVideos = courseVideos.filter(video => video.chapterId === chapterId)

    return {
      id: chapterId,
      name: chapterVideos[0]?.chapterName || '未分类章节',
      videos: chapterVideos
    }
  })
})

// 获取课程总播放量
function getCourseViewCount() {
  if (!currentVideo.value) return 0;

  const courseVideos = videoStore.videos
      .filter(video => video.courseId === currentVideo.value?.courseId);

  return courseVideos.reduce((total, video) => total + (video.viewCount || 0), 0);
}

// 获取课程总时长
function getCourseDuration() {
  if (!currentVideo.value) return '0分钟';

  const courseVideos = videoStore.videos
      .filter(video => video.courseId === currentVideo.value?.courseId);

  // 简单实现，实际应该计算时间
  return `${courseVideos.length * 5}分钟`;
}

// 获取视频总数量
function getTotalVideosCount() {
  if (!currentVideo.value) return 0;

  const courseVideos = videoStore.videos
      .filter(video => video.courseId === currentVideo.value?.courseId);

  return courseVideos.length;
}

// 展开/收起播放列表
function togglePlaylistExpand() {
  isPlaylistExpanded.value = !isPlaylistExpanded.value;
}

// 截断描述文本
function truncateDescription(text: string, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 过滤章节视频
function filteredVideos(videos) {
  if (!searchQuery.value.trim()) return videos

  const query = searchQuery.value.toLowerCase().trim()
  return videos.filter(video =>
      video.title.toLowerCase().includes(query) ||
      (video.description && video.description.toLowerCase().includes(query))
  )
}

// 初始化Video.js播放器
function initializePlayer() {
  if (!videoRef.value) return

  // 设置Video.js选项
  const options = {
    controls: true,
    autoplay: false,
    preload: 'auto',
    fluid: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    controlBar: {
      children: [
        'playToggle',
        'volumePanel',
        'currentTimeDisplay',
        'timeDivider',
        'durationDisplay',
        'progressControl',
        'liveDisplay',
        'remainingTimeDisplay',
        'customControlSpacer',
        'playbackRateMenuButton',
        'chaptersButton',
        'descriptionsButton',
        'subsCapsButton',
        'audioTrackButton',
        'pictureInPictureToggle',
        'fullscreenToggle'
      ]
    },
    userActions: {
      hotkeys: true
    },
    techOrder: ['html5']
  }

  // 检查是否需要使用iframe播放
  if (!videoSources.value.mp4 && !videoSources.value.webm && !videoSources.value.hls) {
    useIframePlayer.value = true
    return
  }

  // 初始化播放器
  player.value = videojs(videoRef.value, options)

  // 绑定事件
  player.value.on('ended', handleVideoEnded)
  player.value.on('error', handleVideoError)
  player.value.on('timeupdate', handleTimeUpdate)

  // 播放器准备就绪
  player.value.ready(() => {
    console.log('播放器已准备就绪')
  })
}

// 展开/收起章节
function toggleChapter(chapterId) {
  const index = expandedChapters.value.indexOf(chapterId)
  if (index === -1) {
    expandedChapters.value.push(chapterId)
  } else {
    expandedChapters.value.splice(index, 1)
  }
}

// 处理视频点击
function handleVideoClick(id: string) {
  router.push(`/video/watch/${id}`)
}

// 处理视频结束事件
function handleVideoEnded() {
  console.log('视频播放完成')
  showCompletionModal.value = true
}

// 处理视频错误
function handleVideoError() {
  console.error('视频加载失败')
  message.error('视频加载失败，正在尝试使用备用播放器')
  useIframePlayer.value = true
}

// 处理视频播放进度更新
function handleTimeUpdate() {
  if (!player.value) return
  const currentTime = player.value.currentTime()
  const duration = player.value.duration()

  // 可以在这里实现进度保存、打点等功能
  console.log(`播放进度: ${Math.floor(currentTime)}/${Math.floor(duration)}`)
}

// 处理下一个视频
function handleNextVideo() {
  // 查找当前视频的下一个视频
  if (!currentVideo.value) {
    showCompletionModal.value = false
    return
  }

  // 找到当前视频所在的章节
  const currentChapter = groupedVideos.value.find(chapter =>
      chapter.videos.some(video => video.id === currentVideo.value?.id)
  )

  if (currentChapter) {
    // 找到当前视频在章节中的索引
    const videoIndex = currentChapter.videos.findIndex(video => video.id === currentVideo.value?.id)

    // 如果有下一个视频，播放下一个视频
    if (videoIndex < currentChapter.videos.length - 1) {
      handleVideoClick(currentChapter.videos[videoIndex + 1].id)
    } else {
      // 如果是章节的最后一个视频，查找下一个章节的第一个视频
      const chapterIndex = groupedVideos.value.findIndex(chapter => chapter.id === currentChapter.id)

      if (chapterIndex < groupedVideos.value.length - 1) {
        const nextChapter = groupedVideos.value[chapterIndex + 1]
        if (nextChapter.videos.length > 0) {
          handleVideoClick(nextChapter.videos[0].id)
        }
      }
    }
  }

  showCompletionModal.value = false
}

// 切换收藏状态
function toggleFavorite() {
  isFavorite.value = !isFavorite.value
  message.success(isFavorite.value ? '已添加到收藏' : '已取消收藏')
}

// 切换剧场模式
function toggleTheaterMode() {
  isTheaterMode.value = !isTheaterMode.value
}

// 复制分享链接
function copyShareUrl() {
  navigator.clipboard.writeText(shareUrl.value)
      .then(() => {
        message.success('链接已复制到剪贴板')
      })
      .catch(err => {
        console.error('复制失败:', err)
        message.error('复制失败，请手动复制')
      })
}

// 设置视频源
function setVideoSources() {
  if (!currentVideo.value) return

  // 根据视频类型设置不同的播放源
  if (currentVideo.value.type === 'upload') {
    // 上传的视频，使用Video.js原生播放
    videoSources.value.mp4 = currentVideo.value.videoUrl
  } else {
    // 外部视频源，使用iframe播放
    useIframePlayer.value = true
  }
}

// 获取YouTube嵌入URL
function getYouTubeEmbedUrl(url: string) {
  // 处理多种YouTube URL格式
  let videoId = ''

  // 普通YouTube URL
  if (url.includes('youtube.com/watch')) {
    videoId = new URL(url).searchParams.get('v') || ''
  }
  // 短链接
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }
  // 已经是嵌入URL
  else if (url.includes('youtube.com/embed/')) {
    return url
  }
  // 直接是视频ID
  else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    videoId = url
  }

  return `https://www.youtube.com/embed/${videoId}`
}

// 获取B站嵌入URL
function getBilibiliEmbedUrl(url: string) {
  // 已经是嵌入URL
  if (url.includes('player.bilibili.com')) {
    return url
  }

  let bvid = ''
  let aid = ''
  let page = '1'

  // BV号形式
  if (url.includes('bilibili.com/video/BV')) {
    // 提取BV号
    const match = url.match(/\/BV(\w+)/)
    if (match && match[1]) {
      bvid = 'BV' + match[1]
    }

    // 提取p参数（如果有）
    const pageMatch = url.match(/[?&]p=(\d+)/)
    if (pageMatch && pageMatch[1]) {
      page = pageMatch[1]
    }

    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}`
  }

  // AV号形式
  if (url.includes('bilibili.com/video/av')) {
    // 提取AV号
    const match = url.match(/\/av(\d+)/)
    if (match && match[1]) {
      aid = match[1]
    }

    // 提取p参数（如果有）
    const pageMatch = url.match(/[?&]p=(\d+)/)
    if (pageMatch && pageMatch[1]) {
      page = pageMatch[1]
    }

    return `https://player.bilibili.com/player.html?aid=${aid}&page=${page}`
  }

  return url
}

// 格式化日期
function formatDate(dateString: string) {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化观看次数
function formatViewCount(count: number) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 监听视频ID变化
watch(videoId, async () => {
  // 重置状态
  isLoading.value = true
  useIframePlayer.value = false

  // 销毁旧播放器
  if (player.value) {
    player.value.dispose()
    player.value = null
  }

  // 获取视频数据
  await videoStore.fetchVideos()

  // 设置视频源
  setVideoSources()

  // 加载完成
  isLoading.value = false

  // 初始化新播放器
  nextTick(() => {
    if (!useIframePlayer.value) {
      initializePlayer()
    }
  })

  // 自动展开当前视频所在章节
  if (currentVideo.value) {
    const currentChapter = groupedVideos.value.find(chapter =>
        chapter.videos.some(video => video.id === currentVideo.value?.id)
    )

    if (currentChapter && !expandedChapters.value.includes(currentChapter.id)) {
      expandedChapters.value.push(currentChapter.id)
    }
  }
})

onMounted(async () => {
  try {
    isLoading.value = true
    await videoStore.fetchVideos()
    await videoStore.fetchCourses()

    if (!currentVideo.value) {
      message.error('视频不存在或已被删除')
    } else {
      // 设置视频源
      setVideoSources()
      console.log('加载视频:', currentVideo.value)

      // 随机设置是否已收藏（模拟数据）
      isFavorite.value = Math.random() > 0.5

      // 自动展开当前视频所在章节
      const currentChapter = groupedVideos.value.find(chapter =>
          chapter.videos.some(video => video.id === currentVideo.value?.id)
      )

      if (currentChapter) {
        expandedChapters.value = [currentChapter.id]
      } else if (groupedVideos.value.length > 0) {
        // 默认展开第一个章节
        expandedChapters.value = [groupedVideos.value[0].id]
      }
    }
  } catch (error) {
    console.error('加载视频失败', error)
    message.error('加载视频失败，请重试')
  } finally {
    isLoading.value = false

    // 初始化播放器
    nextTick(() => {
      if (!useIframePlayer.value) {
        initializePlayer()
      }
    })
  }
})

onBeforeUnmount(() => {
  // 销毁播放器
  if (player.value) {
    player.value.dispose()
    player.value = null
  }
})
</script>

<style scoped>
/* 基础变量 */
:root {
  --primary-color: #FB7299;  /* B站粉色 */
  --primary-light: #FEF0F3;
  --primary-dark: #ED5E89;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --error-color: #EF4444;
  --text-color: #1F2937;
  --text-secondary: #4B5563;
  --text-light: #6B7280;
  --border-color: #E5E7EB;
  --card-color: #FFFFFF;
  --bg-color: #F9FAFB;
  --bg-secondary: #F3F4F6;
  --bilibili-gray: #F1F2F3;
  --bilibili-light: #F6F7F8;
}

.video-player-page {
  background-color: #F8FAFC;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 顶部导航栏 */
.video-header {
  background-color: #FFFFFF;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #E5E7EB;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #F3F4F6;
  color: #1F2937;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  max-width: 100%;
  overflow: hidden;
}

.breadcrumb-item {
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-item.clickable {
  cursor: pointer;
}

.breadcrumb-item.clickable:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.breadcrumb-item.current {
  color: #1F2937;
  font-weight: 500;
}

.breadcrumb-divider {
  color: #9CA3AF;
  margin: 0 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: none;
  font-size: 14px;
  color: #4B5563;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #F3F4F6;
  color: #1F2937;
}

.action-button.active {
  color: var(--primary-color);
}

.container {
  max-width: 2200px; /* 增加最大宽度以减少左右空白 */
  width: 100%; /* 使用全屏宽度 */
  margin: 0 auto;
  padding: 0 8px; /* 减少内边距 */
  transition: all 0.3s ease;
}

/* 重新设计的视频信息头部 */
.video-info-header {
  padding: 16px 20px; /* 减少内边距 */
  border-bottom: 1px solid #E5E7EB;
  background-color: #FFFFFF;
  border-radius: 8px; /* 减小圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  margin-top: 12px; /* 减小顶部外边距 */
}

.video-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px; /* 减小底部外边距 */
}

.title-wrapper {
  flex: 1;
  min-width: 0;
}

.video-primary-title {
  font-size: 22px; /* 减小字体大小 */
  font-weight: 600;
  margin: 0 0 6px 0; /* 减小底部外边距 */
  line-height: 1.3;
  color: #1F2937;
}

.video-subtitle {
  font-size: 15px; /* 减小字体大小 */
  font-weight: normal;
  margin: 0;
  color: #6B7280;
  line-height: 1.5;
}

.video-source-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px; /* 减小间距 */
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px; /* 减小间距 */
  justify-content: flex-end;
}

.tag {
  padding: 3px 10px; /* 减小内边距 */
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-radius: 14px; /* 减小圆角 */
  font-size: 12px; /* 减小字体大小 */
  font-weight: 500;
  transition: all 0.2s;
}

.tag:hover {
  background-color: var(--primary-color);
  color: white;
}

.primary-tag {
  background-color: var(--primary-color);
  color: white;
}

.source-badge {
  display: flex;
  align-items: center;
  gap: 4px; /* 减小间距 */
  background-color: #f6f6f6;
  padding: 3px 10px; /* 减小内边距 */
  border-radius: 14px; /* 减小圆角 */
  font-size: 12px; /* 减小字体大小 */
  font-weight: 500;
  color: #4B5563;
}

.video-meta-stats {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 6px; /* 减小圆角 */
  padding: 8px 12px; /* 减小内边距 */
  margin-bottom: 14px; /* 减小底部外边距 */
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px; /* 减小间距 */
  color: #4B5563;
  font-size: 13px; /* 减小字体大小 */
}

.meta-divider {
  width: 1px;
  height: 14px; /* 减小高度 */
  background-color: #D1D5DB;
  margin: 0 12px; /* 减小外边距 */
}

.video-description {
  position: relative;
  color: #4B5563;
  line-height: 1.6;
  font-size: 13px; /* 减小字体大小 */
  display: flex;
  align-items: flex-end;
  background-color: #f9f9f9;
  border-radius: 6px; /* 减小圆角 */
  padding: 10px 12px; /* 减小内边距 */
}

.description-text {
  flex: 1;
}

.more-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 13px; /* 减小字体大小 */
  cursor: pointer;
  padding: 3px 8px; /* 减小内边距 */
  margin-left: 6px; /* 减小左边距 */
  border-radius: 4px;
  transition: all 0.2s;
}

.more-button:hover {
  background-color: var(--primary-light);
  text-decoration: none;
}

/* 视频内容区域 */
.video-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 320px; /* 减小侧边栏宽度 */
  gap: 12px; /* 减小间距 */
  margin-top: 12px; /* 减小顶部外边距 */
}

.video-main-content {
  width: 100%;
}

.video-player-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background-color: #000;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.iframe-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.video-loading,
.video-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
}

/* B站风格侧边栏 */
.bilibili-sidebar {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  border: 1px solid #E5E7EB;
}

.playlist-header {
  padding: 10px 12px; /* 减小内边距 */
  border-bottom: 1px solid #E5E7EB;
}

.playlist-title {
  display: flex;
  align-items: baseline;
  margin-bottom: 6px; /* 减小底部外边距 */
}

.main-title {
  font-size: 15px; /* 减小字体大小 */
  font-weight: 600;
  color: #1F2937;
  margin-right: 6px; /* 减小右边距 */
}

.sub-title {
  font-size: 12px; /* 减小字体大小 */
  color: #6B7280;
}

.playlist-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px; /* 减小底部外边距 */
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 5px 24px 5px 8px; /* 减小内边距 */
  border: 1px solid #E5E7EB;
  border-radius: 14px; /* 减小圆角 */
  font-size: 12px; /* 减小字体大小 */
  background-color: var(--bilibili-light);
  outline: none;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-icon, .clear-icon {
  position: absolute;
  right: 8px; /* 减小右边距 */
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  cursor: pointer;
}

.playlist-toggle {
  width: 22px; /* 减小宽度 */
  height: 22px; /* 减小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 6px; /* 减小左边距 */
  color: #6B7280;
  transition: color 0.2s;
}

.playlist-toggle:hover {
  color: var(--primary-color);
}

.playlist-stats {
  display: flex;
  align-items: center;
  gap: 10px; /* 减小间距 */
  font-size: 12px; /* 减小字体大小 */
  color: #6B7280;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px; /* 减小间距 */
  cursor: pointer;
}

.stat-item:hover {
  color: var(--primary-color);
}

.playlist-content {
  overflow-y: auto;
  flex: 1;
  max-height: calc(100vh - 280px); /* 调整最大高度 */
}

.playlist-section {
  border-bottom: 1px solid #F3F4F6;
}

.chapter-header {
  padding: 8px 10px; /* 减小内边距 */
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: var(--bilibili-gray);
}

.chapter-header:hover {
  background-color: var(--bilibili-light);
}

.chapter-index {
  width: 18px; /* 减小宽度 */
  height: 18px; /* 减小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border-radius: 3px; /* 减小圆角 */
  font-size: 11px; /* 减小字体大小 */
  margin-right: 8px; /* 减小右边距 */
}

.chapter-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chapter-name {
  font-weight: 500;
  font-size: 13px; /* 减小字体大小 */
  color: #1F2937;
}

.chapter-count {
  font-size: 11px; /* 减小字体大小 */
  color: #6B7280;
}

.chapter-toggle {
  color: #6B7280;
}

.video-list {
  background-color: #FFFFFF;
}

.bilibili-video-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 10px; /* 减小内边距 */
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.bilibili-video-item:hover {
  background-color: var(--bilibili-light);
}

.bilibili-video-item.active {
  background-color: var(--primary-light);
}

.bilibili-video-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px; /* 减小宽度 */
  background-color: var(--primary-color);
}

.video-index {
  width: 18px; /* 减小宽度 */
  min-width: 18px; /* 减小最小宽度 */
  text-align: center;
  font-size: 12px; /* 减小字体大小 */
  color: #6B7280;
  margin-right: 8px; /* 减小右边距 */
  padding-top: 8px; /* 减小顶部内边距 */
}

.bilibili-video-item.active .video-index {
  color: var(--primary-color);
  font-weight: 600;
}

.video-thumbnail {
  width: 80px; /* 减小宽度 */
  height: 45px; /* 减小高度 */
  border-radius: 3px; /* 减小圆角 */
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  margin-right: 8px; /* 减小右边距 */
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px; /* 减小字体大小 */
  padding: 0 2px; /* 减小内边距 */
  border-radius: 2px;
}

.playing-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.video-detail {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-size: 12px; /* 减小字体大小 */
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #1F2937;
}

.video-stats {
  font-size: 10px; /* 减小字体大小 */
  color: #6B7280;
  display: flex;
  align-items: center;
}

.view-count {
  margin-right: 6px;
}

.empty-playlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0; /* 减小内边距 */
  color: #6B7280;
}

.empty-playlist p {
  margin-top: 10px;
}

/* 分享模态框样式 */
.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
}

.share-content {
  padding: 20px 0;
}

.share-video-info {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.share-thumbnail {
  width: 100px;
  height: 56px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.share-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.share-title {
  flex: 1;
  font-weight: 500;
  font-size: 16px;
  color: #1F2937;
}

.share-link {
  display: flex;
  margin-bottom: 24px;
}

.share-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  color: #4B5563;
  outline: none;
}

.copy-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background-color: var(--primary-dark);
}

.share-platforms {
  margin-top: 20px;
}

.platform-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #1F2937;
}

.platform-icons {
  display: flex;
  gap: 12px;
}

.platform-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F3F4F6;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.platform-icon:hover {
  transform: translateY(-2px);
}

.platform-icon.wechat:hover {
  background-color: #07C160;
  color: white;
}

.platform-icon.weibo:hover {
  background-color: #E6162D;
  color: white;
}

.platform-icon.qq:hover {
  background-color: #12B7F5;
  color: white;
}

.platform-icon.twitter:hover {
  background-color: #1DA1F2;
  color: white;
}

.platform-icon.facebook:hover {
  background-color: #1877F2;
  color: white;
}

/* 完成提示模态框 */
.completion-content {
  padding: 20px 0;
  text-align: center;
}

.completion-content p {
  font-size: 16px;
  margin-bottom: 20px;
  color: #1F2937;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.cancel-button {
  padding: 8px 16px;
  background-color: #F3F4F6;
  color: #4B5563;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #E5E7EB;
}

.next-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.next-button:hover {
  background-color: var(--primary-dark);
}

/* 描述详情模态框 */
.description-content {
  padding: 0 8px;
}

.description-content h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1F2937;
}

.description-content p {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #4B5563;
}

.description-meta {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
}

.meta-row {
  display: flex;
  margin-bottom: 12px;
}

.meta-label {
  width: 100px;
  font-weight: 500;
  color: #4B5563;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 剧场模式 */
.container.theater-mode {
  max-width: 100%;
  padding: 0;
}

.container.theater-mode .video-content-wrapper {
  display: block;
  background-color: #000;
}

.container.theater-mode .video-player-container {
  max-width: none;
  padding-top: 56.25%;
  border-radius: 0;
}

.container.theater-mode .bilibili-sidebar {
  max-width: 2200px; /* 增加最大宽度以匹配容器 */
  margin: 24px auto;
  max-height: 400px;
  padding: 0 8px; /* 减少内边距 */
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .video-content-wrapper {
    grid-template-columns: 1fr;
  }

  .bilibili-sidebar {
    max-height: 400px;
  }

  .video-title-section {
    flex-direction: column;
  }

  .video-source-info {
    margin-top: 16px;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: flex-start;
  }

  .video-tags {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .video-primary-title {
    font-size: 20px;
  }

  .video-subtitle {
    font-size: 14px;
  }

  .video-meta-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .meta-divider {
    display: none;
  }

  .video-thumbnail {
    width: 80px;
    height: 45px;
  }
}
</style>

<style>
/* 全局样式 - 自定义Video.js */
.video-js {
  width: 100%;
  height: 100%;
  outline: none;
}

.video-js .vjs-big-play-button {
  background-color: rgba(251, 114, 153, 0.8);  /* B站粉色透明版 */
  border: none;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  line-height: 70px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.2s;
}

.video-js:hover .vjs-big-play-button {
  background-color: #FB7299;  /* B站粉色 */
  transform: translate(-50%, -50%) scale(1.1);
}

.video-js .vjs-control-bar {
  background-color: rgba(0, 0, 0, 0.7);
  height: 40px;
}

.video-js .vjs-play-progress {
  background-color: #FB7299;  /* B站粉色 */
}

.video-js .vjs-volume-level {
  background-color: #FB7299;  /* B站粉色 */
}

.video-js .vjs-play-control:hover,
.video-js .vjs-volume-menu-button:hover,
.video-js .vjs-fullscreen-control:hover {
  color: #FB7299;  /* B站粉色 */
}

/* 自定义滑块样式 */
.video-js .vjs-progress-holder {
  height: 0.4em;
}

.video-js .vjs-progress-holder:hover .vjs-play-progress {
  background-color: #ED5E89;
}

.video-js .vjs-control:focus:before,
.video-js .vjs-control:hover:before {
  text-shadow: 0 0 1em white;
}

.video-js .vjs-menu-button-popup .vjs-menu {
  width: 14em;
}

.video-js .vjs-time-tooltip,
.video-js .vjs-mouse-display:after,
.video-js .vjs-play-progress:after {
  border-radius: 2px;
  font-size: 12px;
}
</style>