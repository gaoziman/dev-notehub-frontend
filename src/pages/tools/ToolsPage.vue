<template>
  <div class="tools-page">
    <!-- 页面头部区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">开发工具集</h1>
        <p class="page-description">精选高效开发工具，提升您的开发效率和代码质量</p>

        <div class="search-bar">
          <n-input-group>
            <n-input
                v-model:value="searchQuery"
                placeholder="搜索工具..."
                clearable
            >
              <template #prefix>
                <icon-font type="icon-search" :size="18" />
              </template>
            </n-input>
            <n-button type="primary">搜索</n-button>
          </n-input-group>
        </div>
      </div>
    </div>

    <!-- 最近使用工具区域 -->
    <div class="section recent-tools">
      <div class="section-header">
        <h2 class="section-title">
          <icon-font type="icon-recent" :size="20" />
          最近使用
        </h2>
        <n-button text size="small">
          查看全部
          <template #icon>
            <icon-font type="icon-arrow-right" :size="16" />
          </template>
        </n-button>
      </div>

      <div class="tool-cards">
        <div
            v-for="tool in recentTools"
            :key="tool.id"
            class="tool-card"
            @click="navigateToTool(tool.route)"
        >
          <div class="tool-icon" :style="{ backgroundColor: tool.iconColor }">
            <icon-font :type="tool.iconType" :size="24" color="#fff" />
          </div>
          <div class="tool-info">
            <h3 class="tool-name">{{ tool.title }}</h3>
            <p class="tool-time">{{ tool.lastUsed }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具分类区域 -->
    <div class="tool-categories">
      <n-tabs type="line" animated size="large" v-model:value="activeCategory">
        <n-tab-pane name="all" tab="全部工具">
          <div class="tools-grid">
            <div
                v-for="tool in filteredTools"
                :key="tool.id"
                class="tool-item"
                @click="navigateToTool(tool.route)"
            >
              <div class="tool-item-content">
                <div class="tool-item-icon" :style="{ backgroundColor: tool.iconColor }">
                  <icon-font :type="tool.iconType" :size="24" color="#fff" />
                </div>
                <div class="tool-item-info">
                  <h3 class="tool-item-name">{{ tool.title }}</h3>
                  <p class="tool-item-desc">{{ tool.description }}</p>
                </div>
                <div class="tool-item-badge" v-if="tool.isNew">新</div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="code" tab="代码工具">
          <div class="tools-grid">
            <div
                v-for="tool in getToolsByCategory('code')"
                :key="tool.id"
                class="tool-item"
                @click="navigateToTool(tool.route)"
            >
              <div class="tool-item-content">
                <div class="tool-item-icon" :style="{ backgroundColor: tool.iconColor }">
                  <icon-font :type="tool.iconType" :size="24" color="#fff" />
                </div>
                <div class="tool-item-info">
                  <h3 class="tool-item-name">{{ tool.title }}</h3>
                  <p class="tool-item-desc">{{ tool.description }}</p>
                </div>
                <div class="tool-item-badge" v-if="tool.isNew">新</div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="data" tab="数据处理">
          <div class="tools-grid">
            <div
                v-for="tool in getToolsByCategory('data')"
                :key="tool.id"
                class="tool-item"
                @click="navigateToTool(tool.route)"
            >
              <div class="tool-item-content">
                <div class="tool-item-icon" :style="{ backgroundColor: tool.iconColor }">
                  <icon-font :type="tool.iconType" :size="24" color="#fff" />
                </div>
                <div class="tool-item-info">
                  <h3 class="tool-item-name">{{ tool.title }}</h3>
                  <p class="tool-item-desc">{{ tool.description }}</p>
                </div>
                <div class="tool-item-badge" v-if="tool.isNew">新</div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="visual" tab="可视化工具">
          <div class="tools-grid">
            <div
                v-for="tool in getToolsByCategory('visual')"
                :key="tool.id"
                class="tool-item"
                @click="navigateToTool(tool.route)"
            >
              <div class="tool-item-content">
                <div class="tool-item-icon" :style="{ backgroundColor: tool.iconColor }">
                  <icon-font :type="tool.iconType" :size="24" color="#fff" />
                </div>
                <div class="tool-item-info">
                  <h3 class="tool-item-name">{{ tool.title }}</h3>
                  <p class="tool-item-desc">{{ tool.description }}</p>
                </div>
                <div class="tool-item-badge" v-if="tool.isNew">新</div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="utils" tab="实用工具">
          <div class="tools-grid">
            <div
                v-for="tool in getToolsByCategory('utils')"
                :key="tool.id"
                class="tool-item"
                @click="navigateToTool(tool.route)"
            >
              <div class="tool-item-content">
                <div class="tool-item-icon" :style="{ backgroundColor: tool.iconColor }">
                  <icon-font :type="tool.iconType" :size="24" color="#fff" />
                </div>
                <div class="tool-item-info">
                  <h3 class="tool-item-name">{{ tool.title }}</h3>
                  <p class="tool-item-desc">{{ tool.description }}</p>
                </div>
                <div class="tool-item-badge" v-if="tool.isNew">新</div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import IconFont from '@/components/common/IconFont.vue';

const router = useRouter();
const searchQuery = ref('');
const activeCategory = ref('all');

// 工具数据
const tools = [
  {
    id: 'json-formatter',
    title: 'JSON格式化工具',
    description: '格式化、验证和美化JSON数据，支持JSON到各种格式的转换',
    iconType: 'icon-json',
    iconColor: '#f0a020', // warning色
    route: '/tools/json-formatter',
    category: 'data',
    isNew: false,
    lastUsed: '3小时前'
  },
  {
    id: 'regex-tester',
    title: '正则表达式测试器',
    description: '测试、调试和优化正则表达式，提供直观的匹配结果展示',
    iconType: 'icon-regex',
    iconColor: '#d03050', // error色
    route: '/tools/regex-tester',
    category: 'code',
    isNew: false,
    lastUsed: '3小时前'
  },
  {
    id: 'sql-formatter',
    title: 'SQL格式化工具',
    description: '美化和格式化SQL查询语句，支持多种SQL方言',
    iconType: 'icon-sql',
    iconColor: '#6366f1', // 主题色
    route: '/tools/sql-formatter',
    category: 'data',
    isNew: false,
    lastUsed: '3小时前'
  },
  {
    id: 'color-picker',
    title: '配色方案生成器',
    description: '生成和管理色彩方案，支持各种颜色格式和导出',
    iconType: 'icon-color',
    iconColor: '#f44336',
    route: '/tools/color-picker',
    category: 'visual',
    isNew: false,
    lastUsed: '昨天'
  },
  {
    id: 'dev-toolkit',
    title: '效率工具箱',
    description: '多功能工具集，包含时间转换、Base64编码、IP查询、随机数据生成等实用功能',
    iconType: 'icon-toolkit',
    iconColor: '#18a058', // success色
    route: '/tools/dev-toolkit',
    category: 'utils',
    isNew: true,
    lastUsed: '刚刚'
  },
];

// 最近使用的工具
const recentTools = computed(() => {
  // 按照lastUsed排序，先显示"刚刚"使用的工具
  const sortedTools = [...tools].sort((a, b) => {
    if (a.lastUsed === '刚刚' && b.lastUsed !== '刚刚') return -1;
    if (a.lastUsed !== '刚刚' && b.lastUsed === '刚刚') return 1;
    return 0;
  });
  return sortedTools.slice(0, 5); // 取前5个作为最近使用
});

// 根据搜索筛选工具
const filteredTools = computed(() => {
  if (!searchQuery.value) return tools;

  const query = searchQuery.value.toLowerCase();
  return tools.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query)
  );
});

// 根据分类获取工具
const getToolsByCategory = (category) => {
  return tools.filter(tool => tool.category === category);
};

// 导航到工具页面
const navigateToTool = (route) => {
  router.push(route);
};
</script>

<style scoped>
.tools-page {
  width: 100%;
  padding: 0;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border-radius: 16px;
  padding: 40px;
  margin: 20px 20px 30px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transform: translate(-30%, 30%);
}

.header-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: white;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 25px;
}

.search-bar {
  width: 100%;
  max-width: 500px;
}

/* 最近使用工具区域样式 */
.section {
  margin: 0 20px 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.tool-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.tool-card {
  background-color: var(--card-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-info {
  overflow: hidden;
}

.tool-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-time {
  font-size: 0.8rem;
  color: var(--text-color-tertiary);
  margin: 0;
}

/* 工具分类区域样式 */
.tool-categories {
  background-color: var(--card-color);
  border-radius: 16px;
  padding: 20px;
  margin: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.tool-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tool-item:hover {
  transform: translateY(-3px);
}

.tool-item-content {
  background-color: var(--body-color);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s;
}

.tool-item:hover .tool-item-content {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-item-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.tool-item-info {
  flex: 1;
}

.tool-item-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 10px;
}

.tool-item-desc {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.tool-item-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #18a058;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    padding: 30px 20px;
    margin: 10px 10px 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .section {
    margin: 0 10px 30px;
  }

  .tool-categories {
    margin: 0 10px;
    padding: 15px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .tool-cards {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>