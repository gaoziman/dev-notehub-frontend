<template>
  <n-card title="快速访问" class="quick-access-card">
    <div class="quick-access-grid">
      <div
          v-for="item in quickAccessItems"
          :key="item.id"
          class="quick-access-item"
          @click="navigateTo(item.route)"
      >
        <div class="quick-icon" :style="{ backgroundColor: item.bgColor }">
          <icon-font :type="item.icon" :size="24" color="#fff" />
        </div>
        <div class="quick-text">{{ item.title }}</div>
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <n-button text size="small" @click="showEditQuickAccess = true">
          <template #icon>
            <icon-font type="icon-setting" :size="16" />
          </template>
          自定义快捷入口
        </n-button>
      </div>
    </template>
  </n-card>

  <!-- 编辑快速访问对话框 -->
  <n-modal v-model:show="showEditQuickAccess" preset="card" title="编辑快速访问" style="width: 600px;" :bordered="false">
    <n-alert title="提示" type="info" style="margin-bottom: 16px;">
      拖动重新排序，或点击星标切换显示状态
    </n-alert>

    <n-scrollbar style="max-height: 400px;">
      <n-list hoverable clickable>
        <n-list-item v-for="item in allQuickAccessItems" :key="item.id">
          <div class="edit-item">
            <div class="edit-item-icon" :style="{ backgroundColor: item.bgColor }">
              <icon-font :type="item.icon" :size="18" color="#fff" />
            </div>
            <div class="edit-item-title">{{ item.title }}</div>
            <div class="edit-item-actions">
              <n-button quaternary circle size="small" @click="toggleFavorite(item)">
                <template #icon>
                  <icon-font :type="item.favorite ? 'icon-star-filled' : 'icon-star'" :size="16" />
                </template>
              </n-button>
              <n-button quaternary circle size="small">
                <template #icon>
                  <icon-font type="icon-drag" :size="16" />
                </template>
              </n-button>
            </div>
          </div>
        </n-list-item>
      </n-list>
    </n-scrollbar>

    <template #footer>
      <div style="display: flex; justify-content: flex-end;">
        <n-button @click="showEditQuickAccess = false">取消</n-button>
        <n-button type="primary" style="margin-left: 12px;" @click="saveQuickAccessChanges">保存</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const router = useRouter();
const message = useMessage();
const showEditQuickAccess = ref(false);

// 快速访问项
const quickAccessItems = ref([
  {
    id: 1,
    title: '文档管理',
    icon: 'icon-wendang1',
    bgColor: '#6366f1',
    route: '/dashboard/documents',
    favorite: true
  },
  {
    id: 2,
    title: '书签管理',
    icon: 'icon-bookmark',
    bgColor: '#10b981',
    route: '/dashboard/bookmarks',
    favorite: true
  },
  {
    id: 3,
    title: '代码片段',
    icon: 'icon-code',
    bgColor: '#f59e0b',
    route: '/dashboard/code-snippets',
    favorite: true
  },
  {
    id: 4,
    title: '学习追踪',
    icon: 'icon-xuexi',
    bgColor: '#ef4444',
    route: '/dashboard/learning-tracks',
    favorite: true
  },
  {
    id: 5,
    title: '工具集',
    icon: 'icon-tool',
    bgColor: '#8b5cf6',
    route: '/dashboard/tools',
    favorite: true
  },
  {
    id: 6,
    title: '搜索',
    icon: 'icon-search',
    bgColor: '#0ea5e9',
    route: '/search',
    favorite: true
  }
]);

// 所有可选的快速访问项
const allQuickAccessItems = ref([
  ...quickAccessItems.value,
  {
    id: 7,
    title: '图标库',
    icon: 'icon-icon',
    bgColor: '#ec4899',
    route: '/dashboard/icon',
    favorite: false
  },
  {
    id: 8,
    title: 'JSON格式化',
    icon: 'icon-json',
    bgColor: '#f97316',
    route: '/tools/json-formatter',
    favorite: false
  },
  {
    id: 9,
    title: 'SQL格式化',
    icon: 'icon-sql',
    bgColor: '#14b8a6',
    route: '/tools/sql-formatter',
    favorite: false
  }
]);

// 导航到指定路由
const navigateTo = (route) => {
  router.push(route);
};

// 切换收藏状态
const toggleFavorite = (item) => {
  item.favorite = !item.favorite;
};

// 保存快速访问更改
const saveQuickAccessChanges = () => {
  // 更新快速访问列表，只保留收藏的项目
  quickAccessItems.value = allQuickAccessItems.value
      .filter(item => item.favorite)
      .slice(0, 6); // 限制最多显示6个

  message.success('快速访问设置已保存');
  showEditQuickAccess.value = false;
};
</script>

<style scoped>
.quick-access-card {
  height: 100%;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quick-access-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: var(--border-radius);
  background-color: var(--body-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-access-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-1);
}

.quick-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.quick-text {
  font-weight: 500;
  color: var(--text-color-base);
}

.footer-actions {
  display: flex;
  justify-content: center;
}

/* 编辑模式样式 */
.edit-item {
  display: flex;
  align-items: center;
  width: 100%;
}

.edit-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.edit-item-title {
  flex: 1;
  font-weight: 500;
}

.edit-item-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 500px) {
  .quick-access-grid {
    grid-template-columns: 1fr;
  }
}
</style>