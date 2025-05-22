<template>
  <div
      class="document-card"
      :class="[`doc-type-${document.type}`, {'is-important': document.isImportant}]"
      @click="handleViewDocument"
  >
    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 文档头部：类型标识和操作 -->
      <div class="card-header">
        <div class="doc-type-badge" :style="getTypeStyle(document.type)">
          <icon-font :type="typeIcon" :size="18" color="#fff" />
          <span>{{ typeName }}</span>
        </div>

        <div class="header-actions">
          <!-- 星标按钮 -->
          <div
              class="star-action"
              :class="{'starred': document.isImportant}"
              @click.stop="toggleStarred"
          >
            <icon-font
                :type="document.isImportant ? 'icon-star-filled' : 'icon-star'"
                :size="18"
                :color="document.isImportant ? '#f59e0b' : null"
            />
          </div>

          <!-- 更多菜单 -->
          <n-dropdown
              trigger="click"
              :options="actionOptions"
              @select="handleAction"
              placement="bottom-end"
              @click.stop
          >
            <div class="more-action">
              <icon-font type="icon-more" :size="18" />
            </div>
          </n-dropdown>
        </div>
      </div>

      <!-- 文档标题和日期 -->
      <div class="doc-title-section">
        <h3 class="doc-title">{{ document.title }}</h3>
        <div class="doc-date">
          <icon-font type="icon-time" :size="14" />
          <span>{{ formatTime(document.createdTime) }}</span>
        </div>
      </div>

      <!-- 文档描述 -->
      <div class="doc-description">
        {{ document.description }}
      </div>

      <!-- 文档标签 -->
      <div class="doc-tags" v-if="document.tags && document.tags.length > 0">
        <div
            v-for="(tag, index) in visibleTags"
            :key="index"
            class="tag-pill"
            :style="getTagStyle(tag)"
        >
          <span class="tag-hash">#</span>
          <span>{{ tag }}</span>
        </div>
        <div
            v-if="document.tags.length > maxVisibleTags"
            class="tags-more"
        >
          +{{ document.tags.length - maxVisibleTags }}
        </div>
      </div>

      <!-- 文档元数据 -->
      <div class="doc-meta">
        <div class="meta-left">
          <div class="meta-category" :style="getCategoryStyle(document.category)">
            <icon-font type="icon-category" :size="14" :color="getCategoryColor(document.category)" />
            <span>{{ document.category }}</span>
          </div>
        </div>

        <div class="meta-right">
          <div class="meta-item file-size">
            <icon-font type="icon-file-size" :size="14" />
            <span>{{ formatFileSize(document.fileSize) }}</span>
          </div>

          <div class="meta-divider"></div>

          <div class="meta-item views">
            <icon-font type="icon-view" :size="14" />
            <span>{{ document.viewCount }}</span>
            <span class="meta-label">浏览</span>
          </div>
        </div>
      </div>

      <!-- 卡片底部：操作 -->
      <div class="card-footer">
        <div class="quick-actions">
          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <div class="action-btn edit" @click.stop="emitAction('edit')">
                <icon-font type="icon-edit" :size="16" />
                <span>编辑</span>
              </div>
            </template>
            编辑文档
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <div class="action-btn download" @click.stop="emitAction('download')">
                <icon-font type="icon-download" :size="16" />
                <span>下载</span>
              </div>
            </template>
            下载文档
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <div class="action-btn share" @click.stop="emitAction('share')">
                <icon-font type="icon-share" :size="16" />
                <span>分享</span>
              </div>
            </template>
            分享文档
          </n-tooltip>

          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <div class="action-btn delete" @click.stop="handleDelete">
                <icon-font type="icon-delete" :size="16" />
                <span>删除</span>
              </div>
            </template>
            删除文档
          </n-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h, ref } from 'vue'
import { useDialog } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'edit', 'delete', 'download', 'share', 'star'])
const dialog = useDialog()

// 文档类型对应的图标、名称和颜色
const documentTypeMap = {
  markdown: { icon: 'icon-markdown', name: 'Markdown', color: '#6366f1', gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' },
  pdf: { icon: 'icon-pdf', name: 'PDF', color: '#e11d48', gradient: 'linear-gradient(135deg, #fb7185 0%, #be123c 100%)' },
  word: { icon: 'icon-word', name: 'Word', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)' },
  excel: { icon: 'icon-excel', name: 'Excel', color: '#16a34a', gradient: 'linear-gradient(135deg, #4ade80 0%, #15803d 100%)' },
  ppt: { icon: 'icon-ppt', name: 'PPT', color: '#ea580c', gradient: 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)' },
  text: { icon: 'icon-text', name: '文本', color: '#525252', gradient: 'linear-gradient(135deg, #737373 0%, #404040 100%)' },
  image: { icon: 'icon-image', name: '图片', color: '#0e7490', gradient: 'linear-gradient(135deg, #22d3ee 0%, #0e7490 100%)' },
  audio: { icon: 'icon-audio', name: '音频', color: '#7e22ce', gradient: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)' },
  video: { icon: 'icon-video', name: '视频', color: '#db2777', gradient: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)' }
}

// 获取文档类型样式
const getTypeStyle = (type) => {
  const typeInfo = documentTypeMap[type] || documentTypeMap.text
  return {
    background: typeInfo.gradient,
    boxShadow: `0 2px 8px rgba(${hexToRgb(typeInfo.color)}, 0.3)`
  }
}

// 分类颜色映射
const categoryColorMap = {
  '前端技术': '#3b82f6',
  '后端开发': '#10b981',
  '数据库': '#f59e0b',
  '设计资源': '#8b5cf6',
  '运维部署': '#6366f1',
  '产品文档': '#ec4899',
  '会议记录': '#0ea5e9',
  '学习笔记': '#14b8a6',
  '人工智能': '#7c3aed'
}

// 获取分类颜色
const getCategoryColor = (category) => {
  return categoryColorMap[category] || '#64748b'
}

// 获取分类样式
const getCategoryStyle = (category) => {
  const color = getCategoryColor(category)
  return {
    backgroundColor: `rgba(${hexToRgb(color)}, 0.08)`,
    color,
    borderColor: `rgba(${hexToRgb(color)}, 0.12)`
  }
}

// 计算文档类型对应的图标
const typeIcon = computed(() => {
  return documentTypeMap[props.document.type]?.icon || 'icon-file'
})

// 计算文档类型名称
const typeName = computed(() => {
  return documentTypeMap[props.document.type]?.name || '文件'
})

// 计算文档类型颜色
const typeColor = computed(() => {
  return documentTypeMap[props.document.type]?.color || '#64748b'
})

// 显示的标签数量
const maxVisibleTags = 3
const visibleTags = computed(() => {
  if (!props.document.tags || props.document.tags.length === 0) return []
  return props.document.tags.slice(0, maxVisibleTags)
})

// 标签颜色映射
const tagColorMap = {
  'Vue3': '#42b883',
  'React': '#61dafb',
  'TypeScript': '#3178c6',
  'Java': '#f89820',
  'Spring Boot': '#6db33f',
  'MySQL': '#4479a1',
  'Docker': '#2496ed',
  'UI设计': '#ff7c7c',
  'JavaScript': '#f7df1e',
  'HTML/CSS': '#e34f26',
  'Node.js': '#339933',
  'Python': '#3776ab',
  'Flutter': '#02569b',
  'Redis': '#dc382d',
  'MongoDB': '#47a248',
  'Git': '#f05032',
  'Kubernetes': '#326ce5'
}

// 获取标签样式
const getTagStyle = (tag) => {
  const color = tagColorMap[tag] || '#64748b'
  return {
    backgroundColor: `rgba(${hexToRgb(color)}, 0.08)`,
    color: color,
    borderColor: `rgba(${hexToRgb(color)}, 0.2)`
  }
}

// 辅助函数：将16进制颜色转为RGB
function hexToRgb(hex) {
  // 去掉可能存在的 # 符号
  hex = hex.replace(/^#/, '')

  // 解析十六进制颜色值
  let bigint = parseInt(hex, 16)
  let r = (bigint >> 16) & 255
  let g = (bigint >> 8) & 255
  let b = bigint & 255

  return `${r}, ${g}, ${b}`
}

// 下拉菜单选项
const actionOptions = [
  {
    label: '查看文档',
    key: 'view',
    icon: renderIcon('icon-view')
  },
  {
    label: '编辑文档',
    key: 'edit',
    icon: renderIcon('icon-edit')
  },
  {
    label: '下载文档',
    key: 'download',
    icon: renderIcon('icon-download')
  },
  {
    label: '分享文档',
    key: 'share',
    icon: renderIcon('icon-share')
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '删除文档',
    key: 'delete',
    icon: renderIcon('icon-delete'),
    props: {
      style: {
        color: '#e11d48'
      }
    }
  }
]

// 渲染图标函数
function renderIcon(iconType) {
  return () => h(IconFont, { type: iconType, size: 16 })
}

// 处理下拉菜单选择
const handleAction = (key) => {
  emitAction(key)
}

// 处理删除按钮点击
const handleDelete = () => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除文档"${props.document.title}"吗？此操作不可恢复。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      emitAction('delete')
    }
  })
}

// 触发动作事件
const emitAction = (action) => {
  emit(action, props.document.id)
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
}

// 格式化时间（简短格式）
const formatTime = (date) => {
  if (!date) return '-'

  const now = new Date()
  const d = new Date(date)

  // 今天
  if (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
  ) {
    return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
  ) {
    return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  // 今年
  if (d.getFullYear() === now.getFullYear()) {
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
  }

  // 其他年份
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

// 处理查看文档
const handleViewDocument = () => {
  emit('view', props.document.id)
}

// 切换星标状态
const toggleStarred = () => {
  emit('star', props.document.id, !props.document.isImportant)
}
</script>

<style scoped>
/* 文档卡片基础样式 */
.document-card {
  position: relative;
  overflow: hidden;
  background-color: var(--card-color);
  border-radius: 16px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.04),
      0 8px 16px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  min-height: 360px;
  backdrop-filter: blur(8px);
}

.document-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.06),
      0 8px 16px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.06);
}

/* 重要文档样式 */
.document-card.is-important {
  border: 1px solid rgba(250, 204, 21, 0.3);
  box-shadow:
      0 4px 20px rgba(250, 204, 21, 0.08),
      0 8px 16px rgba(0, 0, 0, 0.03);
  background-color: rgba(254, 252, 232, 0.4);
}

/* 卡片内容 */
.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

/* 文档头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

/* 文档类型标识 */
.doc-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 30px;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.document-card:hover .doc-type-badge {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 头部操作区 */
.header-actions {
  display: flex;
  gap: 8px;
}

.star-action,
.more-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.star-action:hover,
.more-action:hover {
  background-color: rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.star-action.starred {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.2);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

/* 文档标题区域 */
.doc-title-section {
  margin-bottom: 14px;
}

/* 文档标题 */
.doc-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 8px 0;
  color: var(--text-color-base);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 文档日期 */
.doc-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

/* 文档描述 */
.doc-description {
  font-size: 14px;
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin-bottom: 18px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

.doc-description::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), var(--card-color));
  pointer-events: none;
}

/* 文档标签 */
.doc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.tag-pill {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 2px;
}

.tag-hash {
  opacity: 0.7;
  font-weight: 600;
}

.tag-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
}

.tags-more {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  background-color: rgba(100, 116, 139, 0.08);
  color: var(--text-color-tertiary);
  border: 1px solid rgba(100, 116, 139, 0.15);
}

/* 文档元数据 */
.doc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.meta-left, .meta-right {
  display: flex;
  align-items: center;
}

/* 新的分类样式 */
.meta-category {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  border-radius: 6px;
  padding: 6px 10px;
  border: 1px solid;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.meta-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.meta-right {
  gap: 10px;
}

.meta-divider {
  width: 1px;
  height: 14px;
  background-color: rgba(0, 0, 0, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.meta-label {
  margin-left: 1px;
  opacity: 0.7;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
}

.quick-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: var(--text-color-secondary);
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
  color: var(--primary-color);
  border-color: rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.action-btn.edit:hover {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.2);
}

.action-btn.download:hover {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.2);
}

.action-btn.share:hover {
  color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.06);
  border-color: rgba(139, 92, 246, 0.2);
}

.action-btn.delete:hover {
  color: #e11d48;
  background-color: rgba(225, 29, 72, 0.06);
  border-color: rgba(225, 29, 72, 0.2);
}
</style>