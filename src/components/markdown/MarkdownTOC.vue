<template>
  <div
      class="toc-container"
      :class="{ 'toc-collapsed': props.collapsed, 'dark-mode': isDarkMode }"
      ref="tocContainerRef"
  >
    <div class="toc-wrapper" ref="tocWrapperRef">
      <div class="toc-header">
        <h3 class="toc-title">目录</h3>
        <button
            class="toc-toggle"
            @click="toggleCollapse"
            :title="props.collapsed ? '展开目录' : '收起目录'"
        >
          <svg viewBox="0 0 24 24" class="toggle-icon" :class="{ 'is-collapsed': props.collapsed }">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
        </button>
      </div>

      <div class="toc-scrollable" ref="tocScrollableRef">
        <div class="toc-items">
          <template v-if="headings.length > 0">
            <a v-for="heading in headings"
               :key="heading.id"
               :href="`#${heading.id}`"
               :class="[
                'toc-item',
                `toc-level-${heading.level}`,
                { 'active': activeHeadingId === heading.id }
              ]"
               @click.prevent="scrollToHeading(heading.id)">
              <span class="toc-indicator"></span>
              <span class="toc-text">{{ heading.text }}</span>
            </a>
          </template>
          <div v-else class="toc-empty">
            没有找到目录内容
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch, onMounted, nextTick, onUnmounted, computed} from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update-active-heading', 'toc-collapsed']);

// 状态管理
const headings = ref([]);
const isCollapsed = ref(false);
const activeHeadingId = ref('');
const tocContainerRef = ref(null);
const tocWrapperRef = ref(null);
const tocScrollableRef = ref(null);
const observer = ref(null);
const scrollYPosition = ref(0);
const headerHeight = ref(64);


// 提取标题函数
const extractHeadings = (text) => {
  if (!text) return [];

  const extracted = [];
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeBlockDelimiter = '';

  lines.forEach((line, index) => {
    // 检查是否进入或离开代码块
    const codeBlockMatch = line.match(/^(```|~~~)(\w*)?$/);
    if (codeBlockMatch) {
      const delimiter = codeBlockMatch[1];
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockDelimiter = delimiter;
      } else if (delimiter === codeBlockDelimiter) {
        inCodeBlock = false;
        codeBlockDelimiter = '';
      }
    }

    // 只有在代码块外才处理标题
    if (!inCodeBlock) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');

        extracted.push({
          id,
          text,
          level,
          line: index + 1
        });
      }
    }
  });

  return extracted;
};

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`找不到ID为${id}的标题元素`);
    return;
  }

  // 设置当前活动的标题ID
  activeHeadingId.value = id;

  // 滚动到元素
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  // 添加临时高亮效果
  element.classList.add('md-heading-active');
  setTimeout(() => {
    element.classList.remove('md-heading-active');
  }, 2000);

  // 通知父组件标题已更新
  emit('update-active-heading', id);
};

// 切换目录折叠状态
const toggleCollapse = () => {
  // 通知父组件目录折叠状态需要切换
  emit('toc-collapsed', !props.collapsed);

  // 保存状态到本地存储
  try {
    localStorage.setItem('md-toc-collapsed', (!props.collapsed).toString());
  } catch (e) {
    console.error('无法保存目录状态:', e);
  }
};

// 确保活动目录项在视图中可见
const scrollActiveTocItemIntoView = () => {
  if (!tocScrollableRef.value || !activeHeadingId.value) return;

  nextTick(() => {
    const activeItem = tocScrollableRef.value.querySelector(`.active`);
    if (!activeItem) return;

    const container = tocScrollableRef.value;
    const itemTop = activeItem.offsetTop;
    const itemHeight = activeItem.offsetHeight;
    const containerHeight = container.clientHeight;
    const containerScrollTop = container.scrollTop;

    // 计算项目底部相对于容器的位置
    const itemBottom = itemTop + itemHeight;

    // 如果项目不在可视区域内
    if (itemTop < containerScrollTop || itemBottom > containerScrollTop + containerHeight) {
      // 将项目滚动到容器中间位置
      container.scrollTo({
        top: itemTop - (containerHeight / 2) + (itemHeight / 2),
        behavior: 'smooth'
      });
    }
  });
};

// 设置滚动监听，更新当前活动的标题
const setupScrollSpy = () => {
  // 如果已有observer，先断开连接
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }

  // 等待DOM更新
  nextTick(() => {
    // 确保在浏览器环境且有标题元素
    if (typeof IntersectionObserver === 'undefined' || headings.value.length === 0) return;

    // 获取所有标题元素
    const headingElements = headings.value
        .map(heading => document.getElementById(heading.id))
        .filter(Boolean);

    if (headingElements.length === 0) {
      console.warn('未找到有效的标题元素');
      return;
    }

    // 创建IntersectionObserver实例
    observer.value = new IntersectionObserver(
        (entries) => {
          // 找到可见的标题元素
          const visibleEntries = entries.filter(entry => entry.isIntersecting);

          if (visibleEntries.length > 0) {
            // 按照到视口顶部的距离排序
            visibleEntries.sort((a, b) => {
              const rectA = a.boundingClientRect;
              const rectB = b.boundingClientRect;
              // 选择最接近顶部且已经进入视口的标题
              return Math.abs(rectA.top) - Math.abs(rectB.top);
            });

            // 获取最接近顶部的标题
            const closestHeading = visibleEntries[0].target;
            if (closestHeading && closestHeading.id) {
              activeHeadingId.value = closestHeading.id;
              emit('update-active-heading', closestHeading.id);
              scrollActiveTocItemIntoView();
            }
          } else if (entries.length > 0) {
            // 没有可见标题时尝试找到最近的
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            let closestHeading = null;
            let minDistance = Infinity;

            headingElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              const distance = Math.abs(rect.top);
              if (distance < minDistance) {
                minDistance = distance;
                closestHeading = el;
              }
            });

            if (closestHeading && closestHeading.id) {
              activeHeadingId.value = closestHeading.id;
              emit('update-active-heading', closestHeading.id);
              scrollActiveTocItemIntoView();
            }
          }
        },
        {
          rootMargin: '-80px 0px -70% 0px',
          threshold: [0, 0.1, 0.5, 1]
        }
    );

    // 监视所有标题元素
    headingElements.forEach(el => {
      if (el) observer.value.observe(el);
    });
  });
};

// 更新目录容器的位置和样式
const updateTocPosition = () => {
  if (!tocContainerRef.value || !tocWrapperRef.value) return;

  const headerElement = document.querySelector('.document-header');
  const footerElement = document.querySelector('.document-footer');

  // 获取当前滚动位置
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  scrollYPosition.value = scrollY;

  // 更新header高度
  if (headerElement) {
    headerHeight.value = headerElement.offsetHeight;
  }

  // 获取可用的视口高度
  const viewportHeight = window.innerHeight;

  // 设置初始顶部位置 - 标题高度加上一些间距
  let topPosition = headerHeight.value + 16;

  // 如果滚动位置超过标题高度，调整顶部位置为固定值
  if (scrollY > headerHeight.value) {
    topPosition = 16; // 固定在视口顶部以下16px
  }

  // 设置目录容器的顶部位置
  tocContainerRef.value.style.top = `${topPosition}px`;

  // 计算目录可用高度
  let availableHeight = viewportHeight - topPosition - 20; // 底部留出20px间距

  // 如果页脚在视口中，调整高度避免重叠
  if (footerElement) {
    const footerRect = footerElement.getBoundingClientRect();

    if (footerRect.top < viewportHeight) {
      // 页脚顶部到视口顶部的距离减去目录顶部位置
      availableHeight = footerRect.top - topPosition - 20;
    }
  }

  // 确保最小高度
  availableHeight = Math.max(200, availableHeight);

  // 设置目录包装器的最大高度
  tocWrapperRef.value.style.maxHeight = `${availableHeight}px`;
};

// 节流函数，限制函数调用频率
const throttle = (fn, delay) => {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
};

// 使用节流的窗口事件处理函数
const handleWindowEvents = throttle(() => {
  updateTocPosition();
}, 50);

// 监听内容变化
watch(() => props.content, (newContent) => {
  if (newContent) {
    headings.value = extractHeadings(newContent);

    // 内容变化时重新计算
    nextTick(() => {
      updateTocPosition();

      // 默认选中第一个标题
      if (headings.value.length > 0) {
        activeHeadingId.value = headings.value[0].id;
        emit('update-active-heading', activeHeadingId.value);
      }

      // 设置滚动监听
      setupScrollSpy();
    });
  }
}, {immediate: true});

// 监听滚动位置
watch(scrollYPosition, () => {
  scrollActiveTocItemIntoView();
});

// 组件挂载
onMounted(() => {
  // 从本地存储恢复目录折叠状态
  try {
    const savedCollapsed = localStorage.getItem('md-toc-collapsed');
    if (savedCollapsed !== null) {
      isCollapsed.value = savedCollapsed === 'true';
      // 初始化时也发送折叠状态
      emit('toc-collapsed', isCollapsed.value);
    }
  } catch (e) {
    console.error('无法读取目录状态:', e);
  }

  // 添加窗口事件监听器
  window.addEventListener('resize', handleWindowEvents, {passive: true});
  window.addEventListener('scroll', handleWindowEvents, {passive: true});

  // 初始更新目录位置
  updateTocPosition();

  // 延迟设置以确保DOM完全加载
  setTimeout(() => {
    updateTocPosition();

    // 默认选中第一个标题
    if (headings.value.length > 0) {
      activeHeadingId.value = headings.value[0].id;
      emit('update-active-heading', headings.value[0].id);
    }

    // 设置滚动监听
    setupScrollSpy();
  }, 300);
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleWindowEvents);
  window.removeEventListener('scroll', handleWindowEvents);

  // 断开观察器连接
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
});
</script>

<style scoped>
.toc-container {
  position: fixed;
  right: 0;
  top: 80px; /* 初始值，会被JS动态更新 */
  width: var(--toc-width, 260px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20;
  /* 确保目录始终贴靠右侧边缘 */
  pointer-events: auto;
}

.toc-wrapper {
  background-color: #ffffff;
  border-radius: 12px 0 0 12px; /* 只对左侧设置圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 140px); /* 初始值，会被JS动态更新 */
  transition: max-height 0.3s ease;
  border: 1px solid #e5e7eb;
  border-right: none; /* 移除右侧边框 */
}

.toc-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 2;
}

.toc-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.toc-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.toc-toggle:hover {
  background-color: #f3f4f6;
  color: #4f46e5;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
  transition: transform 0.3s ease;
}

.toggle-icon.is-collapsed {
  transform: rotate(180deg);
}

.toc-scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
  position: relative;
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
}

.toc-scrollable::-webkit-scrollbar {
  width: 4px;
}

.toc-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.toc-scrollable::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.3);
  border-radius: 4px;
}

.toc-scrollable::-webkit-scrollbar-thumb:hover {
  background-color: rgba(99, 102, 241, 0.5);
}

.toc-items {
  padding: 0 16px;
}

/* 目录项基础样式 - 统一颜色方案 */
.toc-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin-bottom: 4px;
  text-decoration: none;
  color: #374151;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.4;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background-color: #6366f1;
  transition: width 0.2s ease;
  border-radius: 0 3px 3px 0;
}

.toc-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}

/* 积极改进选中项样式 */
.toc-item.active {
  background-color: rgba(99, 102, 241, 0.12);
  font-weight: 600;
  color: #4338ca;
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.1);
}

.toc-item.active .toc-indicator {
  width: 4px;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
}

/* 目录级别样式 - 使用字体大小和字重来区分层次，而非颜色 */
.toc-level-1 {
  padding-left: 16px;
  font-weight: 600;
  font-size: 14.5px;
}

.toc-level-2 {
  padding-left: 24px;
  font-weight: 500;
  font-size: 14px;
}

.toc-level-3 {
  padding-left: 32px;
  font-size: 13.5px;
  font-weight: 400;
}

.toc-level-4 {
  padding-left: 40px;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.9;
}

.toc-level-5, .toc-level-6 {
  padding-left: 48px;
  font-size: 12.5px;
  font-weight: 400;
  opacity: 0.8;
}

.toc-empty {
  padding: 20px 16px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

/* 折叠状态样式 */
.toc-collapsed {
  width: var(--toc-collapsed-width, 48px); /* 使用变量控制宽度 */
}

.toc-collapsed .toc-wrapper {
  border-radius: 8px 0 0 8px; /* 折叠时保持左侧圆角 */
}

.toc-collapsed .toc-title,
.toc-collapsed .toc-scrollable {
  display: none; /* 折叠时隐藏内容 */
}

.toc-collapsed .toc-header {
  padding: 16px 8px;
  justify-content: center;
  border-bottom: none;
}

.toc-collapsed .toc-toggle {
  transform: rotate(180deg); /* 旋转折叠按钮 */
}

/* 暗色模式样式 - 现在基于 isDarkMode 属性而不是媒体查询 */
/* 将原来的媒体查询样式转移到 .dark-mode 类选择器中 */
.dark-mode .toc-wrapper {
  background-color: #1f2937;
  border-color: #374151;
}

.dark-mode .toc-header {
  background-color: #1f2937;
  border-bottom-color: #374151;
}

.dark-mode .toc-title {
  background: linear-gradient(90deg, #818cf8 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.dark-mode .toc-toggle {
  color: #9ca3af;
}

.dark-mode .toc-toggle:hover {
  background-color: #374151;
  color: #a5b4fc;
}

/* 暗色模式下的目录项 */
.dark-mode .toc-item {
  color: #d1d5db;
}

.dark-mode .toc-item:hover {
  background-color: #374151;
  color: #f9fafb;
}

/* 暗色模式下的活动目录项 */
.dark-mode .toc-item.active {
  background-color: rgba(129, 140, 248, 0.2);
  color: #a5b4fc;
  box-shadow: 0 1px 3px rgba(129, 140, 248, 0.2);
}

.dark-mode .toc-item.active .toc-indicator {
  background-color: #818cf8;
  box-shadow: 0 0 8px rgba(129, 140, 248, 0.7);
}

/* 暗色模式下使用透明度来区分层级 */
.dark-mode .toc-level-4 {
  opacity: 0.9;
}

.dark-mode .toc-level-5, .dark-mode .toc-level-6 {
  opacity: 0.8;
}

.dark-mode .toc-empty {
  color: #6b7280;
}

.dark-mode .toc-scrollable::-webkit-scrollbar-thumb {
  background-color: rgba(129, 140, 248, 0.3);
}

.dark-mode .toc-scrollable::-webkit-scrollbar-thumb:hover {
  background-color: rgba(129, 140, 248, 0.5);
}

/* 响应式调整 */
@media (max-width: 1280px) {
  .toc-container {
    width: var(--toc-width, 240px);
  }

  .toc-collapsed {
    width: var(--toc-collapsed-width, 44px); /* 适应较小屏幕 */
  }
}

/* 移动设备适配 */
@media (max-width: 768px) {
  .toc-container {
    display: none;
  }
}
</style>