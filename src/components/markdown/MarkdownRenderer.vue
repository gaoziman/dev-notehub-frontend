<template>
  <div class="md-renderer" :class="{ 'dark-mode': isDarkMode }">
    <div v-if="loading" class="md-notice">
      加载内容中...
    </div>
    <div v-else-if="!content" class="md-notice">
      没有内容可显示
    </div>
    <div v-else class="md-content" v-html="renderedContent" ref="contentRef"></div>

    <!-- 图片预览组件 -->
    <div v-if="previewVisible" class="image-preview-container" @click.self="closePreview">
      <div class="preview-header">
        <span class="preview-counter">{{ currentImageIndex + 1 }} / {{ images.length }}</span>
        <button class="preview-close-btn" @click="closePreview">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <!-- 固定位置的导航按钮 -->
      <button v-if="images.length > 1" class="preview-nav-btn prev-btn" @click="prevImage">
        <svg viewBox="0 0 24 24" width="36" height="36">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <div class="preview-image-container">
        <img :src="currentImage.src" :alt="currentImage.alt" class="preview-image" />
      </div>

      <button v-if="images.length > 1" class="preview-nav-btn next-btn" @click="nextImage">
        <svg viewBox="0 0 24 24" width="36" height="36">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch, nextTick, onUnmounted} from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import DOMPurify from 'dompurify';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['headings-updated']);
const loading = ref(true);
const contentRef = ref(null);
const headings = ref([]);

// 图片预览相关状态
const previewVisible = ref(false);
const images = ref([]);
const currentImageIndex = ref(0);
const currentImage = computed(() => images.value[currentImageIndex.value] || { src: '', alt: '' });

// 打开预览
const openPreview = (index) => {
  currentImageIndex.value = index;
  previewVisible.value = true;
  // 禁止背景滚动
  document.body.style.overflow = 'hidden';
};

// 关闭预览
const closePreview = () => {
  previewVisible.value = false;
  // 恢复背景滚动
  document.body.style.overflow = '';
};

// 下一张图片
const nextImage = (e) => {
  e.stopPropagation();
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0; // 循环到第一张
  }
};

// 上一张图片
const prevImage = (e) => {
  e.stopPropagation();
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = images.value.length - 1; // 循环到最后一张
  }
};

// 键盘事件处理
const handleKeyDown = (e) => {
  if (!previewVisible.value) return;

  switch (e.key) {
    case 'Escape':
      closePreview();
      break;
    case 'ArrowRight':
      nextImage(e);
      break;
    case 'ArrowLeft':
      prevImage(e);
      break;
  }
};

// 初始化图片预览功能
const setupImagePreview = () => {
  if (!contentRef.value) return;

  // 获取所有图片元素
  const imgElements = contentRef.value.querySelectorAll('img');

  // 重置图片数组
  images.value = [];

  // 收集所有图片信息
  imgElements.forEach((img, index) => {
    images.value.push({
      src: img.src,
      alt: img.alt || `图片 ${index + 1}`
    });

    // 添加点击事件
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      openPreview(index);
    });
  });

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown);
};

// 配置markdown-it实例及插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value;

        // 为代码块添加复制按钮和折叠按钮，使用黑色Mac终端风格
        const codeId = `code-${Math.random().toString(36).substring(2, 10)}`;
        const collapseId = `collapse-${Math.random().toString(36).substring(2, 10)}`;
        return `<div class="md-code-block">
          <div class="md-code-header">
            <div class="md-code-dots">
              <span class="md-code-dot md-code-dot-red"></span>
              <span class="md-code-dot md-code-dot-yellow"></span>
              <span class="md-code-dot md-code-dot-green"></span>
            </div>
            <div class="md-code-language">${lang}</div>
            <div class="md-code-actions">
              <button class="md-copy-button" id="${codeId}">复制</button>
              <button class="md-collapse-button" id="${collapseId}">折叠</button>
            </div>
          </div>
          <pre class="language-${lang}" id="pre-${collapseId}"><code>${highlighted}</code></pre>
          <textarea style="display:none" id="content-${codeId}">${str}</textarea>
        </div>`;
      } catch (e) {
        console.error('代码高亮出错:', e);
      }
    }

    return `<pre class="language-plaintext"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

// 添加锚点插件，为标题生成ID
md.use(markdownItAnchor, {
  permalink: true,
  permalinkSymbol: '#',
  permalinkBefore: true,
  level: [1, 2, 3, 4, 5, 6],
  // 确保与TOC组件中的ID生成逻辑保持一致
  slugify: (s) => s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-'),
  permalink_class: 'header-anchor',
  callback: (token, info) => {
    // 收集标题信息
    if (token.tag && token.tag.match(/^h[1-6]$/)) {
      const level = parseInt(token.tag.substring(1));

      // 添加空值检查
      let title = '';
      if (token.children && Array.isArray(token.children)) {
        title = token.children
            .filter(t => t && (t.type === 'text' || t.type === 'code_inline'))
            .map(t => t.content || '')
            .join('');
      } else if (token.content) {
        // 如果没有children但有content，直接使用content
        title = token.content;
      }

      // 确保ID与链接匹配
      headings.value.push({
        id: info.slug,
        text: title,
        level: level
      });
    }
  }
});

// 设置标题点击事件
const setupHeadingClickEvents = () => {
  if (!contentRef.value) return;

  // 获取所有标题元素
  const headingElements = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headingElements.forEach(heading => {
    const id = heading.id;
    if (!id) return;

    // 确保标题是可点击的
    heading.style.cursor = 'pointer';

    // 添加点击事件，支持直接点击标题跳转
    heading.addEventListener('click', (event) => {
      // 检查点击是否来自锚点链接，如果是则不处理
      if (event.target.classList.contains('header-anchor')) {
        return;
      }

      // 更新浏览器地址栏，但不导航
      window.history.pushState(null, '', `#${id}`);

      // 触发标题高亮效果
      heading.classList.add('md-heading-active');
      setTimeout(() => {
        heading.classList.remove('md-heading-active');
      }, 2000);
    });
  });
};

// 渲染Markdown内容
const renderedContent = computed(() => {
  // 重置标题列表
  headings.value = [];

  if (!props.content) {
    console.warn('没有内容可渲染，目录将为空');
    return '';
  }

  console.log('准备渲染的Markdown内容:', props.content.substring(0, 100) + '...');

  try {
    // 渲染并清理HTML
    const html = md.render(props.content);
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span', 'details', 'summary'],
      ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'class', 'id', 'title', 'style',
        'width', 'height', 'data-*', 'align', 'open'],
      ALLOW_ARIA_ATTR: true,
      ALLOW_DATA_ATTR: true,
      USE_PROFILES: {
        html: true,
        svg: false,
        mathMl: false
      },
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      SANITIZE_DOM: true,
      KEEP_CONTENT: true
    });

    // 通知父组件标题已更新
    setTimeout(() => {
      console.log('提取到的标题数量:', headings.value.length);
      if (headings.value.length > 0) {
        console.log('提取到的标题:', headings.value.map(h => `${h.level}-${h.text}`).join(', '));
      } else {
        console.warn('未能提取到任何标题，请检查Markdown内容是否包含标题标记(#)');
      }
      emit('headings-updated', [...headings.value]);
    }, 10);

    return sanitized;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return `<div class="md-error">
      <h3>内容渲染出错</h3>
      <p>${error.message}</p>
    </div>`;
  }
});

// 设置代码折叠功能
const setupCodeCollapse = () => {
  if (!contentRef.value) return;

  const collapseButtons = contentRef.value.querySelectorAll('.md-collapse-button');

  collapseButtons.forEach(button => {
    button.addEventListener('click', () => {
      try {
        // 获取按钮ID
        const btnId = button.id;
        if (!btnId) return;

        // 查找对应的pre元素
        const preId = `pre-${btnId}`;
        const pre = document.getElementById(preId);

        if (!pre) return;

        // 切换折叠状态
        if (pre.classList.contains('md-code-collapsed')) {
          pre.classList.remove('md-code-collapsed');
          button.textContent = '折叠';
        } else {
          pre.classList.add('md-code-collapsed');
          button.textContent = '展开';
        }
      } catch (error) {
        console.error('折叠代码时出错:', error);
      }
    });
  });
};

// 设置代码复制功能
const setupCodeCopy = () => {
  if (!contentRef.value) return;

  const copyButtons = contentRef.value.querySelectorAll('.md-copy-button');

  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      try {
        // 获取按钮ID
        const btnId = button.id;
        if (!btnId) return;

        // 查找对应的隐藏textarea
        const contentId = `content-${btnId}`;
        const textarea = document.getElementById(contentId);

        if (!textarea) return;

        // 获取代码内容
        const code = textarea.value;

        navigator.clipboard.writeText(code)
            .then(() => {
              const originalText = button.textContent;
              button.textContent = '已复制!';
              button.classList.add('md-copied');

              setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('md-copied');
              }, 2000);
            })
            .catch(err => {
              console.error('复制失败:', err);
              button.textContent = '复制失败';
            });
      } catch (error) {
        console.error('复制代码时出错:', error);
      }
    });
  });
};

// 监听内容变化
watch(() => props.content, () => {
  loading.value = true;
  nextTick(() => {
    loading.value = false;
    nextTick(() => {
      setupCodeCopy();
      setupCodeCollapse(); // 初始化代码折叠功能
      setupHeadingClickEvents(); // 确保每次内容更新后重新绑定标题点击事件
      setupImagePreview(); // 初始化图片预览功能
    });
  });
});

// 挂载后初始化
onMounted(() => {
  loading.value = false;
  nextTick(() => {
    setupCodeCopy();
    setupCodeCollapse(); // 初始化代码折叠功能
    setupHeadingClickEvents(); // 确保初始化时绑定标题点击事件
    setupImagePreview(); // 初始化图片预览功能
  });
});

// 组件卸载时清理
onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown);

  // 恢复背景滚动（以防组件销毁时预览仍处于打开状态）
  document.body.style.overflow = '';
});
</script>

<style>
/* 基础样式 */
.md-renderer {
  color: #334155;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  width: 100%;
  height: auto;
  overflow-y: visible;
  transition: all 0.3s ease;
  background-color: transparent !important;
}

.md-content {
  width: 100%;
  max-width: 100%;
  padding: 32px 24px;
  min-height: 100px;
  background-color: transparent !important;
  box-sizing: border-box;
}

/* 通知和错误提示 */
.md-notice {
  padding: 1.2rem;
  background-color: rgba(236, 253, 245, 0.8);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.8rem;
  color: #047857;
  margin: 1.5rem;
  text-align: center;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
  animation: slideUpFade 0.5s ease-out;
  backdrop-filter: blur(4px);
}

.md-error {
  padding: 1.2rem;
  background-color: rgba(254, 242, 242, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.8rem;
  color: #b91c1c;
  margin: 1.5rem;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
  animation: slideUpFade 0.5s ease-out;
  backdrop-filter: blur(4px);
}

/* ====== 标题样式 ====== */
.md-content h1,
.md-content h2,
.md-content h3,
.md-content h4,
.md-content h5,
.md-content h6 {
  margin-top: 2.2em !important;
  margin-bottom: 0.9em !important;
  font-weight: 600 !important;
  line-height: 1.3 !important;
  position: relative !important;
  scroll-margin-top: 80px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  letter-spacing: -0.02em !important;
  padding-left: 0 !important;
  padding-bottom: 0.2em !important;
  border-radius: 4px !important;
  background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%);
}

/* 标题底部装饰线 */
.md-content h1::after,
.md-content h2::after,
.md-content h3::after,
.md-content h4::after,
.md-content h5::after,
.md-content h6::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 2.5em;
  height: 3px;
  background: linear-gradient(to right, #047857, #10b981);
  border-radius: 6px;
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 标题悬停效果 */
.md-content h1:hover,
.md-content h2:hover,
.md-content h3:hover,
.md-content h4:hover,
.md-content h5:hover,
.md-content h6:hover {
  transform: translateX(6px);
}

.md-content h1:hover::after,
.md-content h2:hover::after,
.md-content h3:hover::after,
.md-content h4:hover::after,
.md-content h5:hover::after,
.md-content h6:hover::after {
  width: 6em;
  background: linear-gradient(to right, #047857, #10b981, #34d399);
}

/* 标题锚点链接 */
.md-content h1 .header-anchor,
.md-content h2 .header-anchor,
.md-content h3 .header-anchor,
.md-content h4 .header-anchor,
.md-content h5 .header-anchor,
.md-content h6 .header-anchor {
  float: left;
  margin-left: -1.5em;
  margin-right: 0.5em;
  opacity: 0;
  text-decoration: none;
  color: #10b981;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  font-size: 0.85em;
  transform: translateX(-10px);
}

.md-content h1:hover .header-anchor,
.md-content h2:hover .header-anchor,
.md-content h3:hover .header-anchor,
.md-content h4:hover .header-anchor,
.md-content h5:hover .header-anchor,
.md-content h6:hover .header-anchor {
  opacity: 1;
  transform: translateX(0);
}

/* 各级标题的特定样式 */
.md-content h1 {
  font-size: 2.2rem !important;
  padding-bottom: 0.3em !important;
  letter-spacing: -0.5px !important;
  font-weight: 700 !important;
  color: #064e3b !important;
  background: linear-gradient(90deg, #064e3b 0%, #065f46 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-align: center !important;
}

.md-content h2 {
  font-size: 1.8rem !important;
  padding-bottom: 0.2em !important;
  letter-spacing: -0.3px !important;
  font-weight: 700 !important;
  color: #065f46 !important;
  background: linear-gradient(90deg, #065f46 0%, #047857 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  display: flex !important;
  align-items: center !important;
}

/* 添加emoji图标到h2标题前 */
.md-content h2::before {
  content: "🍃";
  margin-right: 8px;
  font-size: 1.4rem;
  -webkit-text-fill-color: #10b981;
}

.md-content h3 {
  font-size: 1.5rem !important;
  letter-spacing: -0.2px !important;
  font-weight: 600 !important;
  color: #047857 !important;
  background: linear-gradient(90deg, #047857 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.md-content h4 {
  font-size: 1.3rem !important;
  font-weight: 600 !important;
  color: #059669 !important;
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.md-content h5 {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  color: #10b981 !important;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.md-content h6 {
  font-size: 1rem !important;
  font-weight: 500 !important;
  color: #34d399 !important;
  background: linear-gradient(90deg, #34d399 0%, #6ee7b7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

/* 标题激活状态的样式 */
.md-heading-active {
  background: radial-gradient(circle at left, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%) !important;
  border-radius: 4px !important;
  padding-left: 8px !important;
  animation: pulseHeading 1.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

@keyframes pulseHeading {
  0% { background-color: rgba(16, 185, 129, 0.15); transform: translateX(0); }
  50% { background-color: rgba(16, 185, 129, 0.1); transform: translateX(2px); }
  100% { background-color: rgba(16, 185, 129, 0.05); transform: translateX(0); }
}

/* ====== 引用块样式 ====== */
.md-content blockquote {
  margin: 2em auto;
  padding: 1.8em 2em 1.8em 2.2em;
  max-width: 800px;
  width: 85%;
  border-left: none;
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.8) 0%, rgba(240, 253, 250, 0.8) 100%);
  border-radius: 1rem;
  position: relative;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
}

.md-content blockquote:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05);
  transform: translateY(-3px) scale(1.01);
}

/* 引用块左侧装饰 */
.md-content blockquote::before {
  content: "";
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 70px;
  line-height: 1;
  color: rgba(16, 185, 129, 0.15);
  font-family: 'Georgia', serif;
  z-index: 0;
}

/* 引用块顶部装饰 */
.md-content blockquote::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #047857, #10b981, #34d399);
  border-radius: 4px 4px 0 0;
}

.md-content blockquote p {
  margin: 0.7em 0;
  color: #334155;
  font-size: 1.05rem;
  line-height: 1.7;
  position: relative;
  z-index: 1;
  text-align: justify;
}

.md-content blockquote p:first-of-type {
  margin-top: 0;
}

.md-content blockquote p:last-of-type {
  margin-bottom: 0;
}

/* 引用块中的代码 */
.md-content blockquote code {
  background: rgba(255, 255, 255, 0.5);
  color: #059669;
  padding: 0.2em 0.5em;
  border-radius: 4px;
  font-size: 0.9em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 代码块样式 - Atom One Dark Theme */
.md-code-block {
  margin: 2em auto;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  position: relative;
  line-height: 0;
  background-color: #282c34;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  max-width: 90%;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.md-code-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}


/* 代码块头部 - macOS 风格 */
.md-code-header {
  height: 36px;
  background: #21252b;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}


.md-code-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.md-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.md-code-dot-red {
  background: #ff5f56;
}

.md-code-dot-yellow {
  background: #ffbd2e;
}

.md-code-dot-green {
  background: #27c93f;
}

.md-code-language {
  font-size: 12px;
  color: #9da5b4;
  text-transform: lowercase;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 代码操作按钮容器 */
.md-code-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 复制按钮样式 */
.md-copy-button {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #abb2bf;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 折叠按钮样式 */
.md-collapse-button {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #abb2bf;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.md-code-block:hover .md-copy-button,
.md-code-block:hover .md-collapse-button {
  opacity: 1;
}

.md-copy-button:hover,
.md-collapse-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.md-copy-button.md-copied {
  background: #98c379;
  color: #ffffff;
}

/* 代码内容区域 */
.md-content pre {
  margin: 0 !important;
  padding: 16px !important;
  color: #abb2bf !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  overflow-x: auto !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
  border: none !important;
  display: block !important;
  min-height: 0 !important;
  border-radius: 0 0 6px 6px !important;
}


/* 代码折叠状态 */
.md-content pre.md-code-collapsed {
  max-height: 100px;
  overflow-y: hidden;
  position: relative;
}

.md-content pre.md-code-collapsed::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  pointer-events: none;
}

.md-content pre code {
  background: none !important;
  color: inherit !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
  tab-size: 2 !important;
  display: inline !important;
  white-space: pre !important;
  max-width: 100% !important;
}

.md-content pre code::after {
  content: none !important;
}

.md-content pre br:last-child {
  display: none !important;
}


/* Atom One Dark 语法高亮 */
.hljs-comment,
.hljs-quote {
  color: #5c6370 !important;
  font-style: italic !important;
}

.hljs-doctag,
.hljs-keyword,
.hljs-formula {
  color: #c678dd !important;
}

.hljs-section,
.hljs-name,
.hljs-selector-tag,
.hljs-deletion,
.hljs-subst {
  color: #e06c75 !important;
}

.hljs-literal {
  color: #56b6c2 !important;
}

.hljs-string,
.hljs-regexp,
.hljs-addition,
.hljs-attribute,
.hljs-meta .hljs-string {
  color: #98c379 !important;
}

.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-type,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-number {
  color: #d19a66 !important;
}

.hljs-symbol,
.hljs-bullet,
.hljs-link,
.hljs-meta,
.hljs-selector-id,
.hljs-title {
  color: #61aeee !important;
}

.hljs-built_in,
.hljs-title.class_,
.hljs-class .hljs-title {
  color: #e6c07b !important;
}

.hljs-emphasis {
  font-style: italic !important;
}

.hljs-strong {
  font-weight: bold !important;
}

.hljs-link {
  text-decoration: underline !important;
}

/* 特定编程语言标识 */
.md-code-language[data-lang="javascript"],
.md-code-language[data-lang="js"] {
  color: #f7df1e;
}

.md-code-language[data-lang="typescript"],
.md-code-language[data-lang="ts"] {
  color: #3178c6;
}

.md-code-language[data-lang="python"],
.md-code-language[data-lang="py"] {
  color: #3776ab;
}

.md-code-language[data-lang="java"] {
  color: #f89820;
}

.md-code-language[data-lang="go"] {
  color: #00add8;
}

.md-code-language[data-lang="rust"] {
  color: #dea584;
}

.md-code-language[data-lang="html"] {
  color: #e34c26;
}

.md-code-language[data-lang="css"] {
  color: #563d7c;
}

.md-code-language[data-lang="c"],
.md-code-language[data-lang="cpp"],
.md-code-language[data-lang="c++"] {
  color: #659ad2;
}

.md-code-language[data-lang="csharp"],
.md-code-language[data-lang="cs"] {
  color: #68217a;
}

.md-code-language[data-lang="bash"],
.md-code-language[data-lang="sh"] {
  color: #4eaa25;
}

.md-code-language[data-lang="json"] {
  color: #f0db4f;
}

.md-code-language[data-lang="xml"] {
  color: #0060ac;
}

.md-code-language[data-lang="sql"] {
  color: #e38c00;
}

.md-code-language[data-lang="php"] {
  color: #777bb4;
}

.md-code-language[data-lang="ruby"],
.md-code-language[data-lang="rb"] {
  color: #cc342d;
}

.md-code-language[data-lang="kotlin"],
.md-code-language[data-lang="kt"] {
  color: #a97bff;
}

.md-code-language[data-lang="swift"] {
  color: #fa7343;
}

.md-code-language[data-lang="markdown"],
.md-code-language[data-lang="md"] {
  color: #ffffff;
}

/* 滚动条样式 */
.md-content pre::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.md-content pre::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.md-content pre::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.md-content pre::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .md-code-block {
    max-width: 95%;
  }

  .md-code-header {
    height: 32px;
    padding: 0 10px;
  }

  .md-code-dot {
    width: 10px;
    height: 10px;
  }

  .md-code-language {
    font-size: 11px;
  }

  .md-content pre {
    padding: 12px !important;
    font-size: 13px !important;
  }
}

@media (max-width: 480px) {
  .md-code-language {
    display: none;
  }

  .md-code-dot {
    width: 8px;
    height: 8px;
  }

  .md-content pre {
    padding: 10px !important;
    font-size: 12px !important;
  }

  .md-copy-button {
    font-size: 10px;
    padding: 2px 6px;
  }
}


/* 基本文本样式 */
.md-content p {
  margin: 1.2em 0;
  line-height: 1.8;
  color: #334155;
  animation: fadeIn 0.8s ease-out;
  font-size: 1.05rem;
}

.md-content a {
  color: #059669;
  text-decoration: none;
  border-bottom: 1px solid rgba(16, 185, 129, 0.3);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  padding-bottom: 1px;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
  background-size: 100% 200%;
  background-position: 0 0;
  background-image: linear-gradient(to bottom, transparent 50%, rgba(16, 185, 129, 0.1) 50%);
}

.md-content a:hover {
  color: #10b981;
  border-bottom: 1px solid rgba(16, 185, 129, 0.8);
  background-position: 0 100%;
}

.md-content a::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: rgba(16, 185, 129, 0.8);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.md-content a:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* 列表样式 */
.md-content ul,
.md-content ol {
  padding-left: 1.8em;
  margin: 1.4em 0;
  color: #334155;
  animation: fadeIn 0.8s ease-out;
}

.md-content li {
  margin-bottom: 0.7em;
  position: relative;
  line-height: 1.6;
  font-size: 1.05rem;
}

.md-content ul li::marker {
  color: #10b981;
}

.md-content ol li::marker {
  color: #10b981;
  font-weight: 600;
}

.md-content li:hover {
  transform: translateX(2px);
  transition: transform 0.3s ease;
}

/* 表格样式 */
.md-content table {
  width: 90%;
  margin: 2.5em auto;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease-out;
  background: #ffffff;
}

.md-content table th {
  background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
  font-weight: 600;
  text-align: left;
  padding: 16px 20px;
  border-bottom: 2px solid #6ee7b7;
  color: #065f46;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.md-content table th:first-child {
  border-top-left-radius: 16px;
}

.md-content table th:last-child {
  border-top-right-radius: 16px;
}

.md-content table td {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  color: #334155;
  transition: background-color 0.2s ease;
  font-size: 1rem;
}

.md-content table tr {
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.md-content table tr:last-child td {
  border-bottom: none;
}

.md-content table tr:last-child td:first-child {
  border-bottom-left-radius: 16px;
}

.md-content table tr:last-child td:last-child {
  border-bottom-right-radius: 16px;
}

.md-content table tr:nth-child(2n) {
  background-color: #f9fafb;
}

.md-content table tr:hover {
  background-color: #ecfdf5;
}

/* 图片样式 */
.md-content img {
  max-width: 90%;
  height: auto;
  display: block;
  margin: 2.5em auto;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  animation: fadeIn 1s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.md-content img:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 水平线 */
.md-content hr {
  margin: 3.5em auto;
  height: 2px;
  max-width: 80%;
  background: linear-gradient(to right,
  rgba(16, 185, 129, 0),
  rgba(16, 185, 129, 0.3),
  rgba(16, 185, 129, 0)
  );
  border: none;
  animation: expandWidth 1.5s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
}

.md-content hr::before {
  content: "✿";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  color: rgba(16, 185, 129, 0.5);
  background: #ffffff;
  padding: 0 20px;
}

@keyframes expandWidth {
  from { transform: scaleX(0.3); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}

/* 自定义提示框样式 */
.md-content .tip,
.md-content .warning,
.md-content .info,
.md-content .note {
  margin: 2em auto;
  padding: 1.5em 1.8em 1.5em 4em;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease-out;
  max-width: 90%;
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.8) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 5px solid transparent;
}

.md-content .tip::before,
.md-content .warning::before,
.md-content .info::before,
.md-content .note::before {
  position: absolute;
  left: 1.4em;
  top: 1.4em;
  font-size: 1.5em;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.md-content .tip {
  border-left-color: #10b981;
  background-color: rgba(236, 253, 245, 0.6);
}

.md-content .tip::before {
  content: "💡";
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
}

.md-content .warning {
  border-left-color: #f59e0b;
  background-color: rgba(255, 247, 237, 0.6);
}

.md-content .warning::before {
  content: "⚠️";
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  color: #d97706;
}

.md-content .info {
  border-left-color: #10b981;
  background-color: rgba(236, 253, 245, 0.6);
}

.md-content .info::before {
  content: "ℹ️";
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
}

.md-content .note {
  border-left-color: #14b8a6;
  background-color: rgba(240, 253, 250, 0.6);
}

.md-content .note::before {
  content: "📝";
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  color: #0f766e;
}

/* 确保行内代码不受影响 */
.md-content :not(pre) > code {
  font-family: 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
  padding: 0.2em 0.5em;
  background-color: rgba(16, 185, 129, 0.08);
  border-radius: 6px;
  color: #059669;
  transition: all 0.3s ease;
  white-space: nowrap;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.md-content :not(pre) > code:hover {
  background-color: rgba(16, 185, 129, 0.12);
  transform: translateY(-1px);
}

/* 动画定义 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInFromLeft {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 滚动条自定义 */
.md-renderer::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.md-renderer::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.md-renderer::-webkit-scrollbar-thumb {
  background-color: rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  border: 3px solid transparent;
  background-clip: content-box;
}

.md-renderer::-webkit-scrollbar-thumb:hover {
  background-color: rgba(16, 185, 129, 0.4);
}

/* 暗色模式适配 */
.dark-mode {
  color: #e2e8f0;
}

.dark-mode .md-content h1,
.dark-mode .md-content h2,
.dark-mode .md-content h3,
.dark-mode .md-content h4,
.dark-mode .md-content h5,
.dark-mode .md-content h6 {
  color: #34d399 !important;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.dark-mode .md-content h2::before {
  -webkit-text-fill-color: #34d399;
}

.dark-mode .md-content h1::after,
.dark-mode .md-content h2::after,
.dark-mode .md-content h3::after,
.dark-mode .md-content h4::after,
.dark-mode .md-content h5::after,
.dark-mode .md-content h6::after {
  background: linear-gradient(to right, #10b981, #34d399);
}

.dark-mode .md-content h1:hover::after,
.dark-mode .md-content h2:hover::after,
.dark-mode .md-content h3:hover::after,
.dark-mode .md-content h4:hover::after,
.dark-mode .md-content h5:hover::after,
.dark-mode .md-content h6:hover::after {
  background: linear-gradient(to right, #10b981, #34d399, #6ee7b7);
}

.dark-mode .md-content blockquote {
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.2) 0%, rgba(6, 95, 70, 0.2) 100%);
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-mode .md-content blockquote::before {
  color: rgba(16, 185, 129, 0.15);
}

.dark-mode .md-content blockquote p {
  color: #e2e8f0;
}

.dark-mode .md-content blockquote code {
  background-color: rgba(6, 95, 70, 0.3);
  color: #6ee7b7;
}

.dark-mode .md-content a {
  color: #34d399;
  border-bottom: 1px solid rgba(52, 211, 153, 0.3);
  background-image: linear-gradient(to bottom, transparent 50%, rgba(16, 185, 129, 0.15) 50%);
}

.dark-mode .md-content a:hover {
  color: #6ee7b7;
  border-bottom: 1px solid rgba(52, 211, 153, 0.8);
}

.dark-mode .md-content a::after {
  background-color: rgba(52, 211, 153, 0.8);
}

.dark-mode .md-content :not(pre) > code {
  background-color: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.dark-mode .md-content p,
.dark-mode .md-content li {
  color: #e2e8f0;
}

.dark-mode .md-content table {
  background: #0f172a;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
}

.dark-mode .md-content table th {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  color: #6ee7b7;
  border-bottom: 2px solid #047857;
}

.dark-mode .md-content table td {
  border-bottom: 1px solid #334155;
  color: #e2e8f0;
}

.dark-mode .md-content table tr {
  background-color: #0f172a;
}

.dark-mode .md-content table tr:nth-child(2n) {
  background-color: #1e293b;
}

.dark-mode .md-content table tr:hover {
  background-color: #064e3b;
}

.dark-mode .md-content hr::before {
  background: #0f172a;
  color: rgba(16, 185, 129, 0.5);
}

.dark-mode .md-content .tip,
.dark-mode .md-content .warning,
.dark-mode .md-content .info,
.dark-mode .md-content .note {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.7) 100%);
}

.dark-mode .md-content .tip::before {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  color: #34d399;
}

.dark-mode .md-content .warning::before {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  color: #fbbf24;
}

.dark-mode .md-content .info::before {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  color: #34d399;
}

.dark-mode .md-content .note::before {
  background: linear-gradient(135deg, #134e4a 0%, #115e59 100%);
  color: #2dd4bf;
}

.dark-mode .md-content pre.md-code-collapsed::after {
  background: linear-gradient(to bottom, rgba(26, 43, 51, 0) 0%, rgba(26, 43, 51, 1) 100%);
}

/* 图片预览组件样式 */
.image-preview-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.image-preview-content {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  animation: zoomIn 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.preview-header {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  color: white;
}

.preview-counter {
  font-size: 14px;
  background-color: rgba(5, 150, 105, 0.6);
  padding: 6px 12px;
  border-radius: 30px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.preview-close-btn {
  background: rgba(5, 150, 105, 0.6);
  border: none;
  color: white;
  cursor: pointer;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.preview-close-btn:hover {
  background-color: rgba(16, 185, 129, 0.8);
  transform: scale(1.1);
}

.preview-close-btn svg {
  fill: white;
  width: 28px;
  height: 28px;
}

.preview-image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 固定位置的导航按钮 - 重新设计 */
.preview-nav-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(5, 150, 105, 0.6);
  border: none;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.preview-nav-btn:hover {
  background: rgba(16, 185, 129, 0.8);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.5);
}

.preview-nav-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.preview-nav-btn svg {
  fill: white;
  width: 40px;
  height: 40px;
}

.prev-btn {
  left: 50px;
}

.next-btn {
  right: 50px;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .md-content {
    padding: 24px 16px;
  }

  .md-content h1 {
    font-size: 1.8rem !important;
  }

  .md-content h2 {
    font-size: 1.5rem !important;
  }

  .md-content h3 {
    font-size: 1.3rem !important;
  }

  .md-content blockquote {
    padding: 1.4em 1.6em;
    width: 95%;
  }

  .md-code-block,
  .md-content table,
  .md-content .tip,
  .md-content .warning,
  .md-content .info,
  .md-content .note {
    max-width: 95%;
    width: 95%;
  }

  .md-content img {
    max-width: 95%;
  }

  .md-code-header {
    height: 36px;
  }

  .md-content pre {
    padding: 12px !important;
    font-size: 13px !important;
  }

  .preview-nav-btn {
    width: 55px;
    height: 55px;
    background: rgba(5, 150, 105, 0.7);
  }

  .preview-nav-btn svg {
    width: 32px;
    height: 32px;
  }

  .prev-btn {
    left: 20px;
  }

  .next-btn {
    right: 20px;
  }

  .preview-image {
    max-height: 75vh;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .preview-nav-btn {
    width: 45px;
    height: 45px;
  }

  .preview-nav-btn svg {
    width: 24px;
    height: 24px;
  }

  .prev-btn {
    left: 10px;
  }

  .next-btn {
    right: 10px;
  }
}
</style>