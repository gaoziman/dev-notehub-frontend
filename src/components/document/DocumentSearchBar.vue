<template>
  <div class="search-container">
    <div class="search-main">
      <div class="search-input-wrapper">
        <input
            v-model="keyword"
            type="text"
            class="search-input"
            placeholder="搜索文档标题、内容、标签或分类..."
            @keyup.enter="handleSearch"
            @focus="showSearchHistory = true"
            ref="searchInput"
        />
        <div class="search-icon">
          <icon-font type="icon-sousuo" :size="20" />
        </div>
        <div v-if="keyword" class="clear-icon" @click="clearSearch">
          <icon-font type="icon-guanbi" :size="16" />
        </div>
      </div>

      <div class="search-date-picker">
        <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            clearable
            style="width: 240px"
        >
          <template #icon>
            <icon-font type="icon-shijian" :size="16" />
          </template>
        </n-date-picker>
      </div>

      <n-button type="primary" class="search-button" @click="handleSearch">
        <template #icon>
          <icon-font type="icon-sousuo" />
        </template>
        搜索
      </n-button>

      <n-button class="advanced-button" @click="toggleAdvanced">
        {{ showAdvanced ? '收起' : '高级' }}
        <icon-font
            :type="showAdvanced ? 'icon-shangla' : 'icon-xiala'"
            :size="14"
            style="margin-left: 4px"
        />
      </n-button>
    </div>

    <!-- 搜索历史下拉 -->
    <div class="search-dropdown" v-if="showSearchHistory && searchHistory.length > 0 && keyword.length < 2">
      <div class="dropdown-header">
        <span>搜索历史</span>
        <n-button text size="tiny" @click.stop="clearHistory">清除历史</n-button>
      </div>
      <div class="dropdown-body">
        <div
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-item"
            @click="applySearchTerm(item)"
        >
          <icon-font type="icon-lishi" :size="16" />
          <span>{{ item }}</span>
          <div class="use-item" @click.stop="applySearchTerm(item)">
            <icon-font type="icon-sousuo" :size="14" />
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索建议下拉 -->
    <div class="search-dropdown" v-if="keyword.length >= 2 && showSearchHistory && filteredSuggestions.length > 0">
      <div class="dropdown-header">
        <span>搜索建议</span>
      </div>
      <div class="dropdown-body">
        <div
            v-for="(item, index) in filteredSuggestions"
            :key="index"
            class="suggestion-item"
            @click="applySearchTerm(item.text)"
        >
          <icon-font :type="item.icon" :size="16" />
          <span>{{ item.text }}</span>
        </div>
      </div>
    </div>

    <!-- 高级搜索区域 -->
    <div class="advanced-search" v-if="showAdvanced">
      <div class="advanced-section">
        <div class="section-title">精确搜索</div>
        <div class="advanced-grid">
          <div class="advanced-field">
            <div class="field-label">标题包含</div>
            <n-input v-model:value="advancedOptions.title" placeholder="输入标题关键字" />
          </div>

          <div class="advanced-field">
            <div class="field-label">内容包含</div>
            <n-input v-model:value="advancedOptions.content" placeholder="输入内容关键字" />
          </div>

          <div class="advanced-field">
            <div class="field-label">创建者</div>
            <n-select
                v-model:value="advancedOptions.authors"
                multiple
                :options="authorOptions"
                placeholder="选择创建者"
                clearable
            />
          </div>

          <div class="advanced-field">
            <div class="field-label">最小阅读量</div>
            <n-input-number
                v-model:value="advancedOptions.minVisits"
                clearable
                placeholder="最小阅读量"
                :min="0"
            />
          </div>
        </div>
      </div>

      <div class="advanced-actions">
        <n-button type="primary" @click="handleAdvancedSearch">应用筛选</n-button>
        <n-button @click="resetAdvanced">重置条件</n-button>
        <n-button text @click="saveSearchPreset">
          <template #icon>
            <icon-font type="icon-shoucang" />
          </template>
          保存为常用搜索
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'advanced-search'])

// 搜索输入状态
const searchInput = ref(null)
const keyword = ref(props.modelValue)
const dateRange = ref(null)
const showAdvanced = ref(false)
const showSearchHistory = ref(false)

// 同步父组件的关键词变更
watch(() => props.modelValue, (newValue) => {
  keyword.value = newValue
})

// 向父组件更新关键词
watch(keyword, (newValue) => {
  emit('update:modelValue', newValue)
})

// 高级搜索选项
const advancedOptions = ref({
  title: '',
  content: '',
  authors: [],
  minVisits: null
})

// 搜索历史
const searchHistory = ref([
  'Vue3 组件通信',
  'React Hooks 最佳实践',
  'TypeScript 类型体操',
  'Vite 构建优化'
])

// 搜索建议
const searchSuggestions = [
  { text: '最近7天创建的文档', icon: 'icon-zuijin' },
  { text: '我标记的重要文档', icon: 'icon-zhongyao' },
  { text: 'Vue相关文档', icon: 'icon-Vue' },
  { text: 'React相关文档', icon: 'icon-react' },
  { text: '我创建的所有文档', icon: 'icon-wode' },
  { text: '未阅读的文档', icon: 'icon-weiyuedu' }
]

// 筛选的搜索建议
const filteredSuggestions = computed(() => {
  if (!keyword.value) return []
  return searchSuggestions.filter(item =>
      item.text.toLowerCase().includes(keyword.value.toLowerCase())
  )
})

// 作者选项
const authorOptions = [
  { label: '我创建的', value: 'me' },
  { label: '团队共享的', value: 'team' },
  { label: '系统导入的', value: 'system' }
]

// 切换高级搜索
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
  showSearchHistory.value = false
}

// 清除搜索
const clearSearch = () => {
  keyword.value = ''
  showSearchHistory.value = false
}

// 应用搜索词
const applySearchTerm = (term) => {
  keyword.value = term
  showSearchHistory.value = false
  handleSearch()
}

// 处理搜索
const handleSearch = () => {
  if (keyword.value.trim() || dateRange.value) {
    addToSearchHistory(keyword.value)

    emit('search', {
      keyword: keyword.value,
      dateRange: dateRange.value
    })

    showSearchHistory.value = false
  }
}

// 处理高级搜索
const handleAdvancedSearch = () => {
  emit('advanced-search', {
    ...advancedOptions.value,
    keyword: keyword.value,
    dateRange: dateRange.value
  })

  showSearchHistory.value = false
}

// 重置高级搜索选项
const resetAdvanced = () => {
  advancedOptions.value = {
    title: '',
    content: '',
    authors: [],
    minVisits: null
  }
}

// 添加到搜索历史
const addToSearchHistory = (term) => {
  if (!term || term.trim() === '') return

  // 移除已存在的相同项
  const index = searchHistory.value.indexOf(term)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
  }

  // 添加到历史记录开头
  searchHistory.value.unshift(term)

  // 保持历史记录不超过10条
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }
}

// 清除搜索历史
const clearHistory = (e) => {
  e.stopPropagation()
  searchHistory.value = []
}

// 保存搜索模板
const saveSearchPreset = () => {
  if (!keyword.value && !dateRange.value && !Object.values(advancedOptions.value).some(v => v)) {
    message.warning('请先设置搜索条件')
    return
  }

  message.success('搜索条件已保存')
}

// 处理点击外部关闭下拉菜单
const handleClickOutside = (e) => {
  if (searchInput.value && !searchInput.value.contains(e.target)) {
    showSearchHistory.value = false
  }
}

// 监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
}

.search-main {
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: stretch;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  height: 40px;
}

.search-input {
  width: 100%;
  height: 100%;
  padding: 8px 40px 8px 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  background-color: var(--card-color);
  color: var(--text-color-base);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.search-input::placeholder {
  color: var(--text-color-tertiary);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-tertiary);
}

.clear-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-tertiary);
  cursor: pointer;
  z-index: 2;
}

.clear-icon:hover {
  color: var(--text-color-secondary);
}

.search-date-picker {
  width: 240px;
}

.search-button {
  min-width: 80px;
}

.advanced-button {
  min-width: 80px;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: calc(100% - 412px); /* 减去日期选择器、搜索按钮和高级按钮的宽度 */
  margin-top: 4px;
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow-2);
  z-index: 100;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--divider-color);
  font-size: 13px;
  color: var(--text-color-secondary);
}

.dropdown-body {
  max-height: 300px;
  overflow-y: auto;
}

.history-item, .suggestion-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s;
  cursor: pointer;
  position: relative;
}

.history-item:hover, .suggestion-item:hover {
  background-color: rgba(var(--primary-color-rgb, 99, 102, 241), 0.05);
}

.history-item {
  padding-right: 40px;
}

.use-item {
  position: absolute;
  right: 16px;
  color: var(--text-color-tertiary);
  opacity: 0;
  transition: opacity 0.2s;
}

.history-item:hover .use-item {
  opacity: 1;
}

.use-item:hover {
  color: var(--primary-color);
}

.advanced-search {
  margin-top: 16px;
  padding: 16px;
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow-1);
  animation: slideDown 0.3s ease;
}

.advanced-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--text-color-base);
  font-size: 14px;
}

.advanced-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.advanced-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  color: var(--text-color-secondary);
}

.advanced-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 900px) {
  .search-main {
    flex-wrap: wrap;
  }

  .search-input-wrapper {
    width: 100%;
    min-width: 100%;
  }

  .search-date-picker {
    flex: 1;
  }

  .search-dropdown {
    width: 100%;
  }

  .advanced-grid {
    grid-template-columns: 1fr;
  }
}
</style>