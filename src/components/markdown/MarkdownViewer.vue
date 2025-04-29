<template>
  <div
      class="md-viewer"
      :class="{ 'md-dark': isDarkMode }"
  >
    <!-- 内容区域 -->
    <div class="md-viewer-content" ref="contentRef" @scroll="handleScroll">
      <markdown-renderer
          :content="markdown"
          :isDarkMode="isDarkMode"
          @headings-updated="updateHeadings"
          ref="rendererRef"
      />
    </div>

    <!-- 使用第三方目录组件 -->
    <MarkdownTOC :content="markdown" />
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
const tocItemsRef = ref(null);
const headings = ref([]);
const tocCollapsed = ref(false);
const activeHeadingId = ref('');
const scrolling = ref(false);
let headingElements = [];
let observer = null;

// 使用IntersectionObserver替代useScrollspy
const setupScrollSpy = () => {
  // 清理之前的observer
  if (observer) {
    observer.disconnect();
  }

  // 等待DOM更新
  nextTick(() => {
    // 确保在浏览器环境且有内容元素
    if (typeof IntersectionObserver === 'undefined' || !contentRef.value) return;

    // 创建新的observer
    observer = new IntersectionObserver(
        (entries) => {
          if (scrolling.value) return;

          // 找到可见的标题元素
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            // 按照到视口顶部的距离排序
            visibleEntries.sort((a, b) => {
              const rectA = a.boundingClientRect;
              const rectB = b.boundingClientRect;
              return Math.abs(rectA.top) - Math.abs(rectB.top);
            });

            // 获取最接近顶部的标题
            const closestHeading = visibleEntries[0].target;
            if (closestHeading && closestHeading.id) {
              activeHeadingId.value = closestHeading.id;
              scrollTocToActiveItem();
            }
          }
        },
        {
          rootMargin: '-80px 0px -20% 0px',
          threshold: 0
        }
    );

    // 观察所有标题元素
    headingElements.forEach(el => {
      if (el) observer.observe(el);
    });
  });
};

// 切换目录显示/隐藏
const toggleToc = () => {
  tocCollapsed.value = !tocCollapsed.value;
  localStorage.setItem('md-toc-collapsed', tocCollapsed.value.toString());
};

// 处理内容区域滚动事件
const handleScroll = () => {
  // 滚动由IntersectionObserver处理
};

// 滚动目录以确保活动项可见
const scrollTocToActiveItem = () => {
  if (!tocItemsRef.value || !activeHeadingId.value) return;

  nextTick(() => {
    const activeItem = tocItemsRef.value.querySelector(`.md-active`);
    if (!activeItem) return;

    const container = tocItemsRef.value;
    const itemTop = activeItem.offsetTop;
    const containerHeight = container.clientHeight;

    container.scrollTo({
      top: itemTop - (containerHeight / 2) + 20,
      behavior: 'smooth'
    });
  });
};

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id);
  if (!element || !contentRef.value) return;

  try {
    scrolling.value = true;
    activeHeadingId.value = id;

    const containerRect = contentRef.value.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scrollTop = contentRef.value.scrollTop + elementRect.top - containerRect.top - 20;

    contentRef.value.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });

    // 高亮标题
    element.classList.add('md-heading-active');
    setTimeout(() => {
      element.classList.remove('md-heading-active');
      scrolling.value = false;
    }, 2000);
  } catch (error) {
    console.error('滚动到标题时出错:', error);
    scrolling.value = false;
  }
};

// 更新标题列表
const updateHeadings = (newHeadings) => {
  headings.value = newHeadings;

  if (newHeadings.length > 0 && !activeHeadingId.value) {
    activeHeadingId.value = newHeadings[0].id;
  }

  emit('toc-ready', newHeadings);

  // 更新标题元素引用
  nextTick(() => {
    headingElements = newHeadings.map(heading => document.getElementById(heading.id));
    // 重新设置滚动监听
    setupScrollSpy();
  });
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
  headingElements = [];
  // 当内容变化时，会通过updateHeadings重新设置滚动监听
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
});

// 组件卸载前清理
onBeforeUnmount(() => {
  // 清理observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark');
  }
});
</script>
<style>
.md-viewer {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #ffffff;
  color: #1a202c;
  overflow: hidden;
}

.md-viewer.md-dark {
  background-color: #1f2937;
  color: #e5e7eb;
}

.md-viewer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin-right: 260px; /* 目录宽度 */
  width: 100%;
  height: 100%;
  scroll-behavior: smooth;
  transition: margin-right 0.3s ease;
}

/* 目录容器样式 */
.md-toc {
  position: fixed;
  top: 0;
  right: 0;
  width: 260px;
  height: 100vh;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: hidden;
  transition: transform 0.3s ease, width 0.3s ease;
}

.md-toc.collapsed {
  transform: translateX(calc(100% - 30px));
}

.md-toc-toggle {
  position: absolute;
  top: 50%;
  left: 0;
  width: 24px;
  height: 48px;
  background-color: #6366f1;
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  z-index: 2;
}

.toggle-icon {
  font-size: 14px;
  font-weight: bold;
}

/* 目录头部 */
.md-toc-header {
  padding: 20px 16px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background-color: #ffffff;
  z-index: 2;
}

.md-toc-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #6366f1;
}

/* 目录项容器 */
.md-toc-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  scroll-behavior: smooth;
}

/* 目录项样式 */
.md-toc-item {
  display: block;
  padding: 8px 16px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}

/* 目录项悬停效果 */
.md-toc-item:hover {
  background-color: rgba(99, 102, 241, 0.08);
  color: #5b5ef7;
  transform: translateX(2px);
}

/* 活动目录项 */
.md-toc-item.md-active {
  color: #5b5ef7 !important;
  border-left-color: #5b5ef7 !important;
  background-color: rgba(99, 102, 241, 0.1) !important;
  font-weight: 600 !important;
}

/* 不同级别目录项的缩进 */
.md-toc-item.md-level-1 {
  padding-left: 16px;
  font-weight: 600;
}

.md-toc-item.md-level-2 {
  padding-left: 24px;
}

.md-toc-item.md-level-3 {
  padding-left: 32px;
}

.md-toc-item.md-level-4 {
  padding-left: 40px;
}

.md-toc-item.md-level-5,
.md-toc-item.md-level-6 {
  padding-left: 48px;
}

/* 空目录提示 */
.md-toc-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

/* 目录收起时的内容区样式 */
.md-toc.collapsed + .md-viewer-content,
.md-viewer:has(.md-toc.collapsed) .md-viewer-content {
  margin-right: 30px;
}

/* 自定义滚动条 */
.md-viewer-content::-webkit-scrollbar,
.md-toc-items::-webkit-scrollbar {
  width: 8px;
}

.md-viewer-content::-webkit-scrollbar-track,
.md-toc-items::-webkit-scrollbar-track {
  background: transparent;
}

.md-viewer-content::-webkit-scrollbar-thumb,
.md-toc-items::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
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

.md-dark .md-toc-item {
  color: #9ca3af;
}

.md-dark .md-toc-item:hover {
  background-color: rgba(129, 140, 248, 0.05);
  color: #818cf8;
}

.md-dark .md-toc-item.md-active {
  color: #818cf8 !important;
  border-left-color: #818cf8 !important;
  background-color: rgba(129, 140, 248, 0.1) !important;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .md-viewer-content {
    margin-right: 0;
  }

  .md-toc {
    transform: translateX(100%);
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .md-toc.collapsed {
    transform: translateX(calc(100% - 30px));
  }
}
</style>