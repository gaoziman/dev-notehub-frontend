<template>
  <div class="import-bookmarks-form">
    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- 浏览器导入选项卡 -->
      <n-tab-pane name="browser" tab="从浏览器导入">
        <div class="browser-import p-4">
          <div class="instruction mb-4">
            <div class="flex items-center gap-2 mb-2">
              <icon-font type="icon-info-circle" class="text-info" />
              <span class="text-base font-medium">如何从浏览器导出书签</span>
            </div>
            <div class="instruction-steps p-2 pl-4 border border-info-color-suppl bg-info-color-suppl bg-opacity-10 rounded-md">
              <p class="mb-2">1. 打开浏览器的书签管理器</p>
              <p class="mb-2">2. 点击"导出书签"选项（通常在菜单或更多选项中）</p>
              <p class="mb-2">3. 保存为HTML文件</p>
              <p>4. 上传保存的HTML文件</p>
            </div>
          </div>

          <n-upload
              ref="browserUploadRef"
              :max="1"
              :accept="'.html,.htm'"
              :default-upload="false"
              :show-file-list="false"
              @change="handleBrowserFileChange"
          >
            <n-upload-dragger>
              <div class="flex flex-col items-center justify-center py-6">
                <icon-font type="icon-upload" :size="48" class="mb-3 text-primary" />
                <p class="text-lg font-medium mb-1">点击或拖拽上传书签文件</p>
                <p class="text-tertiary">支持 HTML 格式的浏览器书签导出文件</p>
              </div>
            </n-upload-dragger>
          </n-upload>

          <div v-if="browserFile" class="uploaded-file mt-4">
            <n-alert type="success" class="mb-4">
              <template #icon>
                <icon-font type="icon-success" />
              </template>
              <div class="flex justify-between items-center">
                <span>已选择文件: {{ browserFile.name }}</span>
                <n-button text type="error" @click="clearBrowserFile">
                  <template #icon>
                    <icon-font type="icon-close" />
                  </template>
                  移除
                </n-button>
              </div>
            </n-alert>

            <div class="import-options mb-4">
              <n-checkbox v-model:checked="importOptions.mergeDuplicates">
                自动合并重复书签
              </n-checkbox>
              <n-checkbox v-model:checked="importOptions.categorize">
                自动分类书签
              </n-checkbox>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <!-- 批量导入选项卡 -->
      <n-tab-pane name="batch" tab="批量导入">
        <div class="batch-import p-4">
          <div class="instruction mb-4">
            <p class="text-base mb-2">支持以下格式的批量导入：</p>
            <ul class="list-disc pl-5">
              <li class="mb-1">JSON格式 - 包含title、url、description和tags字段</li>
              <li class="mb-1">CSV格式 - 请确保第一行为标题行</li>
              <li>支持Excel导出格式(xlsx, xls)</li>
            </ul>
          </div>

          <n-upload
              ref="batchUploadRef"
              :max="1"
              :accept="'.json,.csv,.xlsx,.xls'"
              :default-upload="false"
              :show-file-list="false"
              @change="handleBatchFileChange"
          >
            <n-upload-dragger>
              <div class="flex flex-col items-center justify-center py-6">
                <icon-font type="icon-upload" :size="48" class="mb-3 text-primary" />
                <p class="text-lg font-medium mb-1">点击或拖拽上传数据文件</p>
                <p class="text-tertiary">支持 JSON, CSV, Excel 格式</p>
              </div>
            </n-upload-dragger>
          </n-upload>

          <div v-if="batchFile" class="uploaded-file mt-4">
            <n-alert type="success" class="mb-4">
              <template #icon>
                <icon-font type="icon-success" />
              </template>
              <div class="flex justify-between items-center">
                <span>已选择文件: {{ batchFile.name }}</span>
                <n-button text type="error" @click="clearBatchFile">
                  <template #icon>
                    <icon-font type="icon-close" />
                  </template>
                  移除
                </n-button>
              </div>
            </n-alert>

            <div class="mapping-options">
              <p class="text-base font-medium mb-2">字段映射:</p>
              <n-form label-placement="left" label-width="80">
                <n-form-item label="标题" required>
                  <n-select v-model:value="mapping.title" :options="mappingOptions" placeholder="选择标题字段" />
                </n-form-item>
                <n-form-item label="URL" required>
                  <n-select v-model:value="mapping.url" :options="mappingOptions" placeholder="选择URL字段" />
                </n-form-item>
                <n-form-item label="描述">
                  <n-select v-model:value="mapping.description" :options="mappingOptions" placeholder="选择描述字段" />
                </n-form-item>
                <n-form-item label="标签">
                  <n-select v-model:value="mapping.tags" :options="mappingOptions" placeholder="选择标签字段" />
                </n-form-item>
              </n-form>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <!-- 粘贴导入选项卡 -->
      <n-tab-pane name="paste" tab="粘贴导入">
        <div class="paste-import p-4">
          <div class="instruction mb-4">
            <p class="text-base mb-2">将书签信息粘贴到下方文本框中，每行一个书签，格式为:</p>
            <p class="code-format p-2 bg-gray-100 rounded">标题 | URL | 描述 | 标签(逗号分隔)</p>
            <p class="text-tertiary mt-2">例如: <code>Vue3官方文档 | vuejs.org | Vue.js 3前端框架官方文档 | Vue,前端,文档</code></p>
          </div>

          <n-input
              v-model:value="pasteContent"
              type="textarea"
              placeholder="请粘贴书签信息，每行一个..."
              :autosize="{ minRows: 8, maxRows: 15 }"
          />

          <div class="paste-preview mt-4" v-if="pasteContent.trim()">
            <p class="text-base font-medium mb-2">预览:</p>
            <div class="preview-content">
              <n-alert type="info">
                检测到{{ detectPastedBookmarks().count }}个书签
              </n-alert>
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <div class="action-buttons flex justify-end mt-4 gap-2">
      <n-button @click="onCancel">取消</n-button>
      <n-button
          type="primary"
          @click="onSubmit"
          :loading="submitting"
          :disabled="!isReadyToSubmit"
      >
        导入书签
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineEmits } from 'vue';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const emit = defineEmits(['submit', 'cancel']);
const message = useMessage();
const submitting = ref(false);
const activeTab = ref('browser');

// 文件上传引用
const browserUploadRef = ref(null);
const batchUploadRef = ref(null);

// 文件状态
const browserFile = ref(null);
const batchFile = ref(null);
const pasteContent = ref('');

// 导入选项
const importOptions = reactive({
  mergeDuplicates: true,
  categorize: true
});

// 字段映射（批量导入）
const mapping = reactive({
  title: 'title',
  url: 'url',
  description: 'description',
  tags: 'tags'
});

// 映射选项（将根据上传文件动态生成）
const mappingOptions = ref([
  { label: '标题', value: 'title' },
  { label: '网址', value: 'url' },
  { label: '描述', value: 'description' },
  { label: '标签', value: 'tags' }
]);

// 处理浏览器书签文件上传
function handleBrowserFileChange(options) {
  const { file } = options;
  if (file) {
    browserFile.value = file;
  }
}

// 处理批量导入文件上传
function handleBatchFileChange(options) {
  const { file } = options;
  if (file) {
    batchFile.value = file;

    // 如果是CSV或Excel文件，读取文件解析标题行，生成映射选项
    // 这里只是模拟，实际需要根据文件类型来解析
    setTimeout(() => {
      mappingOptions.value = [
        { label: 'title', value: 'title' },
        { label: 'name', value: 'name' },
        { label: 'url', value: 'url' },
        { label: 'link', value: 'link' },
        { label: 'description', value: 'description' },
        { label: 'desc', value: 'desc' },
        { label: 'tags', value: 'tags' },
        { label: 'category', value: 'category' }
      ];

      // 自动匹配映射
      mapping.title = 'title';
      mapping.url = 'url';
      mapping.description = 'description';
      mapping.tags = 'tags';
    }, 500);
  }
}

// 清除浏览器书签文件
function clearBrowserFile() {
  browserFile.value = null;
  browserUploadRef.value?.clear();
}

// 清除批量导入文件
function clearBatchFile() {
  batchFile.value = null;
  batchUploadRef.value?.clear();
}

// 检测粘贴内容中的书签数量
function detectPastedBookmarks() {
  const lines = pasteContent.value.trim().split('\n').filter(line => line.trim());
  const validLines = lines.filter(line => {
    const parts = line.split('|');
    return parts.length >= 2 && parts[0].trim() && parts[1].trim();
  });

  return {
    count: validLines.length,
    valid: validLines.length > 0
  };
}

// 判断是否可以提交
const isReadyToSubmit = computed(() => {
  if (activeTab.value === 'browser') {
    return !!browserFile.value;
  } else if (activeTab.value === 'batch') {
    return !!batchFile.value && !!mapping.title && !!mapping.url;
  } else if (activeTab.value === 'paste') {
    return detectPastedBookmarks().valid;
  }
  return false;
});

// 提交表单
function onSubmit() {
  if (!isReadyToSubmit.value) {
    message.warning('请先选择或输入要导入的书签数据');
    return;
  }

  submitting.value = true;

  // 模拟处理导入
  setTimeout(() => {
    let result;

    if (activeTab.value === 'browser') {
      result = {
        source: 'browser',
        file: browserFile.value.name,
        count: 15, // 模拟导入数量
        options: { ...importOptions }
      };
    } else if (activeTab.value === 'batch') {
      result = {
        source: 'batch',
        file: batchFile.value.name,
        count: 8,
        mapping: { ...mapping }
      };
    } else if (activeTab.value === 'paste') {
      const { count } = detectPastedBookmarks();
      result = {
        source: 'paste',
        count: count
      };
    }

    submitting.value = false;
    emit('submit', result);
  }, 1000);
}

// 取消
function onCancel() {
  emit('cancel');
}
</script>

<style scoped>
.code-format {
  font-family: monospace;
}
</style>