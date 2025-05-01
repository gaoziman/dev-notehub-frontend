<template>
  <div class="create-document-container">
    <!-- 顶部导航区域 -->
    <header class="top-navbar">
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
        <div class="unsaved-indicator" v-if="isDirty">
          <div class="pulse-dot"></div>
          <span>未保存</span>
        </div>
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
    </header>

    <!-- 主内容区域 -->
    <main class="editor-main">
      <!-- 左侧编辑器 -->
      <div class="editor-wrapper">
        <!-- Markdown编辑器 -->
        <div class="md-editor-container">
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
      </div>

      <!-- 右侧设置面板 -->
      <div class="settings-panel" :class="{ 'panel-collapsed': settingsPanelCollapsed }">
        <div class="panel-toggle" @click="toggleSettingsPanel">
          <icon-font :type="settingsPanelCollapsed ? 'icon-right' : 'icon-left'" size="16" />
        </div>

        <n-scrollbar v-show="!settingsPanelCollapsed" class="settings-scrollbar">
          <div class="settings-content">

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

              <!-- 文档标签 - 改进的样式 -->
              <n-form-item label="文档标签" class="tags-form-item">
                <div class="tags-container">
                  <n-dynamic-tags
                      v-model:value="documentForm.tags"
                      :max="5"
                      :input-props="{
                      placeholder: '输入标签名称并按回车'
                    }"
                      class="full-width enhanced-tags"
                  />
                  <div class="tag-suggestions">
                    <span class="suggestion-title">推荐:</span>
                    <div class="suggestion-tags">
                      <n-tag
                          v-for="tag in suggestedTags"
                          :key="tag"
                          class="suggestion-tag"
                          @click="addTag(tag)"
                          :disabled="documentForm.tags.includes(tag) || documentForm.tags.length >= 5">
                        {{ tag }}
                      </n-tag>
                    </div>
                  </div>
                  <div class="help-text">最多可添加5个标签，推荐使用3-5个准确的关键词</div>
                </div>
              </n-form-item>

              <!-- 改进后的文档描述 -->
              <n-form-item label="文档描述" class="description-form-item">
                <div class="description-container">
                  <div class="description-header">
                    <div class="description-icon">
                      <icon-font type="icon-description" />
                    </div>
                    <div class="description-tip">简短精确的描述可以提高文档在搜索中的曝光率</div>
                  </div>
                  <n-input
                      v-model:value="documentForm.description"
                      type="textarea"
                      placeholder="请输入文档简短描述，将显示在文档卡片上..."
                      :autosize="{ minRows: 3, maxRows: 5 }"
                      :maxlength="200"
                      class="description-textarea"
                  />
                  <div class="description-footer">
                    <div class="description-examples">
                      <span class="examples-title">示例:</span>
                      <span class="example-text">本文深入剖析Spring框架核心原理...</span>
                    </div>
                    <div class="char-counter">{{ documentForm.description.length }}/200</div>
                  </div>
                </div>
              </n-form-item>

              <!-- 改进后的封面图上传 -->
              <n-form-item label="封面图" class="cover-form-item">
                <div class="cover-container">
                  <transition name="fade" mode="out-in">
                    <div v-if="!documentForm.coverImage" class="cover-upload-area" @click="triggerUpload" key="upload">
                      <div class="cover-placeholder">
                        <div class="upload-illustration">
                          <icon-font type="icon-tupian" size="32" />
                          <div class="upload-decoration"></div>
                        </div>
                        <div class="upload-info">
                          <h4 class="upload-title">添加封面图片</h4>
                          <p class="upload-hint">高质量的封面可以吸引更多读者</p>
                          <span class="upload-specs">推荐尺寸 900×500px / 最大 2MB</span>
                        </div>
                        <n-button type="primary" ghost class="select-image-btn">
                          <template #icon>
                            <icon-font type="icon-upload" />
                          </template>
                          选择图片
                        </n-button>
                      </div>
                    </div>
                    <div v-else class="cover-preview" key="preview">
                      <div class="preview-image-wrapper">
                        <img :src="documentForm.coverImage" alt="封面预览" class="preview-image"/>
                        <div class="preview-overlay">
                          <div class="preview-actions">
                            <n-button circle quaternary @click="replaceCoverImage">
                              <template #icon>
                                <icon-font type="icon-replace" />
                              </template>
                            </n-button>
                            <n-button circle quaternary @click="removeCoverImage">
                              <template #icon>
                                <icon-font type="icon-delete" />
                              </template>
                            </n-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>

                  <!-- 隐藏的上传组件 -->
                  <n-upload
                      ref="uploadRef"
                      v-model:file-list="fileList"
                      list-type="image-card"
                      :max="1"
                      :custom-request="customUploadRequest"
                      accept="image/png,image/jpeg,image/gif"
                      :show-file-list="false"
                      style="display: none;"
                  />
                </div>
              </n-form-item>
            </n-card>

            <!-- AI 助手 -->
            <n-card title="AI 助手" class="settings-card ai-card">
              <div class="ai-assistant">
                <div class="ai-header">
                  <icon-font type="icon-AI" size="20" />
                  <span>智能创作助手</span>
                </div>
                <div class="ai-content">
                  <n-button @click="generateTitle" class="ai-btn">
                    <template #icon>
                      <icon-font type="icon-title" />
                    </template>
                    智能生成标题
                  </n-button>
                  <n-button @click="generateDescription" class="ai-btn">
                    <template #icon>
                      <icon-font type="icon-description" />
                    </template>
                    生成文档描述
                  </n-button>
                  <n-button @click="suggestTags" class="ai-btn">
                    <template #icon>
                      <icon-font type="icon-biaoqian" />
                    </template>
                    推荐相关标签
                  </n-button>
                  <n-button @click="improveContent" class="ai-btn">
                    <template #icon>
                      <icon-font type="icon-bianji" />
                    </template>
                    优化文档内容
                  </n-button>
                </div>
              </div>
            </n-card>
          </div>
        </n-scrollbar>
      </div>
    </main>

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

// 上传组件引用
const uploadRef = ref(null)

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
const settingsPanelCollapsed = ref(false)
const showAdvancedSettings = ref(false)
const isFullscreen = ref(false)

// 推荐标签
const suggestedTags = ref(['Spring', 'Java', '微服务', '性能优化', '架构设计', '最佳实践', '教程'])

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

    console.log('文档已保存，ID:', documentId)
    console.log('发布文档详情:', documentForm)

    isDirty.value = false

    // 模拟成功后操作
    window.$message?.success('文档发布成功')

    // 构建完整的跳转URL
    const redirectUrl = `/document/view/${documentId}`
    console.log('准备跳转到:', redirectUrl)

    // 使用setTimeout确保消息显示后再跳转
    setTimeout(() => {
      router.push(redirectUrl)
          .then(() => console.log('路由跳转成功'))
          .catch(err => {
            console.error('路由跳转失败:', err)
            // 尝试使用window.location作为备选方案
            window.location.href = redirectUrl
          })
    }, 300) // 短暂延迟确保消息能显示
  } catch (error) {
    console.error('发布文档失败:', error)
    window.$message?.error('文档发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

// 添加标签
const addTag = (tag) => {
  if (!documentForm.tags.includes(tag) && documentForm.tags.length < 5) {
    documentForm.tags.push(tag)
    setDirty()
  }
}

// 触发封面图上传
const triggerUpload = () => {
  uploadRef.value?.openOpenFileDialog()
}

// 替换封面图
const replaceCoverImage = () => {
  triggerUpload()
}

// 移除封面图
const removeCoverImage = () => {
  documentForm.coverImage = null
  fileList.value = []
  setDirty()
}

// 自定义上传请求
const customUploadRequest = ({ file, data, headers, withCredentials, action, onFinish, onError, onProgress }) => {
  // 这里是模拟上传处理，实际应该是调用API上传文件
  const reader = new FileReader()
  reader.readAsDataURL(file.file)
  reader.onload = () => {
    documentForm.coverImage = reader.result
    onFinish()
    setDirty()
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

// 切换设置面板
const toggleSettingsPanel = () => {
  settingsPanelCollapsed.value = !settingsPanelCollapsed.value
}

// 切换高级设置
const toggleAdvancedSettings = () => {
  showAdvancedSettings.value = !showAdvancedSettings.value
}

// 切换全屏模式
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  document.documentElement.style.overflow = isFullscreen.value ? 'hidden' : ''
  // 这里可以添加全屏逻辑
}

// 获取字数统计
const getWordCount = () => {
  // 简单的中文字数统计，实际项目中可能需要更精确的算法
  const content = documentForm.content || ''
  return content.replace(/\s/g, '').length
}

// 估计阅读时间
const estimateReadTime = () => {
  const wordCount = getWordCount()
  // 假设阅读速度为每分钟300字
  const minutes = Math.ceil(wordCount / 300)
  return `${minutes}分钟`
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
:root {
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: rgba(99, 102, 241, 0.08);
  --primary-lighter: rgba(99, 102, 241, 0.04);
  --primary-shadow: rgba(99, 102, 241, 0.15);
  --warning-color: #f59e0b;
  --warning-bg: rgba(245, 158, 11, 0.15);
  --bg-color: #f5f7fa;
  --bg-gradient: linear-gradient(180deg, #f5f7fa 0%, #f0f2f8 100%);
  --text-primary: #333;
  --text-secondary: #666;
  --text-light: #909399;
  --border-color: #e5e7eb;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  --card-radius: 12px;
  --navbar-height: 64px;
  --transition-normal: all 0.3s ease;
}

.create-document-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-gradient);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: var(--navbar-height);
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  flex: 1;
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
  transition: var(--transition-normal);
}

.back-btn:hover {
  background-color: var(--primary-light);
  transform: translateX(-2px);
  box-shadow: 0 2px 6px var(--primary-shadow);
}

.title-input {
  width: 100%;
  max-width: 600px;
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
  gap: 16px;
}

/* 未保存指示器 - 新设计 */
.unsaved-indicator {
  display: flex;
  align-items: center;
  background-color: var(--warning-bg);
  color: var(--warning-color);
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 14px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 2px 5px rgba(245, 158, 11, 0.2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--warning-color);
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

.save-btn {
  height: 40px;
  border-radius: 8px;
  padding: 0 18px;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background-color: white;
  color: var(--text-primary);
  transition: var(--transition-normal);
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
  transition: var(--transition-normal);
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--primary-shadow);
}

/* 主编辑区域 */
.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 编辑器包装器 */
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  position: relative;
}

/* Markdown编辑器容器 */
.md-editor-container {
  flex: 1;
  overflow: hidden;
}

:deep(.md-editor) {
  height: 100% !important;
  border: none !important;
  overflow: hidden;
}

:deep(.md-editor-content) {
  height: calc(100% - 50px) !important;
}

/* 设置面板 */
.settings-panel {
  width: 420px;
  height: 100%;
  background-color: white;
  border-left: 1px solid var(--border-color);
  position: relative;
  transition: width 0.3s ease;
  overflow: hidden;
}

.panel-collapsed {
  width: 24px;
}

.panel-toggle {
  position: absolute;
  top: 50%;
  left: 0;
  width: 24px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0, #e5e5e5);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 4px 4px 0;
  z-index: 10;
  cursor: pointer;
  transform: translateY(-50%);
  transition: var(--transition-normal);
}

.panel-toggle:hover {
  background: linear-gradient(90deg, #e5e5e5, #d5d5d5);
  color: var(--text-primary);
}

.settings-scrollbar {
  height: 100%;
  width: 100%;
}

.settings-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 文档信息卡片 */
.info-card {
  background-color: #f9fafb;
  border: 1px solid #f0f0f0;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  border-radius: 10px;
}

.document-stats {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.stat-item {
  text-align: center;
  padding: 8px 0;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 设置卡片样式 */
.settings-card {
  border: 1px solid #f0f0f0;
  transition: var(--transition-normal);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.settings-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.settings-card .n-card-header) {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

:deep(.settings-card .n-card__title) {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.settings-card .n-card__content) {
  padding: 20px;
}

/* 表单元素 */
:deep(.n-form-item .n-form-item-label) {
  font-weight: 500;
  color: var(--text-secondary);
  padding-bottom: 10px;
  font-size: 15px;
}

.full-width {
  width: 100%;
}

.help-text {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 8px;
  line-height: 1.5;
}

/* 标签容器增强 */
.tags-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #e5e7eb;
}

.suggestion-title {
  color: var(--text-secondary);
  font-size: 13px;
  margin-right: 6px;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  background-color: white;
  border: 1px solid #e5e7eb;
}

.suggestion-tag:hover {
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

/* 改进的标签输入 */
.enhanced-tags :deep(.n-dynamic-tags__input) {
  border-radius: 8px;
}

.enhanced-tags :deep(.n-tag) {
  margin: 4px;
  border-radius: 16px;
  padding: 2px 10px;
  background-color: var(--primary-lighter);
  color: var(--primary-color);
  border: 1px solid transparent;
}

.enhanced-tags :deep(.n-tag:hover) {
  background-color: var(--primary-light);
}

/* 文档描述改进样式 */
.description-form-item {
  margin-bottom: 24px;
}

.description-container {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background-color: white;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.description-container:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.description-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(to right, #f9fafb, #f3f4f6);
  border-bottom: 1px solid #f0f0f0;
}

.description-icon {
  color: var(--primary-color);
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.description-tip {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.description-textarea {
  width: 100%;
}

.description-textarea :deep(.n-input__textarea) {
  border: none !important;
  border-radius: 0 !important;
  padding: 16px !important;
  background-color: white;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
}

.description-textarea :deep(.n-input__textarea:focus) {
  box-shadow: none !important;
  background-color: #fafbfc;
}

.description-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #f9fafb;
  border-top: 1px solid #f0f0f0;
}

.description-examples {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.examples-title {
  color: var(--text-secondary);
  margin-right: 8px;
  font-weight: 500;
}

.example-text {
  color: var(--text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
  font-style: italic;
}

.char-counter {
  font-size: 12px;
  color: var(--text-light);
  font-weight: 500;
}

/* 封面图上传改进样式 */
.cover-form-item {
  margin-bottom: 20px;
}

.cover-container {
  width: 100%;
  position: relative;
}

.cover-upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cover-upload-area:hover {
  border-color: var(--primary-color);
  background-color: #f5f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 30px 20px;
  text-align: center;
}

.upload-illustration {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.upload-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 70%, transparent 100%);
  z-index: -1;
}

.upload-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.upload-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.upload-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 4px;
}

.upload-specs {
  font-size: 12px;
  color: var(--text-light);
  background-color: rgba(0, 0, 0, 0.03);
  padding: 3px 10px;
  border-radius: 12px;
}

.select-image-btn {
  margin-top: 8px;
  font-weight: 500;
  border-radius: 20px;
  padding: 0 20px;
  height: 40px;
  border-color: var(--primary-color);
  transition: all 0.3s ease;
}

.select-image-btn:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px var(--primary-shadow);
}

/* 封面图预览 */
.cover-preview {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 50%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-preview:hover .preview-overlay {
  opacity: 1;
}

.cover-preview:hover .preview-image {
  transform: scale(1.05);
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-actions :deep(.n-button) {
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.preview-actions :deep(.n-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.preview-actions :deep(.n-button:last-child) {
  color: #e53e3e;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* AI助手样式 */
.ai-card {
  background: linear-gradient(145deg, #f8f9ff, #f0f5ff);
  border: 1px solid #e5eaff;
}

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
  gap: 12px;
}

.ai-btn {
  text-align: left;
  height: 44px;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(99, 102, 241, 0.1);
  color: var(--text-primary);
  border-radius: 8px;
  transition: var(--transition-normal);
  font-size: 14px;
  padding: 0 12px;
}

.ai-btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.1);
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
  .settings-panel {
    width: 380px;
  }
}

@media (max-width: 992px) {
  .ai-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .editor-main {
    flex-direction: column;
  }

  .settings-panel {
    width: 100%;
    height: 300px;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }

  .panel-collapsed {
    height: 24px;
    width: 100%;
  }

  .panel-toggle {
    top: 0;
    left: 50%;
    width: 40px;
    height: 24px;
    transform: translateX(-50%);
    border-radius: 0 0 4px 4px;
  }

  .description-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .example-text {
    max-width: 100%;
  }
}

@media (max-width: 500px) {
  .top-navbar {
    padding: 0 12px;
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
  }

  .navbar-left, .navbar-right {
    width: 100%;
    padding: 8px 0;
  }

  .navbar-right {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .title-input {
    max-width: none;
  }

  :deep(.title-input .n-input__input-el) {
    font-size: 18px;
  }

  .save-btn, .publish-btn {
    padding: 0 14px;
    height: 36px;
    flex: 1;
  }

  .unsaved-indicator {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }
}
</style>