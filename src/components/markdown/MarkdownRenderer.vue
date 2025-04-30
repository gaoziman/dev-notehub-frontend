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

        // 为代码块添加复制按钮，使用黑色Mac终端风格
        const codeId = `code-${Math.random().toString(36).substring(2, 10)}`;
        return `<div class="md-code-block">
          <div class="md-code-header">
            <div class="md-code-dots">
              <span class="md-code-dot md-code-dot-red"></span>
              <span class="md-code-dot md-code-dot-yellow"></span>
              <span class="md-code-dot md-code-dot-green"></span>
            </div>
            <div class="md-code-language">${lang}</div>
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
      setupHeadingClickEvents(); // 确保每次内容更新后重新绑定标题点击事件
    });
  });
});

// 挂载后初始化
onMounted(() => {
  loading.value = false;
  nextTick(() => {
    setupCodeCopy();
    setupHeadingClickEvents(); // 确保初始化时绑定标题点击事件
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
  height: auto;
  overflow-y: visible;
  transition: all 0.3s ease;
  background-color: transparent !important;
}

.md-content {
  width: 100%;
  max-width: none;
  padding: 32px 24px;
  min-height: 100px;
  background-color: transparent !important;
  box-sizing: border-box;
}

/* 通知和错误提示 */
.md-notice {
  padding: 1.2rem;
  background-color: #f0f9ff;
  border-left: 4px solid #93c5fd;
  border-radius: 0.5rem;
  color: #1e40af;
  margin: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-out;
}

.md-error {
  padding: 1.2rem;
  background-color: #fee2e2;
  border-left: 4px solid #fca5a5;
  border-radius: 0.5rem;
  color: #b91c1c;
  margin: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-out;
}

/* ====== 标题样式 ====== */
.md-content h1,
.md-content h2,
.md-content h3,
.md-content h4,
.md-content h5,
.md-content h6 {
  margin-top: 2em !important;
  margin-bottom: 0.8em !important;
  font-weight: 600 !important;
  line-height: 1.3 !important;
  position: relative !important;
  scroll-margin-top: 80px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
  transition: all 0.3s ease !important;
  color: #2563eb !important;
  letter-spacing: -0.02em !important;
  padding-left: 0 !important;
  border-radius: 4px !important;
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
  bottom: -0.3em;
  left: 0;
  width: 2em;
  height: 3px;
  background: #2563eb;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 标题悬停效果 */
.md-content h1:hover,
.md-content h2:hover,
.md-content h3:hover,
.md-content h4:hover,
.md-content h5:hover,
.md-content h6:hover {
  color: #1d4ed8 !important;
  transform: translateX(4px);
}

.md-content h1:hover::after,
.md-content h2:hover::after,
.md-content h3:hover::after,
.md-content h4:hover::after,
.md-content h5:hover::after,
.md-content h6:hover::after {
  width: 4em;
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
  color: #60a5fa;
  transition: all 0.3s ease;
  font-size: 0.85em;
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
}

.md-content h2 {
  font-size: 1.8rem !important;
  padding-bottom: 0.2em !important;
  letter-spacing: -0.3px !important;
  font-weight: 700 !important;
}

.md-content h3 {
  font-size: 1.5rem !important;
  letter-spacing: -0.2px !important;
  font-weight: 600 !important;
}

.md-content h4 {
  font-size: 1.3rem !important;
  font-weight: 600 !important;
}

.md-content h5 {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
}

.md-content h6 {
  font-size: 1rem !important;
  font-weight: 500 !important;
  color: #3b82f6 !important;
}

/* 标题激活状态的样式 */
.md-heading-active {
  background-color: rgba(37, 99, 235, 0.08) !important;
  border-radius: 4px !important;
  padding-left: 8px !important;
  animation: gentleHighlight 1.5s ease-out !important;
}

@keyframes gentleHighlight {
  0% { background-color: rgba(37, 99, 235, 0.15); transform: translateX(0); }
  50% { background-color: rgba(37, 99, 235, 0.1); transform: translateX(2px); }
  100% { background-color: rgba(37, 99, 235, 0.05); transform: translateX(0); }
}

/* ====== 引用块样式 ====== */
.md-content blockquote {
  margin: 1.8em 0;
  padding: 1.2em 1.6em;
  border-left: 4px solid #3b82f6;
  background-color: #f0f7ff;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.08);
  transition: all 0.3s ease;
}

.md-content blockquote:hover {
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.12);
  transform: translateY(-2px);
}

/* 引用块顶部装饰 */
.md-content blockquote::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #3b82f6, transparent);
  border-radius: 2px 2px 0 0;
}

.md-content blockquote p {
  margin: 0.6em 0;
  color: #1e40af;
  font-size: 1rem;
  line-height: 1.7;
  position: relative;
  z-index: 1;
}

.md-content blockquote p:first-of-type {
  margin-top: 0;
}

.md-content blockquote p:last-of-type {
  margin-bottom: 0;
}

/* 引用块中的代码 */
.md-content blockquote code {
  background-color: rgba(255, 255, 255, 0.6);
  color: #2563eb;
}

/* ====== 优化后的代码块样式 ====== */
.md-code-block {
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  position: relative;
  line-height: 0;
  background-color: #2d333b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  /* 设置最大宽度，防止水平溢出 */
  width: 100%;
  max-width: 100%;
}

.md-code-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* 优化代码块头部 */
.md-code-header {
  height: 26px; /* 减小高度 */
  background-color: #1c2128;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px; /* 减小内边距 */
  position: relative;
}

.md-code-dots {
  display: flex;
  align-items: center;
  gap: 4px; /* 减小间距 */
}

.md-code-dot {
  width: 10px; /* 减小大小 */
  height: 10px; /* 减小大小 */
  border-radius: 50%;
  display: inline-block;
  transition: all 0.2s ease;
}

.md-code-dot-red {
  background-color: #ff5f56;
}

.md-code-dot-yellow {
  background-color: #ffbd2e;
}

.md-code-dot-green {
  background-color: #27c93f;
}

.md-code-language {
  font-size: 11px; /* 减小字体 */
  color: #adbac7;
  text-transform: lowercase;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.md-copy-button {
  font-size: 10px; /* 减小字体 */
  padding: 1px 6px; /* 减小内边距 */
  border-radius: 3px;
  border: none;
  background-color: rgba(205, 217, 229, 0.1);
  color: #adbac7;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.md-code-block:hover .md-copy-button {
  opacity: 1;
}

.md-copy-button:hover {
  background-color: rgba(205, 217, 229, 0.2);
  color: #ffffff;
}

.md-copy-button.md-copied {
  background-color: #27c93f;
  color: #ffffff;
}

/* 优化代码内容区域 */
.md-content pre {
  margin: 0 !important;
  padding: 10px 12px !important;
  color: #e6edf3 !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
  overflow-x: auto !important;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
  border: none !important;
  display: block !important;
  min-height: 0 !important;
  border-radius: 0 0 8px 8px !important;
  max-width: 800px !important;
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

/* 高亮代码样式 */
.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
  color: #ff7b72 !important;
}

.hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__,
.hljs-title.function_ {
  color: #d2a8ff !important;
}

.hljs-attr,
.hljs-attribute,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-operator,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id,
.hljs-variable {
  color: #79c0ff !important;
}

.hljs-meta .hljs-string,
.hljs-regexp,
.hljs-string {
  color: #a5d6ff !important;
}

.hljs-built_in,
.hljs-symbol {
  color: #ffa657 !important;
}

.hljs-code,
.hljs-comment,
.hljs-formula {
  color: #8b949e !important;
}

.hljs-name,
.hljs-quote,
.hljs-selector-pseudo,
.hljs-selector-tag {
  color: #7ee787 !important;
}

.hljs-subst {
  color: #c9d1d9 !important;
}

.hljs-section {
  color: #1f6feb;
  font-weight: bold !important;
}

.hljs-bullet {
  color: #f2cc60 !important;
}

/* 滚动条样式 */
.md-content pre::-webkit-scrollbar {
  height: 5px; /* 减小滚动条高度 */
  width: 5px;
}

.md-content pre::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.md-content pre::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.md-content pre::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 基本文本样式 */
.md-content p {
  margin: 1.2em 0;
  line-height: 1.8;
  animation: fadeIn 0.5s ease-out;
}

.md-content a {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px solid rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
  padding-bottom: 1px;
}

.md-content a:hover {
  color: #1d4ed8;
  border-bottom: 1px solid rgba(37, 99, 235, 0.8);
  background-color: rgba(37, 99, 235, 0.05);
  border-radius: 2px;
}

/* 列表样式 */
.md-content ul,
.md-content ol {
  padding-left: 2em;
  margin: 1.2em 0;
  animation: fadeIn 0.5s ease-out;
}

.md-content li {
  margin-bottom: 0.6em;
  position: relative;
}

.md-content ul li::marker {
  color: #3b82f6;
}

.md-content ol li::marker {
  color: #3b82f6;
  font-weight: 600;
}

/* 表格样式 */
.md-content table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease-out;
}

.md-content table th {
  background-color: #f1f5f9;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #e2e8f0;
  color: #4b5563;
}

.md-content table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.15s ease;
}

.md-content table tr {
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.md-content table tr:last-child td {
  border-bottom: none;
}

.md-content table tr:nth-child(2n) {
  background-color: #f8fafc;
}

.md-content table tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

/* 图片样式 */
.md-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.8em auto;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: fadeIn 0.8s ease-out;
}

.md-content img:hover {
  transform: scale(1.01);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 水平线 */
.md-content hr {
  margin: 2.5em 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.5), rgba(59, 130, 246, 0.1));
  border: none;
  animation: growWidth 1s ease-out;
}

/* 自定义提示框样式 */
.md-content .tip,
.md-content .warning,
.md-content .info,
.md-content .note {
  margin: 1.5em 0;
  padding: 1em 1.5em 1em 3.5em;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-out;
}

.md-content .tip::before,
.md-content .warning::before,
.md-content .info::before,
.md-content .note::before {
  position: absolute;
  left: 1em;
  top: 1em;
  font-size: 1.2em;
}

.md-content .tip {
  background-color: rgba(16, 185, 129, 0.08);
  border-left: 4px solid #10b981;
}

.md-content .tip::before {
  content: "💡";
}

.md-content .warning {
  background-color: rgba(245, 158, 11, 0.08);
  border-left: 4px solid #f59e0b;
}

.md-content .warning::before {
  content: "⚠️";
}

.md-content .info {
  background-color: rgba(59, 130, 246, 0.08);
  border-left: 4px solid #3b82f6;
}

.md-content .info::before {
  content: "ℹ️";
}

.md-content .note {
  background-color: rgba(99, 102, 241, 0.08);
  border-left: 4px solid #6366f1;
}

.md-content .note::before {
  content: "📝";
}

/* 确保行内代码不受影响 */
.md-content :not(pre) > code {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background-color: rgba(59, 130, 246, 0.08);
  border-radius: 4px;
  color: #2563eb;
  transition: background-color 0.2s ease;
}

.md-content :not(pre) > code:hover {
  background-color: rgba(59, 130, 246, 0.12);
}

/* 动画定义 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInFromLeft {
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes growWidth {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes popIn {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 滚动条自定义 */
.md-renderer::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.md-renderer::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 6px;
}

.md-renderer::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  border: 1.5px solid transparent;
  background-clip: content-box;
}

.md-renderer::-webkit-scrollbar-thumb:hover {
  background-color: rgba(59, 130, 246, 0.5);
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
  color: #60a5fa !important;
}

.dark-mode .md-content h1::after,
.dark-mode .md-content h2::after,
.dark-mode .md-content h3::after,
.dark-mode .md-content h4::after,
.dark-mode .md-content h5::after,
.dark-mode .md-content h6::after {
  background: #60a5fa;
}

.dark-mode .md-content blockquote {
  background-color: rgba(37, 99, 235, 0.1);
  border-left: 4px solid #60a5fa;
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.15);
}

.dark-mode .md-content blockquote p {
  color: #93c5fd;
}

.dark-mode .md-content a {
  color: #60a5fa;
  border-bottom: 1px solid rgba(96, 165, 250, 0.3);
}

.dark-mode .md-content a:hover {
  color: #93c5fd;
  border-bottom: 1px solid rgba(96, 165, 250, 0.8);
  background-color: rgba(96, 165, 250, 0.1);
}

.dark-mode .md-content :not(pre) > code {
  background-color: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.dark-mode .md-content table th {
  background-color: #1f2937;
  border-bottom: 2px solid #374151;
  color: #e2e8f0;
}

.dark-mode .md-content table td {
  border-bottom: 1px solid #374151;
}

.dark-mode .md-content table tr {
  background-color: #111827;
}

.dark-mode .md-content table tr:nth-child(2n) {
  background-color: #1f2937;
}

.dark-mode .md-content table tr:hover {
  background-color: rgba(59, 130, 246, 0.15);
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
    padding: 1em 1.2em;
  }

  /* 移动端代码块进一步优化 */
  .md-code-header {
    height: 24px;
  }

  .md-content pre {
    padding: 8px 10px !important;
    font-size: 12px !important;
  }
}
</style>