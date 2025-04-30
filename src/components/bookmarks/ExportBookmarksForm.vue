<template>
  <div class="export-bookmarks-form">
    <div class="export-header">
      <div class="title-section">
        <icon-font type="icon-export" class="title-icon" />
        <h3 class="export-title">导出书签</h3>
      </div>
      <p class="export-subtitle">选择您需要的导出格式和选项</p>
    </div>

    <n-divider />

    <div class="export-options">
      <div class="format-section">
        <h4 class="section-title">选择导出格式</h4>
        <div class="format-grid">
          <div
              v-for="format in exportFormats"
              :key="format.value"
              class="format-item"
              :class="{ 'active': selectedFormat === format.value }"
              @click="selectedFormat = format.value"
          >
            <icon-font :type="format.icon" class="format-icon" />
            <div class="format-info">
              <div class="format-name">{{ format.label }}</div>
              <div class="format-desc">{{ format.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <n-divider />

      <div class="filter-section">
        <h4 class="section-title">导出范围选择</h4>
        <n-radio-group v-model:value="exportScope" class="scope-select">
          <n-space>
            <n-radio :value="'all'">导出全部书签({{ totalBookmarks }})</n-radio>
            <n-radio :value="'filtered'" :disabled="!hasActiveFilters">导出当前筛选结果({{ filteredBookmarks }})</n-radio>
            <n-radio :value="'selected'" :disabled="!hasSelectedBookmarks">导出选中书签({{ selectedBookmarksCount }})</n-radio>
          </n-space>
        </n-radio-group>
      </div>

      <n-divider />

      <div class="options-section">
        <h4 class="section-title">导出选项</h4>
        <n-space vertical>
          <n-checkbox v-model:checked="includeDescription">
            <span class="option-label">
              <icon-font type="icon-description" />
              包含书签描述
            </span>
          </n-checkbox>
          <n-checkbox v-model:checked="includeTags">
            <span class="option-label">
              <icon-font type="icon-tag" />
              包含标签信息
            </span>
          </n-checkbox>
          <n-checkbox v-model:checked="includeDateTime">
            <span class="option-label">
              <icon-font type="icon-calendar" />
              包含创建日期
            </span>
          </n-checkbox>
          <n-checkbox v-model:checked="useFolderStructure" v-if="selectedFormat === 'html'">
            <span class="option-label">
              <icon-font type="icon-folder" />
              按标签组织文件夹结构
            </span>
          </n-checkbox>
        </n-space>
      </div>

      <n-divider />

      <div class="preview-section">
        <div class="preview-header">
          <h4 class="section-title">导出预览</h4>
          <n-tag type="info">{{ getFormatLabel() }}</n-tag>
        </div>
        <div class="preview-content">
          <n-code :code="previewCode" :language="previewLanguage" class="preview-code" />
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <n-button @click="$emit('cancel')">取消</n-button>
      <n-button type="primary" @click="handleExport" :loading="exporting">
        <template #icon>
          <icon-font type="icon-download" />
        </template>
        导出书签
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
  },
  filteredBookmarks: {
    type: Number,
    default: 0
  },
  selectedBookmarks: {
    type: Array,
    default: () => []
  },
  hasActiveFilters: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel', 'export-complete'])
const message = useMessage()

// 导出状态
const selectedFormat = ref('html')
const exportScope = ref('all')
const includeDescription = ref(true)
const includeTags = ref(true)
const includeDateTime = ref(true)
const useFolderStructure = ref(false)
const exporting = ref(false)

// 计算属性
const totalBookmarks = computed(() => props.bookmarks.length)
const selectedBookmarksCount = computed(() => props.selectedBookmarks.length)
const hasSelectedBookmarks = computed(() => selectedBookmarksCount.value > 0)

// 导出格式选项
const exportFormats = [
  {
    label: 'HTML',
    value: 'html',
    icon: 'icon-html5',
    description: '兼容大多数浏览器的书签导入',
  },
  {
    label: 'JSON',
    value: 'json',
    icon: 'icon-json',
    description: '完整保留所有书签数据和结构',
  },
  {
    label: 'CSV',
    value: 'csv',
    icon: 'icon-csv',
    description: '可用Excel打开，便于编辑和处理',
  },
  {
    label: 'Markdown',
    value: 'markdown',
    icon: 'icon-markdown',
    description: '生成美观的Markdown列表文档',
  }
]

// 获取当前选择的格式标签
function getFormatLabel() {
  const format = exportFormats.find(f => f.value === selectedFormat.value)
  return format ? format.label : ''
}

// 预览代码示例
const previewCode = computed(() => {
  const sampleBookmark = {
    title: "SpringBoot 最佳实践",
    url: "https://github.com/spring-projects/spring-boot",
    description: "Spring Boot 官方仓库，包含最佳实践指南和示例代码。",
    tags: ["SpringBoot", "Java"],
    createdTime: "2023-04-15 14:30:22"
  }

  switch (selectedFormat.value) {
    case 'html':
      return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><A HREF="${sampleBookmark.url}" ADD_DATE="${Date.now()}">${sampleBookmark.title}</A>
    ${includeDescription.value ? `<DD>${sampleBookmark.description}` : ''}
</DL><p>`

    case 'json':
      const jsonData = {
        title: sampleBookmark.title,
        url: sampleBookmark.url
      }
      if (includeDescription.value) jsonData.description = sampleBookmark.description
      if (includeTags.value) jsonData.tags = sampleBookmark.tags
      if (includeDateTime.value) jsonData.createdTime = sampleBookmark.createdTime

      return JSON.stringify([jsonData], null, 2)

    case 'csv':
      let header = ['标题', 'URL']
      if (includeDescription.value) header.push('描述')
      if (includeTags.value) header.push('标签')
      if (includeDateTime.value) header.push('创建时间')

      let row = [sampleBookmark.title, sampleBookmark.url]
      if (includeDescription.value) row.push(sampleBookmark.description)
      if (includeTags.value) row.push(sampleBookmark.tags.join(','))
      if (includeDateTime.value) row.push(sampleBookmark.createdTime)

      return `${header.join(',')}\n${row.join(',')}`

    case 'markdown':
      let md = `# 书签列表\n\n`
      md += `## Java相关\n\n`
      md += `- [${sampleBookmark.title}](${sampleBookmark.url})`
      if (includeDescription.value) md += ` - ${sampleBookmark.description}`
      if (includeTags.value) md += `\n  - 标签: ${sampleBookmark.tags.join(', ')}`
      if (includeDateTime.value) md += `\n  - 添加时间: ${sampleBookmark.createdTime}`
      return md

    default:
      return ''
  }
})

// 获取预览代码语言
const previewLanguage = computed(() => {
  switch (selectedFormat.value) {
    case 'html': return 'html'
    case 'json': return 'json'
    case 'csv': return 'javascript' // CSV没有专门的高亮支持，用js替代
    case 'markdown': return 'markdown'
    default: return 'javascript'
  }
})

// 处理导出请求
function handleExport() {
  exporting.value = true

  // 模拟导出处理延迟
  setTimeout(() => {
    // 根据选择的范围获取要导出的书签
    let bookmarksToExport = []
    switch (exportScope.value) {
      case 'all':
        bookmarksToExport = props.bookmarks
        break
      case 'filtered':
        // 这里应该从父组件获取筛选后的书签
        bookmarksToExport = props.bookmarks.slice(0, props.filteredBookmarks)
        break
      case 'selected':
        bookmarksToExport = props.selectedBookmarks
        break
    }

    // 生成导出内容
    const exportContent = generateExportContent(bookmarksToExport)

    // 创建并触发下载
    downloadFile(exportContent, `bookmarks_export_${new Date().getTime()}.${selectedFormat.value}`)

    message.success(`成功导出 ${bookmarksToExport.length} 个书签`)
    exporting.value = false
    emit('export-complete')
  }, 1000)
}

// 生成导出内容
function generateExportContent(bookmarks) {
  switch (selectedFormat.value) {
    case 'html':
      return generateHtmlExport(bookmarks)
    case 'json':
      return generateJsonExport(bookmarks)
    case 'csv':
      return generateCsvExport(bookmarks)
    case 'markdown':
      return generateMarkdownExport(bookmarks)
    default:
      return ''
  }
}

// 生成HTML格式导出
function generateHtmlExport(bookmarks) {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>书签</H1>
<DL><p>\n`

  if (useFolderStructure.value && includeTags.value) {
    // 按标签组织文件夹结构
    const bookmarksByTag = {}

    // 首先归类
    bookmarks.forEach(bookmark => {
      if (bookmark.tags && bookmark.tags.length > 0) {
        bookmark.tags.forEach(tag => {
          if (!bookmarksByTag[tag]) {
            bookmarksByTag[tag] = []
          }
          bookmarksByTag[tag].push(bookmark)
        })
      } else {
        if (!bookmarksByTag['未分类']) {
          bookmarksByTag['未分类'] = []
        }
        bookmarksByTag['未分类'].push(bookmark)
      }
    })

    // 然后生成HTML
    for (const tag in bookmarksByTag) {
      html += `    <DT><H3>${tag}</H3>\n    <DL><p>\n`

      bookmarksByTag[tag].forEach(bookmark => {
        const timestamp = new Date().getTime()
        html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${timestamp}">${bookmark.title}</A>\n`
        if (includeDescription.value && bookmark.description) {
          html += `        <DD>${bookmark.description}\n`
        }
      })

      html += `    </DL><p>\n`
    }
  } else {
    // 简单列表结构
    bookmarks.forEach(bookmark => {
      const timestamp = new Date().getTime()
      html += `    <DT><A HREF="${bookmark.url}" ADD_DATE="${timestamp}">${bookmark.title}</A>\n`
      if (includeDescription.value && bookmark.description) {
        html += `    <DD>${bookmark.description}\n`
      }
    })
  }

  html += `</DL><p>`
  return html
}

// 生成JSON格式导出
function generateJsonExport(bookmarks) {
  const exportData = bookmarks.map(bookmark => {
    const data = {
      title: bookmark.title,
      url: bookmark.url
    }

    if (includeDescription.value && bookmark.description) {
      data.description = bookmark.description
    }

    if (includeTags.value && bookmark.tags) {
      data.tags = bookmark.tags
    }

    if (includeDateTime.value && bookmark.createdTime) {
      data.createdTime = bookmark.createdTime
    }

    return data
  })

  return JSON.stringify(exportData, null, 2)
}

// 生成CSV格式导出
function generateCsvExport(bookmarks) {
  // 定义头部
  let header = ['标题', 'URL']
  if (includeDescription.value) header.push('描述')
  if (includeTags.value) header.push('标签')
  if (includeDateTime.value) header.push('创建时间')

  // 生成CSV行
  const rows = bookmarks.map(bookmark => {
    let row = [
      `"${bookmark.title.replace(/"/g, '""')}"`,
      `"${bookmark.url.replace(/"/g, '""')}"`
    ]

    if (includeDescription.value) {
      row.push(`"${bookmark.description ? bookmark.description.replace(/"/g, '""') : ''}"`)
    }

    if (includeTags.value) {
      row.push(`"${bookmark.tags ? bookmark.tags.join(',').replace(/"/g, '""') : ''}"`)
    }

    if (includeDateTime.value) {
      row.push(`"${bookmark.createdTime ? bookmark.createdTime.replace(/"/g, '""') : ''}"`)
    }

    return row.join(',')
  })

  // 组合为CSV
  return [header.join(','), ...rows].join('\n')
}

// 生成Markdown格式导出
function generateMarkdownExport(bookmarks) {
  let md = `# 书签列表\n\n`

  if (useFolderStructure.value && includeTags.value) {
    // 按标签组织结构
    const bookmarksByTag = {}

    // 归类
    bookmarks.forEach(bookmark => {
      if (bookmark.tags && bookmark.tags.length > 0) {
        bookmark.tags.forEach(tag => {
          if (!bookmarksByTag[tag]) {
            bookmarksByTag[tag] = []
          }
          bookmarksByTag[tag].push(bookmark)
        })
      } else {
        if (!bookmarksByTag['未分类']) {
          bookmarksByTag['未分类'] = []
        }
        bookmarksByTag['未分类'].push(bookmark)
      }
    })

    // 生成Markdown
    for (const tag in bookmarksByTag) {
      md += `## ${tag}\n\n`

      bookmarksByTag[tag].forEach(bookmark => {
        md += `- [${bookmark.title}](${bookmark.url})`

        if (includeDescription.value && bookmark.description) {
          md += ` - ${bookmark.description}`
        }

        if (includeDateTime.value && bookmark.createdTime) {
          md += `\n  - 添加时间: ${bookmark.createdTime}`
        }

        md += '\n'
      })

      md += '\n'
    }
  } else {
    // 简单列表
    bookmarks.forEach(bookmark => {
      md += `- [${bookmark.title}](${bookmark.url})`

      if (includeDescription.value && bookmark.description) {
        md += ` - ${bookmark.description}`
      }

      if (includeTags.value && bookmark.tags) {
        md += `\n  - 标签: ${bookmark.tags.join(', ')}`
      }

      if (includeDateTime.value && bookmark.createdTime) {
        md += `\n  - 添加时间: ${bookmark.createdTime}`
      }

      md += '\n'
    })
  }

  return md
}

// 触发文件下载
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.export-bookmarks-form {
  max-width: 800px;
  margin: 0 auto;
}

.export-header {
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

.export-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.export-subtitle {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: var(--text-color-base);
}

/* 格式选择 */
.format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.format-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--divider-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.format-item.active {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.format-icon {
  font-size: 24px;
  color: var(--text-color-secondary);
}

.format-item.active .format-icon {
  color: var(--primary-color);
}

.format-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.format-name {
  font-weight: 500;
}

.format-item.active .format-name {
  color: var(--primary-color);
}

.format-desc {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

/* 导出选项 */
.option-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 预览区域 */
.preview-section {
  background-color: var(--body-color);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--divider-color);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-content {
  max-height: 200px;
  overflow: auto;
  border-radius: 6px;
  background-color: var(--card-color);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>