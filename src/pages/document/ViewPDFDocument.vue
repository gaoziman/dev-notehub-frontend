<template>
  <div class="pdf-view-container" :class="{ 'dark-mode': isDarkTheme }">
    <!-- 左侧分类文章列表 -->
    <div class="category-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-content">
        <div class="category-header">
          <h3 class="category-title">{{ categoryInfo.label || '相关文档' }}</h3>
          <div class="category-stats">{{ documents.length }}篇文章</div>
        </div>

        <n-divider style="margin: 8px 0" />

        <div class="category-articles">
          <div
              v-for="doc in documents"
              :key="doc.id"
              class="article-item"
              :class="{ 'active': doc.id === documentId }"
              @click="navigateToDocument(doc.id)"
          >
            <div class="article-title">{{ doc.title }}</div>
            <div class="article-meta">
              <span class="meta-item">
                <n-icon size="14">
                  <icon-font type="icon-eye" />
                </n-icon>
                {{ doc.views }}
              </span>
              <span class="meta-item">
                <n-icon size="14">
                  <icon-font type="icon-time" />
                </n-icon>
                {{ formatDate(doc.updateTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏折叠按钮 -->
      <div class="sidebar-toggle-container">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <icon-font :type="sidebarCollapsed ? 'icon-right' : 'icon-left'" />
        </button>
      </div>
    </div>

    <!-- 中间文档内容区域 -->
    <div
        class="document-content"
        :class="{
        'sidebar-collapsed': sidebarCollapsed
      }"
    >
      <!-- 文档头部 -->
      <div class="document-header">
        <div class="document-header-bg"></div>

        <div class="header-content">
          <!-- 面包屑导航 -->
          <div class="breadcrumb-wrapper">
            <n-breadcrumb>
              <n-breadcrumb-item>
                <router-link to="/documents" class="breadcrumb-link">
                  <n-icon size="14" class="icon-with-space">
                    <icon-font type="icon-home" />
                  </n-icon>
                  文档中心
                </router-link>
              </n-breadcrumb-item>
              <n-breadcrumb-item v-if="categoryInfo.parentLabel">
                <span class="breadcrumb-text">{{ categoryInfo.parentLabel }}</span>
              </n-breadcrumb-item>
              <n-breadcrumb-item>
                <span class="breadcrumb-text">{{ categoryInfo.label || 'PDF文档' }}</span>
              </n-breadcrumb-item>
            </n-breadcrumb>
          </div>

          <!-- 文档标题 -->
          <h1 class="document-title">
            <span class="title-decoration"></span>
            <icon-font type="icon-pdf" class="pdf-icon" />
            {{ document.title }}
          </h1>

          <!-- 文档元数据 -->
          <div class="document-meta">
            <div class="meta-left">
              <div class="author-info">
                <n-avatar
                    round
                    size="small"
                    :src="document.avatarUrl"
                    fallback-src="https://cdnimg103.lizhi.fm/user/2020/10/10/2795836156849848331_160x160.jpg"
                />
                <span class="author-name">{{ document.author || '系统管理员' }}</span>
              </div>

              <n-divider vertical />

              <div class="meta-item">
                <n-icon size="14">
                  <icon-font type="icon-time" />
                </n-icon>
                <span>{{ formatDate(document.updateTime) }}</span>
              </div>

              <n-divider vertical />

              <div class="meta-item">
                <n-icon size="14">
                  <icon-font type="icon-eye" />
                </n-icon>
                <span>{{ document.views }} 阅读</span>
              </div>

              <n-divider vertical />

              <div class="meta-item">
                <n-icon size="14">
                  <icon-font type="icon-file" />
                </n-icon>
                <span>PDF文档</span>
              </div>
            </div>

            <div class="document-tags">
              <n-tag
                  v-for="tag in document.tags"
                  :key="tag"
                  size="small"
                  round
                  class="document-tag"
              >
                {{ tag }}
              </n-tag>
            </div>
          </div>
        </div>

        <!-- 文档操作按钮 -->
        <div class="document-actions">
          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button circle secondary @click="toggleTheme" class="action-btn">
                <template #icon>
                  <n-icon>
                    <icon-font :type="isDarkTheme ? 'icon-sun' : 'icon-moon'" />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <span>{{ isDarkTheme ? '亮色模式' : '暗色模式' }}</span>
          </n-tooltip>

          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button circle secondary @click="downloadPdf" class="action-btn">
                <template #icon>
                  <n-icon>
                    <icon-font type="icon-download" />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <span>下载文档</span>
          </n-tooltip>

          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button circle secondary class="action-btn">
                <template #icon>
                  <n-icon>
                    <icon-font type="icon-star" />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <span>收藏文档</span>
          </n-tooltip>

          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button circle secondary class="action-btn">
                <template #icon>
                  <n-icon>
                    <icon-font type="icon-share" />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <span>分享文档</span>
          </n-tooltip>
        </div>
      </div>

      <!-- 文档主体内容 - PDF查看器 -->
      <div class="document-body pdf-container">
        <pdf-viewer
            v-if="pdfUrl"
            :pdf-url="pdfUrl"
            :default-title="document.title || 'PDF文档'"
            :is-dark-theme="isDarkTheme"
            @theme-changed="updateTheme"
            ref="pdfViewerRef"
        />
        <div v-else class="loading-content">
          <n-skeleton text :repeat="10" />
        </div>
      </div>

      <!-- 文档底部 -->
      <div class="document-footer">
        <!-- 文章结束标记 -->
        <div class="article-end-marker">
          <div class="end-line"></div>
          <div class="end-badge">
            <n-icon size="16" class="end-icon">
              <icon-font type="icon-check-circle" />
            </n-icon>
            <span>文档结束</span>
          </div>
          <div class="end-line"></div>
        </div>

        <!-- 互动按钮区 -->
        <div class="interaction-card">
          <div class="interaction-buttons">
            <n-button class="interaction-btn like-btn" :class="{ 'is-liked': isLiked }" @click="toggleLike">
              <template #icon>
                <n-icon>
                  <icon-font type="icon-like" />
                </n-icon>
              </template>
              <span class="btn-text">喜欢</span>
              <span class="count-badge" v-if="document.likes">{{ document.likes }}</span>
            </n-button>

            <n-button class="interaction-btn comment-btn" @click="scrollToComments">
              <template #icon>
                <n-icon>
                  <icon-font type="icon-comment" />
                </n-icon>
              </template>
              <span class="btn-text">评论</span>
              <span class="count-badge" v-if="document.comments?.length">{{ document.comments.length }}</span>
            </n-button>

            <n-button class="interaction-btn share-btn">
              <template #icon>
                <n-icon>
                  <icon-font type="icon-share" />
                </n-icon>
              </template>
              <span class="btn-text">分享</span>
            </n-button>
          </div>

          <div class="article-stats">
            <span class="stat-item">
              <n-icon size="14" class="stat-icon">
                <icon-font type="icon-eye" />
              </n-icon>
              {{ document.views || 0 }} 阅读
            </span>
            <span class="stat-divider">|</span>
            <span class="stat-item">
              <n-icon size="14" class="stat-icon">
                <icon-font type="icon-like" />
              </n-icon>
              {{ document.likes || 0 }} 喜欢
            </span>
          </div>
        </div>

        <!-- 上下篇导航 -->
        <div class="document-nav-buttons">
          <n-button v-if="prevDocument" class="nav-btn prev-btn" @click="navigateToDocument(prevDocument.id)">
            <template #icon>
              <n-icon>
                <icon-font type="icon-arrow-left" />
              </n-icon>
            </template>
            <span class="nav-label">上一篇</span>
            <span class="nav-title">{{ prevDocument?.title }}</span>
          </n-button>

          <div class="nav-spacer" v-if="prevDocument && nextDocument"></div>

          <n-button v-if="nextDocument" class="nav-btn next-btn" @click="navigateToDocument(nextDocument.id)">
            <span class="nav-label">下一篇</span>
            <span class="nav-title">{{ nextDocument?.title }}</span>
            <template #icon>
              <n-icon>
                <icon-font type="icon-arrow-right" />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed, nextTick} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import IconFont from '@/components/common/IconFont.vue';
import PdfViewer from '@/components/pdf/PdfViewer.vue';
import documentService from '@/services/documentService';
import {
  NButton, NBreadcrumb, NBreadcrumbItem, NIcon, NAvatar,
  NDivider, NTag, NTooltip, NSkeleton, NResult
} from 'naive-ui';

// 路由相关
const route = useRoute();
const router = useRouter();
const documentId = ref(route.params.id);
const isPdfLoading = ref(true);

// 文档状态
const document = ref({});
const pdfUrl = ref('');
const documents = ref([]);
const sidebarCollapsed = ref(false);
const isDarkTheme = ref(false);
const pdfViewerRef = ref(null);
const categoryInfo = ref({
  label: '',
  parentLabel: ''
});

// 新增状态
const isLiked = ref(false);
const commentsSection = ref(null);

// 导航相关
const prevDocument = ref(null);
const nextDocument = ref(null);

// PDF URL - 开发阶段使用固定URL
const devPdfUrl = 'http://leocoder.cn:9000/coder-devnotehub/documents/20250503/1047e56767094243a7592fdf7d5df2a7.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250502%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250502T183347Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7d716ed1a80c2926697f4ad66a64b57d1789b935aed4fa21e24e61671496327a';

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;

  // 保存侧边栏状态到本地存储
  try {
    localStorage.setItem('pdf-sidebar-collapsed', sidebarCollapsed.value.toString());
  } catch (e) {
    console.error('无法保存侧边栏状态:', e);
  }

  // 强制窗口重新计算布局
  nextTick(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

// 获取文档数据
const fetchDocument = async () => {
  try {
    console.log('正在获取PDF文档:', documentId.value);
    isPdfLoading.value = true;

    // 获取文档
    const doc = documentService.getDocument(documentId.value);

    if (!doc) {
      // 由于尚无后端，这里创建一个临时文档对象
      document.value = {
        id: documentId.value,
        title: 'Java 面试题库',
        author: '技术文档组',
        updateTime: new Date().toISOString().split('T')[0],
        views: 128,
        likes: 42,
        tags: ['Java', 'JVM', '规范文档', 'PDF'],
        description: 'Java虚拟机规范第八版官方文档，详细描述了Java虚拟机的架构、类文件格式、字节码指令集、类加载机制等核心内容。',
        docType: 'pdf',
        category: ['resources', 'pdf-docs']
      };
    } else {
      document.value = doc;
    }

    // 如果有pdfId，从服务获取URL；否则使用开发阶段的URL
    if (document.value.pdfId) {
      try {
        pdfUrl.value = await documentService.getPdfUrl(document.value.pdfId);
      } catch (error) {
        console.error('获取PDF URL失败:', error);
        pdfUrl.value = devPdfUrl; // 失败时使用开发URL
      }
    } else {
      pdfUrl.value = devPdfUrl;
    }

    // 处理分类信息
    if (document.value.category) {
      updateCategoryInfo(document.value.category);
    }

    // 获取同分类文档
    if (document.value.category) {
      const categoryKey = Array.isArray(document.value.category) ? document.value.category[document.value.category.length - 1] : document.value.category;
      const docs = documentService.getDocumentsByCategory(categoryKey);

      // 过滤为只包含PDF类型的文档
      documents.value = docs.filter(d => d.docType === 'pdf');

      // 确定上下篇
      const currentIndex = documents.value.findIndex(d => d.id === documentId.value);
      if (currentIndex > 0) {
        prevDocument.value = documents.value[currentIndex - 1];
      }
      if (currentIndex < documents.value.length - 1) {
        nextDocument.value = documents.value[currentIndex + 1];
      }
    } else {
      // 如果没有分类，获取所有PDF文档
      documents.value = documentService.getDocumentsByType('pdf');
    }

    isPdfLoading.value = false;
    console.log('PDF文档获取成功', document.value.title);
  } catch (err) {
    console.error('获取PDF文档失败', err);
    isPdfLoading.value = false;
  }
};

// 更新分类信息
const updateCategoryInfo = (category) => {
  const categoryPath = Array.isArray(category) ? category : [category];

  // 模拟分类选项
  const categoryOptions = [
    {
      label: 'Java',
      value: 'java',
      children: [
        {label: 'Java 基础', value: 'java-basic'},
        {label: 'Java 高级', value: 'java-advanced'},
        {label: 'Java 虚拟机', value: 'jvm'},
        {label: '并发编程', value: 'concurrency'}
      ]
    },
    {
      label: '资源文档',
      value: 'resources',
      children: [
        {label: 'PDF文档', value: 'pdf-docs'},
        {label: '电子书', value: 'ebooks'},
        {label: '教程', value: 'tutorials'},
        {label: '规范文档', value: 'specifications'}
      ]
    },
  ];

  // 查找分类配置
  const findCategory = (options, value) => {
    for (const option of options) {
      if (option.value === value) return option;
      if (option.children) {
        const found = findCategory(option.children, value);
        if (found) return found;
      }
    }
    return null;
  };

  if (categoryPath.length >= 2) {
    const parentCategory = categoryPath[0];
    const childCategory = categoryPath[1];

    const parentOption = categoryOptions.find(opt => opt.value === parentCategory);
    if (parentOption) {
      categoryInfo.value.parentLabel = parentOption.label;

      const childOption = parentOption.children?.find(opt => opt.value === childCategory);
      if (childOption) {
        categoryInfo.value.label = childOption.label;
      }
    }
  } else if (categoryPath.length === 1) {
    const option = findCategory(categoryOptions, categoryPath[0]);
    if (option) {
      categoryInfo.value.label = option.label;
    }
  }
};

// 新增交互方法
const toggleLike = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    document.value.likes = (document.value.likes || 0) + 1;
    window.$message?.success('已添加到收藏');
  } else {
    document.value.likes = Math.max(0, (document.value.likes || 1) - 1);
  }
};

const scrollToComments = () => {
  if (commentsSection.value) {
    commentsSection.value.scrollIntoView({behavior: 'smooth'});
  }
};

// 下载PDF
const downloadPdf = () => {
  if (!pdfUrl.value) return;

  const link = document.createElement('a');
  link.href = pdfUrl.value;
  link.download = `${document.value.title || 'document'}.pdf`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;

  // 保存主题状态到本地存储
  try {
    localStorage.setItem('pdf-theme-dark', isDarkTheme.value.toString());
  } catch (e) {
    console.error('无法保存主题状态:', e);
  }
};

// 更新主题（从子组件）
const updateTheme = (isDark) => {
  if (isDarkTheme.value !== isDark) {
    isDarkTheme.value = isDark;

    // 保存主题状态到本地存储
    try {
      localStorage.setItem('pdf-theme-dark', isDarkTheme.value.toString());
    } catch (e) {
      console.error('无法保存主题状态:', e);
    }
  }
};

// 导航到指定文档
const navigateToDocument = (id) => {
  if (id === documentId.value) return;

  const targetDoc = documents.value.find(d => d.id === id);
  if (!targetDoc) return;

  // 确定正确的路由
  let route = '/document/view/';
  if (targetDoc.docType === 'pdf') {
    route = '/pdf/view/';
  }

  router.push(`${route}${id}`);
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间';
  return dateString;
};

// 组件挂载
onMounted(() => {
  console.log('ViewPDFDocument 组件已挂载');

  // 从本地存储恢复侧边栏状态
  try {
    const savedSidebarState = localStorage.getItem('pdf-sidebar-collapsed');
    if (savedSidebarState !== null) {
      sidebarCollapsed.value = savedSidebarState === 'true';
    }

    const savedThemeState = localStorage.getItem('pdf-theme-dark');
    if (savedThemeState !== null) {
      isDarkTheme.value = savedThemeState === 'true';
    }
  } catch (e) {
    console.error('无法读取存储状态:', e);
  }

  fetchDocument();
});

// 监听路由参数变化，重新获取文档
watch(
    () => route.params.id,
    (newId) => {
      if (newId && newId !== documentId.value) {
        console.log('文档ID已变更:', newId);
        documentId.value = newId;
        fetchDocument();
      }
    }
);
</script>

<style scoped>
.pdf-view-container {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 60px;
  --header-height: 64px;
  --primary-color: #6366f1;
  --primary-light: rgba(99, 102, 241, 0.1);
  --primary-lighter: rgba(99, 102, 241, 0.05);
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #3b82f6;
  --transition-speed: 0.3s;

  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: var(--bg-body, #f9fafb);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  position: relative;
  overflow: hidden; /* 防止溢出导致出现滚动条 */
}

/* 左侧侧边栏 */
.category-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  z-index: 20;
  transition: width var(--transition-speed) ease, transform var(--transition-speed) ease;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.05);
}

.category-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
  overflow: hidden;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  transition: opacity var(--transition-speed) ease, transform var(--transition-speed) ease;
  width: 100%;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}

.category-sidebar.collapsed .sidebar-content {
  opacity: 0;
  transform: translateX(-20px);
  pointer-events: none;
}

/* 添加侧边栏折叠按钮 */
.sidebar-toggle-container {
  position: absolute;
  top: 50%;
  right: -15px;
  transform: translateY(-50%);
  z-index: 30;
}

.sidebar-toggle {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background-color: var(--primary-lighter);
  color: var(--primary-color);
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.15);
}

.category-header {
  margin-bottom: 12px;
}

.category-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #111827;
}

.category-stats {
  font-size: 0.85rem;
  color: #6b7280;
}

.category-articles {
  margin-top: 16px;
}

.article-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  border-left: 3px solid transparent;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.article-item:hover {
  background-color: #f9fafb;
  transform: translateX(3px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.article-item.active {
  background-color: var(--primary-lighter);
  border-left-color: var(--primary-color);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.15);
}

.article-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  font-size: 0.8rem;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.meta-item i {
  margin-right: 4px;
}

/* 改进的文档头部样式 */
.document-header {
  position: relative;
  background-color: transparent;
  padding: 26px 32px 22px 32px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 15;
  margin: 20px 24px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: margin var(--transition-speed) ease;
}

.document-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  z-index: -1;
}

/* 美化面包屑 */
.breadcrumb-wrapper {
  margin-bottom: 12px;
}

.breadcrumb-link,
.breadcrumb-text {
  font-size: 0.9rem;
  color: #6b7280;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.icon-with-space {
  margin-right: 4px;
  vertical-align: -0.15em;
}

/* 文档标题样式增强 */
.document-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 16px 0;
  color: #111827;
  position: relative;
  display: inline-flex;
  align-items: center;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.pdf-icon {
  margin-right: 14px;
  color: #ef4444;
  font-size: 26px;
}

.title-decoration {
  display: inline-block;
  width: 4px;
  height: 28px;
  background: linear-gradient(to bottom, var(--danger-color), #f87171);
  border-radius: 2px;
  margin-right: 14px;
}

/* 改进的元数据样式 */
.document-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 14px;
}

.meta-left {
  display: flex;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.author-name {
  margin-left: 8px;
  font-weight: 500;
}

.document-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.document-tag {
  background-color: var(--primary-lighter);
  color: var(--primary-color);
  font-weight: 500;
  transition: all 0.2s;
}

.document-tag:hover {
  background-color: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
}

/* 改进的操作按钮 */
.document-actions {
  display: flex;
  gap: 12px;
  margin-left: 16px;
}

.action-btn {
  color: #6b7280;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.25s ease;
  width: 40px;
  height: 40px;
}

.action-btn:hover {
  color: var(--primary-color);
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.15);
}

.action-btn:active {
  transform: translateY(0);
}

/* 文档主体样式 */
.document-body {
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin: 20px 24px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 700px;
  height: 80vh;
  transition: margin var(--transition-speed) ease;
  width: auto; /* 让宽度自适应 */
}

.pdf-container {
  padding: 0; /* 移除内边距让PDF查看器填满容器 */
  overflow: hidden; /* 确保内容不溢出 */
}

/* 优化中间内容区域布局 */
.document-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
  transition: all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  max-width: calc(100% - var(--sidebar-width)); /* 添加最大宽度限制 */
}

/* 左侧边栏折叠时内容区域样式 */
.document-content.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
  width: calc(100% - var(--sidebar-collapsed-width));
  max-width: calc(100% - var(--sidebar-collapsed-width));
}

.loading-content {
  padding: 24px;
}

/* ========== 改进的文档底部样式 ========== */
.document-footer {
  border-top: none;
  padding: 0 0 40px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 文章结束标记 */
.article-end-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0 16px 0;
  margin-top: 10px;
}

.end-line {
  height: 1px;
  flex: 1;
  background: linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.05));
}

.end-badge {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 14px;
  padding: 0 20px;
  font-weight: 500;
}

.end-icon {
  color: var(--primary-color);
  margin-right: 8px;
}

/* 互动卡片 */
.interaction-card {
  background-color: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: all 0.3s ease;
}

.interaction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.interaction-buttons {
  display: flex;
  justify-content: center;
  gap: 28px;
}

.interaction-btn {
  min-width: 110px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 22px;
  font-weight: 500;
  transition: all 0.25s ease;
  position: relative;
}

.btn-text {
  margin: 0 4px;
}

.count-badge {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 4px;
}

.like-btn {
  color: var(--danger-color);
  background-color: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.like-btn:hover, .like-btn.is-liked {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: var(--danger-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(239, 68, 68, 0.15);
}

.like-btn:active {
  transform: translateY(-1px);
}

.comment-btn {
  color: var(--info-color);
  background-color: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.comment-btn:hover {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: var(--info-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.15);
}

.comment-btn:active {
  transform: translateY(-1px);
}

.share-btn {
  color: var(--success-color);
  background-color: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.share-btn:hover {
  background-color: rgba(16, 185, 129, 0.15);
  border-color: var(--success-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.15);
}

.share-btn:active {
  transform: translateY(-1px);
}

.article-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6b7280;
  font-size: 13px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  margin-right: 4px;
}

.stat-divider {
  margin: 0 12px;
  color: #d1d5db;
}

/* 上下篇导航 */
.document-nav-buttons {
  display: flex;
  margin: 0 24px;
  gap: 16px;
}

.nav-btn {
  flex: 1;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 0 22px;
  transition: all 0.25s ease;
}

.nav-btn:hover {
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(99, 102, 241, 0.12);
}

.nav-spacer {
  width: 16px;
}

.nav-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.nav-title {
  color: #111827;
  font-weight: 500;
  font-size: 14px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prev-btn {
  justify-content: flex-start;
}

.next-btn {
  justify-content: flex-end;
}

/* 暗色主题 */
.dark-mode {
  --bg-body: #111827;
  --primary-color: #818cf8;
  --primary-light: rgba(129, 140, 248, 0.2);
  --primary-lighter: rgba(129, 140, 248, 0.1);
  --primary-gradient: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
}

.dark-mode .document-header-bg {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.dark-mode .category-sidebar,
.dark-mode .document-body,
.dark-mode .interaction-card,
.dark-mode .nav-btn,
.dark-mode .sidebar-toggle {
  background-color: #1f2937;
  border-color: #374151;
}

.dark-mode .sidebar-toggle {
  color: #9ca3af;
}

.dark-mode .sidebar-toggle:hover {
  background-color: #374151;
  color: #a5b4fc;
}

.dark-mode .category-title,
.dark-mode .document-title,
.dark-mode .author-name-large,
.dark-mode .recent-articles-title,
.dark-mode .nav-title,
.dark-mode .comments-title {
  color: #f9fafb;
}

.dark-mode .category-stats,
.dark-mode .article-meta,
.dark-mode .meta-item,
.dark-mode .document-meta,
.dark-mode .breadcrumb-text,
.dark-mode .breadcrumb-link,
.dark-mode .end-badge,
.dark-mode .author-bio,
.dark-mode .article-stats,
.dark-mode .author-stats,
.dark-mode .nav-label,
.dark-mode .empty-tip {
  color: #9ca3af;
}

.dark-mode .article-title {
  color: #e5e7eb;
}

.dark-mode .author-avatar {
  border-color: #1f2937;
}

.dark-mode .article-item {
  background-color: #2d3748;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.dark-mode .article-item:hover {
  background-color: #374151;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.dark-mode .article-item.active {
  background-color: rgba(129, 140, 248, 0.2);
  border-left-color: #818cf8;
  box-shadow: 0 3px 8px rgba(129, 140, 248, 0.15);
}

.dark-mode .document-tag {
  background-color: rgba(129, 140, 248, 0.15);
  color: #a5b4fc;
}

.dark-mode .action-btn {
  color: #9ca3af;
  border-color: #4b5563;
  background-color: #2d3748;
}

.dark-mode .action-btn:hover {
  background-color: #374151;
  color: #a5b4fc;
  border-color: #818cf8;
}

.dark-mode .end-line {
  background: linear-gradient(to right, rgba(129, 140, 248, 0.05), rgba(129, 140, 248, 0.3), rgba(129, 140, 248, 0.05));
}

.dark-mode .sidebar-content::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.dark-mode .sidebar-content::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

/* 响应式样式 */
@media (max-width: 1200px) {
  .pdf-view-container {
    --sidebar-width: 240px;
    --sidebar-collapsed-width: 50px;
  }

  .document-header {
    flex-direction: column;
  }

  .document-actions {
    margin-left: 0;
    margin-top: 16px;
    align-self: flex-end;
  }

  .document-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .document-tags {
    margin-left: 0;
  }

  .interaction-buttons {
    flex-wrap: wrap;
  }

  .document-nav-buttons {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .pdf-view-container {
    --sidebar-width: 0;
    --sidebar-collapsed-width: 0;
  }

  .document-header {
    padding: 20px 16px;
    margin-left: 16px;
    margin-right: 16px;
  }

  .document-title {
    font-size: 1.6rem;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .interaction-card,
  .document-nav-buttons {
    margin-left: 16px;
    margin-right: 16px;
  }

  .interaction-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .interaction-btn {
    width: 100%;
  }

  /* 移动端优化 */
  .document-content,
  .document-content.sidebar-collapsed {
    margin-left: 0;
    width: 100%;
    max-width: 100%;
  }

  .category-sidebar {
    display: none;
  }

  .category-sidebar.visible {
    display: block;
    transform: translateX(0);
  }

  .document-body {
    height: 65vh;
    min-height: 500px;
  }
}

@media print {
  .category-sidebar,
  .interaction-card,
  .document-nav-buttons,
  .article-end-marker,
  .sidebar-toggle-container {
    display: none;
  }

  .document-content,
  .document-content.sidebar-collapsed {
    margin: 0;
    width: 100%;
    max-width: 100%;
  }

  .document-header,
  .document-body {
    box-shadow: none;
  }

  .document-body {
    height: auto;
  }
}
</style>