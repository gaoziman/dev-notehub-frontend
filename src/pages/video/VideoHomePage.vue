<!-- 重设计的视频学习中心主页组件 -->
<template>
  <div class="video-home">
    <!-- 精美的英雄区域 -->
    <div class="hero-wrapper">
      <div class="hero-container">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>

        <div class="hero-content">
          <div class="hero-left">
            <h1 class="hero-title">
              <span class="title-primary">视频学习中心</span>
              <span class="title-accent">探索无限可能</span>
            </h1>
            <p class="hero-subtitle">在这里，每一次学习都是通往成功的重要一步。</p>

            <!-- 精美的搜索栏 -->
            <div class="search-wrapper">
              <div class="search-container">
                <icon-font type="icon-search" :size="20" class="search-icon" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索视频课程..."
                    class="search-input"
                    @keyup.enter="handleSearch"
                />
                <button class="search-btn" @click="handleSearch">
                  搜索
                </button>
              </div>
            </div>
          </div>

          <div class="hero-right">
            <!-- 精美的统计卡片 -->
            <div class="stats-grid">
              <div class="stat-card" v-for="stat in userStats" :key="stat.label">
                <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
                  <icon-font :type="stat.icon" :size="24" :style="{ color: stat.iconColor }" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
                <div class="stat-progress" :style="{ width: stat.progress, backgroundColor: stat.progressColor }"></div>
              </div>
            </div>

            <!-- 上传按钮 -->
            <button class="upload-btn" @click="router.push('/video/upload')">
              <icon-font type="icon-upload" :size="18" />
              上传视频
            </button>
          </div>
        </div>

        <!-- 装饰性元素 -->
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
          <div class="shape shape-5"></div>
        </div>
      </div>
    </div>

    <!-- 精美的分类筛选 -->
    <div class="category-filter">
      <div class="filter-container">
        <div class="category-tabs">
          <button
              v-for="category in categories"
              :key="category.value"
              :class="['category-tab', { active: selectedCategory === category.value }]"
              @click="selectedCategory = category.value"
          >
            <span class="tab-text">{{ category.label }}</span>
            <span class="tab-indicator"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 继续学习区域 -->
    <section class="section continue-section">
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">继续学习</h2>
          <p class="section-subtitle">继续你上次的学习进度，不遗漏任何精彩内容</p>
        </div>
        <button class="view-all-btn">
          查看全部
          <icon-font type="icon-arrow-right" :size="16" />
        </button>
      </div>

      <div class="continue-grid">
        <div
            v-for="(course, index) in continueCourses"
            :key="course.id"
            class="continue-card"
            @click="router.push(`/video/watch/${course.id}`)"
        >
          <div class="card-media">
            <img :src="course.thumbnail" :alt="course.title" class="course-image" />
            <div class="media-overlay">
              <button class="play-btn">
                <icon-font type="icon-play" :size="32" />
              </button>
            </div>
            <div class="course-badges">
              <span class="badge" :style="{ backgroundColor: course.badgeColor }">
                {{ course.level }}
              </span>
              <span v-if="course.isHot" class="badge badge-hot">HOT</span>
            </div>
            <div class="duration-tag">
              <icon-font type="icon-time" :size="14" />
              {{ course.duration }}
            </div>
          </div>

          <div class="card-content">
            <div class="course-category">
              <span class="category-tag" :style="{ backgroundColor: course.categoryColor, color: course.categoryTextColor }">
                {{ course.category }}
              </span>
            </div>
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-desc">{{ course.description }}</p>

            <div class="progress-section">
              <div class="progress-info">
                <span class="progress-text">{{ course.progress }}% 已完成</span>
                <span class="chapters-text">第{{ course.currentChapter }}/{{ course.totalChapters }}章</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: course.progress + '%', backgroundColor: course.progressColor }"></div>
              </div>
            </div>

            <div class="card-footer">
              <div class="instructor-info">
                <img :src="course.instructorAvatar" :alt="course.instructor" class="instructor-avatar" />
                <span class="instructor-name">{{ course.instructor }}</span>
              </div>
              <button class="continue-btn" :style="{ backgroundColor: course.progressColor, borderColor: course.progressColor }">
                继续学习
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 学习分类区域 -->
    <section class="section categories-section">
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">学习分类</h2>
          <p class="section-subtitle">浏览不同技术领域的课程，探索你感兴趣的方向</p>
        </div>
        <button class="view-all-btn">
          查看全部
          <icon-font type="icon-arrow-right" :size="16" />
        </button>
      </div>

      <div class="categories-grid">
        <div
            v-for="category in learningCategories"
            :key="category.id"
            class="category-card"
            :style="{ '--category-color': category.color }"
            @click="router.push(`/video/category/${category.id}`)"
        >
          <div class="category-icon-wrapper">
            <icon-font :type="category.icon" :size="32" class="category-icon" />
          </div>
          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-count">{{ category.courses }}门课程</p>
          </div>
          <div class="category-arrow">
            <icon-font type="icon-arrow-right" :size="20" />
          </div>
          <div class="category-bg"></div>
        </div>
      </div>
    </section>

    <!-- 推荐课程区域 -->
    <section class="section courses-section">
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">推荐课程</h2>
          <p class="section-subtitle">精选优质课程，助你快速提升技能</p>
        </div>
        <div class="filter-tabs">
          <button
              v-for="filter in courseFilters"
              :key="filter.value"
              :class="['filter-tab', { active: courseFilter === filter.value }]"
              @click="courseFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="courses-grid">
        <div
            v-for="course in recommendedCourses"
            :key="course.id"
            class="course-card"
            @click="router.push(`/video/course/${course.id}`)"
        >
          <div class="card-image">
            <img :src="course.thumbnail" :alt="course.title" class="course-image" />
            <div class="image-overlay">
              <button class="play-btn">
                <icon-font type="icon-play" :size="28" />
              </button>
            </div>
            <div class="course-badges">
              <span class="badge" :style="{ backgroundColor: course.badgeColor }">
                {{ course.level }}
              </span>
              <span v-if="course.isNew" class="badge badge-new">NEW</span>
              <span v-if="course.isHot" class="badge badge-hot">HOT</span>
            </div>
            <div class="duration-tag">
              <icon-font type="icon-time" :size="14" />
              {{ course.duration }}
            </div>
          </div>

          <div class="card-body">
            <div class="course-meta">
              <span class="category-tag" :style="{ backgroundColor: course.categoryColor, color: course.categoryTextColor }">
                {{ course.category }}
              </span>
              <div class="rating">
                <span class="star">★</span>
                <span class="rating-value">{{ course.rating }}</span>
                <span class="rating-count">({{ course.reviews }})</span>
              </div>
            </div>

            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description">{{ course.description }}</p>

            <div class="course-stats">
              <div class="stat-item">
                <icon-font type="icon-user" :size="16" />
                <span>{{ course.students }}</span>
              </div>
              <div class="stat-item">
                <icon-font type="icon-video" :size="16" />
                <span>{{ course.lessons }}节课</span>
              </div>
              <div class="stat-item">
                <icon-font type="icon-message" :size="16" />
                <span>{{ course.comments }}</span>
              </div>
            </div>

            <div class="course-footer">
              <div class="instructor-info">
                <img :src="course.instructorAvatar" :alt="course.instructor" class="instructor-avatar" />
                <span class="instructor-name">{{ course.instructor }}</span>
              </div>
              <div class="course-price">
                <span v-if="course.isFree" class="price-free">免费</span>
                <template v-else>
                  <span class="price-current">¥{{ course.price }}</span>
                  <span v-if="course.originalPrice" class="price-original">¥{{ course.originalPrice }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最近观看区域 -->
    <section class="section recent-section">
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">最近观看</h2>
          <p class="section-subtitle">继续观看你最近学习的视频内容</p>
        </div>
        <button class="view-all-btn">
          查看全部
          <icon-font type="icon-arrow-right" :size="16" />
        </button>
      </div>

      <div class="recent-grid">
        <div
            v-for="video in recentVideos"
            :key="video.id"
            class="video-card"
            @click="router.push(`/video/watch/${video.id}`)"
        >
          <div class="video-thumbnail">
            <img :src="video.thumbnail" :alt="video.title" class="video-image" />
            <div class="video-overlay">
              <button class="play-btn-small">
                <icon-font type="icon-play" :size="24" />
              </button>
            </div>
            <div class="video-progress" :style="{ width: video.progress + '%' }"></div>
            <div class="duration-tag">
              <icon-font type="icon-time" :size="12" />
              {{ video.duration }}
            </div>
          </div>

          <div class="video-info">
            <div class="video-meta">
              <span class="video-category" :style="{ backgroundColor: video.categoryColor, color: video.categoryTextColor }">
                {{ video.category }}
              </span>
              <span class="watch-time">{{ video.lastWatched }}</span>
            </div>
            <h4 class="video-title">{{ video.title }}</h4>
            <div class="video-details">
              <span class="chapter-info">第{{ video.chapter }}章</span>
              <span class="progress-info">{{ video.progress }}% 已看</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门标签云 -->
    <section class="section tags-section">
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">热门标签</h2>
          <p class="section-subtitle">发现最流行的技术话题和学习内容</p>
        </div>
      </div>

      <div class="tags-cloud">
        <span
            v-for="tag in popularTags"
            :key="tag.id"
            class="tag-item"
            :style="{ '--tag-color': tag.color }"
            @click="router.push(`/video/tag/${tag.id}`)"
        >
          {{ tag.name }}
          <span class="tag-count">{{ tag.count }}</span>
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVideoStore } from '@/stores/video';
import IconFont from "@/components/common/IconFont.vue";

const router = useRouter();
const videoStore = useVideoStore();

// 状态管理
const searchQuery = ref('');
const selectedCategory = ref('all');
const courseFilter = ref('all');

// 用户统计数据
const userStats = [
  {
    icon: 'icon-book',
    value: '25',
    label: '已学课程',
    progress: '67%',
    bgColor: '#E8F5FF',
    iconColor: '#2563EB',
    progressColor: '#2563EB'
  },
  {
    icon: 'icon-time',
    value: '78h',
    label: '学习时长',
    progress: '45%',
    bgColor: '#F0FDF4',
    iconColor: '#059669',
    progressColor: '#059669'
  },
  {
    icon: 'icon-certificate',
    value: '5',
    label: '已获证书',
    progress: '85%',
    bgColor: '#FEF3C7',
    iconColor: '#D97706',
    progressColor: '#D97706'
  }
];

// 分类数据
const categories = [
  { label: '全部课程', value: 'all' },
  { label: '前端开发', value: 'frontend' },
  { label: '后端开发', value: 'backend' },
  { label: '数据库', value: 'database' },
  { label: '人工智能', value: 'ai' },
  { label: '大数据', value: 'bigdata' }
];

// 继续学习数据
const continueCourses = [
  {
    id: 1,
    title: 'Vue3 组合式API实战教程',
    description: '从零开始学习Vue3最新特性，掌握现代前端开发技能',
    thumbnail: 'https://picsum.photos/seed/vue/640/360',
    category: '前端开发',
    categoryColor: '#EFF6FF',
    categoryTextColor: '#2563EB',
    level: '初级',
    badgeColor: '#2563EB',
    isHot: true,
    duration: '1h 20m',
    progress: 67,
    currentChapter: 4,
    totalChapters: 8,
    instructor: '张教授',
    instructorAvatar: 'https://i.pravatar.cc/150?u=1',
    progressColor: '#2563EB'
  },
  {
    id: 2,
    title: 'React Hooks与状态管理进阶',
    description: '深入理解React Hooks原理，掌握复杂状态管理技巧',
    thumbnail: 'https://picsum.photos/seed/react/640/360',
    category: '前端开发',
    categoryColor: '#EFF6FF',
    categoryTextColor: '#2563EB',
    level: '中级',
    badgeColor: '#F59E0B',
    isHot: false,
    duration: '2h 15m',
    progress: 32,
    currentChapter: 2,
    totalChapters: 6,
    instructor: '李老师',
    instructorAvatar: 'https://i.pravatar.cc/150?u=2',
    progressColor: '#F59E0B'
  },
  {
    id: 3,
    title: 'Node.js与Express框架开发实战',
    description: '构建高性能后端应用，掌握企业级Node.js开发技能',
    thumbnail: 'https://picsum.photos/seed/node/640/360',
    category: '后端开发',
    categoryColor: '#F0FDF4',
    categoryTextColor: '#059669',
    level: '高级',
    badgeColor: '#DC2626',
    isHot: false,
    duration: '3h 45m',
    progress: 15,
    currentChapter: 1,
    totalChapters: 10,
    instructor: '王工程师',
    instructorAvatar: 'https://i.pravatar.cc/150?u=3',
    progressColor: '#DC2626'
  }
];

// 学习分类数据
const learningCategories = [
  {
    id: 1,
    name: '前端开发',
    icon: 'icon-code',
    courses: 125,
    color: '#2563EB'
  },
  {
    id: 2,
    name: '后端开发',
    icon: 'icon-server',
    courses: 98,
    color: '#059669'
  },
  {
    id: 3,
    name: '移动开发',
    icon: 'icon-mobile',
    courses: 76,
    color: '#DC2626'
  },
  {
    id: 4,
    name: '数据库',
    icon: 'icon-database',
    courses: 54,
    color: '#7C3AED'
  },
  {
    id: 5,
    name: '人工智能',
    icon: 'icon-ai',
    courses: 89,
    color: '#EA580C'
  },
  {
    id: 6,
    name: '云计算',
    icon: 'icon-cloud',
    courses: 62,
    color: '#0891B2'
  }
];

// 课程过滤选项
const courseFilters = [
  { label: '全部', value: 'all' },
  { label: '最新', value: 'new' },
  { label: '热门', value: 'hot' }
];

// 推荐课程数据
const recommendedCourses = [
  {
    id: 1,
    title: 'TypeScript全栈开发实战',
    description: '从基础到高级，全面掌握TypeScript在前后端开发中的应用',
    thumbnail: 'https://picsum.photos/seed/ts/640/360',
    category: '前端开发',
    categoryColor: '#EFF6FF',
    categoryTextColor: '#2563EB',
    level: '中级',
    badgeColor: '#F59E0B',
    isNew: true,
    isHot: true,
    duration: '8h 30m',
    rating: 4.9,
    reviews: 1234,
    students: '12.5k',
    lessons: 48,
    comments: 567,
    instructor: '陈架构师',
    instructorAvatar: 'https://i.pravatar.cc/150?u=4',
    price: 199,
    originalPrice: 399,
    isFree: false
  },
  {
    id: 2,
    title: 'Python数据分析与机器学习',
    description: '利用Python进行数据分析，构建机器学习模型',
    thumbnail: 'https://picsum.photos/seed/python/640/360',
    category: '数据科学',
    categoryColor: '#FFF7ED',
    categoryTextColor: '#EA580C',
    level: '高级',
    badgeColor: '#DC2626',
    isNew: false,
    isHot: true,
    duration: '12h 15m',
    rating: 4.8,
    reviews: 2156,
    students: '8.9k',
    lessons: 72,
    comments: 892,
    instructor: '刘博士',
    instructorAvatar: 'https://i.pravatar.cc/150?u=5',
    price: 0,
    originalPrice: null,
    isFree: true
  },
  {
    id: 3,
    title: 'Docker容器技术入门到实战',
    description: '掌握容器化部署，提升应用开发和运维效率',
    thumbnail: 'https://picsum.photos/seed/docker/640/360',
    category: '运维',
    categoryColor: '#F0F9FF',
    categoryTextColor: '#0891B2',
    level: '初级',
    badgeColor: '#2563EB',
    isNew: false,
    isHot: false,
    duration: '6h 45m',
    rating: 4.7,
    reviews: 987,
    students: '5.2k',
    lessons: 36,
    comments: 345,
    instructor: '赵老师',
    instructorAvatar: 'https://i.pravatar.cc/150?u=6',
    price: 149,
    originalPrice: 299,
    isFree: false
  },
  {
    id: 4,
    title: 'Flutter跨平台开发实战',
    description: '一套代码，多端运行，打造高性能跨平台应用',
    thumbnail: 'https://picsum.photos/seed/flutter/640/360',
    category: '移动开发',
    categoryColor: '#F0FDF4',
    categoryTextColor: '#059669',
    level: '中级',
    badgeColor: '#F59E0B',
    isNew: true,
    isHot: false,
    duration: '10h 20m',
    rating: 4.6,
    reviews: 1567,
    students: '6.8k',
    lessons: 52,
    comments: 423,
    instructor: '孙技术专家',
    instructorAvatar: 'https://i.pravatar.cc/150?u=7',
    price: 249,
    originalPrice: 499,
    isFree: false
  },
  {
    id: 5,
    title: 'AWS云服务实战教程',
    description: '深入学习AWS核心服务，构建可扩展的云架构',
    thumbnail: 'https://picsum.photos/seed/aws/640/360',
    category: '云计算',
    categoryColor: '#F8FAFC',
    categoryTextColor: '#475569',
    level: '高级',
    badgeColor: '#DC2626',
    isNew: false,
    isHot: true,
    duration: '15h 30m',
    rating: 4.9,
    reviews: 3245,
    students: '15.7k',
    lessons: 84,
    comments: 1234,
    instructor: '周架构师',
    instructorAvatar: 'https://i.pravatar.cc/150?u=8',
    price: 399,
    originalPrice: 799,
    isFree: false
  },
  {
    id: 6,
    title: 'GraphQL API设计与实现',
    description: '下一代API设计，提升数据查询效率',
    thumbnail: 'https://picsum.photos/seed/graphql/640/360',
    category: '后端开发',
    categoryColor: '#F3E8FF',
    categoryTextColor: '#7C3AED',
    level: '中级',
    badgeColor: '#F59E0B',
    isNew: true,
    isHot: false,
    duration: '7h 15m',
    rating: 4.8,
    reviews: 876,
    students: '4.3k',
    lessons: 42,
    comments: 298,
    instructor: '吴高级工程师',
    instructorAvatar: 'https://i.pravatar.cc/150?u=9',
    price: 0,
    originalPrice: null,
    isFree: true
  }
];

// 最近观看数据
const recentVideos = [
  {
    id: 1,
    title: 'Vue3响应式原理深度解析',
    thumbnail: 'https://picsum.photos/seed/recent1/640/360',
    category: '前端',
    categoryColor: '#EFF6FF',
    categoryTextColor: '#2563EB',
    duration: '45:23',
    progress: 75,
    chapter: 3,
    lastWatched: '5分钟前'
  },
  {
    id: 2,
    title: 'Webpack5性能优化实战',
    thumbnail: 'https://picsum.photos/seed/recent2/640/360',
    category: '工程化',
    categoryColor: '#FFF7ED',
    categoryTextColor: '#EA580C',
    duration: '1:02:15',
    progress: 45,
    chapter: 2,
    lastWatched: '2小时前'
  },
  {
    id: 3,
    title: 'Node.js性能监控与优化',
    thumbnail: 'https://picsum.photos/seed/recent3/640/360',
    category: '后端',
    categoryColor: '#F0FDF4',
    categoryTextColor: '#059669',
    duration: '38:49',
    progress: 20,
    chapter: 1,
    lastWatched: '昨天'
  },
  {
    id: 4,
    title: 'Docker Compose实战部署',
    thumbnail: 'https://picsum.photos/seed/recent4/640/360',
    category: '运维',
    categoryColor: '#F0F9FF',
    categoryTextColor: '#0891B2',
    duration: '52:33',
    progress: 90,
    chapter: 5,
    lastWatched: '2天前'
  }
];

// 热门标签数据
const popularTags = [
  { id: 1, name: 'Vue.js', count: '1.2k', color: '#2563EB' },
  { id: 2, name: 'React', count: '985', color: '#06B6D4' },
  { id: 3, name: 'TypeScript', count: '867', color: '#F59E0B' },
  { id: 4, name: 'Node.js', count: '743', color: '#059669' },
  { id: 5, name: 'Python', count: '892', color: '#EA580C' },
  { id: 6, name: 'Docker', count: '567', color: '#3B82F6' },
  { id: 7, name: 'Kubernetes', count: '423', color: '#7C3AED' },
  { id: 8, name: 'AWS', count: '634', color: '#DC2626' },
  { id: 9, name: 'MongoDB', count: '489', color: '#059669' },
  { id: 10, name: '微服务', count: '356', color: '#6366F1' },
  { id: 11, name: 'GraphQL', count: '298', color: '#EC4899' },
  { id: 12, name: 'Webpack', count: '267', color: '#0891B2' },
  { id: 13, name: 'Redis', count: '234', color: '#DC2626' },
  { id: 14, name: '机器学习', count: '567', color: '#F59E0B' },
  { id: 15, name: '区块链', count: '189', color: '#7C3AED' }
];

// 学习路径数据
const learningPaths = [
  {
    id: 1,
    title: '前端工程师成长路径',
    description: '从HTML基础到Vue.js高级应用，全面掌握现代前端开发技能',
    icon: 'icon-code',
    level: '初级',
    courses: 12,
    duration: '36小时',
    students: '12.5k',
    progress: 25,
    color: '#2563EB'
  },
  {
    id: 2,
    title: 'Java全栈开发工程师',
    description: '涵盖Java核心、Spring Boot、微服务架构等企业级开发技能',
    icon: 'icon-java',
    level: '中级',
    courses: 15,
    duration: '48小时',
    students: '8.9k',
    progress: 60,
    color: '#059669'
  },
  {
    id: 3,
    title: 'Python数据科学专家',
    description: 'Python数据分析、机器学习、深度学习全覆盖学习路径',
    icon: 'icon-python',
    level: '高级',
    courses: 18,
    duration: '72小时',
    students: '15.2k',
    progress: 80,
    color: '#EA580C'
  },
  {
    id: 4,
    title: 'DevOps工程师认证',
    description: '掌握容器化、CI/CD、云原生等现代运维核心技能',
    icon: 'icon-devops',
    level: '中级',
    courses: 10,
    duration: '30小时',
    students: '6.7k',
    progress: 40,
    color: '#7C3AED'
  }
];

// 方法
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/video/search?q=${encodeURIComponent(searchQuery.value)}`);
  }
};

// 生命周期
onMounted(async () => {
  // 尝试从store获取数据
  try {
    await Promise.all([
      videoStore.fetchCategories(),
      videoStore.fetchCourses(),
      videoStore.fetchVideos(),
      videoStore.fetchTags()
    ]);
  } catch (error) {
    console.error('获取数据失败:', error);
  }
});
</script>

<style scoped>
/* 基础样式重置 */
* {
  box-sizing: border-box;
}

.video-home {
  min-height: 100vh;
  background: #FAFAFA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 英雄区域样式 */
.hero-wrapper {
  position: relative;
  margin-bottom: 40px;
}

.hero-container {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 24px;
  overflow: hidden;
  margin: 0 24px;
  padding: 60px 40px;
  min-height: 500px;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.15), transparent 70%),
  radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.15), transparent 70%);
  pointer-events: none;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  background-image:
      linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%);
  background-size: 30px 30px;
  background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 60px;
}

.hero-left {
  flex: 1;
  min-width: 400px;
}

.hero-title {
  margin-bottom: 24px;
}

.title-primary {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
  line-height: 1.1;
}

.title-accent {
  display: block;
  font-size: 24px;
  font-weight: 500;
  background: linear-gradient(90deg, #60A5FA, #34D399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: #94A3B8;
  margin-bottom: 40px;
  line-height: 1.6;
}

.search-wrapper {
  position: relative;
}

.search-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0 20px;
  transition: all 0.3s ease;
}

.search-container:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 32px rgba(59, 130, 246, 0.1);
}

.search-container:focus-within {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.search-icon {
  color: #64748B;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 16px 0;
  font-size: 16px;
  color: white;
  placeholder-color: #64748B;
}

.search-input::placeholder {
  color: #64748B;
}

.search-btn {
  background: linear-gradient(135deg, #3B82F6, #1E40AF);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 12px;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.hero-right {
  flex: 1;
  min-width: 400px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-info {
  margin-bottom: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #94A3B8;
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  border-radius: 0 0 16px 16px;
  transition: width 0.8s ease;
}

.upload-btn {
  width: 100%;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  animation: float 12s infinite ease-in-out;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #3B82F6, #1E40AF);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #10B981, #059669);
  bottom: -150px;
  left: -50px;
  animation-delay: 2s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #F59E0B, #D97706);
  top: 20%;
  left: 5%;
  animation-delay: 4s;
}

.shape-4 {
  width: 250px;
  height: 250px;
  background: linear-gradient(45deg, #8B5CF6, #7C3AED);
  bottom: 10%;
  right: 15%;
  animation-delay: 6s;
}

.shape-5 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #EC4899, #DB2777);
  top: 40%;
  right: 30%;
  animation-delay: 8s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* 分类过滤样式 */
.category-filter {
  padding: 0 24px;
  margin-bottom: 40px;
}

.filter-container {
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.category-tabs {
  display: flex;
  gap: 8px;
}

.category-tab {
  position: relative;
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #64748B;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab:hover {
  background: #F8FAFC;
  color: #0F172A;
}

.category-tab.active {
  background: #3B82F6;
  color: white;
}

.tab-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: 24px;
  height: 2px;
  background: #3B82F6;
  border-radius: 1px;
  transform: translateX(-50%) scaleX(0);
  transition: transform 0.3s ease;
}

.category-tab.active .tab-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* 通用区域样式 */
.section {
  padding: 0 24px;
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.header-content h2.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 8px;
  position: relative;
  padding-left: 20px;
}

.header-content h2.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 24px;
  background: linear-gradient(180deg, #3B82F6, #1E40AF);
  border-radius: 4px;
}

.section-subtitle {
  font-size: 15px;
  color: #64748B;
  padding-left: 20px;
}

.view-all-btn {
  background: transparent;
  border: 1px solid #E2E8F0;
  color: #475569;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
  transform: translateX(4px);
}

/* 继续学习区域样式 */
.continue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;
}

.continue-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.continue-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.card-media {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.continue-card:hover .course-image {
  transform: scale(1.1);
}

.media-overlay {
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

.continue-card:hover .media-overlay {
  opacity: 1;
}

.play-btn {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  transition: all 0.3s ease;
  transform: scale(0.8);
}

.continue-card:hover .play-btn {
  transform: scale(1);
  background: white;
}

.course-badges {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
}

.badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(8px);
}

.badge-hot {
  background: rgba(220, 38, 38, 0.9);
}

.badge-new {
  background: rgba(16, 185, 129, 0.9);
}

.duration-tag {
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

.course-category {
  margin-bottom: 12px;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
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

.course-desc {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.chapters-text {
  font-size: 13px;
  color: #64748B;
}

.progress-bar {
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.continue-btn {
  background: transparent;
  border: 1px solid;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 学习分类区域样式 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.category-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid #F1F5F9;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.category-icon-wrapper {
  width: 64px;
  height: 64px;
  background: var(--category-color);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  opacity: 0.1;
  transition: all 0.3s ease;
}

.category-icon {
  color: var(--category-color);
  transition: transform 0.3s ease;
}

.category-card:hover .category-icon-wrapper {
  opacity: 1;
  transform: scale(1.1);
}

.category-info {
  position: relative;
  z-index: 2;
}

.category-name {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 4px;
}

.category-count {
  font-size: 14px;
  color: #64748B;
}

.category-arrow {
  position: absolute;
  top: 24px;
  right: 24px;
  color: #CBD5E1;
  transition: all 0.3s ease;
  opacity: 0;
}

.category-card:hover .category-arrow {
  opacity: 1;
  transform: translateX(4px);
  color: var(--category-color);
}

.category-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: var(--category-color);
  opacity: 0.05;
  border-radius: 50%;
  transform: translate(40px, -40px);
}

/* 推荐课程区域样式 */
.filter-tabs {
  display: flex;
  gap: 8px;
  background: #F1F5F9;
  padding: 4px;
  border-radius: 8px;
}

.filter-tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.5);
}

.filter-tab.active {
  background: white;
  color: #3B82F6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
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

.play-btn {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  transition: all 0.3s ease;
}

.course-card:hover .play-btn {
  background: white;
  transform: scale(1.1);
}

.card-body {
  padding: 24px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #64748B;
}

.star {
  color: #F59E0B;
}

.rating-value {
  font-weight: 600;
  color: #0F172A;
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

.course-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748B;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}

.course-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-free {
  font-size: 16px;
  font-weight: 700;
  color: #10B981;
}

.price-current {
  font-size: 18px;
  font-weight: 700;
  color: #DC2626;
}

.price-original {
  font-size: 14px;
  color: #94A3B8;
  text-decoration: line-through;
}

/* 最近观看区域样式 */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.video-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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
  transform: scale(1.05);
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

.play-btn-small {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  transition: all 0.3s ease;
}

.video-card:hover .play-btn-small {
  background: white;
  transform: scale(1.1);
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.video-category {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.watch-time {
  font-size: 12px;
  color: #94A3B8;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #F3F4F6;
}

.chapter-info {
  font-size: 13px;
  color: #3B82F6;
  font-weight: 500;
}

.progress-info {
  font-size: 12px;
  color: #64748B;
}

/* 热门标签云样式 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(var(--tag-color), 0.1);
  color: var(--tag-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 6px;
}

.tag-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(var(--tag-color), 0.2);
  background: rgba(var(--tag-color), 0.15);
}

.tag-count {
  font-size: 12px;
  opacity: 0.8;
}

/* 学习路径区域样式 */
.paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.path-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.path-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.path-header {
  position: relative;
  height: 100px;
  background: linear-gradient(135deg, rgba(var(--path-color), 0.1), rgba(var(--path-color), 0.05));
  border-bottom: 1px solid rgba(var(--path-color), 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.path-icon-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(var(--path-color), 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.path-icon {
  color: var(--path-color);
}

.path-card:hover .path-icon-wrapper {
  background: rgba(var(--path-color), 0.15);
  transform: scale(1.1);
}

.path-level {
  background: var(--path-color);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.path-content {
  padding: 24px;
}

.path-title {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 8px;
}

.path-description {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 20px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.path-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.path-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748B;
}

.path-footer {
  border-top: 1px solid #F1F5F9;
  padding-top: 20px;
}

.path-progress {
  margin-bottom: 16px;
}

.progress-text {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}

.progress-percent {
  font-weight: 600;
  color: var(--path-color);
}

.path-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--path-color), var(--path-color));
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--path-color), 0.3);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .hero-content {
    gap: 40px;
  }

  .hero-left {
    min-width: 350px;
  }

  .hero-right {
    min-width: 350px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-left,
  .hero-right {
    width: 100%;
    min-width: unset;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .video-home {
    font-size: 14px;
  }

  .hero-container {
    padding: 40px 24px;
    margin: 0 12px;
  }

  .title-primary {
    font-size: 36px;
  }

  .title-accent {
    font-size: 18px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .section {
    padding: 0 12px;
  }

  .section-header h2.section-title {
    font-size: 24px;
  }

  .continue-grid,
  .courses-grid,
  .recent-grid,
  .paths-grid {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .hero-container {
    padding: 32px 16px;
  }

  .title-primary {
    font-size: 32px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .search-container {
    padding: 0 16px;
  }

  .search-input {
    font-size: 15px;
  }

  .search-btn {
    padding: 10px 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .view-all-btn {
    align-self: flex-start;
  }

  .filter-tabs {
    width: 100%;
  }

  .category-tabs {
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .card-content,
  .card-body,
  .path-content {
    padding: 20px;
  }
}
</style>