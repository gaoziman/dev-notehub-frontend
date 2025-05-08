<template>
  <n-modal
      v-model:show="localShow"
      preset="card"
      title="选择筛选条件"
      style="max-width: 800px; width: 90%"
      :bordered="false"
  >
    <div class="filter-header">
      <div class="filter-title">
        精确查找您需要的书签内容
      </div>
      <div class="filter-stats">
        <span>书签总数: <strong>{{ totalBookmarks }}</strong></span>
        <span>已选条件: <strong>{{ selectedConditionsCount }}</strong></span>
      </div>
    </div>

    <n-tabs type="segment" v-model:value="activeTab" animated>
      <n-tab-pane name="basic" tab="基础筛选">
        <div class="filter-content">
          <!-- 平台筛选 -->
          <div class="filter-section">
            <div class="section-title">
              <icon-font type="icon-platform" :size="18" />
              <span>按平台筛选</span>
            </div>

            <div class="platform-grid">
              <div
                  v-for="platform in platforms"
                  :key="platform.id"
                  :class="['platform-card', isPlatformSelected(platform.id) ? 'platform-selected' : '']"
                  @click="togglePlatform(platform.id)"
              >
                <div class="platform-icon">
                  <icon-font :type="platform.icon" :size="24" />
                </div>
                <div class="platform-name">{{ platform.name }}</div>
              </div>

              <div class="platform-card other-platform">
                <div class="platform-icon">
                  <icon-font type="icon-link" :size="24" />
                </div>
                <div class="platform-name">其他</div>
              </div>
            </div>
          </div>

          <!-- 热门标签筛选 - 改进部分 -->
          <div class="filter-section">
            <div class="section-title">
              <icon-font type="icon-tag" :size="18" />
              <span>热门标签</span>
            </div>

            <!-- 搜索输入框 -->
            <div class="search-input">
              <n-input
                  v-model:value="tagSearchText"
                  placeholder="搜索标签..."
                  clearable
                  round
              >
                <template #prefix>
                  <icon-font type="icon-search" :size="16" />
                </template>
              </n-input>
            </div>

            <!-- 标签分类导航 -->
            <div class="tag-categories">
              <n-radio-group v-model:value="activeTagCategory" size="small" buttonStyle="solid">
                <n-radio-button value="all">
                  全部
                </n-radio-button>
                <n-radio-button value="tech">
                  技术
                </n-radio-button>
                <n-radio-button value="design">
                  设计
                </n-radio-button>
                <n-radio-button value="cloud">
                  云服务
                </n-radio-button>
              </n-radio-group>
            </div>

            <!-- 热门标签展示 - 改进的标签展示区域 -->
            <div class="tag-cloud">
              <transition-group name="tag-fade">
                <div
                    v-for="tag in displayedTags"
                    :key="tag"
                    :class="['tag-item', isTagSelected(tag) ? 'tag-selected' : getTagCategory(tag)]"
                    @click="toggleTag(tag)"
                >
                  <span class="tag-text">{{ tag }}</span>
                  <icon-font v-if="isTagSelected(tag)" type="icon-check" :size="14" class="tag-check" />
                </div>
              </transition-group>
            </div>

            <!-- 没有标签时的提示 -->
            <div v-if="displayedTags.length === 0" class="empty-tags">
              <icon-font type="icon-empty" :size="36" />
              <p>没有找到匹配的标签</p>
            </div>

            <!-- 热门程度指示器 -->
            <div class="tag-popularity-hint">
              <div class="popularity-scale">
                <span class="hint-label">热门程度:</span>
                <div class="scale-point scale-low"></div>
                <span>低</span>
                <div class="scale-point scale-medium"></div>
                <span>中</span>
                <div class="scale-point scale-high"></div>
                <span>高</span>
              </div>
            </div>
          </div>

          <!-- 按时间筛选 -->
          <div class="filter-section">
            <div class="section-title">
              <icon-font type="icon-time" :size="18" />
              <span>按时间筛选</span>
            </div>

            <div class="time-filter">
              <div class="time-presets">
                <n-button
                    v-for="preset in timePresets"
                    :key="preset.key"
                    :type="activeTimePreset === preset.key ? 'primary' : 'default'"
                    size="small"
                    @click="setTimePreset(preset.key)"
                >
                  {{ preset.label }}
                </n-button>
              </div>

              <n-date-picker
                  v-model:value="filterData.dateRange"
                  type="daterange"
                  clearable
                  style="margin-top: 12px; width: 100%;"
                  placeholder="自定义时间范围"
                  @update:value="activeTimePreset = 'custom'"
              />
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="advanced" tab="高级筛选">
        <div class="filter-content">
          <!-- 分类筛选 -->
          <div class="filter-section">
            <div class="section-title">
              <icon-font type="icon-folder" :size="18" />
              <span>按分类筛选</span>
            </div>

            <div class="category-grid">
              <div
                  v-for="category in categories"
                  :key="category.id"
                  :class="['category-card', isCategorySelected(category.id) ? 'category-selected' : '']"
                  @click="toggleCategory(category.id)"
              >
                {{ category.name }}
              </div>
            </div>
          </div>

          <!-- 编程语言筛选 -->
          <div class="filter-section">
            <div class="section-title">
              <icon-font type="icon-code" :size="18" />
              <span>编程语言筛选</span>
            </div>

            <div class="language-grid">
              <div
                  v-for="lang in programmingLanguages"
                  :key="lang"
                  :class="['language-tag', isLanguageSelected(lang) ? 'language-selected' : '']"
                  @click="toggleLanguage(lang)"
              >
                <span class="tag-name">{{ lang }}</span>
              </div>
            </div>
          </div>

          <!-- 框架筛选 -->
          <div class="filter-section">
            <div class="section-title">
              <icon-font type="icon-framework" :size="18" />
              <span>框架筛选</span>
            </div>

            <div class="framework-grid">
              <div
                  v-for="framework in frameworks"
                  :key="framework"
                  :class="['framework-tag', isFrameworkSelected(framework) ? 'framework-selected' : '']"
                  @click="toggleFramework(framework)"
              >
                <span class="tag-name">{{ framework }}</span>
              </div>
            </div>
          </div>

          <!-- 数据库筛选 -->
          <div class="filter-section">
            <div class="section-title">
              <icon-font type="icon-database" :size="18" />
              <span>数据库筛选</span>
            </div>

            <div class="database-grid">
              <div
                  v-for="db in databases"
                  :key="db"
                  :class="['database-tag', isDatabaseSelected(db) ? 'database-selected' : '']"
                  @click="toggleDatabase(db)"
              >
                <span class="tag-name">{{ db }}</span>
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="selected" tab="已选条件">
        <div class="filter-content">
          <div v-if="hasSelectedFilters" class="selected-filters">
            <!-- 已选平台 -->
            <div v-if="filterData.platforms.length > 0" class="filter-section">
              <div class="section-title">
                <icon-font type="icon-platform" :size="18" />
                <span>已选平台</span>
              </div>

              <div class="selected-tags">
                <n-tag
                    v-for="platformId in filterData.platforms"
                    :key="platformId"
                    type="primary"
                    closable
                    round
                    @close="removePlatform(platformId)"
                >
                  {{ getPlatformName(platformId) }}
                </n-tag>
              </div>
            </div>

            <!-- 已选分类 -->
            <div v-if="filterData.categories.length > 0" class="filter-section">
              <div class="section-title">
                <icon-font type="icon-folder" :size="18" />
                <span>已选分类</span>
              </div>

              <div class="selected-tags">
                <n-tag
                    v-for="categoryId in filterData.categories"
                    :key="categoryId"
                    type="success"
                    closable
                    round
                    @close="removeCategory(categoryId)"
                >
                  {{ getCategoryName(categoryId) }}
                </n-tag>
              </div>
            </div>

            <!-- 已选标签 -->
            <div v-if="filterData.tags.length > 0" class="filter-section">
              <div class="section-title">
                <icon-font type="icon-tag" :size="18" />
                <span>已选标签</span>
              </div>

              <div class="selected-tags">
                <n-tag
                    v-for="tag in filterData.tags"
                    :key="tag"
                    type="info"
                    closable
                    round
                    @close="removeTag(tag)"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </div>

            <!-- 已选编程语言 -->
            <div v-if="filterData.programmingLanguages.length > 0" class="filter-section">
              <div class="section-title">
                <icon-font type="icon-code" :size="18" />
                <span>已选编程语言</span>
              </div>

              <div class="selected-tags">
                <n-tag
                    v-for="lang in filterData.programmingLanguages"
                    :key="lang"
                    type="warning"
                    closable
                    round
                    @close="removeLanguage(lang)"
                >
                  {{ lang }}
                </n-tag>
              </div>
            </div>

            <!-- 已选框架 -->
            <div v-if="filterData.frameworks.length > 0" class="filter-section">
              <div class="section-title">
                <icon-font type="icon-framework" :size="18" />
                <span>已选框架</span>
              </div>

              <div class="selected-tags">
                <n-tag
                    v-for="framework in filterData.frameworks"
                    :key="framework"
                    closable
                    round
                    @close="removeFramework(framework)"
                >
                  {{ framework }}
                </n-tag>
              </div>
            </div>

            <!-- 已选数据库 -->
            <div v-if="filterData.databases.length > 0" class="filter-section">
              <div class="section-title">
                <icon-font type="icon-database" :size="18" />
                <span>已选数据库</span>
              </div>

              <div class="selected-tags">
                <n-tag
                    v-for="db in filterData.databases"
                    :key="db"
                    closable
                    round
                    @close="removeDatabase(db)"
                >
                  {{ db }}
                </n-tag>
              </div>
            </div>

            <!-- 已选时间范围 -->
            <div v-if="filterData.dateRange" class="filter-section">
              <div class="section-title">
                <icon-font type="icon-time" :size="18" />
                <span>时间范围</span>
              </div>

              <div class="selected-tags">
                <n-tag
                    type="info"
                    closable
                    round
                    @close="clearDateRange"
                >
                  {{ formatDateRange(filterData.dateRange) }}
                </n-tag>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <icon-font type="icon-empty" :size="64" />
            </div>
            <div class="empty-text">暂无筛选条件</div>
            <div class="empty-desc">请在基础筛选或高级筛选中添加条件</div>
            <n-button type="primary" @click="activeTab = 'basic'" round>
              添加筛选条件
            </n-button>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 底部操作区 -->
    <div class="filter-footer">
      <div class="left-actions">
        <n-popover trigger="click" placement="top">
          <template #trigger>
            <n-button>
              <template #icon>
                <icon-font type="icon-save" :size="16" />
              </template>
              保存为预设
            </n-button>
          </template>

          <div class="preset-form">
            <n-input v-model:value="presetName" placeholder="输入预设名称" />
            <n-button type="primary" size="small" @click="saveAsPreset" :disabled="!presetName">
              保存
            </n-button>
          </div>
        </n-popover>

        <n-button @click="resetFilters">
          <template #icon>
            <icon-font type="icon-refresh" :size="16" />
          </template>
          清除全部条件
        </n-button>
      </div>

      <div class="right-actions">
        <n-button @click="cancelFilter">取消</n-button>
        <n-button
            type="primary"
            @click="applyFilter"
            :disabled="!hasSelectedFilters"
            round
        >
          应用筛选 ({{ selectedConditionsCount }})
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { format } from 'date-fns';

// 接收属性
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  platforms: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  },
  programmingLanguages: {
    type: Array,
    default: () => []
  },
  frameworks: {
    type: Array,
    default: () => []
  },
  databases: {
    type: Array,
    default: () => []
  },
  filterConditions: {
    type: Object,
    default: () => ({
      platforms: [],
      categories: [],
      tags: [],
      programmingLanguages: [],
      frameworks: [],
      databases: [],
      dateRange: null
    })
  },
  totalBookmarks: {
    type: Number,
    default: 0
  }
});

// 定义事件
const emit = defineEmits(['update:show', 'apply', 'reset', 'save-preset']);

// 本地状态
const localShow = ref(props.show);
const activeTab = ref('basic');
const tagSearchText = ref('');
const presetName = ref('');
const activeTimePreset = ref('all');

// 标签分类相关
const activeTagCategory = ref('all');

// 标签分类映射
const tagCategories = {
  tech: ['JavaScript', 'TypeScript', 'Java', 'Python', 'CSS', 'HTML', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Vue', 'React', 'Angular', 'Spring', 'MongoDB'],
  design: ['UI/UX', 'Figma', 'Design System'],
  cloud: ['AWS', 'Azure', 'Google Cloud', 'Performance', 'Security', 'Database', 'MySQL', 'Redis']
};

// 标签热度映射（模拟数据）
const tagPopularity = {
  'JavaScript': 'high',
  'TypeScript': 'high',
  'Python': 'high',
  'Java': 'medium',
  'React': 'high',
  'Vue': 'high',
  'Angular': 'medium',
  'Docker': 'medium',
  'Kubernetes': 'medium',
  'MongoDB': 'medium',
  'MySQL': 'medium',
  'Redis': 'medium',
  'AWS': 'high',
  'CSS': 'high',
  'HTML': 'high',
  'Git': 'medium',
  'CI/CD': 'low',
  'UI/UX': 'medium',
  'Figma': 'low',
  'Design System': 'low',
  'Azure': 'low',
  'Google Cloud': 'low',
  'Performance': 'low',
  'Security': 'medium',
  'Database': 'medium',
  'Spring': 'medium'
};

// 时间预设选项
const timePresets = [
  { key: 'all', label: '全部时间' },
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '今年' }
];

// 筛选数据
const filterData = ref({
  platforms: [],
  categories: [],
  tags: [],
  programmingLanguages: [],
  frameworks: [],
  databases: [],
  dateRange: null
});

// 获取标签分类
const getTagCategory = (tag) => {
  // 根据标签热度返回对应的样式类
  return `tag-${tagPopularity[tag] || 'low'}`;
};

// 计算标签过滤结果
const filteredTags = computed(() => {
  // 首先按搜索文本筛选
  let result = props.tags.filter(tag =>
      tagSearchText.value === '' ||
      tag.toLowerCase().includes(tagSearchText.value.toLowerCase())
  );

  // 根据所选分类进一步筛选
  if (activeTagCategory.value !== 'all') {
    result = result.filter(tag => tagCategories[activeTagCategory.value].includes(tag));
  }

  return result;
});

// 显示标签，根据标签首字母排序
const displayedTags = computed(() => {
  // 复制一个数组进行排序，避免修改原始数据
  return [...filteredTags.value].sort((a, b) => a.localeCompare(b));
});

// 计算已选择的条件数量
const selectedConditionsCount = computed(() => {
  let count = 0;
  count += filterData.value.platforms.length;
  count += filterData.value.categories.length;
  count += filterData.value.tags.length;
  count += filterData.value.programmingLanguages.length;
  count += filterData.value.frameworks.length;
  count += filterData.value.databases.length;
  count += filterData.value.dateRange ? 1 : 0;
  return count;
});

// 是否有已选条件
const hasSelectedFilters = computed(() => {
  return selectedConditionsCount.value > 0;
});

// 检查选择状态
const isPlatformSelected = (platformId) => {
  return filterData.value.platforms.includes(platformId);
};

const isCategorySelected = (categoryId) => {
  return filterData.value.categories.includes(categoryId);
};

const isTagSelected = (tag) => {
  return filterData.value.tags.includes(tag);
};

const isLanguageSelected = (language) => {
  return filterData.value.programmingLanguages.includes(language);
};

const isFrameworkSelected = (framework) => {
  return filterData.value.frameworks.includes(framework);
};

const isDatabaseSelected = (database) => {
  return filterData.value.databases.includes(database);
};

// 切换选择状态
const togglePlatform = (platformId) => {
  const index = filterData.value.platforms.indexOf(platformId);
  if (index === -1) {
    filterData.value.platforms.push(platformId);
  } else {
    filterData.value.platforms.splice(index, 1);
  }
};

const toggleCategory = (categoryId) => {
  const index = filterData.value.categories.indexOf(categoryId);
  if (index === -1) {
    filterData.value.categories.push(categoryId);
  } else {
    filterData.value.categories.splice(index, 1);
  }
};

const toggleTag = (tag) => {
  const index = filterData.value.tags.indexOf(tag);
  if (index === -1) {
    filterData.value.tags.push(tag);
  } else {
    filterData.value.tags.splice(index, 1);
  }
};

const toggleLanguage = (language) => {
  const index = filterData.value.programmingLanguages.indexOf(language);
  if (index === -1) {
    filterData.value.programmingLanguages.push(language);
  } else {
    filterData.value.programmingLanguages.splice(index, 1);
  }
};

const toggleFramework = (framework) => {
  const index = filterData.value.frameworks.indexOf(framework);
  if (index === -1) {
    filterData.value.frameworks.push(framework);
  } else {
    filterData.value.frameworks.splice(index, 1);
  }
};

const toggleDatabase = (database) => {
  const index = filterData.value.databases.indexOf(database);
  if (index === -1) {
    filterData.value.databases.push(database);
  } else {
    filterData.value.databases.splice(index, 1);
  }
};

// 移除已选条件
const removePlatform = (platformId) => {
  const index = filterData.value.platforms.indexOf(platformId);
  if (index !== -1) {
    filterData.value.platforms.splice(index, 1);
  }
};

const removeCategory = (categoryId) => {
  const index = filterData.value.categories.indexOf(categoryId);
  if (index !== -1) {
    filterData.value.categories.splice(index, 1);
  }
};

const removeTag = (tag) => {
  const index = filterData.value.tags.indexOf(tag);
  if (index !== -1) {
    filterData.value.tags.splice(index, 1);
  }
};

const removeLanguage = (language) => {
  const index = filterData.value.programmingLanguages.indexOf(language);
  if (index !== -1) {
    filterData.value.programmingLanguages.splice(index, 1);
  }
};

const removeFramework = (framework) => {
  const index = filterData.value.frameworks.indexOf(framework);
  if (index !== -1) {
    filterData.value.frameworks.splice(index, 1);
  }
};

const removeDatabase = (database) => {
  const index = filterData.value.databases.indexOf(database);
  if (index !== -1) {
    filterData.value.databases.splice(index, 1);
  }
};

const clearDateRange = () => {
  filterData.value.dateRange = null;
  activeTimePreset.value = 'all';
};

// 获取名称
const getPlatformName = (platformId) => {
  const platform = props.platforms.find(p => p.id === platformId);
  return platform ? platform.name : platformId;
};

const getCategoryName = (categoryId) => {
  const category = props.categories.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
};

// 格式化日期范围
const formatDateRange = (dateRange) => {
  if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) return '';
  const [start, end] = dateRange;
  return `${format(start, 'yyyy-MM-dd')} 至 ${format(end, 'yyyy-MM-dd')}`;
};

// 设置时间预设
const setTimePreset = (preset) => {
  activeTimePreset.value = preset;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate = null;
  let endDate = null;

  switch (preset) {
    case 'today':
      startDate = startOfDay;
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'week':
      const dayOfWeek = now.getDay() || 7; // 获取星期几，将星期日转为7
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7, 23, 59, 59);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      // 全部时间
      startDate = null;
      endDate = null;
      break;
  }

  if (startDate && endDate) {
    filterData.value.dateRange = [startDate, endDate];
  } else {
    filterData.value.dateRange = null;
  }
};

// 应用筛选
const applyFilter = () => {
  emit('apply', { ...filterData.value });
  localShow.value = false;
};

// 取消筛选
const cancelFilter = () => {
  localShow.value = false;
};

// 重置筛选
const resetFilters = () => {
  filterData.value = {
    platforms: [],
    categories: [],
    tags: [],
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    dateRange: null
  };
  activeTimePreset.value = 'all';
  activeTagCategory.value = 'all';
  emit('reset');
};

// 保存为预设
const saveAsPreset = () => {
  if (!presetName.value.trim()) return;

  emit('save-preset', {
    name: presetName.value,
    conditions: { ...filterData.value }
  });

  presetName.value = '';
};

// 监听显示属性变化
watch(() => props.show, (newValue) => {
  localShow.value = newValue;
});

// 监听本地显示变化
watch(localShow, (newValue) => {
  emit('update:show', newValue);
});

// 初始化筛选条件
watch(() => props.filterConditions, (newValue) => {
  if (newValue) {
    filterData.value = { ...newValue };

    // 根据日期范围判断当前时间预设
    if (newValue.dateRange) {
      // 初始化时默认为自定义时间范围
      activeTimePreset.value = 'custom';
    } else {
      activeTimePreset.value = 'all';
    }
  }
}, { immediate: true });

// 组件挂载时的操作
onMounted(() => {
  // 初始化
});
</script>

<style scoped>
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.filter-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.filter-content {
  padding: 16px 0;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 12px;
  color: var(--text-color-base);
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.platform-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: var(--card-color);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.platform-card:hover {
  background-color: var(--primary-color-suppl);
  border-color: var(--primary-color);
}

.platform-selected {
  background-color: var(--primary-color-suppl);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.platform-icon {
  margin-bottom: 8px;
}

.platform-name {
  font-size: 14px;
  text-align: center;
}

.other-platform {
  background-color: #f0f0f0;
  color: var(--text-color-secondary);
}

.search-input {
  margin-bottom: 16px;
}

/* 标签分类导航 */
.tag-categories {
  margin-bottom: 16px;
}

/* 标签云 - 改进的样式 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.tag-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  background-color: #f5f7fa;
  color: var(--text-color-base);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-size: 14px;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

.tag-selected {
  background-color: var(--primary-color);
  color: var(--text-color-inverse);
  padding-right: 30px;
}

.tag-selected:hover {
  background-color: var(--primary-color-hover);
}

.tag-check {
  position: absolute;
  right: 10px;
}

/* 标签热度样式 */
.tag-high {
  background-color: rgba(99, 102, 241, 0.16);
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
  font-weight: 500;
}

.tag-medium {
  background-color: rgba(99, 102, 241, 0.08);
  color: #6366f1;
}

.tag-low {
  background-color: #f0f0f0;
  color: var(--text-color-secondary);
}

/* 标签热度指示器 */
.tag-popularity-hint {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color-light);
}

.popularity-scale {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.hint-label {
  margin-right: 4px;
}

.scale-point {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.scale-low {
  background-color: #f0f0f0;
}

.scale-medium {
  background-color: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.scale-high {
  background-color: rgba(99, 102, 241, 0.16);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

/* 空标签状态 */
.empty-tags {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: var(--text-color-tertiary);
}

.empty-tags p {
  margin-top: 12px;
  font-size: 14px;
}

/* 标签淡入淡出动画 */
.tag-fade-enter-active,
.tag-fade-leave-active {
  transition: all 0.3s ease;
}

.tag-fade-enter-from,
.tag-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.tags-grid,
.language-grid,
.framework-grid,
.database-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.category-card {
  padding: 12px;
  background-color: var(--card-color);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius);
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-card:hover {
  background-color: var(--success-color-suppl);
  border-color: var(--success-color);
}

.category-selected {
  background-color: var(--success-color-suppl);
  border-color: var(--success-color);
  color: var(--success-color);
}

.language-tag,
.framework-tag,
.database-tag {
  padding: 6px 12px;
  background-color: var(--card-color);
  border: 1px solid var(--border-color-light);
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-tag:hover {
  background-color: var(--warning-color-suppl);
  border-color: var(--warning-color);
}

.framework-tag:hover {
  background-color: var(--info-color-suppl);
  border-color: var(--info-color);
}

.database-tag:hover {
  background-color: var(--error-color-suppl);
  border-color: var(--error-color);
}

.language-selected {
  background-color: var(--warning-color-suppl);
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.framework-selected {
  background-color: var(--info-color-suppl);
  border-color: var(--info-color);
  color: var(--info-color);
}

.database-selected {
  background-color: var(--error-color-suppl);
  border-color: var(--error-color);
  color: var(--error-color);
}

.tag-name {
  display: inline-block;
}

.time-filter {
  display: flex;
  flex-direction: column;
}

.time-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--text-color-tertiary);
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-color-tertiary);
  margin-bottom: 16px;
}

.filter-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--divider-color);
}

.left-actions,
.right-actions {
  display: flex;
  gap: 12px;
}

.preset-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 200px;
}

@media (max-width: 768px) {
  .filter-header,
  .filter-footer {
    flex-direction: column;
    gap: 12px;
  }

  .left-actions,
  .right-actions {
    width: 100%;
    justify-content: space-between;
  }

  .platform-grid,
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>