<template>
  <div
      class="md-viewer"
      :class="{ 'md-dark': isDarkMode }"
  >
    <!-- 内容区域 -->
    <div class="md-viewer-content" ref="contentRef" @scroll="handleContentScroll">
      <markdown-renderer
          :content="markdown"
          :isDarkMode="isDarkMode"
          @headings-updated="updateHeadings"
          ref="rendererRef"
      />
    </div>

    <!-- 使用目录组件 -->
    <MarkdownTOC
        :content="markdown"
        @update-active-heading="updateActiveHeading"
        @toc-collapsed="handleTocCollapsed"
        ref="tocComponentRef"
    />

    <!-- 返回顶部按钮 -->
    <div
        class="back-to-top"
        :class="{ 'visible': showBackToTop }"
        @click="scrollToTop"
        title="返回顶部"
    >
      <svg viewBox="0 0 1024 1024" class="back-to-top-icon" xmlns="http://www.w3.org/2000/svg">
        <path d="M752.896 438.6816c4.5056-295.6288-236.4416-429.568-252.6208-438.272V0l-0.4608 0.2048L499.4048 0v0.4096c-16.2304 8.704-257.1776 142.6432-252.672 438.272-49.0496 32.0512-100.4544 88.9344-92.2624 187.392 8.192 98.304 102.8096 163.584 139.008 160.0512 36.2496-3.584 25.7024-30.8736 25.7024-30.8736l12.3904-50.9952s53.4016 82.0224 70.5536 81.9712c15.36-1.2288 88.576-0.1024 97.28 0h0.8192c8.7552-0.1024 81.92-1.2288 97.28 0 17.1008 0 70.5536-81.92 70.5536-81.92l12.3904 50.944s-10.496 27.2896 25.7024 30.8736c36.2496 3.5328 130.8672-61.696 139.0592-160.1024 8.192-98.3552-43.264-155.2896-92.3136-187.3408z m-253.0816-4.3008c-6.8608-0.1536-96.4608-3.4304-104.704-109.1072 3.0208-100.4544 97.6896-109.3632 104.704-109.824 7.1168 0.512 101.7344 9.3696 104.704 109.824-8.192 105.6768-97.8432 108.9536-104.704 109.056z m-52.9408 509.3888a21.5552 21.5552 0 0 1-21.3504 21.76 21.6064 21.6064 0 0 1-21.4528-21.7088v-107.52c0-12.032 9.5744-21.76 21.4528-21.76 11.776 0 21.3504 9.728 21.3504 21.76v107.52-0.0512z m78.6944 58.2144a21.8624 21.8624 0 0 1-21.7088 22.016 21.8624 21.8624 0 0 1-21.7088-22.016v-159.8464c0-12.1856 9.728-22.016 21.6576-22.016 12.032 0 21.76 9.8304 21.76 22.016v159.8464z m72.448-83.456a21.5552 21.5552 0 0 1-21.4528 21.7088 21.6064 21.6064 0 0 1-21.4016-21.76v-76.6976a21.504 21.504 0 0 1 21.4016-21.6576c11.8272 0 21.4528 9.728 21.4528 21.6576v76.6976z" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import MarkdownRenderer from './MarkdownRenderer.vue';
import MarkdownTOC from './MarkdownTOC.vue';

// 定义属性
const props = defineProps({
  markdown: {
    type: String,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['toc-ready']);

// 定义引用和状态
const contentRef = ref(null);
const rendererRef = ref(null);
const tocComponentRef = ref(null);
const headings = ref([]);
const tocCollapsed = ref(false);
const activeHeadingId = ref('');
const isScrolling = ref(false);
// 添加返回顶部按钮的状态
const showBackToTop = ref(false);
// 滚动显示阈值 (滚动多少像素后显示返回顶部按钮)
const scrollThreshold = 200; // 降低阈值，让按钮更容易显示

// 处理内容区域滚动事件
const handleContentScroll = (event) => {
  if (isScrolling.value) return;

  // 获取滚动位置
  const scrollTop = event.target.scrollTop;

  // 根据滚动位置控制返回顶部按钮的显示
  showBackToTop.value = scrollTop > scrollThreshold;

  // 主动触发滚动检测
  if (tocComponentRef.value) {
    // 在滚动时重新检查当前可见标题
    // 这会触发TOC组件重新评估哪个标题是活动的
    const scrollEvent = new CustomEvent('content-scrolled', {detail: {scrollTop: scrollTop}});
    window.dispatchEvent(scrollEvent);
  }
};

// 全局滚动处理
const handleWindowScroll = () => {
  // 获取窗口滚动位置
  const windowScrollTop = window.scrollY || document.documentElement.scrollTop;
  // 获取内容容器滚动位置
  const contentScrollTop = contentRef.value ? contentRef.value.scrollTop : 0;

  // 取两者较大值决定是否显示返回顶部按钮
  const maxScrollTop = Math.max(windowScrollTop, contentScrollTop);
  showBackToTop.value = maxScrollTop > scrollThreshold;
};

// 实现返回顶部功能
const scrollToTop = () => {
  if (!contentRef.value) return;

  try {
    isScrolling.value = true;

    // 平滑滚动内容容器到顶部
    contentRef.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // 同时确保窗口也滚动到顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // 重置活动标题为第一个标题
    if (headings.value.length > 0) {
      activeHeadingId.value = headings.value[0].id;
    }

    // 重置滚动标志
    setTimeout(() => {
      isScrolling.value = false;
    }, 500); // 设置较长的超时时间，确保滚动完成
  } catch (error) {
    console.error('返回顶部失败:', error);
    isScrolling.value = false;
  }
};

// 从TOC组件接收活动标题更新
const updateActiveHeading = (headingId) => {
  activeHeadingId.value = headingId;
};

// 更新标题列表
const updateHeadings = (newHeadings) => {
  headings.value = newHeadings;

  if (newHeadings.length > 0 && !activeHeadingId.value) {
    activeHeadingId.value = newHeadings[0].id;
  }

  emit('toc-ready', newHeadings);
};

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id);
  if (!element || !contentRef.value) return;

  try {
    isScrolling.value = true;

    // 获取内容容器
    const container = contentRef.value;

    // 滚动到元素
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // 标记为活动标题
    activeHeadingId.value = id;

    // 重置滚动标志
    setTimeout(() => {
      isScrolling.value = false;
    }, 100);
  } catch (error) {
    console.error('滚动到标题失败:', error);
    isScrolling.value = false;
  }
};

// 监听主题变化
watch(() => props.isDarkMode, (newValue) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', newValue);
  }
});

// 监听内容变化
watch(() => props.markdown, () => {
  activeHeadingId.value = '';

  // 内容变化后，确保滚动到顶部
  if (contentRef.value) {
    contentRef.value.scrollTop = 0;
    // 重置返回顶部按钮的状态
    showBackToTop.value = false;
  }
});

// 组件挂载后执行初始化
onMounted(() => {
  // 从本地存储恢复目录折叠状态
  const savedCollapsed = localStorage.getItem('md-toc-collapsed');
  if (savedCollapsed !== null) {
    tocCollapsed.value = savedCollapsed === 'true';
  }

  // 初始化主题
  if (props.isDarkMode && typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  // 确保内容从顶部开始
  if (contentRef.value) {
    contentRef.value.scrollTop = 0;
  }

  // 监听哈希变更，支持从URL直接跳转到指定标题
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      scrollToHeading(hash);
    }
  });

  // 添加窗口滚动事件监听
  window.addEventListener('scroll', handleWindowScroll, {passive: true});

  // 初始检查滚动位置
  handleWindowScroll();

  // 如果初始URL包含哈希，滚动到对应标题
  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    if (hash) {
      // 延迟执行，确保DOM已完全加载
      setTimeout(() => {
        scrollToHeading(hash);
      }, 500);
    }
  }
});

const handleTocCollapsed = (collapsed) => {
  tocCollapsed.value = collapsed;
};


// 组件卸载前清理
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark');
  }

  // 移除事件监听器
  window.removeEventListener('hashchange', () => {
  });
  window.removeEventListener('scroll', handleWindowScroll);
});
</script>

<style>
.md-viewer {
  display: flex;
  width: 100%;
  height: auto;
  position: relative;
  background-color: #ffffff;
  color: #1a202c;
  overflow: visible;
}

.md-viewer.md-dark {
  background-color: #1f2937;
  color: #e5e7eb;
}

/* 修改Markdown内容容器样式 - 移除右侧多余边距 */
.md-viewer-content {
  flex: 1;
  overflow-y: visible;
  padding: 0;
  width: 100%; /* 使用100%宽度 */
  margin-right: 0; /* 移除右侧边距，因为document-content已经处理了 */
  height: auto;
  scroll-behavior: smooth;
  transition: margin-right 0.3s ease;
}

.md-toc-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #6366f1;
}

/* 返回顶部按钮样式 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 100;
  padding: 8px;
}

.back-to-top-icon {
  width: 100%;
  height: 100%;
  display: block;
  fill: #2C60BE;
  transition: fill 0.3s ease;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  background-color: #ffffff;
  box-shadow: 0 6px 15px rgba(44, 96, 190, 0.3);
  transform: translateY(-3px);
}

.back-to-top:hover .back-to-top-icon {
  fill: #1e4bab;
}

.back-to-top:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(44, 96, 190, 0.25);
}

/* 暗色模式下的返回顶部按钮 */
.md-dark .back-to-top {
  background-color: rgba(31, 41, 55, 0.9);
}

.md-dark .back-to-top-icon {
  fill: #60a5fa;
}

.md-dark .back-to-top:hover {
  background-color: rgba(31, 41, 55, 1);
  box-shadow: 0 6px 15px rgba(96, 165, 250, 0.3);
}

.md-dark .back-to-top:hover .back-to-top-icon {
  fill: #93c5fd;
}

.md-viewer.toc-collapsed .md-viewer-content {
  margin-right: 48px; /* 折叠状态下右侧只预留折叠按钮的宽度 */
  transition: margin-right 0.3s ease;
  width: calc(100% - 48px); /* 计算新的宽度 */
}

/* 暗色主题适配 */
.md-dark .md-toc {
  background-color: #1f2937;
  border-left-color: #4b5563;
}

.md-dark .md-toc-header {
  background-color: #1f2937;
  border-bottom-color: #4b5563;
}

.md-dark .md-toc-header h3 {
  color: #818cf8;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .md-viewer-content {
    margin-right: 0;
  }

  /* 在小屏幕上调整按钮位置，避免遮挡内容 */
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 42px;
    height: 42px;
  }
}

/* 打印时隐藏返回顶部按钮 */
@media print {
  .back-to-top {
    display: none;
  }
}
</style>