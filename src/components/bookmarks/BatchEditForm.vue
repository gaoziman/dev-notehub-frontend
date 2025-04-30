<template>
  <div class="batch-edit-form">
    <div class="batch-header">
      <div class="title-section">
        <icon-font type="icon-edit-square" class="title-icon" />
        <h3 class="batch-title">批量编辑书签</h3>
      </div>
      <p class="batch-subtitle">一次性修改多个书签</p>
    </div>

    <n-divider />

    <!-- 选择书签区域 -->
    <div class="bookmark-selection">
      <div class="section-header">
        <h4 class="section-title">选中书签 ({{ selectedBookmarks.length }})</h4>
        <div class="header-actions">
          <n-button text size="small" type="primary" @click="toggleSelectAll" v-if="selectedBookmarks.length < bookmarks.length">
            全选
          </n-button>
          <n-button text size="small" type="warning" @click="clearSelection" v-if="selectedBookmarks.length > 0">
            清除选择
          </n-button>
        </div>
      </div>

      <div class="bookmark-list" v-if="selectedBookmarks.length > 0">
        <div
            v-for="bookmark in selectedBookmarks"
            :key="bookmark.id"
            class="bookmark-item-mini"
        >
          <div class="bookmark-mini-content">
            <icon-font :type="getPlatformIcon(bookmark.platform)" class="platform-icon" />
            <span class="bookmark-title">{{ bookmark.title }}</span>
          </div>
          <n-button quaternary circle size="small" class="remove-btn" @click="removeBookmark(bookmark)">
            <icon-font type="icon-close" />
          </n-button>
        </div>
      </div>

      <div class="empty-selection" v-else>
        <n-empty description="未选择任何书签">
          <template #extra>
            <n-button size="small" @click="selectAllBookmarks">选择全部书签</n-button>
          </template>
        </n-empty>
      </div>
    </div>

    <n-divider />

    <!-- 编辑操作区域 -->
    <div class="edit-operations" :class="{ 'disabled': selectedBookmarks.length === 0 }">
      <div class="section-header">
        <h4 class="section-title">选择编辑操作</h4>
      </div>

      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- 标签操作选项卡 -->
        <n-tab-pane name="tags" tab="标签操作">
          <div class="operation-content">
            <div class="operation-type">
              <n-radio-group v-model:value="tagOperation">
                <n-space>
                  <n-radio value="add">
                    <span class="radio-label">
                      <icon-font type="icon-plus" />
                      添加标签
                    </span>
                  </n-radio>
                  <n-radio value="remove">
                    <span class="radio-label">
                      <icon-font type="icon-minus" />
                      移除标签
                    </span>
                  </n-radio>
                  <n-radio value="replace">
                    <span class="radio-label">
                      <icon-font type="icon-replace" />
                      替换标签
                    </span>
                  </n-radio>
                </n-space>
              </n-radio-group>
            </div>

            <div class="operation-inputs">
              <div v-if="tagOperation === 'add'">
                <n-dynamic-tags
                    v-model:value="tagsToAdd"
                    :max="10"
                    class="tags-input"
                    :input-props="{ placeholder: '输入要添加的标签 (回车确认)' }"
                />
                <div class="suggested-tags">
                  <div class="suggested-title">推荐标签：</div>
                  <div class="tag-suggestions">
                    <n-tag
                        v-for="tag in popularTags"
                        :key="tag"
                        size="small"
                        class="suggested-tag"
                        :style="getTagStyle(tag)"
                        @click="addToTagsList(tag)"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                </div>
              </div>

              <div v-if="tagOperation === 'remove'">
                <n-select
                    v-model:value="tagsToRemove"
                    :options="existingTagOptions"
                    placeholder="选择要移除的标签"
                    multiple
                    filterable
                    tag
                    clearable
                />
              </div>

              <div v-if="tagOperation === 'replace'">
                <div class="replace-inputs">
                  <n-input-group>
                    <n-input v-model:value="oldTag" placeholder="旧标签" />
                    <n-input v-model:value="newTag" placeholder="新标签" />
                  </n-input-group>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- 平台操作选项卡 -->
        <n-tab-pane name="platform" tab="修改平台">
          <div class="operation-content">
            <n-select
                v-model:value="newPlatform"
                :options="platformOptions"
                placeholder="选择新平台"
                clearable
            />
            <div class="platform-preview">
              <n-grid :cols="7" :x-gap="12">
                <n-grid-item v-for="platform in platformOptions" :key="platform.value">
                  <div
                      class="platform-item"
                      :class="{ 'active': newPlatform === platform.value }"
                      @click="newPlatform = platform.value"
                  >
                    <icon-font :type="getPlatformIcon(platform.value)" />
                    <span class="platform-label">{{ platform.label }}</span>
                  </div>
                </n-grid-item>
              </n-grid>
            </div>
          </div>
        </n-tab-pane>

        <!-- 收藏操作选项卡 -->
        <n-tab-pane name="star" tab="收藏操作">
          <div class="operation-content">
            <n-radio-group v-model:value="starOperation">
              <n-space vertical>
                <n-radio value="star">
                  <span class="radio-label">
                    <icon-font type="icon-star-filled" color="#f0a020" />
                    收藏所选书签
                  </span>
                </n-radio>
                <n-radio value="unstar">
                  <span class="radio-label">
                    <icon-font type="icon-star" />
                    取消收藏所选书签
                  </span>
                </n-radio>
                <n-radio value="toggle">
                  <span class="radio-label">
                    <icon-font type="icon-swap" />
                    切换收藏状态
                  </span>
                </n-radio>
              </n-space>
            </n-radio-group>
          </div>
        </n-tab-pane>

        <!-- 删除操作选项卡 -->
        <n-tab-pane name="delete" tab="删除操作">
          <div class="operation-content danger-zone">
            <n-alert title="危险操作" type="error" class="warning-alert">
              <template #icon>
                <icon-font type="icon-warning-filled" />
              </template>
              <p>此操作将永久删除所选书签，无法恢复。</p>
            </n-alert>

            <div class="confirm-delete">
              <n-checkbox v-model:checked="confirmDelete">
                我了解此操作的风险，确认要删除所选的 {{ selectedBookmarks.length }} 个书签
              </n-checkbox>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section" v-if="operationHasEffect && selectedBookmarks.length > 0">
      <n-divider />
      <div class="section-header">
        <h4 class="section-title">操作预览</h4>
      </div>

      <n-alert :type="previewAlertType" class="preview-alert">
        <template #icon>
          <icon-font :type="previewAlertIcon" />
        </template>
        <div class="preview-content">
          <div class="preview-message">{{ previewMessage }}</div>
          <div class="affected-count">影响 {{ selectedBookmarks.length }} 个书签</div>
        </div>
      </n-alert>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <n-button @click="$emit('cancel')">取消</n-button>
      <n-button
          type="primary"
          @click="applyChanges"
          :disabled="!canApplyChanges"
          :loading="processing"
      >
        应用更改
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  bookmarks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cancel', 'update-bookmarks'])
const message = useMessage()

// 状态变量
const selectedBookmarks = ref([])
const activeTab = ref('tags')
const processing = ref(false)

// 标签操作
const tagOperation = ref('add')
const tagsToAdd = ref([])
const tagsToRemove = ref([])
const oldTag = ref('')
const newTag = ref('')

// 平台操作
const newPlatform = ref(null)

// 收藏操作
const starOperation = ref('star')

// 删除操作
const confirmDelete = ref(false)

// 平台选项
const platformOptions = [
  { label: 'GitHub', value: 'github' },
  { label: '掘金', value: 'juejin' },
  { label: 'CSDN', value: 'csdn' },
  { label: '微信', value: 'wechat' },
  { label: '知乎', value: 'zhihu' },
  { label: '博客', value: 'blog' },
  { label: '其他', value: 'other' }
]

// 流行标签示例
const popularTags = [
  'Java', 'Spring', 'SpringBoot', 'JavaScript',
  'Vue', 'React', 'MySQL', 'Redis', '微服务', '分布式', '性能优化'
]

// 已存在的标签选项
const existingTagOptions = computed(() => {
  const allTags = new Set()
  selectedBookmarks.value.forEach(bookmark => {
    if (bookmark.tags) {
      bookmark.tags.forEach(tag => allTags.add(tag))
    }
  })
  return Array.from(allTags).map(tag => ({
    label: tag,
    value: tag
  }))
})

// 标签颜色映射
const tagColorMap = {
  'Java': { color: '#2080f0', borderColor: '#2080f0' },
  'JavaScript': { color: '#f0a020', borderColor: '#f0a020' },
  'Spring': { color: '#18a058', borderColor: '#18a058' },
  'SpringBoot': { color: '#18a058', borderColor: '#18a058' },
  'Vue': { color: '#4FC08D', borderColor: '#4FC08D' },
  'React': { color: '#61DAFB', borderColor: '#61DAFB' },
  'MySQL': { color: '#4479A1', borderColor: '#4479A1' },
  'Redis': { color: '#DC382D', borderColor: '#DC382D' },
  '微服务': { color: '#8a2be2', borderColor: '#8a2be2' },
  '分布式': { color: '#8a2be2', borderColor: '#8a2be2' },
  '性能优化': { color: '#f0a020', borderColor: '#f0a020' }
}

// 获取平台图标
function getPlatformIcon(platform) {
  const iconMap = {
    'github': 'icon-icon_github',
    'juejin': 'icon-juejin',
    'csdn': 'icon-csdn1',
    'wechat': 'icon-weixingongzhonghao',
    'zhihu': 'icon-zhihu',
    'blog': 'icon-blog',
    'other': 'icon-link1'
  }
  return iconMap[platform] || 'icon-link1'
}

// 获取标签样式
function getTagStyle(tag) {
  const colorInfo = tagColorMap[tag]
  const isSelected = tagsToAdd.value.includes(tag)

  if (colorInfo) {
    return {
      borderColor: colorInfo.borderColor,
      color: isSelected ? '#ffffff' : colorInfo.color,
      backgroundColor: isSelected ? colorInfo.color : `${colorInfo.color}10`
    }
  }
  return {}
}

// 添加到标签列表
function addToTagsList(tag) {
  if (!tagsToAdd.value.includes(tag) && tagsToAdd.value.length < 10) {
    tagsToAdd.value.push(tag)
  } else if (tagsToAdd.value.includes(tag)) {
    tagsToAdd.value = tagsToAdd.value.filter(t => t !== tag)
  }
}

// 切换全选
function toggleSelectAll() {
  if (selectedBookmarks.value.length < props.bookmarks.length) {
    selectAllBookmarks()
  } else {
    clearSelection()
  }
}

// 选择全部书签
function selectAllBookmarks() {
  selectedBookmarks.value = [...props.bookmarks]
}

// 清除选择
function clearSelection() {
  selectedBookmarks.value = []
}

// 移除单个书签
function removeBookmark(bookmark) {
  selectedBookmarks.value = selectedBookmarks.value.filter(b => b.id !== bookmark.id)
}

// 判断操作是否有效
const operationHasEffect = computed(() => {
  switch (activeTab.value) {
    case 'tags':
      if (tagOperation.value === 'add') return tagsToAdd.value.length > 0
      if (tagOperation.value === 'remove') return tagsToRemove.value.length > 0
      if (tagOperation.value === 'replace') return oldTag.value && newTag.value
      return false

    case 'platform':
      return newPlatform.value !== null

    case 'star':
      return true

    case 'delete':
      return confirmDelete.value

    default:
      return false
  }
})

// 能否应用更改
const canApplyChanges = computed(() => {
  return selectedBookmarks.value.length > 0 && operationHasEffect.value
})

// 预览消息类型
const previewAlertType = computed(() => {
  if (activeTab.value === 'delete') return 'error'
  return 'info'
})

// 预览图标
const previewAlertIcon = computed(() => {
  if (activeTab.value === 'delete') return 'icon-warning-filled'
  if (activeTab.value === 'star') {
    if (starOperation.value === 'star') return 'icon-star-filled'
    if (starOperation.value === 'unstar') return 'icon-star'
    return 'icon-swap'
  }
  if (activeTab.value === 'tags') {
    if (tagOperation.value === 'add') return 'icon-plus'
    if (tagOperation.value === 'remove') return 'icon-minus'
    return 'icon-replace'
  }
  return 'icon-info'
})

// 预览消息
const previewMessage = computed(() => {
  switch (activeTab.value) {
    case 'tags':
      if (tagOperation.value === 'add') {
        return `将为所选书签添加标签: ${tagsToAdd.value.join(', ')}`
      }
      if (tagOperation.value === 'remove') {
        return `将从所选书签移除标签: ${tagsToRemove.value.join(', ')}`
      }
      if (tagOperation.value === 'replace') {
        return `将所选书签中的标签 "${oldTag.value}" 替换为 "${newTag.value}"`
      }
      return ''

    case 'platform':
      const platform = platformOptions.find(p => p.value === newPlatform.value)
      return `将所选书签的平台修改为: ${platform ? platform.label : newPlatform.value}`

    case 'star':
      if (starOperation.value === 'star') {
        return '将所选书签标记为收藏'
      }
      if (starOperation.value === 'unstar') {
        return '将取消所选书签的收藏标记'
      }
      return '将切换所选书签的收藏状态'

    case 'delete':
      return `将永久删除所选的 ${selectedBookmarks.value.length} 个书签`

    default:
      return ''
  }
})

// 应用更改
function applyChanges() {
  if (!canApplyChanges.value) return

  processing.value = true

  // 克隆原始书签数组
  const updatedBookmarks = JSON.parse(JSON.stringify(props.bookmarks))

  // 获取要处理的书签ID集合
  const selectedIds = new Set(selectedBookmarks.value.map(bookmark => bookmark.id))

  // 根据不同操作类型处理书签
  switch (activeTab.value) {
    case 'tags':
      if (tagOperation.value === 'add') {
        // 添加标签
        updatedBookmarks.forEach(bookmark => {
          if (selectedIds.has(bookmark.id)) {
            bookmark.tags = bookmark.tags || []
            tagsToAdd.value.forEach(tag => {
              if (!bookmark.tags.includes(tag)) {
                bookmark.tags.push(tag)
              }
            })
          }
        })
      } else if (tagOperation.value === 'remove') {
        // 移除标签
        updatedBookmarks.forEach(bookmark => {
          if (selectedIds.has(bookmark.id) && bookmark.tags) {
            bookmark.tags = bookmark.tags.filter(tag => !tagsToRemove.value.includes(tag))
          }
        })
      } else if (tagOperation.value === 'replace') {
        // 替换标签
        updatedBookmarks.forEach(bookmark => {
          if (selectedIds.has(bookmark.id) && bookmark.tags) {
            bookmark.tags = bookmark.tags.map(tag =>
                tag === oldTag.value ? newTag.value : tag
            )
          }
        })
      }
      break

    case 'platform':
      // 更新平台
      updatedBookmarks.forEach(bookmark => {
        if (selectedIds.has(bookmark.id)) {
          bookmark.platform = newPlatform.value
        }
      })
      break

    case 'star':
      // 更新收藏状态
      updatedBookmarks.forEach(bookmark => {
        if (selectedIds.has(bookmark.id)) {
          if (starOperation.value === 'star') {
            bookmark.starred = true
          } else if (starOperation.value === 'unstar') {
            bookmark.starred = false
          } else if (starOperation.value === 'toggle') {
            bookmark.starred = !bookmark.starred
          }
        }
      })
      break

    case 'delete':
      // 删除书签
      if (confirmDelete.value) {
        // 过滤掉所选书签
        const filteredBookmarks = updatedBookmarks.filter(bookmark => !selectedIds.has(bookmark.id))
        emit('update-bookmarks', filteredBookmarks)
        message.success(`成功删除 ${selectedBookmarks.value.length} 个书签`)
        processing.value = false
        emit('cancel')
        return
      }
      break
  }

  // 提交更新后的书签数据
  setTimeout(() => {
    emit('update-bookmarks', updatedBookmarks)
    message.success(`成功更新 ${selectedBookmarks.value.length} 个书签`)
    processing.value = false
    emit('cancel')
  }, 500)
}

// 初始化选择所有书签
selectAllBookmarks()
</script>

<style scoped>
.batch-edit-form {
  max-width: 800px;
  margin: 0 auto;
}

.batch-header {
  text-align: center;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  font-size: 24px;
  color: var(--primary-color);
}

.batch-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.batch-subtitle {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

/* 书签选择区域 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: var(--text-color-base);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.bookmark-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--divider-color);
  border-radius: 6px;
  background-color: var(--body-color);
}

.bookmark-item-mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  background-color: var(--card-color);
  border: 1px solid var(--divider-color);
  border-radius: 16px;
  padding: 4px 8px 4px 10px;
  max-width: 200px;
  overflow: hidden;
}

.bookmark-mini-content {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.platform-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.bookmark-title {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  flex-shrink: 0;
  font-size: 12px;
}

/* 编辑操作区域 */
.edit-operations {
  margin-top: 16px;
}

.edit-operations.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.operation-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.operation-type {
  margin-bottom: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 标签操作 */
.suggested-tags {
  margin-top: 12px;
}

.suggested-title {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggested-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.replace-inputs {
  max-width: 500px;
}

/* 平台预览 */
.platform-preview {
  margin-top: 12px;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border-radius: 6px;
  background-color: var(--body-color);
  border: 1px solid var(--divider-color);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.platform-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.platform-item.active {
  background: linear-gradient(145deg, rgba(var(--primary-color-rgb), 0.1), rgba(var(--primary-color-rgb), 0.2));
  border-color: var(--primary-color);
}

.platform-item .n-icon {
  font-size: 18px;
  color: var(--text-color-secondary);
}

.platform-item.active .n-icon {
  color: var(--primary-color);
}

.platform-label {
  font-size: 12px;
  font-weight: 500;
}

.platform-item.active .platform-label {
  color: var(--primary-color);
}

/* 危险操作区域 */
.danger-zone {
  background-color: rgba(208, 48, 80, 0.05);
  border-radius: 8px;
}

.warning-alert {
  margin-bottom: 16px;
}

.confirm-delete {
  padding: 8px;
}

/* 预览区域 */
.preview-section {
  margin-top: 16px;
}

.preview-alert {
  margin-top: 8px;
}

.preview-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.affected-count {
  font-size: 12px;
  color: var(--text-color-secondary);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>