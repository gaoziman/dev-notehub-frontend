<template>
  <div class="add-bookmark-form">
    <div class="form-header">
      <div class="form-title">
        <icon-font type="icon-bookmark-add" class="title-icon" />
        <h2>添加书签</h2>
      </div>
    </div>

    <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="0"
        require-mark-placement="right-hanging"
        class="form-content"
    >
      <!-- 双列基本信息区域 -->
      <div class="main-form-grid">
        <!-- 左侧列：基本信息 -->
        <div class="form-column">
          <n-form-item path="title" class="form-field">
            <n-input
                v-model:value="formModel.title"
                placeholder="书签标题"
                clearable
                :maxlength="100"
                show-count
            >
              <template #prefix>
                <icon-font type="icon-title" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="url" class="form-field">
            <n-input
                v-model:value="formModel.url"
                placeholder="输入网址"
                clearable
                :maxlength="500"
            >
              <template #prefix>
                <n-text class="text-tertiary">https://</n-text>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="description" class="form-field">
            <n-input
                v-model:value="formModel.description"
                type="textarea"
                placeholder="添加描述..."
                clearable
                :maxlength="500"
                show-count
                :autosize="{ minRows: 2, maxRows: 3 }"
            />
          </n-form-item>
        </div>

        <!-- 右侧列：平台和收藏区域 -->
        <div class="form-column right-column">
          <!-- 平台选择 -->
          <div class="platform-section">
            <div class="section-label">选择平台</div>
            <div class="platform-grid">
              <div
                  v-for="platform in platformOptions"
                  :key="platform.value"
                  class="platform-item"
                  :class="{ active: formModel.platform === platform.value }"
                  @click="selectPlatform(platform.value)"
              >
                <icon-font :type="getPlatformIcon(platform.value)" />
                <span class="platform-label">{{ platform.label }}</span>
              </div>
            </div>
          </div>

          <!-- 收藏选项 -->
          <div class="star-option">
            <n-form-item path="starred" class="star-field">
              <n-switch v-model:value="formModel.starred">
                <template #checked>
                  <n-text class="switch-label">
                    <icon-font type="icon-star-filled" color="#f0a020" />
                    <span>已收藏</span>
                  </n-text>
                </template>
                <template #unchecked>
                  <n-text class="switch-label">
                    <icon-font type="icon-star" />
                    <span>未收藏</span>
                  </n-text>
                </template>
              </n-switch>
            </n-form-item>
          </div>
        </div>
      </div>

      <!-- 标签区域 -->
      <div class="tags-section">
        <n-form-item path="tags">
          <n-dynamic-tags
              v-model:value="formModel.tags"
              :max="10"
              class="tags-input"
              :input-props="{ placeholder: '添加标签 (回车确认)' }"
          />
        </n-form-item>

        <div class="tags-nav">
          <div class="tags-categories">
            <div
                v-for="(category, index) in tagCategories"
                :key="category.name"
                class="category-tab"
                :class="{ active: activeTagCategory === index }"
                @click="activeTagCategory = index"
            >
              <icon-font :type="category.icon" />
              <span>{{ category.name }}</span>
            </div>
          </div>

          <div class="suggested-tags-container">
            <n-tag
                v-for="tag in filteredSuggestedTags"
                :key="tag"
                size="small"
                class="suggested-tag"
                :style="getTagStyle(tag)"
                @click="addTag(tag)"
            >
              {{ tag }}
              <template #icon>
                <icon-font :type="!formModel.tags.includes(tag) ? 'icon-plus' : 'icon-check'" :size="12" />
              </template>
            </n-tag>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <n-button @click="onCancel">取消</n-button>
        <n-button type="primary" @click="onSubmit" :loading="submitting">
          <template #icon>
            <icon-font type="icon-save" />
          </template>
          保存书签
        </n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits, computed } from 'vue';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const emit = defineEmits(['submit', 'cancel']);
const message = useMessage();
const formRef = ref(null);
const submitting = ref(false);
const activeTagCategory = ref(0);

// 表单数据模型
const formModel = reactive({
  title: '',
  url: '',
  description: '',
  tags: [],
  platform: null,
  starred: false
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入书签标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入书签URL', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (!value) return true;
        // 简单URL验证
        const regex = /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
        return regex.test(value) || regex.test('https://' + value);
      },
      message: '请输入有效的URL',
      trigger: 'blur'
    }
  ],
  description: [
    { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
  ]
};

// 平台选项
const platformOptions = [
  { label: 'GitHub', value: 'github' },
  { label: '掘金', value: 'juejin' },
  { label: 'CSDN', value: 'csdn' },
  { label: '微信', value: 'wechat' },
  { label: '博客', value: 'blog' },
  { label: '知乎', value: 'zhihu' },
  { label: '其他', value: 'other' }
];

// 标签分类
const tagCategories = [
  {
    name: '编程语言',
    icon: 'icon-code',
    tags: ['Java', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'C++']
  },
  {
    name: '前端',
    icon: 'icon-web',
    tags: ['Vue', 'React', 'Angular', 'HTML', 'CSS', 'Webpack', 'Vite']
  },
  {
    name: '后端',
    icon: 'icon-server',
    tags: ['Spring', 'SpringBoot', 'Node.js', 'Express', 'Django', 'Laravel']
  },
  {
    name: '数据库',
    icon: 'icon-database',
    tags: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'ElasticSearch']
  },
  {
    name: '架构',
    icon: 'icon-cluster',
    tags: ['微服务', '架构', '分布式', '高并发', '高可用', '性能优化']
  },
  {
    name: '云原生',
    icon: 'icon-cloud',
    tags: ['Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Serverless']
  }
];

// 根据当前选中的分类过滤标签
const filteredSuggestedTags = computed(() => {
  return tagCategories[activeTagCategory.value]?.tags || [];
});

// 标签颜色映射
const tagColorMap = {
  // 编程语言
  'Java': { color: '#2080f0', borderColor: '#2080f0' },
  'JavaScript': { color: '#f0a020', borderColor: '#f0a020' },
  'TypeScript': { color: '#3178c6', borderColor: '#3178c6' },
  'Python': { color: '#3572A5', borderColor: '#3572A5' },
  'Go': { color: '#00ADD8', borderColor: '#00ADD8' },
  'Rust': { color: '#dea584', borderColor: '#dea584' },
  'C++': { color: '#f34b7d', borderColor: '#f34b7d' },

  // 前端框架
  'Vue': { color: '#4FC08D', borderColor: '#4FC08D' },
  'React': { color: '#61DAFB', borderColor: '#61DAFB' },
  'Angular': { color: '#DD0031', borderColor: '#DD0031' },
  'HTML': { color: '#E34F26', borderColor: '#E34F26' },
  'CSS': { color: '#1572B6', borderColor: '#1572B6' },
  'Webpack': { color: '#8DD6F9', borderColor: '#8DD6F9' },
  'Vite': { color: '#646CFF', borderColor: '#646CFF' },

  // 后端框架
  'Spring': { color: '#6DB33F', borderColor: '#6DB33F' },
  'SpringBoot': { color: '#6DB33F', borderColor: '#6DB33F' },
  'Node.js': { color: '#339933', borderColor: '#339933' },
  'Express': { color: '#000000', borderColor: '#000000' },
  'Django': { color: '#092E20', borderColor: '#092E20' },
  'Laravel': { color: '#FF2D20', borderColor: '#FF2D20' },

  // 数据库
  'MySQL': { color: '#4479A1', borderColor: '#4479A1' },
  'PostgreSQL': { color: '#336791', borderColor: '#336791' },
  'MongoDB': { color: '#47A248', borderColor: '#47A248' },
  'Redis': { color: '#DC382D', borderColor: '#DC382D' },
  'ElasticSearch': { color: '#005571', borderColor: '#005571' },
  'Oracle': { color: '#F80000', borderColor: '#F80000' },

  // 架构相关
  '微服务': { color: '#8a2be2', borderColor: '#8a2be2' },
  '架构': { color: '#8a2be2', borderColor: '#8a2be2' },
  '分布式': { color: '#8a2be2', borderColor: '#8a2be2' },
  '高并发': { color: '#8a2be2', borderColor: '#8a2be2' },
  '高可用': { color: '#8a2be2', borderColor: '#8a2be2' },
  '性能优化': { color: '#f0a020', borderColor: '#f0a020' },
  '设计模式': { color: '#8a2be2', borderColor: '#8a2be2' },

  // 云与容器
  '云原生': { color: '#326CE5', borderColor: '#326CE5' },
  'Docker': { color: '#2496ED', borderColor: '#2496ED' },
  'Kubernetes': { color: '#326CE5', borderColor: '#326CE5' },
  'DevOps': { color: '#326CE5', borderColor: '#326CE5' },
  'CI/CD': { color: '#326CE5', borderColor: '#326CE5' }
};

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
  };

  return iconMap[platform] || 'icon-link1';
}

// 获取标签样式
function getTagStyle(tag) {
  const colorInfo = tagColorMap[tag];
  const isSelected = formModel.tags.includes(tag);

  if (colorInfo) {
    return {
      borderColor: colorInfo.borderColor,
      color: isSelected ? '#ffffff' : colorInfo.color,
      backgroundColor: isSelected ? colorInfo.color : `${colorInfo.color}10`,
    };
  }
  return {};
}

// 选择平台
function selectPlatform(platform) {
  formModel.platform = platform;
}

// 添加标签
function addTag(tag) {
  if (!formModel.tags.includes(tag)) {
    if (formModel.tags.length < 10) {
      formModel.tags.push(tag);
    } else {
      message.warning('最多只能添加10个标签');
    }
  } else {
    formModel.tags = formModel.tags.filter(t => t !== tag);
  }
}

// 自动检测平台
function detectPlatform(url) {
  if (!url) return null;

  if (url.includes('github')) return 'github';
  if (url.includes('juejin')) return 'juejin';
  if (url.includes('csdn')) return 'csdn';
  if (url.includes('weixin') || url.includes('wechat')) return 'wechat';
  if (url.includes('zhihu')) return 'zhihu';
  if (url.includes('blog') || url.includes('cnblogs')) return 'blog';

  return null;
}

// 自动填充表单（如果从浏览器扩展等导入）
function autoFillForm(data) {
  if (data.title) formModel.title = data.title;
  if (data.url) {
    formModel.url = data.url.replace(/^https?:\/\//, '');
    // 自动检测平台
    const platform = detectPlatform(data.url);
    if (platform) formModel.platform = platform;
  }
  if (data.description) formModel.description = data.description;
  if (data.tags && Array.isArray(data.tags)) formModel.tags = data.tags;
}

// 提交表单
function onSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      submitting.value = true;

      // 确保URL格式正确
      let url = formModel.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // 构建提交数据
      const submitData = {
        title: formModel.title,
        url: url,
        description: formModel.description,
        tags: formModel.tags,
        platform: formModel.platform,
        starred: formModel.starred
      };

      // 模拟API请求延迟
      setTimeout(() => {
        emit('submit', submitData);
        submitting.value = false;
      }, 300);
    } else {
      message.error('请填写正确的表单信息');
    }
  });
}

// 取消
function onCancel() {
  emit('cancel');
}

// 暴露方法给父组件
defineExpose({
  autoFillForm
});
</script>

<style scoped>
.add-bookmark-form {
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
}

/* 表单头部样式 */
.form-header {
  margin-bottom: 16px;
  text-align: center;
}

.form-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  font-size: 22px;
  color: var(--primary-color);
}

.form-title h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color-base);
}

/* 表单布局 */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 双列主表单布局 */
.main-form-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  width: 100%;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  margin-bottom: 0;
}

/* 平台选择区域 */
.platform-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-base);
  margin-bottom: 4px;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 6px;
  background-color: var(--body-color);
  border: 1px solid var(--divider-color);
  cursor: pointer;
  transition: all 0.2s ease;
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

/* 收藏选项 */
.star-option {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.star-field {
  margin-bottom: 0;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 标签区域 */
.tags-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--divider-color);
  padding-top: 16px;
}

.tags-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tags-categories::-webkit-scrollbar {
  display: none;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: var(--body-color);
  border: 1px solid var(--divider-color);
  cursor: pointer;
  white-space: nowrap;
  font-size: 12px;
  transition: all 0.2s ease;
}

.category-tab:hover {
  background-color: var(--hover-color);
}

.category-tab.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.suggested-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 100px;
  overflow-y: auto;
  padding: 4px;
}

.suggested-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
}

.suggested-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 操作按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--divider-color);
}

/* 辅助类 */
.text-tertiary {
  color: var(--text-color-tertiary);
}

/* NaiveUI自定义样式 */
:deep(.n-dynamic-tags) {
  max-width: 100%;
}

:deep(.n-dynamic-tags .n-tag) {
  margin-bottom: 4px;
}

:deep(.n-form-item-feedback-wrapper) {
  min-height: 18px;
}

:deep(.n-input) {
  border-radius: 6px;
}

:deep(.n-tag) {
  transition: all 0.2s ease;
}

:deep(.n-form-item-blank) {
  flex-grow: 1;
}

@media (max-width: 768px) {
  .main-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>