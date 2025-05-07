<template>
  <div class="code-snippet-library">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <h1 class="page-title">代码片段库</h1>
      <div class="search-container">
        <div class="search-box">
          <input
              v-model="searchQuery"
              placeholder="搜索代码片段..."
              class="search-input"
              @keyup.enter="handleSearch"
          />
          <icon-font type="icon-search" :size="18" class="search-icon" />
        </div>
        <n-button type="primary" @click="handleSearch" class="search-button">搜索</n-button>
      </div>
      <n-button type="primary" @click="showAddSnippetModal = true" class="add-button">
        <template #icon>
          <icon-font type="icon-add"/>
        </template>
        添加代码片段
      </n-button>
    </div>

    <!-- 筛选器区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">技术栈</label>
          <n-select
              v-model:value="selectedTechnology"
              :options="technologyOptions"
              placeholder="选择技术栈"
              class="filter-select"
              clearable
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">组件类型</label>
          <n-select
              v-model:value="selectedCategory"
              :options="categoryOptions"
              placeholder="选择组件类型"
              class="filter-select"
              clearable
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">使用场景</label>
          <n-select
              v-model:value="selectedUsage"
              :options="usageOptions"
              placeholder="选择使用场景"
              class="filter-select"
              clearable
          />
        </div>

        <n-button tertiary type="info" @click="resetFilters" class="reset-button">
          <template #icon>
            <icon-font type="icon-refresh" />
          </template>
          重置筛选
        </n-button>
      </div>

      <div class="active-filters">
        <n-tag
            v-for="tag in activeTags"
            :key="tag.id"
            type="primary"
            closable
            round
            @close="removeTag(tag.id)"
            class="filter-tag"
        >
          {{ tag.label }}
        </n-tag>
      </div>
    </div>

    <!-- 代码片段网格 -->
    <transition-group name="fade" tag="div" class="snippet-grid">
      <div v-for="snippet in filteredSnippets" :key="snippet.id" class="snippet-card-wrapper">
        <snippet-card
            :snippet="snippet"
            @click="navigateToSnippet(snippet.id)"
            class="animated-card"
        />
      </div>

      <div v-if="filteredSnippets.length === 0" class="empty-state" key="empty">
        <n-empty description="没有找到匹配的代码片段">
          <template #icon>
            <icon-font type="icon-empty-data" :size="64" />
          </template>
          <template #extra>
            <n-button @click="resetFilters">清除筛选条件</n-button>
          </template>
        </n-empty>
      </div>
    </transition-group>

    <!-- 分页 -->
    <div class="pagination-container" v-if="filteredSnippets.length > 0">
      <n-pagination
          v-model:page="currentPage"
          :page-count="totalPages"
          :page-size="pageSize"
          :page-slot="5"
          size="medium"
          class="custom-pagination"
      />
    </div>

    <!-- 添加代码片段模态框 -->
    <n-modal v-model:show="showAddSnippetModal" preset="card" style="width: 800px" title="添加代码片段">
      <snippet-form @submit="handleAddSnippet" @cancel="showAddSnippetModal = false"/>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import SnippetCard from '@/components/snippet/SnippetCard.vue'
import SnippetForm from '@/components/snippet/SnippetForm.vue'
import IconFont from '@/components/common/IconFont.vue'

const router = useRouter()
const message = useMessage()

// 状态变量
const searchQuery = ref('')
const selectedTechnology = ref(null)
const selectedCategory = ref(null)
const selectedUsage = ref(null)
const currentPage = ref(1)
const pageSize = ref(9)
const showAddSnippetModal = ref(false)

// 筛选选项
const technologyOptions = [
  { label: 'Vue 3', value: 'vue3' },
  { label: 'React', value: 'react' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'HTML/CSS', value: 'html-css' },
  { label: 'SpringBoot', value: 'spring-boot' },
  { label: 'Java', value: 'java' }
]

const categoryOptions = [
  { label: '表单组件', value: 'form' },
  { label: '导航组件', value: 'navigation' },
  { label: '数据展示', value: 'data-display' },
  { label: '功能组件', value: 'utility' },
  { label: '布局组件', value: 'layout' },
  { label: '动画效果', value: 'animation' }
]

const usageOptions = [
  { label: '后台管理', value: 'admin' },
  { label: '移动端应用', value: 'mobile' },
  { label: '数据可视化', value: 'data-viz' },
  { label: '用户认证', value: 'auth' },
  { label: '常见业务逻辑', value: 'business-logic' }
]

// 模拟数据 - 实际应用中应从API获取
const snippets = ref([
  {
    id: 1,
    title: 'Vue3响应式表单组件',
    description: '一个高度可定制的响应式表单组件，支持验证和多种输入类型',
    code: `<template>
  <div class="responsive-form">
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
    >
      <n-form-item label="用户名" path="username">
        <n-input v-model:value="formValue.username" placeholder="请输入用户名"/>
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          v-model:value="formValue.password"
          type="password"
          placeholder="请输入密码"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" @click="handleSubmit">提交</n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const formRef = ref(null)

const formValue = ref({
  username: '',
  password: ''
})

const rules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: ['input', 'blur']
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      message.success('验证成功')
      // 提交表单逻辑
    } else {
      message.error('验证失败')
    }
  })
}
<\/script>`,
    author: '张三',
    createdAt: '2024-12-15',
    views: 320,
    likes: 45,
    technology: 'vue3',
    category: 'form',
    usage: 'admin',
    tags: ['表单', '验证', 'NaiveUI', 'Vue3']
  },
  {
    id: 2,
    title: '响应式数据表格组件',
    description: '可排序、可筛选的数据表格组件，支持分页和自定义操作列',
    code: `<template>
  <div class="data-table-container">
    <n-data-table
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
    />
  </div>
</template>

<script setup>
import {h, ref} from 'vue'
import {NButton, NSpace, NTag} from 'naive-ui'

const createColumns = ({handleEdit, handleDelete}) => {
  return [
    {
      title: 'ID',
      key: 'id',
      sorter: 'default'
    },
    {
      title: '名称',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: '状态',
      key: 'status',
      render(row) {
        return h(
            NTag,
            {
              type: row.status === 'active' ? 'success' : 'warning'
            },
            {default: () => row.status === 'active' ? '活跃' : '禁用'}
        )
      },
      filters: [
        {text: '活跃', value: 'active'},
        {text: '禁用', value: 'inactive'}
      ],
      filterOptionValue: null,
      filterOption: (value, row) => row.status === value
    },
    {
      title: '操作',
      key: 'actions',
      render(row) {
        return h(
            NSpace,
            {justify: 'center'},
            {
              default: () => [
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'primary',
                      ghost: true,
                      onClick: () => handleEdit(row)
                    },
                    {default: () => '编辑'}
                ),
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                      ghost: true,
                      onClick: () => handleDelete(row)
                    },
                    {default: () => '删除'}
                )
              ]
            }
        )
      }
    }
  ]
}

// 表格数据和处理函数
const data = ref([
  {id: 1, name: '项目A', status: 'active'},
  {id: 2, name: '项目B', status: 'inactive'},
  {id: 3, name: '项目C', status: 'active'}
])

const handleEdit = (row) => {
  console.log('编辑行:', row)
}

const handleDelete = (row) => {
  console.log('删除行:', row)
}

const columns = createColumns({
  handleEdit,
  handleDelete
})

const pagination = {
  pageSize: 10
}
<\/script>`,
    author: '李四',
    createdAt: '2024-12-10',
    views: 215,
    likes: 32,
    technology: 'vue3',
    category: 'data-display',
    usage: 'admin',
    tags: ['表格', '数据展示', 'NaiveUI', 'Vue3']
  },
  {
    id: 3,
    title: 'Vue3侧边栏导航组件',
    description: '可折叠的响应式侧边栏导航，支持多级菜单和路由集成',
    code: `<template>
  <div class="sidebar-container" :class="{ 'collapsed': isCollapsed }">
    <div class="logo-container">
      <icon-font type="icon-logo" :size="24"/>
      <span class="logo-text" v-if="!isCollapsed">应用名称</span>
    </div>

    <n-menu
        v-model:value="activeKey"
        :collapsed="isCollapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :indent="24"
        @update:value="handleMenuClick"
    />

    <div class="sidebar-footer">
      <n-button quaternary circle @click="toggleCollapse">
        <template #icon>
          <icon-font :type="isCollapsed ? 'icon-right' : 'icon-left'"/>
        </template>
      </n-button>
    </div>
  </div>
</template>

<script setup>
import {h, ref} from 'vue'
import {useRouter} from 'vue-router'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  defaultCollapsed: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const isCollapsed = ref(props.defaultCollapsed)
const activeKey = ref('dashboard')

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 菜单选项
const menuOptions = [
  {
    label: '主导航',
    key: 'main-nav',
    type: 'group',
    children: [
      {
        label: '仪表盘',
        key: 'dashboard',
        icon: () => h(IconFont, {type: 'icon-dashboard'})
      },
      {
        label: '用户管理',
        key: 'users',
        icon: () => h(IconFont, {type: 'icon-user'})
      },
      {
        label: '内容管理',
        key: 'content',
        icon: () => h(IconFont, {type: 'icon-file'}),
        children: [
          {
            label: '文章列表',
            key: 'articles'
          },
          {
            label: '分类管理',
            key: 'categories'
          }
        ]
      }
    ]
  }
]

// 处理菜单点击
const handleMenuClick = (key) => {
  router.push({name: key})
}
<\/script>

<style scoped>
.sidebar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid #eee;
  transition: all 0.3s;
  width: 240px;
}

.sidebar-container.collapsed {
  width: 64px;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  overflow: hidden;
}

.logo-text {
  margin-left: 12px;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}
</style>`,
    author: '王五',
    createdAt: '2024-11-28',
    views: 189,
    likes: 27,
    technology: 'vue3',
    category: 'navigation',
    usage: 'admin',
    tags: ['侧边栏', '导航', 'NaiveUI', 'Vue3']
  },
  {
    id: 4,
    title: 'SpringBoot JWT认证工具类',
    description: '基于JWT的用户认证工具类，包含token生成、验证和刷新功能',
    code: `package com.example.auth.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    // Token有效期（毫秒）
    public static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60 * 1000; // 5小时

    @Value("\${jwt.secret}")
    private String secret;

    // 从token中获取用户名
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    // 从token中获取过期时间
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    // 从token中获取指定的声明
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    // 解析token获取所有声明
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }

    // 检查token是否过期
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    // 生成token
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateToken(claims, userDetails.getUsername());
    }

    // 创建token
    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    // 验证token
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}`,
    author: '赵六',
    createdAt: '2024-11-15',
    views: 456,
    likes: 89,
    technology: 'spring-boot',
    category: 'utility',
    usage: 'auth',
    tags: ['JWT', '认证', 'SpringBoot', 'Java']
  },
  {
    id: 5,
    title: 'CSS Flexbox卡片网格布局',
    description: '响应式卡片网格布局，使用CSS Flexbox实现，支持不同屏幕尺寸',
    code: `.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 -8px;
}

.card {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  margin: 8px;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.card-description {
  color: #666;
  margin-bottom: 16px;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.card-meta {
  font-size: 14px;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-button {
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.card-button:hover {
  background-color: #e0e0e0;
}

.card-button.primary {
  background-color: #6366f1;
  color: white;
}

.card-button.primary:hover {
  background-color: #4f46e5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card {
    flex: 0 0 calc(50% - 16px);
  }
}

@media (max-width: 480px) {
  .card {
    flex: 0 0 100%;
  }
}`,
    author: '孙七',
    createdAt: '2024-10-30',
    views: 320,
    likes: 56,
    technology: 'html-css',
    category: 'layout',
    usage: 'mobile',
    tags: ['CSS', 'Flexbox', '响应式', '布局']
  },
  {
    id: 6,
    title: 'Vue3数据可视化图表组件',
    description: '基于ECharts的Vue3图表组件，支持柱状图、折线图、饼图等多种图表类型',
    code: `<template>
  <div class="chart-container" :style="{ height: height, width: width }">
    <div ref="chartRef" class="echarts-container"></div>
  </div>
</template>

<script setup>
  import {ref, onMounted, onUnmounted, watch} from 'vue'
  import * as echarts from 'echarts/core'
  import {BarChart, LineChart, PieChart} from 'echarts/charts'
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent
  } from 'echarts/components'
  import {LabelLayout, UniversalTransition} from 'echarts/features'
  import {CanvasRenderer} from 'echarts/renderers'

  // 注册必要的组件
  echarts.use([
    BarChart,
    LineChart,
    PieChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
  ])

  const props = defineProps({
    // 图表类型：bar, line, pie
    type: {
      type: String,
      required: true
    },
    // 图表数据
    data: {
      type: Object,
      required: true
    },
    // 图表配置
    options: {
      type: Object,
      default: () => ({})
    },
    // 图表容器高度
    height: {
      type: String,
      default: '350px'
    },
    // 图表容器宽度
    width: {
      type: String,
      default: '100%'
    },
    // 主题：light, dark
    theme: {
      type: String,
      default: 'light'
    }
  })

  const chartRef = ref(null)
  let chartInstance = null

  // 初始化图表
  const initChart = () => {
    if (chartInstance) {
      chartInstance.dispose()
    }

    const chart = echarts.init(chartRef.value, props.theme)
    chartInstance = chart

    // 生成默认配置
    let defaultOptions = {}

    // 根据图表类型生成不同的默认配置
    switch (props.type) {
      case 'bar':
        defaultOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          }
        }
        break
      case 'line':
        defaultOptions = {
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          }
        }
        break
      case 'pie':
        defaultOptions = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: props.data.legend || []
          }
        }
        break
    }

    // 合并默认配置、用户配置和数据
    const mergedOptions = {
      ...defaultOptions,
      ...props.options,
      ...props.data
    }

    // 设置图表配置
    chart.setOption(mergedOptions)

    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', () => {
      chart.resize()
    })
  }

  // 监听数据变化，更新图表
  watch(
      () => props.data,
      () => {
        if (chartInstance) {
          chartInstance.setOption({
            ...props.options,
            ...props.data
          })
        }
      },
      {deep: true}
  )

  // 监听主题变化
  watch(
      () => props.theme,
      () => {
        initChart()
      }
  )

  onMounted(() => {
    initChart()
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
      window.removeEventListener('resize', chartInstance.resize)
    }
  })
<\/script>

<style scoped>
  .chart-container {
    position: relative;
  }

  .echarts-container {
    width: 100%;
    height: 100%;
  }
</style>`,
    author: '周八',
    createdAt: '2024-11-05',
    views: 278,
    likes: 46,
    technology: 'vue3',
    category: 'data-display',
    usage: 'data-viz',
    tags: ['ECharts', '可视化', '图表', 'Vue3']
  }
])

// 计算活动标签
const activeTags = computed(() => {
  const tags = []

  if (selectedTechnology.value) {
    const tech = technologyOptions.find(option => option.value === selectedTechnology.value)
    if (tech) {
      tags.push({ id: 'tech', label: `技术: ${tech.label}` })
    }
  }

  if (selectedCategory.value) {
    const category = categoryOptions.find(option => option.value === selectedCategory.value)
    if (category) {
      tags.push({ id: 'category', label: `类型: ${category.label}` })
    }
  }

  if (selectedUsage.value) {
    const usage = usageOptions.find(option => option.value === selectedUsage.value)
    if (usage) {
      tags.push({ id: 'usage', label: `场景: ${usage.label}` })
    }
  }

  if (searchQuery.value) {
    tags.push({ id: 'search', label: `搜索: ${searchQuery.value}` })
  }

  return tags
})

// 计算过滤后的片段
const filteredSnippets = computed(() => {
  let result = [...snippets.value]

  // 技术筛选
  if (selectedTechnology.value) {
    result = result.filter(snippet => snippet.technology === selectedTechnology.value)
  }

  // 类别筛选
  if (selectedCategory.value) {
    result = result.filter(snippet => snippet.category === selectedCategory.value)
  }

  // 使用场景筛选
  if (selectedUsage.value) {
    result = result.filter(snippet => snippet.usage === selectedUsage.value)
  }

  // 搜索查询
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(snippet =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.description.toLowerCase().includes(query) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value

  return result.slice(startIndex, endIndex)
})

// 计算总页数
const totalPages = computed(() => {
  const filteredTotal = snippets.value.filter(snippet => {
    let match = true

    if (selectedTechnology.value) {
      match = match && snippet.technology === selectedTechnology.value
    }

    if (selectedCategory.value) {
      match = match && snippet.category === selectedCategory.value
    }

    if (selectedUsage.value) {
      match = match && snippet.usage === selectedUsage.value
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      match = match && (
          snippet.title.toLowerCase().includes(query) ||
          snippet.description.toLowerCase().includes(query) ||
          snippet.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return match
  }).length

  return Math.ceil(filteredTotal / pageSize.value)
})

// 处理事件
const handleSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedTechnology.value = null
  selectedCategory.value = null
  selectedUsage.value = null
  currentPage.value = 1
}

const removeTag = (tagId) => {
  if (tagId === 'tech') {
    selectedTechnology.value = null
  } else if (tagId === 'category') {
    selectedCategory.value = null
  } else if (tagId === 'usage') {
    selectedUsage.value = null
  } else if (tagId === 'search') {
    searchQuery.value = ''
  }
}

const navigateToSnippet = (snippetId) => {
  router.push({ name: 'view-code-snippet', params: { id: snippetId } })
}

const handleAddSnippet = (snippet) => {
  const newSnippet = {
    id: snippets.value.length + 1,
    views: 0,
    likes: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    ...snippet
  }

  snippets.value.unshift(newSnippet)
  showAddSnippetModal.value = false
  message.success('添加代码片段成功')
}

// 初始化
onMounted(() => {
  // 实际应用中这里应该从API获取数据
})
</script>

<style scoped>
.code-snippet-library {
  padding: 16px;
  max-width: 98%; /* 修改：从1440px增加到98% */
  margin: 0 auto;
  background-color: var(--body-color);
  min-height: calc(100vh - 60px);
}

/* 顶部栏样式 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 500px;
  margin: 0 16px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  height: 40px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  padding: 0 40px 0 16px;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  background-color: #fff;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-tertiary);
  pointer-events: none;
}

.search-button {
  height: 40px;
  border-radius: 20px;
  padding: 0 16px;
}

.add-button {
  height: 40px;
  border-radius: 20px;
  padding: 0 16px;
}

/* 筛选区域样式 */
.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 180px;
}

.filter-label {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-left: 4px;
}

.filter-select {
  width: 100%;
}

.reset-button {
  align-self: flex-end;
  margin-top: 20px;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.filter-tag {
  transition: all 0.3s;
}

.filter-tag:hover {
  transform: translateY(-2px);
}

/* 片段网格样式 */
.snippet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 修改：从320px减小到300px */
  gap: 20px; /* 修改：从24px减小到20px */
  margin-bottom: 32px;
}

.snippet-card-wrapper {
  height: 100%;
  transition: transform 0.3s ease;
}

.animated-card {
  height: 100%;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.animated-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
  text-align: center;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.custom-pagination {
  margin: 0 auto;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-container {
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .add-button {
    align-self: flex-end;
  }

  .snippet-grid {
    grid-template-columns: 1fr;
  }
}
</style>