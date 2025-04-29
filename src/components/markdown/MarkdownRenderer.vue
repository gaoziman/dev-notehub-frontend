<template>
  <div class="md-renderer" :class="{ 'dark-mode': isDarkMode }">
    <div v-if="loading" class="md-notice">
      加载内容中...
    </div>
    <div v-else-if="!content" class="md-notice">
      没有内容可显示
    </div>
    <div v-else class="md-content" v-html="renderedContent" ref="contentRef"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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

// 配置markdown-it实例及插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value;

        // 为代码块添加复制按钮
        const codeId = `code-${Math.random().toString(36).substring(2, 10)}`;
        return `<div class="md-code-block">
          <div class="md-code-header">
            <span class="md-code-language">${lang}</span>
            <button class="md-copy-button" id="${codeId}">复制</button>
          </div>
          <pre class="language-${lang}"><code>${highlighted}</code></pre>
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
  slugify: (s) => s.toLowerCase().replace(/[^\w]+/g, '-'),
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

      headings.value.push({
        id: info.slug,
        text: title,
        level: level
      });
    }
  }
});

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
      ADD_ATTR: ['target', 'rel'], // 为链接添加安全属性
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
    });
  });
});

// 挂载后初始化
onMounted(() => {
  loading.value = false;
  nextTick(() => {
    setupCodeCopy();
  });
});
</script>

<style>
/* 基础样式 */
.md-renderer {
  color: #333;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.md-content {
  width: 100%;
  max-width: none;
  padding: 24px 32px;
  min-height: 100%;
}

/* 通知和错误提示 */
.md-notice {
  padding: 1rem;
  background-color: #f0f9ff;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  color: #1e40af;
  margin: 1rem;
  text-align: center;
}

.md-error {
  padding: 1rem;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  color: #b91c1c;
  margin: 1rem;
}

/* 标题样式 */
.md-content h1,
.md-content h2,
.md-content h3,
.md-content h4,
.md-content h5,
.md-content h6 {
  margin-top: 1.5em !important;
  margin-bottom: 1em !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
  position: relative !important;
  scroll-margin-top: 70px !important;
  color: #5b5ef7 !important;
  padding-left: 0.5em !important;
  border-left: 3px solid #6366f1 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
}

/* 标题锚点链接 */
.md-content h1 .header-anchor,
.md-content h2 .header-anchor,
.md-content h3 .header-anchor,
.md-content h4 .header-anchor,
.md-content h5 .header-anchor,
.md-content h6 .header-anchor {
  float: left;
  margin-left: -0.9em;
  padding-right: 0.2em;
  opacity: 0;
  text-decoration: none;
  color: #6366f1;
  transition: opacity 0.2s;
}

.md-content h1:hover .header-anchor,
.md-content h2:hover .header-anchor,
.md-content h3:hover .header-anchor,
.md-content h4:hover .header-anchor,
.md-content h5:hover .header-anchor,
.md-content h6:hover .header-anchor {
  opacity: 1;
}

/* 各级标题的特定样式 */
.md-content h1 {
  font-size: 2rem !important;
  border-bottom: 1px solid #eaecef !important;
  padding-bottom: 0.3em !important;
}

.md-content h2 {
  font-size: 1.5rem !important;
  border-bottom: 1px solid #eaecef !important;
  padding-bottom: 0.3em !important;
}

.md-content h3 {
  font-size: 1.3rem !important;
}

.md-content h4 {
  font-size: 1.1rem !important;
}

.md-content h5 {
  font-size: 1rem !important;
}

.md-content h6 {
  font-size: 0.9rem !important;
  color: #6c6c6c !important;
}

/* 标题激活状态的样式 */
.md-heading-active {
  background-color: rgba(99, 102, 241, 0.15) !important;
  transition: background-color 0.3s ease !important;
}

/* 动画效果 */
@keyframes highlight-heading {
  0% {
    background-color: rgba(99, 102, 241, 0.2);
  }
  100% {
    background-color: transparent;
  }
}

/* 代码块 */
.md-code-block {
  margin: 1.5em 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.md-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
}

.md-code-language {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6366f1;
}

.md-copy-button {
  padding: 4px 8px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.md-copy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #4f46e5;
}

.md-copy-button.md-copied {
  background-color: #10b981;
}

/* 暗色主题 */
.dark-mode {
  color: #e5e7eb;
  background-color: #1f2937;
}

.dark-mode .md-notice {
  background-color: #1e293b;
  border-color: #475569;
  color: #94a3b8;
}

.dark-mode .md-error {
  background-color: #7f1d1d;
  border-color: #b91c1c;
  color: #fecaca;
}

.dark-mode .md-content h1,
.dark-mode .md-content h2,
.dark-mode .md-content h3,
.dark-mode .md-content h4,
.dark-mode .md-content h5,
.dark-mode .md-content h6 {
  color: #818cf8 !important;
  border-left-color: #818cf8 !important;
}

.dark-mode .md-content h1 .header-anchor,
.dark-mode .md-content h2 .header-anchor,
.dark-mode .md-content h3 .header-anchor,
.dark-mode .md-content h4 .header-anchor,
.dark-mode .md-content h5 .header-anchor,
.dark-mode .md-content h6 .header-anchor {
  color: #818cf8;
}

.dark-mode .md-code-header {
  background-color: #2d3748;
  border-bottom-color: #4b5563;
}

.dark-mode .md-code-language {
  color: #818cf8;
}

.dark-mode .md-copy-button {
  background-color: #818cf8;
}

.dark-mode .md-copy-button:hover {
  background-color: #6366f1;
}

.dark-mode pre code {
  background-color: #1a202c !important;
}

/* 基本文本样式 */
.md-content p {
  margin: 1em 0;
}

.md-content a {
  color: #6366f1; /* 使用主题色 */
  text-decoration: none;
}

.md-content a:hover {
  text-decoration: underline;
}

.md-content blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid #6366f1; /* 使用主题色 */
  background-color: #f5f7fa;
}

.md-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5em auto;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.md-content ul,
.md-content ol {
  padding-left: 2em;
  margin: 1em 0;
}

.md-content li {
  margin-bottom: 0.5em;
}

.md-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  overflow-x: auto;
  display: block;
}

.md-content table th,
.md-content table td {
  border: 1px solid #e5e7eb;
  padding: 0.5em 1em;
}

.md-content table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.md-content table tr:nth-child(2n) {
  background-color: #f8f9fa;
}

/* 暗色主题 */
:root.dark .md-renderer {
  color: #e5e7eb;
}

:root.dark .md-notice {
  background-color: #1e293b;
  border-color: #475569;
  color: #94a3b8;
}

:root.dark .md-error {
  background-color: #7f1d1d;
  border-color: #b91c1c;
  color: #fecaca;
}

:root.dark .md-content h1,
:root.dark .md-content h2,
:root.dark .md-content h3,
:root.dark .md-content h4,
:root.dark .md-content h5,
:root.dark .md-content h6 {
  color: #818cf8; /* 暗色主题色 */
}

:root.dark .md-header-link {
  color: #818cf8; /* 暗色主题色 */
}

:root.dark .md-code-header {
  background-color: #2d3748;
  border-bottom-color: #4b5563;
}

:root.dark .md-code-language {
  color: #818cf8; /* 暗色主题色 */
}

:root.dark .md-copy-button {
  background-color: #818cf8; /* 暗色主题色 */
}

:root.dark .md-copy-button:hover {
  background-color: #6366f1; /* 深一点的暗色主题色 */
}

:root.dark .md-content a {
  color: #818cf8; /* 暗色主题色 */
}

:root.dark .md-content blockquote {
  background-color: #2d3748;
  border-left-color: #818cf8; /* 暗色主题色 */
}

:root.dark .md-content table th,
:root.dark .md-content table td {
  border-color: #4b5563;
}

:root.dark .md-content table th,
:root.dark .md-content table tr:nth-child(2n) {
  background-color: #2d3748;
}
</style>