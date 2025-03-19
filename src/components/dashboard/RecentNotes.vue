<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">最近访问</h2>
      <a-button type="link">查看全部</a-button>
    </div>
    <a-row :gutter="24">
      <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" v-for="(note, index) in notes" :key="index">
        <a-card class="note-card card-hover">
          <div class="note-content">
            <div class="note-header">
              <a-tag :color="note.tagColor">{{ note.tag }}</a-tag>
              <span class="note-time">{{ note.time }}</span>
            </div>
            <h3 class="note-title">{{ note.title }}</h3>
            <p class="note-description">{{ note.description }}</p>
            <div class="note-meta">
              <file-outlined />
              <span>{{ note.format }}</span>
              <span class="meta-divider" v-if="note.pages > 0">•</span>
              <span v-if="note.pages > 0">{{ note.pages }}页</span>
            </div>
          </div>
          <div class="note-footer" v-if="note.progress > 0">
            <div class="progress-info">
              <span class="progress-label">学习进度</span>
              <span class="progress-value-text">{{ note.progress }}%</span>
            </div>
            <div class="note-actions">
              <a-button type="text" class="action-button">
                <template #icon><edit-outlined /></template>
              </a-button>
              <a-button type="text" class="action-button">
                <template #icon><export-outlined /></template>
              </a-button>
            </div>
          </div>
          <div class="progress-bar" v-if="note.progress > 0">
            <div class="progress-value" :style="{ width: `${note.progress}%` }"></div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {
  FileOutlined,
  EditOutlined,
  ExportOutlined
} from '@ant-design/icons-vue';

defineProps<{
  notes: Array<{
    tag: string;
    tagColor: string;
    time: string;
    title: string;
    description: string;
    format: string;
    pages: number;
    progress: number;
  }>;
}>();
</script>

<style scoped>
/* 章节容器通用样式 */
.section-container {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* 笔记卡片样式 */
.note-card {
  border-radius: 12px;
  height: 100%;
  overflow: hidden;
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.note-content {
  padding: 16px 20px;  /* 增加左右内边距 */
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-time {
  font-size: 12px;
  color: #a0aec0;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 10px;  /* 增加下边距 */
  line-height: 1.4;     /* 增加行高 */
}

.note-description {
  font-size: 14px;
  color: #4a5568;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 16px;  /* 增加下边距 */
  line-height: 1.5;     /* 增加行高 */
}

/* 调整元数据的间距 */
.note-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #a0aec0;
  gap: 6px;  /* 添加间隔 */
}

/* 调整进度条信息间距 */
.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;  /* 增加标签与数值之间的间距 */
}
.meta-divider {
  margin: 0 8px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
}

.progress-info {
  display: flex;
  align-items: center;
}

.progress-label {
  font-size: 12px;
  color: #64748b;
  margin-right: 8px;
}

.progress-value-text {
  font-size: 12px;
  font-weight: 500;
  color: #3490dc;
}

.note-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  color: #a0aec0;
  font-size: 14px;
}

.action-button:hover {
  color: #3490dc;
}

/* 进度条样式 */
.progress-bar {
  height: 4px;
  background-color: #e2e8f0;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.progress-value {
  position: absolute;
  height: 100%;
  background: linear-gradient(to right, #3490dc, #6366f1);
  left: 0;
  top: 0;
  transition: width 0.5s ease;
}
</style>