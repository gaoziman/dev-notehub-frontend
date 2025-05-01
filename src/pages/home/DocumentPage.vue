<template>
  <div class="documents-page">
    <!-- 顶部区域 -->
    <div class="header-card">
      <div class="header-content">
        <!-- 标题和描述 -->
        <div class="header-left">
          <h1 class="main-title">
            <n-gradient-text type="primary" :size="24">文档管理中心</n-gradient-text>
          </h1>
          <p class="subtitle">管理、组织和查找您的所有知识资源，包括 Markdown 文档、PDF 文件和各类技术资料</p>
        </div>

        <!-- 搜索和操作按钮 -->
        <div class="header-right">
          <div class="search-and-actions">
            <n-input-group>
              <n-input v-model:value="searchQuery" placeholder="搜索文档..." clearable>
                <template #prefix>
                  <icon-font type="icon-sousuo-"/>
                </template>
              </n-input>
              <n-button type="primary">
                <template #icon>
                  <icon-font type="icon-sousuo2"/>
                </template>
                搜索
              </n-button>
            </n-input-group>

            <div class="action-buttons">
              <n-button type="primary" @click="goToUploadPage">
                <template #icon>
                  <icon-font type="icon-shangchuan1"/>
                </template>
                上传文件
              </n-button>
              <n-button type="default" @click="goToEditorPage">
                <template #icon>
                  <icon-font type="icon-a-ziliaocaozuoxinzeng"/>
                </template>
                新建文档
              </n-button>
              <n-popover trigger="click" placement="bottom">
                <template #trigger>
                  <n-button quaternary circle>
                    <icon-font type="icon-gengduo1"/>
                  </n-button>
                </template>
                <n-menu :options="moreOptions"/>
              </n-popover>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-card-area">
        <n-grid :cols="4" :x-gap="16" responsive="screen">
          <!-- 总文档数 -->
          <n-grid-item>
            <n-card class="stats-card all-documents">
              <div class="stats-card-content">
                <div class="stats-info">
                  <div class="stats-title">文档总数</div>
                  <div class="stats-value">{{ stats.totalDocs }}</div>
                  <div class="stats-trend">上个月 +{{ stats.totalDocsGrowth }}</div>
                </div>
                <div class="stats-icon">
                  <icon-font type="icon-wenjian"/>
                </div>
              </div>
            </n-card>
          </n-grid-item>

          <!-- Markdown文档 -->
          <n-grid-item>
            <n-card class="stats-card markdown-documents">
              <div class="stats-card-content">
                <div class="stats-info">
                  <div class="stats-title">Markdown文档</div>
                  <div class="stats-value">{{ stats.markdownDocs }}</div>
                  <div class="stats-trend">上个月 +{{ stats.markdownDocsGrowth }}</div>
                </div>
                <div class="stats-icon markdown-icon">
                  <icon-font type="icon-a-IconMarkDown"/>
                </div>
              </div>
            </n-card>
          </n-grid-item>

          <!-- PDF文档 -->
          <n-grid-item>
            <n-card class="stats-card pdf-documents">
              <div class="stats-card-content">
                <div class="stats-info">
                  <div class="stats-title">PDF文档</div>
                  <div class="stats-value">{{ stats.pdfDocs }}</div>
                  <div class="stats-trend">上个月 +{{ stats.pdfDocsGrowth }}</div>
                </div>
                <div class="stats-icon pdf-icon">
                  <icon-font type="icon-icon_pdf"/>
                </div>
              </div>
            </n-card>
          </n-grid-item>

          <!-- 存储空间 -->
          <n-grid-item>
            <n-card class="stats-card storage-space">
              <div class="stats-card-content">
                <div class="stats-info">
                  <div class="stats-title">存储空间</div>
                  <div class="stats-value">{{ stats.storageUsed }}</div>
                  <div class="stats-trend">剩余 {{ stats.storageRemaining }}</div>
                </div>
                <div class="stats-icon storage-icon">
                  <icon-font type="icon-cunchudisk"/>
                </div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <n-grid :cols="12" :x-gap="16">
        <!-- 左侧导航 -->
        <n-grid-item span="3">
          <div class="left-sidebar">
            <!-- 文档分类 -->
            <n-card class="sidebar-card category-card" title="文档分类">
              <n-scrollbar style="max-height: 400px">
                <n-menu
                    :value="selectedCategory"
                    :options="categoryOptions"
                    @update:value="handleCategoryChange"
                />
              </n-scrollbar>
              <div class="add-category-btn">
                <n-button text type="primary" @click="showAddCategoryModal = true">
                  <template #icon>
                    <icon-font type="icon-xinzeng2"/>
                  </template>
                  添加新分类
                </n-button>
              </div>
            </n-card>

            <!-- 高级筛选 -->
            <n-card class="sidebar-card filter-card" title="高级筛选">
              <div class="filter-section">
                <div class="filter-title">文件类型</div>
                <n-space vertical size="small">
                  <n-checkbox v-model:checked="filters.types.markdown">Markdown (.md)</n-checkbox>
                  <n-checkbox v-model:checked="filters.types.pdf">PDF</n-checkbox>
                  <n-checkbox v-model:checked="filters.types.image">图片</n-checkbox>
                  <n-checkbox v-model:checked="filters.types.other">其他文档</n-checkbox>
                </n-space>
              </div>

              <div class="filter-section">
                <div class="filter-title">修改日期</div>
                <n-space vertical size="small">
                  <n-radio-group v-model:value="filters.dateRange">
                    <n-space vertical>
                      <n-radio value="all">所有时间</n-radio>
                      <n-radio value="today">今天</n-radio>
                      <n-radio value="week">最近一周</n-radio>
                      <n-radio value="month">最近一月</n-radio>
                      <n-radio value="custom">自定义</n-radio>
                    </n-space>
                  </n-radio-group>
                  <div v-if="filters.dateRange === 'custom'" class="custom-date-range">
                    <n-date-picker type="daterange" clearable/>
                  </div>
                </n-space>
              </div>

              <div class="filter-section">
                <div class="filter-title">标签</div>
                <div class="tag-container">
                  <n-tag
                      v-for="tag in selectedTags"
                      :key="tag"
                      :bordered="false"
                      type="primary"
                      closable
                      @close="removeTag(tag)"
                  >
                    {{ tag }}
                  </n-tag>
                  <n-button size="small" text @click="showTagInput = true" v-if="!showTagInput">
                    <template #icon>
                      <icon-font type="icon-tianjiabiaoqian"/>
                    </template>
                    添加标签
                  </n-button>
                  <div v-if="showTagInput" class="tag-input">
                    <n-input v-model:value="newTag" placeholder="输入标签" @keydown.enter="addTag" size="small">
                      <template #suffix>
                        <n-button size="tiny" text type="primary" @click="addTag">
                          添加
                        </n-button>
                      </template>
                    </n-input>
                  </div>
                </div>
              </div>

              <div class="filter-actions">
                <n-button block type="primary" @click="applyFilters">
                  <template #icon>
                    <icon-font type="icon-yingyong1"/>
                  </template>
                  应用筛选条件
                </n-button>
                <n-button block style="margin-top: 8px" @click="resetFilters">
                  <template #icon>
                    <icon-font type="icon-shuaxin"/>
                  </template>
                  重置筛选条件
                </n-button>
              </div>
            </n-card>
          </div>
        </n-grid-item>

        <!-- 右侧主内容区域 -->
        <n-grid-item span="9">
          <n-card class="main-content-card">
            <!-- 选项卡和视图控制 -->
            <div class="view-controls">
              <div class="tabs-container">
                <n-tabs
                    v-model:value="activeTab"
                    type="line"
                    size="medium"
                    animated
                >
                  <n-tab-pane name="all" tab="所有文档"/>
                  <n-tab-pane name="recent" tab="最近访问"/>
                  <n-tab-pane name="starred" tab="收藏文档"/>
                </n-tabs>
              </div>

              <div class="view-options">
                <n-space>
                  <!-- 排序选项 -->
                  <n-popselect
                      v-model:value="sortOption"
                      :options="sortOptions"
                      trigger="click"
                  >
                    <n-button tertiary round size="small">
                      <template #icon>
                        <icon-font type="icon-24gl-swapVertical3"/>
                      </template>
                      排序
                    </n-button>
                  </n-popselect>
                </n-space>
              </div>
            </div>

            <!-- 文档卡片 - 重新设计 -->
            <div class="document-grid">
              <n-empty v-if="displayedDocuments.length === 0" description="暂无符合条件的文档" />
              <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" v-else>
                <n-grid-item v-for="doc in displayedDocuments" :key="doc.id">
                  <div class="document-card" @click="openDocument(doc)">
                    <!-- 文档类型标识与收藏按钮 -->
                    <div class="document-card-header">
                      <div class="document-type-icon" :class="getDocumentClass(doc.type)">
                        <icon-font :type="getDocumentIcon(doc.type)" :size="20"/>
                      </div>
                      <div class="document-star" @click.stop="toggleStar(doc)">
                        <icon-font
                            :type="doc.starred ? 'icon-a-shoucang-yishoucang' : 'icon-shoucang'"
                            :size="18"
                            :color="doc.starred ? '#f59e0b' : '#d9d9d9'"
                        />
                      </div>
                    </div>

                    <!-- 文档信息 -->
                    <div class="document-card-body">
                      <div class="document-title" :title="doc.title">{{ doc.title }}</div>
                      <div class="document-description">
                        {{ doc.description.length > 80 ? doc.description.substring(0, 80) + '...' : doc.description }}
                      </div>
                    </div>

                    <!-- 标签区域 -->
                    <div class="document-tags">
                      <n-tag
                          v-if="doc.category"
                          size="small"
                          :color="getCategoryColor(doc.category)"
                          class="document-category-tag"
                      >
                        {{ doc.category }}
                      </n-tag>
                      <n-tag
                          v-for="tag in doc.tags.slice(0, 2)"
                          :key="tag"
                          size="small"
                          class="document-tag"
                      >
                        {{ tag }}
                      </n-tag>
                      <span v-if="doc.tags.length > 2" class="more-tags">+{{ doc.tags.length - 2 }}</span>
                    </div>

                    <!-- 文档元信息 -->
                    <div class="document-meta">
                      <div class="document-author">
                        {{ doc.createdBy }}
                      </div>
                      <div class="document-date">{{ doc.lastModified }}</div>
                    </div>

                    <!-- 文档底部统计与操作 -->
                    <div class="document-card-footer">
                      <div class="document-stats">
                        <span class="document-views">
                          <icon-font type="icon-a-yuedu1" :size="14" />
                          {{ doc.views }}
                        </span>
                        <span class="document-size">{{ doc.size }}</span>
                      </div>

                      <div class="document-actions">
                        <n-button quaternary circle size="small" @click.stop="editDocument(doc)" class="action-button">
                          <icon-font type="icon-icon_edit1" :size="16" />
                        </n-button>
                        <n-dropdown
                            trigger="click"
                            :options="getDocActionOptions(doc)"
                            @select="key => handleDropdownAction(key, doc)"
                        >
                          <n-button quaternary circle size="small" @click.stop class="action-button">
                            <icon-font type="icon-gengduo3" :size="16" />
                          </n-button>
                        </n-dropdown>
                      </div>
                    </div>
                  </div>
                </n-grid-item>
              </n-grid>
            </div>

            <!-- 分页控件 -->
            <div class="pagination-area">
              <n-pagination
                  v-model:page="currentPage"
                  :page-count="totalPages"
                  :page-slot="5"
                  show-size-picker
                  :page-sizes="[8, 12, 16, 20]"
                  v-model:page-size="pageSize"
                  size="medium"
              />
              <span class="pagination-info">
                显示 {{ displayRange.start }}-{{ displayRange.end }} 条，共 {{ totalDocuments }} 条
              </span>
            </div>
          </n-card>

          <!-- 文档预览卡片 -->
          <n-card v-if="selectedDocument" class="preview-card">
            <template #header>
              <div class="preview-header">
                <div class="preview-title">
                  <icon-font :type="getDocumentIcon(selectedDocument.type)" :size="22" />
                  <span>{{ selectedDocument.title }}</span>
                </div>
                <n-space>
                  <n-button size="small" type="primary" @click="openDocument(selectedDocument)">
                    查看全文
                  </n-button>
                  <n-button size="small" @click="selectedDocument = null">
                    关闭预览
                  </n-button>
                </n-space>
              </div>
            </template>

            <div class="preview-content">
              <n-skeleton v-if="previewLoading" :repeat="3" />
              <div v-else>
                <div class="preview-info">
                  <div class="preview-meta">
                    <n-tag :color="getCategoryColor(selectedDocument.category)">{{ selectedDocument.category }}</n-tag>
                    <span class="preview-date">修改于: {{ selectedDocument.lastModified }}</span>
                  </div>
                  <div class="preview-tags">
                    <n-tag
                        v-for="tag in selectedDocument.tags"
                        :key="tag"
                        size="small"
                        type="info"
                        :bordered="false"
                        style="margin-right: 8px;"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                </div>
                <div class="preview-description">
                  {{ selectedDocument.description }}
                </div>
                <div class="preview-actions">
                  <n-space justify="end">
                    <n-button size="small" @click="editDocument(selectedDocument)">
                      <template #icon><icon-font type="icon-icon_edit1" /></template>
                      编辑
                    </n-button>
                    <n-button size="small" @click="downloadDocument(selectedDocument)">
                      <template #icon><icon-font type="icon-xiazai2" /></template>
                      下载
                    </n-button>
                    <n-button size="small" @click="shareDocument(selectedDocument)">
                      <template #icon><icon-font type="icon-fenxiang2" /></template>
                      分享
                    </n-button>
                  </n-space>
                </div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 添加分类模态框 -->
    <n-modal v-model:show="showAddCategoryModal" preset="card" title="添加新分类" size="small">
      <n-form :model="newCategoryForm" label-placement="left" label-width="80">
        <n-form-item label="分类名称" path="name">
          <n-input v-model:value="newCategoryForm.name" placeholder="请输入分类名称" />
        </n-form-item>
        <n-form-item label="图标" path="icon">
          <n-select v-model:value="newCategoryForm.icon" :options="iconOptions" placeholder="选择图标" />
        </n-form-item>
        <n-form-item label="颜色" path="color">
          <n-color-picker v-model:value="newCategoryForm.color" />
        </n-form-item>
      </n-form>
      <div style="display: flex; justify-content: flex-end">
        <n-space>
          <n-button @click="showAddCategoryModal = false">取消</n-button>
          <n-button type="primary" @click="addNewCategory">确定</n-button>
        </n-space>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import {ref, computed, reactive, watch, onMounted, h} from 'vue'
import {useRoute, useRouter} from 'vue-router';
import IconFont from "@/components/common/IconFont.vue";

const route = useRoute();
const router = useRouter();

// 搜索和筛选
const searchQuery = ref('');
const selectedCategory = ref('all');
const activeTab = ref('all');
const currentPage = ref(1);
const pageSize = ref(12); // 默认每页显示12个文档
const sortOption = ref('recent');
const selectedDocument = ref(null);
const previewLoading = ref(false);

// 显示控制
const showAddCategoryModal = ref(false);
const showTagInput = ref(false);

// 新分类表单
const newCategoryForm = reactive({
  name: '',
  icon: '',
  color: '#6366f1'
});

// 图标选项
const iconOptions = [
  { label: '文件夹', value: 'icon-wendangwenjian' },
  { label: 'Java', value: 'icon-java' },
  { label: 'Spring', value: 'icon-spring' },
  { label: 'MySQL', value: 'icon-mysql' },
  { label: 'Redis', value: 'icon-redis' },
  { label: '消息队列', value: 'icon-mqxiaoxiduilieMQ' },
  { label: '前端', value: 'icon-html' },
  { label: '工具', value: 'icon-tools' }
];

// 去上传文件页面
const goToUploadPage = () => {
  router.push({name : 'UploadDocument'});
};

// 去新建文章页面
const goToEditorPage = () =>{
  router.push({ name: 'CreateDocument' });
};

// 筛选条件
const filters = reactive({
  types: {
    markdown: true,
    pdf: true,
    image: false,
    other: false
  },
  dateRange: 'all',
  customDateRange: null
});

// 标签管理
const selectedTags = ref(['Java', 'Spring', '并发编程']);
const newTag = ref('');

// 统计数据
const stats = reactive({
  totalDocs: 127,
  totalDocsGrowth: 12,
  markdownDocs: 83,
  markdownDocsGrowth: 8,
  pdfDocs: 38,
  pdfDocsGrowth: 4,
  storageUsed: '346 MB',
  storageRemaining: '4.7 GB'
});

// 文档数据
const documents = ref([
  {
    id: 1,
    title: 'SpringBoot 核心原理解析',
    description: 'SpringBoot 自动配置、starter 机制、条件注解等核心特性的深入剖析。',
    type: 'markdown',
    category: 'Java',
    lastModified: '今天 14:30',
    starred: false,
    tags: ['SpringBoot', '源码分析'],
    size: '256 KB',
    createdBy: '张三',
    views: 128
  },
  {
    id: 2,
    title: 'RabbitMQ高级特性与实战',
    description: '本指南详细介绍了 RabbitMQ 的高级特性，包括消息可靠性保证、死信队列、延迟队列等实现方案。',
    type: 'pdf',
    category: 'Java',
    lastModified: '昨天',
    starred: true,
    tags: ['RabbitMQ', '消息队列'],
    size: '1.4 MB',
    createdBy: '李四',
    views: 89
  },
  {
    id: 3,
    title: 'MySQL 索引优化技巧',
    description: '详细介绍了 MySQL 的各种索引类型及其适用场景，索引设计原则，以及常见的索引优化方法。',
    type: 'markdown',
    category: 'Java',
    lastModified: '2天前',
    starred: false,
    tags: ['MySQL', '性能优化'],
    size: '190 KB',
    createdBy: '王五',
    views: 245
  },
  {
    id: 4,
    title: 'Java 并发编程实战笔记',
    description: '《Java 并发编程实战》一书的学习笔记，包含线程安全性、对象共享、组合对象等重要内容。',
    type: 'markdown',
    category: 'Java',
    lastModified: '3天前',
    starred: false,
    tags: ['Java', '并发编程'],
    size: '320 KB',
    createdBy: '赵六',
    views: 178
  },
  {
    id: 5,
    title: 'Redis设计与实现',
    description: '本书系统而全面地讲解了 Redis 的内部运行机制，对 Redis 的数据结构、对象系统、内存管理、持久化等进行了深入分析。',
    type: 'pdf',
    category: 'Redis',
    lastModified: '上周',
    starred: false,
    tags: ['Redis', '源码分析'],
    size: '2.8 MB',
    createdBy: '张三',
    views: 315
  },
  {
    id: 6,
    title: 'MyBatis 源码分析',
    description: '深入剖析 MyBatis 源代码，详细讲解了 MyBatis 的核心组件、SQL 解析、动态 SQL、插件机制等技术实现原理。',
    type: 'markdown',
    category: 'MyBatis',
    lastModified: '上周',
    starred: false,
    tags: ['MyBatis', '源码分析'],
    size: '280 KB',
    createdBy: '李四',
    views: 156
  },
  {
    id: 7,
    title: 'Java 虚拟机深度剖析',
    description: '探索JVM内部工作原理，包括类加载机制、垃圾回收算法、JIT编译优化和性能调优技巧。',
    type: 'markdown',
    category: 'Java',
    lastModified: '2周前',
    starred: true,
    tags: ['Java', 'JVM'],
    size: '450 KB',
    createdBy: '王五',
    views: 423
  },
  {
    id: 8,
    title: 'Spring Security 权限管理',
    description: '深入讲解Spring Security框架的认证与授权机制，包括自定义认证、动态权限控制等高级应用。',
    type: 'markdown',
    category: 'Spring',
    lastModified: '2周前',
    starred: false,
    tags: ['Spring', '安全'],
    size: '310 KB',
    createdBy: '赵六',
    views: 187
  },
  {
    id: 9,
    title: 'Docker 容器化部署实践',
    description: '从入门到精通的Docker实践指南，包括镜像构建、容器编排、多服务部署等核心内容。',
    type: 'pdf',
    category: 'DevOps',
    lastModified: '3周前',
    starred: false,
    tags: ['Docker', 'DevOps'],
    size: '3.2 MB',
    createdBy: '张三',
    views: 276
  },
  {
    id: 10,
    title: 'Elasticsearch 全文检索与聚合查询',
    description: '详细介绍Elasticsearch的索引设计、查询优化、分词器配置、复杂聚合分析以及与Spring Boot的集成方案。',
    type: 'markdown',
    category: 'ElasticStack',
    lastModified: '1天前',
    starred: true,
    tags: ['ElasticSearch', '全文检索', '数据分析'],
    size: '380 KB',
    createdBy: '李四',
    views: 219
  }
]);

// 分类选项
const categoryOptions = [
  {
    label: '全部文档',
    key: 'all',
    icon: () => h(IconFont, {type: 'icon-wendang'}),
    extra: `${stats.totalDocs}`
  },
  {
    label: 'Java 基础',
    key: 'java-basic',
    icon: () => h(IconFont, {type: 'icon-java'}),
    extra: '24'
  },
  {
    label: 'Java 高级',
    key: 'java-advanced',
    icon: () => h(IconFont, {type: 'icon-java'}),
    extra: '18'
  },
  {
    label: 'Spring',
    key: 'spring',
    icon: () => h(IconFont, {type: 'icon-spring'}),
    extra: '15'
  },
  {
    label: 'SpringBoot',
    key: 'springboot',
    icon: () => h(IconFont, {type: 'icon-springboot'}),
    extra: '22'
  },
  {
    label: 'MySQL',
    key: 'mysql',
    icon: () => h(IconFont, {type: 'icon-mysql'}),
    extra: '12'
  },
  {
    label: 'Redis',
    key: 'redis',
    icon: () => h(IconFont, {type: 'icon-redis'}),
    extra: '9'
  },
  {
    label: 'RocketMQ',
    key: 'rocketmq',
    icon: () => h(IconFont, {type: 'icon-mqxiaoxiduilieMQ'}),
    extra: '7'
  },
  {
    label: 'RabbitMQ',
    key: 'rabbitmq',
    icon: () => h(IconFont, {type: 'icon-alikafkaxiaoxiduilieKafka'}),
    extra: '5'
  },
  {
    label: '其他',
    key: 'other',
    icon: () => h(IconFont, {type: 'icon-wendangwenjian'}),
    extra: '15'
  }
];

// 获取文档操作选项
function getDocActionOptions(doc) {
  return [
    {
      label: '下载',
      key: 'download',
      icon: () => h(IconFont, {type: 'icon-xiazai2'})
    },
    {
      label: '分享',
      key: 'share',
      icon: () => h(IconFont, {type: 'icon-fenxiang2'})
    },
    {
      label: doc.starred ? '取消收藏' : '收藏',
      key: 'star',
      icon: () => h(IconFont, {type: doc.starred ? 'icon-a-shoucang-yishoucang' : 'icon-shoucang'})
    },
    {
      label: '删除',
      key: 'delete',
      icon: () => h(IconFont, {type: 'icon-shanchu1'})
    }
  ];
}

// 下拉选择选项
const categorySelectOptions = categoryOptions
    .filter(item => item.key !== 'all')
    .map(item => ({
      label: item.label,
      value: item.key
    }));

// 排序选项
const sortOptions = [
  {label: '最近修改', value: 'recent'},
  {label: '名称 A-Z', value: 'name-asc'},
  {label: '名称 Z-A', value: 'name-desc'},
  {label: '创建时间', value: 'created'},
  {label: '文件大小', value: 'size'},
  {label: '阅读量', value: 'views-desc'}
];

// 更多操作选项
const moreOptions = [
  {
    label: '导入文档',
    key: 'import',
    icon: () => h(IconFont, {type: 'icon-daoru'})
  },
  {
    label: '导出所选',
    key: 'export',
    icon: () => h(IconFont, {type: 'icon-daochu'})
  },
  {
    label: '批量操作',
    key: 'batch',
    icon: () => h(IconFont, {type: 'icon-piliang'})
  },
  {
    label: '回收站',
    key: 'trash',
    icon: () => h(IconFont, {type: 'icon-lajixiang'})
  }
];

// 计算属性 - 所有筛选后的文档
const filteredDocuments = computed(() => {
  let result = [...documents.value];

  // 应用搜索条件
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query)
    );
  }

  // 应用分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(doc => {
      const category = doc.category.toLowerCase().replace(/\s+/g, '-');
      return category === selectedCategory.value.toLowerCase();
    });
  }

  // 应用标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter(doc =>
        doc.tags.some(tag => selectedTags.value.includes(tag))
    );
  }

  // 应用标签页筛选
  if (activeTab.value === 'recent') {
    // 假设最近文档是最近修改的前5个
    const recentIds = [1, 2, 3, 4, 5]; // 这里应该从实际的访问记录中获取
    result = result.filter(doc => recentIds.includes(doc.id));
  } else if (activeTab.value === 'starred') {
    result = result.filter(doc => doc.starred);
  }

  // 应用文件类型筛选
  if (!filters.types.markdown || !filters.types.pdf || !filters.types.image || !filters.types.other) {
    result = result.filter(doc => {
      if (doc.type === 'markdown') return filters.types.markdown;
      if (doc.type === 'pdf') return filters.types.pdf;
      if (doc.type === 'image') return filters.types.image;
      return filters.types.other;
    });
  }

  // 应用日期范围筛选
  if (filters.dateRange !== 'all') {
    const now = new Date();
    let compareDate = new Date();

    if (filters.dateRange === 'today') {
      compareDate.setHours(0, 0, 0, 0);
    } else if (filters.dateRange === 'week') {
      compareDate.setDate(now.getDate() - 7);
    } else if (filters.dateRange === 'month') {
      compareDate.setMonth(now.getMonth() - 1);
    }

    result = result.filter(doc => {
      // 这里应该有实际日期比较逻辑，但因为我们的示例数据是字符串,
      // 所以我们用一些启发式方法来模拟
      const lastModified = doc.lastModified;
      if (filters.dateRange === 'today' && lastModified.includes('今天')) return true;
      if (filters.dateRange === 'week' && (
          lastModified.includes('今天') ||
          lastModified.includes('昨天') ||
          lastModified.includes('天前') && parseInt(lastModified) < 7
      )) return true;
      if (filters.dateRange === 'month' && !lastModified.includes('周前')) return true;

      return false;
    });
  }

  // 应用排序
  if (sortOption.value === 'name-asc') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption.value === 'name-desc') {
    result.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortOption.value === 'views-desc') {
    result.sort((a, b) => b.views - a.views);
  } else if (sortOption.value === 'size') {
    // 这里假设size字段是字符串，如"256 KB"
    // 实际实现应该转换为字节数进行比较
    result.sort((a, b) => {
      const aValue = parseFileSize(a.size);
      const bValue = parseFileSize(b.size);
      return bValue - aValue;
    });
  }

  return result;
});

// 解析文件大小的辅助函数
function parseFileSize(sizeStr) {
  if (!sizeStr) return 0;
  const value = parseFloat(sizeStr);
  if (sizeStr.includes('KB')) return value * 1024;
  if (sizeStr.includes('MB')) return value * 1024 * 1024;
  if (sizeStr.includes('GB')) return value * 1024 * 1024 * 1024;
  return value;
}

// 当前显示的文档（带分页）
const displayedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  // 设置分页信息
  displayRange.start = start + 1;
  displayRange.end = Math.min(end, filteredDocuments.value.length);

  return filteredDocuments.value.slice(start, end);
});

// 分页相关计算
const totalDocuments = computed(() => filteredDocuments.value.length);
const totalPages = computed(() => Math.ceil(totalDocuments.value / pageSize.value));
const displayRange = reactive({
  start: 1,
  end: Math.min(pageSize.value, totalDocuments.value)
});

// 获取文档图标
function getDocumentIcon(type) {
  switch (type) {
    case 'markdown':
      return 'icon-a-IconMarkDown';
    case 'pdf':
      return 'icon-icon_pdf1';
    case 'image':
      return 'icon-tupian';
    default:
      return 'icon-icon_wendang1';
  }
}

// 获取文档类名
function getDocumentClass(type) {
  switch (type) {
    case 'markdown':
      return 'markdown-doc';
    case 'pdf':
      return 'pdf-doc';
    case 'image':
      return 'image-doc';
    default:
      return 'default-doc';
  }
}

// 获取分类颜色
function getCategoryColor(category) {
  const colorMap = {
    'Java': {color: '#1E88E5', textColor: '#fff'},
    'Spring': {color: '#4CAF50', textColor: '#fff'},
    'SpringBoot': {color: '#43A047', textColor: '#fff'},
    'MySQL': {color: '#0D47A1', textColor: '#fff'},
    'Redis': {color: '#E53935', textColor: '#fff'},
    'RabbitMQ': {color: '#FB8C00', textColor: '#fff'},
    'RocketMQ': {color: '#F4511E', textColor: '#fff'},
    'MyBatis': {color: '#6D4C41', textColor: '#fff'},
    'DevOps': {color: '#5C6BC0', textColor: '#fff'},
    'ElasticStack': {color: '#26A69A', textColor: '#fff'},
    '前端': {color: '#8E24AA', textColor: '#fff'},
    'NoSQL': {color: '#00897B', textColor: '#fff'},
    '工具': {color: '#546E7A', textColor: '#fff'}
  };

  return colorMap[category] || {color: '#9E9E9E', textColor: '#fff'};
}

// 处理下拉菜单操作
function handleDropdownAction(key, row) {
  switch (key) {
    case 'download':
      downloadDocument(row);
      break;
    case 'share':
      shareDocument(row);
      break;
    case 'star':
      toggleStar(row);
      break;
    case 'delete':
      deleteDocument(row);
      break;
  }
}

// 标签操作
function addTag() {
  if (newTag.value && !selectedTags.value.includes(newTag.value)) {
    selectedTags.value.push(newTag.value);
    newTag.value = '';
  }
  showTagInput.value = false;
}

function removeTag(tag) {
  const index = selectedTags.value.indexOf(tag);
  if (index !== -1) {
    selectedTags.value.splice(index, 1);
  }
}

// 筛选操作
function applyFilters() {
  console.log('应用筛选条件:', filters);
  // 筛选逻辑已经在 computed 中实现
  currentPage.value = 1; // 重置到第一页
}

function resetFilters() {
  filters.types.markdown = true;
  filters.types.pdf = true;
  filters.types.image = false;
  filters.types.other = false;
  filters.dateRange = 'all';
  filters.customDateRange = null;
  selectedTags.value = [];
  currentPage.value = 1; // 重置到第一页
}

// 分类操作
function handleCategoryChange(key) {
  selectedCategory.value = key;
  currentPage.value = 1; // 重置到第一页
}

// 添加新分类
function addNewCategory() {
  // 实际实现应该添加到categoryOptions中
  console.log('添加新分类:', newCategoryForm);
  showAddCategoryModal.value = false;

  // 重置表单
  newCategoryForm.name = '';
  newCategoryForm.icon = '';
  newCategoryForm.color = '#6366f1';
}

// 预览文档
function previewDocument(doc) {
  previewLoading.value = true;
  selectedDocument.value = doc;

  // 模拟加载
  setTimeout(() => {
    previewLoading.value = false;
  }, 500);
}

// 文档操作
function openDocument(doc) {
  console.log('打开文档:', doc.title);
  // 实际应该导航到文档查看页面
  router.push({name: 'ViewDocument', params: {id: doc.id}});
}

function editDocument(doc) {
  console.log('编辑文档:', doc.title);
  router.push({name: 'EditDocument', params: {id: doc.id}});
}

function toggleStar(doc) {
  doc.starred = !doc.starred;
  console.log(doc.starred ? '添加星标:' : '移除星标:', doc.title);
}

function shareDocument(doc) {
  console.log('分享文档:', doc.title);
  // 实际实现应该打开分享对话框
}

function downloadDocument(doc) {
  console.log('下载文档:', doc.title);
  // 实际实现应该触发下载操作
}

function deleteDocument(doc) {
  console.log('删除文档:', doc.title);
  // 实际实现应该弹出确认对话框，然后从列表中移除
}

// 监听路由参数变化，自动选择相应的分类
watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    selectedCategory.value = newCategory.toString();
    currentPage.value = 1; // 重置分页
  }
});

// 在组件挂载时检查URL参数
onMounted(() => {
  if (route.query.category) {
    selectedCategory.value = route.query.category.toString();
  }
});
</script>

<style scoped>
/* 基础样式 */
.documents-page {
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
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
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

.header-right {
  min-width: 460px;
}

.search-and-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 统计卡片区域 */
.stats-card-area {
  margin-top: 20px;
}

.stats-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--box-shadow-1);
  border: none;
}

.stats-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-2);
}

.all-documents {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: white;
}

.markdown-documents {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.pdf-documents {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
}

.storage-space {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.stats-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-info {
  flex: 1;
}

.stats-title {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}

.stats-trend {
  font-size: 12px;
  opacity: 0.8;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  font-size: 24px;
}

/* 内容区样式 */
.content-container {
  margin-top: 16px;
}

.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  border-radius: 12px;
  box-shadow: var(--box-shadow-1);
  background-color: white;
}

.add-category-btn {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 16px;
}

.filter-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color-base, #333);
}

.filter-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.main-content-card {
  border-radius: 12px;
  box-shadow: var(--box-shadow-1);
  margin-bottom: 16px;
  background-color: white;
  padding-bottom: 16px;
}

/* 视图控制区 */
.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tabs-container {
  flex: 1;
}

.view-options {
  display: flex;
  align-items: center;
}

/* 文档卡片样式 - 全新设计 */
.document-grid {
  margin-bottom: 20px;
  min-height: 300px;
}

/* 新的卡片样式 */
.document-card {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #e0e0e0;
}

/* 文档卡片头部 */
.document-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
}

.document-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.document-star {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.document-star:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 文档卡片主体 */
.document-card-body {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.document-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.document-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 文档标签区域 */
.document-tags {
  padding: 0 16px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.document-category-tag {
  font-weight: 500;
}

.document-tag {
  background-color: #f0f0f0;
  color: #666;
}

.more-tags {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  padding: 2px 8px;
}

/* 文档元信息区域 */
.document-meta {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #888;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.document-author {
  font-weight: 500;
}

/* 文档底部 */
.document-card-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  background-color: #f5f5f5;
}

.document-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.document-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.document-actions {
  display: flex;
  gap: 4px;
}

.action-button {
  color: #666;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.08);
  color: #333;
}

/* 类型特定样式 */
.markdown-doc {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.pdf-doc {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.image-doc {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

/* 预览卡片样式 */
.preview-card {
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: var(--box-shadow-1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.preview-content {
  min-height: 150px;
}

.preview-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-date {
  color: var(--text-color-tertiary);
  font-size: 13px;
}

.preview-description {
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.preview-actions {
  margin-top: 16px;
}

/* 分页区域 */
.pagination-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 8px;
}

.pagination-info {
  font-size: 13px;
  color: var(--text-color-tertiary, #999);
}

/* 适配不同屏幕尺寸 */
@media (max-width: 1440px) {
  .documents-page {
    padding: 12px;
  }

  .header-card {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .documents-page {
    padding: 8px;
  }

  .header-card {
    padding: 16px;
  }

  .stats-value {
    font-size: 20px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>