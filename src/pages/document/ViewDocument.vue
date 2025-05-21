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
    <div
        class="document-content"
        :class="{
        'sidebar-collapsed': sidebarCollapsed,
        'toc-collapsed': tocCollapsed
      }"
    >
      <!-- 改进的文档头部 -->
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
                <span class="breadcrumb-text">{{ categoryInfo.label }}</span>
              </n-breadcrumb-item>
            </n-breadcrumb>
          </div>

          <!-- 文档标题 -->
          <h1 class="document-title">
            <span class="title-decoration"></span>
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
              <n-button circle secondary @click="handlePrint" class="action-btn">
                <template #icon>
                  <n-icon>
                    <icon-font type="icon-printer" />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <span>打印文档</span>
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

      <!-- 文档主体内容 -->
      <div class="document-body">
        <markdown-viewer
            v-if="documentContent"
            :markdown="documentContent"
            :isDarkMode="isDarkTheme"
            @toc-ready="handleTocFromMarkdown"
            @toc-collapsed="handleTocCollapsed"
            ref="markdownViewerRef"
        />
        <div v-else class="loading-content">
          <n-skeleton text :repeat="10" />
        </div>
      </div>

      <!-- 改进的文档底部 -->
      <div class="document-footer">
        <!-- 文章结束标记 -->
        <div class="article-end-marker">
          <div class="end-line"></div>
          <div class="end-badge">
            <n-icon size="16" class="end-icon">
              <icon-font type="icon-check-circle" />
            </n-icon>
            <span>本文结束</span>
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
import {ref, onMounted, watch, nextTick, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import IconFont from '@/components/common/IconFont.vue';
import documentService from '@/services/documentService';

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
const tocCollapsed = ref(false);
const markdownViewerRef = ref(null);
const categoryInfo = ref({
  label: '',
  parentLabel: ''
});

// 新增状态
const isLiked = ref(false);
const commentsSection = ref(null);
const authorStats = ref({
  articles: 42,
  followers: 156
});
const recentArticles = ref([]);

// 导航相关
const prevDocument = ref(null);
const nextDocument = ref(null);

// 处理目录折叠状态变化 - 改进的状态管理
const handleTocCollapsed = (collapsed) => {
  console.log('ViewDocument收到目录折叠状态变化:', collapsed);
  tocCollapsed.value = collapsed;

  // 保存目录状态到本地存储
  try {
    localStorage.setItem('doc-toc-collapsed', collapsed.toString());
  } catch (e) {
    console.error('无法保存目录状态:', e);
  }

  // 强制窗口重新计算布局
  nextTick(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;

  // 保存侧边栏状态到本地存储
  try {
    localStorage.setItem('doc-sidebar-collapsed', sidebarCollapsed.value.toString());
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

      // 模拟获取上下篇
      const currentIndex = documents.value.findIndex(d => d.id === doc.id);
      if (currentIndex > 0) {
        prevDocument.value = documents.value[currentIndex - 1];
      }
      if (currentIndex < documents.value.length - 1) {
        nextDocument.value = documents.value[currentIndex + 1];
      }

      // 模拟获取作者最近文章
      recentArticles.value = documents.value
          .filter(d => d.author === doc.author && d.id !== doc.id)
          .slice(0, 3);
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

// 从Markdown渲染器接收目录 - 改进的目录处理逻辑
const handleTocFromMarkdown = (headings) => {
  console.log('ViewDocument从MarkdownViewer收到目录:', headings.length, '个标题');

  // 验证目录数据的完整性
  if (headings.length === 0) {
    console.warn('未检测到标题，可能原因：');
    console.warn('1. Markdown内容中没有标题标记(#)');
    console.warn('2. 标题位于代码块内');
    console.warn('3. 内容尚未完全加载');
  } else {
    // 显示检测到的标题信息
    console.log('检测到的标题：');
    headings.forEach((heading, index) => {
      console.log(`${index + 1}. [H${heading.level}] ${heading.text} (ID: ${heading.id})`);
    });

    // 验证ID的唯一性
    const idSet = new Set();
    const duplicates = [];
    headings.forEach(heading => {
      if (idSet.has(heading.id)) {
        duplicates.push(heading.id);
      } else {
        idSet.add(heading.id);
      }
    });

    if (duplicates.length > 0) {
      console.error('发现重复的标题ID:', duplicates);
    } else {
      console.log('✓ 所有标题ID都是唯一的');
    }
  }

  // 如果有markdownViewerRef，可以尝试手动刷新
  if (markdownViewerRef.value) {
    nextTick(() => {
      console.log('尝试手动刷新目录视图');
    });
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

  // 从本地存储恢复侧边栏和目录状态
  try {
    const savedSidebarState = localStorage.getItem('doc-sidebar-collapsed');
    if (savedSidebarState !== null) {
      sidebarCollapsed.value = savedSidebarState === 'true';
      console.log('恢复侧边栏状态:', sidebarCollapsed.value);
    }

    const savedTocState = localStorage.getItem('doc-toc-collapsed');
    if (savedTocState !== null) {
      tocCollapsed.value = savedTocState === 'true';
      console.log('恢复目录折叠状态:', tocCollapsed.value);
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
        // 重置状态后重新获取文档
        document.value = {};
        documentContent.value = '';
        fetchDocument();
      }
    }
);

// 监听内容变化 - 确保状态正确重置
watch(
    () => documentContent.value,
    (newContent) => {
      if (newContent) {
        console.log('文档内容已更新，长度:', newContent.length);
      }
    }
);
</script>

<style>
/* 顶部和左侧边框 */
.doc-view-container {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 60px;
  --toc-width: 260px;
  --toc-collapsed-width: 48px; /* 调整折叠时的宽度 */
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
  width: 30px;
  height: 30px;
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
  background-color: var(--primary-lighter);
  border-left: 3px solid var(--primary-color);
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

/* 改进的文档头部样式 */
.document-header {
  position: relative;
  background-color: transparent;
  padding: 24px 32px 20px 32px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 15;
  margin-left: 24px;
  margin-right: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  font-size: 1.9rem;
  font-weight: 700;
  margin: 16px 0;
  color: #111827;
  position: relative;
  display: inline-flex;
  align-items: center;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.title-decoration {
  display: inline-block;
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, var(--primary-color), #818cf8);
  border-radius: 2px;
  margin-right: 12px;
}

/* 改进的元数据样式 */
.document-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 12px;
}

.meta-left {
  display: flex;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.author-name {
  margin-left: 8px;
  font-weight: 500;
}

.document-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
}

/* 改进的操作按钮 */
.document-actions {
  display: flex;
  gap: 12px;
  margin-left: 16px;
}

.action-btn {
  color: #6b7280;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
}

.action-btn:hover {
  color: var(--primary-color);
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

/* 文档主体样式 */
.document-body {
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 24px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  transition: margin var(--transition-speed) ease;
  width: auto; /* 让宽度自适应 */
}

/* 优化中间内容区域布局 - 更新的宽度计算 */
.document-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  /* 修改:确保内容区域的宽度正确计算，考虑右侧目录 */
  width: calc(100% - var(--sidebar-width) - var(--toc-width));
  transition: all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  max-width: calc(100% - var(--sidebar-width) - var(--toc-width)); /* 添加最大宽度限制 */
}

/* 左侧边栏折叠时内容区域样式 */
.document-content.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
  width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-width));
  max-width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-width));
}

/* 右侧目录折叠时内容区域样式 */
.document-content.toc-collapsed {
  width: calc(100% - var(--sidebar-width) - var(--toc-collapsed-width));
  max-width: calc(100% - var(--sidebar-width) - var(--toc-collapsed-width));
}

/* 两侧都折叠时的样式 */
.document-content.sidebar-collapsed.toc-collapsed {
  width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-collapsed-width));
  max-width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-collapsed-width));
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
  padding: 0 16px;
  font-weight: 500;
}

.end-icon {
  color: var(--primary-color);
  margin-right: 8px;
}

/* 互动卡片 */
.interaction-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
}

.interaction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.interaction-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.interaction-btn {
  min-width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s ease;
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
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.15);
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
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
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
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.15);
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
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 0 20px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 102, 241, 0.1);
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

/* 评论区样式 */
.comments-section {
  margin: 0 24px;
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.dark-mode .recent-article-link {
  color: #e5e7eb;
}

.dark-mode .article-title {
  color: #e5e7eb;
}

.dark-mode .author-avatar {
  border-color: #1f2937;
}

.dark-mode .article-item:hover {
  background-color: #2d3748;
}

.dark-mode .article-item.active {
  background-color: rgba(129, 140, 248, 0.2);
  border-left-color: #818cf8;
}

.dark-mode .document-tag {
  background-color: rgba(129, 140, 248, 0.15);
  color: #a5b4fc;
}

.dark-mode .action-btn,
.dark-mode .end-line {
  color: #9ca3af;
  border-color: #4b5563;
}

.dark-mode .like-btn {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

.dark-mode .comment-btn {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.dark-mode .share-btn {
  background-color: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.dark-mode .action-btn:hover {
  color: #a5b4fc;
  background-color: rgba(129, 140, 248, 0.15);
  border-color: #818cf8;
}

.dark-mode .nav-btn:hover {
  background-color: #2d3748;
  border-color: #818cf8;
}

.dark-mode .end-line {
  background: linear-gradient(to right, rgba(129, 140, 248, 0.05), rgba(129, 140, 248, 0.3), rgba(129, 140, 248, 0.05));
}

.dark-mode .divider-with-text::before {
  background-color: #374151;
}

.dark-mode .divider-with-text span {
  background-color: #1f2937;
  color: #9ca3af;
}

/* 响应式样式 */
@media (max-width: 1200px) {
  .doc-view-container {
    --sidebar-width: 220px;
    --toc-width: 220px;
    --sidebar-collapsed-width: 50px;
    --toc-collapsed-width: 44px;
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

  .author-profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .author-avatar-wrapper {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .author-name-row {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .doc-view-container {
    --sidebar-width: 0;
    --toc-width: 0;
    --sidebar-collapsed-width: 0;
    --toc-collapsed-width: 0;
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
    width: 32px;
    height: 32px;
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
  .document-content.toc-collapsed,
  .document-content.sidebar-collapsed,
  .document-content.sidebar-collapsed.toc-collapsed {
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
  .document-content.toc-collapsed,
  .document-content.sidebar-collapsed,
  .document-content.sidebar-collapsed.toc-collapsed {
    margin: 0;
    width: 100%;
    max-width: 100%;
  }

  .document-header,
  .document-body {
    box-shadow: none;
  }
}

/* 添加侧边栏动画 */
@keyframes sidebar-collapse {
  from {
    margin-left: var(--sidebar-width);
    width: calc(100% - var(--sidebar-width) - var(--toc-width));
    max-width: calc(100% - var(--sidebar-width) - var(--toc-width));
  }
  to {
    margin-left: var(--sidebar-collapsed-width);
    width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-width));
    max-width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-width));
  }
}

@keyframes sidebar-expand {
  from {
    margin-left: var(--sidebar-collapsed-width);
    width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-width));
    max-width: calc(100% - var(--sidebar-collapsed-width) - var(--toc-width));
  }
  to {
    margin-left: var(--sidebar-width);
    width: calc(100% - var(--sidebar-width) - var(--toc-width));
    max-width: calc(100% - var(--sidebar-width) - var(--toc-width));
  }
}

/* 应用动画 */
.document-content.sidebar-collapsed {
  animation: sidebar-collapse var(--transition-speed) ease-out;
}

.document-content:not(.sidebar-collapsed) {
  animation: sidebar-expand var(--transition-speed) ease-out;
}

/* 修复过渡过程中可能出现的问题 */
.document-content {
  will-change: margin-left, width, max-width;
}
</style>