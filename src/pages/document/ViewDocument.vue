<template>
  <div class="doc-view-container" :class="{ 'dark-mode': isDarkTheme }">
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
    </div>

    <!-- 中间文档内容区域 -->
    <div class="document-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 文档头部 -->
      <div class="document-header">
        <div class="header-content">
          <div class="breadcrumb-wrapper">
            <n-breadcrumb>
              <n-breadcrumb-item>
                <router-link to="/documents">
                  <n-icon size="14" class="icon-with-space">
                    <icon-font type="icon-home" />
                  </n-icon>
                  文档中心
                </router-link>
              </n-breadcrumb-item>
              <n-breadcrumb-item v-if="categoryInfo.parentLabel">
                {{ categoryInfo.parentLabel }}
              </n-breadcrumb-item>
              <n-breadcrumb-item>
                {{ categoryInfo.label }}
              </n-breadcrumb-item>
            </n-breadcrumb>
          </div>

          <h1 class="document-title">{{ document.title }}</h1>

          <div class="document-meta">
            <div class="author-info">
              <n-avatar
                  round
                  size="small"
                  :src="document.avatarUrl"
                  fallback-src="https://cdnimg103.lizhi.fm/user/2020/10/10/2795836156849848331_160x160.jpg"
              />
              <span class="author-name">{{ document.author }}</span>
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

        <div class="document-actions">
          <n-button circle secondary @click="toggleTheme" class="action-btn">
            <template #icon>
              <n-icon>
                <icon-font :type="isDarkTheme ? 'icon-sun' : 'icon-moon'" />
              </n-icon>
            </template>
          </n-button>

          <n-button circle secondary @click="handlePrint" class="action-btn">
            <template #icon>
              <n-icon>
                <icon-font type="icon-printer" />
              </n-icon>
            </template>
          </n-button>

          <n-button circle secondary class="action-btn">
            <template #icon>
              <n-icon>
                <icon-font type="icon-star" />
              </n-icon>
            </template>
          </n-button>

          <n-button circle secondary class="action-btn">
            <template #icon>
              <n-icon>
                <icon-font type="icon-share" />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>

      <!-- 文档主体内容 -->
      <div class="document-body">
        <markdown-viewer
            v-if="documentContent"
            :markdown="documentContent"
            :isDarkMode="isDarkTheme"
            @toc-ready="handleTocFromMarkdown"
            ref="markdownViewerRef"
        />
        <div v-else class="loading-content">
          <n-skeleton text :repeat="10" />
        </div>

        <!-- 目录调试信息（可在测试后移除） -->
        <div class="toc-debug" style="position: fixed; top: 5px; right: 5px; z-index: 1000; padding: 5px; background: rgba(0,0,0,0.1); font-size: 12px; display: none;">
          目录状态: {{ markdownViewerRef?.tocCollapsed ? '折叠' : '展开' }}
        </div>
      </div>

      <!-- 文档底部 -->
      <div class="document-footer">
        <div class="divider-with-text">
          <span>本文结束</span>
        </div>

        <div class="document-reactions">
          <n-button class="reaction-btn like-btn">
            <template #icon>
              <n-icon>
                <icon-font type="icon-like" />
              </n-icon>
            </template>
            喜欢 ({{ document.likes || 0 }})
          </n-button>

          <n-button class="reaction-btn comment-btn">
            <template #icon>
              <n-icon>
                <icon-font type="icon-comment" />
              </n-icon>
            </template>
            评论 ({{ document.comments?.length || 0 }})
          </n-button>
        </div>

        <div class="author-card">
          <n-avatar
              round
              size="large"
              :src="document.avatarUrl"
              fallback-src="https://cdnimg103.lizhi.fm/user/2020/10/10/2795836156849848331_160x160.jpg"
          />
          <div class="author-info-extended">
            <div class="author-name-large">{{ document.author }}</div>
            <div class="author-bio">{{ document.authorBio || '热爱技术分享的开发者' }}</div>
          </div>
          <n-button type="primary" ghost class="follow-btn">关注作者</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, nextTick} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import IconFont from '@/components/common/IconFont.vue';
import documentService from '@/services/documentService';

// 导入新的Markdown渲染组件
import MarkdownViewer from '@/components/markdown/MarkdownViewer.vue';

// 路由相关
const route = useRoute();
const router = useRouter();
const documentId = ref(route.params.id);

// 文档状态
const document = ref({});
const documentContent = ref('');
const documents = ref([]);
const sidebarCollapsed = ref(false);
const isDarkTheme = ref(false);
const markdownViewerRef = ref(null);
const categoryInfo = ref({
  label: '',
  parentLabel: ''
});

// 获取文档数据
const fetchDocument = async () => {
  try {
    console.log('正在获取文档:', documentId.value);

    // 获取文档
    const doc = documentService.getDocument(documentId.value);
    if (!doc) {
      window.$message?.error('文档不存在或已被删除');
      router.push('/documents');
      return;
    }

    document.value = doc;

    // 安全处理文档内容 - 确保是字符串
    if (doc.content) {
      if (typeof doc.content === 'object') {
        try {
          // 检查是否是代码块对象格式
          if (doc.content.type === 'code' && doc.content.raw) {
            // 提取raw内容，并根据lang指定代码语言
            const lang = doc.content.lang || 'plaintext';
            // 确保raw内容不包含语言标记 (支持```和~~~两种格式)
            const rawContent = doc.content.raw
                .replace(/^(```|~~~)\w*\s*\n/, '')
                .replace(/\n(```|~~~)$/, '');
            documentContent.value = '```' + lang + '\n' + rawContent + '\n```';
            console.log('代码块内容已从raw字段提取并清理');
          } else if (doc.content.text) {
            // 如果有text字段，使用text字段
            documentContent.value = doc.content.text;
            console.log('内容已从text字段提取');
          } else {
            // 非代码块对象，转换为JSON代码块
            documentContent.value = '```json\n' + JSON.stringify(doc.content, null, 2) + '\n```';
            console.log('对象内容已格式化为JSON代码块');
          }
        } catch (e) {
          console.error('格式化对象内容失败:', e);
          documentContent.value = String(doc.content);
        }
      } else {
        documentContent.value = String(doc.content);
      }
    } else {
      documentContent.value = '加载内容失败，文档格式不正确。';
    }

    console.log('文档内容长度:', documentContent.value.length);

    // 处理分类信息
    if (doc.category) {
      updateCategoryInfo(doc.category);
    }

    // 获取同分类文档
    if (doc.category) {
      const categoryKey = Array.isArray(doc.category) ? doc.category[doc.category.length - 1] : doc.category;
      documents.value = documentService.getDocumentsByCategory(categoryKey);
    } else {
      documents.value = documentService.getAllDocuments();
    }

    console.log('文档获取成功', doc.title);
  } catch (err) {
    console.error('获取文档失败', err);
    window.$message?.error('获取文档失败');
    documentContent.value = '加载内容失败，请稍后重试。';
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
      label: 'Spring生态',
      value: 'spring',
      children: [
        {label: 'Spring Framework', value: 'spring-framework'},
        {label: 'SpringBoot', value: 'springboot'},
        {label: 'Spring Cloud', value: 'spring-cloud'},
        {label: 'Spring Security', value: 'spring-security'}
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

// 从Markdown渲染器接收目录
const handleTocFromMarkdown = (headings) => {
  console.log('从Markdown渲染器收到目录:', headings.length, '个标题');

  // 调试目录数据
  if (headings.length === 0) {
    console.warn('未检测到标题，请检查Markdown内容格式');
  } else {
    console.log('目录数据:', headings);
  }

  // 如果有markdownViewerRef，可以尝试手动设置
  if (markdownViewerRef.value) {
    nextTick(() => {
      console.log('尝试手动刷新目录视图');
    });
  }
};

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
};

// 导航到指定文档
const navigateToDocument = (id) => {
  router.push(`/document/view/${id}`);
};

// 处理打印
const handlePrint = () => {
  window.print();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间';
  return dateString;
};

// 组件挂载
onMounted(() => {
  console.log('ViewDocument 组件已挂载');
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

<style>
/* 修复顶部和左侧边框样式问题 */
.doc-view-container {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 60px;
  --toc-width: 260px;
  --header-height: 64px;

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
  transition: width 0.3s ease, transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.05);
}

.category-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-toggle {
  position: absolute;
  top: 20px;
  right: -12px;
  width: 24px;
  height: 24px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.category-header {
  margin-bottom: 8px;
}

.category-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #111827;
}

.category-stats {
  font-size: 0.8rem;
  color: #6b7280;
}

.category-articles {
  margin-top: 16px;
}

.article-item {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.article-item:hover {
  background-color: #f3f4f6;
}

.article-item.active {
  background-color: #eef2ff;
  border-left: 3px solid #6366f1;
}

.article-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #374151;
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

/* 中间内容区域 */
.document-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  margin-right: 260px; /* 确保为目录预留空间 */
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
  /* 更新最大宽度计算，考虑目录宽度 */
  max-width: calc(100% - var(--sidebar-width) - 260px);
}

.document-content.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
  max-width: calc(100% - var(--sidebar-collapsed-width) - 260px);
}

/* 修改document-header样式，添加左侧内边距 */
.document-header {
  background-color: #ffffff;
  padding: 20px 24px 20px 24px; /* 保持原有上右下内边距，明确指定左内边距 */
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  margin-right: -260px;
  z-index: 15;
  margin-left: 24px; /* 添加左侧外边距，与下方卡片保持一致 */
  width: calc(100% + 260px - 24px); /* 调整宽度以补偿左侧外边距 */
}

.breadcrumb-wrapper {
  margin-bottom: 8px;
}

.document-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 12px 0;
  color: #111827;
}

.document-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 0.9rem;
}

.author-info {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.author-name {
  margin-left: 8px;
}

.document-tags {
  margin-left: 16px;
}

.document-tag {
  margin-right: 8px;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  color: #6b7280;
}

/* 更新文档主体样式，使内容铺满 */
.document-body {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 24px 24px 24px; /* 修改此处，增加顶部间距为24px */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - 72px); /* 调整高度计算，考虑增加的间距 */
}

/* 优化中间内容区域布局 */
.document-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease, margin-right 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
  margin-right: 260px; /* 为目录预留空间 */
  max-width: calc(100% - var(--sidebar-width) - 260px);
}

.document-content.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
  max-width: calc(100% - var(--sidebar-collapsed-width) - 260px);
}

.loading-content {
  padding: 24px;
}

.document-footer {
  padding: 24px;
  border-top: 1px solid #e5e7eb;
}

.divider-with-text {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider-with-text::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
  z-index: 0;
}

.divider-with-text span {
  position: relative;
  background-color: #ffffff;
  padding: 0 12px;
  color: #6b7280;
  z-index: 1;
}

.document-reactions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.reaction-btn {
  min-width: 100px;
}

.like-btn {
  color: #ef4444;
}

.comment-btn {
  color: #3b82f6;
}

.author-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.author-info-extended {
  flex: 1;
  margin-left: 16px;
}

.author-name-large {
  font-weight: 600;
  margin-bottom: 4px;
}

.author-bio {
  color: #6b7280;
  font-size: 0.9rem;
}

.follow-btn {
  min-width: 100px;
}

/* 暗色主题 */
.dark-mode {
  --bg-body: #111827;
}

.dark-mode .category-sidebar,
.dark-mode .document-header,
.dark-mode .document-body,
.dark-mode .sidebar-toggle {
  background-color: #1f2937;
  border-color: #374151;
}

.dark-mode .category-title,
.dark-mode .document-title {
  color: #f9fafb;
}

.dark-mode .category-stats,
.dark-mode .article-meta,
.dark-mode .meta-item,
.dark-mode .document-meta {
  color: #9ca3af;
}

.dark-mode .article-title {
  color: #e5e7eb;
}

.dark-mode .article-item:hover {
  background-color: #2d3748;
}

.dark-mode .article-item.active {
  background-color: #3730a3;
  border-left-color: #818cf8;
}

.dark-mode .divider-with-text::before {
  background-color: #374151;
}

.dark-mode .divider-with-text span {
  background-color: #1f2937;
  color: #9ca3af;
}

.dark-mode .author-card {
  background-color: #2d3748;
}

/* 响应式样式 */
@media (max-width: 1024px) {
  .document-actions {
    display: none;
  }
}
</style>