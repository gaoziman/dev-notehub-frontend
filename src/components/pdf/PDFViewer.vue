<template>
  <div class="pdf-viewer-container">
    <!-- 主工具栏 -->
    <div class="pdf-main-toolbar">
      <div class="toolbar-left">
        <n-button quaternary circle @click="toggleSidebar">
          <template #icon><icon-font type="icon-menu" /></template>
        </n-button>

        <div class="document-title">
          {{ documentTitle || '文档查看器' }}
        </div>
      </div>

      <div class="toolbar-right">
        <n-button quaternary circle @click="toggleFullscreen" class="mr-1">
          <template #icon>
            <icon-font :type="isFullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen'" />
          </template>
        </n-button>

        <n-button quaternary circle @click="downloadPdf" class="mr-1">
          <template #icon><icon-font type="icon-download" /></template>
        </n-button>

        <n-button quaternary circle @click="printPdf">
          <template #icon><icon-font type="icon-print" /></template>
        </n-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="pdf-main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <!-- 侧边栏 (缩略图/大纲) -->
      <div class="pdf-sidebar" v-if="sidebarOpen">
        <div class="sidebar-header">
          <n-tabs type="line" animated size="small" v-model:value="activeTab">
            <n-tab-pane name="thumbnails" tab="缩略图">
              <div class="thumbnails-container">
                <!-- 懒加载缩略图列表 -->
                <n-scrollbar style="max-height: calc(100vh - 160px)">
                  <div v-if="pageCount > 0" class="thumbnail-grid">
                    <div
                        v-for="page in displayedThumbnailPages"
                        :key="page"
                        class="thumbnail-item"
                        :class="{ active: currentPage === page }"
                        @click="jumpToPage(page)"
                    >
                      <div class="thumbnail-wrapper">
                        <n-skeleton v-if="!loadedThumbnails[page]" animated/>
                        <vue-pdf-embed
                            v-show="loadedThumbnails[page]"
                            :source="pdfUrl"
                            :page="page"
                            class="thumbnail"
                            @loaded="onThumbnailLoaded(page)"
                        />
                        <div class="thumbnail-hover-effect"></div>
                      </div>
                      <div class="page-number">{{ page }}</div>
                    </div>
                  </div>
                  <div v-else class="thumbnail-loading-state">
                    <n-spin size="medium" />
                    <p class="loading-text">正在加载文档...</p>
                  </div>
                </n-scrollbar>

                <!-- 缩略图页码导航器 -->
                <div v-if="pageCount > 20" class="thumbnail-navigator">
                  <n-button size="small" @click="loadPreviousThumbnails" :disabled="currentThumbnailPage === 1">
                    <template #icon><icon-font type="icon-arrow-left" /></template>
                  </n-button>
                  <span class="thumbnail-page-indicator">{{ currentThumbnailPage }}/{{ Math.ceil(pageCount / thumbnailsPerPage) }}</span>
                  <n-button size="small" @click="loadNextThumbnails" :disabled="currentThumbnailPage >= Math.ceil(pageCount / thumbnailsPerPage)">
                    <template #icon><icon-font type="icon-arrow-right" /></template>
                  </n-button>
                </div>
              </div>
            </n-tab-pane>
            <n-tab-pane name="bookmarks" tab="书签">
              <div class="bookmarks-container" v-if="hasOutline">
                <n-scrollbar style="max-height: calc(100vh - 160px)">
                  <tree-view
                      :data="outlineTree"
                      @node-click="handleBookmarkClick"
                      :defaultExpandAll="true"
                  />
                </n-scrollbar>
              </div>
              <div v-else class="no-bookmarks">
                <n-empty description="此文档没有书签">
                  <template #extra>
                    <n-button size="small" @click="activeTab = 'thumbnails'">
                      查看缩略图
                    </n-button>
                  </template>
                </n-empty>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>

      <!-- PDF内容区 -->
      <div class="pdf-content-area">
        <!-- 工具栏 -->
        <div class="pdf-toolbar">
          <div class="toolbar-group">
            <n-button-group>
              <n-button @click="prevPage" :disabled="currentPage <= 1 || loading">
                <template #icon><icon-font type="icon-arrow-left" /></template>
                上一页
              </n-button>
              <n-popover trigger="click" placement="bottom">
                <template #trigger>
                  <n-button>
                    {{ currentPage }} / {{ pageCount }}
                    <template #icon><icon-font type="icon-down" /></template>
                  </n-button>
                </template>
                <div class="page-jumper">
                  <n-input-number
                      v-model:value="pageInputValue"
                      :min="1"
                      :max="pageCount"
                      size="small"
                  />
                  <n-button size="small" type="primary" @click="jumpToPage(pageInputValue)">
                    跳转
                  </n-button>
                </div>
              </n-popover>
              <n-button @click="nextPage" :disabled="currentPage >= pageCount || loading">
                <template #icon-right><icon-font type="icon-arrow-right" /></template>
                下一页
              </n-button>
            </n-button-group>
          </div>

          <div class="toolbar-group">
            <n-button-group>
              <n-button @click="zoomOut" :disabled="loading">
                <template #icon><icon-font type="icon-zoom-out" /></template>
              </n-button>
              <n-dropdown
                  trigger="click"
                  :options="zoomOptions"
                  @select="handleZoomSelect"
              >
                <n-button style="min-width: 80px">
                  {{ Math.round(zoom * 100) }}%
                  <template #icon-right><icon-font type="icon-down" /></template>
                </n-button>
              </n-dropdown>
              <n-button @click="zoomIn" :disabled="loading">
                <template #icon><icon-font type="icon-zoom-in" /></template>
              </n-button>
            </n-button-group>
          </div>

          <div class="toolbar-group view-options">
            <n-button-group>
              <n-tooltip>
                <template #trigger>
                  <n-button @click="fitToWidth">
                    <template #icon><icon-font type="icon-fit-width" /></template>
                  </n-button>
                </template>
                适合宽度
              </n-tooltip>
              <n-tooltip>
                <template #trigger>
                  <n-button @click="fitToPage">
                    <template #icon><icon-font type="icon-fit-page" /></template>
                  </n-button>
                </template>
                适合页面
              </n-tooltip>
              <n-tooltip>
                <template #trigger>
                  <n-button @click="rotateLeft">
                    <template #icon><icon-font type="icon-rotate-left" /></template>
                  </n-button>
                </template>
                向左旋转
              </n-tooltip>
              <n-tooltip>
                <template #trigger>
                  <n-button @click="rotateRight">
                    <template #icon><icon-font type="icon-rotate-right" /></template>
                  </n-button>
                </template>
                向右旋转
              </n-tooltip>
            </n-button-group>
          </div>
        </div>

        <!-- PDF内容显示区域 -->
        <div
            class="pdf-content"
            ref="pdfContainer"
            :class="{
            'single-page': viewMode === 'single',
            'continuous': viewMode === 'continuous'
          }"
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
                <n-button @click="reloadPdf">重试</n-button>
              </template>
            </n-result>
          </div>

          <!-- PDF内容 -->
          <div
              class="pdf-wrapper"
              :style="{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center top'
            }"
          >
            <vue-pdf-embed
                v-if="pdfUrl && !error"
                :source="pdfUrl"
                :page="currentPage"
                @loaded="onDocumentLoaded"
                @error="onError"
                @password-requested="onPasswordRequested"
                class="pdf-document"
                ref="pdfEmbedRef"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 密码输入对话框 -->
    <n-modal v-model:show="passwordModal" preset="dialog" title="需要密码">
      <template #content>
        <p>此PDF文档受密码保护，请输入密码以查看内容。</p>
        <n-input
            v-model:value="password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="submitPassword"
        />
      </template>
      <template #action>
        <n-button @click="passwordModal = false">取消</n-button>
        <n-button type="primary" @click="submitPassword">确认</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, onUnmounted, watch, nextTick} from 'vue';
import {
  NButton, NButtonGroup, NSpin, NResult, NTabs, NTabPane,
  NDropdown, NTooltip, NInputNumber, NPopover, NModal, NInput,
  NSkeleton, NScrollbar, NEmpty
} from 'naive-ui';
import VuePdfEmbed from 'vue-pdf-embed';
import IconFont from '@/components/common/IconFont.vue';
import TreeView from './TreeView.vue'; // 导入自定义树形组件

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
  }
});

// 状态变量
const loading = ref(true);
const error = ref(null);
const errorMessage = ref('');
const currentPage = ref(1);
const pageCount = ref(0);
const zoom = ref(2.63); // 初始缩放为100%
const rotation = ref(0);
const pdfContainer = ref(null);
const pdfEmbedRef = ref(null);
const sidebarOpen = ref(true);
const documentTitle = ref(props.defaultTitle);
const isFullscreen = ref(false);
const viewMode = ref('continuous'); // 默认使用连续滚动模式
const activeTab = ref('thumbnails');
const outline = ref([]);
const pageInputValue = ref(1);
const pdfInstance = ref(null);
const passwordModal = ref(false);
const password = ref('');
const passwordCallback = ref(null);
const pageReferences = ref({});

// 缩略图懒加载相关状态
const loadedThumbnails = ref({});
const thumbnailsPerPage = 12; // 每页显示的缩略图数量
const currentThumbnailPage = ref(1);
const displayedThumbnailPages = computed(() => {
  const start = (currentThumbnailPage.value - 1) * thumbnailsPerPage + 1;
  const end = Math.min(start + thumbnailsPerPage - 1, pageCount.value);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// 缩略图页面控制
const loadNextThumbnails = () => {
  if (currentThumbnailPage.value < Math.ceil(pageCount.value / thumbnailsPerPage)) {
    currentThumbnailPage.value++;
  }
};

const loadPreviousThumbnails = () => {
  if (currentThumbnailPage.value > 1) {
    currentThumbnailPage.value--;
  }
};

// 记录缩略图加载状态
const onThumbnailLoaded = (page) => {
  loadedThumbnails.value[page] = true;
};

// 判断是否有书签
const hasOutline = computed(() => {
  return outlineTree.value && outlineTree.value.length > 0;
});

// 向父组件抛出事件
const emit = defineEmits(['theme-changed']);

// 缩放选项
const zoomOptions = [
  {
    label: '50%',
    key: 0.5
  },
  {
    label: '75%',
    key: 0.75
  },
  {
    label: '100%',
    key: 1
  },
  {
    label: '125%',
    key: 1.25
  },
  {
    label: '150%',
    key: 1.5
  },
  {
    label: '200%',
    key: 2
  },
  {
    label: '250%',
    key: 2.5
  },
  {
    label: '263%',
    key: 2.63
  },
  {
    label: '300%',
    key: 3
  },
  {
    label: '适合宽度',
    key: 'fit-width'
  },
  {
    label: '适合页面',
    key: 'fit-page'
  }
];

// 处理缩放选择
const handleZoomSelect = (key) => {
  if (key === 'fit-width') {
    fitToWidth();
  } else if (key === 'fit-page') {
    fitToPage();
  } else {
    zoom.value = key;
  }
};

// 显示侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// 全屏模式
const toggleFullscreen = () => {
  const container = document.querySelector('.pdf-viewer-container');

  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      isFullscreen.value = true;
    }).catch(err => {
      console.error('无法进入全屏模式:', err);
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
    }).catch(err => {
      console.error('无法退出全屏模式:', err);
    });
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
  const printWindow = window.open(props.pdfUrl);
  printWindow.onload = function () {
    printWindow.print();
  };
};

// 键盘事件处理
const handleKeyDown = (e) => {
  if (loading.value) return;

  switch (e.key) {
    case 'ArrowLeft':
      prevPage();
      break;
    case 'ArrowRight':
      nextPage();
      break;
    case 'ArrowUp':
      if (e.ctrlKey || e.metaKey) {
        zoomIn();
      }
      break;
    case 'ArrowDown':
      if (e.ctrlKey || e.metaKey) {
        zoomOut();
      }
      break;
    case '0':
      if (e.ctrlKey || e.metaKey) {
        zoom.value = 1;
        e.preventDefault();
      }
      break;
  }
};

// 页面导航
const nextPage = () => {
  if (currentPage.value < pageCount.value) {
    currentPage.value++;
    pageInputValue.value = currentPage.value;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    pageInputValue.value = currentPage.value;
  }
};

const jumpToPage = (page) => {
  if (page >= 1 && page <= pageCount.value) {
    currentPage.value = page;
    pageInputValue.value = page;
    // 滚动到页面顶部
    if (pdfContainer.value) {
      pdfContainer.value.scrollTop = 0;
    }
  }
};

// 处理书签点击
const handleBookmarkClick = (node) => {
  if (node.dest) {
    jumpToDestination(node.dest, node.label);
  }
};

// 改进后的书签跳转函数
const jumpToDestination = async (dest, title = '') => {
  console.log('跳转到书签:', title, dest);

  if (!dest) {
    console.warn('书签目标为空');
    return;
  }

  // 确保PDF实例已加载
  if (!pdfInstance.value) {
    console.warn('PDF实例尚未加载完成，无法跳转');
    return;
  }

  try {
    // 处理不同类型的目标参数
    if (typeof dest === 'number') {
      // 如果是直接页码数字
      console.log('目标是页码数字:', dest);
      jumpToPage(dest);
      return;
    }

    if (typeof dest === 'string') {
      // 如果是字符串引用，需要通过PDF.js解析
      console.log('目标是字符串引用:', dest);
      try {
        const destArray = await pdfInstance.value.getDestination(dest);
        if (destArray) {
          handleDestArray(destArray);
        }
      } catch (e) {
        console.error('解析字符串引用失败:', e);
      }
      return;
    }

    if (Array.isArray(dest)) {
      // 处理数组格式的目标
      console.log('目标是数组格式:', dest);
      handleDestArray(dest);
      return;
    }

    if (dest && typeof dest === 'object') {
      // 处理对象格式的目标
      console.log('目标是对象格式:', dest);
      if (dest.num !== undefined) {
        // 直接包含页码的对象
        jumpToPage(dest.num);
        return;
      }

      if (dest.gen !== undefined && dest.num !== undefined) {
        // PDF引用对象格式
        const pageRef = dest;
        const pageNumber = await resolvePageRef(pageRef);
        if (pageNumber) {
          jumpToPage(pageNumber);
        }
        return;
      }

      if (dest.name && dest.name === 'XYZ') {
        // XYZ格式目标
        if (dest.page !== undefined) {
          jumpToPage(dest.page);
          return;
        }
      }
    }

    // 如果以上所有尝试都失败，记录错误
    console.warn('无法识别的书签目标格式:', dest);
  } catch (error) {
    console.error('书签跳转出错:', error);
  }
};

// 处理数组格式的目标
const handleDestArray = async (destArray) => {
  if (!destArray || !destArray.length) return;

  // 尝试从数组中提取页面引用
  const pageRef = destArray[0];

  if (!pageRef) return;

  try {
    if (typeof pageRef === 'number') {
      // 有些PDF直接使用页码数字
      jumpToPage(pageRef + 1); // PDF.js页码从0开始，我们的界面从1开始
    } else if (typeof pageRef === 'object') {
      // 页面引用对象格式
      const pageNumber = await resolvePageRef(pageRef);
      if (pageNumber) {
        jumpToPage(pageNumber);
      }
    } else if (typeof pageRef === 'string') {
      // 字符串引用可能需要额外处理
      try {
        const ref = await pdfInstance.value.getDestination(pageRef);
        if (ref) {
          handleDestArray(ref);
        }
      } catch (e) {
        console.error('处理字符串引用失败:', e);
      }
    }
  } catch (e) {
    console.error('处理目标数组失败:', e);
  }
};

// 解析页面引用对象为实际页码
const resolvePageRef = async (pageRef) => {
  if (!pageRef) return null;

  // 如果已缓存该引用的页码，直接返回
  const refKey = `${pageRef.num}:${pageRef.gen || 0}`;
  if (pageReferences.value[refKey] !== undefined) {
    return pageReferences.value[refKey];
  }

  try {
    // 使用PDF.js的方法解析页面引用
    if (pdfInstance.value && pdfInstance.value._pdfInfo) {
      // 尝试使用getPageIndex方法（如果可用）
      if (typeof pdfInstance.value.getPageIndex === 'function') {
        const pageIndex = await pdfInstance.value.getPageIndex(pageRef);
        if (pageIndex !== -1) {
          const pageNumber = pageIndex + 1; // PDF.js页码从0开始
          pageReferences.value[refKey] = pageNumber;
          return pageNumber;
        }
      }

      // 备用方法：有些PDF.js版本可能提供pageNumber属性
      if (pageRef.pageNumber !== undefined) {
        return pageRef.pageNumber;
      }

      // 备用方法：处理num可能直接是页码的情况
      if (pageRef.num !== undefined && typeof pageRef.num === 'number') {
        // 这是一个猜测，有些PDF可能将num作为页码
        const pageNumber = pageRef.num;
        pageReferences.value[refKey] = pageNumber;
        return pageNumber;
      }
    }
  } catch (e) {
    console.error('解析页面引用失败:', e);
  }

  return null;
};

// 缩放控制
const zoomIn = () => {
  if (zoom.value < 3) {
    zoom.value = Math.min(3, zoom.value + 0.25);
  }
};

const zoomOut = () => {
  if (zoom.value > 0.25) {
    zoom.value = Math.max(0.25, zoom.value - 0.25);
  }
};

// 适合宽度
const fitToWidth = () => {
  if (!pdfContainer.value) return;

  const containerWidth = pdfContainer.value.clientWidth - 40; // 减去内边距
  const pdfElement = pdfContainer.value.querySelector('.vue-pdf-embed');

  if (pdfElement) {
    const pdfWidth = pdfElement.offsetWidth;
    if (pdfWidth > 0) {
      zoom.value = containerWidth / pdfWidth;
    }
  }
};

// 适合页面
const fitToPage = () => {
  if (!pdfContainer.value) return;

  const containerHeight = pdfContainer.value.clientHeight - 40; // 减去内边距
  const containerWidth = pdfContainer.value.clientWidth - 40;
  const pdfElement = pdfContainer.value.querySelector('.vue-pdf-embed');

  if (pdfElement) {
    const pdfHeight = pdfElement.offsetHeight;
    const pdfWidth = pdfElement.offsetWidth;

    if (pdfHeight > 0 && pdfWidth > 0) {
      const heightRatio = containerHeight / pdfHeight;
      const widthRatio = containerWidth / pdfWidth;
      zoom.value = Math.min(heightRatio, widthRatio);
    }
  }
};

// 旋转控制
const rotateLeft = () => {
  rotation.value = (rotation.value - 90) % 360;
};

const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360;
};

// 重新加载PDF
const reloadPdf = () => {
  loading.value = true;
  error.value = null;
  errorMessage.value = '';
  currentPage.value = 1;
  pageInputValue.value = 1;
};

// 密码处理
const onPasswordRequested = (callback) => {
  passwordModal.value = true;
  passwordCallback.value = callback;
};

const submitPassword = () => {
  if (passwordCallback.value && password.value) {
    passwordCallback.value(password.value);
    passwordModal.value = false;
  }
};

// 书签树结构
const outlineTree = ref([]);

// 从扁平大纲构建树形结构
const buildOutlineTree = (flatOutline) => {
  if (!flatOutline || flatOutline.length === 0) return [];

  // 初始化树结构和堆栈
  const tree = [];
  const stack = [{ children: tree, level: -1 }];

  // 处理每个大纲项
  for (const item of flatOutline) {
    const node = {
      id: Math.random().toString(36).substr(2, 9),
      label: item.title.trim(),
      dest: item.dest,
      children: [],
      level: item.level
    };

    // 找到合适的父节点
    while (stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    // 添加到父节点
    stack[stack.length - 1].children.push(node);

    // 将当前节点加入堆栈，以便其可能成为其他节点的父节点
    stack.push(node);
  }

  return tree;
};

// 提取并构建书签
const buildOutline = async (document) => {
  if (!document || !document.getOutline) return [];

  try {
    const outlineData = await document.getOutline();
    if (!outlineData || outlineData.length === 0) return [];

    // 构建更详细的书签结构
    const processOutlineItems = async (items, level = 0) => {
      if (!items || !items.length) return [];

      const result = [];
      for (const item of items) {
        // 基本书签项
        const outlineItem = {
          title: item.title || '未命名书签',
          dest: item.dest,
          level,
          items: [] // 子书签
        };

        // 处理子书签
        if (item.items && item.items.length) {
          outlineItem.items = await processOutlineItems(item.items, level + 1);
        }

        result.push(outlineItem);
      }

      return result;
    };

    return await processOutlineItems(outlineData);
  } catch (e) {
    console.error('构建书签结构失败:', e);
    return [];
  }
};

// 将嵌套的大纲结构扁平化处理 - 保留层级信息
const flattenOutline = (items, level = 0, result = []) => {
  if (!items || !items.length) return result;

  for (const item of items) {
    // 添加当前项，包含层级信息
    result.push({
      title: item.title,
      dest: item.dest,
      level
    });

    // 递归处理子项
    if (item.items && item.items.length) {
      flattenOutline(item.items, level + 1, result);
    }
  }

  return result;
};

// 构建页面引用映射表
const buildPageReferences = async (document) => {
  if (!document || !document._pdfInfo) return;

  try {
    // 清空之前的映射
    pageReferences.value = {};

    // 预处理页面引用
    for (let i = 1; i <= document.numPages; i++) {
      try {
        const page = await document.getPage(i);
        if (page && page._pageInfo) {
          const ref = page._pageInfo.ref;
          if (ref) {
            const refKey = `${ref.num}:${ref.gen || 0}`;
            pageReferences.value[refKey] = i;
          }
        }
      } catch (e) {
        console.warn(`处理第${i}页引用信息失败:`, e);
      }
    }

    console.log('页面引用映射表构建完成:', pageReferences.value);
  } catch (e) {
    console.error('构建页面引用映射表失败:', e);
  }
};

// 事件处理程序
const onDocumentLoaded = async (document) => {
  try {
    console.log('PDF文档加载完成');
    pdfInstance.value = document;
    loading.value = false;
    pageCount.value = document.numPages;

    // 清空缩略图加载状态
    loadedThumbnails.value = {};
    currentThumbnailPage.value = 1;

    // 提取文档标题
    if (document._pdfInfo && document._pdfInfo.metadata) {
      const metadata = document._pdfInfo.metadata;
      if (metadata.info && metadata.info.Title) {
        documentTitle.value = metadata.info.Title;
      }
    }

    // 提取并构建大纲/书签
    const outlineItems = await buildOutline(document);
    console.log('书签结构:', outlineItems);

    // 设置扁平化的大纲用于兼容性
    outline.value = flattenOutline(outlineItems);

    // 设置树形大纲
    outlineTree.value = buildOutlineTree(outline.value);
    console.log('树形书签结构:', outlineTree.value);

    // 预处理页面引用信息，构建页码映射表
    await buildPageReferences(document);

    // 如果当前页大于总页数，重置为第一页
    if (currentPage.value > pageCount.value) {
      currentPage.value = 1;
      pageInputValue.value = 1;
    }

    // 默认缩放设置
    // nextTick(() => {
    //   fitToWidth();
    // });
  } catch (err) {
    console.error('PDF文档处理失败:', err);
    loading.value = false;
    error.value = true;
    errorMessage.value = `处理PDF文档时出错: ${err.message || '未知错误'}`;
  }
};

const onError = (err) => {
  loading.value = false;
  error.value = true;
  console.error('PDF加载错误:', err);
  errorMessage.value = `无法加载PDF文档: ${err.message || '未知错误'}`;
};

// 生命周期钩子
onMounted(() => {
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown);

  // 添加窗口大小改变事件监听
  window.addEventListener('resize', fitToWidth);

  // 添加全屏更改事件监听
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });

  // 初始化页面输入值
  pageInputValue.value = currentPage.value;
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', fitToWidth);
  document.removeEventListener('fullscreenchange', () => {});
});

// 当页面变化时自动滚动到顶部
watch(currentPage, () => {
  if (pdfContainer.value) {
    pdfContainer.value.scrollTop = 0;
  }
});

// 监听pdfUrl的变化
watch(() => props.pdfUrl, () => {
  // 重置状态
  loading.value = true;
  error.value = null;
  errorMessage.value = '';
  currentPage.value = 1;
  pageInputValue.value = 1;
  pageCount.value = 0;
  rotation.value = 0;
  documentTitle.value = props.defaultTitle;
  outline.value = [];
  outlineTree.value = [];
  pageReferences.value = {};
  loadedThumbnails.value = {};
  currentThumbnailPage.value = 1;
}, {immediate: true});

// 监听黑暗模式变化
watch(() => props.isDarkTheme, (newValue) => {
  // 可以在这里处理主题变更的逻辑
  emit('theme-changed', newValue);
});

// 暴露组件方法，以便父组件可以调用
defineExpose({
  nextPage,
  prevPage,
  zoomIn,
  zoomOut,
  reloadPdf,
  fitToWidth,
  fitToPage,
  jumpToPage,
  jumpToDestination
});
</script>

<style scoped>
.pdf-viewer-container {
  --primary-color: #6366f1;
  --primary-light: rgba(99, 102, 241, 0.1);
  --primary-lighter: rgba(99, 102, 241, 0.05);
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #3b82f6;
  --text-color: #111827;
  --text-color-secondary: #374151;
  --text-color-tertiary: #6b7280;
  --card-color: #ffffff;
  --body-color: #f3f4f6;
  --border-color: #e5e7eb;
  --box-shadow-1: 0 1px 3px rgba(0, 0, 0, 0.1);
  --box-shadow-2: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --border-radius: 8px;
  --border-radius-small: 4px;
  --transition-speed: 0.3s;

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  background-color: var(--card-color);
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  z-index: 10;
  box-shadow: var(--box-shadow-1);
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
}

.document-title {
  margin-left: 16px;
  font-weight: 600;
  font-size: 1.1rem;
  max-width: 500px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color);
}

.mr-1 {
  margin-right: 8px;
}

/* 主内容区 */
.pdf-main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 侧边栏 */
.pdf-sidebar {
  width: 280px;
  height: 100%;
  border-right: 1px solid var(--border-color);
  background-color: var(--card-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-speed) ease;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.03);
  z-index: 5;
}

.sidebar-header {
  padding: 12px;
}

/* ====== 改进的缩略图样式 ====== */
.thumbnails-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 110px);
  position: relative;
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px;
}

.thumbnail-item {
  position: relative;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
}

.thumbnail-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(0,0,0,0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.thumbnail-item:hover .thumbnail-wrapper {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.thumbnail-item:hover .thumbnail-hover-effect {
  opacity: 1;
}

.thumbnail-item.active .thumbnail-wrapper {
  border: 2px solid var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.page-number {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  color: white;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
  z-index: 2;
}

.thumbnail-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  padding: 20px;
}

.loading-text {
  margin-top: 16px;
  color: var(--text-color-tertiary);
  font-size: 14px;
}

.thumbnail-navigator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  border-top: 1px solid var(--border-color);
  background-color: var(--card-color);
}

.thumbnail-page-indicator {
  font-size: 14px;
  color: var(--text-color-secondary);
  min-width: 60px;
  text-align: center;
}

/* ====== 改进的书签样式 ====== */
.bookmarks-container {
  height: calc(100vh - 160px);
  padding: 4px 0;
}

.no-bookmarks {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  padding: 20px;
}

/* PDF内容区 */
.pdf-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--body-color);
}

/* 工具栏 */
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--card-color);
  padding: 10px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar-group {
  display: flex;
  align-items: center;
}

.page-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

/* PDF内容 */
.pdf-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f0f0f0;
  padding: 24px;
  display: flex;
  justify-content: center;
  position: relative;
}

.pdf-wrapper {
  transition: transform 0.2s ease;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.pdf-document {
  display: block;
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

/* 视图模式 */
.pdf-content.single-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pdf-content.continuous {
  align-items: flex-start;
}

/* 暗色模式支持 */
:deep(.pdf-viewer-container) {
  --card-color: var(--n-card-color);
  --primary-color: var(--n-primary-color);
  --text-color: var(--n-text-color);
  --border-color: var(--n-border-color);
  --body-color: var(--n-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-sidebar {
    position: absolute;
    top: 56px;
    left: 0;
    height: calc(100% - 56px);
    z-index: 20;
    box-shadow: var(--box-shadow-2);
    width: 0;
  }

  .pdf-main-content.sidebar-open .pdf-sidebar {
    width: 280px;
  }

  .pdf-toolbar {
    padding: 8px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .toolbar-group {
    width: 100%;
  }

  .view-options {
    display: none;
  }

  .document-title {
    max-width: 150px;
    font-size: 1rem;
  }

  .thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    padding: 12px;
  }
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
  --box-shadow-2: 0 4px 6px rgba(0, 0, 0, 0.25);
}

:global(.dark-mode) .pdf-content {
  background-color: #111827;
}

:global(.dark-mode) .pdf-loading,
:global(.dark-mode) .pdf-error {
  background-color: rgba(0, 0, 0, 0.7);
  color: #f9fafb;
}

:global(.dark-mode) .thumbnail-wrapper {
  background-color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:global(.dark-mode) .thumbnail-item:hover .thumbnail-wrapper {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

:global(.dark-mode) .thumbnail-hover-effect {
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(255,255,255,0.1));
}
</style>