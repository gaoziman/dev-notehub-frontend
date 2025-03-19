<template>
  <div class="notes-page">
    <!-- 主内容区域 -->
    <div class="notes-content-wrapper">
      <!-- 页面标题和操作按钮 -->
      <div class="page-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }">
        <div class="header-title">
          <h1 class="title-text">我的笔记</h1>
          <p class="title-desc">管理您的所有学习笔记</p>
        </div>
        <div class="header-actions">
          <a-button type="primary" class="primary-btn" @click="showAddNoteModal">
            <plus-outlined />
            <span>添加笔记</span>
          </a-button>
          <a-button class="secondary-btn"  @click="showImportModal">
            <import-outlined />
            <span>批量导入</span>
          </a-button>
        </div>
      </div>

      <!-- 笔记上传区域 -->
      <a-card
          class="upload-card animate__animated animate__fadeIn"
          :bordered="false"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
      >
        <template #title>
          <div class="card-title">上传新笔记</div>
        </template>
        <div
            class="file-drop-area"
            :class="{ 'active': isDragging }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
        >
          <cloud-upload-outlined class="upload-icon" />
          <p class="upload-text">拖放文件到此处或点击上传</p>
          <p class="upload-desc">支持 Markdown (.md) 和 PDF (.pdf) 文件</p>
          <a-button class="upload-btn">选择文件</a-button>
          <input
              ref="fileInput"
              type="file"
              class="hidden-input"
              accept=".md,.pdf"
              multiple
              @change="handleFileChange"
          />
        </div>

        <div v-if="recentUploads.length > 0" class="recent-uploads">
          <div class="section-title">最近上传</div>
          <div class="uploads-list">
            <div
                v-for="(file, index) in recentUploads"
                :key="index"
                class="upload-item"
                :class="file.type === 'markdown' ? 'markdown-file' : 'pdf-file'"
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 0.1 * index } }"
            >
              <div class="file-icon">
                <file-markdown-outlined v-if="file.type === 'markdown'" />
                <file-pdf-outlined v-else />
              </div>
              <div class="file-info">
                <h4 class="file-name">{{ file.name }}</h4>
                <p class="file-time">上传于 {{ file.time }}</p>
              </div>
              <div class="file-actions">
                <a-button type="text" shape="circle" class="file-action-btn">
                  <edit-outlined />
                </a-button>
                <a-button type="text" shape="circle" class="file-action-btn delete-btn">
                  <delete-outlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 笔记分类与筛选 -->
      <div
          class="notes-management"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
      >
        <div class="section-header">
          <h2 class="section-title">笔记管理</h2>
          <div class="filter-actions">
            <a-select
                v-model:value="categoryFilter"
                placeholder="所有分类"
                style="width: 140px"
                :options="categoryOptions"
            />
            <a-select
                v-model:value="fileTypeFilter"
                placeholder="所有文件类型"
                style="width: 140px"
                :options="fileTypeOptions"
            />
            <a-select
                v-model:value="sortOrder"
                placeholder="最近更新"
                style="width: 140px"
                :options="sortOptions"
            />
          </div>
        </div>

        <!-- 标签筛选 -->
        <a-card class="tags-card" :bordered="false">
          <div class="tags-container">
            <span class="tags-label">常用标签:</span>
            <div class="tags-list">
              <a-tag
                  v-for="(tag, index) in popularTags"
                  :key="index"
                  :color="tag.color"
                  class="custom-tag"
                  v-motion
                  :initial="{ opacity: 0, scale: 0.8 }"
                  :enter="{ opacity: 1, scale: 1, transition: { delay: 0.05 * index } }"
              >
                #{{ tag.name }}
              </a-tag>
              <a-button type="link" class="more-tags-btn">更多...</a-button>
            </div>
          </div>
        </a-card>

        <!-- 笔记列表 -->
        <div class="notes-grid">
          <a-card
              v-for="(note, index) in notes"
              :key="index"
              class="note-card"
              :bordered="false"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visibleOnce="{ opacity: 1, y: 0, transition: { delay: 0.1 * index } }"
          >
            <div class="note-content">
              <div class="note-header">
                <div class="note-type">
                  <file-markdown-outlined v-if="note.fileType === 'markdown'" class="note-type-icon markdown" />
                  <file-pdf-outlined v-else-if="note.fileType === 'pdf'" class="note-type-icon pdf" />
                  <link-outlined v-else class="note-type-icon link" />
                  <a-tag class="note-category" :color="note.categoryColor">{{ note.category }}</a-tag>
                </div>
                <div class="note-meta">
                  <span class="note-date">{{ note.lastUpdate }}</span>
                  <a-dropdown :trigger="['click']">
                    <a-button type="text" shape="circle" class="note-menu-btn">
                      <ellipsis-outlined />
                    </a-button>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="1">编辑笔记</a-menu-item>
                        <a-menu-item key="2">分享笔记</a-menu-item>
                        <a-menu-item key="3">删除笔记</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </div>
              <h3 class="note-title">{{ note.title }}</h3>
              <p class="note-description">{{ note.description }}</p>
              <div class="note-tags">
                <a-tag v-for="(tag, tagIndex) in note.tags" :key="tagIndex" class="tag-item">
                  #{{ tag }}
                </a-tag>
              </div>
              <div class="note-footer">
                <div class="note-file-info">
                  <file-markdown-outlined v-if="note.fileType === 'markdown'" class="file-type-icon" />
                  <file-pdf-outlined v-else-if="note.fileType === 'pdf'" class="file-type-icon" />
                  <link-outlined v-else class="file-type-icon" />
                  <span>{{ note.fileTypeName }}</span>
                  <span class="info-separator">•</span>
                  <clock-circle-outlined class="progress-icon" />
                  <span>学习进度: {{ note.progress }}</span>
                </div>
              </div>
            </div>
            <div class="note-actions">
              <div class="note-status" :class="note.status.toLowerCase()">{{ note.status }}</div>
              <div class="note-buttons">
                <a-tooltip title="编辑笔记">
                  <a-button type="text" shape="circle" class="action-button">
                    <edit-outlined />
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="note.status === '已完成' ? '重新学习' : '继续学习'">
                  <a-button type="text" shape="circle" class="action-button">
                    <play-circle-outlined v-if="note.status !== '已完成'" />
                    <redo-outlined v-else />
                  </a-button>
                </a-tooltip>
                <a-tooltip title="查看详情">
                  <a-button type="text" shape="circle" class="action-button">
                    <export-outlined />
                  </a-button>
                </a-tooltip>
              </div>
            </div>
          </a-card>
        </div>

        <!-- 分页控件 -->
        <div
            class="pagination-container"
            v-motion
            :initial="{ opacity: 0 }"
            :visibleOnce="{ opacity: 1, transition: { delay: 0.3 } }"
        >
          <div class="pagination-info">显示 1-6 条，共 {{ totalNotes }} 条笔记</div>
          <a-pagination
              v-model:current="currentPage"
              :total="totalNotes"
              show-size-changer
              :page-size="pageSize"
              :page-size-options="['6', '12', '24', '48']"
              @change="handlePageChange"
              @showSizeChange="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 添加笔记模态框 -->
    <NoteAdd />

    <NoteBatchImport
        v-model:visible="importModalVisible"
        @import-success="handleImportSuccess"
        @cancel="handleImportCancel"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import eventBus from '@/utils/eventBus';
import NoteBatchImport from "@/pages/notes/NoteBatchImport.vue";
import {
  PlusOutlined,
  ImportOutlined,
  CloudUploadOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  LinkOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  TeamOutlined
} from '@ant-design/icons-vue';
import NoteAdd from "@/pages/notes/NoteAdd.vue";

// ---------- 状态定义 ----------

// 拖放区域状态
const isDragging = ref(false);
const fileInput = ref(null);

// 分页状态
const currentPage = ref(1);
const pageSize = ref(6);
const totalNotes = ref(157);

// 筛选状态
const categoryFilter = ref('all');
const fileTypeFilter = ref('all');
const sortOrder = ref('recent');

// 模态框状态
const importModalVisible = ref(false);

// 最近上传文件
const recentUploads = reactive([
  { name: 'SpringBoot实战笔记.md', time: '10 分钟前', type: 'markdown' },
  { name: 'Java高并发编程.pdf', time: '25 分钟前', type: 'pdf' },
]);

// 笔记列表数据
const notes = reactive([
  {
    title: 'Java多线程与并发编程',
    description: '详细讲解Java中的线程模型、线程池、锁机制以及并发工具类的使用方法和最佳实践。包含大量代码示例和性能优化建议。',
    category: 'Java基础',
    categoryColor: '#f5222d',
    fileType: 'markdown',
    fileTypeName: 'Markdown',
    lastUpdate: '2天前',
    tags: ['并发', '线程池', '锁'],
    progress: '75%',
    status: '进行中'
  },
  {
    title: 'Spring Boot自动配置原理解析',
    description: '深入剖析Spring Boot的自动配置机制，包括条件注解、starter依赖、配置类加载顺序等核心概念。适合有Spring基础的开发者深入学习。',
    category: 'Spring Boot',
    categoryColor: '#52c41a',
    fileType: 'pdf',
    fileTypeName: 'PDF',
    lastUpdate: '昨天',
    tags: ['SpringBoot', '自动配置', '原理'],
    progress: '45%',
    status: '进行中'
  },
  {
    title: 'Redis高可用方案实践',
    description: '详细介绍Redis的主从复制、哨兵模式和集群模式，以及在生产环境中的最佳实践和性能优化技巧。包含案例分析与实战配置指南。',
    category: 'Redis',
    categoryColor: '#f5222d',
    fileType: 'link',
    fileTypeName: '外部链接',
    lastUpdate: '今天',
    tags: ['Redis', '高可用', '集群'],
    progress: '0%',
    status: '未开始'
  },
  {
    title: 'MySQL索引优化实战',
    description: '全面解析MySQL索引原理、B+树结构、聚簇索引与二级索引的区别，以及如何通过EXPLAIN分析SQL执行计划进行性能优化。',
    category: 'MySQL',
    categoryColor: '#1890ff',
    fileType: 'markdown',
    fileTypeName: 'Markdown',
    lastUpdate: '5天前',
    tags: ['MySQL', '索引', '性能优化'],
    progress: '100%',
    status: '已完成'
  },
  {
    title: '深入理解JVM虚拟机',
    description: '详细讲解JVM内存模型、垃圾回收算法、类加载机制以及性能调优方法。包含实际案例分析与常见问题排查指南。',
    category: 'Java基础',
    categoryColor: '#f5222d',
    fileType: 'pdf',
    fileTypeName: 'PDF',
    lastUpdate: '1周前',
    tags: ['JVM', '垃圾回收', '性能调优'],
    progress: '90%',
    status: '进行中'
  },
  {
    title: 'Spring Cloud微服务架构',
    description: '全面介绍Spring Cloud微服务生态，包括服务注册与发现、配置中心、网关、负载均衡、熔断降级等组件的使用方法。',
    category: 'Spring Cloud',
    categoryColor: '#52c41a',
    fileType: 'link',
    fileTypeName: '外部链接',
    lastUpdate: '3天前',
    tags: ['SpringCloud', '微服务', '分布式'],
    progress: '100%',
    status: '已完成'
  }
]);

// 筛选选项
const categoryOptions = [
  { value: 'all', label: '所有分类' },
  { value: 'java', label: 'Java基础' },
  { value: 'spring', label: 'Spring系列' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'redis', label: 'Redis' },
  { value: 'message-queue', label: '消息队列' },
];

const fileTypeOptions = [
  { value: 'all', label: '所有文件类型' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'pdf', label: 'PDF' },
  { value: 'link', label: '外部链接' },
];

const sortOptions = [
  { value: 'recent', label: '最近更新' },
  { value: 'name-asc', label: '名称升序' },
  { value: 'name-desc', label: '名称降序' },
  { value: 'visits', label: '最多访问' },
];

// 常用标签
const popularTags = reactive([
  { name: 'Java', color: 'blue' },
  { name: 'Spring', color: 'green' },
  { name: 'Redis', color: 'red' },
  { name: 'MySQL', color: 'orange' },
  { name: '微服务', color: 'purple' },
  { name: '并发', color: 'blue' },
  { name: '分布式', color: 'pink' },
  { name: '设计模式', color: 'cyan' },
  { name: '数据结构', color: 'blue' },
  { name: '算法', color: 'green' },
]);

// ---------- 方法定义 ----------

// 显示添加笔记模态框
const showAddNoteModal = () => {
  // 通过事件总线触发
  eventBus.emit('show-add-note-modal');
};

// 处理新添加的笔记
const handleNoteAdded = (noteData) => {
  try {
    // 添加一些防护代码，确保数据是有效的
    if (!noteData || typeof noteData !== 'object') {
      console.error('接收到无效的笔记数据');
      return;
    }

    // 创建一个新对象而不是引用原对象
    const newNote = {
      title: noteData.title || '未命名笔记',
      description: noteData.description || '',
      category: noteData.category || '未分类',
      categoryColor: getCategoryColor(noteData.categoryValue || ''),
      fileType: noteData.contentType || 'markdown',
      fileTypeName: getFileTypeName(noteData.contentType),
      lastUpdate: '刚刚',
      tags: Array.isArray(noteData.tags) ? [...noteData.tags] : [],
      progress: `${noteData.progress || 0}%`,
      status: noteData.status || '未开始'
    };

    // 将新笔记添加到笔记列表中
    notes.unshift(newNote);

    // 更新笔记总数
    totalNotes.value += 1;

    message.success('笔记添加成功！');
  } catch (error) {
    console.error('处理笔记数据时出错:', error);
    message.error('添加笔记失败，请重试');
  }
};

// ---------- 文件处理函数 ----------

// 处理拖放事件
const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFiles(files);
  }
};

// 处理上传的文件
const handleFiles = (files) => {
  // 安全处理文件信息，避免循环引用
  Array.from(files).forEach(file => {
    const isMd = file.name.toLowerCase().endsWith('.md');
    // 只存储必要的信息，不存储文件对象本身
    const safeFile = {
      name: file.name,
      time: '刚刚',
      type: isMd ? 'markdown' : 'pdf',
      size: file.size
    };

    // 添加到最近上传列表
    recentUploads.unshift(safeFile);
  });
};

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 处理文件选择变更
const handleFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    handleFiles(files);
  }

  // 重置input，以便能够重复选择同一个文件
  event.target.value = '';
};

// 显示导入模态框
const showImportModal = () => {
  importModalVisible.value = true;
};

// 处理导入成功
const handleImportSuccess = (importResult) => {
  message.success(`成功导入 ${importResult.count} 个笔记`);
  importModalVisible.value = false;

  // 更新笔记总数
  totalNotes.value += importResult.count;

  // 如果需要，可以在这里加载最新的笔记数据
  // loadNotesData();
};

// 处理导入取消
const handleImportCancel = () => {
  importModalVisible.value = false;
};


// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  // 这里可以加载对应页的数据
};

// 处理每页显示数量变化
const handleSizeChange = (current, size) => {
  pageSize.value = size;
  // 重新加载数据
};

// 获取分类颜色
const getCategoryColor = (categoryValue) => {
  // 根据分类返回不同的颜色
  const colorMap = {
    'java': '#f5222d',
    'spring': '#52c41a',
    'mysql': '#1890ff',
    'redis': '#f5222d',
    'message-queue': '#722ed1'
  };
  return colorMap[categoryValue] || '#5B5CFF';
};

// 获取文件类型名称
const getFileTypeName = (contentType) => {
  const typeMap = {
    'markdown': 'Markdown',
    'pdf': 'PDF',
    'link': '外部链接'
  };
  return typeMap[contentType] || '未知类型';
};

// 初始化
onMounted(() => {
  // 初始化操作，比如从服务器加载数据
  console.log('笔记管理页面已加载');
});
</script>

<style scoped>
.notes-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.notes-content-wrapper {
  margin: 24px 32px;
}

/* 页面标题和操作按钮 */
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title .title-text {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.header-title .title-desc {
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 上传卡片 */
.upload-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.file-drop-area {
  border: 2px dashed #e0e7ff;
  border-radius: 8px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-drop-area:hover, .file-drop-area.active {
  border-color: #1C4ED8;
  background-color: #f0f5ff;
}

.upload-icon {
  font-size: 40px;
  color: #1C4ED8;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.upload-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.upload-btn {
  background-color: #e0e7ff;
  color: #1C4ED8;
  border: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background-color: #c7d2fe;
  color: #1C4ED8;
}

.hidden-input {
  display: none;
}

/* 手动PDF上传样式 */
.manual-upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-container {
  border: 2px dashed #e0e7ff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-container:hover, .upload-container.active-drop {
  border-color: #1C4ED8;
  background-color: #f0f5ff;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.selected-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f0f5ff;
  border-radius: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #f5222d;
  font-size: 20px;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.recent-uploads {
  margin-top: 24px;
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.uploads-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.upload-item:hover {
  background-color: #f9fafb;
}

.markdown-file {
  background-color: #e0e7ff;
}

.pdf-file {
  background-color: #ffe0e0;
}

.file-icon {
  font-size: 20px;
  margin-right: 12px;
}

.markdown-file .file-icon {
  color: #1C4ED8;
}

.pdf-file .file-icon {
  color: #f5222d;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.file-time {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-action-btn {
  color: #666;
  transition: all 0.3s ease;
}

.file-action-btn:hover {
  color: #1C4ED8;
}

.delete-btn:hover {
  color: #f5222d;
}

/* 笔记管理区域 */
.notes-management {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.tags-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
}

.tags-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-right: 4px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.custom-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0;
}

.custom-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.more-tags-btn {
  padding: 0;
  height: auto;
  font-size: 14px;
}

/* 笔记网格 */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.note-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.note-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.note-content {
  padding: 20px;
  flex: 1;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.note-type {
  display: flex;
  align-items: center;
}

.note-type-icon {
  margin-right: 8px;
  font-size: 16px;
}

.note-type-icon.markdown {
  color: #1C4ED8;
}

.note-type-icon.pdf {
  color: #f5222d;
}

.note-type-icon.link {
  color: #722ed1;
}

.note-category {
  font-size: 12px;
  border-radius: 12px;
  margin: 0;
}

.note-meta {
  display: flex;
  align-items: center;
}

.note-date {
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.note-menu-btn {
  color: #666;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 63px; /* 固定高度确保卡片一致 */
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.tag-item {
  font-size: 12px;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  margin: 0;
}

.note-footer {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.note-file-info {
  display: flex;
  align-items: center;
}

.file-type-icon, .progress-icon {
  margin-right: 4px;
}

.info-separator {
  margin: 0 8px;
}

.note-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #f9fafb;
  border-top: 1px solid #f0f0f0;
}

.note-status {
  font-size: 12px;
  font-weight: 500;
}

.note-status.进行中 {
  color: #faad14;
}

.note-status.已完成 {
  color: #52c41a;
}

.note-status.未开始 {
  color: #f5222d;
}

.note-buttons {
  display: flex;
  gap: 8px;
}

/* 修改主要按钮文字颜色 */
.primary-btn {
  color: #ffffff !important; /* 纯白色 */
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 添加文字阴影增强可读性 */
}

/* 对Ant Design组件内部应用样式 */
.primary-btn :deep(span) {
  color: #ffffff !important;
}

/* 次要按钮样式确保足够的对比度 */
.secondary-btn {
  color: #1C4ED8 !important; /* 使用鲜明的蓝色 */
  font-weight: 600;
}

/* 对Ant Design组件内部应用样式 */
.secondary-btn :deep(span) {
  color: #1C4ED8 !important;
}

/* 确保Ant Design组件内部的文字颜色 */
.secondary-btn :deep(.ant-btn-text) {
  color: var(--primary-color) !important;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #0F38A9 0%, #1C4ED8 100%);
  box-shadow: 0 6px 16px rgba(28, 78, 216, 0.3);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  color: var(--primary-color-hover) !important;
  border-color: var(--primary-color-hover);
  background-color: #f0f5ff;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* 分页区域 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .notes-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .pagination-container {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>