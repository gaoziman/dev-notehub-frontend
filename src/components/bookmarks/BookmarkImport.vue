<template>
  <n-modal
      v-model:show="localShow"
      preset="card"
      title="导入书签"
      style="width: 600px; max-width: 95vw"
      :bordered="false"
      :segmented="{ content: true, footer: 'soft' }"
  >
    <!-- 标签页导航 -->
    <n-tabs type="segment" v-model:value="activeTab" animated class="import-tabs">
      <n-tab-pane name="browser" tab="从浏览器导入">
        <div class="import-content">
          <div class="import-guide">
            <h3 class="guide-title">如何从浏览器导出书签</h3>
            <ol class="guide-steps">
              <li>打开浏览器的书签管理器</li>
              <li>点击"导出书签"选项（通常在菜单或更多选项中）</li>
              <li>保存为HTML文件</li>
              <li>上传保存的HTML文件</li>
            </ol>
          </div>

          <n-upload
              ref="uploadRef"
              multiple
              directory-dnd
              accept=".html"
              :default-upload="false"
              @change="handleImportFile"
          >
            <n-upload-dragger>
              <div class="flex-col items-center justify-center p-4">
                <icon-font type="icon-upload" :size="48" class="text-primary mb-2" />
                <p class="upload-title">点击或拖拽浏览器导出的书签HTML文件到此处</p>
                <p class="upload-subtitle">支持Chrome、Firefox、Edge等浏览器导出的书签</p>
              </div>
            </n-upload-dragger>
          </n-upload>
        </div>
      </n-tab-pane>

      <n-tab-pane name="batch" tab="批量导入">
        <div class="import-content">
          <div class="import-guide">
            <h3 class="guide-title">支持以下格式的批量导入</h3>
            <ul class="format-list">
              <li>
                <span class="format-label">JSON格式</span>
                <span class="format-desc">包含title、url、description和tags字段</span>
              </li>
              <li>
                <span class="format-label">CSV格式</span>
                <span class="format-desc">请确保第一行为标题行</span>
              </li>
              <li>
                <span class="format-label">Excel格式</span>
                <span class="format-desc">支持Excel导出格式(xlsx, xls)</span>
              </li>
            </ul>
          </div>

          <n-upload
              ref="batchUploadRef"
              multiple
              directory-dnd
              accept=".json,.csv,.xlsx,.xls"
              :default-upload="false"
              @change="handleBatchImportFile"
          >
            <n-upload-dragger>
              <div class="flex-col items-center justify-center p-4">
                <icon-font type="icon-file" :size="48" class="text-primary mb-2" />
                <p class="upload-title">点击或拖拽上传数据文件</p>
                <p class="upload-subtitle">支持 JSON, CSV, Excel 格式</p>
              </div>
            </n-upload-dragger>
          </n-upload>
        </div>
      </n-tab-pane>

      <n-tab-pane name="paste" tab="粘贴导入">
        <div class="import-content">
          <div class="import-guide">
            <h3 class="guide-title">将书签信息粘贴到下方文本框中，每行一个书签，格式为:</h3>
            <div class="format-example">
              <code>标题 | URL | 描述 | 标签(逗号分隔)</code>
            </div>
            <div class="example-block">
              <p class="example-title">例如:</p>
              <p class="example-content">Vue3官方文档 | vuejs.org | Vue.js 3前端框架官方文档 | Vue,前端,文档</p>
            </div>
          </div>

          <n-input
              v-model:value="pasteContent"
              type="textarea"
              placeholder="请粘贴书签信息，每行一个..."
              :autosize="{ minRows: 6, maxRows: 10 }"
              class="paste-input"
          />
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 文件列表 -->
    <div class="file-list" v-if="selectedFiles.length > 0">
      <h4 class="file-list-title">已选择 {{ selectedFiles.length }} 个文件</h4>
      <n-list size="small" bordered>
        <n-list-item v-for="(file, index) in selectedFiles" :key="index">
          <n-space align="center" justify="space-between" style="width: 100%">
            <div class="file-info">
              <icon-font :type="getFileIcon(file.name)" :size="16" />
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
            </div>
            <n-button quaternary circle size="small" @click="removeFile(index)">
              <icon-font type="icon-close" :size="16" />
            </n-button>
          </n-space>
        </n-list-item>
      </n-list>
    </div>

    <!-- 导入选项 -->
    <div class="import-options">
      <h4 class="options-title">导入选项</h4>
      <n-space vertical>
        <n-checkbox v-model:checked="options.detectDuplicates">
          检测并合并重复项
        </n-checkbox>
        <n-checkbox v-model:checked="options.autoClassify">
          智能分类（根据URL自动识别分类）
        </n-checkbox>
        <n-checkbox v-model:checked="options.fetchMetadata">
          抓取网页元数据（标题、描述、图标等）
        </n-checkbox>
      </n-space>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="form-actions">
        <n-button @click="handleCancel" round>取消</n-button>
        <n-button
            type="primary"
            @click="handleImport"
            :loading="isImporting"
            :disabled="!canImport"
            round
        >
          {{ importButtonText }}
        </n-button>
      </div>
    </template>
  </n-modal>

  <!-- 导入预览弹窗 -->
  <BookmarkImportPreview
      v-if="showPreview"
      v-model:show="showPreview"
      :bookmarks="parsedBookmarks"
      :source="importSource"
      :categories="categories"
      :popularTags="popularTags"
      @import="finalizeImport"
      @cancel="cancelPreview"
  />
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useMessage } from 'naive-ui';
import BookmarkImportPreview from '@/components/bookmarks/BookmarkImportPreview.vue';

// 消息提示
const message = useMessage();

// 组件属性
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  popularTags: {
    type: Array,
    default: () => ['前端', 'Vue', 'React', 'JavaScript', 'CSS', 'Java', 'Python']
  }
});

// 组件事件
const emit = defineEmits(['update:show', 'import']);

// 本地状态
const localShow = ref(props.show);
const activeTab = ref('browser');
const uploadRef = ref(null);
const batchUploadRef = ref(null);
const pasteContent = ref('');
const selectedFiles = ref([]);
const isImporting = ref(false);
const showPreview = ref(false);
const parsedBookmarks = ref([]);
const importSource = ref('浏览器');

// 导入选项
const options = reactive({
  detectDuplicates: true,
  autoClassify: true,
  fetchMetadata: false
});

// 计算属性
const canImport = computed(() => {
  if (activeTab.value === 'browser' || activeTab.value === 'batch') {
    return selectedFiles.value.length > 0;
  } else if (activeTab.value === 'paste') {
    return pasteContent.value.trim().length > 0;
  }
  return false;
});

const importButtonText = computed(() => {
  if (activeTab.value === 'browser') {
    return selectedFiles.value.length > 0 ? `导入 ${selectedFiles.value.length} 个书签文件` : '导入书签';
  } else if (activeTab.value === 'batch') {
    return selectedFiles.value.length > 0 ? `导入 ${selectedFiles.value.length} 个数据文件` : '导入书签';
  } else {
    return '导入书签';
  }
});

// 文件图标根据扩展名显示不同图标
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'html':
      return 'icon-html';
    case 'json':
      return 'icon-json';
    case 'csv':
      return 'icon-csv';
    case 'xlsx':
    case 'xls':
      return 'icon-excel';
    default:
      return 'icon-file';
  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// 处理浏览器书签导入文件
const handleImportFile = (options) => {
  if (options.fileList && options.fileList.length > 0) {
    selectedFiles.value = options.fileList.map(file => file.file);
  }
};

// 处理批量导入文件
const handleBatchImportFile = (options) => {
  if (options.fileList && options.fileList.length > 0) {
    selectedFiles.value = options.fileList.map(file => file.file);
  }
};

// 移除文件
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

// 处理导入
const handleImport = async () => {
  isImporting.value = true;

  try {
    // 根据不同的导入方式处理数据
    if (activeTab.value === 'browser') {
      // 解析浏览器书签HTML文件
      importSource.value = '浏览器';
      // 这里应该调用后端API解析HTML文件，但这里我们模拟一些数据
      parsedBookmarks.value = generateMockBrowserBookmarks();
    } else if (activeTab.value === 'batch') {
      // 解析批量导入文件
      importSource.value = '批量导入';
      // 这里应该调用后端API解析JSON/CSV/Excel文件，但这里我们模拟一些数据
      parsedBookmarks.value = generateMockBatchBookmarks();
    } else if (activeTab.value === 'paste') {
      // 解析粘贴的文本
      importSource.value = '粘贴导入';
      // 解析粘贴的文本内容
      parsedBookmarks.value = parsePastedContent(pasteContent.value);
    }

    // 显示预览
    showPreview.value = true;
  } catch (error) {
    console.error('导入处理失败', error);
    message.error('导入处理失败');
  } finally {
    isImporting.value = false;
  }
};

// 取消导入
const handleCancel = () => {
  resetForm();
  localShow.value = false;
};

// 取消预览
const cancelPreview = () => {
  showPreview.value = false;
};

// 完成导入
const finalizeImport = (data) => {
  showPreview.value = false;
  resetForm();
  localShow.value = false;
  emit('import', data);
  message.success(`成功导入 ${data.bookmarks.length} 个书签`);
};

// 重置表单
const resetForm = () => {
  activeTab.value = 'browser';
  selectedFiles.value = [];
  pasteContent.value = '';
  if (uploadRef.value) {
    uploadRef.value.clear();
  }
  if (batchUploadRef.value) {
    batchUploadRef.value.clear();
  }
};

// 解析粘贴的内容
const parsePastedContent = (content) => {
  if (!content.trim()) return [];

  const lines = content.trim().split('\n');
  const bookmarks = [];

  lines.forEach((line, index) => {
    const parts = line.split('|').map(part => part.trim());
    if (parts.length >= 2) {
      const bookmark = {
        id: index + 1,
        title: parts[0] || '无标题',
        url: parts[1],
        description: parts[2] || '',
        tags: parts[3] ? parts[3].split(',').map(tag => tag.trim()) : [],
        createdAt: new Date().toISOString()
      };
      bookmarks.push(bookmark);
    }
  });

  return bookmarks;
};

// 生成模拟的浏览器书签数据
const generateMockBrowserBookmarks = () => {
  return [
    {
      id: 1,
      title: 'Vue.js - The Progressive JavaScript Framework',
      url: 'https://vuejs.org/',
      description: 'Vue.js - The Progressive JavaScript Framework',
      icon: 'https://vuejs.org/images/logo.png',
      tags: ['Vue', 'JavaScript', 'Framework'],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'React – A JavaScript library for building user interfaces',
      url: 'https://reactjs.org/',
      description: 'A JavaScript library for building user interfaces',
      icon: 'https://reactjs.org/favicon.ico',
      tags: ['React', 'JavaScript', 'UI'],
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: 'TypeScript: JavaScript With Syntax For Types',
      url: 'https://www.typescriptlang.org/',
      description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript',
      icon: 'https://www.typescriptlang.org/favicon.ico',
      tags: ['TypeScript', 'JavaScript', 'Programming'],
      createdAt: new Date().toISOString()
    }
  ];
};

// 生成模拟的批量导入数据
const generateMockBatchBookmarks = () => {
  return [
    {
      id: 1,
      title: 'GitHub: Where the world builds software',
      url: 'https://github.com/',
      description: 'GitHub is where over 65 million developers shape the future of software',
      icon: 'https://github.com/favicon.ico',
      platform: 'github',
      tags: ['Git', 'Development', 'Open Source'],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: '掘金 - 代码不止，掘金不停',
      url: 'https://juejin.cn/',
      description: '掘金是一个帮助开发者成长的社区',
      icon: 'https://juejin.cn/favicon.ico',
      platform: 'juejin',
      tags: ['前端', '技术社区', '中文'],
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/',
      description: 'Resources for developers, by developers',
      icon: 'https://developer.mozilla.org/favicon.ico',
      tags: ['Web', 'Documentation', 'Reference'],
      createdAt: new Date().toISOString()
    }
  ];
};

// 监听props.show变化
watch(() => props.show, (newValue) => {
  localShow.value = newValue;
});

// 监听localShow变化
watch(localShow, (newValue) => {
  emit('update:show', newValue);
  if (!newValue) {
    resetForm();
  }
});
</script>

<style scoped>
.import-tabs {
  margin-bottom: 16px;
}

.import-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-guide {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 16px;
}

.guide-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--text-color-base);
}

.guide-steps {
  padding-left: 24px;
  margin: 0;
}

.guide-steps li {
  margin-bottom: 8px;
  color: var(--text-color-secondary);
}

.format-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.format-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  position: relative;
  padding-left: 20px;
}

.format-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-size: 1.2em;
}

.format-label {
  font-weight: 500;
  color: var(--text-color-base);
  flex: 0 0 100px;
}

.format-desc {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.format-example {
  background-color: var(--body-color);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius);
  padding: 12px;
  margin: 12px 0;
  font-family: monospace;
  font-size: 14px;
  overflow-x: auto;
}

.example-block {
  background-color: var(--body-color);
  border-radius: var(--border-radius);
  padding: 12px;
  margin-top: 12px;
}

.example-title {
  margin: 0 0 8px 0;
  font-weight: 500;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.example-content {
  margin: 0;
  font-family: monospace;
  font-size: 13px;
  color: var(--text-color-base);
  white-space: nowrap;
  overflow-x: auto;
}

.paste-input {
  margin-top: 8px;
}

.upload-title {
  font-size: 15px;
  font-weight: 500;
  margin: 8px 0 4px 0;
}

.upload-subtitle {
  font-size: 13px;
  margin: 0;
  color: var(--text-color-secondary);
}

.file-list {
  margin-top: 24px;
}

.file-list-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.import-options {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--divider-color);
}

.options-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 12px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>