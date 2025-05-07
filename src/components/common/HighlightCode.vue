<template>
  <div class="md-code-block">
    <!-- 模拟macOS终端的顶部栏 -->
    <div class="md-code-header">
      <div class="md-code-dots">
        <span class="md-code-dot md-code-dot-red"></span>
        <span class="md-code-dot md-code-dot-yellow"></span>
        <span class="md-code-dot md-code-dot-green"></span>
      </div>
      <div class="md-code-language">{{ language }}</div>
      <div class="md-code-actions">
        <button class="md-copy-button" @click="copyCode">复制</button>
      </div>
    </div>

    <!-- 代码内容区域 -->
    <pre :class="['language-code', { 'line-numbers': lineNumbers }]">
      <code :class="`language-${language}`" ref="codeBlock">{{ code }}</code>
    </pre>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import Prism from 'prismjs'

// 导入基本样式
import 'prismjs/themes/prism.css'
// 导入行号插件
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
// 导入不同语言支持
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-sql'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'javascript'
  },
  lineNumbers: {
    type: Boolean,
    default: true
  }
})

const codeBlock = ref(null)
const isCopied = ref(false)

// 高亮代码函数，确保在DOM更新后执行
const highlightCode = async () => {
  // 等待DOM更新完成
  await nextTick()

  if (codeBlock.value) {
    try {
      // 确保Prism能够正确处理代码
      Prism.highlightElement(codeBlock.value)
    } catch (error) {
      console.error('Prism highlighting error:', error)
    }
  }
}

// 复制代码功能
const copyCode = () => {
  if (isCopied.value) return

  navigator.clipboard.writeText(props.code)
      .then(() => {
        isCopied.value = true
        const copyBtn = document.querySelector('.md-copy-button')
        if (copyBtn) {
          copyBtn.textContent = '已复制!'
          copyBtn.classList.add('md-copied')

          setTimeout(() => {
            copyBtn.textContent = '复制'
            copyBtn.classList.remove('md-copied')
            isCopied.value = false
          }, 2000)
        }
      })
      .catch(err => {
        console.error('复制失败:', err)
      })
}

// 监听props变化，确保重新渲染高亮
watch(() => props.code, highlightCode, { immediate: false })
watch(() => props.language, highlightCode)
watch(() => props.lineNumbers, highlightCode)

onMounted(() => {
  // 组件挂载后执行高亮
  highlightCode()
})
</script>

<style>
/* 代码块容器 - 现代IDE风格 */
.md-code-block {
  margin: 1em 0;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  position: relative;
  line-height: 0;
  background-color: #282c34;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  max-width: 100%;
  width: 100%;
  border: 1px solid #1a1d23;
}

.md-code-block:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2), 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* macOS风格的代码标题栏 */
.md-code-header {
  height: 36px;
  background: #21252b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 标题栏的macOS风格圆点 */
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

/* 语言标识 */
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

/* 复制按钮样式 */
.md-code-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.md-copy-button {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #abb2bf;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.md-code-block:hover .md-copy-button {
  opacity: 1;
}

.md-copy-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.md-copy-button.md-copied {
  background: #98c379;
  color: #ffffff;
}

/* 代码容器和代码样式 */
.md-code-block pre {
  margin: 0 !important;
  padding: 16px !important;
  background-color: #282c34 !important;
  color: #abb2bf !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  overflow-x: auto !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
  border: none !important;
  display: block !important;
  min-height: 0 !important;
  border-radius: 0 !important;
}

.md-code-block pre code {
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

/* 行号样式 */
.md-code-block .line-numbers .line-numbers-rows {
  border-right: 1px solid rgba(171, 178, 191, 0.2) !important;
  padding-right: 10px !important;
  margin-right: 10px !important;
}

.md-code-block .line-numbers-rows > span:before {
  color: rgba(171, 178, 191, 0.4) !important;
}

/* 滚动条样式 */
.md-code-block pre::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.md-code-block pre::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.md-code-block pre::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.md-code-block pre::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

/* Atom One Dark 语法高亮颜色 */
.md-code-block .token.comment,
.md-code-block .token.prolog,
.md-code-block .token.doctype,
.md-code-block .token.cdata {
  color: #5c6370 !important;
  font-style: italic !important;
}

.md-code-block .token.operator,
.md-code-block .token.punctuation {
  color: #abb2bf !important;
}

.md-code-block .token.keyword,
.md-code-block .token.atrule,
.md-code-block .token.property {
  color: #c678dd !important;
}

.md-code-block .token.boolean,
.md-code-block .token.number {
  color: #d19a66 !important;
}

.md-code-block .token.string,
.md-code-block .token.char,
.md-code-block .token.attr-value,
.md-code-block .token.builtin,
.md-code-block .token.inserted {
  color: #98c379 !important;
}

.md-code-block .token.selector,
.md-code-block .token.attr-name {
  color: #e06c75 !important;
}

.md-code-block .token.entity,
.md-code-block .token.url,
.md-code-block .token.symbol,
.md-code-block .token.deleted {
  color: #d19a66 !important;
}

.md-code-block .token.regex,
.md-code-block .token.important,
.md-code-block .token.variable {
  color: #56b6c2 !important;
}

.md-code-block .token.important,
.md-code-block .token.bold {
  font-weight: bold !important;
}

.md-code-block .token.italic {
  font-style: italic !important;
}

.md-code-block .token.function {
  color: #61aeee !important;
}

.md-code-block .token.tag {
  color: #e06c75 !important;
}

.md-code-block .token.class-name {
  color: #e6c07b !important;
}

/* 特殊语言处理 - Java */
.md-code-block .language-java .token.keyword {
  color: #c678dd !important;
}

.md-code-block .language-java .token.class-name {
  color: #4ec9b0 !important;
}

.md-code-block .language-java .token.function {
  color: #dcdcaa !important;
}

.md-code-block .language-java .token.operator {
  color: #d4d4d4 !important;
}

.md-code-block .language-java .token.string {
  color: #ce9178 !important;
}

.md-code-block .language-java .token.punctuation {
  color: #d4d4d4 !important;
}

.md-code-block .language-java .token.keyword.new {
  color: #c678dd !important;
}

.md-code-block .language-java .token.return {
  color: #c678dd !important;
}

.md-code-block .language-java .token.boolean,
.md-code-block .language-java .token.number {
  color: #b5cea8 !important;
}

.md-code-block .language-java .token.comment {
  color: #6a9955 !important;
}

/* 特殊语言处理 - JavaScript */
.md-code-block .language-javascript .token.function {
  color: #dcdcaa !important;
}

.md-code-block .language-javascript .token.class-name {
  color: #4ec9b0 !important;
}

/* 特殊语言处理 - Vue/HTML */
.md-code-block .language-html .token.tag {
  color: #569cd6 !important;
}

.md-code-block .language-html .token.attr-name {
  color: #9cdcfe !important;
}

.md-code-block .language-html .token.attr-value {
  color: #ce9178 !important;
}

/* 特殊语言处理 - CSS */
.md-code-block .language-css .token.property {
  color: #9cdcfe !important;
}

.md-code-block .language-css .token.selector {
  color: #d7ba7d !important;
}

/* 特定编程语言标识颜色 */
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

.md-code-language[data-lang="html"] {
  color: #e34c26;
}

.md-code-language[data-lang="css"] {
  color: #563d7c;
}

/* 响应式调整 */
@media (max-width: 768px) {
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

  .md-code-block pre {
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

  .md-copy-button {
    font-size: 10px;
    padding: 2px 6px;
  }

  .md-code-block pre {
    padding: 10px !important;
    font-size: 12px !important;
  }
}
</style>