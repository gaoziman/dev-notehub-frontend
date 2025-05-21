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

// 添加ID唯一性管理 - 这是修复重复ID的核心
const idCounters = ref(new Map());

// 生成唯一ID的函数
const generateUniqueId = (text) => {
  // 基础ID生成：将文本转换为小写并替换非字母数字字符
  const baseId = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');

  // 检查是否已存在此ID
  const count = idCounters.value.get(baseId) || 0;
  idCounters.value.set(baseId, count + 1);

  // 如果是第一次出现，直接使用baseId；否则添加计数器
  return count === 0 ? baseId : `${baseId}-${count + 1}`;
};

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

// 去除代码块中的共同缩进
function dedent(text) {
  // 分割成行
  const lines = text.split('\n');

  // 找出除了空行外所有行的最小缩进
  const pattern = /^(\s*)/;
  let minIndent = Infinity;

  // 查找最小缩进
  for (const line of lines) {
    if (line.trim() === '') continue; // 跳过空行
    const match = pattern.exec(line);
    if (match && match[1].length < minIndent) {
      minIndent = match[1].length;
    }
  }

  // 如果发现有缩进，则移除所有行的共同缩进部分
  if (minIndent !== Infinity && minIndent > 0) {
    return lines
        .map(line => line.length >= minIndent ? line.slice(minIndent) : line)
        .join('\n');
  }

  // 如果没有共同缩进或不需要处理，返回原始文本
  return text;
}

// 配置markdown-it实例及插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        // 删除共同缩进
        const dedentedCode = dedent(str);

        // 使用去除缩进后的代码进行高亮处理
        const highlighted = hljs.highlight(dedentedCode, {language: lang}).value;

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
          <pre class="language-${lang} md-code-left-aligned" id="pre-${collapseId}"><code class="md-code-left-aligned">${highlighted}</code></pre>
          <textarea style="display:none" id="content-${codeId}">${dedentedCode}</textarea>
        </div>`;
      } catch (e) {
        console.error('代码高亮出错:', e);
      }
    }

    return `<pre class="language-plaintext md-code-left-aligned"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

// 添加锚点插件，为标题生成ID - 关键修改点
md.use(markdownItAnchor, {
  permalink: true,
  permalinkSymbol: '#',
  permalinkBefore: true,
  level: [1, 2, 3, 4, 5, 6],
  // 使用唯一ID生成函数，确保相同标题文本有不同ID
  slugify: (s) => {
    // 重置计数器以确保每次渲染都从头开始计数
    if (!md._idCounters) {
      md._idCounters = new Map();
    }

    const baseId = s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
    const count = md._idCounters.get(baseId) || 0;
    md._idCounters.set(baseId, count + 1);

    return count === 0 ? baseId : `${baseId}-${count + 1}`;
  },
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


// 添加自定义链接渲染规则，使所有链接在新标签页打开
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // 为所有链接添加 target="_blank" 和 rel="noopener noreferrer" 属性
  const token = tokens[idx];
  const targetIndex = token.attrIndex('target');
  const relIndex = token.attrIndex('rel');

  if (targetIndex < 0) {
    token.attrPush(['target', '_blank']);
  } else {
    token.attrs[targetIndex][1] = '_blank';
  }

  if (relIndex < 0) {
    token.attrPush(['rel', 'noopener noreferrer']);
  } else {
    token.attrs[relIndex][1] = 'noopener noreferrer';
  }

  return defaultRender(tokens, idx, options, env, self);
};

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
      }, 100);
    });
  });
};

// 渲染Markdown内容
const renderedContent = computed(() => {
  // 重置标题列表和ID计数器 - 重要修改
  headings.value = [];
  idCounters.value.clear();
  if (md._idCounters) {
    md._idCounters.clear();
  }

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
        console.log('提取到的标题:', headings.value.map(h => `${h.level}-${h.text}(${h.id})`).join(', '));
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
  // 重置ID计数器，为新内容重新计数
  idCounters.value.clear();
  if (md._idCounters) {
    md._idCounters.clear();
  }

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

  // 清理ID计数器
  idCounters.value.clear();
  if (md._idCounters) {
    md._idCounters.clear();
  }
});
</script>

<style>
/* 基础样式 */
.md-renderer {
  color: #2d3748;
  line-height: 1.7;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
  word-spacing: 0.05em; /* 轻微增加单词间距，提高文本通透感 */
}

/* 通知和错误提示 */
.md-notice {
  padding: 1.2rem;
  background-color: rgba(243, 244, 246, 0.8);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 0.8rem;
  color: #5b21b6;
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
  margin-top: 2.5em !important; /* 增加标题上方空间 */
  margin-bottom: 1.2em !important; /* 增加标题下方空间 */
  font-weight: 600 !important;
  line-height: 1.3 !important;
  position: relative !important;
  scroll-margin-top: 80px !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  letter-spacing: -0.02em !important;
  padding-left: 0 !important;
  padding-bottom: 0.2em !important;
  border-radius: 4px !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%);
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
  background: linear-gradient(to right, #6366f1, #8b5cf6);
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
  background: linear-gradient(to right, #6366f1, #8b5cf6, #a78bfa);
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
  color: #8b5cf6;
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
  color: #4338ca !important;
  background: linear-gradient(90deg, #4338ca 0%, #6366f1 100%);
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
  color: #4f46e5 !important;
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  display: flex !important;
  align-items: center !important;
}

/* 添加emoji图标到h2标题前 */
.md-content h2::before {
  content: "✦";
  margin-right: 8px;
  font-size: 1.4rem;
  -webkit-text-fill-color: #8b5cf6;
}

.md-content h3 {
  font-size: 1.5rem !important;
  letter-spacing: -0.2px !important;
  font-weight: 600 !important;
  color: #6366f1 !important;
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.md-content h4 {
  font-size: 1.3rem !important;
  font-weight: 600 !important;
  color: #818cf8 !important;
  background: linear-gradient(90deg, #818cf8 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.md-content h5 {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  color: #a78bfa !important;
  background: linear-gradient(90deg, #a78bfa 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.md-content h6 {
  font-size: 1rem !important;
  font-weight: 500 !important;
  color: #c4b5fd !important;
  background: linear-gradient(90deg, #c4b5fd 0%, #ddd6fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

/* 标题激活状态的样式 */
.md-heading-active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 100%) !important;
  border-radius: 4px !important;
  padding-left: 8px !important;
  animation: fadeHeading 0.4s ease-out !important;
}

@keyframes fadeHeading {
  0% {
    background-color: rgba(99, 102, 241, 0.3);
  }
  100% {
    background-color: rgba(99, 102, 241, 0);
  }
}

/* ====== 引用块样式 ====== */
.md-content blockquote {
  /* 基础布局与尺寸 */
  position: relative;
  margin: 2.8em auto; /* 增加引用块与周围内容的间距 */
  padding: 1.8em 2em 1.8em 2.5em;
  width: 94%;
  max-width: 850px;

  /* 主体设计 */
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(167, 139, 250, 0.08) 100%);
  border-radius: 12px;

  /* 边框效果 */
  border: 1px solid rgba(138, 99, 255, 0.12);

  /* 阴影效果 */
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.07),
  0 2px 5px rgba(99, 102, 241, 0.03);

  /* 过渡动画 */
  transition: all 0.3s ease-out;
}

/* 内容样式 */
.md-content blockquote p {
  position: relative;
  margin: 1em 0; /* 调整引用块内段落间距 */
  color: #374151;
  font-size: 1.05rem;
  line-height: 1.75;
  letter-spacing: 0.01em;
}

/* 首段样式 */
.md-content blockquote p:first-of-type {
  margin-top: 0;
  font-weight: 500;
  color: #1f2937;
}

/* 末段样式 */
.md-content blockquote p:last-of-type {
  margin-bottom: 0;
}

/* 引号装饰 */
.md-content blockquote::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 10px;
  font-family: Georgia, serif;
  font-size: 4.5em;
  line-height: 1;
  color: rgba(99, 102, 241, 0.15);
  pointer-events: none;
}

/* 引用块悬停效果 */
.md-content blockquote:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(167, 139, 250, 0.1) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.09),
  0 3px 8px rgba(99, 102, 241, 0.04);
}

/* ====== 引用块内的行内代码样式 ====== */
.md-content blockquote code {
  /* 基本样式继承自全局行内代码 */
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
  font-weight: 500;

  /* 引用块内的行内代码特殊颜色 */
  background: rgba(99, 102, 241, 0.12);
  color: #4338ca;

  /* 边框效果 */
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 4px;

  /* 间距调整 */
  padding: 0.15em 0.4em;
  margin: 0 0.25em;

  /* 阴影与过渡 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

/* 引用块中的行内代码悬停效果 */
.md-content blockquote code:hover {
  background: rgba(99, 102, 241, 0.18);
  color: #3730a3;
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* 暗色模式适配 */
.dark-mode .md-content blockquote {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-left: 4px solid rgba(139, 92, 246, 0.7);
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.1),
  0 2px 5px rgba(15, 23, 42, 0.06);
}

.dark-mode .md-content blockquote p {
  color: #e5e7eb;
}

.dark-mode .md-content blockquote p:first-of-type {
  color: #f3f4f6;
}

.dark-mode .md-content blockquote::before {
  color: rgba(139, 92, 246, 0.2);
}

.dark-mode .md-content blockquote:hover {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(139, 92, 246, 0.13) 100%);
  border-left: 4px solid rgba(139, 92, 246, 0.9);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15),
  0 3px 8px rgba(15, 23, 42, 0.08);
}

.dark-mode .md-content blockquote code {
  background: rgba(139, 92, 246, 0.15);
  color: #a5b4fc;
  border-color: rgba(139, 92, 246, 0.2);
}

.dark-mode .md-content blockquote code:hover {
  background: rgba(139, 92, 246, 0.25);
  color: #c4b5fd;
  border-color: rgba(139, 92, 246, 0.35);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .md-content blockquote {
    width: 95%;
    padding: 1.5em 1.5em 1.5em 2em;
    margin: 2em auto;
  }

  .md-content blockquote::before {
    font-size: 3.5em;
  }
}

@media (max-width: 480px) {
  .md-content blockquote {
    width: 96%;
    padding: 1.2em 1.2em 1.2em 1.6em;
    margin: 1.8em auto;
  }

  .md-content blockquote p {
    font-size: 1rem;
  }

  .md-content blockquote::before {
    font-size: 3em;
    top: -2px;
    left: 7px;
  }
}

/* 代码块样式 - Atom One Dark Theme */
.md-code-block {
  margin: 2.5em auto; /* 增加代码块与周围内容的间距 */
  border-radius: 8px; /* 增加圆角半径 */
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  position: relative;
  line-height: 0;
  background-color: #282c34;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.1); /* 增强阴影效果 */
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  max-width: 92%; /* 略微增加最大宽度 */
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.md-code-block:hover {
  transform: translateY(-3px); /* 增强悬停效果 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1); /* 增强悬停阴影 */
}

/* 代码块头部 - macOS 风格 */
.md-code-header {
  height: 38px; /* 稍微增加头部高度 */
  background: #21252b;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
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
  padding: 3px 10px; /* 增加按钮内边距 */
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.1); /* 增加按钮背景透明度 */
  color: #abb2bf;
  cursor: pointer;
  opacity: 0;
  transition: all 0.25s ease; /* 加速过渡效果 */
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 折叠按钮样式 */
.md-collapse-button {
  font-size: 12px;
  padding: 3px 10px; /* 增加按钮内边距 */
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.1); /* 增加按钮背景透明度 */
  color: #abb2bf;
  cursor: pointer;
  opacity: 0;
  transition: all 0.25s ease; /* 加速过渡效果 */
  font-weight: 500;
  letter-spacing: 0.5px;
}

.md-code-block:hover .md-copy-button,
.md-code-block:hover .md-collapse-button {
  opacity: 1;
}

.md-copy-button:hover,
.md-collapse-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-1px); /* 添加悬停时的微小位移 */
}

.md-copy-button.md-copied {
  background: #98c379;
  color: #ffffff;
}

/* 代码内容区域 - 左对齐样式 */
.md-content pre {
  margin: 0 !important;
  padding: 18px !important; /* 增加内边距 */
  padding-left: 16px !important; /* 增加左侧内边距 */
  color: #abb2bf !important;
  font-size: 14px !important;
  line-height: 1.6 !important; /* 增加行高 */
  overflow-x: auto !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
  border: none !important;
  display: block !important;
  min-height: 0 !important;
  border-radius: 0 0 8px 8px !important;
}

/* 代码左对齐特定样式 */
.md-code-left-aligned {
  text-align: left !important;
  text-indent: 0 !important;
  white-space: pre !important;
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

/* 基本文本样式 - 调整段落间距 */
.md-content p {
  margin: 2.5em 0; /* 进一步增加段落间距 */
  line-height: 1.9; /* 增加行高，让文本排版更加松散 */
  color: #334155;
  animation: fadeIn 0.8s ease-out;
  font-size: 1.05rem;
  letter-spacing: 0.015em; /* 增加字母间距 */
}

/* 确保第一个段落没有上边距 */
.md-content > p:first-child {
  margin-top: 0;
}

.md-content a {
  color: #6366f1;
  text-decoration: none;
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  padding-bottom: 1px;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
  background-size: 100% 200%;
  background-position: 0 0;
  background-image: linear-gradient(to bottom, transparent 50%, rgba(139, 92, 246, 0.1) 50%);
}

.md-content a:hover {
  color: #8b5cf6;
  border-bottom: 1px solid rgba(139, 92, 246, 0.8);
  background-position: 0 100%;
}

.md-content a::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: rgba(139, 92, 246, 0.8);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.md-content a:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* 列表样式 - 调整间距 */
.md-content ul,
.md-content ol {
  padding-left: 1.8em;
  margin: 2.5em 0; /* 增加列表与周围内容的间距 */
  color: #334155;
  animation: fadeIn 0.8s ease-out;
}

.md-content li {
  margin-bottom: 1em; /* 增加列表项间距 */
  position: relative;
  line-height: 1.75;
  font-size: 1.05rem;
  padding-left: 0.5em; /* 添加列表项左侧内边距 */
}

/* 列表项间距微调 */
.md-content li + li {
  margin-top: 0.8em; /* 确保列表项之间有足够间距 */
}

.md-content ul li::marker {
  color: #8b5cf6;
}

.md-content ol li::marker {
  color: #8b5cf6;
  font-weight: 600;
}

.md-content li:hover {
  transform: translateX(2px);
  transition: transform 0.3s ease;
}

/* ====== 高级表格样式 - 未来科技风 ====== */
.md-content table {
  --table-primary: #6366f1;
  --table-secondary: #a78bfa;
  --table-highlight: #818cf8;
  --table-header-bg: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  --table-row-even: rgba(243, 244, 246, 0.6);
  --table-border-light: rgba(99, 102, 241, 0.12);

  width: 92%;
  margin: 3.5em auto 4.5em; /* 增加表格上下边距 */
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 1rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1),
  0 3px 10px rgba(0, 0, 0, 0.05),
  0 1px 0 rgba(99, 102, 241, 0.05) inset;
  background: white;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  transform: translateZ(0);
  backdrop-filter: blur(20px);
  animation: tableAppear 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1px solid var(--table-border-light);
}

/* 表格外发光效果 */
.md-content table::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  background: linear-gradient(90deg, #6366f1, #a78bfa, #818cf8, #6366f1);
  border-radius: 1.1rem;
  filter: blur(5px);
  opacity: 0.12;
  animation: borderGlow 8s linear infinite;
}

/* 表头样式 */
.md-content table thead {
  position: relative;
  z-index: 3;
}

.md-content table th {
  background: var(--table-header-bg);
  font-weight: 700;
  text-align: left;
  padding: 1.2rem 1.5rem;
  color: white;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  position: relative;
  white-space: nowrap;
}

/* 表头分隔线 */
.md-content table th::after {
  content: "";
  position: absolute;
  right: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
}

.md-content table th:last-child::after {
  display: none;
}

/* 表头第一个和最后一个单元格的圆角 */
.md-content table th:first-child {
  border-top-left-radius: 1rem;
}

.md-content table th:last-child {
  border-top-right-radius: 1rem;
}

/* 表格内容单元格 */
.md-content table td {
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--table-border-light);
  border-right: 1px solid var(--table-border-light); /* 添加右边框 */
  color: #1e293b;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

/* 最后一列单元格不需要右边框 */
.md-content table td:last-child {
  border-right: none;
}

/* 单元格悬浮高亮效果 */
.md-content table td:hover::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--table-primary), var(--table-secondary));
  animation: slideIn 0.3s forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 表格行 */
.md-content table tr {
  background-color: white;
  transition: all 0.3s ease;
  position: relative;
}

/* 偶数行背景 */
.md-content table tbody tr:nth-child(2n) {
  background-color: var(--table-row-even);
}

/* 最后一行圆角 */
.md-content table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 1rem;
}

.md-content table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 1rem;
}

.md-content table tbody tr:last-child td {
  border-bottom: none;
}

/* 行悬浮效果 */
.md-content table tbody tr:hover {
  background-color: rgba(99, 102, 241, 0.06);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 2;
}

/* 名称列样式 - 左边列通常是名称 */
.md-content table td:first-child {
  font-weight: 600;
  color: var(--table-primary);
  letter-spacing: -0.01em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* 用途列样式 - 右边列通常是用途 */
.md-content table td:last-child {
  line-height: 1.5;
}

/* 表格动画 */
@keyframes tableAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes borderGlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 深色模式适配 */
.dark-mode .md-content table {
  --table-primary: #a78bfa;
  --table-secondary: #c4b5fd;
  --table-highlight: #818cf8;
  --table-header-bg: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  --table-row-even: rgba(30, 41, 59, 0.6);
  --table-border-light: rgba(139, 92, 246, 0.2);

  background: #1e293b;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25),
  0 3px 10px rgba(0, 0, 0, 0.15),
  0 1px 0 rgba(99, 102, 241, 0.1) inset;
}

.dark-mode .md-content table::before {
  opacity: 0.2;
}

.dark-mode .md-content table td {
  color: #e2e8f0;
  border-right: 1px solid var(--table-border-light); /* 深色模式下的右边框 */
}

.dark-mode .md-content table td:last-child {
  border-right: none;
}

.dark-mode .md-content table tr {
  background-color: #1e293b;
}

.dark-mode .md-content table tbody tr:hover {
  background-color: rgba(99, 102, 241, 0.15);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .md-content table {
    width: 98%;
    margin: 2em auto 3em;
    font-size: 0.9rem;
  }

  .md-content table th,
  .md-content table td {
    padding: 0.9rem 1rem;
  }
}

/* 超小屏幕滚动处理 */
@media (max-width: 480px) {
  .md-content table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

/* 图片样式 */
.md-content img {
  max-width: 90%;
  height: auto;
  display: block;
  margin: 3em auto; /* 增加图片与周围内容的间距 */
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
  margin: 4em auto; /* 增加分割线与周围内容的间距 */
  height: 2px;
  max-width: 80%;
  background: linear-gradient(to right,
  rgba(99, 102, 241, 0),
  rgba(99, 102, 241, 0.3),
  rgba(99, 102, 241, 0)
  );
  border: none;
  animation: expandWidth 1.5s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
}

.md-content hr::before {
  content: "✧";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  color: rgba(99, 102, 241, 0.5);
  background: #ffffff;
  padding: 0 20px;
}

@keyframes expandWidth {
  from {
    transform: scaleX(0.3);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

/* 自定义提示框样式 */
.md-content .tip,
.md-content .warning,
.md-content .info,
.md-content .note {
  margin: 2.8em auto; /* 增加提示框与周围内容的间距 */
  padding: 1.8em 2em 1.8em 4.5em; /* 增加内边距 */
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
  border-left-color: #8b5cf6;
  background-color: rgba(243, 244, 246, 0.6);
}

.md-content .tip::before {
  content: "💡";
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  color: #6366f1;
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
  border-left-color: #3b82f6;
  background-color: rgba(243, 244, 246, 0.6);
}

.md-content .info::before {
  content: "ℹ️";
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
}

.md-content .note {
  border-left-color: #8b5cf6;
  background-color: rgba(245, 243, 255, 0.6);
}

.md-content .note::before {
  content: "📝";
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #8b5cf6;
}

/* 全新设计的行内代码样式 */
.md-content :not(pre) > code {
  /* 基础字体设置 */
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
  font-weight: 550;
  letter-spacing: 0;

  /* 高级视觉效果 */
  color: #4839E5; /* 更明亮的蓝紫色 */
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.13) 100%);

  /* 精致边框设计 */
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 5px;
  box-shadow:
      0 2px 3px rgba(124, 58, 237, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);

  /* 间距与定位优化 */
  padding: 0.15em 0.5em 0.12em;
  margin: 0 0.35em; /* 增加左右间距，与文本分隔更明显 */
  vertical-align: baseline;
  position: relative;
  top: -0.5px;

  /* 动效设计 */
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);

  /* 细节处理 */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;

  /* 悬停指示 */
  cursor: default;
}

/* 行内代码悬停效果 */
.md-content :not(pre) > code:hover {
  color: #3626D9; /* 悬停时颜色更深 */
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.18) 100%);
  border-color: rgba(124, 58, 237, 0.35);
  box-shadow:
      0 3px 6px rgba(124, 58, 237, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transform: translateY(-1px) scale(1.02);
}

/* 行内代码点击效果 */
.md-content :not(pre) > code:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 2px rgba(124, 58, 237, 0.08);
}

/* 调整段落内多个行内代码之间的间距 */
.md-content p code + code {
  margin-left: 0.6em; /* 确保多个代码之间有足够间距 */
}

/* 针对悬停状态的细节优化 */
.md-content :not(pre) > code::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 4px;
  right: 4px;
  height: 1px;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.2), rgba(139, 92, 246, 0.2));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.md-content :not(pre) > code:hover::after {
  opacity: 1;
}

/* 暗色模式下的行内代码样式 */
.dark-mode .md-content :not(pre) > code {
  color: #A78BFA; /* 明亮的紫色 */
  background: linear-gradient(120deg, rgba(79, 70, 229, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
  border: 1px solid rgba(167, 139, 250, 0.25);
  box-shadow:
      0 2px 3px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 暗色模式下的行内代码悬停效果 */
.dark-mode .md-content :not(pre) > code:hover {
  color: #C4B5FD; /* 更浅的紫色 */
  background: linear-gradient(120deg, rgba(79, 70, 229, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%);
  border-color: rgba(167, 139, 250, 0.4);
  box-shadow:
      0 3px 6px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* 暗色模式下的行内代码点击效果 */
.dark-mode .md-content :not(pre) > code:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 暗色模式下悬停状态的细节优化 */
.dark-mode .md-content :not(pre) > code::after {
  background: linear-gradient(90deg, rgba(167, 139, 250, 0.3), rgba(196, 181, 253, 0.3));
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  background-color: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
  border: 3px solid transparent;
  background-clip: content-box;
}

.md-renderer::-webkit-scrollbar-thumb:hover {
  background-color: rgba(99, 102, 241, 0.4);
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
  color: #a78bfa !important;
  background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.dark-mode .md-content h2::before {
  -webkit-text-fill-color: #a78bfa;
}

.dark-mode .md-content h1::after,
.dark-mode .md-content h2::after,
.dark-mode .md-content h3::after,
.dark-mode .md-content h4::after,
.dark-mode .md-content h5::after,
.dark-mode .md-content h6::after {
  background: linear-gradient(to right, #8b5cf6, #a78bfa);
}

.dark-mode .md-content h1:hover::after,
.dark-mode .md-content h2:hover::after,
.dark-mode .md-content h3:hover::after,
.dark-mode .md-content h4:hover::after,
.dark-mode .md-content h5:hover::after,
.dark-mode .md-content h6:hover::after {
  background: linear-gradient(to right, #8b5cf6, #a78bfa, #c4b5fd);
}

.dark-mode .md-content blockquote {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%);
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-mode .md-content blockquote::before {
  color: rgba(139, 92, 246, 0.15);
}

.dark-mode .md-content blockquote p {
  color: #e2e8f0;
}

.dark-mode .md-content blockquote code {
  background-color: rgba(30, 41, 59, 0.5);
  color: #c4b5fd;
}

.dark-mode .md-content a {
  color: #a78bfa;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
  background-image: linear-gradient(to bottom, transparent 50%, rgba(139, 92, 246, 0.15) 50%);
}

.dark-mode .md-content a:hover {
  color: #c4b5fd;
  border-bottom: 1px solid rgba(167, 139, 250, 0.8);
}

.dark-mode .md-content a::after {
  background-color: rgba(167, 139, 250, 0.8);
}

.dark-mode .md-content p,
.dark-mode .md-content li {
  color: #e2e8f0;
}

.dark-mode .md-content hr::before {
  background: #0f172a;
  color: rgba(139, 92, 246, 0.5);
}

.dark-mode .md-content .tip,
.dark-mode .md-content .warning,
.dark-mode .md-content .info,
.dark-mode .md-content .note {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%);
}

.dark-mode .md-content .tip::before {
  background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
  color: #a78bfa;
}

.dark-mode .md-content .warning::before {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  color: #fbbf24;
}

.dark-mode .md-content .info::before {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: #93c5fd;
}

.dark-mode .md-content .note::before {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  color: #c4b5fd;
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
  background-color: rgba(99, 102, 241, 0.6);
  padding: 6px 12px;
  border-radius: 30px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.preview-close-btn {
  background: rgba(99, 102, 241, 0.6);
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
  background-color: rgba(139, 92, 246, 0.8);
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

/* 导航按钮 */
.preview-nav-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(99, 102, 241, 0.6);
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
  background: rgba(139, 92, 246, 0.8);
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

  .preview-nav-btn {
    width: 55px;
    height: 55px;
    background: rgba(99, 102, 241, 0.7);
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