<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="logo-container">
      <icon-font type="icon-zhishiku1" :size="30"/>
      <span v-if="!isCollapsed" class="logo-text">智慧知识库</span>
    </div>

    <n-menu
        v-model:value="activeKey"
        :collapsed="isCollapsed"
        :collapsed-width="60"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :indent="18"
        @update:value="handleMenuClick"
    />
  </aside>
</template>

<script setup>
import {h, ref, watchEffect} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import IconFont from "@/components/common/IconFont.vue";

const router = useRouter();
const route = useRoute();

// 从父组件接收折叠状态
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

// 初始化活动菜单项为当前路由
const activeKey = ref('dashboard');

// 监听路由变化，更新活动菜单项
watchEffect(() => {
  const routeName = route.name?.toString().toLowerCase();
  if (routeName) {
    activeKey.value = routeName;
  }
});

// 渲染图标的辅助函数
function renderIcon(icon) {
  return () => h('div', {class: 'sidebar-icon'}, [
    h(
        'n-icon',
        {
          size: '18',
        },
        {default: () => h(icon)}
    )
  ]);
}

// 更新后的菜单配置 - 将视频管理改为有子菜单的父级
const menuOptions = [
  {
    label: '主导航',
    key: 'main-nav',
    type: 'group',
    children: [
      {
        label: '仪表盘',
        key: 'dashboard',
        icon: () => h(IconFont, {type: 'icon-yibiaopan2'})
      },
      {
        label: '文档管理',
        key: 'documentpage',
        icon: () => h(IconFont, {type: 'icon-wendang'})
      },
      {
        label: '书签管理',
        key: 'bookmarkspage',
        icon: () => h(IconFont, {type: 'icon-shuqian1'})
      },
      {
        label: '代码片段',
        key: 'code-snippets',
        icon: () => h(IconFont, {type: 'icon-zhishitupu2'})
      },
      {
        label: '视频管理',
        key: 'video-parent',  // 将key改为video-parent，标识这是父级菜单
        icon: () => h(IconFont, {type: 'icon-icon-zhishitupu'}),
        // 添加子菜单配置
        children: [
          {
            label: '视频主页',
            key: 'video-home',
            icon: () => h(IconFont, {type: 'icon-shipin1'})
          },
          {
            label: '视频管理',
            key: 'video-manage',
            icon: () => h(IconFont, {type: 'icon-shipin-guanli'})
          },
          {
            label: '分类管理',
            key: 'video-categories',
            icon: () => h(IconFont, {type: 'icon-fenlei'})
          }
        ]
      },
      {
        label: '学习追踪',
        key: 'learning-tracks',
        icon: () => h(IconFont, {type: 'icon-zhuizong'})
      },
      {
        label: '工具合集',
        key: 'tools',
        icon: () => h(IconFont, {type: 'icon--'})
      },
      {
        label: '图标管理',
        key: 'iconfont',
        icon: () => h(IconFont, {type: 'icon-tubiaoku1'})
      }
    ]
  },
  {
    label: '知识分类',
    key: 'knowledge-categories',
    type: 'group',
    children: [
      {
        label: 'Java 基础',
        key: 'java-basic',
        icon: () => h(IconFont, {type: 'icon-java1'})
      },
      {
        label: 'Java 高级',
        key: 'java-advanced',
        icon: () => h(IconFont, {type: 'icon-bianzu34'})
      },
      {
        label: 'Spring',
        key: 'spring',
        icon: () => h(IconFont, {type: 'icon-spring'})
      },
      {
        label: 'SpringBoot',
        key: 'spring-boot',
        icon: () => h(IconFont, {type: 'icon-icon-spring-boot'})
      },
      {
        label: 'MySQL',
        key: 'mysql',
        icon: () => h(IconFont, {type: 'icon-MySQL'})
      },
      {
        label: 'Redis',
        key: 'redis',
        icon: () => h(IconFont, {type: 'icon-redis'})
      }
    ]
  }
];

// 更新后的菜单项点击处理函数
const handleMenuClick = (key) => {
  // 检查是否点击了父级视频管理菜单，如果是则不处理
  if (key === 'video-parent') {
    return;
  }

  // 处理主导航项
  if (['dashboard', 'documentpage', 'bookmarkspage', 'code-snippets', 'learning-tracks', 'tools', 'iconfont'].includes(key)) {
    router.push({name: key});
  }
  // 处理视频相关导航
  else if (['video-home', 'video-manage', 'video-categories'].includes(key)) {
    router.push({name: key});
  }
  // 处理知识分类项，跳转到文档页并传递分类参数
  else if (['java-basic', 'java-advanced', 'spring', 'spring-boot', 'mysql', 'redis'].includes(key)) {
    router.push({
      name: 'DocumentPage',
      query: {category: key}
    });
  }
};
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--card-color);
  border-right: 1px solid var(--divider-color);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  transition: width var(--transition-duration) var(--transition-timing-function);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 80px;
}

.logo-container {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--divider-color);
  gap: 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: 500;
  color: var(--primary-color);
  white-space: nowrap;
  transition: opacity var(--transition-duration) var(--transition-timing-function);
}

/* 自定义滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 自定义样式 - 为子菜单项添加缩进和视觉效果 */
.n-menu .n-menu-item {
  border-radius: 8px;
  margin: 4px 8px;
}

/* 视频管理子菜单特殊样式 */
.n-menu .n-menu-item-content-header[data-menu-key="video-parent"] {
  pointer-events: none; /* 禁止点击 */
}
</style>