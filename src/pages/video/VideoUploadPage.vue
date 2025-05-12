<!-- src/pages/video/VideoUploadPage.vue -->
<template>
  <div class="clean-upload-container">
    <!-- 页面顶部区域 -->
    <div class="page-header">
      <div class="header-back" @click="router.back()">
        <icon-font type="icon-arrow-left" :size="16" />
        <span>返回</span>
      </div>
      <h1 class="header-title">视频上传</h1>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <n-tabs
          v-model:value="activeTab"
          type="line"
          animated
          class="clean-tabs"
      >
        <!-- 上传视频标签页 -->
        <n-tab-pane name="upload" tab="上传视频">
          <div class="upload-flow">
            <!-- 上传方式选择 -->
            <div class="upload-section">
              <div class="section-header">
                <div class="section-title">选择上传方式</div>
              </div>

              <n-form
                  ref="formRef"
                  :model="videoForm"
                  :rules="rules"
                  label-placement="top"
              >
                <div class="upload-methods">
                  <div
                      class="method-card"
                      :class="{ active: videoForm.type === 'upload' }"
                      @click="videoForm.type = 'upload'"
                  >
                    <div class="method-icon local">
                      <icon-font type="icon-upload" :size="24" />
                    </div>
                    <div class="method-name">本地上传</div>
                  </div>

                  <div
                      class="method-card"
                      :class="{ active: videoForm.type === 'youtube' }"
                      @click="videoForm.type = 'youtube'"
                  >
                    <div class="method-icon youtube">
                      <icon-font type="icon-youtube" :size="24" />
                    </div>
                    <div class="method-name">YouTube</div>
                  </div>

                  <div
                      class="method-card"
                      :class="{ active: videoForm.type === 'bilibili' }"
                      @click="videoForm.type = 'bilibili'"
                  >
                    <div class="method-icon bilibili">
                      <icon-font type="icon-bilibili" :size="24" />
                    </div>
                    <div class="method-name">哔哩哔哩</div>
                  </div>
                </div>

                <!-- 本地上传区域 -->
                <div v-if="videoForm.type === 'upload'" class="upload-drop-area">
                  <n-upload
                      v-model:file-list="uploadVideoList"
                      :max="1"
                      :accept="acceptVideoTypes"
                      @before-upload="beforeVideoUpload"
                  >
                    <n-upload-dragger v-if="!uploadVideoList.length">
                      <div class="upload-drag-content">
                        <div class="upload-icon">
                          <icon-font type="icon-video" :size="42" />
                        </div>
                        <div class="upload-text">
                          <div class="main-text">拖放视频文件到这里，或点击上传</div>
                          <div class="sub-text">支持MP4, WebM, Ogg, MOV格式 (最大500MB)</div>
                        </div>
                        <n-button class="upload-button">选择视频</n-button>
                      </div>
                    </n-upload-dragger>

                    <div v-else class="uploaded-file">
                      <div class="file-icon">
                        <icon-font type="icon-video" :size="24" />
                      </div>
                      <div class="file-info">
                        <div class="file-name">{{ uploadVideoList[0].name }}</div>
                        <div class="file-size">{{ formatFileSize(uploadVideoList[0].file?.size) }}</div>
                      </div>
                      <n-button
                          text
                          type="error"
                          class="remove-button"
                          @click.stop="uploadVideoList = []"
                      >
                        <icon-font type="icon-delete" :size="16" />
                      </n-button>
                    </div>
                  </n-upload>
                </div>

                <!-- 外部视频链接 -->
                <div v-else class="external-video">
                  <n-form-item path="videoUrl" required>
                    <n-input
                        v-model:value="videoForm.videoUrl"
                        :placeholder="'请输入' + (videoForm.type === 'youtube' ? 'YouTube' : '哔哩哔哩') + '视频链接'"
                    >
                      <template #prefix>
                        <div class="input-prefix">
                          <icon-font
                              :type="videoForm.type === 'youtube' ? 'icon-youtube' : 'icon-bilibili'"
                              :size="18"
                          />
                        </div>
                      </template>
                    </n-input>
                    <div class="input-tip">
                      填入{{ videoForm.type === 'youtube' ? 'YouTube' : '哔哩哔哩' }}视频链接，系统将自动解析
                    </div>
                  </n-form-item>
                </div>

                <!-- 视频信息 -->
                <div class="form-group">
                  <div class="group-title">视频信息</div>

                  <n-form-item label="视频标题" path="title" required>
                    <n-input
                        v-model:value="videoForm.title"
                        placeholder="请输入视频标题"
                        class="form-input"
                    />
                  </n-form-item>

                  <n-form-item label="视频描述" path="description">
                    <n-input
                        v-model:value="videoForm.description"
                        type="textarea"
                        placeholder="请输入视频描述"
                        :autosize="{
                        minRows: 3,
                        maxRows: 5
                      }"
                        class="form-input"
                    />
                  </n-form-item>

                  <n-form-item label="视频标签" path="tags">
                    <n-dynamic-tags v-model:value="videoForm.tags" class="form-input" />
                    <div class="input-tip">
                      添加标签可以提高视频的可发现性
                    </div>
                  </n-form-item>
                </div>

                <!-- 分类选择 -->
                <div class="form-group">
                  <div class="group-title">视频分类</div>

                  <n-form-item label="所属分类" path="categoryId" required>
                    <div class="select-action">
                      <n-select
                          v-model:value="videoForm.categoryId"
                          placeholder="请选择视频分类"
                          :options="categoryOptions"
                          @update:value="handleCategoryChange"
                          class="form-select"
                          style="width: 200px"
                      />
                      <n-button
                          tertiary
                          type="primary"
                          @click="activeTab = 'category'"
                          class="action-button"
                      >
                        <icon-font type="icon-plus" :size="16" />
                        <span>创建</span>
                      </n-button>
                    </div>
                  </n-form-item>

                  <n-form-item label="所属课程" path="courseId" required>
                    <div class="select-action">
                      <n-select
                          v-model:value="videoForm.courseId"
                          placeholder="请选择所属课程"
                          :options="courseOptions"
                          :disabled="!videoForm.categoryId"
                          @update:value="handleCourseChange"
                          class="form-select"
                          style="width: 200px"
                      />
                      <n-button
                          tertiary
                          type="primary"
                          @click="activeTab = 'course'"
                          class="action-button"
                      >
                        <icon-font type="icon-plus" :size="16" />
                        <span>创建</span>
                      </n-button>
                    </div>
                  </n-form-item>

                  <n-form-item label="所属章节" path="chapterId" required>
                    <div class="select-action">
                      <n-select
                          v-model:value="videoForm.chapterId"
                          placeholder="请选择所属章节"
                          :options="chapterOptions"
                          :disabled="!videoForm.courseId"
                          class="form-select"
                          style="width: 200px"
                      />
                      <n-button
                          tertiary
                          type="primary"
                          @click="showCreateChapterModal = true"
                          class="action-button"
                      >
                        <icon-font type="icon-plus" :size="16" />
                        <span>创建</span>
                      </n-button>
                    </div>
                  </n-form-item>
                </div>

                <!-- 视频封面 -->
                <div class="form-group">
                  <div class="group-title">视频封面</div>

                  <div class="cover-area">
                    <div class="cover-preview">
                      <div v-if="!uploadCoverList.length" class="cover-empty">
                        <icon-font type="icon-image" :size="32" />
                        <div class="empty-text">添加视频封面，提高视频点击率</div>
                      </div>
                      <div v-else class="cover-image">
                        <img :src="uploadCoverList[0].url || ''" alt="视频封面" />
                        <div class="cover-actions">
                          <div class="cover-delete" @click="uploadCoverList = []">
                            <icon-font type="icon-delete" :size="18" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="cover-upload">
                      <n-upload
                          v-model:file-list="uploadCoverList"
                          :max="1"
                          :accept="acceptImageTypes"
                          @before-upload="beforeCoverUpload"
                      >
                        <n-button>{{ uploadCoverList.length ? '更换封面' : '上传封面' }}</n-button>
                      </n-upload>
                      <div class="input-tip">建议尺寸 16:9，文件大小不超过 5MB</div>
                    </div>
                  </div>
                </div>

                <!-- 表单提交按钮 -->
                <div class="form-actions">
                  <n-button quaternary @click="resetForm">重置表单</n-button>
                  <n-button
                      type="primary"
                      @click="handleSubmit"
                      :loading="uploading"
                  >
                    {{ uploading ? '上传中...' : '上传视频' }}
                  </n-button>
                </div>
              </n-form>
            </div>
          </div>
        </n-tab-pane>

        <!-- 创建课程标签页 -->
        <n-tab-pane name="course" tab="创建课程">
          <div class="course-section">
            <n-form
                ref="courseFormRef"
                :model="courseForm"
                :rules="courseRules"
                label-placement="top"
            >
              <div class="form-group">
                <div class="group-title">课程信息</div>

                <n-form-item label="课程名称" path="name" required>
                  <n-input v-model:value="courseForm.name" placeholder="请输入课程名称" class="form-input" />
                </n-form-item>

                <n-form-item label="所属分类" path="categoryId" required>
                  <div class="select-action">
                    <n-select
                        v-model:value="courseForm.categoryId"
                        placeholder="请选择分类"
                        :options="categoryOptions"
                        class="form-select"
                        style="width: 200px"
                    />
                    <n-button
                        tertiary
                        type="primary"
                        @click="activeTab = 'category'"
                        class="action-button"
                    >
                      <icon-font type="icon-plus" :size="16" />
                      <span>创建</span>
                    </n-button>
                  </div>
                </n-form-item>

                <n-form-item label="课程描述" path="description">
                  <n-input
                      v-model:value="courseForm.description"
                      type="textarea"
                      placeholder="请输入课程描述"
                      :autosize="{
                      minRows: 3,
                      maxRows: 5
                    }"
                      class="form-input"
                  />
                </n-form-item>
              </div>

              <div class="form-group">
                <div class="group-title">课程封面</div>

                <div class="cover-area">
                  <div class="cover-preview">
                    <div v-if="!uploadCourseCoverList.length" class="cover-empty">
                      <icon-font type="icon-image" :size="32" />
                      <div class="empty-text">添加课程封面</div>
                    </div>
                    <div v-else class="cover-image">
                      <img :src="uploadCourseCoverList[0].url || ''" alt="课程封面" />
                      <div class="cover-actions">
                        <div class="cover-delete" @click="uploadCourseCoverList = []">
                          <icon-font type="icon-delete" :size="18" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="cover-upload">
                    <n-upload
                        v-model:file-list="uploadCourseCoverList"
                        :max="1"
                        :accept="acceptImageTypes"
                    >
                      <n-button>{{ uploadCourseCoverList.length ? '更换封面' : '上传封面' }}</n-button>
                    </n-upload>
                    <div class="input-tip">建议尺寸 16:9，文件大小不超过 5MB</div>
                  </div>
                </div>
              </div>

              <!-- 表单提交按钮 -->
              <div class="form-actions">
                <n-button quaternary @click="resetCourseForm">重置表单</n-button>
                <n-button
                    type="primary"
                    @click="handleCreateCourse"
                    :loading="creatingCourse"
                >
                  {{ creatingCourse ? '创建中...' : '创建课程' }}
                </n-button>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 创建分类标签页 -->
        <n-tab-pane name="category" tab="创建分类">
          <div class="category-section">
            <n-form
                ref="categoryFormRef"
                :model="categoryForm"
                :rules="categoryRules"
                label-placement="top"
            >
              <div class="form-group">
                <div class="group-title">分类信息</div>

                <n-form-item label="分类名称" path="name" required>
                  <n-input v-model:value="categoryForm.name" placeholder="请输入分类名称" class="form-input" />
                </n-form-item>

                <n-form-item label="分类图标" path="icon" required>
                  <n-select
                      v-model:value="categoryForm.icon"
                      placeholder="请选择图标"
                      :options="iconOptions"
                      class="form-select"
                  >
                    <template #option="{ option }">
                      <div class="icon-option">
                        <icon-font :type="option.value" :size="20" />
                        <span>{{ option.label }}</span>
                      </div>
                    </template>
                  </n-select>
                </n-form-item>

                <n-form-item label="分类描述" path="description">
                  <n-input
                      v-model:value="categoryForm.description"
                      type="textarea"
                      placeholder="请输入分类描述"
                      :autosize="{
                      minRows: 3,
                      maxRows: 5
                    }"
                      class="form-input"
                  />
                </n-form-item>
              </div>

              <div class="form-group">
                <div class="group-title">分类预览</div>

                <div class="category-preview">
                  <div class="preview-icon">
                    <icon-font
                        :type="categoryForm.icon || 'icon-category'"
                        :size="36"
                    />
                  </div>
                  <div class="preview-info">
                    <div class="preview-name">
                      {{ categoryForm.name || '分类名称' }}
                    </div>
                    <div class="preview-desc">
                      {{ categoryForm.description || '分类描述内容' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 表单提交按钮 -->
              <div class="form-actions">
                <n-button quaternary @click="resetCategoryForm">重置表单</n-button>
                <n-button
                    type="primary"
                    @click="handleCreateCategory"
                    :loading="creatingCategory"
                >
                  {{ creatingCategory ? '创建中...' : '创建分类' }}
                </n-button>
              </div>
            </n-form>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 新建章节对话框 -->
    <n-modal
        v-model:show="showCreateChapterModal"
        preset="card"
        title="新建章节"
        class="clean-modal"
        style="width: 500px"
    >
      <div class="modal-content">
        <n-form
            :model="chapterForm"
            :rules="chapterRules"
            label-placement="top"
        >
          <n-form-item label="章节名称" path="name" required>
            <n-input v-model:value="chapterForm.name" placeholder="例如：第一章 基础入门" class="form-input" />
          </n-form-item>

          <n-form-item label="排序序号" path="orderIndex">
            <n-input-number v-model:value="chapterForm.orderIndex" :min="1" class="wide-number-input" />
            <div class="input-tip">章节将按照序号从小到大排序</div>
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button quaternary @click="showCreateChapterModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreateChapter">创建章节</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 上传进度对话框 -->
    <n-modal
        v-model:show="showUploadProgress"
        preset="card"
        :title="uploadProgress === 100 ? '上传完成' : '上传进度'"
        class="clean-modal"
        style="width: 500px"
        :mask-closable="false"
    >
      <div class="modal-content">
        <div class="upload-status">
          <div class="status-icon" :class="{ 'completed': uploadProgress === 100 }">
            <icon-font
                :type="uploadProgress === 100 ? 'icon-check-circle' : 'icon-upload'"
                :size="48"
            />
          </div>
          <div class="status-info">
            <div class="status-text">{{ uploadProgressText }}</div>
            <div class="status-number">{{ uploadProgress }}%</div>
          </div>
        </div>

        <n-progress
            type="line"
            :percentage="uploadProgress"
            :processing="uploadProgress < 100"
            :indicator-placement="'inside'"
            :status="uploadProgress === 100 ? 'success' : 'processing'"
            class="upload-progress"
        />
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button quaternary @click="cancelUpload" v-if="uploadProgress < 100">取消上传</n-button>
          <n-button type="primary" @click="closeProgressModal" v-if="uploadProgress === 100">查看视频</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useVideoStore } from '@/stores/video'
import type { FormRules, UploadFileInfo, SelectOption } from 'naive-ui'
import type { VideoChapter } from '@/types/video'
import IconFont from "@/components/common/IconFont.vue";

const router = useRouter()
const message = useMessage()
const videoStore = useVideoStore()

// 激活的标签页
const activeTab = ref('upload')

// 表单引用
const formRef = ref(null)
const courseFormRef = ref(null)
const categoryFormRef = ref(null)

// 视频上传表单
const videoForm = ref({
  title: '',
  type: 'upload',
  videoUrl: '',
  coverImage: '',
  categoryId: '',
  courseId: '',
  chapterId: '',
  tags: [],
  description: ''
})

// 上传列表
const uploadVideoList = ref([])
const uploadCoverList = ref([])
const uploadCourseCoverList = ref([])

// 上传状态
const uploading = ref(false)
const showUploadProgress = ref(false)
const uploadProgress = ref(0)
const uploadedVideoId = ref('')

// 格式化文件大小
function formatFileSize(size?: number): string {
  if (!size) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }

  return `${size.toFixed(2)} ${units[i]}`
}

// 上传进度文本
const uploadProgressText = computed(() => {
  if (uploadProgress.value === 0) return '准备上传...'
  if (uploadProgress.value < 30) return '正在上传文件...'
  if (uploadProgress.value < 70) return '正在处理视频...'
  if (uploadProgress.value < 100) return '即将完成...'
  return '上传成功！'
})

// 模拟上传进度
const simulateUpload = () => {
  uploadProgress.value = 0
  showUploadProgress.value = true

  const interval = setInterval(() => {
    if (uploadProgress.value < 95) {
      uploadProgress.value += Math.floor(Math.random() * 5) + 1
    } else {
      clearInterval(interval)
      setTimeout(() => {
        uploadProgress.value = 100
      }, 500)
    }
  }, 200)

  return interval
}

// 取消上传
const cancelUpload = () => {
  showUploadProgress.value = false
  uploading.value = false
  message.info('已取消上传')
}

// 关闭进度对话框
const closeProgressModal = () => {
  showUploadProgress.value = false
  if (uploadedVideoId.value) {
    router.push(`/video/watch/${uploadedVideoId.value}`)
  }
}

// 接受的文件类型
const acceptVideoTypes = '.mp4,.webm,.ogg,.mov'
const acceptImageTypes = '.jpg,.jpeg,.png,.gif,.webp'

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择视频类型', trigger: 'change' }
  ],
  videoUrl: [
    {
      required: true,
      message: '请输入视频链接URL',
      trigger: 'blur',
      validator: (rule, value) => {
        return videoForm.value.type === 'upload' || !!value
      }
    }
  ],
  categoryId: [
    { required: true, message: '请选择视频分类', trigger: 'change' }
  ],
  courseId: [
    { required: true, message: '请选择所属课程', trigger: 'change' }
  ],
  chapterId: [
    { required: true, message: '请选择所属章节', trigger: 'change' }
  ]
}

// 课程创建相关
const courseForm = ref({
  name: '',
  categoryId: '',
  coverImage: '',
  description: ''
})

const courseRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择所属分类', trigger: 'change' }
  ]
}

const creatingCourse = ref(false)

// 分类创建相关
const categoryForm = ref({
  name: '',
  icon: '',
  description: ''
})

const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择分类图标', trigger: 'change' }
  ]
}

const creatingCategory = ref(false)

// 图标选项
const iconOptions = [
  { label: 'Java', value: 'icon-java' },
  { label: 'Python', value: 'icon-python' },
  { label: 'HTML5', value: 'icon-html' },
  { label: '数据库', value: 'icon-database' },
  { label: '人工智能', value: 'icon-ai' },
  { label: '前端', value: 'icon-frontend' },
  { label: '后端', value: 'icon-backend' },
  { label: '云计算', value: 'icon-cloud' },
  { label: '大数据', value: 'icon-bigdata' },
  { label: '区块链', value: 'icon-blockchain' },
  { label: '移动开发', value: 'icon-mobile' },
  { label: '游戏开发', value: 'icon-game' },
  { label: '安全', value: 'icon-security' },
  { label: '测试', value: 'icon-testing' },
  { label: '运维', value: 'icon-devops' },
  { label: '其他', value: 'icon-other' }
]

// 章节相关
const showCreateChapterModal = ref(false)
const chapterForm = ref({
  name: '',
  courseId: '',
  orderIndex: 1
})

const chapterRules = {
  name: [
    { required: true, message: '请输入章节名称', trigger: 'blur' }
  ]
}

// 模拟章节数据
const chapters = ref<VideoChapter[]>([
  { id: '1', name: '第一章：Java入门基础', courseId: '1', orderIndex: 1 },
  { id: '2', name: '第二章：Java核心概念', courseId: '1', orderIndex: 2 },
  { id: '3', name: '第三章：面向对象编程', courseId: '1', orderIndex: 3 },
  { id: '4', name: '第一章：Java高级特性', courseId: '2', orderIndex: 1 },
  { id: '5', name: '第二章：设计模式', courseId: '2', orderIndex: 2 },
  { id: '6', name: '第一章：Python基础', courseId: '3', orderIndex: 1 },
  { id: '7', name: '第一章：Vue3基础', courseId: '4', orderIndex: 1 }
])

// 计算属性 - 选项列表
const categoryOptions = computed(() => {
  return videoStore.categories.map(category => ({
    label: category.name,
    value: category.id
  }))
})

const courseOptions = computed(() => {
  if (!videoForm.value.categoryId) return []

  return videoStore.courses
      .filter(course => course.categoryId === videoForm.value.categoryId)
      .map(course => ({
        label: course.name,
        value: course.id
      }))
})

const chapterOptions = computed(() => {
  if (!videoForm.value.courseId) return []

  return chapters.value
      .filter(chapter => chapter.courseId === videoForm.value.courseId)
      .map(chapter => ({
        label: chapter.name,
        value: chapter.id
      }))
})

// 处理分类变更
function handleCategoryChange(value: string) {
  // 重置课程选择
  videoForm.value.courseId = ''
  videoForm.value.chapterId = ''
}

// 处理课程变更
function handleCourseChange(value: string) {
  // 重置章节选择
  videoForm.value.chapterId = ''
  // 为新建章节设置当前课程ID
  chapterForm.value.courseId = value
}

// 上传前检查
function beforeVideoUpload({ file }) {
  // 检查文件大小 (500MB)
  const maxSize = 500 * 1024 * 1024
  if (file.file?.size > maxSize) {
    message.error('视频文件大小不能超过500MB')
    return false
  }
  return true
}

function beforeCoverUpload({ file }) {
  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.file?.size > maxSize) {
    message.error('图片大小不能超过5MB')
    return false
  }
  return true
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    uploading.value = true

    // 模拟上传进度
    const progressInterval = simulateUpload()

    // 在实际项目中这里应该是实际的上传逻辑
    const uploadedVideo = await videoStore.uploadVideo({
      ...videoForm.value,
      // 临时模拟 chapterName
      chapterName: chapters.value.find(c => c.id === videoForm.value.chapterId)?.name || '未分类章节'
    })

    // 设置上传的视频ID
    uploadedVideoId.value = uploadedVideo.id

  } catch (err) {
    console.error('表单验证失败', err)
    message.error('请检查表单填写是否完整')
    uploading.value = false
    showUploadProgress.value = false
  }
}

// 重置表单
function resetForm() {
  if (formRef.value) {
    formRef.value.restoreValidation()
  }

  videoForm.value = {
    title: '',
    type: 'upload',
    videoUrl: '',
    coverImage: '',
    categoryId: '',
    courseId: '',
    chapterId: '',
    tags: [],
    description: ''
  }

  uploadVideoList.value = []
  uploadCoverList.value = []

  message.success('表单已重置')
}

// 创建课程
async function handleCreateCourse() {
  if (!courseFormRef.value) return

  try {
    await courseFormRef.value.validate()

    creatingCourse.value = true

    // 模拟创建进度
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 在实际项目中这里应该是实际的创建逻辑
    const newCourse = await videoStore.addCourse(courseForm.value)

    message.success('课程创建成功！')
    resetCourseForm()

    // 自动选择新创建的课程并切换回上传标签
    videoForm.value.categoryId = newCourse.categoryId
    videoForm.value.courseId = newCourse.id
    activeTab.value = 'upload'

  } catch (err) {
    console.error('表单验证失败', err)
    message.error('请检查表单填写是否完整')
  } finally {
    creatingCourse.value = false
  }
}

// 重置课程表单
function resetCourseForm() {
  if (courseFormRef.value) {
    courseFormRef.value.restoreValidation()
  }

  courseForm.value = {
    name: '',
    categoryId: '',
    coverImage: '',
    description: ''
  }

  uploadCourseCoverList.value = []

  message.success('课程表单已重置')
}

// 创建分类
async function handleCreateCategory() {
  if (!categoryFormRef.value) return

  try {
    await categoryFormRef.value.validate()

    creatingCategory.value = true

    // 模拟创建进度
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 在实际项目中这里应该是实际的创建逻辑
    const newCategory = await videoStore.addCategory(categoryForm.value)

    message.success('分类创建成功！')
    resetCategoryForm()

    // 自动选择新创建的分类并切换回上传标签
    videoForm.value.categoryId = newCategory.id
    activeTab.value = 'upload'

  } catch (err) {
    console.error('表单验证失败', err)
    message.error('请检查表单填写是否完整')
  } finally {
    creatingCategory.value = false
  }
}

// 重置分类表单
function resetCategoryForm() {
  if (categoryFormRef.value) {
    categoryFormRef.value.restoreValidation()
  }

  categoryForm.value = {
    name: '',
    icon: '',
    description: ''
  }

  message.success('分类表单已重置')
}

// 创建章节
async function handleCreateChapter() {
  try {
    if (!chapterForm.value.name) {
      message.error('请输入章节名称')
      return false
    }

    if (!chapterForm.value.courseId) {
      chapterForm.value.courseId = videoForm.value.courseId
    }

    // 模拟创建进度
    await new Promise(resolve => setTimeout(resolve, 500))

    // 在实际项目中这里应该是实际的创建逻辑
    // 模拟生成一个新的章节ID
    const newChapterId = (chapters.value.length + 1).toString()

    // 添加新章节
    chapters.value.push({
      id: newChapterId,
      name: chapterForm.value.name,
      courseId: chapterForm.value.courseId,
      orderIndex: chapterForm.value.orderIndex
    })

    message.success('章节创建成功！')

    // 自动选择新创建的章节
    videoForm.value.chapterId = newChapterId

    // 关闭对话框
    showCreateChapterModal.value = false

    // 重置表单
    chapterForm.value = {
      name: '',
      courseId: videoForm.value.courseId,
      orderIndex: chapters.value
          .filter(c => c.courseId === videoForm.value.courseId)
          .length + 1
    }

    return true
  } catch (err) {
    console.error('创建章节失败', err)
    message.error('创建章节失败，请重试')
    return false
  }
}

// 自动设置章节表单的课程ID
watch(() => videoForm.value.courseId, (newCourseId) => {
  chapterForm.value.courseId = newCourseId
})

onMounted(async () => {
  await Promise.all([
    videoStore.fetchCategories(),
    videoStore.fetchCourses()
  ])
})
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #2f80ed;
  --primary-hover: #1e70df;
  --primary-light: #e1efff;
  --secondary-color: #27ae60;
  --danger-color: #eb5757;
  --warning-color: #f2994a;
  --background-color: #f8fafd;
  --card-color: #ffffff;
  --border-color: #e0e0e0;
  --border-active: #bdbdbd;
  --text-primary: #333333;
  --text-secondary: #4f4f4f;
  --text-hint: #828282;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 8px 16px rgba(0, 0, 0, 0.1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --transition: all 0.2s ease-in-out;
  --form-element-width: 560px; /* 表单元素宽度 */
}

/* 容器样式 - 调整宽度和间距 */
.clean-upload-container {
  max-width: 1400px; /* 增加最大宽度 */
  margin: 0 auto;
  background-color: var(--background-color);
  min-height: 100vh;
  position: relative;
  padding: 0; /* 移除两侧内边距 */
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px; /* 调整页头内边距 */
  background: var(--card-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px; /* 减少下方间距 */
  border-radius: var(--radius-md);
}

.header-back {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.header-back:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.header-back span {
  margin-left: 6px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 0 16px;
  color: var(--text-primary);
}

/* 主内容区 - 减少间距，确保对齐 */
.main-content {
  background-color: var(--card-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin: 0 0 16px; /* 减少下边距 */
}

/* 标签样式 */
.clean-tabs :deep(.n-tabs-nav) {
  padding: 0 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid var(--border-color);
}

.clean-tabs :deep(.n-tabs-nav--bar-type) {
  padding: 0;
}

.clean-tabs :deep(.n-tabs-tab) {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: var(--transition);
}

.clean-tabs :deep(.n-tabs-tab:hover) {
  color: var(--primary-color);
}

.clean-tabs :deep(.n-tabs-tab--active) {
  font-weight: 600;
  color: var(--primary-color);
}

.clean-tabs :deep(.n-tabs-nav__bar) {
  background-color: var(--primary-color);
}

/* 上传流程区域 */
.upload-flow {
  padding: 16px 20px; /* 增加左右内边距 */
}

.upload-section {
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* 上传方式选择 */
.upload-methods {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.method-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
}

.method-card:hover {
  border-color: var(--border-active);
  box-shadow: var(--shadow-sm);
}

.method-card.active {
  border-color: var(--primary-color);
  background-color: var(--primary-light);
}

.method-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
}

.method-icon.local {
  background-color: var(--primary-color);
}

.method-icon.youtube {
  background-color: #FF0000;
}

.method-icon.bilibili {
  background-color: #00A1D6;
}

.method-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 上传拖放区域 */
.upload-drop-area {
  margin-bottom: 24px;
}

.upload-drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.upload-icon {
  color: var(--primary-color);
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
  margin-bottom: 16px;
}

.main-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.sub-text {
  font-size: 14px;
  color: var(--text-hint);
}

.upload-button {
  padding: 6px 16px;
  background-color: var(--primary-color);
  color: white;
}

.uploaded-file {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--primary-light);
  border-radius: var(--radius-md);
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 12px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: var(--text-hint);
}

.remove-button {
  margin-left: 8px;
  color: var(--danger-color);
}

/* 外部视频链接 */
.external-video {
  margin-bottom: 24px;
}

.input-prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.input-tip {
  font-size: 12px;
  color: var(--text-hint);
  margin-top: 4px;
}

/* 表单分组 */
.form-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* 表单元素样式 */
.form-input, .form-select {
  max-width: var(--form-element-width);
  width: 100%;
}

/* 选择与操作 */
.select-action {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: calc(var(--form-element-width) + 80px);
}

.select-action > :first-child {
  flex: 1;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 32px;
  flex-shrink: 0;
  width: 76px; /* 固定宽度 */
  justify-content: center;
}

.action-button icon-font {
  margin-right: 4px;
}

/* 封面区域 */
.cover-area {
  display: flex;
  gap: 16px;
}

.cover-preview {
  width: 250px;
  height: 140px;
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-color);
  background-color: #f0f0f0;
}

.cover-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-hint);
}

.cover-empty icon-font {
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  text-align: center;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
}

.cover-image:hover .cover-actions {
  opacity: 1;
}

.cover-delete {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}

.cover-upload {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 分类预览 */
.category-preview {
  display: flex;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  max-width: var(--form-element-width);
}

.preview-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
  overflow: hidden;
}

.preview-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.preview-desc {
  font-size: 14px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 图标选项 */
.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.icon-option icon-font {
  color: var(--primary-color);
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  max-width: var(--form-element-width);
}

/* 对话框样式 */
.clean-modal :deep(.n-card__header) {
  font-size: 18px;
  font-weight: 600;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-content {
  padding: 16px;
}

.modal-footer {
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
}

/* 上传进度对话框 */
.upload-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.status-icon {
  margin-bottom: 16px;
  color: var(--primary-color);
}

.status-icon.completed {
  color: var(--secondary-color);
}

.status-info {
  text-align: center;
}

.status-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.status-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.upload-progress {
  margin-bottom: 16px;
}

/* 新增: 宽数字输入框 */
.wide-number-input {
  width: 200px !important;
}

/* 其他页面内容 */
.course-section, .category-section {
  padding: 16px 20px; /* 增加左右内边距 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .upload-methods {
    flex-direction: column;
  }

  .cover-area {
    flex-direction: column;
  }

  .cover-preview {
    width: 100%;
  }

  /* 移动端优化：表单元素宽度调整 */
  :root {
    --form-element-width: 100%;
  }

  .select-action {
    max-width: 100%;
  }

  .clean-upload-container {
    padding: 0 8px; /* 在移动端添加少量内边距 */
  }
}

/* 下拉列表项样式优化 */
:deep(.n-base-selection-menu .n-base-select-option) {
  padding: 8px 12px;
}

:deep(.n-base-selection-menu .n-base-select-option__content) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>