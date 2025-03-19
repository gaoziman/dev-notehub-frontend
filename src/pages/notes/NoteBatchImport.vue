<template>
  <a-modal
      v-model:open="open"
      title="批量导入"
      width="600px"
      :maskClosable="false"
      :destroyOnClose="true"
      @cancel="handleCancel"
  >
    <div class="batch-import-container">
      <!-- 步骤条 -->
      <a-steps :current="currentStep" size="small" class="import-steps">
        <a-step title="选择文件" />
        <a-step title="配置导入" />
        <a-step title="导入确认" />
      </a-steps>

      <!-- 步骤内容区域 -->
      <div class="steps-content">
        <!-- 步骤1: 选择文件 -->
        <div v-if="currentStep === 0" class="step-content-wrapper">
          <div
              class="file-drop-area"
              :class="{ 'active-drop': isDragging }"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
          >
            <cloud-upload-outlined class="upload-icon" />
            <p class="upload-text">拖放文件到此处或点击上传</p>
            <p class="upload-desc">支持 Markdown (.md) 和 PDF (.pdf) 文件</p>
            <input
                ref="fileInput"
                type="file"
                class="hidden-input"
                accept=".md,.pdf"
                multiple
                @change="handleFileChange"
            />
          </div>

          <div v-if="selectedFiles.length > 0" class="selected-files">
            <div class="section-title">已选择文件 ({{ selectedFiles.length }})</div>
            <div class="files-list">
              <a-alert v-if="hasInvalidFiles" type="warning" show-icon class="import-alert">
                <template #message>部分文件类型不受支持，只会导入 .md 和 .pdf 文件</template>
              </a-alert>
              <div
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  class="file-item"
                  :class="{ 'invalid-file': !isValidFileType(file.name) }"
              >
                <div class="file-icon">
                  <file-markdown-outlined v-if="file.name.toLowerCase().endsWith('.md')" />
                  <file-pdf-outlined v-else-if="file.name.toLowerCase().endsWith('.pdf')" />
                  <file-unknown-outlined v-else />
                </div>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
                <a-button type="text" shape="circle" class="file-remove-btn" @click="removeFile(index)">
                  <delete-outlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤2: 配置导入 -->
        <div v-if="currentStep === 1" class="step-content-wrapper">
          <div class="import-settings">
            <div class="settings-section">
              <h3 class="settings-title">导入选项</h3>

              <a-form layout="vertical">
                <a-form-item label="默认分类">
                  <a-select
                      v-model:value="importSettings.category"
                      placeholder="选择默认分类"
                      :options="categoryOptions"
                  />
                </a-form-item>

                <a-form-item label="默认标签">
                  <a-select
                      v-model:value="importSettings.tags"
                      mode="tags"
                      placeholder="输入标签，回车确认"
                      :options="popularTagOptions"
                      :token-separators="[',']"
                  />
                </a-form-item>

                <a-form-item label="笔记状态">
                  <a-radio-group v-model:value="importSettings.status">
                    <a-radio value="未开始">未开始</a-radio>
                    <a-radio value="进行中">进行中</a-radio>
                    <a-radio value="已完成">已完成</a-radio>
                  </a-radio-group>
                </a-form-item>

                <a-form-item>
                  <a-checkbox v-model:checked="importSettings.extractTitles">
                    从文件自动提取标题
                  </a-checkbox>
                </a-form-item>

                <a-form-item>
                  <a-checkbox v-model:checked="importSettings.overwriteExisting">
                    覆盖同名笔记
                  </a-checkbox>
                </a-form-item>
              </a-form>
            </div>

            <!-- 文件命名预览 -->
            <div class="settings-section">
              <h3 class="settings-title">文件命名预览</h3>
              <a-alert type="info" show-icon class="preview-alert">
                <template #message>以下是导入后的笔记命名预览</template>
              </a-alert>
              <div class="file-naming-preview">
                <div v-for="(file, index) in validFiles.slice(0, 3)" :key="index" class="preview-item">
                  <check-circle-outlined class="preview-icon" />
                  <span>{{ getFileNameWithoutExtension(file.name) }}</span>
                </div>
                <div v-if="validFiles.length > 3" class="more-files">
                  还有 {{ validFiles.length - 3 }} 个文件...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3: 导入确认 -->
        <div v-if="currentStep === 2" class="step-content-wrapper">
          <div class="confirmation-content">
            <div class="summary-section">
              <h3 class="summary-title">导入摘要</h3>
              <div class="summary-info">
                <div class="summary-item">
                  <span class="summary-label">导入文件数:</span>
                  <span class="summary-value">{{ validFiles.length }}个文件</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">默认分类:</span>
                  <span class="summary-value">{{ getCategoryName(importSettings.category) }}</span>
                </div>
                <div v-if="importSettings.tags.length > 0" class="summary-item">
                  <span class="summary-label">默认标签:</span>
                  <span class="summary-value tags-list">
                    <a-tag v-for="tag in importSettings.tags" :key="tag" color="blue">{{ tag }}</a-tag>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">笔记状态:</span>
                  <span class="summary-value">{{ importSettings.status }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">设置选项:</span>
                  <span class="summary-value">
                    <span v-if="importSettings.extractTitles">自动提取标题</span>
                    <span v-if="importSettings.extractTitles && importSettings.overwriteExisting">, </span>
                    <span v-if="importSettings.overwriteExisting">覆盖同名笔记</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 导入进度 -->
            <div v-if="isImporting" class="import-progress">
              <h3 class="progress-title">正在导入...</h3>
              <a-progress :percent="importProgress" status="active" />
              <div class="current-import">
                正在处理: {{ currentImportFile }}
              </div>
            </div>

            <!-- 导入结果 -->
            <div v-if="importComplete" class="import-result">
              <div class="result-icon">
                <check-circle-filled v-if="importSuccess" class="success-icon" />
                <warning-filled v-else class="warning-icon" />
              </div>
              <h3 class="result-title">{{ importSuccess ? '导入完成' : '部分导入失败' }}</h3>
              <p class="result-summary">
                成功导入 {{ successCount }} 个文件
                <span v-if="failedCount > 0">，{{ failedCount }} 个文件导入失败</span>
              </p>
              <div v-if="failedCount > 0" class="failed-files">
                <a-collapse>
                  <a-collapse-panel key="1" header="查看失败详情">
                    <div v-for="(file, index) in failedFiles" :key="index" class="failed-item">
                      <close-circle-outlined class="failed-icon" />
                      <span>{{ file.name }} - {{ file.reason }}</span>
                    </div>
                  </a-collapse-panel>
                </a-collapse>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤操作按钮 -->
      <div class="steps-action">
        <a-button
            v-if="currentStep > 0"
            @click="prevStep"
            :disabled="isImporting"
        >
          上一步
        </a-button>
        <a-button
            v-if="currentStep < 2"
            type="primary"
            @click="nextStep"
            :disabled="(currentStep === 0 && validFiles.length === 0)"
        >
          下一步
        </a-button>
        <a-button
            v-if="currentStep === 2 && !isImporting && !importComplete"
            type="primary"
            @click="startImport"
        >
          开始导入
        </a-button>
        <a-button
            v-if="importComplete"
            type="primary"
            @click="handleFinish"
        >
          完成
        </a-button>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <a-button @click="handleCancel" :disabled="isImporting">取消</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  CloudUploadOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseCircleOutlined
} from '@ant-design/icons-vue';

// 定义组件 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义组件事件
const emit = defineEmits(['update:visible', 'import-success', 'cancel']);

// 同步模态框状态
const open = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// 步骤状态
const currentStep = ref(0);
const isDragging = ref(false);
const fileInput = ref(null);

// 文件状态
const selectedFiles = ref([]);
const hasInvalidFiles = computed(() => {
  return selectedFiles.value.some(file => !isValidFileType(file.name));
});
const validFiles = computed(() => {
  return selectedFiles.value.filter(file => isValidFileType(file.name));
});

// 导入配置
const importSettings = reactive({
  category: 'java',
  tags: [],
  status: '未开始',
  extractTitles: true,
  overwriteExisting: false
});

// 导入进度状态
const isImporting = ref(false);
const importProgress = ref(0);
const currentImportFile = ref('');
const importComplete = ref(false);
const importSuccess = ref(true);
const successCount = ref(0);
const failedCount = ref(0);
const failedFiles = ref([]);

// 分类选项
const categoryOptions = [
  { value: 'java', label: 'Java基础' },
  { value: 'spring', label: 'Spring系列' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'redis', label: 'Redis' },
  { value: 'message-queue', label: '消息队列' },
  { value: 'other', label: '其他' }
];

// 常用标签选项
const popularTagOptions = [
  { value: 'Java', label: 'Java' },
  { value: 'Spring', label: 'Spring' },
  { value: 'Redis', label: 'Redis' },
  { value: 'MySQL', label: 'MySQL' },
  { value: '微服务', label: '微服务' },
  { value: '并发', label: '并发' },
  { value: '分布式', label: '分布式' },
  { value: '设计模式', label: '设计模式' }
];

// ---------- 方法定义 ----------

// 文件处理方法
const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    addFiles(files);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    addFiles(files);
  }

  // 重置input，以便能够重复选择同一个文件
  if (event.target) {
    event.target.value = '';
  }
};

const addFiles = (fileList) => {
  // 将FileList转为数组并添加到选中的文件中
  const newFiles = Array.from(fileList).map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
    file: file // 保存文件对象
  }));

  selectedFiles.value = [...selectedFiles.value, ...newFiles];
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const isValidFileType = (fileName) => {
  const lowerName = fileName.toLowerCase();
  return lowerName.endsWith('.md') || lowerName.endsWith('.pdf');
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileNameWithoutExtension = (fileName) => {
  return fileName.replace(/\.[^/.]+$/, "");
};

const getCategoryName = (categoryValue) => {
  const category = categoryOptions.find(cat => cat.value === categoryValue);
  return category ? category.label : '未分类';
};

// 步骤控制
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value += 1;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
  }
};

// 导入处理
const startImport = async () => {
  if (validFiles.value.length === 0) {
    message.warning('没有可导入的有效文件');
    return;
  }

  isImporting.value = true;
  importProgress.value = 0;
  successCount.value = 0;
  failedCount.value = 0;
  failedFiles.value = [];

  // 模拟导入过程
  for (let i = 0; i < validFiles.value.length; i++) {
    const file = validFiles.value[i];
    currentImportFile.value = file.name;

    try {
      // 模拟异步导入过程
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // 模拟偶尔的导入失败
      if (Math.random() > 0.9) {
        throw new Error('导入过程中出现错误');
      }

      successCount.value++;
    } catch (error) {
      failedCount.value++;
      failedFiles.value.push({
        name: file.name,
        reason: error.message
      });
    }

    // 更新进度
    importProgress.value = Math.floor(((i + 1) / validFiles.value.length) * 100);
  }

  // 完成导入
  isImporting.value = false;
  importComplete.value = true;
  importSuccess.value = failedCount.value === 0;

  // 如果全部导入成功，发出成功事件
  if (importSuccess.value) {
    // 延迟一会再触发，让用户看到完成状态
    setTimeout(() => {
      emit('import-success', {
        count: successCount.value,
        category: importSettings.category,
        status: importSettings.status,
        tags: importSettings.tags
      });
    }, 1000);
  }
};

const handleFinish = () => {
  // 重置状态
  currentStep.value = 0;
  selectedFiles.value = [];
  importComplete.value = false;
  importProgress.value = 0;

  // 触发成功事件
  emit('import-success', {
    count: successCount.value,
    category: importSettings.category,
    status: importSettings.status,
    tags: importSettings.tags
  });

  // 关闭模态框
  open.value = false;
};

const handleCancel = () => {
  // 如果正在导入，不允许取消
  if (isImporting.value) {
    return;
  }

  // 重置状态
  currentStep.value = 0;
  selectedFiles.value = [];
  importComplete.value = false;
  importProgress.value = 0;

  // 发出取消事件
  emit('cancel');

  // 关闭模态框
  open.value = false;
};
</script>

<style scoped>
.batch-import-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.import-steps {
  margin-bottom: 24px;
}

.step-content-wrapper {
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

/* 文件拖放区域 */
.file-drop-area {
  border: 2px dashed #e0e7ff;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-drop-area:hover, .file-drop-area.active-drop {
  border-color: #1C4ED8;
  background-color: #f0f5ff;
}

.upload-icon {
  font-size: 40px;
  color: #1C4ED8;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.upload-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.hidden-input {
  display: none;
}

/* 选中的文件列表 */
.selected-files {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.import-alert {
  margin-bottom: 12px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.file-item:hover {
  background-color: #f0f5ff;
}

.file-item.invalid-file {
  background-color: #fff2f0;
  border: 1px dashed #ffccc7;
}

.file-icon {
  font-size: 20px;
  margin-right: 12px;
  color: #1C4ED8;
}

.invalid-file .file-icon {
  color: #ff4d4f;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.file-remove-btn {
  color: #999;
}

.file-remove-btn:hover {
  color: #ff4d4f;
}

/* 导入设置 */
.import-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.preview-alert {
  margin-bottom: 16px;
}

.file-naming-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f9fafb;
}

.preview-icon {
  color: #52c41a;
}

.more-files {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding: 8px;
}

/* 导入确认 */
.confirmation-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-section {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: #666;
  width: 100px;
  flex-shrink: 0;
}

.summary-value {
  flex: 1;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 导入进度 */
.import-progress {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.current-import {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

/* 导入结果 */
.import-result {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 24px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-icon {
  color: #52c41a;
}

.warning-icon {
  color: #faad14;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.result-summary {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.failed-files {
  width: 100%;
  margin-top: 16px;
}

.failed-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.failed-icon {
  color: #ff4d4f;
}

/* 步骤操作按钮 */
.steps-action {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .import-settings {
    gap: 16px;
  }
}
</style>