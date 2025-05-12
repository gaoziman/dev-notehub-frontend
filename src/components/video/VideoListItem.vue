<!-- src/components/video/VideoListItem.vue -->
<template>
  <div class="video-list-item" @click="$emit('click')">
    <div class="video-list-cover">
      <img :src="video.coverImage" :alt="video.title" />
      <div class="video-duration">{{ video.duration }}</div>
      <div class="video-type-icon" v-if="video.type !== 'upload'">
        <icon-font
            :type="video.type === 'youtube' ? 'icon-youtube' : 'icon-bilibili'"
            :size="16"
            color="#fff"
        />
      </div>
    </div>
    <div class="video-list-content">
      <h3 class="video-title text-base font-medium">{{ video.title }}</h3>
      <div class="video-meta text-sm text-tertiary">
        <div class="flex items-center gap-2">
          <span>{{ video.chapterName }}</span>
          <span>{{ formatViewCount(video.viewCount) }}次观看</span>
        </div>
      </div>
      <p class="video-desc text-sm text-tertiary" v-if="video.description">
        {{ video.description }}
      </p>
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
.video-list-item {
  display: flex;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  box-shadow: var(--box-shadow-1);
  padding: 8px;
}

.video-list-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-2);
}

.video-list-cover {
  position: relative;
  width: 120px;
  height: 68px;
  overflow: hidden;
  border-radius: var(--border-radius-small);
  flex-shrink: 0;
}

.video-list-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 12px;
}

.video-type-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px;
  border-radius: 50%;
}

.video-list-content {
  margin-left: 12px;
  flex: 1;
  overflow: hidden;
}

.video-title {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
}

.video-desc {
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>