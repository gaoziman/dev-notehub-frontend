<template>
  <div class="view-code-snippet">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <n-button quaternary circle size="large" @click="goBack" class="back-button">
        <template #icon>
          <icon-font type="icon-left" :size="20" />
        </template>
      </n-button>
      <h1 class="page-title">{{ snippet?.title || '代码片段详情' }}</h1>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-container" v-if="snippet">
      <!-- 左侧代码展示区域 -->
      <div class="code-section">
        <!-- 技术和分类标签 -->
        <div class="snippet-meta-tags">
          <div class="tech-category">
            <tech-badge :tech="snippet.technology" class="tech-badge" />
            <div class="category-tags">
              <n-tag size="small" :type="getCategoryType(snippet.category)" class="meta-tag">
                {{ getCategoryLabel(snippet.category) }}
              </n-tag>
              <n-tag size="small" type="warning" class="meta-tag">
                {{ getUsageLabel(snippet.usage) }}
              </n-tag>
            </div>
          </div>
        </div>

        <!-- 代码描述 -->
        <div class="code-description">
          <p>{{ snippet.description }}</p>
        </div>

        <!-- 代码展示 -->
        <div class="md-code-block">
          <div class="md-code-header">
            <div class="md-code-dots">
              <span class="md-code-dot md-code-dot-red"></span>
              <span class="md-code-dot md-code-dot-yellow"></span>
              <span class="md-code-dot md-code-dot-green"></span>
            </div>
            <div class="md-code-language">{{ getLanguageFromTech(snippet.technology) }}</div>
            <div class="md-code-actions">
              <button class="md-copy-button" id="copy-button" @click="copyCode">复制</button>
            </div>
          </div>
          <pre :class="['hljs', 'language-' + getLanguageFromTech(snippet.technology)]" ref="codeBlockRef"><code v-html="highlightedCode"></code></pre>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <!-- 作者信息卡片 -->
        <n-card class="author-card" size="small">
          <div class="author-info">
            <div class="avatar">
              <icon-font type="icon-user" :size="36"/>
            </div>
            <div class="author-details">
              <div class="author-name">{{ snippet.author }}</div>
              <div class="author-date">
                <icon-font type="icon-calendar" :size="14"/>
                <span>发布于 {{ formatDate(snippet.createdAt) }}</span>
              </div>
            </div>
          </div>
        </n-card>

        <!-- 标签卡片 -->
        <n-card class="tags-card" size="small" v-if="snippet.tags && snippet.tags.length">
          <div class="tags-header">标签</div>
          <div class="tags-container">
            <n-tag v-for="tag in snippet.tags" :key="tag" size="small" round class="tag">
              {{ tag }}
            </n-tag>
          </div>
        </n-card>

        <!-- 相关推荐卡片 -->
        <n-card class="related-card" size="small" v-if="relatedSnippets.length > 0">
          <div class="related-header">相关推荐</div>
          <div class="related-list">
            <div v-for="(item, index) in relatedSnippets" :key="index" class="related-item"
                 @click="navigateToSnippet(item.id)">
              <div class="related-title">{{ item.title }}</div>
              <div class="related-meta">
                <tech-badge :tech="item.technology"/>
                <span class="related-views">
                  <icon-font type="icon-view" :size="12"/>
                  {{ item.views }}
                </span>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <n-spin size="large"/>
      <p>加载代码片段中...</p>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, nextTick, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useMessage} from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'
import TechBadge from '@/components/snippet/TechBadge.vue'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/atom-one-dark.css'

// 导入常用的语言支持
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)

// Vue 语言支持 (使用XML渲染，但有特殊处理)
hljs.registerLanguage('vue', xml)

const route = useRoute()
const router = useRouter()
const message = useMessage()

// 状态
const isLiked = ref(false)
const snippet = ref(null)
const codeBlockRef = ref(null)
const snippets = ref([
  {
    id: 1,
    title: 'Vue3响应式表单组件',
    description: '一个高度可定制的响应式表单组件，支持验证和多种输入类型',
    code: `<template>\n  <div class="responsive-form">\n    <n-form\n      ref="formRef"\n      :model="formValue"\n      :rules="rules"\n      label-placement="left"\n      label-width="auto"\n      require-mark-placement="right-hanging"\n    >\n      <n-form-item label="用户名" path="username">\n        <n-input v-model:value="formValue.username" placeholder="请输入用户名"/>\n      </n-form-item>\n      <n-form-item label="密码" path="password">\n        <n-input\n          v-model:value="formValue.password"\n          type="password"\n          placeholder="请输入密码"\n          show-password-on="click"\n        />\n      </n-form-item>\n      <n-form-item>\n        <n-button type="primary" @click="handleSubmit">提交</n-button>\n      </n-form-item>\n    </n-form>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { useMessage } from 'naive-ui'\n\nconst message = useMessage()\nconst formRef = ref(null)\n\nconst formValue = ref({\n  username: '',\n  password: ''\n})\n\nconst rules = {\n  username: {\n    required: true,\n    message: '请输入用户名',\n    trigger: 'blur'\n  },\n  password: {\n    required: true,\n    message: '请输入密码',\n    trigger: ['input', 'blur']\n  }\n}\n\nconst handleSubmit = (e) => {\n  e.preventDefault()\n  formRef.value?.validate((errors) => {\n    if (!errors) {\n      message.success('验证成功')\n      // 提交表单逻辑\n    } else {\n      message.error('验证失败')\n    }\n  })\n}\n<\/script>`,
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
    code: `<template>\n  <div class="data-table-container">\n    <n-data-table\n        :columns="columns"\n        :data="data"\n        :pagination="pagination"\n        :bordered="false"\n        :single-line="false"\n    />\n  </div>\n</template>\n\n<script setup>\nimport {h, ref} from 'vue'\nimport {NButton, NSpace, NTag} from 'naive-ui'\n\nconst createColumns = ({handleEdit, handleDelete}) => {\n  return [\n    {\n      title: 'ID',\n      key: 'id',\n      sorter: 'default'\n    },\n    {\n      title: '名称',\n      key: 'name',\n      sorter: (a, b) => a.name.localeCompare(b.name)\n    },\n    {\n      title: '状态',\n      key: 'status',\n      render(row) {\n        return h(\n            NTag,\n            {\n              type: row.status === 'active' ? 'success' : 'warning'\n            },\n            {default: () => row.status === 'active' ? '活跃' : '禁用'}\n        )\n      },\n      filters: [\n        {text: '活跃', value: 'active'},\n        {text: '禁用', value: 'inactive'}\n      ],\n      filterOptionValue: null,\n      filterOption: (value, row) => row.status === value\n    },\n    {\n      title: '操作',\n      key: 'actions',\n      render(row) {\n        return h(\n            NSpace,\n            {justify: 'center'},\n            {\n              default: () => [\n                h(\n                    NButton,\n                    {\n                      size: 'small',\n                      type: 'primary',\n                      ghost: true,\n                      onClick: () => handleEdit(row)\n                    },\n                    {default: () => '编辑'}\n                ),\n                h(\n                    NButton,\n                    {\n                      size: 'small',\n                      type: 'error',\n                      ghost: true,\n                      onClick: () => handleDelete(row)\n                    },\n                    {default: () => '删除'}\n                )\n              ]\n            }\n        )\n      }\n    }\n  ]\n}\n\n// 表格数据和处理函数\nconst data = ref([\n  {id: 1, name: '项目A', status: 'active'},\n  {id: 2, name: '项目B', status: 'inactive'},\n  {id: 3, name: '项目C', status: 'active'}\n])\n\nconst handleEdit = (row) => {\n  console.log('编辑行:', row)\n}\n\nconst handleDelete = (row) => {\n  console.log('删除行:', row)\n}\n\nconst columns = createColumns({\n  handleEdit,\n  handleDelete\n})\n\nconst pagination = {\n  pageSize: 10\n}\n<\/script>`,
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
    code: `<template>\n  <div class="sidebar-container" :class="{ 'collapsed': isCollapsed }">\n    <div class="logo-container">\n      <icon-font type="icon-logo" :size="24"/>\n      <span class="logo-text" v-if="!isCollapsed">应用名称</span>\n    </div>\n\n    <n-menu\n        v-model:value="activeKey"\n        :collapsed="isCollapsed"\n        :collapsed-width="64"\n        :collapsed-icon-size="22"\n        :options="menuOptions"\n        :indent="24"\n        @update:value="handleMenuClick"\n    />\n\n    <div class="sidebar-footer">\n      <n-button quaternary circle @click="toggleCollapse">\n        <template #icon>\n          <icon-font :type="isCollapsed ? 'icon-right' : 'icon-left'"/>\n        </template>\n      </n-button>\n    </div>\n  </div>\n</template>\n\n<script setup>\nimport {h, ref} from 'vue'\nimport {useRouter} from 'vue-router'\nimport IconFont from '@/components/common/IconFont.vue'\n\nconst props = defineProps({\n  defaultCollapsed: {\n    type: Boolean,\n    default: false\n  }\n})\n\nconst router = useRouter()\nconst isCollapsed = ref(props.defaultCollapsed)\nconst activeKey = ref('dashboard')\n\n// 切换折叠状态\nconst toggleCollapse = () => {\n  isCollapsed.value = !isCollapsed.value\n}\n\n// 菜单选项\nconst menuOptions = [\n  {\n    label: '主导航',\n    key: 'main-nav',\n    type: 'group',\n    children: [\n      {\n        label: '仪表盘',\n        key: 'dashboard',\n        icon: () => h(IconFont, {type: 'icon-dashboard'})\n      },\n      {\n        label: '用户管理',\n        key: 'users',\n        icon: () => h(IconFont, {type: 'icon-user'})\n      },\n      {\n        label: '内容管理',\n        key: 'content',\n        icon: () => h(IconFont, {type: 'icon-file'}),\n        children: [\n          {\n            label: '文章列表',\n            key: 'articles'\n          },\n          {\n            label: '分类管理',\n            key: 'categories'\n          }\n        ]\n      }\n    ]\n  }\n]\n\n// 处理菜单点击\nconst handleMenuClick = (key) => {\n  router.push({name: key})\n}\n<\/script>\n\n<style scoped>\n.sidebar-container {\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  background-color: #fff;\n  border-right: 1px solid #eee;\n  transition: all 0.3s;\n  width: 240px;\n}\n\n.sidebar-container.collapsed {\n  width: 64px;\n}\n\n.logo-container {\n  height: 64px;\n  display: flex;\n  align-items: center;\n  padding: 0 16px;\n  border-bottom: 1px solid #f0f0f0;\n  overflow: hidden;\n}\n\n.logo-text {\n  margin-left: 12px;\n  font-size: 16px;\n  font-weight: bold;\n  white-space: nowrap;\n}\n\n.sidebar-footer {\n  margin-top: auto;\n  padding: 12px;\n  display: flex;\n  justify-content: center;\n  border-top: 1px solid #f0f0f0;\n}\n</style>`,
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
    code: `<template>\n  <div class="chart-container" :style="{ height: height, width: width }">\n    <div ref="chartRef" class="echarts-container"></div>\n  </div>\n</template>\n\n<script setup>\n  import {ref, onMounted, onUnmounted, watch} from 'vue'\n  import * as echarts from 'echarts/core'\n  import {BarChart, LineChart, PieChart} from 'echarts/charts'\n  import {\n    TitleComponent,\n    TooltipComponent,\n    GridComponent,\n    DatasetComponent,\n    TransformComponent,\n    LegendComponent\n  } from 'echarts/components'\n  import {LabelLayout, UniversalTransition} from 'echarts/features'\n  import {CanvasRenderer} from 'echarts/renderers'\n\n  // 注册必要的组件\n  echarts.use([\n    BarChart,\n    LineChart,\n    PieChart,\n    TitleComponent,\n    TooltipComponent,\n    GridComponent,\n    DatasetComponent,\n    TransformComponent,\n    LegendComponent,\n    LabelLayout,\n    UniversalTransition,\n    CanvasRenderer\n  ])\n\n  const props = defineProps({\n    // 图表类型：bar, line, pie\n    type: {\n      type: String,\n      required: true\n    },\n    // 图表数据\n    data: {\n      type: Object,\n      required: true\n    },\n    // 图表配置\n    options: {\n      type: Object,\n      default: () => ({})\n    },\n    // 图表容器高度\n    height: {\n      type: String,\n      default: '350px'\n    },\n    // 图表容器宽度\n    width: {\n      type: String,\n      default: '100%'\n    },\n    // 主题：light, dark\n    theme: {\n      type: String,\n      default: 'light'\n    }\n  })\n\n  const chartRef = ref(null)\n  let chartInstance = null\n\n  // 初始化图表\n  const initChart = () => {\n    if (chartInstance) {\n      chartInstance.dispose()\n    }\n\n    const chart = echarts.init(chartRef.value, props.theme)\n    chartInstance = chart\n\n    // 生成默认配置\n    let defaultOptions = {}\n\n    // 根据图表类型生成不同的默认配置\n    switch (props.type) {\n      case 'bar':\n        defaultOptions = {\n          tooltip: {\n            trigger: 'axis',\n            axisPointer: {\n              type: 'shadow'\n            }\n          },\n          grid: {\n            left: '3%',\n            right: '4%',\n            bottom: '3%',\n            containLabel: true\n          }\n        }\n        break\n      case 'line':\n        defaultOptions = {\n          tooltip: {\n            trigger: 'axis'\n          },\n          grid: {\n            left: '3%',\n            right: '4%',\n            bottom: '3%',\n            containLabel: true\n          }\n        }\n        break\n      case 'pie':\n        defaultOptions = {\n          tooltip: {\n            trigger: 'item',\n            formatter: '{a} <br/>{b}: {c} ({d}%)'\n          },\n          legend: {\n            orient: 'vertical',\n            left: 10,\n            data: props.data.legend || []\n          }\n        }\n        break\n    }\n\n    // 合并默认配置、用户配置和数据\n    const mergedOptions = {\n      ...defaultOptions,\n      ...props.options,\n      ...props.data\n    }\n\n    // 设置图表配置\n    chart.setOption(mergedOptions)\n\n    // 窗口大小变化时自动调整图表大小\n    window.addEventListener('resize', () => {\n      chart.resize()\n    })\n  }\n\n  // 监听数据变化，更新图表\n  watch(\n      () => props.data,\n      () => {\n        if (chartInstance) {\n          chartInstance.setOption({\n            ...props.options,\n            ...props.data\n          })\n        }\n      },\n      {deep: true}\n  )\n\n  // 监听主题变化\n  watch(\n      () => props.theme,\n      () => {\n        initChart()\n      }\n  )\n\n  onMounted(() => {\n    initChart()\n  })\n\n  onUnmounted(() => {\n    if (chartInstance) {\n      chartInstance.dispose()\n      window.removeEventListener('resize', chartInstance.resize)\n    }\n  })\n<\/script>\n\n<style scoped>\n  .chart-container {\n    position: relative;\n  }\n\n  .echarts-container {\n    width: 100%;\n    height: 100%;\n  }\n</style>`,
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

// 高亮后的代码
const highlightedCode = computed(() => {
  if (!snippet.value || !snippet.value.code) {
    return ''
  }

  const language = getLanguageFromTech(snippet.value.technology)
  try {
    // 使用highlight.js处理代码，生成高亮HTML
    return hljs.highlight(snippet.value.code, {
      language: language
    }).value
  } catch (error) {
    console.error("高亮处理失败:", error)
    // 失败时使用纯文本模式
    return hljs.highlight(snippet.value.code, {
      language: 'plaintext'
    }).value
  }
})

// 从URL获取片段ID并加载数据
onMounted(() => {
  const snippetId = Number(route.params.id || 0)
  const foundSnippet = snippets.value.find(s => s.id === snippetId)

  if (foundSnippet) {
    // 使用setTimeout来确保响应式数据已正确初始化
    setTimeout(() => {
      snippet.value = {...foundSnippet}
      // 模拟增加浏览量
      snippet.value.views += 1
    }, 100)
  } else {
    message.error('未找到该代码片段')
    router.push({name: 'code-snippets'})
  }
})

// 监听代码变化，确保代码更新时能重新高亮
watch(() => snippet.value?.code, () => {
  if (snippet.value?.code) {
    // 当代码变化时，计算属性会自动重新计算高亮结果
    // 无需额外操作
  }
})

// 相关推荐 - 添加安全检查
const relatedSnippets = computed(() => {
  if (!snippet.value || !snippet.value.tags) return []

  return snippets.value
      .filter(s => {
        if (!s || s.id === snippet.value.id) return false

        // 安全地检查匹配条件
        const techMatch = s.technology === snippet.value.technology
        const categoryMatch = s.category === snippet.value.category
        const usageMatch = s.usage === snippet.value.usage

        // 安全地检查标签匹配
        const tagMatch = Array.isArray(s.tags) && Array.isArray(snippet.value.tags) &&
            s.tags.some(tag => snippet.value.tags.includes(tag))

        return techMatch || categoryMatch || usageMatch || tagMatch
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
})

// 方法
const goBack = () => {
  router.back()
}

const copyCode = async () => {
  if (!snippet.value || !snippet.value.code) {
    message.error('没有可复制的代码')
    return
  }

  try {
    await navigator.clipboard.writeText(snippet.value.code)
    message.success('代码已复制到剪贴板')

    // 按钮反馈
    const copyButton = document.getElementById('copy-button')
    if (copyButton) {
      const originalText = copyButton.textContent
      copyButton.textContent = '已复制!'
      copyButton.classList.add('md-copied')

      setTimeout(() => {
        copyButton.textContent = originalText
        copyButton.classList.remove('md-copied')
      }, 2000)
    }
  } catch (err) {
    message.error('复制失败: ' + err.message)
  }
}

const likeSnippet = () => {
  if (!snippet.value) return

  if (isLiked.value) {
    snippet.value.likes -= 1
  } else {
    snippet.value.likes += 1
  }
  isLiked.value = !isLiked.value
  message.success(isLiked.value ? '感谢您的点赞！' : '已取消点赞')
}

const navigateToSnippet = (id) => {
  if (id) {
    router.push({name: 'view-code-snippet', params: {id}})
    // 刷新页面以确保数据重新加载
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return `${diffDays}天前`
  } else {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

// 获取分类标签类型
const getCategoryType = (category) => {
  if (!category) return 'default'

  const typeMap = {
    'form': 'success',
    'navigation': 'info',
    'data-display': 'warning',
    'utility': 'default',
    'layout': 'primary',
    'animation': 'error'
  }

  return typeMap[category] || 'default'
}

// 获取分类标签文本
const getCategoryLabel = (category) => {
  if (!category) return '未分类'

  const labelMap = {
    'form': '表单组件',
    'navigation': '导航组件',
    'data-display': '数据展示',
    'utility': '功能组件',
    'layout': '布局组件',
    'animation': '动画效果'
  }

  return labelMap[category] || category
}

// 获取使用场景标签文本
const getUsageLabel = (usage) => {
  if (!usage) return '通用'

  const labelMap = {
    'admin': '后台管理',
    'mobile': '移动端应用',
    'data-viz': '数据可视化',
    'auth': '用户认证',
    'business-logic': '业务逻辑'
  }

  return labelMap[usage] || usage
}

// 根据技术栈获取语言
const getLanguageFromTech = (tech) => {
  if (!tech) return 'plaintext'

  const techToLanguage = {
    'vue3': 'vue',
    'react': 'jsx',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'html-css': 'css',
    'html': 'html',
    'css': 'css',
    'spring-boot': 'java',
    'java': 'java',
    'python': 'python',
    'go': 'go',
    'rust': 'rust',
    'csharp': 'csharp',
    'php': 'php',
    'sql': 'sql',
    'bash': 'bash',
    'json': 'json'
  }

  return techToLanguage[tech] || 'plaintext'
}
</script>

<style scoped>
.view-code-snippet {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  background-color: var(--body-color);
  min-height: calc(100vh - 60px);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 16px;
}

.loading-state p {
  font-size: 16px;
  color: var(--text-color-secondary);
}

/* 顶部导航栏 */
.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.back-button {
  margin-right: 16px;
  transition: transform 0.3s;
}

.back-button:hover {
  transform: translateX(-4px);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-base);
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 内容布局 */
.content-container {
  display: flex;
  gap: 24px;
}

.code-section {
  flex: 1;
  min-width: 0;
}

.info-panel {
  width: 320px;
  flex-shrink: 0;
}

/* 元标签区域 */
.snippet-meta-tags {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tech-category {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-tags {
  display: flex;
  gap: 8px;
}

.meta-tag {
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 代码描述 */
.code-description {
  margin-bottom: 20px;
  padding: 0 4px;
}

.code-description p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-color-secondary);
  margin: 0;
}

/* Atom One Dark 代码块样式 */
.md-code-block {
  margin: 0 0 24px 0;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  position: relative;
  line-height: 0;
  background-color: #282c34;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.md-code-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

/* 代码块头部 - macOS 风格 */
.md-code-header {
  height: 36px;
  background: #21252b;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.md-code-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.md-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.md-code-dot-red {
  background: #ff5f56;
}

.md-code-dot-yellow {
  background: #ffbd2e;
}

.md-code-dot-green {
  background: #27c93f;
}

.md-code-language {
  font-size: 12px;
  color: #9da5b4;
  text-transform: lowercase;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 代码操作按钮容器 */
.md-code-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 复制按钮样式 */
.md-copy-button {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #abb2bf;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.md-copy-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.md-copy-button.md-copied {
  background: #98c379;
  color: #ffffff;
}

/* 代码内容区域 */
.md-code-block pre {
  margin: 0 !important;
  padding: 16px !important;
  color: #abb2bf !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  overflow-x: auto !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
  border: none !important;
  display: block !important;
  min-height: 0 !important;
  border-radius: 0 0 8px 8px !important;
  max-height: 70vh !important;
}

/* 代码高亮自定义样式 */
:deep(.hljs) {
  display: block;
  overflow-x: auto;
  background: #282c34;
  color: #abb2bf;
  padding: 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}

:deep(.hljs-comment),
:deep(.hljs-quote) {
  color: #5c6370;
  font-style: italic;
}

:deep(.hljs-doctag),
:deep(.hljs-keyword),
:deep(.hljs-formula) {
  color: #c678dd;
}

:deep(.hljs-section),
:deep(.hljs-name),
:deep(.hljs-selector-tag),
:deep(.hljs-deletion),
:deep(.hljs-subst) {
  color: #e06c75;
}

:deep(.hljs-literal) {
  color: #56b6c2;
}

:deep(.hljs-string),
:deep(.hljs-regexp),
:deep(.hljs-addition),
:deep(.hljs-attribute),
:deep(.hljs-meta-string) {
  color: #98c379;
}

:deep(.hljs-built_in),
:deep(.hljs-class .hljs-title) {
  color: #e6c07b;
}

:deep(.hljs-attr),
:deep(.hljs-variable),
:deep(.hljs-template-variable),
:deep(.hljs-type),
:deep(.hljs-selector-class),
:deep(.hljs-selector-attr),
:deep(.hljs-selector-pseudo),
:deep(.hljs-number) {
  color: #d19a66;
}

:deep(.hljs-symbol),
:deep(.hljs-bullet),
:deep(.hljs-link),
:deep(.hljs-meta),
:deep(.hljs-selector-id),
:deep(.hljs-title) {
  color: #61aeee;
}

:deep(.hljs-emphasis) {
  font-style: italic;
}

:deep(.hljs-strong) {
  font-weight: bold;
}

:deep(.hljs-link) {
  text-decoration: underline;
}

/* 信息面板卡片样式 */
.info-panel .n-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.info-panel .n-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* 作者卡片 */
.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-color-base);
}

.author-date {
  font-size: 12px;
  color: var(--text-color-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 统计卡片 */
.stats-header,
.tags-header,
.related-header {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-color-secondary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background-color: rgba(var(--primary-color-rgb), 0.05);
  border-radius: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 标签卡片 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  transition: all 0.3s;
}

.tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 相关推荐卡片 */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-item {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
  cursor: pointer;
}

.related-item:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
  transform: translateX(3px);
}

.related-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-color-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-views {
  font-size: 12px;
  color: var(--text-color-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式设计 */
@media (max-width: 1100px) {
  .content-container {
    flex-direction: column;
  }

  .info-panel {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .info-panel .n-card {
    margin-bottom: 0;
    height: 100%;
  }
}

@media (max-width: 768px) {
  .view-code-snippet {
    padding: 16px;
  }

  .top-bar {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .snippet-meta-tags {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-buttons {
    align-self: flex-end;
  }

  .md-code-header {
    height: 32px;
  }

  .md-code-block pre {
    font-size: 13px !important;
    padding: 12px !important;
  }

  .info-panel {
    grid-template-columns: 1fr;
  }
}
</style>