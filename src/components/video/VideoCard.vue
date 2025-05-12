<!-- src/components/video/VideoCard.vue -->
<template>
  <div class="video-card" @click="$emit('click')">
    <div class="video-cover">
      <img :src="video.coverImage" :alt="video.title" />
      <div class="video-duration">{{ video.duration }}</div>
      <div class="video-type-icon" v-if="video.type !== 'upload'">
        <icon-font
            :type="video.type === 'youtube' ? 'icon-youtube' : 'icon-bilibili'"
            :size="18"
            color="#fff"
        />
      </div>
    </div>
    <div class="video-content p-2">
      <h3 class="video-title text-base font-medium mb-1">{{ video.title }}</h3>
      <div class="video-meta text-sm text-tertiary">
        <div class="flex items-center justify-between">
          <span>{{ video.chapterName }}</span>
          <span>{{ formatViewCount(video.viewCount) }}次观看</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { VideoItem } from '@/types/video'

defineEmits(['click'])

const props = defineProps({
  video: {
    type: Object as () => VideoItem,
    required: true
  }
})

function formatViewCount(count: number) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}
</script>

<style scoped>
.video-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  box-shadow: var(--box-shadow-1);
}

.video-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-2);
}

.video-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.video-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}

.video-type-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px;
  border-radius: 50%;
}

.video-title {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>