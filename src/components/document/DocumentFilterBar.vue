<template>
  <div class="filter-container">
    <div class="filter-panel">
      <!-- 筛选面板标题与主要操作 -->
      <div class="panel-header">
        <div class="header-left" @click="toggleAllFilters">
          <div class="header-icon">
            <icon-font type="icon-shaixuan" :size="20" />
          </div>
          <div class="header-content">
            <h2 class="header-title">智能筛选</h2>
            <div class="header-subtitle">根据需求精确查找文档</div>
          </div>
          <div v-if="activeFilterCount > 0" class="filter-count">{{ activeFilterCount }}</div>
        </div>

        <div class="header-actions">
          <div
              class="action-button reset-button"
              :class="{ 'disabled': !hasActiveFilters }"
              @click="resetFilters"
          >
            <icon-font type="icon-zhongzhi" :size="18" />
            <span>重置</span>
          </div>

          <div
              class="action-button save-button"
              :class="{ 'disabled': !hasActiveFilters }"
              @click="saveFilterPreset"
          >
            <icon-font type="icon-baocun" :size="18" />
            <span>保存</span>
          </div>

          <n-dropdown
              trigger="click"
              :options="presetDropdownOptions"
              @select="handlePresetSelect"
          >
            <div class="action-button preset-button">
              <icon-font type="icon-moban" :size="18" />
              <span>预设</span>
            </div>
          </n-dropdown>
        </div>
      </div>

      <!-- 活跃筛选条件展示区 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <div class="section-header">
          <div class="section-icon">
            <icon-font type="icon-biaoqian" :size="16" />
          </div>
          <div class="section-title">已选条件</div>
          <div class="clear-all" @click="resetFilters">清除全部</div>
        </div>

        <div class="filter-chips">
          <div
              v-for="cat in getCategoryNames"
              :key="`cat-${cat.value}`"
              class="filter-chip category-chip"
              :style="{ backgroundColor: getCategoryColorBg(cat.value), color: getCategoryColor(cat.value) }"
          >
            <div class="chip-content">
              <div class="chip-icon">
                <icon-font type="icon-fenlei" :size="14" />
              </div>
              <div class="chip-text">{{ cat.label }}</div>
            </div>
            <div
                class="chip-remove"
                @click.stop="removeCategory(cat.value)"
                :style="{ color: getCategoryColor(cat.value) }"
            >
              <icon-font type="icon-close" :size="14" />
            </div>
          </div>

          <div
              v-for="tag in getTagNames"
              :key="`tag-${tag}`"
              class="filter-chip tag-chip"
          >
            <div class="chip-content">
              <div class="chip-icon">
                <icon-font type="icon-biaoqian" :size="14" />
              </div>
              <div class="chip-text">{{ tag }}</div>
            </div>
            <div
                class="chip-remove"
                @click.stop="removeTag(tag)"
            >
              <icon-font type="icon-close" :size="14" />
            </div>
          </div>

          <div
              v-for="type in getTypeNames"
              :key="`type-${type.value}`"
              class="filter-chip type-chip"
              :style="{ backgroundColor: getTypeColorBg(type.value), color: getTypeColor(type.value) }"
          >
            <div class="chip-content">
              <div class="chip-icon">
                <icon-font :type="getTypeIcon(type.value)" :size="14" />
              </div>
              <div class="chip-text">{{ type.label }}</div>
            </div>
            <div
                class="chip-remove"
                @click.stop="removeType(type.value)"
                :style="{ color: getTypeColor(type.value) }"
            >
              <icon-font type="icon-close" :size="14" />
            </div>
          </div>

          <div
              v-for="platform in getPlatformNames"
              :key="`platform-${platform.value}`"
              class="filter-chip platform-chip"
              :style="{ backgroundColor: getPlatformColorBg(platform.value), color: getPlatformColor(platform.value) }"
          >
            <div class="chip-content">
              <div class="chip-icon">
                <icon-font :type="getPlatformIcon(platform.value)" :size="14" />
              </div>
              <div class="chip-text">{{ platform.label }}</div>
            </div>
            <div
                class="chip-remove"
                @click.stop="removePlatform(platform.value)"
                :style="{ color: getPlatformColor(platform.value) }"
            >
              <icon-font type="icon-close" :size="14" />
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选条件区域 -->
      <div class="filter-body">
        <!-- 分类筛选 -->
        <div class="filter-section" :class="{ 'expanded': expandCategory }">
          <div class="section-header" @click="expandCategory = !expandCategory">
            <div class="section-icon category-icon">
              <icon-font type="icon-fenlei" :size="16" />
            </div>
            <div class="section-title">分类</div>
            <div v-if="categories.length > 0" class="section-badge">{{ categories.length }}</div>
            <div class="section-toggle">
              <icon-font
                  :type="expandCategory ? 'icon-arrow-up' : 'icon-arrow-down'"
                  :size="14"
              />
            </div>
          </div>

          <div v-show="expandCategory" class="section-content">
            <div class="categories-grid">
              <div
                  v-for="category in categoryOptions"
                  :key="category.value"
                  class="category-item"
                  :class="{ 'selected': isSelected(categories, category.value) }"
                  @click="toggleCategory(category.value)"
                  :style="isSelected(categories, category.value) ?
                  {
                    backgroundColor: getCategoryColorBg(category.value),
                    color: getCategoryColor(category.value),
                    borderColor: getCategoryColor(category.value)
                  } : {}"
              >
                <div
                    class="category-dot"
                    :style="{ backgroundColor: getCategoryColor(category.value) }"
                ></div>
                <div class="category-name">{{ category.label }}</div>
                <div
                    v-if="isSelected(categories, category.value)"
                    class="category-check"
                >
                  <icon-font type="icon-check" :size="14" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 标签筛选 -->
        <div class="filter-section" :class="{ 'expanded': expandTag }">
          <div class="section-header" @click="expandTag = !expandTag">
            <div class="section-icon tag-icon">
              <icon-font type="icon-biaoqian" :size="16" />
            </div>
            <div class="section-title">标签</div>
            <div v-if="tags.length > 0" class="section-badge">{{ tags.length }}</div>
            <div class="section-toggle">
              <icon-font
                  :type="expandTag ? 'icon-arrow-up' : 'icon-arrow-down'"
                  :size="14"
              />
            </div>
          </div>

          <div v-show="expandTag" class="section-content">
            <div class="tags-cloud">
              <div
                  v-for="tag in tagOptions"
                  :key="tag"
                  class="tag-item"
                  :class="{ 'selected': isSelected(tags, tag) }"
                  @click="toggleTag(tag)"
              >
                <span class="tag-name">{{ tag }}</span>
                <div v-if="isSelected(tags, tag)" class="tag-check">
                  <icon-font type="icon-check" :size="12" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文档类型筛选 -->
        <div class="filter-section" :class="{ 'expanded': expandType }">
          <div class="section-header" @click="expandType = !expandType">
            <div class="section-icon type-icon">
              <icon-font type="icon-wenjianleixing" :size="16" />
            </div>
            <div class="section-title">文档类型</div>
            <div v-if="types.length > 0" class="section-badge">{{ types.length }}</div>
            <div class="section-toggle">
              <icon-font
                  :type="expandType ? 'icon-arrow-up' : 'icon-arrow-down'"
                  :size="14"
              />
            </div>
          </div>

          <div v-show="expandType" class="section-content">
            <div class="types-grid">
              <div
                  v-for="type in typeOptions"
                  :key="type.value"
                  class="type-item"
                  :class="{ 'selected': isSelected(types, type.value) }"
                  @click="toggleType(type.value)"
              >
                <div
                    class="type-icon-wrapper"
                    :style="isSelected(types, type.value) ?
                    { backgroundColor: getTypeColor(type.value) } :
                    { backgroundColor: getTypeColorBg(type.value) }"
                >
                  <icon-font
                      :type="getTypeIcon(type.value)"
                      :size="22"
                      :color="isSelected(types, type.value) ? '#fff' : getTypeColor(type.value)"
                  />
                </div>
                <div class="type-name">{{ type.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 平台来源筛选 -->
        <div class="filter-section" :class="{ 'expanded': expandPlatform }">
          <div class="section-header" @click="expandPlatform = !expandPlatform">
            <div class="section-icon platform-icon">
              <icon-font type="icon-pingtai" :size="16" />
            </div>
            <div class="section-title">平台来源</div>
            <div v-if="platforms.length > 0" class="section-badge">{{ platforms.length }}</div>
            <div class="section-toggle">
              <icon-font
                  :type="expandPlatform ? 'icon-arrow-up' : 'icon-arrow-down'"
                  :size="14"
              />
            </div>
          </div>

          <div v-show="expandPlatform" class="section-content">
            <div class="platforms-grid">
              <div
                  v-for="platform in platformOptions"
                  :key="platform.value"
                  class="platform-item"
                  :class="{ 'selected': isSelected(platforms, platform.value) }"
                  @click="togglePlatform(platform.value)"
              >
                <div
                    class="platform-icon-wrapper"
                    :style="{
                    borderColor: isSelected(platforms, platform.value) ?
                      getPlatformColor(platform.value) : 'transparent',
                    backgroundColor: isSelected(platforms, platform.value) ?
                      getPlatformColorBg(platform.value) : '#f5f7fa'
                  }"
                >
                  <icon-font
                      :type="getPlatformIcon(platform.value)"
                      :size="24"
                      :color="getPlatformColor(platform.value)"
                  />
                  <div v-if="isSelected(platforms, platform.value)" class="platform-check">
                    <icon-font type="icon-check" :size="14" color="#fff" />
                  </div>
                </div>
                <div class="platform-info">
                  <div class="platform-name">{{ platform.label }}</div>
                  <div class="platform-count">{{ platform.count }}篇</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="filter-footer">
        <div
            class="footer-button cancel-button"
            :class="{ 'disabled': !hasActiveFilters }"
            @click="resetFilters"
        >
          重置筛选
        </div>
        <div
            class="footer-button apply-button"
            :class="{ 'disabled': !hasActiveFilters }"
            @click="applyFilters"
        >
          应用筛选
        </div>
      </div>
    </div>

    <!-- 保存筛选预设对话框 -->
    <n-modal
        v-model:show="showSaveModal"
        preset="card"
        title="保存筛选条件"
        class="preset-modal"
        :style="{ width: '400px' }"
    >
      <div class="preset-form">
        <div class="preset-form-header">
          <div class="preset-form-icon">
            <icon-font type="icon-baocun" :size="20" />
          </div>
          <div class="preset-form-title">将当前筛选条件保存为预设</div>
        </div>

        <div class="preset-form-body">
          <div class="preset-form-field">
            <div class="field-label">筛选条件名称</div>
            <n-input
                v-model:value="newPresetName"
                placeholder="输入易于识别的名称..."
                class="preset-name-input"
            />
          </div>

          <div class="preset-summary">
            <div class="summary-header">筛选条件预览</div>
            <div class="summary-content">
              <div v-if="categories.length > 0" class="summary-item">
                <div class="summary-label">分类：</div>
                <div class="summary-value">{{ getCategoryLabels }}</div>
              </div>
              <div v-if="tags.length > 0" class="summary-item">
                <div class="summary-label">标签：</div>
                <div class="summary-value">{{ tags.join(', ') }}</div>
              </div>
              <div v-if="types.length > 0" class="summary-item">
                <div class="summary-label">文档类型：</div>
                <div class="summary-value">{{ getTypeLabels }}</div>
              </div>
              <div v-if="platforms.length > 0" class="summary-item">
                <div class="summary-label">平台来源：</div>
                <div class="summary-value">{{ getPlatformLabels }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="preset-form-footer">
          <n-button @click="showSaveModal = false" class="cancel-preset-btn">取消</n-button>
          <n-button
              type="primary"
              @click="confirmSavePreset"
              :disabled="!newPresetName || !hasActiveFilters"
              class="save-preset-btn"
          >
            保存
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 预设列表对话框 -->
    <n-modal
        v-model:show="showPresetModal"
        preset="card"
        title="常用筛选条件"
        class="preset-list-modal"
        :style="{ width: '450px' }"
    >
      <div class="preset-list-content">
        <div v-if="filterPresets.length === 0" class="empty-presets">
          <div class="empty-icon">
            <icon-font type="icon-empty" :size="60" />
          </div>
          <div class="empty-text">暂无保存的筛选条件</div>
          <div class="empty-action">
            <n-button @click="showPresetModal = false">关闭</n-button>
          </div>
        </div>

        <div v-else class="preset-list">
          <div
              v-for="(preset, index) in filterPresets"
              :key="`preset-${index}`"
              class="preset-list-item"
          >
            <div
                class="preset-item-content"
                @click="applyFilterPreset(preset)"
            >
              <div class="preset-item-icon">
                <icon-font type="icon-moban" :size="20" />
              </div>
              <div class="preset-item-info">
                <div class="preset-item-name">{{ preset.name }}</div>
                <div class="preset-item-desc">{{ getPresetDescription(preset) }}</div>
              </div>
            </div>
            <div
                class="preset-item-delete"
                @click="removeFilterPreset(index)"
                title="删除预设"
            >
              <icon-font type="icon-shanchu" :size="16" />
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import IconFont from "@/components/common/IconFont.vue";

const message = useMessage()

// Props from parent
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  },
  types: {
    type: Array,
    default: () => []
  },
  platforms: {
    type: Array,
    default: () => []
  }
})

// Events to emit
const emit = defineEmits([
  'update:categories',
  'update:tags',
  'update:types',
  'update:platforms',
  'filter'
])

// 本地状态
const categories = ref([...props.categories])
const tags = ref([...props.tags])
const types = ref([...props.types])
const platforms = ref([...props.platforms])

// UI 状态
const expandCategory = ref(true)
const expandTag = ref(true)
const expandType = ref(true)
const expandPlatform = ref(true)
const showSaveModal = ref(false)
const showPresetModal = ref(false)
const newPresetName = ref('')

// 筛选预设
const filterPresets = ref([
  {
    name: '前端技术文档',
    categories: ['Vue', 'React', 'JavaScript', 'CSS'],
    tags: ['前端', '组件'],
    types: ['markdown', 'pdf'],
    platforms: []
  },
  {
    name: '我的重要文档',
    categories: [],
    tags: ['重要', '项目'],
    types: [],
    platforms: ['github', 'juejin']
  }
])

// 预设下拉菜单选项
const presetDropdownOptions = computed(() => [
  {
    label: '常用筛选条件',
    key: 'view-presets',
    type: 'group',
    children: [
      ...filterPresets.value.slice(0, 3).map((preset, index) => ({
        label: preset.name,
        key: `preset-${index}`,
      })),
    ]
  },
  {
    type: 'divider',
    key: 'd-1'
  },
  {
    label: '查看全部筛选条件',
    key: 'view-all-presets',
  },
  {
    label: '保存当前筛选条件',
    key: 'save-preset',
    disabled: !hasActiveFilters.value
  }
])

// 筛选选项数据
const categoryOptions = [
  {label: 'Vue', value: 'Vue'},
  {label: 'React', value: 'React'},
  {label: 'Angular', value: 'Angular'},
  {label: 'JavaScript', value: 'JavaScript'},
  {label: 'TypeScript', value: 'TypeScript'},
  {label: 'Node.js', value: 'Node.js'},
  {label: 'CSS', value: 'CSS'},
  {label: 'HTML', value: 'HTML'},
  {label: '后端开发', value: 'Backend'},
  {label: '数据库', value: 'Database'},
  {label: '工具', value: 'Tools'},
  {label: '算法', value: 'Algorithm'}
]

const tagOptions = [
  '前端', '后端', '全栈', '组件', '框架', '库', '性能优化',
  '源码解析', '学习笔记', '项目文档', '面试', '重要'
]

const typeOptions = [
  {label: 'Markdown', value: 'markdown'},
  {label: 'PDF文档', value: 'pdf'},
  {label: 'Word文档', value: 'word'},
  {label: 'Excel表格', value: 'excel'},
  {label: 'HTML网页', value: 'html'},
  {label: '代码文件', value: 'code'}
]

// 更新平台选项数据和图标
const platformOptions = [
  {label: 'GitHub', value: 'github', icon: 'icon-github', count: 28},
  {label: '掘金', value: 'juejin', icon: 'icon-juejin', count: 36},
  {label: 'CSDN', value: 'csdn', icon: 'icon-csdn', count: 19},
  {label: '知乎', value: 'zhihu', icon: 'icon-zhihu', count: 12},
  {label: '微信公众号', value: 'wechat', icon: 'icon-wechat', count: 8},
  {label: '本地文档', value: 'local', icon: 'icon-bendiwenjian', count: 24}
]

// 计算属性
const hasActiveFilters = computed(() => {
  return categories.value.length > 0 ||
      tags.value.length > 0 ||
      types.value.length > 0 ||
      platforms.value.length > 0
})

const activeFilterCount = computed(() => {
  return categories.value.length +
      tags.value.length +
      types.value.length +
      platforms.value.length
})

// 获取各筛选条件的显示名称
const getCategoryNames = computed(() => {
  return categoryOptions.filter(cat => categories.value.includes(cat.value))
})

const getTagNames = computed(() => {
  return tags.value
})

const getTypeNames = computed(() => {
  return typeOptions.filter(type => types.value.includes(type.value))
})

const getPlatformNames = computed(() => {
  return platformOptions.filter(platform => platforms.value.includes(platform.value))
})

// 获取各筛选条件的标签文本
const getCategoryLabels = computed(() => {
  return getCategoryNames.value.map(item => item.label).join(', ')
})

const getTypeLabels = computed(() => {
  return getTypeNames.value.map(item => item.label).join(', ')
})

const getPlatformLabels = computed(() => {
  return getPlatformNames.value.map(item => item.label).join(', ')
})

// 分类颜色
const getCategoryColor = (category) => {
  const colorMap = {
    Vue: '#42b883',
    React: '#61dafb',
    Angular: '#dd0031',
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    'Node.js': '#689f63',
    CSS: '#264de4',
    HTML: '#e34c26',
    Backend: '#6c757d',
    Database: '#e10098',
    Tools: '#ff9800',
    Algorithm: '#9c27b0'
  }
  return colorMap[category] || '#6366f1'
}

const getCategoryColorBg = (category) => {
  const color = getCategoryColor(category)
  return `${color}15` // 10% opacity
}

// 文档类型颜色和图标
const getTypeColor = (type) => {
  const colorMap = {
    markdown: '#5074E6',
    pdf: '#EB5757',
    word: '#2196F3',
    excel: '#4CAF50',
    html: '#FF9800',
    code: '#9C27B0'
  }
  return colorMap[type] || '#6c757d'
}

const getTypeColorBg = (type) => {
  const color = getTypeColor(type)
  return `${color}15` // 10% opacity
}

const getTypeIcon = (type) => {
  const iconMap = {
    markdown: 'icon-markdown',
    pdf: 'icon-pdf',
    word: 'icon-word',
    excel: 'icon-excel',
    html: 'icon-html',
    code: 'icon-code'
  }
  return iconMap[type] || 'icon-wendang1'
}

// 平台颜色和图标
const getPlatformColor = (platform) => {
  const colorMap = {
    github: '#24292e',
    juejin: '#1e80ff',
    csdn: '#fc5531',
    zhihu: '#0084ff',
    wechat: '#09bb07',
    local: '#6c757d'
  }
  return colorMap[platform] || '#6c757d'
}

const getPlatformColorBg = (platform) => {
  const color = getPlatformColor(platform)
  return `${color}15` // 10% opacity
}

const getPlatformIcon = (platform) => {
  const iconMap = {
    github: 'icon-github',
    juejin: 'icon-juejin',
    csdn: 'icon-csdn',
    zhihu: 'icon-zhihu',
    wechat: 'icon-wechat',
    local: 'icon-bendiwenjian'
  }
  return iconMap[platform] || 'icon-pingtai'
}

// 同步父组件的值变更
watch(() => props.categories, (newVal) => {
  categories.value = [...newVal]
})

watch(() => props.tags, (newVal) => {
  tags.value = [...newVal]
})

watch(() => props.types, (newVal) => {
  types.value = [...newVal]
})

watch(() => props.platforms, (newVal) => {
  platforms.value = [...newVal]
})

// 工具方法：检查值是否被选中
const isSelected = (array, value) => {
  return array.includes(value)
}

// 切换所有筛选选项的展开状态
const toggleAllFilters = () => {
  const newState = !expandCategory.value
  expandCategory.value = newState
  expandTag.value = newState
  expandType.value = newState
  expandPlatform.value = newState
}

// 添加/移除筛选条件
const toggleCategory = (value) => {
  const index = categories.value.indexOf(value)
  if (index === -1) {
    categories.value.push(value)
  } else {
    categories.value.splice(index, 1)
  }
}

const toggleTag = (value) => {
  const index = tags.value.indexOf(value)
  if (index === -1) {
    tags.value.push(value)
  } else {
    tags.value.splice(index, 1)
  }
}

const toggleType = (value) => {
  const index = types.value.indexOf(value)
  if (index === -1) {
    types.value.push(value)
  } else {
    types.value.splice(index, 1)
  }
}

const togglePlatform = (value) => {
  const index = platforms.value.indexOf(value)
  if (index === -1) {
    platforms.value.push(value)
  } else {
    platforms.value.splice(index, 1)
  }
}

// 从标签中移除筛选条件
const removeCategory = (value) => {
  const index = categories.value.indexOf(value)
  if (index !== -1) {
    categories.value.splice(index, 1)
  }
}

const removeTag = (value) => {
  const index = tags.value.indexOf(value)
  if (index !== -1) {
    tags.value.splice(index, 1)
  }
}

const removeType = (value) => {
  const index = types.value.indexOf(value)
  if (index !== -1) {
    types.value.splice(index, 1)
  }
}

const removePlatform = (value) => {
  const index = platforms.value.indexOf(value)
  if (index !== -1) {
    platforms.value.splice(index, 1)
  }
}

// 重置所有筛选条件
const resetFilters = () => {
  if (!hasActiveFilters.value) return

  categories.value = []
  tags.value = []
  types.value = []
  platforms.value = []

  message.success('已重置全部筛选条件')
}

// 应用筛选条件
const applyFilters = () => {
  if (!hasActiveFilters.value) return

  emitChanges()
  message.success('已应用筛选条件')
}

// 处理预设选择
const handlePresetSelect = (key) => {
  if (key === 'view-all-presets') {
    showPresetModal.value = true
  } else if (key === 'save-preset') {
    saveFilterPreset()
  } else if (key.startsWith('preset-')) {
    const index = parseInt(key.split('-')[1])
    applyFilterPreset(filterPresets.value[index])
  }
}

// 保存筛选预设
const saveFilterPreset = () => {
  if (!hasActiveFilters.value) {
    message.warning('请先设置筛选条件')
    return
  }

  showSaveModal.value = true
}

// 确认保存筛选预设
const confirmSavePreset = () => {
  if (!newPresetName.value.trim()) {
    message.warning('请输入筛选条件名称')
    return
  }

  filterPresets.value.push({
    name: newPresetName.value,
    categories: [...categories.value],
    tags: [...tags.value],
    types: [...types.value],
    platforms: [...platforms.value]
  })

  message.success(`已保存筛选条件: ${newPresetName.value}`)
  newPresetName.value = ''
  showSaveModal.value = false
}

// 应用筛选预设
const applyFilterPreset = (preset) => {
  categories.value = [...preset.categories]
  tags.value = [...preset.tags]
  types.value = [...preset.types]
  platforms.value = [...preset.platforms]

  showPresetModal.value = false
  message.success(`已应用筛选条件: ${preset.name}`)
  emitChanges()
}

// 移除筛选预设
const removeFilterPreset = (index) => {
  const presetName = filterPresets.value[index].name
  filterPresets.value.splice(index, 1)
  message.success(`已删除筛选条件: ${presetName}`)
}

// 获取预设描述
const getPresetDescription = (preset) => {
  const parts = []

  if (preset.categories.length > 0) {
    parts.push(`${preset.categories.length}个分类`)
  }

  if (preset.tags.length > 0) {
    parts.push(`${preset.tags.length}个标签`)
  }

  if (preset.types.length > 0) {
    parts.push(`${preset.types.length}种类型`)
  }

  if (preset.platforms.length > 0) {
    parts.push(`${preset.platforms.length}个平台`)
  }

  return parts.join('、') || '无筛选条件'
}

// 向父组件发送更新
const emitChanges = () => {
  emit('update:categories', [...categories.value])
  emit('update:tags', [...tags.value])
  emit('update:types', [...types.value])
  emit('update:platforms', [...platforms.value])
  emit('filter')
}
</script>

<style scoped>
.filter-container {
  width: 100%;
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
}

.filter-panel {
  background-color: var(--card-color, white);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* 面板标题样式 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(to right, #f8faff, #f0f5ff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.header-left:hover {
  transform: translateX(4px);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4263eb, #5e81ff);
  color: white;
  box-shadow: 0 4px 12px rgba(66, 99, 235, 0.2);
}

.header-content {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #333);
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 14px;
  color: var(--text-color-secondary, #666);
}

.filter-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: #4263eb;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 0 8px;
  box-shadow: 0 2px 6px rgba(66, 99, 235, 0.3);
  margin-left: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.action-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button {
  color: #6c757d;
}

.save-button {
  color: #10b981;
}

.preset-button {
  color: #4263eb;
}

/* 活跃筛选区域 */
.active-filters {
  padding: 16px 24px;
  background-color: #f8faff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  margin-right: 10px;
  color: white;
  background-color: #4263eb;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color, #333);
  flex: 1;
}

.section-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #4263eb;
  color: white;
  font-size: 12px;
  font-weight: 500;
  margin-right: 10px;
  padding: 0 6px;
}

.section-toggle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-color-secondary, #666);
}

.clear-all {
  font-size: 14px;
  color: #f43f5e;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clear-all:hover {
  opacity: 0.8;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  display: flex;
  align-items: center;
  padding: 4px 6px 4px 12px;
  border-radius: 100px;
  background-color: rgba(66, 99, 235, 0.08);
  color: #4263eb;
  transition: all 0.2s ease;
  cursor: default;
}

.filter-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.chip-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-text {
  font-size: 13px;
  font-weight: 500;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-left: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chip-remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.tag-chip {
  background-color: rgba(16, 185, 129, 0.08);
  color: #10b981;
}

/* 筛选条件区域 */
.filter-body {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-section {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.filter-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-section .section-header {
  padding: 14px 16px;
  cursor: pointer;
  margin-bottom: 0;
  background-color: #fafbfc;
}

.filter-section.expanded .section-toggle {
  transform: rotate(180deg);
}

.category-icon {
  background-color: #4263eb;
}

.tag-icon {
  background-color: #10b981;
}

.type-icon {
  background-color: #f59e0b;
}

.platform-icon {
  background-color: #3b82f6;
}

.section-content {
  padding: 16px 16px 20px;
}

/* 分类筛选样式 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.category-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-check {
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: currentColor;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}

/* 标签筛选样式 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: #f8faff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tag-item:hover {
  transform: translateY(-2px);
  background-color: #f0f5ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tag-item.selected {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  color: #10b981;
  font-weight: 500;
}

.tag-name {
  font-size: 14px;
}

.tag-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #10b981;
  color: white;
  margin-left: 8px;
}

/* 文档类型筛选样式 */
.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 8px;
  border-radius: 10px;
  background-color: white;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.type-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.type-item.selected {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.type-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #333);
  text-align: center;
}

/* 平台来源筛选样式 */
.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background-color: white;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.platform-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.platform-icon-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.platform-check {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4263eb;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.platform-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  width: 100%;
}

.platform-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.platform-count {
  font-size: 12px;
  color: var(--text-color-secondary, #666);
}

/* 底部操作栏 */
.filter-footer {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 16px;
  background-color: #fafbfc;
}

.footer-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.footer-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.cancel-button:hover:not(.disabled) {
  background-color: #e5e7eb;
}

.apply-button {
  background-color: #4263eb;
  color: white;
  box-shadow: 0 4px 12px rgba(66, 99, 235, 0.3);
}

.apply-button:hover:not(.disabled) {
  background-color: #3151d1;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(66, 99, 235, 0.4);
}

/* 保存预设对话框样式 */
.preset-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preset-form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.preset-form-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: rgba(66, 99, 235, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4263eb;
}

.preset-form-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.preset-form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preset-form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.preset-name-input {
  width: 100%;
}

.preset-summary {
  background-color: #f8faff;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid rgba(66, 99, 235, 0.1);
}

.summary-header {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #333);
  margin-bottom: 12px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: flex-start;
}

.summary-label {
  font-weight: 500;
  min-width: 80px;
  font-size: 14px;
  color: var(--text-color-secondary, #666);
}

.summary-value {
  flex: 1;
  font-size: 14px;
  color: var(--text-color, #333);
  word-break: break-word;
}

.preset-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.cancel-preset-btn,
.save-preset-btn {
  min-width: 80px;
}

/* 预设列表对话框样式 */
.preset-list-content {
  min-height: 200px;
}

.empty-presets {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 20px;
  padding: 30px 0;
}

.empty-icon {
  color: #d1d5db;
}

.empty-text {
  font-size: 16px;
  color: #6b7280;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.preset-list-item:hover {
  background-color: #f3f4f6;
}

.preset-item-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  cursor: pointer;
}

.preset-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: rgba(66, 99, 235, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4263eb;
}

.preset-item-info {
  flex: 1;
}

.preset-item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color, #333);
  margin-bottom: 4px;
}

.preset-item-desc {
  font-size: 13px;
  color: var(--text-color-secondary, #666);
}

.preset-item-delete {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-item-delete:hover {
  background-color: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .filter-footer {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .categories-grid,
  .types-grid,
  .platforms-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .filter-footer {
    flex-direction: column;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .filter-panel {
    background-color: var(--card-color-dark, #1f2937);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .panel-header {
    background: linear-gradient(to right, #111827, #1f2937);
  }

  .header-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .header-subtitle {
    color: rgba(255, 255, 255, 0.6);
  }

  .action-button {
    background-color: #374151;
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .active-filters {
    background-color: #111827;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .filter-body {
    background-color: #111827;
  }

  .filter-section {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #1f2937;
  }

  .filter-section .section-header {
    background-color: #111827;
  }

  .category-item,
  .tag-item,
  .type-item,
  .platform-item {
    background-color: #374151;
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .category-name,
  .tag-name,
  .type-name,
  .platform-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .platform-count {
    color: rgba(255, 255, 255, 0.6);
  }

  .platform-icon-wrapper {
    background-color: #2d3748;
  }

  .filter-footer {
    background-color: #111827;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .cancel-button {
    background-color: #374151;
    color: rgba(255, 255, 255, 0.9);
  }

  .cancel-button:hover:not(.disabled) {
    background-color: #4b5563;
  }

  .preset-summary {
    background-color: #111827;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .summary-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .summary-value {
    color: rgba(255, 255, 255, 0.9);
  }

  .preset-list-item {
    background-color: #2d3748;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .preset-list-item:hover {
    background-color: #374151;
  }

  .preset-item-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .preset-item-desc {
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>