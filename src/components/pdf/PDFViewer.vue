<template>
  <div class="pdf-viewer-container" ref="viewerContainer">
    <!-- 简化的主工具栏 -->
    <div class="pdf-main-toolbar">
      <div class="toolbar-left">
        <div class="document-title">
          {{ documentTitle || '文档查看器' }}
        </div>
      </div>

      <div class="toolbar-right">
        <n-button quaternary circle @click="zoomIn" class="toolbar-btn">
          <template #icon>
            <icon-font type="icon-zoom-in" />
          </template>
        </n-button>

        <n-button quaternary circle @click="zoomOut" class="toolbar-btn">
          <template #icon>
            <icon-font type="icon-zoom-out" />
          </template>
        </n-button>

        <n-button quaternary circle @click="fitToPage" class="toolbar-btn">
          <template #icon>
            <icon-font type="icon-fit-page" />
          </template>
        </n-button>

        <n-button quaternary circle @click="toggleFullscreen" class="toolbar-btn">
          <template #icon>
            <icon-font :type="isFullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen'" />
          </template>
        </n-button>

        <n-button quaternary circle @click="downloadPdf" class="toolbar-btn">
          <template #icon><icon-font type="icon-download" /></template>
        </n-button>

        <n-button quaternary circle @click="printPdf" class="toolbar-btn">
          <template #icon><icon-font type="icon-print" /></template>
        </n-button>
      </div>
    </div>

    <!-- 主内容区 - 充分利用空间 -->
    <div class="pdf-main-content">
      <!-- PDF内容区 -->
      <div class="pdf-content-area">
        <!-- PDF内容显示区域 -->
        <div
            class="pdf-content"
            ref="pdfContainer"
        >
          <!-- 加载状态 -->
          <div v-if="loading" class="pdf-loading">
            <n-spin size="large" />
            <p class="loading-message">PDF文档加载中，请稍候...</p>
          </div>

          <!-- 错误状态 -->
          <div v-if="error" class="pdf-error">
            <n-result status="error" title="加载失败" :description="errorMessage">
              <template #footer>
                <n-button @click="reloadPdf" type="primary">重试</n-button>
              </template>
            </n-result>
          </div>

          <!-- PDF内容 - 调整宽度和高度 -->
          <div
              class="pdf-wrapper"
              :style="{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center top'
            }"
          >
            <iframe
                v-if="pdfUrl && !error"
                :src="currentPdfUrl"
                class="pdf-iframe"
                ref="pdfIframeRef"
                @load="onPdfLoaded"
                @error="onError"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { NButton, NSpin, NResult } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

// 接收props
const props = defineProps({
  pdfUrl: {
    type: String,
    required: true
  },
  defaultTitle: {
    type: String,
    default: '文档查看器'
  },
  isDarkTheme: {
    type: Boolean,
    default: false
  },
  defaultZoom: {
    type: Number,
    default: 0.8
  }
});

// 状态变量
const loading = ref(true);
const error = ref(null);
const errorMessage = ref('');
const currentPage = ref(1);
const pageCount = ref(0);
const zoom = ref(props.defaultZoom);
const rotation = ref(0);
const pdfContainer = ref(null);
const pdfIframeRef = ref(null);
const viewerContainer = ref(null);
const documentTitle = ref(props.defaultTitle);
const isFullscreen = ref(false);
const pdfWidth = ref(800); // 估算的PDF固有宽度

// 计算当前PDF URL（添加页码参数）
const currentPdfUrl = computed(() => {
  return `${props.pdfUrl}#page=${currentPage.value}`;
});

// 向父组件抛出事件
const emit = defineEmits(['theme-changed', 'zoom-changed']);

// 缩放控制
const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2.0);
  emit('zoom-changed', zoom.value);
};

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5);
  emit('zoom-changed', zoom.value);
};

const fitToPage = () => {
  fitToContainer(true);
};

// 全屏模式
const toggleFullscreen = () => {
  const container = viewerContainer.value;

  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen().then(() => {
        isFullscreen.value = true;
        nextTick(() => {
          fitToContainer(); // 进入全屏后重新调整大小
        });
      }).catch(err => {
        console.error('无法进入全屏模式:', err);
      });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false;
        nextTick(() => {
          fitToContainer(); // 退出全屏后重新调整大小
        });
      }).catch(err => {
        console.error('无法退出全屏模式:', err);
      });
    }
  }
};

// 下载PDF
const downloadPdf = () => {
  const link = document.createElement('a');
  link.href = props.pdfUrl;
  link.download = documentTitle.value || 'document.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 打印PDF
const printPdf = () => {
  if (pdfIframeRef.value) {
    pdfIframeRef.value.contentWindow.print();
  } else {
    const printWindow = window.open(props.pdfUrl);
    printWindow.onload = function() {
      printWindow.print();
    };
  }
};

// 重新加载PDF
const reloadPdf = () => {
  loading.value = true;
  error.value = null;
  errorMessage.value = '';

  // 重新加载iframe
  if (pdfIframeRef.value) {
    pdfIframeRef.value.src = currentPdfUrl.value;
  }
};

// PDF加载成功处理
const onPdfLoaded = () => {
  loading.value = false;

  // 尝试从iframe中获取文档信息
  try {
    if (pdfIframeRef.value && pdfIframeRef.value.contentWindow) {
      // 如果iframe访问允许的话，可以尝试获取标题
      if (documentTitle.value === props.defaultTitle) {
        try {
          documentTitle.value = pdfIframeRef.value.contentWindow.document.title || props.defaultTitle;
        } catch (e) {
          console.log('无法访问iframe内容获取标题:', e);
        }
      }

      // 适应页面大小
      nextTick(() => {
        fitToContainer();
      });
    }
  } catch (e) {
    console.error('读取PDF文档信息失败:', e);
  }
};

// 错误处理
const onError = (err) => {
  loading.value = false;
  error.value = true;
  console.error('PDF加载错误:', err);
  errorMessage.value = `无法加载PDF文档: ${err && err.message ? err.message : '未知错误'}`;
};

// 调整PDF适应容器
const fitToContainer = (forceReset = false) => {
  if (!pdfContainer.value) return;

  // 根据容器尺寸调整缩放
  const containerWidth = pdfContainer.value.clientWidth - 30; // 增加边距，以适应新的设计

  if (forceReset) {
    // 根据容器宽度计算理想缩放比例
    // 假设PDF的标准宽度约为800px
    zoom.value = containerWidth / pdfWidth.value;

    // 限制缩放范围，避免过大或过小
    zoom.value = Math.max(0.6, Math.min(zoom.value, 1.2)); // 调整缩放范围为更舒适的阅读体验

    emit('zoom-changed', zoom.value);
  }
};

// 生命周期钩子
onMounted(() => {
  // 添加全屏更改事件监听
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });

  // 设置初始缩放以适应容器
  nextTick(() => {
    if (pdfContainer.value) {
      fitToContainer(true);
    }
  });

  // 添加窗口大小改变事件监听
  window.addEventListener('resize', () => {
    fitToContainer(true);
  });
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', () => {});
  window.removeEventListener('resize', () => {});
});

// 监听pdfUrl的变化
watch(() => props.pdfUrl, () => {
  // 重置状态
  loading.value = true;
  error.value = null;
  errorMessage.value = '';
  currentPage.value = 1;
  rotation.value = 0;
  documentTitle.value = props.defaultTitle;

  // 使用默认缩放
  zoom.value = props.defaultZoom;
}, {immediate: true});

// 监听黑暗模式变化
watch(() => props.isDarkTheme, (newValue) => {
  // 可以在这里处理主题变更的逻辑
  emit('theme-changed', newValue);
});

// 暴露组件方法，以便父组件可以调用
defineExpose({
  reloadPdf,
  toggleFullscreen,
  downloadPdf,
  printPdf,
  zoomIn,
  zoomOut,
  fitToPage,
  setZoom: (value) => { zoom.value = value; }
});
</script>

<style scoped>
.pdf-viewer-container {
  --primary-color: #6366f1;
  --primary-light: rgba(99, 102, 241, 0.1);
  --primary-lighter: rgba(99, 102, 241, 0.05);
  --text-color: #111827;
  --text-color-secondary: #374151;
  --text-color-tertiary: #6b7280;
  --card-color: #ffffff;
  --body-color: #f3f4f6;
  --border-color: #e5e7eb;
  --box-shadow-1: 0 1px 3px rgba(0, 0, 0, 0.1);
  --box-shadow-3: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --border-radius: 8px;
  --transition-speed: 0.3s;

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 85vh;
  background-color: var(--body-color);
  position: relative;
  overflow: hidden;
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 主工具栏 */
.pdf-main-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  min-height: 56px;
  background-color: var(--card-color);
  border-bottom: 1px solid var(--border-color);
  padding: 0 16px;
  z-index: 10;
  box-shadow: var(--box-shadow-1);
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  transition: background-color 0.2s ease, transform 0.1s ease;
  margin: 0 2px;
}

.toolbar-btn:hover {
  background-color: var(--primary-lighter);
  color: var(--primary-color);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.document-title {
  font-weight: 600;
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color);
  max-width: 500px;
}

/* 主内容区 */
.pdf-main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  height: calc(100% - 56px);
  min-height: calc(85vh - 56px);
}

/* PDF内容区 */
.pdf-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--body-color);
  height: 100%;
  width: 100%;
}

/* PDF内容 */
.pdf-content {
  flex: 1;
  overflow-y: auto;
  background-color: #e5e7eb;
  padding: 12px; /* 增加适当内边距创造呼吸空间 */
  display: flex;
  justify-content: center;
  position: relative;
  height: 100%;
  width: 100%;
}

.pdf-wrapper {
  transition: transform 0.2s ease;
  margin: 0 auto;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18); /* 增强阴影效果，提升立体感 */
  border-radius: 6px; /* 增加圆角，看起来更现代 */
  overflow: hidden;
  width: 92%; /* 控制在92%，在提供充足空间的同时保持美观 */
  max-width: 1400px; /* 恢复最大宽度限制，避免在特大屏幕上过度拉伸 */
  height: auto;
  min-height: 75vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: white;
  border: 1px solid #e2e8f0; /* 添加微妙的边框 */
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  min-height: 80vh;
  border: none;
  background-color: white;
}

.pdf-loading, .pdf-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 5;
}

.loading-message {
  margin-top: 16px;
  font-size: 16px;
  color: var(--text-color-secondary);
}

/* 暗色模式支持 */
:deep(.pdf-viewer-container) {
  --card-color: var(--n-card-color);
  --primary-color: var(--n-primary-color);
  --text-color: var(--n-text-color);
  --border-color: var(--n-border-color);
  --body-color: var(--n-color);
}

/* 暗色模式 */
:global(.dark-mode) .pdf-viewer-container {
  --text-color: #f9fafb;
  --text-color-secondary: #e5e7eb;
  --text-color-tertiary: #9ca3af;
  --card-color: #1f2937;
  --body-color: #111827;
  --border-color: #374151;
  --box-shadow-1: 0 1px 3px rgba(0, 0, 0, 0.3);
  --box-shadow-3: 0 10px 15px rgba(0, 0, 0, 0.3);
}

:global(.dark-mode) .pdf-content {
  background-color: #1e293b; /* 深色但不是纯黑的背景，减少对比度 */
}

:global(.dark-mode) .pdf-loading,
:global(.dark-mode) .pdf-error {
  background-color: rgba(0, 0, 0, 0.7);
  color: #f9fafb;
}

:global(.dark-mode) .pdf-wrapper {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  border-color: #334155; /* 更柔和的边框颜色 */
}

/* 全屏模式优化 */
:fullscreen .pdf-viewer-container {
  background-color: var(--body-color);
  padding: 0;
  height: 100vh;
  width: 100vw;
}

:fullscreen .pdf-main-content {
  height: calc(100vh - 56px);
  width: 100vw;
}

:fullscreen .pdf-content {
  padding: 16px; /* 增加全屏模式下的内边距，创造更舒适的阅读空间 */
  background-color: #f1f5f9; /* 使用更柔和的背景色 */
}

:fullscreen .pdf-wrapper {
  width: 90%; /* 全屏模式下使用更协调的宽度比例 */
  max-width: 1600px; /* 恢复全屏模式下的最大宽度限制 */
  min-height: 85vh;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); /* 全屏模式下增强阴影效果 */
}

:fullscreen .pdf-iframe {
  min-height: 85vh;
}

/* 添加页面滚动时的平滑过渡 */
.pdf-content {
  scroll-behavior: smooth;
}

/* 添加页面边框 */
.pdf-wrapper {
  border: 1px solid var(--border-color);
}
</style>