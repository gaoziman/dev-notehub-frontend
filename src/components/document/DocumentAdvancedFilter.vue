<template>
  <div class="advanced-filter-container">
    <!-- 筛选器标题和控制区 -->
    <div class="filter-header" @click="toggleExpand">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-container">
            <icon-font
                :type="expanded ? 'icon-filter-filled' : 'icon-filter'"
                :size="20"
                :color="expanded ? '#fff' : '#6366f1'"
            />
          </div>
          <div class="header-title">
            <span>高级筛选</span>
            <div v-if="activeFilterCount > 0" class="badge-container">
              <span class="badge-count">{{ activeFilterCount }}</span>
            </div>
          </div>
        </div>
        <div class="toggle-icon">
          <div class="toggle-btn" :class="{ 'expanded': expanded }">
            <icon-font
                :type="expanded ? 'icon-up' : 'icon-down'"
                :size="16"
                :color="expanded ? '#6366f1' : '#666'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域内容 -->
    <n-collapse-transition :show="expanded">
      <div class="filter-body">
        <!-- 文档类型筛选 -->
        <div class="filter-section doc-types-section">
          <div class="section-header">
            <div class="section-title">
              <icon-font type="icon-file-type" :size="18" color="#6366f1" />
              <span>文档类型</span>
            </div>
          </div>

          <div class="doc-types-grid">
            <div
                v-for="type in documentTypes"
                :key="type.value"
                class="doc-type-item"
                :class="{ 'active': isTypeActive(type.value) }"
                @click="toggleType(type.value)"
            >
              <div class="type-icon-wrapper" :style="getTypeIconStyle(type)">
                <icon-font
                    :type="type.icon"
                    :size="22"
                    :color="isTypeActive(type.value) ? '#fff' : type.color"
                />
              </div>
              <div class="type-name">{{ type.label }}</div>
            </div>
          </div>
        </div>

        <!-- 文档分类筛选 -->
        <div class="filter-section categories-section">
          <div class="section-header">
            <div class="section-title">
              <icon-font type="icon-category" :size="18" color="#10b981" />
              <span>文档分类</span>
            </div>
          </div>

          <div class="categories-container">
            <div
                v-for="category in categories"
                :key="category.value"
                class="category-item"
                :class="{ 'active': isCategoryActive(category.value) }"
                :style="getCategoryStyle(category)"
                @click="toggleCategory(category.value)"
            >
              <icon-font
                  :type="category.icon"
                  :size="16"
                  :color="isCategoryActive(category.value) ? '#fff' : category.color"
              />
              <span>{{ category.label }}</span>
            </div>
          </div>
        </div>

        <!-- 标签筛选 -->
        <div class="filter-section tags-section">
          <div class="section-header">
            <div class="section-title">
              <icon-font type="icon-tag" :size="18" color="#f59e0b" />
              <span>文档标签</span>
            </div>
            <div class="section-actions">
              <n-button
                  quaternary
                  size="small"
                  @click="openTagsModal"
                  class="browse-all-btn"
              >
                <template #icon>
                  <icon-font type="icon-tag" :size="14" />
                </template>
                浏览全部标签
              </n-button>
            </div>
          </div>

          <div class="tags-container">
            <div
                v-for="tag in popularTags"
                :key="tag.value"
                class="tag-item"
                :class="{ 'active': isTagActive(tag.value) }"
                :style="getTagStyle(tag)"
                @click="toggleTag(tag.value)"
            >
              <span>{{ tag.label }}</span>
              <span v-if="isTagActive(tag.value)" class="check-icon">
                <icon-font type="icon-check" :size="12" color="#fff" />
              </span>
            </div>

            <div class="more-tags-button" @click="openTagsModal">
              <icon-font type="icon-more" :size="16" />
              <span>更多标签</span>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="filter-actions">
          <n-button
              class="clear-button"
              @click.stop="clearAllFilters"
              :disabled="activeFilterCount === 0"
          >
            <template #icon>
              <icon-font type="icon-reset" :size="16" />
            </template>
            清除筛选
          </n-button>

          <n-button
              type="primary"
              class="apply-button"
              @click.stop="applyFilters"
              :disabled="activeFilterCount === 0"
          >
            <template #icon>
              <icon-font type="icon-filter" :size="16" />
            </template>
            应用筛选
          </n-button>
        </div>
      </div>
    </n-collapse-transition>

    <!-- 标签浏览弹窗 -->
    <n-modal
        v-model:show="showTagsModal"
        preset="card"
        title="浏览标签"
        class="tags-modal"
        style="width: 680px; max-width: 90vw"
        :bordered="false"
        size="huge"
        :segmented="{
        content: true,
        footer: 'soft'
      }"
    >
      <template #header>
        <div class="modal-header">
          <div class="modal-title">
            <icon-font type="icon-tag" :size="20" color="#f59e0b" />
            <span>浏览全部标签</span>
          </div>
          <div class="modal-search">
            <n-input
                v-model:value="tagSearchValue"
                placeholder="搜索标签..."
                clearable
                round
            >
              <template #prefix>
                <icon-font type="icon-search" :size="16" />
              </template>
            </n-input>
          </div>
        </div>
      </template>

      <div class="modal-content">
        <div class="modal-category" v-for="(category, index) in tagCategories" :key="index">
          <div class="category-header">
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.tags.length }}个标签</span>
          </div>
          <div class="category-tags">
            <div
                v-for="tag in category.tags"
                :key="tag.value"
                class="modal-tag-item"
                :class="{ 'active': isTagActive(tag.value) }"
                :style="getTagStyleForModal(tag)"
                @click="toggleTag(tag.value)"
            >
              <span class="tag-name">{{ tag.label }}</span>
              <div class="tag-right">
                <span class="tag-badge" :style="{ backgroundColor: tag.color + '22', color: isTagActive(tag.value) ? '#fff' : tag.color }">
                  {{ tag.count || Math.floor(Math.random() * 50) + 1 }}
                </span>
                <span v-if="isTagActive(tag.value)" class="check-icon">
                  <icon-font type="icon-check" :size="12" color="#fff" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <div class="selected-count" v-if="filterState.tags.length > 0">
            已选择 <span>{{ filterState.tags.length }}</span> 个标签
          </div>
          <div class="footer-actions">
            <n-button @click="clearTags">清除选择</n-button>
            <n-button type="primary" @click="confirmTagSelection">确认选择</n-button>
          </div>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useThemeVars } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'

const emit = defineEmits(['filter'])
const themeVars = useThemeVars()

// 控制筛选面板的展开和折叠
const expanded = ref(false)

// 标签搜索和弹窗控制
const tagSearchValue = ref('')
const showTagsModal = ref(false)

// 过滤条件状态
const filterState = reactive({
  types: [],
  categories: [],
  tags: []
})

// 文档类型选项
const documentTypes = [
  {
    label: 'Markdown',
    value: 'markdown',
    icon: 'icon-markdown',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)'
  },
  {
    label: 'PDF文档',
    value: 'pdf',
    icon: 'icon-pdf',
    color: '#e11d48',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #be123c 100%)'
  },
  {
    label: 'Word文档',
    value: 'word',
    icon: 'icon-word',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)'
  },
  {
    label: 'Excel表格',
    value: 'excel',
    icon: 'icon-excel',
    color: '#16a34a',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #15803d 100%)'
  },
  {
    label: 'PPT演示',
    value: 'ppt',
    icon: 'icon-ppt',
    color: '#ea580c',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)'
  },
  {
    label: '纯文本',
    value: 'text',
    icon: 'icon-text',
    color: '#525252',
    gradient: 'linear-gradient(135deg, #737373 0%, #404040 100%)'
  },
  {
    label: '图片',
    value: 'image',
    icon: 'icon-image',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #0e7490 100%)'
  },
  {
    label: '音频',
    value: 'audio',
    icon: 'icon-audio',
    color: '#7e22ce',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)'
  },
  {
    label: '视频',
    value: 'video',
    icon: 'icon-video',
    color: '#db2777',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)'
  }
]

// 获取文档类型图标样式
const getTypeIconStyle = (type) => {
  if (isTypeActive(type.value)) {
    return {
      background: type.gradient,
      boxShadow: `0 4px 10px rgba(${hexToRgb(type.color)}, 0.4)`
    }
  }
  return {
    background: `rgba(${hexToRgb(type.color)}, 0.1)`,
    boxShadow: 'none'
  }
}

// 文档分类选项
const categories = [
  { label: '前端技术', value: '前端技术', icon: 'icon-html', color: '#3b82f6' },
  { label: '后端开发', value: '后端开发', icon: 'icon-server', color: '#10b981' },
  { label: '数据库', value: '数据库', icon: 'icon-database', color: '#f59e0b' },
  { label: '设计资源', value: '设计资源', icon: 'icon-design', color: '#8b5cf6' },
  { label: '运维部署', value: '运维部署', icon: 'icon-deploy', color: '#6366f1' },
  { label: '产品文档', value: '产品文档', icon: 'icon-product', color: '#ec4899' },
  { label: '会议记录', value: '会议记录', icon: 'icon-meeting', color: '#0ea5e9' },
  { label: '学习笔记', value: '学习笔记', icon: 'icon-note', color: '#14b8a6' }
]

// 获取分类样式
const getCategoryStyle = (category) => {
  if (isCategoryActive(category.value)) {
    return {
      backgroundColor: category.color,
      color: '#ffffff',
      borderColor: category.color,
      boxShadow: `0 2px 8px rgba(${hexToRgb(category.color)}, 0.4)`
    }
  }
  return {
    backgroundColor: `rgba(${hexToRgb(category.color)}, 0.08)`,
    color: category.color,
    borderColor: `rgba(${hexToRgb(category.color)}, 0.3)`
  }
}

// 热门标签选项
const popularTags = [
  { label: 'Vue3', value: 'Vue3', color: '#42b883', category: '前端框架' },
  { label: 'React', value: 'React', color: '#61dafb', category: '前端框架' },
  { label: 'TypeScript', value: 'TypeScript', color: '#3178c6', category: '开发语言' },
  { label: 'Java', value: 'Java', color: '#f89820', category: '开发语言' },
  { label: 'Spring Boot', value: 'Spring Boot', color: '#6db33f', category: '后端框架' },
  { label: 'MySQL', value: 'MySQL', color: '#4479a1', category: '数据库' },
  { label: 'Docker', value: 'Docker', color: '#2496ed', category: '运维工具' },
  { label: 'UI设计', value: 'UI设计', color: '#ff7c7c', category: '设计' }
]

// 全部标签数据
const allTags = [
  ...popularTags,
  { label: 'JavaScript', value: 'JavaScript', color: '#f7df1e', category: '开发语言' },
  { label: 'HTML/CSS', value: 'HTML/CSS', color: '#e34f26', category: '前端技术' },
  { label: 'Node.js', value: 'Node.js', color: '#339933', category: '开发语言' },
  { label: 'Python', value: 'Python', color: '#3776ab', category: '开发语言' },
  { label: 'Flutter', value: 'Flutter', color: '#02569b', category: '前端框架' },
  { label: 'Redis', value: 'Redis', color: '#dc382d', category: '数据库' },
  { label: 'MongoDB', value: 'MongoDB', color: '#47a248', category: '数据库' },
  { label: 'Git', value: 'Git', color: '#f05032', category: '开发工具' },
  { label: 'Kubernetes', value: 'Kubernetes', color: '#326ce5', category: '运维工具' },
  { label: 'CI/CD', value: 'CI/CD', color: '#fc6d26', category: '运维工具' },
  { label: '微服务', value: '微服务', color: '#1890ff', category: '架构' },
  { label: '架构设计', value: '架构设计', color: '#fa8c16', category: '架构' },
  { label: '用户体验', value: '用户体验', color: '#eb2f96', category: '设计' },
  { label: '敏捷开发', value: '敏捷开发', color: '#7cb305', category: '项目管理' },
  { label: '人工智能', value: '人工智能', color: '#722ed1', category: '技术领域' },
  { label: '大数据', value: '大数据', color: '#13c2c2', category: '技术领域' },
  { label: 'Svelte', value: 'Svelte', color: '#FF3E00', category: '前端框架' },
  { label: 'WebAssembly', value: 'WebAssembly', color: '#654FF0', category: '前端技术' },
  { label: 'GraphQL', value: 'GraphQL', color: '#E10098', category: '后端技术' },
  { label: 'Rust', value: 'Rust', color: '#000000', category: '开发语言' },
  { label: 'Go', value: 'Go', color: '#00ADD8', category: '开发语言' },
  { label: 'SwiftUI', value: 'SwiftUI', color: '#FA7343', category: '前端框架' },
  { label: '区块链', value: '区块链', color: '#F7931A', category: '技术领域' },
  { label: '低代码', value: '低代码', color: '#6200EA', category: '技术领域' },
  { label: 'NextJS', value: 'NextJS', color: '#000000', category: '前端框架' },
  { label: 'NuxtJS', value: 'NuxtJS', color: '#00C58E', category: '前端框架' },
  { label: 'Deno', value: 'Deno', color: '#000000', category: '开发环境' },
  { label: 'Vite', value: 'Vite', color: '#646CFF', category: '开发工具' },
  { label: 'Webpack', value: 'Webpack', color: '#8DD6F9', category: '开发工具' },
  { label: 'Electron', value: 'Electron', color: '#9FEAF9', category: '前端技术' },
  { label: 'AWS', value: 'AWS', color: '#FF9900', category: '云服务' },
  { label: 'Azure', value: 'Azure', color: '#0078D4', category: '云服务' },
  { label: 'Google Cloud', value: 'Google Cloud', color: '#4285F4', category: '云服务' },
]

// 按分类组织标签
const tagCategories = computed(() => {
  const categoriesMap = {}

  // 初始分类收集
  allTags.forEach(tag => {
    if (!categoriesMap[tag.category]) {
      categoriesMap[tag.category] = []
    }
    categoriesMap[tag.category].push(tag)
  })

  // 转换为数组格式
  const result = Object.keys(categoriesMap).map(category => ({
    name: category,
    tags: categoriesMap[category]
  }))

  // 如果有搜索值，则过滤结果
  if (tagSearchValue.value) {
    const lowercaseSearch = tagSearchValue.value.toLowerCase()
    return result
        .map(category => ({
          name: category.name,
          tags: category.tags.filter(tag =>
              tag.label.toLowerCase().includes(lowercaseSearch)
          )
        }))
        .filter(category => category.tags.length > 0)
  }

  return result
})

// 获取标签样式
const getTagStyle = (tag) => {
  if (isTagActive(tag.value)) {
    return {
      backgroundColor: tag.color,
      color: '#ffffff',
      borderColor: tag.color,
      boxShadow: `0 2px 6px rgba(${hexToRgb(tag.color)}, 0.3)`
    }
  }
  return {
    backgroundColor: `rgba(${hexToRgb(tag.color)}, 0.08)`,
    color: tag.color,
    borderColor: `rgba(${hexToRgb(tag.color)}, 0.3)`
  }
}

// 获取模态框中的标签样式 - 修改为与筛选区域一致的样式
const getTagStyleForModal = (tag) => {
  if (isTagActive(tag.value)) {
    return {
      backgroundColor: tag.color,
      color: '#ffffff',
      borderColor: tag.color,
      boxShadow: `0 2px 6px rgba(${hexToRgb(tag.color)}, 0.3)`
    }
  }
  return {
    backgroundColor: `rgba(${hexToRgb(tag.color)}, 0.08)`,
    color: tag.color,
    borderColor: `rgba(${hexToRgb(tag.color)}, 0.3)`
  }
}

// 辅助函数：将16进制颜色转为RGB
function hexToRgb(hex) {
  // 去掉可能存在的 # 符号
  hex = hex.replace(/^#/, '')

  // 处理简写形式（例如 #FFF）
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // 解析十六进制颜色值
  let bigint = parseInt(hex, 16)
  let r = (bigint >> 16) & 255
  let g = (bigint >> 8) & 255
  let b = bigint & 255

  return `${r}, ${g}, ${b}`
}

// 计算激活的过滤条件数量
const activeFilterCount = computed(() => {
  let count = 0
  count += filterState.types.length
  count += filterState.categories.length
  count += filterState.tags.length
  return count
})

// 判断类型是否激活
const isTypeActive = (type) => {
  return filterState.types.includes(type)
}

// 判断分类是否激活
const isCategoryActive = (category) => {
  return filterState.categories.includes(category)
}

// 判断标签是否激活
const isTagActive = (tag) => {
  return filterState.tags.includes(tag)
}

// 切换筛选面板展开/折叠
const toggleExpand = () => {
  expanded.value = !expanded.value
}

// 切换文档类型过滤
const toggleType = (type) => {
  const index = filterState.types.indexOf(type)
  if (index > -1) {
    filterState.types.splice(index, 1)
  } else {
    filterState.types.push(type)
  }
}

// 切换文档分类过滤
const toggleCategory = (category) => {
  const index = filterState.categories.indexOf(category)
  if (index > -1) {
    filterState.categories.splice(index, 1)
  } else {
    filterState.categories.push(category)
  }
}

// 切换标签过滤
const toggleTag = (tag) => {
  const index = filterState.tags.indexOf(tag)
  if (index > -1) {
    filterState.tags.splice(index, 1)
  } else {
    filterState.tags.push(tag)
  }
}

// 打开标签浏览弹窗
const openTagsModal = () => {
  showTagsModal.value = true
}

// 清除标签选择
const clearTags = () => {
  filterState.tags = []
}

// 确认标签选择并关闭弹窗
const confirmTagSelection = () => {
  showTagsModal.value = false
}

// 应用筛选条件
const applyFilters = () => {
  emit('filter', {
    types: [...filterState.types],
    categories: [...filterState.categories],
    tags: [...filterState.tags]
  })
}

// 清除所有筛选条件
const clearAllFilters = () => {
  filterState.types = []
  filterState.categories = []
  filterState.tags = []

  emit('filter', {
    types: [],
    categories: [],
    tags: []
  })
}
</script>

<style scoped>
.advanced-filter-container {
  margin-top: 16px;
  border-radius: 14px;
  overflow: hidden;
  background-color: var(--card-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.advanced-filter-container:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 筛选器头部 */
.filter-header {
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.filter-header:hover {
  background-color: rgba(99, 102, 241, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color-base);
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
}

.badge-container {
  margin-left: 6px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 10px;
  height: 20px;
  min-width: 20px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.badge-count {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.advanced-filter-container:has(.filter-body) .icon-container {
  background: linear-gradient(135deg, #818cf8 0%, #4f46e5 100%);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.toggle-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.toggle-btn.expanded {
  background-color: rgba(99, 102, 241, 0.1);
  transform: rotate(180deg);
}

/* 筛选区域主体 */
.filter-body {
  padding: 18px;
  border-top: 1px solid var(--border-color-light);
  background-color: rgba(249, 250, 251, 0.5);
}

/* 筛选部分共通样式 */
.filter-section {
  margin-bottom: 22px;
  padding: 18px;
  background-color: var(--card-color);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.filter-section:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--text-color-base);
}

.section-actions {
  display: flex;
  align-items: center;
}

.browse-all-btn {
  font-size: 13px;
  padding: 2px 10px;
  transition: all 0.3s ease;
}

.browse-all-btn:hover {
  background-color: rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

/* 文档类型部分 */
.doc-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
}

.doc-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid transparent;
}

.doc-type-item:hover {
  background-color: rgba(249, 250, 251, 0.9);
  transform: translateY(-2px);
}

.doc-type-item.active {
  background-color: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.2);
}

.type-icon-wrapper {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.doc-type-item.active .type-icon-wrapper {
  transform: scale(1.05);
}

.type-name {
  font-size: 13px;
  text-align: center;
  color: var(--text-color-base);
  transition: all 0.3s ease;
}

.doc-type-item.active .type-name {
  font-weight: 500;
}

/* 文档分类部分 */
.categories-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.category-item:hover {
  transform: translateY(-2px);
}

/* 标签部分 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  position: relative;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

.more-tags-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(to right, rgba(107, 114, 128, 0.06), rgba(107, 114, 128, 0.1));
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(107, 114, 128, 0.15);
}

.more-tags-button:hover {
  background: linear-gradient(to right, rgba(107, 114, 128, 0.08), rgba(107, 114, 128, 0.15));
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 底部按钮区域 */
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.clear-button,
.apply-button {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 8px;
  font-weight: 500;
}

.clear-button:not(:disabled):hover,
.apply-button:not(:disabled):hover {
  transform: translateY(-2px);
}

.apply-button {
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
}

.apply-button:not(:disabled):hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
}

/* 标签弹窗样式 */
.tags-modal {
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.modal-search {
  width: 240px;
}

.modal-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 6px;
}

.modal-category {
  margin-bottom: 18px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 4px;
}

.category-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.category-count {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.category-tags {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

/* 修改弹窗中的标签样式，使其与筛选区域标签样式一致 */
.modal-tag-item {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-tag-item:hover {
  transform: translateY(-2px);
}

.tag-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-name {
  font-weight: 500;
}

.tag-badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.selected-count span {
  font-weight: 600;
  color: var(--primary-color);
}

.footer-actions {
  display: flex;
  gap: 12px;
}
</style>