<template>
  <div class="batch-editor">
    <n-tabs v-model:value="activeTab">
      <n-tab-pane name="tags" tab="批量添加标签">
        <div class="editor-content">
          <div class="editor-description">
            <p>为选中的 <strong>{{ selectedCount }}</strong> 个书签添加标签，不会覆盖已有标签</p>
          </div>

          <n-divider />

          <n-form
              label-placement="left"
              label-width="80"
              ref="tagsFormRef"
          >
            <n-form-item label="标签" required>
              <n-dynamic-tags
                  v-model:value="selectedTags"
                  :max="10"
                  :options="tagOptions"
                  placeholder="输入后回车添加标签"
              />
              <span class="helper-text">最多可添加10个标签</span>
            </n-form-item>

            <div class="popular-tags" v-if="popularTags.length > 0">
              <span class="tags-title">常用标签：</span>
              <div class="tags-list">
                <n-tag
                    v-for="tag in popularTags"
                    :key="tag"
                    size="small"
                    round
                    clickable
                    @click="addTag(tag)"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </div>
          </n-form>
        </div>
      </n-tab-pane>

      <n-tab-pane name="category" tab="移动到分类">
        <div class="editor-content">
          <div class="editor-description">
            <p>将选中的 <strong>{{ selectedCount }}</strong> 个书签移动到指定分类，将覆盖原有分类</p>
          </div>

          <n-divider />

          <n-form
              label-placement="left"
              label-width="80"
              ref="categoryFormRef"
          >
            <n-form-item label="分类" required>
              <n-select
                  v-model:value="selectedCategory"
                  placeholder="请选择分类"
                  :options="categoryOptions"
                  clearable
              />
            </n-form-item>

            <div class="quick-categories">
              <span class="categories-title">快速选择：</span>
              <div class="categories-list">
                <n-tag
                    v-for="category in props.categories"
                    :key="category.id"
                    size="small"
                    round
                    :type="selectedCategory === category.id ? 'primary' : 'default'"
                    clickable
                    @click="selectedCategory = category.id"
                >
                  {{ category.name }}
                </n-tag>
              </div>
            </div>
          </n-form>
        </div>
      </n-tab-pane>

      <n-tab-pane name="platform" tab="设置平台">
        <div class="editor-content">
          <div class="editor-description">
            <p>为选中的 <strong>{{ selectedCount }}</strong> 个书签设置平台，将覆盖原有平台设置</p>
          </div>

          <n-divider />

          <n-form
              label-placement="left"
              label-width="80"
              ref="platformFormRef"
          >
            <n-form-item label="平台" required>
              <n-select
                  v-model:value="selectedPlatform"
                  placeholder="请选择平台"
                  :options="platformOptions"
                  clearable
              >
                <template #render-label="{ option }">
                  <div class="platform-option">
                    <icon-font :type="option.icon" :size="16" />
                    <span>{{ option.label }}</span>
                  </div>
                </template>
              </n-select>
            </n-form-item>

            <div class="platform-buttons">
              <n-space>
                <n-button
                    v-for="platform in props.platforms"
                    :key="platform.id"
                    :type="selectedPlatform === platform.id ? 'primary' : 'default'"
                    @click="selectedPlatform = platform.id"
                >
                  <template #icon>
                    <icon-font :type="platform.icon" :size="16" />
                  </template>
                  {{ platform.name }}
                </n-button>
              </n-space>
            </div>
          </n-form>
        </div>
      </n-tab-pane>
    </n-tabs>

    <div class="editor-footer">
      <n-space>
        <n-button @click="$emit('cancel')">取消</n-button>
        <n-button type="primary" :disabled="!isValid" @click="handleSubmit">
          应用修改
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 组件属性
const props = defineProps({
  selectedCount: {
    type: Number,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  platforms: {
    type: Array,
    default: () => []
  },
  popularTags: {
    type: Array,
    default: () => []
  }
});

// 组件事件
const emit = defineEmits(['submit', 'cancel']);

// 当前激活的标签页
const activeTab = ref('tags');

// 表单引用
const tagsFormRef = ref(null);
const categoryFormRef = ref(null);
const platformFormRef = ref(null);

// 选中的数据
const selectedTags = ref([]);
const selectedCategory = ref(null);
const selectedPlatform = ref(null);

// 标签选项
const tagOptions = computed(() => {
  return props.tags.map(tag => ({
    label: tag,
    value: tag
  }));
});

// 分类选项
const categoryOptions = computed(() => {
  return props.categories.map(category => ({
    label: category.name,
    value: category.id
  }));
});

// 平台选项
const platformOptions = computed(() => {
  return props.platforms.map(platform => ({
    label: platform.name,
    value: platform.id,
    icon: platform.icon
  }));
});

// 表单是否有效
const isValid = computed(() => {
  if (activeTab.value === 'tags') {
    return selectedTags.value.length > 0;
  } else if (activeTab.value === 'category') {
    return !!selectedCategory.value;
  } else if (activeTab.value === 'platform') {
    return !!selectedPlatform.value;
  }
  return false;
});

// 添加标签
const addTag = (tag) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag);
  }
};

// 处理提交
const handleSubmit = () => {
  // 根据当前激活的标签页确定提交的数据类型和内容
  let data = {
    type: activeTab.value
  };

  if (activeTab.value === 'tags') {
    data.tags = selectedTags.value;
  } else if (activeTab.value === 'category') {
    data.category = selectedCategory.value;
  } else if (activeTab.value === 'platform') {
    data.platform = selectedPlatform.value;
  }

  emit('submit', data);
};
</script>

<style scoped>
.batch-editor {
  padding: 0;
}

.editor-content {
  padding: 16px 0;
}

.editor-description {
  margin-bottom: 16px;
  color: var(--text-color-secondary);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--divider-color);
}

.helper-text {
  font-size: 12px;
  color: var(--text-color-tertiary);
  margin-top: 4px;
}

.popular-tags, .quick-categories {
  margin-top: 16px;
}

.tags-title, .categories-title {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-right: 8px;
}

.tags-list, .categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.platform-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-buttons {
  margin-top: 16px;
}
</style>