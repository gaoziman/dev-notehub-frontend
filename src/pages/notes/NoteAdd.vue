<template>
  <div>
    <!-- 添加笔记按钮 -->
    <a-button v-if="showButton" type="primary" @click="showAddNoteModal">
      <template #icon><plus-outlined /></template>
      添加笔记
    </a-button>

    <!-- 添加笔记模态框 -->
    <a-modal
        v-model:open="addNoteModalVisible"
        title="添加笔记"
        width="700px"
        :maskClosable="false"
        @cancel="closeModal"
        :destroyOnClose="true"
    >
      <a-form
          ref="formRef"
          :model="formState"
          :rules="formRules"
          layout="vertical"
      >
        <!-- 基本信息 -->
        <a-row :gutter="24">
          <a-col :span="16">
            <!-- 笔记标题 -->
            <a-form-item name="title" label="笔记标题" required>
              <a-input
                  v-model:value="formState.title"
                  placeholder="输入笔记标题"
                  :maxLength="100"
                  show-count
              />
            </a-form-item>

            <!-- 笔记描述 -->
            <a-form-item name="description" label="笔记描述">
              <a-textarea
                  v-model:value="formState.description"
                  placeholder="简要描述此笔记的内容和学习目标..."
                  :auto-size="{ minRows: 3, maxRows: 6 }"
                  :maxLength="500"
                  show-count
              />
            </a-form-item>

            <!-- 内容类型选择 -->
            <a-form-item name="contentType" label="内容类型" required>
              <a-radio-group v-model:value="formState.contentType">
                <a-radio-button value="markdown">
                  <file-markdown-outlined /> Markdown
                </a-radio-button>
                <a-radio-button value="pdf">
                  <file-pdf-outlined /> PDF文件
                </a-radio-button>
                <a-radio-button value="link">
                  <link-outlined /> 外部链接
                </a-radio-button>
              </a-radio-group>
            </a-form-item>

            <!-- 根据内容类型显示不同的输入区域 -->
            <div v-if="formState.contentType === 'markdown'">
              <a-form-item name="markdownContent" label="Markdown内容" required>
                <a-textarea
                    v-model:value="formState.markdownContent"
                    placeholder="使用Markdown编写笔记内容..."
                    :auto-size="{ minRows: 8, maxRows: 12 }"
                />
              </a-form-item>
            </div>

            <div v-else-if="formState.contentType === 'pdf'">
              <a-form-item name="pdfFile" label="上传PDF文件" required>
                <div
                    class="upload-area"
                    @click="triggerFileUpload"
                    @dragover.prevent="onDragOver"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onDrop"
                    :class="{ 'drag-active': isDragging }"
                >
                  <div v-if="!selectedFileInfo.name" class="upload-placeholder">
                    <file-pdf-outlined class="upload-icon" />
                    <p>点击或拖拽PDF文件到此处</p>
                    <p class="upload-hint">最大支持20MB</p>
                  </div>
                  <div v-else class="file-info">
                    <file-pdf-outlined class="file-icon" />
                    <div class="file-details">
                      <div class="file-name">{{ selectedFileInfo.name }}</div>
                      <div class="file-size">{{ formatFileSize(selectedFileInfo.size) }}</div>
                    </div>
                    <a-button
                        type="text"
                        danger
                        @click.stop="clearSelectedFile"
                    >
                      <template #icon><delete-outlined /></template>
                    </a-button>
                  </div>
                  <input
                      ref="fileInputRef"
                      type="file"
                      accept=".pdf"
                      style="display: none"
                      @change="onFileSelected"
                  />
                </div>
              </a-form-item>
            </div>

            <div v-else-if="formState.contentType === 'link'">
              <a-form-item name="externalLink" label="外部链接" required>
                <a-input
                    v-model:value="formState.externalLink"
                    placeholder="输入外部资源链接 (http:// 或 https://)"
                >
                  <template #prefix>
                    <link-outlined />
                  </template>
                </a-input>
              </a-form-item>
            </div>
          </a-col>

          <a-col :span="8">
            <!-- 分类 -->
            <a-form-item name="category" label="所属分类" required>
              <a-select
                  v-model:value="formState.category"
                  placeholder="选择笔记分类"
                  :options="categoryOptions"
                  show-search
              >
                <template #dropdownRender="{ menuNode }">
                  <div>
                    {{ menuNode }}
                    <a-divider style="margin: 4px 0" />
                    <div class="add-category-btn" @click="addCategoryMode = true">
                      <plus-outlined /> 添加新分类
                    </div>
                    <div v-if="addCategoryMode" class="add-category-input">
                      <a-input
                          v-model:value="newCategory"
                          placeholder="输入新分类名称"
                          @keydown.enter="addNewCategory"
                          ref="newCategoryInputRef"
                      />
                      <a-button type="primary" size="small" @click="addNewCategory">添加</a-button>
                    </div>
                  </div>
                </template>
              </a-select>
            </a-form-item>

            <!-- 标签 -->
            <a-form-item name="tags" label="标签">
              <a-select
                  v-model:value="formState.tags"
                  mode="tags"
                  placeholder="输入标签，回车确认"
                  style="width: 100%"
                  :maxTagCount="5"
              />
              <div class="tag-suggestions">
                <span>常用标签:</span>
                <div class="suggestions-list">
                  <a-tag
                      v-for="tag in commonTags.slice(0, 5)"
                      :key="tag.name"
                      :color="tag.color"
                      class="tag-item"
                      @click="addTag(tag.name)"
                  >
                    #{{ tag.name }}
                  </a-tag>
                </div>
              </div>
            </a-form-item>

            <!-- 学习状态 -->
            <a-form-item name="status" label="学习状态">
              <a-select
                  v-model:value="formState.status"
                  placeholder="选择学习状态"
              >
                <a-select-option value="未开始">未开始</a-select-option>
                <a-select-option value="进行中">进行中</a-select-option>
                <a-select-option value="已完成">已完成</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 学习进度 -->
            <a-form-item name="progress" label="学习进度">
              <a-slider
                  v-model:value="formState.progress"
                  :disabled="formState.status === '未开始'"
                  :marks="{
                  0: '0%',
                  100: '100%'
                }"
              />
            </a-form-item>

            <!-- 重要性 -->
            <a-form-item name="importance" label="重要性">
              <a-rate v-model:value="formState.importance" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <template #footer>
        <a-button @click="closeModal">取消</a-button>
        <a-button
            type="primary"
            :loading="submitting"
            @click="submitForm"
        >
          确认添加
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, reactive, nextTick, defineProps, defineEmits, defineExpose, onUnmounted, onMounted} from 'vue';
import { message } from 'ant-design-vue';
import eventBus from '@/utils/eventBus';
import {
  PlusOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  LinkOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';

// 定义属性和事件
const props = defineProps({
  showButton: {
    type: Boolean,
    default: false
  }
});


// 模态框显示状态
const addNoteModalVisible = ref(false);

// 表单引用
const formRef = ref(null);
const fileInputRef = ref(null);
const newCategoryInputRef = ref(null);

// PDF上传相关状态 - 使用安全方式存储文件信息，避免循环引用
const selectedFileInfo = ref({ name: '', size: 0, type: '' });
const originalFile = ref(null); // 单独存储原始文件对象
const isDragging = ref(false);

// 提交状态
const submitting = ref(false);

// 分类相关
const addCategoryMode = ref(false);
const newCategory = ref('');

// 初始化表单状态
const formState = reactive({
  title: '',
  description: '',
  contentType: 'markdown',
  markdownContent: '',
  externalLink: '',
  category: '',
  tags: [],
  status: '未开始',
  progress: 0,
  importance: 3
});

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入笔记标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  contentType: [
    { required: true, message: '请选择内容类型', trigger: 'change' }
  ],
  markdownContent: [
    {
      required: true,
      message: '请输入Markdown内容',
      trigger: 'blur',
      validator: (rule, value) => {
        if (formState.contentType === 'markdown' && (!value || value.trim() === '')) {
          return Promise.reject('请输入Markdown内容');
        }
        return Promise.resolve();
      }
    }
  ],
  externalLink: [
    {
      required: true,
      message: '请输入有效的外部链接',
      trigger: 'blur',
      validator: (rule, value) => {
        if (formState.contentType === 'link') {
          if (!value) {
            return Promise.reject('请输入外部链接');
          }
          // 简单URL验证
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
          if (!urlPattern.test(value)) {
            return Promise.reject('请输入有效的URL地址');
          }
        }
        return Promise.resolve();
      }
    }
  ],
  category: [
    { required: true, message: '请选择笔记分类', trigger: 'change' }
  ],
  pdfFile: [
    {
      validator: (rule, value) => {
        if (formState.contentType === 'pdf' && !selectedFileInfo.value.name) {
          return Promise.reject('请上传PDF文件');
        }
        return Promise.resolve();
      },
      required: true,
      message: '请上传PDF文件',
      trigger: 'change'
    }
  ]
};

// 常用数据
const categoryOptions = [
  { value: 'java', label: 'Java基础' },
  { value: 'spring', label: 'Spring系列' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'redis', label: 'Redis' },
  { value: 'message-queue', label: '消息队列' }
];

const commonTags = [
  { name: 'Java', color: 'blue' },
  { name: 'Spring', color: 'green' },
  { name: 'Redis', color: 'red' },
  { name: 'MySQL', color: 'orange' },
  { name: '微服务', color: 'purple' },
  { name: '并发', color: 'cyan' },
  { name: '分布式', color: 'pink' }
];

// ---------- 方法 ----------
// 显示模态框
const showAddNoteModal = () => {
  addNoteModalVisible.value = true;
};

// 关闭模态框
const closeModal = () => {
  addNoteModalVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  // 重置普通表单字段
  Object.assign(formState, {
    title: '',
    description: '',
    contentType: 'markdown',
    markdownContent: '',
    externalLink: '',
    category: '',
    tags: [],
    status: '未开始',
    progress: 0,
    importance: 3
  });

  // 重置文件选择
  selectedFileInfo.value = { name: '', size: 0, type: '' };
  originalFile.value = null;

  // 重置分类添加状态
  addCategoryMode.value = false;
  newCategory.value = '';

  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// ---------- PDF文件处理 ----------
// 触发文件选择
const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

// 文件选择事件处理
const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (file && validateFile(file)) {
    // 安全地存储文件信息，避免循环引用
    selectedFileInfo.value = {
      name: file.name,
      size: file.size,
      type: file.type
    };
    // 单独存储原始文件对象，用于后续处理
    originalFile.value = file;
  }
  // 重置input使同一文件可以重复选择
  e.target.value = '';
};

// 拖拽事件处理
const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file && validateFile(file)) {
    // 安全地存储文件信息
    selectedFileInfo.value = {
      name: file.name,
      size: file.size,
      type: file.type
    };
    // 单独存储原始文件对象
    originalFile.value = file;
  }
};

// 验证文件
const validateFile = (file) => {
  const isPdf = file.type === 'application/pdf';
  const isLt20M = file.size / 1024 / 1024 < 20;

  if (!isPdf) {
    message.error('只能上传PDF文件!');
    return false;
  }
  if (!isLt20M) {
    message.error('文件大小不能超过20MB!');
    return false;
  }
  return true;
};

// 清除已选文件
const clearSelectedFile = (e) => {
  e.stopPropagation(); // 阻止冒泡
  selectedFileInfo.value = { name: '', size: 0, type: '' };
  originalFile.value = null;
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

// ---------- 分类处理 ----------
// 添加新分类
const addNewCategory = () => {
  if (newCategory.value.trim()) {
    const value = `custom-${Date.now()}`;
    categoryOptions.push({
      value,
      label: newCategory.value.trim()
    });
    formState.category = value;
    newCategory.value = '';
    addCategoryMode.value = false;
    message.success('新分类添加成功');
  } else {
    message.warning('请输入分类名称');
  }
};

// ---------- 标签处理 ----------
// 添加标签
const addTag = (tagName) => {
  if (!formState.tags.includes(tagName)) {
    formState.tags.push(tagName);
  }
};

// ---------- 表单提交 ----------
// 提交表单
const submitForm = () => {
  formRef.value.validate()
      .then(() => {
        submitting.value = true;

        // 创建一个简单的数据对象
        const safeData = {
          id: `note-${Date.now()}`, // 生成唯一ID
          title: formState.title,
          description: formState.description,
          contentType: formState.contentType,
          category: getCategoryLabel(formState.category),
          categoryValue: formState.category,
          tags: [...formState.tags],
          status: formState.status,
          progress: formState.progress,
          importance: formState.importance
        };

        // 根据内容类型添加特定字段
        if (formState.contentType === 'markdown') {
          safeData.content = formState.markdownContent;
        } else if (formState.contentType === 'pdf' && selectedFileInfo.value.name) {
          safeData.fileName = selectedFileInfo.value.name;
          safeData.fileSize = selectedFileInfo.value.size;
          safeData.fileType = selectedFileInfo.value.type;
        } else if (formState.contentType === 'link') {
          safeData.url = formState.externalLink;
        }

        // 使用事件总线发送数据，避免直接组件引用
        eventBus.emit('note-added', JSON.parse(JSON.stringify(safeData)));

        message.success('笔记添加成功');
        closeModal();
        submitting.value = false;
      })
      .catch(errors => {
        console.error('表单验证失败:', errors);
        message.error('请检查表单填写是否正确');
      });
};

// 获取分类标签
const getCategoryLabel = (value) => {
  const category = categoryOptions.find(c => c.value === value);
  return category ? category.label : '未分类';
};

// 暴露方法给父组件
defineExpose({
  showAddNoteModal
});

// 在NoteAdd.vue中
// 监听显示模态框事件
onMounted(() => {
  eventBus.on('show-add-note-modal', showAddNoteModal);
});

onUnmounted(() => {
  eventBus.off('show-add-note-modal', showAddNoteModal);
});
</script>

<style scoped>
.upload-area {
  border: 2px dashed #e0e7ff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover, .upload-area.drag-active {
  border-color: #1C4ED8;
  background-color: #f0f5ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.upload-icon {
  font-size: 36px;
  color: #1C4ED8;
  margin-bottom: 12px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  background-color: #f0f5ff;
  border-radius: 6px;
}

.file-icon {
  color: #f5222d;
  font-size: 24px;
  margin-right: 12px;
}

.file-details {
  flex-grow: 1;
}

.file-name {
  font-weight: 500;
  word-break: break-word;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.tag-suggestions {
  margin-top: 12px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item:hover {
  transform: scale(1.05);
}

.add-category-btn {
  padding: 8px 12px;
  cursor: pointer;
  color: #1C4ED8;
  transition: all 0.3s ease;
}

.add-category-btn:hover {
  background-color: #f0f5ff;
}

.add-category-input {
  display: flex;
  padding: 8px 12px;
  gap: 8px;
}
</style>