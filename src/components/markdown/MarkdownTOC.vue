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
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
          </svg>
        </button>
      </div>

      <div class="toc-scrollable" ref="tocScrollableRef">
        <div class="toc-items">
          <template v-if="headings.length > 0">
            <a
                v-for="heading in headings"
                :key="heading.id"
                :href="`#${heading.id}`"
                :class="[
            'toc-item',
            `toc-level-${heading.level}`,
            { 'active': activeHeadingId === heading.id }
            ]"
                @click.prevent="scrollToHeading(heading.id)"
            >
              {{ heading.text }}
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
const activeHeadingId = ref('');
const tocContainerRef = ref(null);
const tocWrapperRef = ref(null);
const tocScrollableRef = ref(null);
const observer = ref(null);
const scrollYPosition = ref(0);
const headerHeight = ref(64);

// 添加ID计数器来确保同名标题有不同的ID
const idCounters = ref(new Map());

// 生成唯一ID的函数 - 与MarkdownRenderer.vue保持一致
const generateUniqueId = (text) => {
  // 基础ID生成：将文本转换为小写并替换非字母数字字符
  const baseId = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');

  // 检查是否已存在此ID
  const count = idCounters.value.get(baseId) || 0;
  idCounters.value.set(baseId, count + 1);

  // 如果是第一次出现，直接使用baseId；否则添加计数器
  return count === 0 ? baseId : `${baseId}-${count + 1}`;
};

// 修改后的提取标题函数 - 只提取1-3级标题
const extractHeadings = (text) => {
  if (!text) return [];

  // 重置ID计数器，确保每次提取都从头开始计数
  idCounters.value.clear();

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

        // 只包含1、2、3级标题
        if (level <= 3) {
          const text = match[2].trim();

          // 使用唯一ID生成函数
          const id = generateUniqueId(text);

          extracted.push({
            id,
            text,
            level,
            line: index + 1
          });
        }
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
  // 每次内容变化时重置ID计数器
  idCounters.value.clear();

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
      emit('toc-collapsed', savedCollapsed === 'true');
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

  // 清理ID计数器
  idCounters.value.clear();
});
</script>

<style scoped>
/* 基础容器 */
.toc-container {
  position: fixed;
  right: 12px;
  top: 80px;
  width: 240px;
  z-index: 20;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.06));
}

/* 主容器 */
.toc-wrapper {
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 120px);
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

/* 标题栏 */
.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  position: relative;
}

.toc-title {
  margin: 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.01em;
}

.toc-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.toc-toggle:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  transition: transform 0.3s ease;
}

.toggle-icon.is-collapsed {
  transform: rotate(180deg);
}

/* 滚动区域 */
.toc-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
  position: relative;
}

.toc-scrollable::-webkit-scrollbar {
  width: 4px;
}

.toc-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.toc-scrollable::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 10px;
}

.toc-scrollable::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}

/* 目录项容器 */
.toc-items {
  position: relative;
}

/* 目录项样式 */
.toc-item {
  display: block;
  position: relative;
  padding: 8px 18px;
  margin: 2px 8px;
  text-decoration: none;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
}

.toc-item:hover {
  background-color: rgba(99, 102, 241, 0.05);
  color: #6366F1;
  transform: translateX(2px);
}

/* 活动项样式 - 全新设计 */
.toc-item.active {
  background: linear-gradient(
      90deg,
      rgba(99, 102, 241, 0.08) 0%,
      rgba(139, 92, 246, 0.03) 100%
  );
  color: #6366F1;
  font-weight: 500;
  border-radius: 8px;
  position: relative;
  transform: translateX(3px) scale(1.01);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.06);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* 左侧装饰线 */
.toc-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  background: linear-gradient(to bottom, #6366F1, #8B5CF6);
  border-radius: 0 4px 4px 0;
  opacity: 0.9;
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
  transition: all 0.3s ease;
}

/* 右侧微妙指示器 */
.toc-item.active::after {
  content: "";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #6366F1;
  opacity: 0.7;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
}

/* 激活项悬停效果 */
.toc-item.active:hover {
  background: linear-gradient(
      90deg,
      rgba(99, 102, 241, 0.12) 0%,
      rgba(139, 92, 246, 0.05) 100%
  );
  transform: translateX(5px) scale(1.02);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.08);
}

.toc-item.active:hover::before {
  height: 70%;
  opacity: 1;
}

.toc-item.active:hover::after {
  transform: translateY(-50%) scale(1.2);
  opacity: 0.9;
}

/* 不同级别的缩进样式 */
.toc-level-1 {
  font-weight: 600;
  font-size: 15px;
  padding-left: 18px;
  color: #1f2937;
  margin-top: 6px;
}

/* 针对一级标题的特殊样式 */
.toc-level-1.active {
  background: linear-gradient(
      90deg,
      rgba(79, 70, 229, 0.1) 0%,
      rgba(139, 92, 246, 0.04) 100%
  );
  color: #4338ca;
  box-shadow: 0 3px 12px rgba(79, 70, 229, 0.08);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.toc-level-1.active::before {
  height: 70%;
  width: 4px;
  background: linear-gradient(to bottom, #4F46E5, #7C3AED);
  box-shadow: 0 0 8px rgba(79, 70, 229, 0.5);
}

.toc-level-2 {
  padding-left: 32px;
}

.toc-level-3 {
  padding-left: 46px;
  font-size: 13.5px;
}

/* 级别过渡样式 */
.toc-level-2 + .toc-level-1,
.toc-level-3 + .toc-level-1 {
  margin-top: 14px;
}

/* 空状态 */
.toc-empty {
  padding: 20px 15px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
}

/* 折叠状态 */
.toc-collapsed {
  width: 50px;
}

.toc-collapsed .toc-wrapper {
  border-radius: 12px 0 0 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.toc-collapsed .toc-title,
.toc-collapsed .toc-scrollable {
  display: none;
}

.toc-collapsed .toc-header {
  padding: 14px;
  justify-content: center;
  border-radius: 0 0 0 10px;
}

/* 暗色模式 */
.dark-mode .toc-wrapper {
  background-color: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dark-mode .toc-header {
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
}

.dark-mode .toc-item {
  color: #d1d5db;
}

.dark-mode .toc-item:hover {
  background-color: rgba(165, 180, 252, 0.08);
  color: #a5b4fc;
}

.dark-mode .toc-item.active {
  background: linear-gradient(
      90deg,
      rgba(129, 140, 248, 0.15) 0%,
      rgba(167, 139, 250, 0.06) 100%
  );
  color: #a5b4fc;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
}

.dark-mode .toc-item.active::before {
  background: linear-gradient(to bottom, #818cf8, #a78bfa);
  box-shadow: 0 0 8px rgba(129, 140, 248, 0.5);
}

.dark-mode .toc-item.active::after {
  background: #a5b4fc;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.15);
}

.dark-mode .toc-level-1 {
  color: #f3f4f6;
}

.dark-mode .toc-level-1.active {
  background: linear-gradient(
      90deg,
      rgba(129, 140, 248, 0.18) 0%,
      rgba(167, 139, 250, 0.08) 100%
  );
  color: #c7d2fe;
}

.dark-mode .toc-empty {
  color: #6b7280;
}

.dark-mode .toc-scrollable::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.dark-mode .toc-collapsed .toc-wrapper {
  background: rgba(31, 41, 55, 0.95);
}

/* 响应式调整 */
@media (max-width: 1366px) {
  .toc-container {
    width: 220px;
  }
}

/* 移动设备适配 */
@media (max-width: 768px) {
  .toc-container {
    width: 100%;
    position: static;
    margin-bottom: 20px;
    filter: none;
    right: 0;
  }

  .toc-wrapper {
    border-radius: 10px;
    max-height: 400px;
  }

  .toc-collapsed {
    width: 100%;
  }

  .toc-collapsed .toc-wrapper {
    border-radius: 10px;
  }
}
</style>