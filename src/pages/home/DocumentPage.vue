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
            <!-- 选项卡 -->
            <div class="view-controls">
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

              <div class="view-options">
                <n-space>
                  <n-popselect
                      v-model:value="sortOption"
                      :options="sortOptions"
                      trigger="click"
                  >
                    <n-button tertiary round>
                      <icon-font type="icon-24gl-swapVertical3"/>
                      排序
                    </n-button>
                  </n-popselect>
                </n-space>
              </div>
            </div>

            <!-- 文档网格视图 -->
            <div class="document-grid">
              <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen">
                <n-grid-item v-for="doc in displayedDocuments" :key="doc.id">
                  <n-card class="document-card" hoverable @click="openDocument(doc)">
                    <div class="document-card-header">
                      <div class="document-icon-container" :class="getDocumentClass(doc.type)">
                        <icon-font :type="getDocumentIcon(doc.type)" :size="25"/>
                      </div>
                      <div class="document-title-container">
                        <div class="document-title">{{ doc.title }}</div>
                        <div class="document-description">{{ doc.description }}</div>
                      </div>
                    </div>

                    <div class="document-card-meta">
                      <div class="document-tags">
                        <n-tag
                            v-if="doc.category"
                            size="small"
                            :color="getCategoryColor(doc.category)"
                            :bordered="false"
                        >
                          {{ doc.category }}
                        </n-tag>
                      </div>
                      <div class="document-time">
                        {{ doc.lastModified }}
                      </div>
                    </div>

                    <div class="document-card-footer">
                      <div class="document-actions">
                        <n-button
                            quaternary
                            circle
                            size="small"
                            @click.stop="editDocument(doc)"
                        >
                          <icon-font type="icon-icon_edit1"/>
                        </n-button>
                        <n-button
                            quaternary
                            circle
                            size="small"
                            @click.stop="commentDocument(doc)"
                        >
                          <icon-font type="icon-xiaoxi"/>
                        </n-button>
                      </div>
                      <div class="document-actions">
                        <n-button
                            quaternary
                            circle
                            size="small"
                            @click.stop="toggleStar(doc)"
                            :class="{ 'active-star': doc.starred }"
                        >
                          <icon-font :type="doc.starred ? 'icon-a-shoucang-yishoucang' : 'icon-shoucang'"/>
                        </n-button>
                        <n-button
                            quaternary
                            circle
                            size="small"
                            @click.stop="shareDocument(doc)"
                        >
                          <icon-font type="icon-fenxiang2"/>
                        </n-button>
                        <n-popover trigger="click" placement="bottom">
                          <template #trigger>
                            <n-button
                                quaternary
                                circle
                                size="small"
                                @click.stop
                            >
                              <icon-font type="icon-gengduo3"/>
                            </n-button>
                          </template>
                          <n-space vertical>
                            <n-button text @click="downloadDocument(doc)">
                              <template #icon>
                                <icon-font type="icon-xiazai2"/>
                              </template>
                              下载
                            </n-button>
                            <n-button text @click="duplicateDocument(doc)">
                              <template #icon>
                                <icon-font type="icon-fuzhi1"/>
                              </template>
                              复制
                            </n-button>
                            <n-button text type="error" @click="deleteDocument(doc)">
                              <template #icon>
                                <icon-font type="icon-shanchu1"/>
                              </template>
                              删除
                            </n-button>
                          </n-space>
                        </n-popover>
                      </div>
                    </div>
                  </n-card>
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
                  :page-sizes="[6, 9, 12, 15]"
                  v-model:page-size="pageSize"
                  size="medium"
              />
              <span class="pagination-info">
                显示 {{ displayRange.start }}-{{ displayRange.end }} 条，共 {{ totalDocuments }} 条
              </span>
            </div>
          </n-card>

          <!-- 最近访问记录 -->
          <n-card title="最近访问" class="recent-visits-card">
            <template #header-extra>
              <n-button text type="primary" size="small">
                查看全部
                <template #icon>
                  <icon-font type="icon-chakanquanburenyuan"/>
                </template>
              </n-button>
            </template>

            <n-data-table
                :columns="recentColumns"
                :data="recentVisits"
                :pagination="recentPagination"
                :bordered="false"
            />
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, reactive, watch, onMounted, h} from 'vue'
import {useRoute, useRouter} from 'vue-router';
import IconFont from "@/components/common/IconFont.vue";

const route = useRoute();
const router = useRouter()

// 搜索和筛选
const searchQuery = ref('')
const selectedCategory = ref('all')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(9) // 默认每页显示9个文档
const sortOption = ref('recent')

// 显示控制
const showAddCategoryModal = ref(false)
const showTagInput = ref(false)

// 去上传文件页面
const goToUploadPage = () => {
  router.push({name : 'UploadDocument'})
}

// 去新建文章页面
const goToEditorPage = () =>{
  router.push({ name: 'CreateDocument' })
}

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
})

// 标签管理
const selectedTags = ref(['Java', 'Spring', '并发编程'])
const newTag = ref('')

// 新建文档表单
const newDocForm = reactive({
  title: '',
  category: null,
  tags: [],
  template: 'blank'
})

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
})

// 文档数据 - 增加了更多示例文档
const documents = ref([
  {
    id: 1,
    title: 'SpringBoot 核心原理解析',
    description: 'SpringBoot 自动配置、starter 机制、条件注解等核心特性的深入剖析。',
    type: 'markdown',
    category: 'SpringBoot',
    lastModified: '今天 14:30',
    starred: false,
    tags: ['SpringBoot', '源码分析']
  },
  {
    id: 2,
    title: 'RabbitMQ高级特性与实战',
    description: '本指南详细介绍了 RabbitMQ 的高级特性，包括消息可靠性保证、死信队列、延迟队列等实现方案。',
    type: 'pdf',
    category: 'RabbitMQ',
    lastModified: '昨天',
    starred: true,
    tags: ['RabbitMQ', '消息队列']
  },
  {
    id: 3,
    title: 'MySQL 索引优化技巧',
    description: '详细介绍了 MySQL 的各种索引类型及其适用场景，索引设计原则，以及常见的索引优化方法。',
    type: 'markdown',
    category: 'MySQL',
    lastModified: '2天前',
    starred: false,
    tags: ['MySQL', '性能优化']
  },
  {
    id: 4,
    title: 'Java 并发编程实战笔记',
    description: '《Java 并发编程实战》一书的学习笔记，包含线程安全性、对象共享、组合对象等重要内容。',
    type: 'markdown',
    category: 'Java',
    lastModified: '3天前',
    starred: false,
    tags: ['Java', '并发编程']
  },
  {
    id: 5,
    title: 'Redis设计与实现',
    description: '本书系统而全面地讲解了 Redis 的内部运行机制，对 Redis 的数据结构、对象系统、内存管理、持久化等进行了深入分析。',
    type: 'pdf',
    category: 'Redis',
    lastModified: '上周',
    starred: false,
    tags: ['Redis', '源码分析']
  },
  {
    id: 6,
    title: 'MyBatis 源码分析',
    description: '深入剖析 MyBatis 源代码，详细讲解了 MyBatis 的核心组件、SQL 解析、动态 SQL、插件机制等技术实现原理。',
    type: 'markdown',
    category: 'MyBatis',
    lastModified: '上周',
    starred: false,
    tags: ['MyBatis', '源码分析']
  },
  {
    id: 7,
    title: 'Java 虚拟机深度剖析',
    description: '探索JVM内部工作原理，包括类加载机制、垃圾回收算法、JIT编译优化和性能调优技巧。',
    type: 'markdown',
    category: 'Java',
    lastModified: '2周前',
    starred: true,
    tags: ['Java', 'JVM']
  },
  {
    id: 8,
    title: 'Spring Security 权限管理',
    description: '深入讲解Spring Security框架的认证与授权机制，包括自定义认证、动态权限控制等高级应用。',
    type: 'markdown',
    category: 'Spring',
    lastModified: '2周前',
    starred: false,
    tags: ['Spring', '安全']
  },
  {
    id: 9,
    title: 'Docker 容器化部署实践',
    description: '从入门到精通的Docker实践指南，包括镜像构建、容器编排、多服务部署等核心内容。',
    type: 'pdf',
    category: 'DevOps',
    lastModified: '3周前',
    starred: false,
    tags: ['Docker', 'DevOps']
  },
  {
    id: 10,
    title: 'Kubernetes入门与实践',
    description: 'K8s核心概念及实战应用，包括Pod编排、服务发现、配置管理、持久化存储等关键功能。',
    type: 'markdown',
    category: 'DevOps',
    lastModified: '1个月前',
    starred: false,
    tags: ['Kubernetes', '容器编排']
  },
  {
    id: 11,
    title: 'Elasticsearch 搜索引擎优化',
    description: '全文检索、复杂聚合查询、分词器配置、性能调优等Elasticsearch高级应用实践。',
    type: 'pdf',
    category: 'ElasticStack',
    lastModified: '1个月前',
    starred: true,
    tags: ['搜索引擎', 'ELK']
  },
  {
    id: 12,
    title: 'React Hooks 最佳实践',
    description: '函数式组件与Hooks的深入应用，包括自定义Hooks、性能优化、状态管理等前端开发技巧。',
    type: 'markdown',
    category: '前端',
    lastModified: '1个月前',
    starred: false,
    tags: ['React', '前端框架']
  },
  {
    id: 13,
    title: 'Vue3 组合式API详解',
    description: 'Vue3新特性与组合式API的实战指南，包括响应式系统原理、生命周期钩子、性能优化等核心内容。',
    type: 'markdown',
    category: '前端',
    lastModified: '2个月前',
    starred: true,
    tags: ['Vue', '前端框架']
  },
  {
    id: 14,
    title: 'MongoDB高级查询与聚合',
    description: '深入学习MongoDB的高级查询技术，聚合管道、事务处理、分片集群等NoSQL数据库核心应用。',
    type: 'pdf',
    category: 'NoSQL',
    lastModified: '2个月前',
    starred: false,
    tags: ['MongoDB', '数据库']
  },
  {
    id: 15,
    title: 'Git工作流与团队协作',
    description: '企业级Git分支管理策略、高效团队协作流程、版本控制最佳实践指南。',
    type: 'markdown',
    category: '工具',
    lastModified: '2个月前',
    starred: false,
    tags: ['Git', '版本控制']
  },
])

// 最近访问记录
const recentVisits = ref([
  {
    id: 1,
    title: 'SpringBoot 核心原理解析',
    category: 'SpringBoot',
    type: 'Markdown',
    visitTime: '今天 10:45'
  },
  {
    id: 2,
    title: 'RabbitMQ高级特性与实战.pdf',
    category: 'RabbitMQ',
    type: 'PDF',
    visitTime: '昨天 15:30'
  },
  {
    id: 3,
    title: 'MySQL 索引优化技巧',
    category: 'MySQL',
    type: 'Markdown',
    visitTime: '2天前'
  }
])

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
]

// 下拉选择选项
const categorySelectOptions = categoryOptions
    .filter(item => item.key !== 'all')
    .map(item => ({
      label: item.label,
      value: item.key
    }))

// 排序选项
const sortOptions = [
  {label: '最近修改', value: 'recent'},
  {label: '名称 A-Z', value: 'name-asc'},
  {label: '名称 Z-A', value: 'name-desc'},
  {label: '创建时间', value: 'created'},
  {label: '文件大小', value: 'size'}
]

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
]

// 最近访问表格列
const recentColumns = [
  {
    title: '文档名称',
    key: 'title',
    render(row) {
      let iconType
      if (row.type === 'Markdown') {
        iconType = 'icon-a-IconMarkDown'
      } else if (row.type === 'PDF') {
        iconType = 'icon-icon_pdf1'
      } else {
        iconType = 'icon-icon_wendang1'
      }

      return h('div', {class: 'recent-file-cell'}, [
        h('div', {class: 'recent-file-icon'}, [
          h(IconFont, {type: iconType,size:20})
        ]),
        h('span', row.title)
      ])
    }
  },
  {
    title: '分类',
    key: 'category',
    render(row) {
      return h('n-tag', {
        size: 'small',
        color: getCategoryColor(row.category)
      }, {default: () => row.category})
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 100
  },
  {
    title: '访问时间',
    key: 'visitTime',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h('div', {class: 'recent-actions-cell'}, [
        h('n-button', {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => {
            viewDocument(row)
          }
        }, '查看'),
        h('span', {style: 'margin: 0 4px;color: #ddd'}, '|'),
        h('n-button', {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => row.type === 'Markdown' ? editDocument(row) : downloadDocument(row)
        }, row.type === 'Markdown' ? '编辑' : '下载')
      ])
    }
  }
]

// 最近访问表格分页
const recentPagination = {
  pageSize: 3,
  simple: true,
  page: 1
}

// 计算属性 - 所有筛选后的文档
const filteredDocuments = computed(() => {
  let result = [...documents.value]

  // 应用搜索条件
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query)
    )
  }

  // 应用分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(doc => {
      const category = doc.category.toLowerCase().replace(/\s+/g, '-')
      return category === selectedCategory.value.toLowerCase()
    })
  }

  // 应用标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter(doc =>
        doc.tags.some(tag => selectedTags.value.includes(tag))
    )
  }

  // 应用文件类型筛选
  if (!filters.types.markdown || !filters.types.pdf || !filters.types.image || !filters.types.other) {
    result = result.filter(doc => {
      if (doc.type === 'markdown') return filters.types.markdown
      if (doc.type === 'pdf') return filters.types.pdf
      if (doc.type === 'image') return filters.types.image
      return filters.types.other
    })
  }

  // 应用日期范围筛选
  if (filters.dateRange !== 'all') {
    const now = new Date()
    let compareDate = new Date()

    if (filters.dateRange === 'today') {
      compareDate.setHours(0, 0, 0, 0)
    } else if (filters.dateRange === 'week') {
      compareDate.setDate(now.getDate() - 7)
    } else if (filters.dateRange === 'month') {
      compareDate.setMonth(now.getMonth() - 1)
    }

    result = result.filter(doc => {
      // 这里应该有实际日期比较逻辑，但因为我们的示例数据是字符串,
      // 所以我们用一些启发式方法来模拟
      const lastModified = doc.lastModified
      if (filters.dateRange === 'today' && lastModified.includes('今天')) return true
      if (filters.dateRange === 'week' && (
          lastModified.includes('今天') ||
          lastModified.includes('昨天') ||
          lastModified.includes('天前') && parseInt(lastModified) < 7
      )) return true
      if (filters.dateRange === 'month' && !lastModified.includes('周前')) return true

      return false
    })
  }

  // 应用排序
  if (sortOption.value === 'name-asc') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortOption.value === 'name-desc') {
    result.sort((a, b) => b.title.localeCompare(a.title))
  }

  return result
})

// 当前显示的文档（带分页）
const displayedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  // 设置分页信息
  displayRange.start = start + 1
  displayRange.end = Math.min(end, filteredDocuments.value.length)

  return filteredDocuments.value.slice(start, end)
})

// 分页相关计算
const totalDocuments = computed(() => filteredDocuments.value.length)
const totalPages = computed(() => Math.ceil(totalDocuments.value / pageSize.value))
const displayRange = reactive({
  start: 1,
  end: Math.min(pageSize.value, totalDocuments.value)
})

// 获取文档图标
function getDocumentIcon(type) {
  switch (type) {
    case 'markdown':
      return 'icon-a-IconMarkDown'
    case 'pdf':
      return 'icon-icon_pdf1'
    default:
      return 'icon-icon_wendang1'
  }
}

// 获取文档类名
function getDocumentClass(type) {
  switch (type) {
    case 'markdown':
      return 'markdown-doc'
    case 'pdf':
      return 'pdf-doc'
    default:
      return 'default-doc'
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
  }

  return colorMap[category] || {color: '#9E9E9E', textColor: '#fff'}
}

// 标签操作
function addTag() {
  if (newTag.value && !selectedTags.value.includes(newTag.value)) {
    selectedTags.value.push(newTag.value)
    newTag.value = ''
  }
  showTagInput.value = false
}

function removeTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index !== -1) {
    selectedTags.value.splice(index, 1)
  }
}

// 筛选操作
function applyFilters() {
  console.log('应用筛选条件:', filters)
  // 筛选逻辑已经在 computed 中实现
  currentPage.value = 1 // 重置到第一页
}

function resetFilters() {
  filters.types.markdown = true
  filters.types.pdf = true
  filters.types.image = false
  filters.types.other = false
  filters.dateRange = 'all'
  filters.customDateRange = null
  selectedTags.value = []
  currentPage.value = 1 // 重置到第一页
}

// 分类操作
function handleCategoryChange(key) {
  selectedCategory.value = key
  currentPage.value = 1 // 重置到第一页
}

// 文档操作
function openDocument(doc) {
  console.log('打开文档:', doc.title)
}

function editDocument(doc) {
  console.log('编辑文档:', doc.title)
}

function commentDocument(doc) {
  console.log('评论文档:', doc.title)
}

function toggleStar(doc) {
  doc.starred = !doc.starred
  console.log(doc.starred ? '添加星标:' : '移除星标:', doc.title)
}

function shareDocument(doc) {
  console.log('分享文档:', doc.title)
}

function downloadDocument(doc) {
  console.log('下载文档:', doc.title)
}

function duplicateDocument(doc) {
  console.log('复制文档:', doc.title)
}

function deleteDocument(doc) {
  console.log('删除文档:', doc.title)
}

function viewDocument(doc) {
  console.log('查看文档:', doc.title)
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
/* 样式部分不变 */
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

.view-options {
  display: flex;
  align-items: center;
}

.view-label {
  margin-right: 8px;
  color: var(--text-color-secondary, #666);
}

/* 文档卡片样式 */
.document-grid {
  margin-bottom: 20px;
}

.document-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--box-shadow-1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  background-color: white;
}

.document-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-2);
}

.document-card-header {
  display: flex;
  margin-bottom: 12px;
}

.document-icon-container {
  margin-right: 12px;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-color, #6366f1);
}

.markdown-doc {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.pdf-doc {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.document-title-container {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-weight: 600;
  color: var(--text-color-base, #333);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-description {
  color: var(--text-color-secondary, #666);
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  min-height: 24px;
}

.document-time {
  font-size: 12px;
  color: var(--text-color-tertiary, #999);
}

.document-card-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto;
}

.document-actions {
  display: flex;
  gap: 4px;
}

.active-star {
  color: #f59e0b;
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

/* 最近访问表格卡片 */
.recent-visits-card {
  border-radius: 12px;
  box-shadow: var(--box-shadow-1);
  background-color: white;
}

.recent-file-cell {
  display: flex;
  align-items: center;
}

.recent-file-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

/* 上传文件对话框 */
.upload-dragger-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  color: var(--text-color-secondary, #666);
}

.upload-title {
  margin: 16px 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color-base, #333);
}

.upload-description {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-tertiary, #999);
}

.upload-options {
  margin-top: 24px;
}

.options-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--text-color-base, #333);
}

.upload-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* 文件名和图标样式 */
.table-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
}

.custom-date-range {
  margin-top: 12px;
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