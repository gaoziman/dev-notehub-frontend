<template>
  <div class="filter-form-container">
    <div class="filter-header">
      <div class="title-section">
        <h3 class="filter-title">选择筛选条件</h3>
        <p class="filter-subtitle">精确查找您需要的书签内容</p>
      </div>
      <n-button-group>
        <n-button :type="activeView === 'basic' ? 'primary' : 'default'" @click="activeView = 'basic'">基础筛选</n-button>
        <n-button :type="activeView === 'advanced' ? 'primary' : 'default'" @click="activeView = 'advanced'">高级筛选</n-button>
        <n-button :type="activeView === 'preview' ? 'primary' : 'default'" @click="activeView = 'preview'">已选条件</n-button>
      </n-button-group>
      <div class="stats-display">
        <div class="stats-item"><span class="label">书签总数:</span> <span class="value">{{ totalBookmarks }}</span></div>
        <div class="stats-item"><span class="label">已选条件:</span> <span class="value highlight">{{ activeFiltersCount }}</span></div>
      </div>
    </div>

    <!-- 基础筛选视图 -->
    <div v-if="activeView === 'basic'" class="filter-content">
      <div class="filter-grid">
        <!-- 平台筛选 -->
        <div class="filter-section platform-section">
          <div class="section-header">
            <icon-font type="icon-bijiben" class="section-icon" />
            <span>按平台筛选</span>
          </div>
          <div class="platform-grid">
            <div
                v-for="platform in platformOptions"
                :key="platform.value"
                class="platform-item"
                :class="{ 'selected': formModel.platforms.includes(platform.value) }"
                @click="togglePlatform(platform.value)"
            >
              <icon-font :type="getPlatformIcon(platform.value)" />
              <span>{{ platform.label }}</span>
            </div>
          </div>
        </div>

        <!-- 热门标签 -->
        <div class="filter-section tags-section">
          <div class="section-header">
            <icon-font type="icon-tag" class="section-icon" />
            <span>热门标签</span>
            <n-input
                v-model:value="tagSearchQuery"
                placeholder="搜索标签..."
                clearable
                size="small"
                class="tag-search-input"
            >
              <template #prefix>
                <icon-font type="icon-search" size="16" />
              </template>
            </n-input>
          </div>
          <div class="tags-container">
            <n-tag
                v-for="tag in filteredDisplayedTags"
                :key="tag"
                size="medium"
                :type="isTagSelected(tag) ? 'primary' : 'default'"
                class="tag-item"
                :color="getTagColor(tag)"
                @click="toggleTag(tag)"
            >
              {{ tag }}
            </n-tag>
          </div>
        </div>

        <!-- 时间筛选 -->
        <div class="filter-section time-section">
          <div class="section-header">
            <icon-font type="icon-calendar" class="section-icon" />
            <span>按时间筛选</span>
          </div>
          <div class="time-filter-content">
            <div class="quick-filters">
              <n-button size="small" @click="setTimeRange('today')" :type="formModel.timeRange === 'today' ? 'primary' : 'default'">今天</n-button>
              <n-button size="small" @click="setTimeRange('week')" :type="formModel.timeRange === 'week' ? 'primary' : 'default'">本周</n-button>
              <n-button size="small" @click="setTimeRange('month')" :type="formModel.timeRange === 'month' ? 'primary' : 'default'">本月</n-button>
              <n-button size="small" @click="setTimeRange('year')" :type="formModel.timeRange === 'year' ? 'primary' : 'default'">今年</n-button>
            </div>
            <n-select
                v-model:value="formModel.timeRange"
                :options="timeRangeOptions"
                placeholder="选择时间范围"
                clearable
                class="time-select"
            />
          </div>
        </div>

        <!-- 其他筛选 -->
        <div class="filter-section other-section">
          <div class="section-header">
            <icon-font type="icon-setting" class="section-icon" />
            <span>其他筛选</span>
          </div>
          <div class="other-filters">
            <n-space>
              <n-checkbox v-model:checked="formModel.onlyStarred">
                <div class="checkbox-label">
                  <icon-font type="icon-star-filled" color="#f0a020" />
                  <span>仅收藏</span>
                </div>
              </n-checkbox>
              <n-checkbox v-model:checked="formModel.hasDescription">
                <div class="checkbox-label">
                  <icon-font type="icon-file-text" />
                  <span>包含描述</span>
                </div>
              </n-checkbox>
              <n-checkbox v-model:checked="formModel.hasTags">
                <div class="checkbox-label">
                  <icon-font type="icon-tag" />
                  <span>已添加标签</span>
                </div>
              </n-checkbox>
            </n-space>
          </div>
        </div>
      </div>
    </div>

    <!-- 高级筛选视图 -->
    <div v-if="activeView === 'advanced'" class="filter-content">
      <div class="advanced-grid">
        <!-- 标签分类筛选 -->
        <div class="filter-section tag-categories-section">
          <div class="section-header">
            <icon-font type="icon-tag" class="section-icon" />
            <span>标签分类筛选</span>
          </div>
          <div class="tag-categories">
            <div class="tag-category">
              <div class="category-header">
                <icon-font type="icon-code" size="16" />
                <span>编程语言</span>
              </div>
              <div class="category-tags">
                <n-tag
                    v-for="tag in languageTags"
                    :key="tag"
                    size="medium"
                    :type="isTagSelected(tag) ? 'primary' : 'default'"
                    class="tag-item"
                    @click="toggleTag(tag)"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </div>
            <div class="tag-category">
              <div class="category-header">
                <icon-font type="icon-app" size="16" />
                <span>框架</span>
              </div>
              <div class="category-tags">
                <n-tag
                    v-for="tag in frameworkTags"
                    :key="tag"
                    size="medium"
                    :type="isTagSelected(tag) ? 'primary' : 'default'"
                    class="tag-item"
                    @click="toggleTag(tag)"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </div>
            <div class="tag-category">
              <div class="category-header">
                <icon-font type="icon-database" size="16" />
                <span>数据库</span>
              </div>
              <div class="category-tags">
                <n-tag
                    v-for="tag in databaseTags"
                    :key="tag"
                    size="medium"
                    :type="isTagSelected(tag) ? 'primary' : 'default'"
                    class="tag-item"
                    @click="toggleTag(tag)"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 自定义标签选择 -->
        <div class="filter-section custom-tags-section">
          <div class="section-header">
            <icon-font type="icon-edit" class="section-icon" />
            <span>自定义标签</span>
          </div>
          <n-select
              v-model:value="formModel.tags"
              :options="filteredTagOptions"
              placeholder="选择或输入标签"
              multiple
              clearable
              filterable
              tag
              class="custom-tags-select"
          />
        </div>

        <!-- 高级时间筛选 -->
        <div class="filter-section advanced-time-section">
          <div class="section-header">
            <icon-font type="icon-calendar" class="section-icon" />
            <span>自定义时间范围</span>
          </div>
          <n-date-picker
              v-model:value="customDateRange"
              type="daterange"
              clearable
              class="date-range-picker"
              placeholder="选择自定义日期范围"
          />
        </div>
      </div>
    </div>

    <!-- 预览视图 -->
    <div v-if="activeView === 'preview'" class="filter-content">
      <div class="preview-wrapper" v-if="hasActiveFilters">
        <div class="preview-grid">
          <!-- 平台筛选预览 -->
          <div class="filter-preview-section" v-if="formModel.platforms.length > 0">
            <div class="preview-header">
              <icon-font type="icon-bijiben" class="preview-icon" />
              <span>已选平台</span>
            </div>
            <div class="preview-tags">
              <n-tag
                  v-for="(platform, index) in formModel.platforms"
                  :key="`platform-${index}`"
                  closable
                  size="medium"
                  class="preview-tag"
                  :color="getPlatformTagColor(platform)"
                  @close="removePlatform(platform)"
              >
                <template #icon>
                  <icon-font :type="getPlatformIcon(platform)" />
                </template>
                {{ getPlatformLabel(platform) }}
              </n-tag>
            </div>
          </div>

          <!-- 标签筛选预览 -->
          <div class="filter-preview-section" v-if="formModel.tags.length > 0">
            <div class="preview-header">
              <icon-font type="icon-tag" class="preview-icon" />
              <span>已选标签</span>
            </div>
            <div class="preview-tags">
              <n-tag
                  v-for="(tag, index) in formModel.tags"
                  :key="`tag-${index}`"
                  closable
                  size="medium"
                  class="preview-tag"
                  :color="getTagPreviewColor(tag)"
                  @close="removeTag(tag)"
              >
                {{ tag }}
              </n-tag>
            </div>
          </div>

          <!-- 时间筛选预览 -->
          <div class="filter-preview-section" v-if="formModel.timeRange">
            <div class="preview-header">
              <icon-font type="icon-calendar" class="preview-icon" />
              <span>已选时间</span>
            </div>
            <div class="preview-tags">
              <n-tag
                  closable
                  size="medium"
                  class="preview-tag time-tag"
                  @close="formModel.timeRange = null"
              >
                <template #icon>
                  <icon-font type="icon-clock" />
                </template>
                {{ getTimeRangeLabel(formModel.timeRange) }}
              </n-tag>
            </div>
          </div>

          <!-- 其他筛选预览 -->
          <div class="filter-preview-section" v-if="hasOtherFilters">
            <div class="preview-header">
              <icon-font type="icon-setting" class="preview-icon" />
              <span>其他筛选</span>
            </div>
            <div class="preview-tags">
              <n-tag
                  v-if="formModel.onlyStarred"
                  closable
                  size="medium"
                  type="warning"
                  class="preview-tag"
                  @close="formModel.onlyStarred = false"
              >
                <template #icon>
                  <icon-font type="icon-star-filled" />
                </template>
                仅显示收藏
              </n-tag>

              <n-tag
                  v-if="formModel.hasDescription"
                  closable
                  size="medium"
                  type="info"
                  class="preview-tag"
                  @close="formModel.hasDescription = false"
              >
                <template #icon>
                  <icon-font type="icon-file-text" />
                </template>
                包含描述
              </n-tag>

              <n-tag
                  v-if="formModel.hasTags"
                  closable
                  size="medium"
                  type="success"
                  class="preview-tag"
                  @close="formModel.hasTags = false"
              >
                <template #icon>
                  <icon-font type="icon-tag" />
                </template>
                已添加标签
              </n-tag>
            </div>
          </div>
        </div>

        <!-- 结果预览 -->
        <div class="results-summary">
          <div class="summary-header">匹配结果预览</div>
          <div class="summary-content">
            <div class="summary-stats">
              <span class="summary-value">{{ filteredCount }}</span>
              <span class="summary-label">/ {{ totalBookmarks }} 个书签</span>
            </div>
            <n-progress
                type="line"
                :percentage="(filteredCount / totalBookmarks) * 100"
                :show-indicator="false"
                :height="8"
                :color="getProgressColor(filteredCount, totalBookmarks)"
                class="match-progress"
            />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <n-empty description="暂无筛选条件">
          <template #extra>
            <p class="empty-tip">请在基础筛选或高级筛选中添加条件</p>
            <n-button @click="activeView = 'basic'">添加筛选条件</n-button>
          </template>
        </n-empty>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <div class="action-left">
        <n-button @click="saveAsPreset" class="save-preset-btn" :disabled="!hasActiveFilters">
          <template #icon>
            <icon-font type="icon-save" />
          </template>
          保存为预设
        </n-button>
        <n-button text type="error" @click="clearFilters" :disabled="!hasActiveFilters">
          <template #icon>
            <icon-font type="icon-delete" />
          </template>
          清除全部条件
        </n-button>
      </div>
      <div class="action-right">
        <n-button @click="onCancel" class="cancel-btn">取消</n-button>
        <n-button
            type="primary"
            @click="applyFilters"
            class="apply-btn"
            :disabled="!hasActiveFilters"
            :loading="isSubmitting"
        >
          应用筛选 ({{ activeFiltersCount }})
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits } from 'vue';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  availableTags: {
    type: Array,
    default: () => []
  },
  totalBookmarks: {
    type: Number,
    default: 25
  }
});

const emit = defineEmits(['apply', 'cancel', 'save-preset']);
const message = useMessage();

// 状态管理
const tagSearchQuery = ref('');
const activeView = ref('basic');
const isSubmitting = ref(false);
const customDateRange = ref(null);

// 表单数据
const formModel = reactive({
  platforms: [],
  tags: [],
  timeRange: null,
  onlyStarred: false,
  hasDescription: false,
  hasTags: false
});

// 活跃筛选条件计数
const activeFiltersCount = computed(() => {
  let count = 0;
  count += formModel.platforms.length;
  count += formModel.tags.length;
  if (formModel.timeRange) count += 1;
  if (formModel.onlyStarred) count += 1;
  if (formModel.hasDescription) count += 1;
  if (formModel.hasTags) count += 1;
  return count;
});

// 平台选项
const platformOptions = [
  { label: 'GitHub', value: 'github' },
  { label: '掘金', value: 'juejin' },
  { label: 'CSDN', value: 'csdn' },
  { label: '微信公众号', value: 'wechat' },
  { label: '知乎', value: 'zhihu' },
  { label: '博客', value: 'blog' },
  { label: '其他', value: 'other' }
];

// 平台颜色
const platformColors = {
  'github': '#24292e',
  'juejin': '#1e80ff',
  'csdn': '#e33322',
  'wechat': '#07c160',
  'zhihu': '#0066ff',
  'blog': '#fc8800',
  'other': '#909399'
};

// 平台图标
function getPlatformIcon(platform) {
  const iconMap = {
    'github': 'icon-icon_github',
    'juejin': 'icon-juejin',
    'csdn': 'icon-csdn1',
    'wechat': 'icon-weixingongzhonghao',
    'zhihu': 'icon-zhihu',
    'blog': 'icon-blog',
    'other': 'icon-link1'
  };

  return iconMap[platform] || 'icon-link1';
}

// 获取平台标签颜色
function getPlatformTagColor(platform) {
  const color = platformColors[platform];
  return {
    color: color,
    textColor: '#ffffff'
  };
}

// 切换平台选择
function togglePlatform(platform) {
  const index = formModel.platforms.indexOf(platform);
  if (index > -1) {
    formModel.platforms.splice(index, 1);
  } else {
    formModel.platforms.push(platform);
  }
}

// 标签选项
const tagOptions = computed(() => {
  return props.availableTags.map(tag => ({
    label: tag,
    value: tag
  }));
});

// 过滤后的标签选项
const filteredTagOptions = computed(() => {
  if (!tagSearchQuery.value) return tagOptions.value;

  return tagOptions.value.filter(option =>
      option.label.toLowerCase().includes(tagSearchQuery.value.toLowerCase())
  );
});

// 显示的热门标签（取前15个）
const displayedTags = computed(() => {
  return props.availableTags.slice(0, 15);
});

// 过滤后的显示标签
const filteredDisplayedTags = computed(() => {
  if (!tagSearchQuery.value) return displayedTags.value;

  return displayedTags.value.filter(tag =>
      tag.toLowerCase().includes(tagSearchQuery.value.toLowerCase())
  );
});

// 编程语言标签
const languageTags = [
  'Java', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'C++'
];

// 框架标签
const frameworkTags = [
  'Spring', 'SpringBoot', 'Vue', 'React', 'Angular', 'Express'
];

// 数据库标签
const databaseTags = [
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'ElasticSearch'
];

// 标签颜色映射
const tagColorMap = {
  'Java': '#2080f0',
  'JavaScript': '#f0a020',
  'TypeScript': '#3178c6',
  'Spring': '#6DB33F',
  'SpringBoot': '#6DB33F',
  'MySQL': '#4479A1',
  'Redis': '#DC382D',
  'RocketMQ': '#f0a020',
  'JVM': '#2080f0',
  '性能优化': '#f0a020',
  '微服务': '#8a2be2',
  '分布式': '#8a2be2',
  '消息中间件': '#f0a020',
  '数据库': '#d03050',
};

// 获取标签颜色
function getTagColor(tag) {
  const color = tagColorMap[tag] || '#909399';
  return isTagSelected(tag)
      ? { color: color, textColor: '#ffffff' }
      : { color: '#f5f5f5', textColor: color, borderColor: color };
}

// 获取标签预览颜色
function getTagPreviewColor(tag) {
  const color = tagColorMap[tag] || '#909399';
  return {
    color: color,
    textColor: '#ffffff'
  };
}

// 时间范围选项
const timeRangeOptions = [
  { label: '今天添加', value: 'today' },
  { label: '昨天添加', value: 'yesterday' },
  { label: '本周添加', value: 'week' },
  { label: '本月添加', value: 'month' },
  { label: '三个月内', value: 'three-months' },
  { label: '半年内', value: 'half-year' },
  { label: '一年内', value: 'year' }
];

// 设置时间范围
function setTimeRange(range) {
  formModel.timeRange = range;
}

// 是否有其他筛选条件
const hasOtherFilters = computed(() => {
  return formModel.onlyStarred || formModel.hasDescription || formModel.hasTags;
});

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return formModel.platforms.length > 0 ||
      formModel.tags.length > 0 ||
      formModel.timeRange !== null ||
      hasOtherFilters.value;
});

// 模拟筛选结果数量
const filteredCount = computed(() => {
  let count = props.totalBookmarks;

  if (formModel.platforms.length > 0) {
    count = Math.round(count * 0.7);
  }

  if (formModel.tags.length > 0) {
    count = Math.round(count * (0.8 - (formModel.tags.length * 0.05)));
  }

  if (formModel.timeRange) {
    count = Math.round(count * 0.8);
  }

  if (formModel.onlyStarred) {
    count = Math.round(count * 0.3);
  }

  if (formModel.hasDescription) {
    count = Math.round(count * 0.9);
  }

  if (formModel.hasTags) {
    count = Math.round(count * 0.75);
  }

  return Math.max(0, Math.min(count, props.totalBookmarks));
});

// 获取进度条颜色
function getProgressColor(filteredCount, totalCount) {
  const ratio = filteredCount / totalCount;
  if (ratio < 0.2) return '#d03050';
  if (ratio < 0.5) return '#f0a020';
  return '#18a058';
}

// 检查标签是否被选中
function isTagSelected(tag) {
  return formModel.tags.includes(tag);
}

// 切换标签选择状态
function toggleTag(tag) {
  if (isTagSelected(tag)) {
    removeTag(tag);
  } else {
    formModel.tags.push(tag);
  }
}

// 移除平台筛选
function removePlatform(platform) {
  formModel.platforms = formModel.platforms.filter(p => p !== platform);
}

// 移除标签筛选
function removeTag(tag) {
  formModel.tags = formModel.tags.filter(t => t !== tag);
}

// 获取平台显示标签
function getPlatformLabel(platform) {
  const option = platformOptions.find(p => p.value === platform);
  return option ? option.label : platform;
}

// 获取时间范围显示标签
function getTimeRangeLabel(timeRange) {
  const option = timeRangeOptions.find(t => t.value === timeRange);
  return option ? option.label : timeRange;
}

// 清除所有筛选条件
function clearFilters() {
  formModel.platforms = [];
  formModel.tags = [];
  formModel.timeRange = null;
  formModel.onlyStarred = false;
  formModel.hasDescription = false;
  formModel.hasTags = false;
  customDateRange.value = null;
}

// 保存为预设
function saveAsPreset() {
  if (!hasActiveFilters.value) {
    message.warning('请先添加筛选条件');
    return;
  }

  message.success('筛选预设保存成功');
  emit('save-preset', {
    platforms: formModel.platforms,
    tags: formModel.tags,
    timeRange: formModel.timeRange,
    onlyStarred: formModel.onlyStarred,
    hasDescription: formModel.hasDescription,
    hasTags: formModel.hasTags
  });
}

// 应用筛选
function applyFilters() {
  if (!hasActiveFilters.value) {
    message.warning('请先添加筛选条件');
    return;
  }

  isSubmitting.value = true;

  // 构建筛选条件
  const filters = [];

  // 添加平台筛选
  formModel.platforms.forEach(platform => {
    filters.push({
      type: 'platform',
      value: platform,
      label: `平台: ${getPlatformLabel(platform)}`
    });
  });

  // 添加标签筛选
  formModel.tags.forEach(tag => {
    filters.push({
      type: 'tag',
      value: tag,
      label: `标签: ${tag}`
    });
  });

  // 添加时间范围筛选
  if (formModel.timeRange) {
    filters.push({
      type: 'time',
      value: formModel.timeRange,
      label: `时间: ${getTimeRangeLabel(formModel.timeRange)}`
    });
  }

  // 添加收藏筛选
  if (formModel.onlyStarred) {
    filters.push({
      type: 'starred',
      value: 'true',
      label: '仅显示收藏'
    });
  }

  // 添加描述筛选
  if (formModel.hasDescription) {
    filters.push({
      type: 'hasDescription',
      value: 'true',
      label: '包含描述'
    });
  }

  // 添加标签筛选
  if (formModel.hasTags) {
    filters.push({
      type: 'hasTags',
      value: 'true',
      label: '已添加标签'
    });
  }

  // 模拟延迟提交
  setTimeout(() => {
    isSubmitting.value = false;
    emit('apply', filters);
  }, 300);
}

// 取消
function onCancel() {
  emit('cancel');
}
</script>

<style scoped>
.filter-form-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* 头部样式 */
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--divider-color);
}

.title-section {
  min-width: 180px;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text-color-base);
}

.filter-subtitle {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin: 0;
}

.stats-display {
  display: flex;
  gap: 12px;
}

.stats-item {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-item .label {
  color: var(--text-color-secondary);
}

.stats-item .value {
  font-weight: 600;
}

.stats-item .highlight {
  color: var(--primary-color);
}

/* 内容区域 */
.filter-content {
  margin-bottom: 16px;
}

/* 基础筛选网格 */
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 16px;
}

.platform-section {
  grid-column: 1 / 3;
}

.tags-section {
  grid-column: 1 / 2;
}

.time-section {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

.other-section {
  grid-column: 1 / 3;
  grid-row: 3 / 4;
}

/* 高级筛选网格 */
.advanced-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.tag-categories-section {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}

.custom-tags-section {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.advanced-time-section {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

/* 预览网格 */
.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 通用筛选区块样式 */
.filter-section {
  background-color: var(--card-color);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--divider-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  font-size: 14px;
}

.section-icon {
  color: var(--primary-color);
}

/* 平台选择样式 */
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 6px;
  background-color: var(--body-color);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--divider-color);
  text-align: center;
}

.platform-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.platform-item.selected {
  background: linear-gradient(to bottom, rgba(var(--primary-color-rgb), 0.08), rgba(var(--primary-color-rgb), 0.04));
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 标签样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-search-input {
  width: 120px;
  margin-left: auto;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 时间筛选样式 */
.time-filter-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-select {
  width: 100%;
}

/* 其他筛选样式 */
.other-filters {
  padding: 4px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 标签分类样式 */
.tag-categories {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-category {
  background-color: var(--body-color);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--divider-color);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--card-color);
  font-weight: 500;
  border-bottom: 1px dashed var(--divider-color);
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
}

/* 自定义标签选择样式 */
.custom-tags-select {
  width: 100%;
}

/* 日期选择器样式 */
.date-range-picker {
  width: 100%;
}

/* 预览样式 */
.preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-preview-section {
  background-color: var(--card-color);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--divider-color);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
}

.preview-icon {
  color: var(--primary-color);
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  transition: all 0.2s ease;
}

.preview-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 结果预览样式 */
.results-summary {
  margin-top: 8px;
  background-color: var(--primary-color-suppl);
  border: 1px dashed var(--primary-color);
  border-radius: 8px;
  padding: 12px;
}

.summary-header {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--primary-color);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-stats {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.summary-label {
  color: var(--text-color-secondary);
}

/* 空状态样式 */
.empty-tip {
  color: var(--text-color-secondary);
  margin-bottom: 12px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--divider-color);
}

.action-left, .action-right {
  display: flex;
  gap: 8px;
}

.save-preset-btn, .cancel-btn, .apply-btn {
  min-width: 90px;
}
</style>