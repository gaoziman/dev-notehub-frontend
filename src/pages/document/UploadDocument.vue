<template>
  <div class="upload-document-container">
    <!-- 页面顶部导航与标题区域 - 优化头部设计 -->
    <div class="header-area">
      <div class="header-content">
        <div class="back-button" @click="router.back()">
          <icon-font type="icon-arrow-left" size="18" />
          <span>返回</span>
        </div>
        <h1 class="page-title">文档上传中心</h1>
        <div class="header-actions">
          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button circle size="small">
                <template #icon>
                  <icon-font type="icon-help" size="16" />
                </template>
              </n-button>
            </template>
            上传文档后系统会自动建立知识索引，便于智能检索和学习
          </n-tooltip>
        </div>
      </div>

      <!-- 新增: 进度指示器 -->
      <div class="upload-progress-steps">
        <div class="step-item active">
          <div class="step-number">1</div>
          <div class="step-text">选择文件</div>
        </div>
        <div class="step-connector"></div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-text">设置属性</div>
        </div>
        <div class="step-connector"></div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-text">上传处理</div>
        </div>
      </div>
    </div>

    <!-- 优化主内容区域布局 -->
    <div class="main-content-grid">
      <!-- 左侧文档上传区 -->
      <div class="main-upload-area">
        <!-- 知识提示轮播 - 改进视觉效果 -->
        <n-card class="tips-card" :bordered="false">
          <n-carousel
              show-arrow
              dot-placement="bottom"
              effect="fade"
              autoplay
              :interval="6000"
              direction="horizontal"
              class="tips-carousel"
          >
            <n-carousel-item class="carousel-item">
              <div class="tip-card tip-knowledge">
                <div class="tip-content">
                  <div class="tip-icon">
                    <icon-font type="icon-knowledge" size="32" />
                  </div>
                  <div class="tip-text">
                    <h3>知识提取</h3>
                    <p>系统将自动从您上传的文档中提取关键知识点，构建知识图谱，便于您进行知识关联和学习。</p>
                  </div>
                </div>
                <div class="tip-decoration">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="rgba(255,255,255,0.1)" />
                    <circle cx="60" cy="60" r="35" fill="rgba(255,255,255,0.05)" />
                  </svg>
                </div>
              </div>
            </n-carousel-item>
            <n-carousel-item class="carousel-item">
              <div class="tip-card tip-search">
                <div class="tip-content">
                  <div class="tip-icon">
                    <icon-font type="icon-search" size="32" />
                  </div>
                  <div class="tip-text">
                    <h3>智能检索</h3>
                    <p>为文档添加标签和分类，可以大幅提高文档的检索效率，系统将根据分类和标签为您推荐相关内容。</p>
                  </div>
                </div>
                <div class="tip-decoration">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <path d="M30,30 L90,30 L90,90 L30,90 Z" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none" />
                    <path d="M45,45 L75,45 L75,75 L45,75 Z" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="rgba(255,255,255,0.05)" />
                  </svg>
                </div>
              </div>
            </n-carousel-item>
            <n-carousel-item class="carousel-item">
              <div class="tip-card tip-format">
                <div class="tip-content">
                  <div class="tip-icon">
                    <icon-font type="icon-format" size="32" />
                  </div>
                  <div class="tip-text">
                    <h3>格式建议</h3>
                    <p>Markdown格式的文档能获得最佳索引效果，PDF和Word文档也支持，但可能需要更长的处理时间。</p>
                  </div>
                </div>
                <div class="tip-decoration">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <polygon points="60,20 90,50 60,80 30,50" fill="rgba(255,255,255,0.05)" />
                    <polygon points="60,30 80,50 60,70 40,50" stroke="rgba(255,255,255,0.1)" fill="none" />
                  </svg>
                </div>
              </div>
            </n-carousel-item>
          </n-carousel>
        </n-card>

        <!-- 上传卡片 - 增强视觉吸引力 -->
        <n-card class="upload-card">
          <div class="section-title">上传知识文档</div>
          <div class="upload-description">
            支持上传Markdown、PDF、Word等格式文件，系统将自动提取文档内容并构建知识索引
          </div>

          <!-- 优化上传区域 -->
          <div class="upload-area">
            <n-upload
                ref="uploadRef"
                :custom-request="customUploadRequest"
                :accept="acceptedTypes.join(',')"
                :max-size="maxFileSize * 1024 * 1024"
                :default-upload="false"
                multiple
                :show-file-list="false"
                :show-preview-button="false"
                @change="handleUploadChange"
                @before-upload="beforeUpload"
            >
              <n-upload-dragger class="upload-dragger">
                <div class="upload-content">
                  <div class="upload-visual">
                    <div class="upload-icon-wrapper">
                      <icon-font type="icon-zhishiku1" :size="64" color="var(--primary-color)" />
                      <div class="upload-icon-badge">
                        <icon-font type="icon-add" :size="20" color="#fff" />
                      </div>
                    </div>
                    <!-- 新增：上传装饰元素 -->
                    <div class="upload-decoration">
                      <svg viewBox="0 0 200 120" width="200" height="120">
                        <circle cx="30" cy="90" r="15" fill="rgba(99, 102, 241, 0.1)" />
                        <circle cx="170" cy="30" r="20" fill="rgba(99, 102, 241, 0.05)" />
                        <path d="M40,40 Q100,20 160,80" stroke="rgba(99, 102, 241, 0.2)" fill="none" stroke-width="2" stroke-dasharray="5,5" />
                      </svg>
                    </div>
                  </div>
                  <div class="upload-text">
                    <div class="upload-title">点击或拖拽上传文件</div>
                    <div class="upload-subtitle">支持单个或多个文件同时上传</div>
                  </div>
                  <n-button class="select-btn" type="primary" size="large">
                    <template #icon>
                      <icon-font type="icon-select-file" :size="18" />
                    </template>
                    选择文件
                  </n-button>
                </div>
              </n-upload-dragger>
            </n-upload>
          </div>

          <!-- 文件格式指示器 - 更生动的样式 -->
          <div class="format-indicators">
            <div class="format-item">
              <div class="format-icon markdown">
                <icon-font type="icon-markdown" :size="24" />
              </div>
              <div class="format-name">Markdown</div>
              <div class="format-badge">推荐</div>
            </div>
            <div class="format-item">
              <div class="format-icon pdf">
                <icon-font type="icon-pdf" :size="24" />
              </div>
              <div class="format-name">PDF</div>
            </div>
            <div class="format-item">
              <div class="format-icon word">
                <icon-font type="icon-word" :size="24" />
              </div>
              <div class="format-name">Word</div>
            </div>
            <div class="format-item">
              <div class="format-icon txt">
                <icon-font type="icon-txt" :size="24" />
              </div>
              <div class="format-name">纯文本</div>
            </div>
          </div>
        </n-card>

        <!-- 上传统计区 - 增强视觉效果 -->
        <div class="upload-statistics">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ uploadStats.today }}</div>
              <div class="stat-label">今日上传文件</div>
            </div>
            <div class="stat-icon today">
              <icon-font type="icon-calendar" :size="24" />
            </div>
            <!-- 新增：装饰元素 -->
            <div class="stat-decoration"></div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ uploadStats.pending }}</div>
              <div class="stat-label">待处理文件</div>
              <div class="stat-badge" v-if="uploadStats.pending > 0">处理中</div>
            </div>
            <div class="stat-icon pending">
              <icon-font type="icon-processing" :size="24" />
            </div>
            <div class="stat-decoration"></div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ uploadStats.total }}</div>
              <div class="stat-label">文档总数</div>
            </div>
            <div class="stat-icon total">
              <icon-font type="icon-document" :size="24" />
            </div>
            <div class="stat-decoration"></div>
          </div>
        </div>

        <!-- 文件列表 - 改进卡片样式 -->
        <n-card class="files-card" v-if="fileList.length > 0 || uploadingFiles.length > 0">
          <n-tabs type="line" animated>
            <!-- 待上传文件列表 -->
            <n-tab-pane v-if="fileList.length > 0" name="pending" tab="待上传文件">
              <div class="tab-header">
                <div class="tab-title">待上传文件 ({{ fileList.length }})</div>
                <div class="tab-actions">
                  <n-button text type="primary" @click="sortFiles">
                    <template #icon>
                      <icon-font type="icon-sort" size="16" />
                    </template>
                    排序
                  </n-button>
                  <n-button text type="error" @click="fileList = []">
                    <template #icon>
                      <icon-font type="icon-delete" size="16" />
                    </template>
                    清空
                  </n-button>
                </div>
              </div>

              <div class="file-list">
                <n-card v-for="(file, index) in fileList" :key="index" size="small" class="file-item">
                  <div class="file-info">
                    <div class="file-icon">
                      <icon-font :type="getFileIconType(file)" size="32" />
                    </div>
                    <div class="file-details">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-meta">
                        {{ formatFileSize(file.size) }} • {{ getFileTypeLabel(file) }}
                      </div>
                    </div>
                    <div class="file-actions">
                      <n-space>
                        <n-tooltip trigger="hover" placement="top">
                          <template #trigger>
                            <n-button quaternary circle size="small" @click="previewFile(file)">
                              <template #icon>
                                <icon-font type="icon-preview" size="16" />
                              </template>
                            </n-button>
                          </template>
                          预览文件
                        </n-tooltip>
                        <n-tooltip trigger="hover" placement="top">
                          <template #trigger>
                            <n-button quaternary circle size="small" @click="removeFile(index)">
                              <template #icon>
                                <icon-font type="icon-delete" size="16" />
                              </template>
                            </n-button>
                          </template>
                          从列表中移除
                        </n-tooltip>
                      </n-space>
                    </div>
                  </div>
                </n-card>
              </div>
            </n-tab-pane>

            <!-- 上传进度列表 -->
            <n-tab-pane v-if="uploadingFiles.length > 0" name="uploading" tab="上传进度">
              <div class="tab-header">
                <div class="tab-title">上传进度 ({{ uploadingFiles.length }})</div>
                <n-tag type="primary" size="small">自动处理中</n-tag>
              </div>

              <div class="file-list">
                <n-card
                    v-for="(file, index) in uploadingFiles"
                    :key="index"
                    size="small"
                    class="file-item upload-item"
                    :class="{'success-item': file.status === 'success', 'error-item': file.status === 'error'}"
                >
                  <div class="file-info">
                    <div class="file-icon">
                      <icon-font :type="getFileIconType(file)" size="32" />
                    </div>
                    <div class="file-details">
                      <div class="file-header">
                        <div class="file-name">{{ file.name }}</div>
                        <n-tag size="small" :type="getTagType(file)" class="status-tag">
                          {{ getStatusTagText(file) }}
                        </n-tag>
                      </div>
                      <n-progress
                          :percentage="file.percentage"
                          :processing="file.status === 'uploading'"
                          :status="getProgressStatus(file)"
                          :show-indicator="false"
                          :height="8"
                          :border-radius="4"
                          :color="getProgressColor(file)"
                      />
                      <div class="file-footer">
                        <div class="status-text" :class="getStatusTextClass(file)">
                          {{ getStatusText(file) }}
                        </div>
                        <div v-if="file.status === 'success'" class="file-actions">
                          <n-button text size="small" type="success" @click="viewDocument(file)">
                            <template #icon>
                              <icon-font type="icon-view" size="16" />
                            </template>
                            查看
                          </n-button>
                        </div>
                        <div v-if="file.status === 'error'" class="file-actions">
                          <n-button text size="small" type="error" @click="retryUpload(file)">
                            <template #icon>
                              <icon-font type="icon-retry" size="16" />
                            </template>
                            重试
                          </n-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </n-card>
              </div>
            </n-tab-pane>
          </n-tabs>
        </n-card>

        <!-- 空状态 - 更加视觉化 -->
        <n-card class="empty-card" v-if="fileList.length === 0 && uploadingFiles.length === 0">
          <div class="empty-state">
            <div class="empty-illustration">
              <icon-font type="icon-empty-file" :size="80" color="var(--text-color-tertiary)" />
              <!-- 装饰元素 -->
              <svg class="empty-decoration" viewBox="0 0 200 200" width="200" height="200">
                <circle cx="100" cy="120" r="60" fill="rgba(99, 102, 241, 0.03)" />
                <circle cx="100" cy="120" r="40" fill="rgba(99, 102, 241, 0.05)" />
                <path d="M60,80 Q100,40 140,80" stroke="rgba(99, 102, 241, 0.1)" stroke-width="2" fill="none" />
              </svg>
            </div>
            <div class="empty-text">暂无待上传文件</div>
            <div class="empty-subtext">从您的设备中选择或拖拽文件到上方区域开始上传</div>
            <n-button class="empty-action-btn" type="primary">
              <template #icon>
                <icon-font type="icon-select-file" :size="16" />
              </template>
              选择文件
            </n-button>
          </div>
        </n-card>

        <!-- 操作按钮 - 增强视觉效果 -->
        <div class="action-buttons">
          <n-button @click="router.back()" size="large">取消</n-button>
          <n-button
              type="primary"
              size="large"
              :disabled="fileList.length === 0"
              :loading="isUploading"
              @click="startUpload"
          >
            <template #icon>
              <icon-font type="icon-upload" :size="18" />
            </template>
            开始上传
          </n-button>
        </div>
      </div>

      <!-- 右侧设置面板 - 优化卡片设计 -->
      <div class="settings-panel">
        <!-- 新增：用户信息卡片 -->
        <n-card class="setting-card user-card">
          <div class="user-info">
            <div class="user-avatar">
              <img src="https://via.placeholder.com/60" alt="用户头像" />
            </div>
            <div class="user-details">
              <div class="user-name">陈小明</div>
              <div class="user-role">企业会员</div>
            </div>
          </div>
          <div class="user-stats">
            <div class="user-stat-item">
              <div class="stat-number">152</div>
              <div class="stat-label">总文档</div>
            </div>
            <div class="user-stat-item">
              <div class="stat-number">24</div>
              <div class="stat-label">今日上传</div>
            </div>
            <div class="user-stat-item">
              <div class="stat-number">5</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </n-card>

        <!-- 文档分类设置 -->
        <n-card class="setting-card" title="文档分类">
          <n-select
              v-model:value="selectedCategory"
              placeholder="选择文档分类"
              :options="categoryOptions"
              filterable
              tag
          />
          <div class="category-badges">
            <n-tag v-for="(cat, index) in recentCategories" :key="index" :type="getCategoryTagType(index)" size="small" round @click="selectRecentCategory(cat)">
              {{ cat.label }}
            </n-tag>
          </div>
          <div class="new-category">
            <n-button size="small" type="primary" text @click="showCategoryModal = true">
              <template #icon>
                <icon-font type="icon-add" size="14" />
              </template>
              新建分类
            </n-button>
          </div>
        </n-card>

        <!-- 标签管理 -->
        <n-card class="setting-card" title="标签管理">
          <n-dynamic-tags v-model:value="tags" :max="5" class="tag-input" />
          <div class="setting-tip">添加最多5个标签，便于文档分类和检索</div>
          <!-- 新增：推荐标签 -->
          <div class="recommended-tags">
            <div class="rec-tags-title">推荐标签</div>
            <div class="rec-tags-list">
              <n-tag v-for="(tag, index) in recommendedTags" :key="index" size="small" @click="addRecommendedTag(tag)">
                {{ tag }}
              </n-tag>
            </div>
          </div>
        </n-card>

        <!-- 上传限制 - 改进视觉效果 -->
        <n-card class="setting-card" title="上传限制">
          <div class="limit-items">
            <!-- 文件数量限制 -->
            <div class="limit-item">
              <div class="limit-progress">
                <n-progress
                    type="circle"
                    :percentage="70"
                    :stroke-width="8"
                    color="#6366f1"
                    :rail-color="'rgba(99, 102, 241, 0.1)'"
                    :size="64"
                >
                  <div class="limit-value">14/20</div>
                </n-progress>
              </div>
              <div class="limit-info">
                <div class="limit-title">文档数量</div>
                <div class="limit-desc">剩余可上传6个文档</div>
              </div>
            </div>

            <!-- 存储空间 -->
            <div class="limit-item">
              <div class="limit-progress">
                <n-progress
                    type="circle"
                    :percentage="34.6"
                    :stroke-width="8"
                    color="#18a058"
                    :rail-color="'rgba(24, 160, 88, 0.1)'"
                    :size="64"
                >
                  <div class="limit-value">346M</div>
                </n-progress>
              </div>
              <div class="limit-info">
                <div class="limit-title">存储空间</div>
                <div class="limit-desc">总容量1GB，已用346MB</div>
              </div>
            </div>

            <!-- 单文件大小 -->
            <div class="limit-item">
              <div class="limit-icon">
                <icon-font type="icon-file-size" :size="36" color="var(--warning-color)" />
              </div>
              <div class="limit-info">
                <div class="limit-title">单文件大小</div>
                <div class="limit-desc">每个文件不超过{{ maxFileSize }}MB</div>
              </div>
            </div>
          </div>

          <div class="upgrade-btn">
            <n-button type="primary" ghost block>
              <template #icon>
                <icon-font type="icon-vip" :size="16" />
              </template>
              升级扩容
            </n-button>
          </div>
        </n-card>

        <!-- 上传提示 - 添加视觉元素 -->
        <n-card class="setting-card help-card" title="上传提示">
          <div class="help-tips">
            <div class="help-tip">
              <icon-font type="icon-check-circle" size="16" color="var(--success-color)" />
              <span>Markdown文档的索引效果最佳</span>
            </div>
            <div class="help-tip">
              <icon-font type="icon-check-circle" size="16" color="var(--success-color)" />
              <span>设置合适的分类和标签提高检索效率</span>
            </div>
            <div class="help-tip">
              <icon-font type="icon-check-circle" size="16" color="var(--success-color)" />
              <span>上传后系统自动解析并构建知识索引</span>
            </div>
            <div class="help-tip">
              <icon-font type="icon-check-circle" size="16" color="var(--success-color)" />
              <span>大型文档处理需要更长时间</span>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 创建分类模态框 -->
    <n-modal
        v-model:show="showCategoryModal"
        preset="card"
        title="创建新分类"
        style="width: 420px"
        :bordered="false"
        class="category-modal"
    >
      <n-form>
        <n-form-item label="分类名称" required>
          <n-input v-model:value="newCategory" placeholder="请输入分类名称..." />
        </n-form-item>
        <n-form-item label="图标颜色">
          <n-color-picker v-model:value="newCategoryColor" />
        </n-form-item>
        <n-form-item label="分类描述">
          <n-input
              v-model:value="newCategoryDesc"
              type="textarea"
              placeholder="请输入分类描述..."
          />
        </n-form-item>
        <n-form-item label="访问权限">
          <n-radio-group v-model:value="newCategoryAccess" name="categoryAccess">
            <n-space>
              <n-radio value="public">公开</n-radio>
              <n-radio value="private">私有</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <n-button @click="showCategoryModal = false">取消</n-button>
        <n-button type="primary" @click="createCategory">创建</n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'

const router = useRouter()
const message = useMessage()
const uploadRef = ref(null)

// 上传配置
const maxFileSize = 50 // MB
const acceptedTypes = [
  '.md', '.markdown',
  '.pdf',
  '.doc', '.docx',
  '.txt'
]

// 文件列表
const fileList = ref([])
const uploadingFiles = ref([])
const isUploading = ref(false)

// 统计数据
const uploadStats = reactive({
  today: 24,
  pending: 5,
  total: 152
})

// 分类和标签
const selectedCategory = ref(null)
const tags = ref([])

// 新增：最近使用的分类
const recentCategories = [
  { label: '技术文档', value: 'tech' },
  { label: '学习笔记', value: 'notes' },
  { label: '会议记录', value: 'meeting' },
]

// 新增：推荐标签
const recommendedTags = ['前端', '后端', 'Vue3', 'React', 'Java', 'Python', '算法', '数据库', 'API', '微服务']

// 新增：AI增强选项
const aiEnhanceOptions = ref(['summary', 'keywords'])

const categoryOptions = [
  { label: '技术文档', value: 'tech' },
  { label: '产品文档', value: 'product' },
  { label: '学习笔记', value: 'notes' },
  { label: '会议记录', value: 'meeting' },
  { label: '参考资料', value: 'reference' }
]

const priorityOptions = [
  { label: '高优先级', value: 'high' },
  { label: '正常优先级', value: 'normal' },
  { label: '低优先级', value: 'low' }
]

// 高级设置相关
const advancedMode = ref(false)
const accessPermission = ref('public')
const indexPriority = ref('normal')
const description = ref('')

// 创建分类模态框
const showCategoryModal = ref(false)
const newCategory = ref('')
const newCategoryColor = ref('#6366f1')
const newCategoryDesc = ref('')
const newCategoryAccess = ref('public')

// 新增：选择最近分类
const selectRecentCategory = (category) => {
  selectedCategory.value = category.value
  message.success(`已选择分类: ${category.label}`)
}

// 新增：获取分类标签类型
const getCategoryTagType = (index) => {
  const types = ['primary', 'info', 'success', 'warning', 'error']
  return types[index % types.length]
}

// 新增：添加推荐标签
const addRecommendedTag = (tag) => {
  if (tags.value.length >= 5) {
    message.warning('最多只能添加5个标签')
    return
  }

  if (!tags.value.includes(tag)) {
    tags.value.push(tag)
    message.success(`已添加标签: ${tag}`)
  } else {
    message.info(`标签已存在: ${tag}`)
  }
}

// 处理文件上传
const handleUploadChange = ({ fileList: newFileList }) => {
  for (const file of newFileList) {
    if (!fileList.value.some(f => f.name === file.file.name)) {
      fileList.value.push(file.file)
    }
  }
}

// 上传前检查
const beforeUpload = ({ file }) => {
  // 检查文件类型
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!acceptedTypes.includes(fileExt)) {
    message.error(`不支持的文件类型: ${fileExt}`)
    return false
  }

  // 检查文件大小
  if (file.size > maxFileSize * 1024 * 1024) {
    message.error(`文件超过大小限制 ${maxFileSize}MB: ${file.name}`)
    return false
  }

  return true
}

// 移除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

// 排序文件
const sortFiles = () => {
  fileList.value.sort((a, b) => a.name.localeCompare(b.name))
  message.success('文件已按名称排序')
}

// 预览文件
const previewFile = (file) => {
  message.info(`预览功能开发中: ${file.name}`)
}

// 重试上传
const retryUpload = (file) => {
  // 移除失败的文件
  const index = uploadingFiles.value.findIndex(f => f.name === file.name)
  if (index !== -1) {
    uploadingFiles.value.splice(index, 1)
  }

  // 添加到待上传列表并重新上传
  const newFile = {
    name: file.name,
    size: file.size,
    type: file.type
  }
  fileList.value.push(newFile)
  message.info(`已将 ${file.name} 添加至待上传列表`)
}

// 查看已上传文档
const viewDocument = (file) => {
  message.success(`查看文档: ${file.name}`)
  // 实际应该跳转到文档查看页
  // router.push({ name: 'ViewDocument', params: { id: file.id } })
}

// 创建新分类
const createCategory = () => {
  if (!newCategory.value) {
    message.warning('请输入分类名称')
    return
  }

  const newOption = {
    label: newCategory.value,
    value: newCategory.value.toLowerCase().replace(/\s+/g, '-')
  }

  categoryOptions.push(newOption)
  selectedCategory.value = newOption.value
  showCategoryModal.value = false
  newCategory.value = ''
  newCategoryDesc.value = ''

  message.success('新分类创建成功')
}

// 自定义上传请求
const customUploadRequest = ({ file, onFinish, onError, onProgress }) => {
  // 这里模拟上传过程
  const uploadFile = reactive({
    name: file.name,
    size: file.size,
    percentage: 0,
    status: 'uploading',
    type: file.name.substring(file.name.lastIndexOf('.')).toLowerCase(),
    id: Date.now().toString() // 模拟文件ID
  })

  uploadingFiles.value.push(uploadFile)

  // 模拟进度更新
  const interval = setInterval(() => {
    uploadFile.percentage += Math.floor(Math.random() * 10)

    if (uploadFile.percentage >= 100) {
      clearInterval(interval)
      uploadFile.percentage = 100

      // 90%概率上传成功
      if (Math.random() > 0.1) {
        uploadFile.status = 'success'
        setTimeout(() => {
          onFinish()
        }, 500)
      } else {
        // 模拟失败
        uploadFile.status = 'error'
        onError()
      }
    }

    onProgress({ percent: uploadFile.percentage })
  }, 300)

  // 返回取消上传的函数
  return () => {
    clearInterval(interval)
  }
}

// 开始上传
const startUpload = () => {
  if (fileList.value.length === 0) {
    message.warning('请先添加要上传的文件')
    return
  }

  if (!selectedCategory.value) {
    message.warning('请选择文档分类')
    return
  }

  isUploading.value = true

  // 复制文件列表然后清空待上传列表
  const filesToUpload = [...fileList.value]
  fileList.value = []

  // 模拟文件上传
  filesToUpload.forEach(file => {
    customUploadRequest({
      file,
      onFinish: () => {},
      onError: () => {},
      onProgress: () => {}
    })
  })

  message.info(`正在上传 ${filesToUpload.length} 个文件，请稍候...`)
}

// 工具函数
const getFileIconType = (file) => {
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  const iconMap = {
    '.md': 'icon-markdown',
    '.markdown': 'icon-markdown',
    '.pdf': 'icon-pdf',
    '.doc': 'icon-word',
    '.docx': 'icon-word',
    '.txt': 'icon-txt'
  }

  return iconMap[fileExt] || 'icon-file'
}

const getFileTypeLabel = (file) => {
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  const typeMap = {
    '.md': 'Markdown',
    '.markdown': 'Markdown',
    '.pdf': 'PDF文档',
    '.doc': 'Word文档',
    '.docx': 'Word文档',
    '.txt': '纯文本'
  }

  return typeMap[fileExt] || '未知类型'
}

const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

const getProgressStatus = (file) => {
  if (file.status === 'error') return 'error'
  if (file.status === 'success') return 'success'
  return 'info'
}

const getProgressColor = (file) => {
  if (file.status === 'error') return 'var(--error-color)'
  if (file.status === 'success') return 'var(--success-color)'
  return 'var(--primary-color)'
}

const getStatusText = (file) => {
  if (file.status === 'error') return '上传失败，点击重试'
  if (file.status === 'success') return '上传成功，正在处理文档内容'
  return `正在上传 ${file.percentage}%`
}

const getStatusTagText = (file) => {
  if (file.status === 'error') return '失败'
  if (file.status === 'success') return '成功'
  return '上传中'
}

const getTagType = (file) => {
  if (file.status === 'error') return 'error'
  if (file.status === 'success') return 'success'
  return 'info'
}

const getStatusTextClass = (file) => {
  if (file.status === 'error') return 'text-error'
  if (file.status === 'success') return 'text-success'
  return 'text-info'
}
</script>

<style scoped>
.upload-document-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 32px;
  box-sizing: border-box;
}

/* 页面头部 */
.header-area {
  margin-bottom: 30px;
  background: linear-gradient(120deg, var(--primary-color-hover), var(--primary-color));
  border-radius: 12px;
  padding: 20px 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  position: relative;
  overflow: hidden;
}

.header-area::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
}

.header-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 20px;
  transition: all 0.3s;
  padding: 6px 10px;
  border-radius: 6px;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(-3px);
}

.back-button span {
  margin-left: 6px;
  font-weight: 500;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: white;
  margin: 0;
  flex: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 步骤指示器 */
.upload-progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: all 0.3s;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 6px;
  transition: all 0.3s;
}

.step-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.step-connector {
  height: 2px;
  width: 80px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 8px;
  position: relative;
  top: -14px;
}

.step-item.active .step-number {
  background-color: white;
  color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.step-item.active .step-text {
  color: white;
  font-weight: 600;
}

/* 主内容布局 */
.main-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: start;
}

.main-upload-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 知识提示轮播 */
.tips-card {
  padding: 0;
  background: transparent;
  box-shadow: none;
  margin-bottom: 8px;
}

.tips-carousel {
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.carousel-item {
  width: 100%;
  height: 100%;
}

.tip-card {
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.tip-content {
  display: flex;
  align-items: center;
  max-width: 80%;
  position: relative;
  z-index: 2;
}

.tip-decoration {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  margin-right: 18px;
}

.tip-text {
  flex: 1;
}

.tip-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.tip-text p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.95;
}

.tip-knowledge {
  background: linear-gradient(120deg, var(--primary-color), var(--primary-color-pressed));
}

.tip-search {
  background: linear-gradient(120deg, var(--info-color), var(--info-color-pressed));
}

.tip-format {
  background: linear-gradient(120deg, var(--success-color), var(--success-color-pressed));
}

/* 上传卡片 */
.upload-card {
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color-base);
}

.upload-description {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 24px;
}

/* 上传区域 */
.upload-area {
  margin-bottom: 24px;
}

.upload-dragger {
  border-radius: 12px;
  border: 2px dashed var(--border-color);
  transition: all 0.3s;
  background-color: var(--body-color);
  position: relative;
  overflow: hidden;
}

.upload-dragger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.03) 0%, transparent 70%);
  z-index: 0;
}

.upload-dragger:hover {
  border-color: var(--primary-color);
  background-color: rgba(99, 102, 241, 0.03);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 0;
  position: relative;
  z-index: 1;
}

.upload-visual {
  position: relative;
  margin-bottom: 20px;
}

.upload-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.upload-icon-wrapper {
  position: relative;
  z-index: 1;
}

.upload-icon-badge {
  position: absolute;
  bottom: -6px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 2px 12px rgba(99, 102, 241, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  }
}

.upload-text {
  text-align: center;
  margin-bottom: 20px;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-base);
  margin-bottom: 6px;
}

.upload-subtitle {
  font-size: 14px;
  color: var(--text-color-tertiary);
}

.select-btn {
  min-width: 140px;
  height: 44px;
  font-weight: 500;
  font-size: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
  transition: all 0.3s;
}

.select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* 文件格式指示器 */
.format-indicators {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 6px 0;
  position: relative;
}

.format-indicators::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
}

.format-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.format-badge {
  position: absolute;
  top: -8px;
  right: -18px;
  font-size: 11px;
  color: white;
  background-color: var(--primary-color);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.format-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.format-item:hover .format-icon {
  transform: translateY(-4px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.format-icon.markdown {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.format-icon.pdf {
  background-color: rgba(208, 48, 80, 0.1);
  color: var(--error-color);
}

.format-icon.word {
  background-color: rgba(32, 128, 240, 0.1);
  color: var(--info-color);
}

.format-icon.txt {
  background-color: rgba(24, 160, 88, 0.1);
  color: var(--success-color);
}

.format-name {
  font-size: 13px;
  color: var(--text-color-secondary);
  font-weight: 500;
}

/* 上传统计区 */
.upload-statistics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  position: relative;
  background-color: var(--card-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color-base);
  margin-bottom: 6px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.stat-badge {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: var(--warning-color);
  color: #fff;
  font-weight: 500;
}

.stat-icon {
  position: relative;
  z-index: 2;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.today {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.stat-icon.pending {
  background-color: rgba(240, 160, 32, 0.1);
  color: var(--warning-color);
}

.stat-icon.total {
  background-color: rgba(32, 128, 240, 0.1);
  color: var(--info-color);
}

.stat-decoration {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  z-index: 1;
  opacity: 0.08;
  transition: all 0.3s;
}

.stat-card:hover .stat-decoration {
  transform: scale(1.2);
}

.stat-card:nth-child(1) .stat-decoration {
  background-color: var(--primary-color);
}

.stat-card:nth-child(2) .stat-decoration {
  background-color: var(--warning-color);
}

.stat-card:nth-child(3) .stat-decoration {
  background-color: var(--info-color);
}

/* 文件列表 */
.files-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tab-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-base);
}

.tab-actions {
  display: flex;
  gap: 12px;
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.file-item {
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.file-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-color-hover);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-meta {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.file-actions {
  display: flex;
  gap: 8px;
}

/* 上传项样式 */
.upload-item {
  position: relative;
  overflow: hidden;
}

.success-item {
  background-color: rgba(24, 160, 88, 0.05);
  border-left: 3px solid var(--success-color);
}

.error-item {
  background-color: rgba(208, 48, 80, 0.05);
  border-left: 3px solid var(--error-color);
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-tag {
  font-size: 12px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-weight: 500;
}

.file-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.status-text {
  font-size: 12px;
  color: var(--text-color-tertiary);
  font-weight: 500;
}

.text-success {
  color: var(--success-color);
}

.text-error {
  color: var(--error-color);
}

.text-info {
  color: var(--info-color);
}

/* 空状态 */
.empty-card {
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  position: relative;
}

.empty-illustration {
  position: relative;
  margin-bottom: 20px;
}

.empty-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin: 16px 0 8px;
}

.empty-subtext {
  font-size: 14px;
  color: var(--text-color-tertiary);
  max-width: 320px;
  text-align: center;
  margin-bottom: 20px;
}

.empty-action-btn {
  min-width: 140px;
  height: 42px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 8px;
  margin-top: 8px;
}

/* 设置面板 */
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.setting-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.setting-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 用户卡片 */
.user-card {
  background: linear-gradient(135deg, var(--primary-color-hover), var(--primary-color));
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-role {
  font-size: 13px;
  opacity: 0.9;
  display: inline-block;
  padding: 2px 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.user-stats {
  display: flex;
  justify-content: space-between;
  padding: 12px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.user-stat-item {
  text-align: center;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

/* 分类标签 */
.category-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.category-badges .n-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.category-badges .n-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.new-category {
  margin-top: 12px;
  display: flex;
  justify-content: flex-start;
}

.tag-input {
  width: 100%;
}

.setting-tip {
  font-size: 12px;
  color: var(--text-color-tertiary);
  margin-top: 8px;
}

/* 推荐标签 */
.recommended-tags {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

.rec-tags-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.rec-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rec-tags-list .n-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.rec-tags-list .n-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.advanced-settings {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-color);
}

/* 上传限制 */
.limit-items {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.limit-progress, .limit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.limit-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color-base);
}

.limit-info {
  flex: 1;
}

.limit-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color-base);
  margin-bottom: 4px;
}

.limit-desc {
  font-size: 13px;
  color: var(--text-color-tertiary);
}

.upgrade-btn {
  margin-top: 20px;
}

/* 帮助提示 */
.help-card {
  background-color: #f8f9fc;
}

.help-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.help-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

/* 创建分类模态框 */
.category-modal {
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content-grid {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 18px;
  }
}

@media (max-width: 960px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }

  .settings-panel {
    order: -1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .setting-card.user-card {
    grid-column: 1 / 3;
  }

  .help-card {
    grid-column: 1 / 3;
  }
}

@media (max-width: 768px) {
  .upload-document-container {
    padding: 16px;
  }

  .settings-panel {
    grid-template-columns: 1fr;
  }

  .setting-card.user-card,
  .help-card {
    grid-column: auto;
  }

  .file-list {
    grid-template-columns: 1fr;
  }

  .upload-statistics {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .header-area {
    padding: 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .step-connector {
    width: 40px;
  }
}

@media (max-width: 480px) {
  .upload-document-container {
    padding: 12px 8px;
  }

  .upload-content {
    padding: 24px 0;
  }

  .format-indicators {
    flex-wrap: wrap;
    gap: 16px;
    justify-content: space-around;
  }

  .upload-progress-steps {
    flex-direction: column;
    gap: 8px;
  }

  .step-connector {
    width: 2px;
    height: 16px;
    margin: 0;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons .n-button {
    width: 100%;
  }
}
</style>