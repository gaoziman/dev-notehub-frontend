<template>
  <div class="bookmark-form-container">
    <div class="form-header">
      <h2 class="form-title">{{ isEditMode ? '编辑书签' : '添加书签' }}</h2>
      <p class="form-subtitle">{{ isEditMode ? '更新您珍藏的网络资源' : '保存您发现的精彩网络内容' }}</p>
    </div>

    <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
        size="small"
    >
      <!-- 基本信息区域 -->
      <div class="form-section">
        <!-- URL输入区域 -->
        <n-form-item label="链接地址" path="url" required>
          <div class="url-input-container">
            <n-input
                v-model:value="formModel.url"
                type="url"
                placeholder="输入完整网址 (https://...)"
                clearable
                round
            >
              <template #prefix>
                <icon-font type="icon-link" />
              </template>
            </n-input>
            <n-button
                v-if="!isEditMode"
                type="primary"
                :disabled="!isValidUrl"
                :loading="isFetching"
                @click="fetchUrlInfo"
                class="fetch-button"
                size="small"
                round
                secondary
            >
              <template #icon>
                <icon-font type="icon-download" />
              </template>
              获取信息
            </n-button>
          </div>
        </n-form-item>

        <!-- 标题输入 -->
        <n-form-item label="书签标题" path="title" required>
          <n-input
              v-model:value="formModel.title"
              placeholder="给书签起个名字"
              clearable
              round
          >
            <template #prefix>
              <icon-font type="icon-bookmark" />
            </template>
          </n-input>
        </n-form-item>

        <!-- 描述输入 -->
        <n-form-item label="描述信息" path="description">
          <n-input
              v-model:value="formModel.description"
              type="textarea"
              placeholder="添加描述，帮助您日后快速了解书签内容"
              :autosize="{ minRows: 2, maxRows: 3 }"
              round
          />
        </n-form-item>
      </div>

      <n-divider style="margin: 8px 0;" />

      <!-- 分类、平台区域 -->
      <div class="categorization-section">
        <div class="cat-row">
          <!-- 分类选择 -->
          <n-form-item label="所属分类" path="category" required class="cat-item">
            <n-select
                v-model:value="formModel.category"
                placeholder="选择分类"
                :options="categoryOptions"
                clearable
                filterable
                size="small"
                round
            />
          </n-form-item>

          <!-- 平台选择 -->
          <n-form-item label="平台来源" path="platform" class="cat-item">
            <n-select
                v-model:value="formModel.platform"
                placeholder="选择平台"
                :options="platformOptions"
                clearable
                filterable
                size="small"
                round
            >
              <template #render-option="{ option }">
                <div class="platform-option">
                  <icon-font :type="option.icon" />
                  <span>{{ option.label }}</span>
                </div>
              </template>
            </n-select>
          </n-form-item>
        </div>
      </div>

      <!-- 标签区域 -->
      <n-form-item label="标签" path="tags">
        <div class="tags-input-wrapper">
          <div class="tags-input">
            <n-input
                v-model:value="tagInputValue"
                placeholder="输入标签后按回车添加"
                size="small"
                clearable
                @keydown.enter="addCustomTag"
            >
              <template #prefix>
                <icon-font type="icon-tag" />
              </template>
            </n-input>
            <span class="tags-count">{{ formModel.tags.length }}/10</span>
          </div>

          <div class="tags-pills-container">
            <div
                v-for="tag in commonTags"
                :key="tag"
                :class="['tag-pill', formModel.tags.includes(tag) ? 'selected' : '']"
                @click="toggleTag(tag)"
            >
              {{ tag }}
            </div>
          </div>

          <div v-if="formModel.tags.length > 0" class="selected-tags-container">
            <div class="selected-tags-label">已选标签:</div>
            <div class="selected-tags">
              <div
                  v-for="tag in formModel.tags"
                  :key="tag"
                  class="selected-tag"
              >
                {{ tag }}
                <icon-font
                    type="icon-close"
                    class="remove-tag"
                    @click.stop="removeTag(tag)"
                />
              </div>
            </div>
          </div>
        </div>
      </n-form-item>

      <n-divider style="margin: 8px 0;" />

      <!-- 底部选项区域 -->
      <div class="options-section">
        <div class="options-grid">
          <!-- 图标设置 -->
          <div class="icon-settings">
            <div class="section-title">
              <icon-font type="icon-picture" class="section-icon" />
              <span>图标设置</span>
            </div>
            <div class="icon-content">
              <div class="icon-preview">
                <img
                    v-if="formModel.icon"
                    :src="formModel.icon"
                    alt="图标预览"
                    @error="handleIconError"
                />
                <div v-else class="no-icon">
                  <icon-font type="icon-image" />
                </div>
              </div>
              <n-input
                  v-model:value="formModel.icon"
                  placeholder="输入图标URL或自动获取"
                  size="small"
                  clearable
                  round
                  style="width: 100%;"
              >
                <template #prefix>
                  <icon-font type="icon-link" />
                </template>
              </n-input>
            </div>
          </div>

          <!-- 其他设置 -->
          <div class="other-settings">
            <div class="section-title">
              <icon-font type="icon-setting" class="section-icon" />
              <span>其他设置</span>
            </div>
            <div class="checkboxes">
              <n-checkbox v-model:checked="formModel.isStarred">
                <div class="checkbox-label">
                  <icon-font type="icon-star-fill" :color="formModel.isStarred ? '#f0a020' : ''" />
                  <span>添加到星标书签</span>
                </div>
              </n-checkbox>
              <n-checkbox v-model:checked="formModel.isPublic">
                <div class="checkbox-label">
                  <icon-font type="icon-share" />
                  <span>公开书签</span>
                </div>
              </n-checkbox>
            </div>
          </div>
        </div>
      </div>
    </n-form>

    <!-- 表单操作按钮 -->
    <div class="form-actions">
      <n-button @click="handleCancel" size="small" round quaternary>取消</n-button>
      <n-button type="primary" @click="handleSubmit" :loading="isSubmitting" size="small" round>
        {{ isEditMode ? '保存修改' : '添加书签' }}
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useMessage } from 'naive-ui';
import IconFont from "@/components/common/IconFont.vue";

// 消息提示
const message = useMessage();

// 表单引用
const formRef = ref(null);

// 标签输入值
const tagInputValue = ref('');

// 加载状态
const isFetching = ref(false);
const isSubmitting = ref(false);

// 常用标签列表
const commonTags = [
  '前端',
  'Vue3',
  'React',
  'TypeScript',
  'JavaScript',
  'CSS',
  'HTML',
  'Java',
  'Python',
  'Node.js',
  'Docker',
  'Git',
  'MySQL',
  'MongoDB',
  'API'
];

// 组件属性
const props = defineProps({
  bookmark: {
    type: Object,
    default: () => null
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
  }
});

// 组件事件
const emit = defineEmits(['submit', 'cancel']);

// 编辑模式
const isEditMode = computed(() => !!props.bookmark);

// 平台选项
const platformOptions = computed(() => {
  return props.platforms.map(platform => ({
    label: platform.name,
    value: platform.id,
    icon: platform.icon
  }));
});

// 表单数据模型
const formModel = reactive({
  url: '',
  title: '',
  description: '',
  platform: null,
  category: null,
  tags: [],
  icon: '',
  isStarred: false,
  isPublic: false
});

// 表单验证规则
const rules = {
  url: [
    {
      required: true,
      message: '请输入链接URL',
      trigger: ['blur', 'input']
    },
    {
      validator(rule, value) {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch (e) {
          return false;
        }
      },
      message: '请输入有效的URL地址',
      trigger: ['blur', 'input']
    }
  ],
  title: [
    {
      required: true,
      message: '请输入书签标题',
      trigger: ['blur', 'input']
    }
  ],
  category: [
    {
      required: true,
      message: '请选择分类',
      trigger: ['blur', 'change']
    }
  ]
};

// URL 是否有效
const isValidUrl = computed(() => {
  try {
    if (!formModel.url) return false;
    new URL(formModel.url);
    return true;
  } catch (e) {
    return false;
  }
});

// 分类选项
const categoryOptions = computed(() => {
  return props.categories.map(category => ({
    label: category.name,
    value: category.id
  }));
});

// 初始化表单数据
const initFormData = () => {
  if (props.bookmark) {
    Object.keys(formModel).forEach(key => {
      if (key in props.bookmark) {
        formModel[key] = props.bookmark[key];
      }
    });
  } else {
    // 重置为默认值
    Object.assign(formModel, {
      url: '',
      title: '',
      description: '',
      platform: null,
      category: null,
      tags: [],
      icon: '',
      isStarred: false,
      isPublic: false
    });
  }
};

// 切换标签选择
const toggleTag = (tag) => {
  const index = formModel.tags.indexOf(tag);
  if (index === -1) {
    if (formModel.tags.length < 10) {
      formModel.tags.push(tag);
    } else {
      message.warning('最多只能添加10个标签');
    }
  } else {
    formModel.tags.splice(index, 1);
  }
};

// 添加自定义标签
const addCustomTag = (e) => {
  e.preventDefault();

  if (!tagInputValue.value.trim()) return;

  const tag = tagInputValue.value.trim();

  if (formModel.tags.includes(tag)) {
    message.warning('该标签已添加');
  } else if (formModel.tags.length >= 10) {
    message.warning('最多只能添加10个标签');
  } else {
    formModel.tags.push(tag);
    tagInputValue.value = '';
  }
};

// 移除标签
const removeTag = (tag) => {
  const index = formModel.tags.indexOf(tag);
  if (index !== -1) {
    formModel.tags.splice(index, 1);
  }
};

// 从 URL 获取信息
const fetchUrlInfo = async () => {
  if (!isValidUrl.value) {
    message.warning('请输入有效的URL地址');
    return;
  }

  isFetching.value = true;

  try {
    // 实际项目中，这里应该调用后端API获取URL的元数据
    // 这里使用模拟数据演示
    setTimeout(() => {
      // 模拟获取数据
      const url = new URL(formModel.url);
      const domain = url.hostname;

      // 根据域名自动识别平台
      let platform = null;
      if (domain.includes('github.com')) {
        platform = 'github';
      } else if (domain.includes('juejin.cn')) {
        platform = 'juejin';
      } else if (domain.includes('zhihu.com')) {
        platform = 'zhihu';
      } else if (domain.includes('csdn.net')) {
        platform = 'csdn';
      }

      // 设置模拟数据
      formModel.title = formModel.title || `来自 ${domain} 的内容`;
      formModel.platform = platform;
      formModel.icon = formModel.icon || `https://${domain}/favicon.ico`;

      message.success('已获取URL信息');
      isFetching.value = false;
    }, 1000);
  } catch (error) {
    console.error('获取URL信息失败', error);
    message.error('获取URL信息失败');
    isFetching.value = false;
  }
};

// 处理图标加载错误
const handleIconError = (e) => {
  e.target.src = '/favicon.ico';
};

// 处理提交
const handleSubmit = (e) => {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('表单验证失败，请检查输入');
      return;
    }

    isSubmitting.value = true;

    try {
      // 收集表单数据
      const formData = { ...formModel };

      // 添加ID（如果是编辑模式）
      if (isEditMode.value && props.bookmark) {
        formData.id = props.bookmark.id;
      }

      // 发送数据
      emit('submit', formData);

      isSubmitting.value = false;
    } catch (error) {
      console.error('提交表单失败', error);
      message.error('提交失败，请重试');
      isSubmitting.value = false;
    }
  });
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
};

// 初始化
onMounted(() => {
  initFormData();
});

// 监听 bookmark 变化
watch(() => props.bookmark, () => {
  initFormData();
}, { deep: true });
</script>

<style scoped>
.bookmark-form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-header {
  text-align: center;
  margin-bottom: 12px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color-base);
}

.form-subtitle {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin: 4px 0 0 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url-input-container {
  display: flex;
  gap: 8px;
}

.url-input-container .n-input {
  flex: 1;
}

.fetch-button {
  white-space: nowrap;
}

.categorization-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cat-row {
  display: flex;
  gap: 12px;
}

.cat-item {
  flex: 1;
}

/* 标签输入设计 */
.tags-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tags-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tags-input .n-input {
  flex: 1;
}

.tags-count {
  font-size: 12px;
  color: var(--text-color-tertiary);
  white-space: nowrap;
}

/* 药丸式标签样式 */
.tags-pills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
  padding: 12px;
  background-color: var(--body-color);
  border-radius: 8px;
}

.tag-pill {
  padding: 6px 16px;
  background-color: #f5f7fa;
  color: var(--text-color-secondary);
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tag-pill:hover {
  background-color: var(--primary-color-suppl);
  color: var(--primary-color);
}

.tag-pill.selected {
  background-color: var(--primary-color);
  color: white;
}

/* 已选标签显示 */
.selected-tags-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.selected-tags-label {
  font-size: 13px;
  color: var(--text-color-secondary);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: var(--primary-color-suppl);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 12px;
}

.remove-tag {
  font-size: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-tag:hover {
  opacity: 1;
}

.options-section {
  margin-top: 4px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color-base);
}

.section-icon {
  color: var(--primary-color);
  font-size: 14px;
}

.icon-settings, .other-settings {
  display: flex;
  flex-direction: column;
}

.icon-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.icon-preview {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color-light);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--text-color-tertiary);
  font-size: 20px;
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.platform-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--divider-color);
}

@media (max-width: 600px) {
  .cat-row {
    flex-direction: column;
    gap: 8px;
  }

  .options-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>