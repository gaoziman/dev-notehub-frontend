<template>
  <div class="create-document-page">
    <!-- 顶部导航区域 -->
    <div class="page-content">
      <div class="top-navbar">
        <div class="navbar-content">
          <div class="navbar-left">
            <n-button quaternary circle @click="goBack" class="back-btn">
              <icon-font type="icon-fanhui" />
            </n-button>
            <n-input
                v-model:value="documentForm.title"
                placeholder="请输入文章标题..."
                class="title-input"
                :bordered="false"
            />
          </div>
          <div class="navbar-right">
            <n-button class="save-btn" @click="saveAsDraft">
              <template #icon>
                <icon-font type="icon-save" />
              </template>
              保存草稿
            </n-button>
            <n-button type="primary" class="publish-btn" @click="publishDocument" :loading="publishing">
              <template #icon>
                <icon-font type="icon-publish" />
              </template>
              {{ publishing ? '发布中...' : '发布文档' }}
            </n-button>
          </div>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="editor-container">
        <div class="editor-layout">
          <!-- 编辑器区域 -->
          <div class="editor-area">
            <md-editor
                v-model="documentForm.content"
                :theme="editorTheme"
                @onSave="handleEditorSave"
                @onChange="setDirty"
                :toolbars="toolbars"
                :tab-width="2"
                :preview-theme="previewTheme"
                code-theme="github"
                :placeholder="editorPlaceholder"
                preview-only-mode="false"
                :code-fold="true"
                :auto-focus="true"
                :show-line-number="true"
            />
          </div>

          <!-- 设置面板区域 - 修改滚动结构 -->
          <div class="settings-wrapper">
            <div class="settings-area">
              <!-- 文档设置 -->
              <n-card title="文档设置" class="settings-card">
                <!-- 文档分类 -->
                <n-form-item label="文档分类" required>
                  <n-cascader
                      v-model:value="documentForm.category"
                      placeholder="选择文档分类"
                      :options="categoryOptions"
                      check-strategy="child"
                      :show-path="true"
                      class="full-width"
                  />
                </n-form-item>

                <!-- 文档标签 -->
                <n-form-item label="文档标签">
                  <n-dynamic-tags
                      v-model:value="documentForm.tags"
                      :max="5"
                      :input-props="{
                      placeholder: '输入标签名称并按回车'
                    }"
                      class="full-width"
                  />
                  <div class="help-text">最多可添加5个标签，推荐使用3-5个准确的关键词</div>
                </n-form-item>

                <!-- 文档描述 -->
                <n-form-item label="文档描述">
                  <n-input
                      v-model:value="documentForm.description"
                      type="textarea"
                      placeholder="请输入文档简短描述，将显示在文档卡片上..."
                      :autosize="{ minRows: 3, maxRows: 5 }"
                      :maxlength="200"
                      show-count
                      class="full-width"
                  />
                </n-form-item>

                <!-- 封面图上传 -->
                <n-form-item label="封面图">
                  <div class="cover-uploader">
                    <n-upload
                        v-model:file-list="fileList"
                        list-type="image-card"
                        :max="1"
                        :custom-request="customUploadRequest"
                        accept="image/png,image/jpeg,image/gif"
                    >
                      <div class="upload-area">
                        <n-icon size="24">
                          <icon-font v-if="!documentForm.coverImage" type="icon-tupian" />
                        </n-icon>
                        <span v-if="!documentForm.coverImage">点击上传封面图</span>
                      </div>
                    </n-upload>
                    <div class="help-text">推荐尺寸 900×500px，JPEG/PNG/GIF 格式</div>
                  </div>
                </n-form-item>
              </n-card>

              <!-- AI 助手 -->
              <n-card title="AI 助手" class="settings-card">
                <div class="ai-assistant">
                  <div class="ai-header">
                    <icon-font type="icon-AI" size="20" />
                    <span>智能创作助手</span>
                  </div>
                  <div class="ai-content">
                    <n-button block @click="generateTitle" class="ai-btn">
                      <template #icon>
                        <icon-font type="icon-title" />
                      </template>
                      智能生成标题
                    </n-button>
                    <n-button block @click="generateDescription" class="ai-btn">
                      <template #icon>
                        <icon-font type="icon-description" />
                      </template>
                      生成文档描述
                    </n-button>
                    <n-button block @click="suggestTags" class="ai-btn">
                      <template #icon>
                        <icon-font type="icon-biaoqian" />
                      </template>
                      推荐相关标签
                    </n-button>
                    <n-button block @click="improveContent" class="ai-btn">
                      <template #icon>
                        <icon-font type="icon-bianji" />
                      </template>
                      优化文档内容
                    </n-button>
                  </div>
                </div>
              </n-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示对话框 -->
    <n-modal v-model:show="showTipsModal" preset="dialog" title="保存提示" positive-text="确定" negative-text="取消">
      <template #icon>
        <n-icon>
          <icon-font type="icon-tishi" />
        </n-icon>
      </template>
      您尚未保存当前文档的更改，确定要离开吗？
    </n-modal>

    <!-- AI 助手对话框 -->
    <n-modal v-model:show="showAiModal" preset="card" :title="aiModalTitle" style="max-width: 600px">
      <div class="ai-modal-content">
        <n-spin v-if="aiGenerating" size="medium">
          <template #description>AI正在思考中...</template>
        </n-spin>
        <div v-else>
          <div class="ai-result">{{ aiResult }}</div>
          <div class="ai-actions">
            <n-space justify="end">
              <n-button @click="closeAiModal">
                取消
              </n-button>
              <n-button type="primary" @click="applyAiSuggestion">
                应用
              </n-button>
            </n-space>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import IconFont from "@/components/common/IconFont.vue"
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

import documentService from '@/services/documentService'

// 路由相关
const router = useRouter()

// 编辑器配置
const editorTheme = ref('light')
const previewTheme = ref('default')
const editorPlaceholder = ref('开始创作你的Markdown文档...')
const toolbars = [
  'bold', 'underline', 'italic', 'strikeThrough', 'sub', 'sup',
  '-',
  'title', 'quote', 'unorderedList', 'orderedList', 'task',
  '-',
  'codeRow', 'code', 'link', 'image', 'table', 'mermaid',
  '-',
  'revoke', 'next', 'save', 'pageFullscreen', 'fullscreen',
  '=',
  'preview', 'htmlPreview', 'catalog',
  '-',
  'github'
]

// 文档表单数据
const documentForm = reactive({
  title: '',
  content: '',
  category: null,
  tags: [],
  description: '',
  coverImage: null,
  visibility: 'public',
  settings: {
    allowComments: true,
    enableToc: true,
    enableCopy: true
  }
})

// 上传文件列表
const fileList = ref([])

// 状态变量
const publishing = ref(false)
const showTipsModal = ref(false)
const isDirty = ref(false)
const showAiModal = ref(false)
const aiModalTitle = ref('AI 助手')
const aiResult = ref('')
const aiGenerating = ref(false)

// 分类选项 - 从文档管理页提取并扩展
const categoryOptions = [
  {
    label: 'Java',
    value: 'java',
    children: [
      { label: 'Java 基础', value: 'java-basic' },
      { label: 'Java 高级', value: 'java-advanced' },
      { label: 'Java 虚拟机', value: 'jvm' },
      { label: '并发编程', value: 'concurrency' }
    ]
  },
  {
    label: 'Spring生态',
    value: 'spring',
    children: [
      { label: 'Spring Framework', value: 'spring-framework' },
      { label: 'SpringBoot', value: 'springboot' },
      { label: 'Spring Cloud', value: 'spring-cloud' },
      { label: 'Spring Security', value: 'spring-security' }
    ]
  },
  {
    label: '数据库',
    value: 'database',
    children: [
      { label: 'MySQL', value: 'mysql' },
      { label: 'Redis', value: 'redis' },
      { label: 'MongoDB', value: 'mongodb' },
      { label: 'ElasticSearch', value: 'elasticsearch' }
    ]
  },
  {
    label: '消息队列',
    value: 'mq',
    children: [
      { label: 'RabbitMQ', value: 'rabbitmq' },
      { label: 'RocketMQ', value: 'rocketmq' },
      { label: 'Kafka', value: 'kafka' }
    ]
  },
  {
    label: '前端技术',
    value: 'frontend',
    children: [
      { label: 'Vue', value: 'vue' },
      { label: 'React', value: 'react' },
      { label: 'Angular', value: 'angular' },
      { label: '微前端', value: 'micro-frontend' }
    ]
  },
  {
    label: 'DevOps',
    value: 'devops',
    children: [
      { label: 'Docker', value: 'docker' },
      { label: 'Kubernetes', value: 'kubernetes' },
      { label: 'CI/CD', value: 'cicd' },
      { label: '监控', value: 'monitoring' }
    ]
  },
  {
    label: '架构设计',
    value: 'architecture',
    children: [
      { label: '微服务', value: 'microservice' },
      { label: '分布式系统', value: 'distributed-system' },
      { label: '高可用架构', value: 'high-availability' },
      { label: '性能优化', value: 'performance' }
    ]
  }
]

// 返回文档中心
const goBack = () => {
  if (isDirty.value) {
    showTipsModal.value = true
    return
  }
  router.push('/documents')
}

// 保存为草稿
const saveAsDraft = () => {
  // 调用服务保存草稿
  const documentId = documentService.saveDocument(documentForm, true)
  console.log('保存草稿:', documentForm)
  isDirty.value = false

  // 模拟成功提示
  window.$message?.success('文档草稿已保存')

  // 可以选择是否跳转
  // router.push(`/document/view/${documentId}`)
}

// 发布文档
const publishDocument = async () => {
  if (!documentForm.title) {
    window.$message?.error('请输入文档标题')
    return
  }

  if (!documentForm.content) {
    window.$message?.error('文档内容不能为空')
    return
  }

  if (!documentForm.category) {
    window.$message?.error('请选择文档分类')
    return
  }

  // 调用API发布文档
  publishing.value = true

  try {
    // 保存文档并获取ID
    const documentId = documentService.saveDocument(documentForm, false)

    console.log('发布文档:', documentForm)
    isDirty.value = false

    // 模拟成功后操作
    window.$message?.success('文档发布成功')

    // 跳转到文档查看页面
    router.push(`/document/view/${documentId}`)
  } catch (error) {
    console.error('发布文档失败:', error)
    window.$message?.error('文档发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

// 自定义上传请求
const customUploadRequest = ({ file, data, headers, withCredentials, action, onFinish, onError, onProgress }) => {
  // 这里是模拟上传处理，实际应该是调用API上传文件
  const reader = new FileReader()
  reader.readAsDataURL(file.file)
  reader.onload = () => {
    documentForm.coverImage = reader.result
    onFinish()
  }
  reader.onerror = () => {
    onError()
    window.$message?.error('封面图上传失败')
  }

  // 模拟上传进度
  let progress = 0
  const interval = setInterval(() => {
    progress += 10
    onProgress({ percent: progress })
    if (progress >= 100) {
      clearInterval(interval)
    }
  }, 100)
}

// 编辑器保存回调
const handleEditorSave = () => {
  saveAsDraft()
}

// 监听内容变化
const setDirty = () => {
  isDirty.value = true
}

// AI功能：生成标题
const generateTitle = () => {
  if (!documentForm.content) {
    window.$message?.warning('请先编写一些内容，AI才能生成合适的标题')
    return
  }

  aiModalTitle.value = '智能生成标题'
  aiGenerating.value = true
  showAiModal.value = true

  // 模拟AI处理
  setTimeout(() => {
    // 根据内容生成标题的逻辑
    const contentPreview = documentForm.content.substring(0, 200)
    let generatedTitle = ''

    if (contentPreview.includes('Spring')) {
      generatedTitle = 'Spring框架核心原理与实践指南'
    } else if (contentPreview.includes('Java')) {
      generatedTitle = 'Java高级特性详解与性能优化技巧'
    } else if (contentPreview.includes('Docker') || contentPreview.includes('Kubernetes')) {
      generatedTitle = '容器化部署与微服务架构实践'
    } else if (contentPreview.includes('算法')) {
      generatedTitle = '高效算法设计与性能分析'
    } else {
      generatedTitle = '技术深度剖析：从原理到实践的探索之旅'
    }

    aiResult.value = generatedTitle
    aiGenerating.value = false
  }, 1500)
}

// AI功能：生成描述
const generateDescription = () => {
  if (!documentForm.content) {
    window.$message?.warning('请先编写一些内容，AI才能生成合适的描述')
    return
  }

  aiModalTitle.value = '生成文档描述'
  aiGenerating.value = true
  showAiModal.value = true

  // 模拟AI处理
  setTimeout(() => {
    // 简单的描述生成逻辑
    const contentPreview = documentForm.content.substring(0, 500)
    let generatedDescription = ''

    if (contentPreview.includes('Spring')) {
      generatedDescription = '本文深入剖析了Spring框架的核心原理，包括IoC容器、AOP实现机制、事务管理等关键特性，并结合实际案例展示了Spring在企业级应用中的最佳实践方案。'
    } else if (contentPreview.includes('Java')) {
      generatedDescription = '这篇文档详细介绍了Java高级特性及其内部实现原理，包括并发编程、JVM调优、函数式编程等核心内容，帮助开发者深入理解Java平台并提升代码质量。'
    } else if (contentPreview.includes('Docker') || contentPreview.includes('Kubernetes')) {
      generatedDescription = '本文探讨了现代容器化技术在微服务架构中的应用，详细讲解了Docker和Kubernetes的配置与优化方法，以及如何构建高可用的云原生应用。'
    } else {
      generatedDescription = '这是一篇深入剖析技术原理与实践经验的文档，通过清晰的概念解析和丰富的示例代码，帮助读者全面掌握相关技术并应用于实际项目中。'
    }

    aiResult.value = generatedDescription
    aiGenerating.value = false
  }, 1800)
}

// AI功能：推荐标签
const suggestTags = () => {
  if (!documentForm.content) {
    window.$message?.warning('请先编写一些内容，AI才能推荐相关标签')
    return
  }

  aiModalTitle.value = '推荐相关标签'
  aiGenerating.value = true
  showAiModal.value = true

  // 模拟AI处理
  setTimeout(() => {
    // 简单的标签推荐逻辑
    const contentPreview = documentForm.content.toLowerCase()
    const suggestedTags = []

    if (contentPreview.includes('spring')) {
      suggestedTags.push('Spring', '框架', '依赖注入')
    }

    if (contentPreview.includes('java')) {
      suggestedTags.push('Java', 'JVM')
    }

    if (contentPreview.includes('性能') || contentPreview.includes('优化')) {
      suggestedTags.push('性能优化', '最佳实践')
    }

    if (contentPreview.includes('docker') || contentPreview.includes('kubernetes')) {
      suggestedTags.push('容器化', 'DevOps', '微服务')
    }

    if (contentPreview.includes('算法')) {
      suggestedTags.push('算法', '数据结构')
    }

    if (suggestedTags.length === 0) {
      suggestedTags.push('技术', '编程', '开发')
    }

    // 最多取5个标签
    aiResult.value = suggestedTags.slice(0, 5).join(', ')
    aiGenerating.value = false
  }, 1200)
}

// AI功能：优化内容
const improveContent = () => {
  if (!documentForm.content || documentForm.content.length < 50) {
    window.$message?.warning('请先编写一些内容（至少50字），AI才能提供优化建议')
    return
  }

  aiModalTitle.value = '内容优化建议'
  aiGenerating.value = true
  showAiModal.value = true

  // 模拟AI处理
  setTimeout(() => {
    // 简单的内容优化建议
    aiResult.value = `您的文档内容分析如下：

1. 结构建议：可以考虑添加更清晰的章节标题，使用##和###标记重要的段落，增强文档的层次感。

2. 内容建议：建议在技术概念介绍后增加具体的代码示例，提高文档的实用性。

3. 格式优化：可以使用表格来展示比较信息，使用列表来呈现步骤说明，让内容更加条理化。

4. 完整性建议：建议添加"常见问题"和"最佳实践"部分，帮助读者更全面地理解内容。

希望这些建议对您有所帮助！`

    aiGenerating.value = false
  }, 2000)
}

// 关闭AI对话框
const closeAiModal = () => {
  showAiModal.value = false
  aiResult.value = ''
}

// 应用AI建议
const applyAiSuggestion = () => {
  // 根据当前的AI模态框标题应用不同的建议
  if (aiModalTitle.value === '智能生成标题') {
    documentForm.title = aiResult.value
  } else if (aiModalTitle.value === '生成文档描述') {
    documentForm.description = aiResult.value
  } else if (aiModalTitle.value === '推荐相关标签') {
    // 处理标签，避免重复
    const newTags = aiResult.value.split(',').map(tag => tag.trim())
    const existingTags = new Set(documentForm.tags)

    for (const tag of newTags) {
      if (!existingTags.has(tag) && documentForm.tags.length < 5) {
        documentForm.tags.push(tag)
        existingTags.add(tag)
      }
    }
  }

  closeAiModal()
  window.$message?.success('已应用AI建议')
}

// 监听内容变化
onMounted(() => {
  // 添加监听器，检测文档内容变化
  window.addEventListener('beforeunload', preventNavigation)
})

onBeforeUnmount(() => {
  // 移除监听器
  window.removeEventListener('beforeunload', preventNavigation)
})

// 防止未保存内容丢失
const preventNavigation = (e) => {
  if (isDirty.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}
</script>

<style scoped>
/* 全局变量 */
.create-document-page {
  --primary-color: #6366f1;
  --primary-light: rgba(99, 102, 241, 0.08);
  --primary-lighter: rgba(99, 102, 241, 0.04);
  --primary-shadow: rgba(99, 102, 241, 0.15);
  --text-primary: #333;
  --text-secondary: #666;
  --text-light: #909399;
  --border-color: #e5e7eb;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  --card-radius: 12px;
  --navbar-height: 64px;
  --page-padding: 24px;

  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f5f7fa 0%, #f0f2f8 100%);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 页面内容区域 - 新增容器 */
.page-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* 顶部导航栏 */
.top-navbar {
  background: #fff;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--navbar-height);
  padding: 0 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 800px;
  position: relative;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-lighter);
  color: var(--primary-color);
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: var(--primary-light);
  transform: translateX(-2px);
  box-shadow: 0 2px 6px var(--primary-shadow);
}

.title-input {
  width: 100%;
  position: relative;
}

:deep(.title-input .n-input__wrapper) {
  padding: 0;
  background: transparent;
}

:deep(.title-input .n-input__input-el) {
  height: 46px;
  font-size: 20px;
  font-weight: 600;
  padding: 0;
  color: var(--text-primary);
  border-bottom: 2px solid transparent;
  transition: border 0.3s ease;
}

:deep(.title-input .n-input__input-el:focus) {
  border-bottom: 2px solid var(--primary-color);
}

:deep(.title-input .n-input__placeholder) {
  font-weight: normal;
  color: #9ca3af;
  font-size: 20px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-btn {
  height: 40px;
  border-radius: 8px;
  padding: 0 18px;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background-color: white;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.save-btn:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.publish-btn {
  height: 40px;
  border-radius: 8px;
  padding: 0 18px;
  font-weight: 500;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  box-shadow: 0 2px 4px var(--primary-shadow);
  transition: all 0.3s ease;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--primary-shadow);
}

/* 编辑器容器 - 新增 */
.editor-container {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

/* 编辑器布局 */
.editor-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* 编辑器区域 */
.editor-area {
  flex: 3;
  min-width: 0;
  height: 100%;
  border-right: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.md-editor) {
  height: 100% !important;
  border: none;
  overflow: hidden;
}

:deep(.md-editor-content) {
  height: calc(100% - 50px) !important;
}

/* 设置包装器 - 全新结构 */
.settings-wrapper {
  flex: 1;
  min-width: 360px;
  max-width: 420px;
  height: 100%;
  overflow-y: auto; /* 重要：直接在外层容器设置滚动 */
  scrollbar-width: thin; /* Firefox支持 */
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05); /* Firefox支持 */
}

/* 设置滚动条样式 */
.settings-wrapper::-webkit-scrollbar {
  width: 8px; /* 增大宽度 */
}

.settings-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.settings-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2); /* 更深的颜色 */
  border-radius: 10px;
}

.settings-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 设置内容区域 */
.settings-area {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  box-shadow: none;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 0;
}

.settings-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.03);
}

:deep(.settings-card .n-card-header) {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

:deep(.settings-card .n-card__title) {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.settings-card .n-card__content) {
  padding: 18px 20px;
}

/* 表单元素 */
:deep(.n-form-item .n-form-item-label) {
  font-weight: 500;
  color: var(--text-secondary);
  padding-bottom: 6px;
}

.full-width {
  width: 100%;
}

.help-text {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
  line-height: 1.5;
}

/* 文档上传区域 */
.cover-uploader {
  width: 100%;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  padding: 24px 0;
  color: var(--text-light);
}

/* AI助手样式 */
.ai-assistant {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 15px;
}

.ai-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ai-btn {
  text-align: left;
  height: 42px;
  font-weight: 500;
  background-color: var(--primary-lighter);
  border-color: transparent;
  color: var(--text-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  padding: 0 12px;
}

.ai-btn:hover {
  background-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--primary-shadow);
}

/* AI对话框 */
.ai-modal-content {
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.ai-result {
  padding: 18px;
  background-color: #f9f9fb;
  border-radius: 10px;
  min-height: 120px;
  white-space: pre-line;
  line-height: 1.6;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.03);
  color: var(--text-primary);
}

.ai-actions {
  margin-top: auto;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .editor-layout {
    flex-direction: column;
  }

  .editor-area {
    flex: 1;
    min-height: 500px;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }

  .settings-wrapper {
    max-width: 100%;
    min-width: 0;
    height: auto;
    max-height: 400px; /* 在小屏幕下限制最大高度 */
  }
}

@media (max-width: 768px) {
  .create-document-page {
    padding: 16px;
  }

  .navbar-content {
    height: auto;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .navbar-left, .navbar-right {
    width: 100%;
    max-width: none;
  }

  .navbar-right {
    justify-content: space-between;
  }

  /* AI助手按钮在小屏幕上回到单列布局 */
  .ai-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .create-document-page {
    padding: 10px;
  }

  .save-btn, .publish-btn {
    padding: 0 12px;
    font-size: 14px;
  }

  :deep(.title-input .n-input__input-el) {
    font-size: 18px;
  }
}
</style>