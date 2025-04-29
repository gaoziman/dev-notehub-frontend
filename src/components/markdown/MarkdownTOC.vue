<template>
  <div class="simple-toc" :class="{ 'collapsed': isCollapsed }" ref="tocRef">
    <div class="toc-content">
      <div class="toc-header">
        <h3 class="toc-title">目录</h3>
      </div>

      <div class="toc-items">
        <template v-if="headings.length > 0">
          <a v-for="heading in headings"
             :key="heading.id"
             :href="`#${heading.id}`"
             :class="['toc-item', `toc-level-${heading.level}`]"
             @click.prevent="scrollToHeading(heading.id)">
            {{ heading.text }}
          </a>
        </template>
        <div v-else class="toc-empty">
          没有找到目录内容
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch, onMounted, nextTick, onUnmounted} from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});

const headings = ref([]);
const isCollapsed = ref(false);
const headerHeight = ref(0);
const tocRef = ref(null); // 新增ref引用目录元素

// 直接从文本提取标题
const extractHeadings = (text) => {
  if (!text) return [];

  const extracted = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    // 匹配Markdown标题格式
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');

      extracted.push({
        id,
        text,
        level,
        line: index + 1
      });
    }
  });

  return extracted;
};


// 处理标题点击
const scrollToHeading = (id) => {
  const element = document.getElementById(id);
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth' });
};

// 监听内容变化
watch(() => props.content, (newContent) => {
  if (newContent) {
    headings.value = extractHeadings(newContent);
    console.log('发现标题数量:', headings.value.length);

    // 内容变化时更新目录位置
    nextTick(() => {
      updateHeaderHeight();
    });
  }
}, { immediate: true });

// 获取并更新头部高度
const updateHeaderHeight = () => {
  nextTick(() => {
    const headerElement = document.querySelector('.document-header');
    if (headerElement && tocRef.value) {
      // 获取头部实际高度
      headerHeight.value = headerElement.offsetHeight;

      // 计算文档头部加内边距的总高度
      const totalHeaderHeight = headerHeight.value + 16; // 减小内边距，避免过大的间隔

      // 设置TOC元素样式
      tocRef.value.style.top = `${totalHeaderHeight}px`;
      tocRef.value.style.height = `calc(100vh - ${totalHeaderHeight}px - 24px)`;

      console.log('更新目录位置:', `top: ${totalHeaderHeight}px`);
    }
  });
};

// 监听窗口滚动事件
const handleScroll = () => {
  updateHeaderHeight();
};

// 组件挂载
onMounted(() => {
  // 初始更新头部高度
  updateHeaderHeight();

  // 添加窗口事件监听器
  window.addEventListener('resize', updateHeaderHeight);
  window.addEventListener('scroll', handleScroll);

  // 延迟更新确保DOM完全渲染
  setTimeout(updateHeaderHeight, 100);
  setTimeout(updateHeaderHeight, 500);
});

// 组件销毁时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', updateHeaderHeight);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.simple-toc {
  position: fixed;
  right: 0;
  width: 260px;
  background-color: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 20; /* 提高z-index值，确保高于document-header */
  top: 0; /* 初始值，会被JavaScript动态设置 */
  height: 100vh; /* 初始值，会被JavaScript动态设置 */
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.simple-toc.collapsed {
  width: 50px;
  transform: translateX(210px);
}

.toc-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.toc-header {
  padding: 16px;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.toc-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #6366f1;
  margin: 0;
}

.toc-toggle {
  cursor: pointer;
  background-color: #6366f1;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.toc-toggle:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toc-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.toc-item {
  display: block;
  padding: 8px 16px;
  text-decoration: none;
  color: #4b5563;
  border-left: 3px solid transparent;
  margin-bottom: 2px;
  transition: all 0.2s;
  font-size: 14px;
  cursor: pointer;
}

.toc-item:hover {
  background-color: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  transform: translateX(2px);
}

.toc-level-1 {
  font-weight: 600;
  padding-left: 16px;
}

.toc-level-2 {
  padding-left: 24px;
}

.toc-level-3 {
  padding-left: 32px;
}

.toc-level-4 {
  padding-left: 40px;
}

.toc-level-5, .toc-level-6 {
  padding-left: 48px;
}

.toc-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

/* 折叠状态下的样式 */
.simple-toc.collapsed .toc-title {
  display: none;
}

.simple-toc.collapsed .toc-items {
  display: none;
}

.simple-toc.collapsed .toc-header {
  border-bottom: none;
  justify-content: center;
  padding: 16px 0;
}

.simple-toc.collapsed .toc-toggle {
  writing-mode: vertical-rl;
  padding: 8px 4px;
  height: auto;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .simple-toc {
    background-color: #1f2937;
    border-left-color: #374151;
  }

  .toc-header {
    border-bottom-color: #374151;
  }

  .toc-title {
    color: #818cf8;
  }

  .toc-toggle {
    background-color: #818cf8;
  }

  .toc-toggle:hover {
    background-color: #6366f1;
  }

  .toc-item {
    color: #9ca3af;
  }

  .toc-item:hover {
    background-color: rgba(129, 140, 248, 0.05);
    color: #818cf8;
    border-left-color: #818cf8;
  }

  .toc-empty {
    color: #6b7280;
  }
}

/* 滚动条样式 */
.toc-items::-webkit-scrollbar {
  width: 6px;
}

.toc-items::-webkit-scrollbar-track {
  background: transparent;
}

.toc-items::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

@media (prefers-color-scheme: dark) {
  .toc-items::-webkit-scrollbar-thumb {
    background-color: #4b5563;
  }
}
</style>