<template>
  <div class="upload-page">
    <!-- 顶部区域 -->
    <div class="header-card">
      <div class="header-content">
        <!-- 标题和描述 -->
        <div class="header-left">
          <h1 class="main-title">
            <n-gradient-text type="primary" :size="24">文件上传中心</n-gradient-text>
          </h1>
          <p class="subtitle">上传、管理和组织您的知识资源，支持多种文件格式和批量处理</p>
        </div>

        <!-- 返回按钮 -->
        <div class="header-right">
          <n-button @click="goBack" class="back-button">
            <template #icon>
              <icon-font type="icon-fanhui" />
            </template>
            返回文档中心
          </n-button>
        </div>
      </div>

      <!-- 上传进度概览 -->
      <div class="upload-overview" v-if="hasUploadingFiles">
        <div class="overview-info">
          <div class="overview-title">
            <icon-font type="icon-shangchuan1" />
            <span>正在上传 {{ uploadingFiles.length }} 个文件</span>
          </div>
          <div class="overview-progress-text">
            {{ formatFileSize(uploadedBytes) }} / {{ formatFileSize(totalBytes) }}
            · {{ Math.round(overallProgress) }}%
          </div>
        </div>
        <n-progress
            type="line"
            :percentage="overallProgress"
            :indicator-placement="'inside'"
            :height="12"
            :border-radius="6"
            :color="progressGradient"
            :rail-style="{ borderRadius: '6px' }"
        />
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-container">
      <n-grid :cols="24" :x-gap="16">
        <!-- 左侧上传区域 -->
        <n-grid-item span="16">
          <n-card class="upload-card" title="上传文件" :bordered="false">
            <template #header-extra>
              <n-radio-group v-model:value="uploadMode" size="small" :on-update:value="switchUploadMode">
                <n-radio-button value="basic">
                  <n-space align="center">
                    <icon-font type="icon-wenjianjia" />
                    <span>基本上传</span>
                  </n-space>
                </n-radio-button>
                <n-radio-button value="advanced">
                  <n-space align="center">
                    <icon-font type="icon-gaoji" />
                    <span>高级上传</span>
                  </n-space>
                </n-radio-button>
              </n-radio-group>
            </template>

            <!-- 拖拽上传区域 -->
            <div class="upload-area">
              <n-upload
                  ref="uploadRef"
                  v-model:file-list="fileList"
                  :custom-request="customUploadRequest"
                  directory-dnd
                  :show-file-list="false"
                  :max="10"
                  :multiple="true"
                  :accept="'.md,.pdf,.doc,.docx,.jpg,.png,.txt'"
              >
                <n-upload-dragger>
                  <div class="upload-dragger-content">
                    <div v-if="!hasUploadingFiles">
                      <n-icon size="48" depth="3">
                        <icon-font type="icon-shangchuan" size="48" />
                      </n-icon>
                      <div class="upload-text">
                        <p class="upload-title">将文件拖放到此处，或<em>点击上传</em></p>
                        <p class="upload-description">
                          支持 Markdown、PDF、文档、图片等多种文件格式，单个文件最大 50MB
                        </p>
                      </div>
                    </div>
                    <div v-else class="uploading-list">
                      <div class="uploading-title">正在处理的文件</div>
                      <n-scrollbar style="max-height: 250px">
                        <n-list hoverable clickable>
                          <n-list-item v-for="file in uploadingFiles" :key="file.id">
                            <n-thing :title="file.name" :description="`${formatFileSize(file.size)}`">
                              <template #avatar>
                                <div class="file-type-icon" :class="getFileTypeClass(file.name)">
                                  <icon-font :type="getFileIcon(file.name)" />
                                </div>
                              </template>
                              <template #description>
                                <div style="margin-top: 8px">
                                  <n-progress
                                      type="line"
                                      :percentage="file.progress"
                                      :indicator-placement="'inside'"
                                      :processing="file.status === 'uploading'"
                                      :status="getProgressStatus(file.status)"
                                      :height="8"
                                      :border-radius="4"
                                  />
                                  <div class="file-status-text">
                                    <span>{{ getStatusText(file.status) }}</span>
                                    <n-button v-if="file.status === 'error'" size="tiny" text type="error" @click="retryUpload(file)">
                                      重试
                                    </n-button>
                                    <n-button v-if="file.status !== 'success' && file.status !== 'error'" size="tiny" text type="error" @click="cancelUpload(file)">
                                      取消
                                    </n-button>
                                  </div>
                                </div>
                              </template>
                            </n-thing>
                          </n-list-item>
                        </n-list>
                      </n-scrollbar>
                    </div>
                  </div>
                </n-upload-dragger>
              </n-upload>
            </div>

            <!-- 批量编辑区域 -->
            <div class="batch-edit-area" v-if="uploadMode === 'advanced' && hasSelectedFiles">
              <div class="area-title">批量编辑</div>
              <n-form :model="batchEdit" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
                <n-form-item label="添加到分类">
                  <n-select v-model:value="batchEdit.category" :options="categoryOptions" placeholder="选择分类" clearable />
                </n-form-item>
                <n-form-item label="添加标签">
                  <n-dynamic-tags v-model:value="batchEdit.tags" />
                </n-form-item>
                <n-form-item label="权限设置">
                  <n-radio-group v-model:value="batchEdit.permission">
                    <n-space>
                      <n-radio value="private">
                        <n-space align="center">
                          <icon-font type="icon-lock" />
                          <span>私有</span>
                        </n-space>
                      </n-radio>
                      <n-radio value="team">
                        <n-space align="center">
                          <icon-font type="icon-team" />
                          <span>团队</span>
                        </n-space>
                      </n-radio>
                      <n-radio value="public">
                        <n-space align="center">
                          <icon-font type="icon-global" />
                          <span>公开</span>
                        </n-space>
                      </n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>
                <n-form-item>
                  <n-space>
                    <n-button type="primary" @click="applyBatchEdit">
                      应用到所有文件
                    </n-button>
                    <n-button @click="resetBatchEdit">
                      重置
                    </n-button>
                  </n-space>
                </n-form-item>
              </n-form>
            </div>

            <!-- 上传按钮区域 -->
            <div class="upload-actions">
              <n-space>
                <n-button type="primary" @click="addFiles" :disabled="isUploading">
                  <template #icon>
                    <icon-font type="icon-tianjia" />
                  </template>
                  添加文件
                </n-button>
                <n-button @click="clearAllFiles" :disabled="!hasUploadingFiles || isUploading">
                  <template #icon>
                    <icon-font type="icon-qingkong" />
                  </template>
                  清空列表
                </n-button>
              </n-space>

              <n-space>
                <n-popover trigger="hover" placement="top">
                  <template #trigger>
                    <n-button quaternary circle>
                      <icon-font type="icon-bangzhu" />
                    </n-button>
                  </template>
                  <div class="help-content">
                    <p><strong>支持的文件类型：</strong></p>
                    <ul>
                      <li>Markdown (.md)</li>
                      <li>PDF (.pdf)</li>
                      <li>Office文档 (.doc, .docx)</li>
                      <li>图片 (.jpg, .png)</li>
                      <li>文本 (.txt)</li>
                    </ul>
                    <p>单个文件大小限制为50MB</p>
                  </div>
                </n-popover>
                <n-button type="success" size="large" :disabled="!hasUploadingFiles || isUploading" @click="startUpload">
                  <template #icon>
                    <icon-font type="icon-shangchuan2" />
                  </template>
                  开始上传
                </n-button>
              </n-space>
            </div>
          </n-card>

          <!-- 已上传文件列表 -->
          <n-card v-if="hasSuccessFiles" class="finished-card" title="上传完成的文件" :bordered="false">
            <template #header-extra>
              <n-button text type="primary" @click="organizeFiles" size="small">
                <template #icon>
                  <icon-font type="icon-guanli" />
                </template>
                管理文件
              </n-button>
            </template>

            <n-data-table
                :columns="finishedColumns"
                :data="successFiles"
                :pagination="{ pageSize: 5 }"
                :row-key="row => row.id"
                :bordered="false"
            />
          </n-card>
        </n-grid-item>

        <!-- 右侧边栏区域 -->
        <n-grid-item span="8">
          <!-- 文件信息卡片 -->
          <n-card class="info-card selected-file-card" title="文件信息" v-if="selectedFile" :bordered="false">
            <template #header-extra>
              <n-button text type="primary" size="small" @click="previewFile" v-if="canPreview">
                <template #icon>
                  <icon-font type="icon-preview" />
                </template>
                预览
              </n-button>
            </template>

            <div class="file-preview">
              <div class="file-type-icon large" :class="getFileTypeClass(selectedFile.name)">
                <icon-font :type="getFileIcon(selectedFile.name)" size="32" />
              </div>
              <div class="file-name">{{ selectedFile.name }}</div>
            </div>

            <div class="file-details">
              <div class="detail-item">
                <div class="detail-label">文件大小</div>
                <div class="detail-value">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">文件类型</div>
                <div class="detail-value">{{ getFileTypeText(selectedFile.name) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">上传时间</div>
                <div class="detail-value">{{ selectedFile.uploadTime || '未上传' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">状态</div>
                <div class="detail-value">
                  <n-tag :type="getStatusType(selectedFile.status)" size="small">
                    {{ getStatusText(selectedFile.status) }}
                  </n-tag>
                </div>
              </div>
            </div>

            <div class="file-edit-section">
              <n-form :model="selectedFile" label-placement="left" label-width="auto">
                <n-form-item label="文件标题">
                  <n-input v-model:value="selectedFile.title" placeholder="输入文件标题" />
                </n-form-item>
                <n-form-item label="文件描述">
                  <n-input
                      v-model:value="selectedFile.description"
                      type="textarea"
                      placeholder="输入文件描述"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                  />
                </n-form-item>
                <n-form-item label="分类">
                  <n-select v-model:value="selectedFile.category" :options="categoryOptions" placeholder="选择分类" clearable />
                </n-form-item>
                <n-form-item label="标签">
                  <n-dynamic-tags v-model:value="selectedFile.tags" />
                </n-form-item>
                <n-form-item label="权限">
                  <n-select v-model:value="selectedFile.permission" :options="permissionOptions" />
                </n-form-item>
              </n-form>
            </div>
          </n-card>

          <!-- 上传提示卡片 -->
          <n-card class="info-card" title="上传小贴士" v-if="!selectedFile" :bordered="false">
            <div class="tips-container">
              <div class="tip-item">
                <div class="tip-icon">
                  <n-icon size="24" color="#6366f1">
                    <icon-font type="icon-markdown" />
                  </n-icon>
                </div>
                <div class="tip-content">
                  <div class="tip-title">Markdown 格式提示</div>
                  <div class="tip-description">
                    上传 Markdown 文件可获得更好的阅读体验，支持自动目录生成和代码高亮
                  </div>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">
                  <n-icon size="24" color="#f97316">
                    <icon-font type="icon-piliang" />
                  </n-icon>
                </div>
                <div class="tip-content">
                  <div class="tip-title">批量上传技巧</div>
                  <div class="tip-description">
                    使用高级上传模式可以为多个文件同时设置分类和标签，提高整理效率
                  </div>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">
                  <n-icon size="24" color="#10b981">
                    <icon-font type="icon-wendang" />
                  </n-icon>
                </div>
                <div class="tip-content">
                  <div class="tip-title">文档版本管理</div>
                  <div class="tip-description">
                    同名文件上传会创建新版本，可在文件详情页查看和管理所有历史版本
                  </div>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">
                  <n-icon size="24" color="#3b82f6">
                    <icon-font type="icon-mokuai" />
                  </n-icon>
                </div>
                <div class="tip-content">
                  <div class="tip-title">智能分类</div>
                  <div class="tip-description">
                    系统会根据文件内容自动推荐合适的分类和标签，帮助您更好地组织文档
                  </div>
                </div>
              </div>
            </div>
          </n-card>

          <!-- 上传历史卡片 -->
          <n-card class="info-card" title="最近上传历史" :bordered="false">
            <template #header-extra>
              <n-button text type="primary" size="small" @click="clearHistory">
                清空历史
              </n-button>
            </template>

            <div class="history-container">
              <div v-if="uploadHistory.length === 0" class="empty-history">
                <n-empty description="暂无上传历史" size="small">
                  <template #icon>
                    <n-icon>
                      <icon-font type="icon-empty" />
                    </n-icon>
                  </template>
                </n-empty>
              </div>
              <n-list v-else hoverable clickable>
                <n-list-item v-for="item in uploadHistory" :key="item.id">
                  <n-thing :title="item.title || item.name" :description="item.time">
                    <template #avatar>
                      <div class="file-type-icon small" :class="getFileTypeClass(item.name)">
                        <icon-font :type="getFileIcon(item.name)" />
                      </div>
                    </template>
                    <template #footer>
                      <div class="history-item-footer">
                        <n-tag size="small" :bordered="false" :type="item.success ? 'success' : 'error'">
                          {{ item.success ? '成功' : '失败' }}
                        </n-tag>
                        <div class="history-item-size">{{ formatFileSize(item.size) }}</div>
                      </div>
                    </template>
                  </n-thing>
                </n-list-item>
              </n-list>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 文件预览对话框 -->
    <n-modal v-model:show="showPreview" preset="card" title="文件预览" style="width: 70%;" :bordered="false">
      <div class="preview-container">
        <div v-if="previewType === 'markdown'" class="markdown-preview">
          <div class="markdown-toolbar">
            <n-space>
              <n-button quaternary circle size="small">
                <template #icon>
                  <icon-font type="icon-dayin" />
                </template>
              </n-button>
              <n-button quaternary circle size="small">
                <template #icon>
                  <icon-font type="icon-xiazai" />
                </template>
              </n-button>
              <n-button quaternary circle size="small">
                <template #icon>
                  <icon-font type="icon-fenxiang" />
                </template>
              </n-button>
            </n-space>

            <n-space>
              <n-button quaternary size="small">
                <template #icon>
                  <icon-font type="icon-yulan" />
                </template>
                预览
              </n-button>
              <n-button quaternary size="small">
                <template #icon>
                  <icon-font type="icon-code" />
                </template>
                源码
              </n-button>
              <n-button quaternary size="small">
                <template #icon>
                  <icon-font type="icon-bianji" />
                </template>
                编辑
              </n-button>
            </n-space>
          </div>
          <div class="markdown-content">
            <div class="markdown-rendered">
              <h1>Markdown 预览</h1>
              <p>这是一个示例的 Markdown 内容预览，实际内容将根据文件动态渲染。</p>
              <h2>功能特性</h2>
              <ul>
                <li>支持完整的 Markdown 语法</li>
                <li>代码高亮显示</li>
                <li>数学公式支持</li>
                <li>图表渲染</li>
              </ul>
              <h2>代码示例</h2>
              <div class="code-block">
                <pre><code>function example() {
  console.log("Hello, Markdown!");
}</code></pre>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="previewType === 'pdf'" class="pdf-preview">
          <div class="pdf-toolbar">
            <div class="pdf-nav">
              <n-button-group>
                <n-button quaternary>
                  <template #icon>
                    <icon-font type="icon-prev" />
                  </template>
                </n-button>
                <n-button quaternary>
                  <template #icon>
                    <icon-font type="icon-next" />
                  </template>
                </n-button>
              </n-button-group>
              <div class="pdf-page-info">第 1 页 / 共 10 页</div>
              <n-input-number size="small" :min="1" :max="10" v-model:value="pdfPage" style="width: 60px;" />
            </div>
            <div class="pdf-actions">
              <n-button-group>
                <n-button quaternary>
                  <template #icon>
                    <icon-font type="icon-zoom-in" />
                  </template>
                </n-button>
                <n-button quaternary>
                  <template #icon>
                    <icon-font type="icon-zoom-out" />
                  </template>
                </n-button>
              </n-button-group>
              <n-button quaternary>
                <template #icon>
                  <icon-font type="icon-xiazai" />
                </template>
                下载
              </n-button>
            </div>
          </div>
          <div class="pdf-document">
            <div class="pdf-placeholder">
              <n-empty description="PDF 预览加载中" size="large">
                <template #icon>
                  <n-icon size="48">
                    <icon-font type="icon-pdf" size="48" />
                  </n-icon>
                </template>
                <template #extra>
                  <n-button size="small">
                    直接下载
                  </n-button>
                </template>
              </n-empty>
            </div>
          </div>
        </div>
        <div v-else-if="previewType === 'image'" class="image-preview">
          <div class="image-container">
            <img src="https://via.placeholder.com/800x600" alt="图片预览" />
          </div>
          <div class="image-toolbar">
            <n-space>
              <n-button quaternary circle>
                <template #icon>
                  <icon-font type="icon-zoom-in" />
                </template>
              </n-button>
              <n-button quaternary circle>
                <template #icon>
                  <icon-font type="icon-zoom-out" />
                </template>
              </n-button>
              <n-button quaternary circle>
                <template #icon>
                  <icon-font type="icon-rotate" />
                </template>
              </n-button>
              <n-button quaternary circle>
                <template #icon>
                  <icon-font type="icon-xiazai" />
                </template>
              </n-button>
            </n-space>
          </div>
        </div>
        <div v-else class="generic-preview">
          <div class="generic-preview-icon">
            <icon-font :type="getFileIcon(selectedFile?.name || '')" size="64" />
          </div>
          <div class="generic-preview-message">
            此文件类型暂不支持直接预览，请下载后查看
          </div>
          <div class="generic-preview-actions">
            <n-button type="primary">
              <template #icon>
                <icon-font type="icon-xiazai" />
              </template>
              下载文件
            </n-button>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import IconFont from "@/components/common/IconFont.vue"

// 路由相关
const router = useRouter()
const goBack = () => {
  router.push('/documents')
}

// 上传组件相关
const uploadRef = ref(null)
const fileList = ref([])
const uploadMode = ref('basic')
const pdfPage = ref(1)
const showPreview = ref(false)
const previewType = ref('markdown')

// 文件数据
const uploadingFiles = ref([])
const selectedFile = ref(null)
const uploadHistory = ref([])
const batchEdit = reactive({
  category: null,
  tags: [],
  permission: 'private'
})

// 上传状态追踪
const isUploading = ref(false)
const uploadedBytes = ref(0)
const totalBytes = ref(0)

// 切换上传模式
const switchUploadMode = (mode) => {
  uploadMode.value = mode
}

// 判断是否有上传中的文件
const hasUploadingFiles = computed(() => uploadingFiles.value.length > 0)

// 判断是否有成功上传的文件
const hasSuccessFiles = computed(() => successFiles.value.length > 0)

// 判断是否有选中的文件（用于批量编辑）
const hasSelectedFiles = computed(() => uploadingFiles.value.filter(f => f.selected).length > 0)

// 获取成功上传的文件
const successFiles = computed(() => uploadingFiles.value.filter(f => f.status === 'success'))

// 计算总进度
const overallProgress = computed(() => {
  if (totalBytes.value === 0) return 0
  return Math.min(100, (uploadedBytes.value / totalBytes.value) * 100)
})

// 进度条渐变色彩
const progressGradient = {
  '0%': '#6366f1',
  '100%': '#818cf8'
}

// 是否可以预览当前文件
const canPreview = computed(() => {
  if (!selectedFile.value) return false

  const ext = getFileExtension(selectedFile.value.name).toLowerCase()
  return ['md', 'pdf', 'jpg', 'jpeg', 'png'].includes(ext)
})

// 分类选项
const categoryOptions = [
  { label: 'Java 基础', value: 'java-basic' },
  { label: 'Java 高级', value: 'java-advanced' },
  { label: 'Spring', value: 'spring' },
  { label: 'SpringBoot', value: 'springboot' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'Redis', value: 'redis' },
  { label: 'RocketMQ', value: 'rocketmq' },
  { label: 'RabbitMQ', value: 'rabbitmq' },
  { label: '前端', value: 'frontend' },
  { label: 'DevOps', value: 'devops' },
  { label: '其他', value: 'other' }
]

// 权限选项
const permissionOptions = [
  { label: '私有（仅自己可见）', value: 'private' },
  { label: '团队（团队成员可见）', value: 'team' },
  { label: '公开（所有人可见）', value: 'public' }
]

// 上传完成文件的表格列定义
const finishedColumns = [
  {
    title: '文件名',
    key: 'name',
    render(row) {
      return h('div', { class: 'file-name-cell' }, [
        h('div', { class: 'file-type-icon small ' + getFileTypeClass(row.name) }, [
          h(IconFont, { type: getFileIcon(row.name) })
        ]),
        h('span', { class: 'table-file-name' }, row.title || row.name)
      ])
    }
  },
  {
    title: '大小',
    key: 'size',
    width: 100,
    render(row) {
      return formatFileSize(row.size)
    }
  },
  {
    title: '分类',
    key: 'category',
    width: 120,
    render(row) {
      if (!row.category) return '未分类'
      const category = categoryOptions.find(c => c.value === row.category)
      return h('n-tag', { size: 'small', type: 'info' }, { default: () => category?.label || row.category })
    }
  },
  {
    title: '上传时间',
    key: 'uploadTime',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h('div', { class: 'table-actions' }, [
        h('n-button', {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => viewFile(row)
        }, { default: () => '查看' }),
        h('n-button', {
          text: true,
          type: 'info',
          size: 'small',
          onClick: () => editFile(row)
        }, { default: () => '编辑' }),
        h('n-button', {
          text: true,
          type: 'error',
          size: 'small',
          onClick: () => deleteFile(row)
        }, { default: () => '删除' })
      ])
    }
  }
]

// 添加文件方法
const addFiles = () => {
  uploadRef.value?.openFileDialog()
}

// 添加文件夹方法
const addFolder = () => {
  uploadRef.value?.openDirectoryDialog()
}

// 获取文件扩展名
const getFileExtension = (filename) => {
  return filename.split('.').pop()
}

// 获取文件类型图标
const getFileIcon = (filename) => {
  const ext = getFileExtension(filename).toLowerCase()

  switch (ext) {
    case 'md':
      return 'icon-markdown'
    case 'pdf':
      return 'icon-pdf'
    case 'doc':
    case 'docx':
      return 'icon-word'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'icon-tupian'
    case 'txt':
      return 'icon-txt'
    default:
      return 'icon-wendang'
  }
}

// 获取文件类型CSS类
const getFileTypeClass = (filename) => {
  const ext = getFileExtension(filename).toLowerCase()

  switch (ext) {
    case 'md':
      return 'markdown-file'
    case 'pdf':
      return 'pdf-file'
    case 'doc':
    case 'docx':
      return 'word-file'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'image-file'
    case 'txt':
      return 'text-file'
    default:
      return 'generic-file'
  }
}

// 获取文件类型文本
const getFileTypeText = (filename) => {
  const ext = getFileExtension(filename).toLowerCase()

  switch (ext) {
    case 'md':
      return 'Markdown文档'
    case 'pdf':
      return 'PDF文档'
    case 'doc':
    case 'docx':
      return 'Word文档'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '图片文件'
    case 'txt':
      return '文本文件'
    default:
      return '其他文件'
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取上传状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'preparing':
      return '准备中'
    case 'uploading':
      return '上传中'
    case 'success':
      return '上传成功'
    case 'error':
      return '上传失败'
    case 'removed':
      return '已移除'
    default:
      return '未知状态'
  }
}

// 获取进度条状态
const getProgressStatus = (status) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'info'
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'uploading':
      return 'info'
    default:
      return 'default'
  }
}

// 自定义上传请求处理
const customUploadRequest = ({ file, data, headers, withCredentials, action, onFinish, onError, onProgress }) => {
  // 这里是模拟上传处理，实际应该是调用API上传文件

  // 模拟一个随机的文件ID
  const fileId = 'file_' + Math.random().toString(36).substr(2, 9)

  // 创建上传文件对象
  const uploadFile = reactive({
    id: fileId,
    name: file.name,
    title: file.name.replace(/\.\w+$/, ''),  // 去掉扩展名作为标题
    description: '',
    size: file.size,
    type: file.type,
    status: 'preparing',
    progress: 0,
    selected: false,
    category: null,
    tags: [],
    permission: 'private',
    uploadTime: null
  })

  // 添加到上传文件列表
  uploadingFiles.value.push(uploadFile)

  // 增加总字节数
  totalBytes.value += file.size

  // 选中第一个添加的文件
  if (uploadingFiles.value.length === 1) {
    selectedFile.value = uploadFile
  }

  // 这里是不立即上传的模式，需要手动点击上传按钮
  return {
    // 取消上传
    abort: () => {
      console.log('取消上传:', file.name)
    }
  }
}

// 开始上传所有文件
const startUpload = () => {
  if (isUploading.value) return

  isUploading.value = true
  uploadedBytes.value = 0

  // 遍历所有准备中的文件并开始上传
  const filesToUpload = uploadingFiles.value.filter(f => f.status === 'preparing')

  // 如果没有文件需要上传，直接返回
  if (filesToUpload.length === 0) {
    isUploading.value = false
    return
  }

  // 模拟每个文件上传
  filesToUpload.forEach(file => {
    // 更新状态为上传中
    file.status = 'uploading'

    // 模拟上传进度
    let progress = 0
    const duration = 2000 + Math.random() * 3000 // 随机2-5秒完成
    const interval = 100
    const step = 100 / (duration / interval)

    const progressTimer = setInterval(() => {
      progress += step
      file.progress = Math.min(99, progress) // 保持在99%，直到完成

      // 更新总已上传字节
      const fileBytesUploaded = (file.progress / 100) * file.size
      uploadedBytes.value = uploadingFiles.value.reduce((total, f) => {
        if (f.status === 'uploading') {
          return total + ((f.progress / 100) * f.size)
        } else if (f.status === 'success') {
          return total + f.size
        }
        return total
      }, 0)

      if (progress >= 100) {
        clearInterval(progressTimer)

        // 模拟概率性上传失败
        const success = Math.random() > 0.1

        setTimeout(() => {
          if (success) {
            // 上传成功
            file.status = 'success'
            file.progress = 100
            file.uploadTime = formatCurrentTime()

            // 添加到上传历史
            uploadHistory.value.unshift({
              id: file.id,
              name: file.name,
              title: file.title,
              size: file.size,
              time: file.uploadTime,
              success: true
            })
          } else {
            // 上传失败
            file.status = 'error'

            // 添加到上传历史
            uploadHistory.value.unshift({
              id: file.id,
              name: file.name,
              title: file.title,
              size: file.size,
              time: formatCurrentTime(),
              success: false
            })
          }

          // 检查是否全部完成
          checkAllUploadsComplete()
        }, 500)
      }
    }, interval)
  })
}

// 检查是否所有上传都已完成
const checkAllUploadsComplete = () => {
  const allComplete = !uploadingFiles.value.some(f => f.status === 'uploading' || f.status === 'preparing')

  if (allComplete) {
    isUploading.value = false

    // 如果有任何失败的，可以提示用户
    const anyFailed = uploadingFiles.value.some(f => f.status === 'error')
    if (anyFailed) {
      // 这里可以显示一个通知
      console.log('部分文件上传失败')
    }
  }
}

// 格式化当前时间
const formatCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 重试上传
const retryUpload = (file) => {
  file.status = 'preparing'
  file.progress = 0
  startUpload()
}

// 取消上传
const cancelUpload = (file) => {
  // 如果正在上传中，需要中止上传请求
  if (file.status === 'uploading') {
    // 这里应该调用实际的中止上传API
    console.log('中止上传:', file.name)
  }

  // 从上传队列中移除
  const index = uploadingFiles.value.findIndex(f => f.id === file.id)
  if (index !== -1) {
    // 更新总字节数
    totalBytes.value -= file.size
    if (file.status === 'uploading') {
      uploadedBytes.value -= (file.progress / 100) * file.size
    }

    // 移除文件
    uploadingFiles.value.splice(index, 1)

    // 如果当前选中的是这个文件，需要重置选中
    if (selectedFile.value && selectedFile.value.id === file.id) {
      selectedFile.value = uploadingFiles.value.length > 0 ? uploadingFiles.value[0] : null
    }
  }
}

// 应用批量编辑
const applyBatchEdit = () => {
  uploadingFiles.value.forEach(file => {
    if (file.selected || !hasSelectedFiles.value) {
      if (batchEdit.category) {
        file.category = batchEdit.category
      }
      if (batchEdit.tags.length > 0) {
        file.tags = [...new Set([...file.tags, ...batchEdit.tags])]
      }
      if (batchEdit.permission) {
        file.permission = batchEdit.permission
      }
    }
  })
}

// 重置批量编辑
const resetBatchEdit = () => {
  batchEdit.category = null
  batchEdit.tags = []
  batchEdit.permission = 'private'
}

// 清空所有文件
const clearAllFiles = () => {
  if (isUploading.value) return

  uploadingFiles.value = []
  selectedFile.value = null
  totalBytes.value = 0
  uploadedBytes.value = 0
}

// 查看文件（模拟）
const viewFile = (file) => {
  console.log('查看文件:', file.name)
  selectedFile.value = file
  previewFile()
}

// 编辑文件（模拟）
const editFile = (file) => {
  console.log('编辑文件:', file.name)
  selectedFile.value = file
}

// 删除文件（模拟）
const deleteFile = (file) => {
  console.log('删除文件:', file.name)
  const index = uploadingFiles.value.findIndex(f => f.id === file.id)
  if (index !== -1) {
    uploadingFiles.value.splice(index, 1)

    if (selectedFile.value && selectedFile.value.id === file.id) {
      selectedFile.value = uploadingFiles.value.length > 0 ? uploadingFiles.value[0] : null
    }
  }
}

// 预览文件
const previewFile = () => {
  if (!selectedFile.value || !canPreview.value) return

  const ext = getFileExtension(selectedFile.value.name).toLowerCase()

  if (ext === 'md') {
    previewType.value = 'markdown'
  } else if (ext === 'pdf') {
    previewType.value = 'pdf'
  } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
    previewType.value = 'image'
  } else {
    previewType.value = 'generic'
  }

  showPreview.value = true
}

// 管理文件（导航到文档中心）
const organizeFiles = () => {
  router.push('/documents')
}

// 清空上传历史
const clearHistory = () => {
  uploadHistory.value = []
}

// 初始化
onMounted(() => {
  // 模拟上传历史数据
  uploadHistory.value = [
    {
      id: 'hist_1',
      name: 'Spring原理分析.md',
      title: 'Spring原理分析',
      size: 1024 * 1024 * 2.3,
      time: '2025-04-29 10:15',
      success: true
    },
    {
      id: 'hist_2',
      name: 'Java性能优化指南.pdf',
      title: 'Java性能优化指南',
      size: 1024 * 1024 * 8.7,
      time: '2025-04-28 16:45',
      success: true
    },
    {
      id: 'hist_3',
      name: '项目架构图.png',
      title: '项目架构图',
      size: 1024 * 564,
      time: '2025-04-28 09:20',
      success: true
    },
    {
      id: 'hist_4',
      name: '大文件测试.zip',
      title: '大文件测试',
      size: 1024 * 1024 * 55,
      time: '2025-04-27 15:30',
      success: false
    }
  ]
})
</script>

<style scoped>
.upload-page {
  background-color: var(--body-color, #f5f7fa);
  min-height: 100vh;
  padding: 16px;
}

/* 顶部卡片区域 */
.header-card {
  background: linear-gradient(120deg, #f0f7ff, #e6f0fd);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--box-shadow-1);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.header-left {
  max-width: 600px;
}

.main-title {
  font-size: 24px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.subtitle {
  color: var(--text-color-secondary, #666);
  margin: 0;
  line-height: 1.5;
}

.back-button {
  padding: 12px 16px;
}

/* 上传概览区域 */
.upload-overview {
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-top: 16px;
}

.overview-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.overview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-color-base);
}

.overview-progress-text {
  color: var(--text-color-secondary);
  font-size: 13px;
}

/* 内容区样式 */
.content-container {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片通用样式 */
:deep(.n-card) {
  border-radius: 12px;
  box-shadow: var(--box-shadow-1);
  transition: box-shadow 0.3s ease;
}

:deep(.n-card:hover) {
  box-shadow: var(--box-shadow-2);
}

:deep(.n-card-header) {
  padding: 16px 20px;
}

:deep(.n-card-header__main) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.n-card__content) {
  padding: 0 20px 20px;
}

/* 上传卡片样式 */
.upload-card {
  margin-bottom: 16px;
}

.upload-area {
  margin-bottom: 20px;
}

.upload-dragger-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
  min-height: 180px;
}

.upload-text {
  text-align: center;
  margin-top: 16px;
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color-base);
}

.upload-title em {
  font-style: normal;
  color: var(--primary-color);
}

.upload-description {
  color: var(--text-color-tertiary);
  font-size: 14px;
}

.uploading-list {
  width: 100%;
}

.uploading-title {
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-color-base);
  text-align: left;
}

.file-status-text {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-color-secondary);
}

/* 批量编辑区域 */
.batch-edit-area {
  background-color: rgba(99, 102, 241, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px dashed rgba(99, 102, 241, 0.3);
}

.area-title {
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--primary-color);
}

/* 上传按钮区域 */
.upload-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 文件图标样式 */
.file-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  color: white;
}

.file-type-icon.small {
  width: 30px;
  height: 30px;
  font-size: 14px;
}

.file-type-icon.large {
  width: 64px;
  height: 64px;
  font-size: 32px;
  margin-bottom: 16px;
}

.markdown-file {
  background-color: #3b82f6;
}

.pdf-file {
  background-color: #ef4444;
}

.word-file {
  background-color: #2563eb;
}

.image-file {
  background-color: #10b981;
}

.text-file {
  background-color: #6b7280;
}

.generic-file {
  background-color: #9333ea;
}

/* 信息卡片样式 */
.info-card {
  margin-bottom: 16px;
}

.selected-file-card {
  background: linear-gradient(135deg, #fcfcff, #f8faff);
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--divider-color);
  margin-bottom: 16px;
}

.file-name {
  margin-top: 12px;
  font-weight: 500;
  text-align: center;
  word-break: break-all;
}

.file-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.detail-item {
  background-color: rgba(99, 102, 241, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-color-tertiary);
  margin-bottom: 4px;
}

.detail-value {
  font-weight: 500;
  color: var(--text-color-base);
  font-size: 14px;
}

.file-edit-section {
  padding-top: 8px;
}

/* 提示样式 */
.tips-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(99, 102, 241, 0.05);
  transition: all 0.3s ease;
}

.tip-item:hover {
  background-color: rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.tip-icon {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color-base);
}

.tip-description {
  font-size: 13px;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

/* 历史记录样式 */
.history-container {
  max-height: 300px;
  overflow-y: auto;
}

.empty-history {
  padding: 24px 0;
  text-align: center;
}

.history-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.history-item-size {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

/* 表格样式 */
.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-file-name {
  word-break: break-all;
}

.table-actions {
  display: flex;
  gap: 12px;
}

/* 帮助内容样式 */
.help-content {
  font-size: 13px;
  max-width: 300px;
}

.help-content p {
  margin: 8px 0;
}

.help-content ul {
  margin: 8px 0;
  padding-left: 16px;
}

.help-content li {
  margin: 4px 0;
}

/* 预览对话框样式 */
.preview-container {
  min-height: 400px;
}

.markdown-toolbar, .pdf-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid var(--divider-color);
}

.markdown-content {
  padding: 20px;
  min-height: 400px;
  border: 1px solid var(--divider-color);
  border-top: none;
  border-radius: 0 0 8px 8px;
  background-color: white;
}

.markdown-rendered {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
}

.code-block {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 14px;
  color: #24292e;
}

.pdf-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pdf-page-info {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.pdf-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pdf-document {
  min-height: 500px;
  border: 1px solid var(--divider-color);
  border-top: none;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
}

.pdf-placeholder {
  padding: 40px;
  text-align: center;
}

.image-preview {
  display: flex;
  flex-direction: column;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.image-container img {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.image-toolbar {
  display: flex;
  justify-content: center;
  padding: 12px;
  background-color: white;
  border-radius: 0 0 8px 8px;
}

.generic-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.generic-preview-icon {
  margin-bottom: 20px;
  color: var(--text-color-tertiary);
}

.generic-preview-message {
  font-size: 16px;
  color: var(--text-color-secondary);
  margin-bottom: 24px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .file-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-right {
    width: 100%;
  }

  .upload-actions {
    flex-direction: column;
    gap: 16px;
  }

  .upload-actions > :first-child {
    width: 100%;
    justify-content: center;
  }

  .upload-actions > :last-child {
    width: 100%;
    justify-content: center;
  }
}
</style>