<!-- src/components/video/CourseCard.vue -->
<template>
  <div class="course-card" @click="$emit('click')">
    <div class="course-cover">
      <img :src="course.coverImage" :alt="course.name" />
      <div class="course-info">
        <div class="course-stats">
          <span>{{ course.chapterCount }}章</span>
          <span>{{ course.videoCount }}个视频</span>
          <span>{{ course.totalDuration }}</span>
        </div>
      </div>
    </div>
    <div class="course-content p-3">
      <h3 class="course-title text-lg font-medium mb-1">{{ course.name }}</h3>
      <p class="course-desc text-tertiary text-sm mb-2">{{ course.description }}</p>
      <div class="course-footer flex justify-between items-center">
        <span class="text-sm text-tertiary">{{ formatDate(course.createdAt) }}</span>
        <n-button size="small" type="primary" @click.stop="$emit('enter', course.id)">
          进入学习
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { VideoCourse } from '@/types/video'

defineEmits(['click', 'enter'])

const props = defineProps({
  course: {
    type: Object as () => VideoCourse,
    required: true
  }
})

function formatDate(dateString: string) {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}
</script>

<style scoped>
.course-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  box-shadow: var(--box-shadow-1);
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-2);
}

.course-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.course-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 8px;
  color: #fff;
}

.course-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.course-title {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.course-desc {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>