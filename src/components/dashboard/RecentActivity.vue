<template>
  <n-card title="最近活动" class="recent-activity-card">
    <template #header-extra>
      <n-space>
        <n-select
            v-model:value="activityType"
            :options="activityTypeOptions"
            size="small"
            style="width: 120px"
        />
        <n-button text size="small" @click="refreshActivities">
          <template #icon>
            <icon-font type="icon-refresh" :size="16" />
          </template>
          刷新
        </n-button>
      </n-space>
    </template>

    <div class="activity-stream">
      <n-timeline>
        <n-timeline-item
            v-for="activity in activities"
            :key="activity.id"
            :type="activity.type"
            :color="getActivityColor(activity.category)"
            :time="activity.time"
        >
          <template #icon>
            <icon-font :type="getActivityIcon(activity.category)" :size="16" />
          </template>

          <div class="activity-content">
            <div class="activity-header">
              <n-space align="center">
                <span class="activity-title">{{ activity.title }}</span>
                <n-tag :type="getCategoryTagType(activity.category)" size="small" round>
                  {{ activity.category }}
                </n-tag>
              </n-space>
            </div>

            <p class="activity-description">{{ activity.description }}</p>

            <div class="activity-details" v-if="activity.details">
              <n-collapse-transition :show="activity.expanded">
                <div class="activity-details-content">
                  <div class="details-card">
                    <div v-html="activity.details"></div>
                  </div>
                </div>
              </n-collapse-transition>

              <n-button text size="small" @click="activity.expanded = !activity.expanded">
                {{ activity.expanded ? '收起详情' : '查看详情' }}
              </n-button>
            </div>

            <div class="activity-footer">
              <n-space>
                <n-button text size="small" v-if="activity.canNavigate" @click="navigateToContent(activity)">
                  <template #icon>
                    <icon-font type="icon-view" :size="14" />
                  </template>
                  查看内容
                </n-button>
                <n-button text size="small" v-if="activity.canContinue" @click="continueActivity(activity)">
                  <template #icon>
                    <icon-font type="icon-continue" :size="14" />
                  </template>
                  继续学习
                </n-button>
              </n-space>
            </div>
          </div>
        </n-timeline-item>
      </n-timeline>

      <n-empty
          v-if="activities.length === 0"
          description="暂无活动记录"
          size="small"
      >
        <template #icon>
          <icon-font type="icon-empty-data" :size="64" />
        </template>
        <template #extra>
          <n-button @click="refreshActivities">刷新</n-button>
        </template>
      </n-empty>

      <div class="load-more" v-if="activities.length > 0 && hasMoreActivities">
        <n-button text @click="loadMoreActivities">
          加载更多
          <template #icon>
            <icon-font type="icon-arrow-down" :size="14" />
          </template>
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const router = useRouter();
const message = useMessage();

// 活动类型选择
const activityType = ref('all');
const activityTypeOptions = [
  { label: '全部活动', value: 'all' },
  { label: '文档操作', value: 'document' },
  { label: '代码片段', value: 'code' },
  { label: '书签活动', value: 'bookmark' },
  { label: '学习记录', value: 'learning' }
];

// 分页控制
const currentPage = ref(1);
const pageSize = ref(5);
const hasMoreActivities = ref(true);

// 模拟活动数据
const activities = ref([
  {
    id: 1,
    title: '完成了 Vue3 高级组件设计课程',
    description: '学习了 3 小时，完成了所有课程内容和练习',
    category: '学习记录',
    type: 'success',
    time: '今天 14:30',
    details: '<p>本课程涵盖了以下内容：</p><ul><li>组件通信高级模式</li><li>自定义Hook设计</li><li>渲染函数与JSX</li><li>高阶组件封装</li><li>性能优化实践</li></ul>',
    expanded: false,
    canNavigate: true,
    canContinue: false,
    route: '/learning-tracks'
  },
  {
    id: 2,
    title: '添加了新的代码片段',
    description: 'Vue3响应式表单组件，支持验证和多种输入类型',
    category: '代码片段',
    type: 'info',
    time: '昨天 10:15',
    details: null,
    expanded: false,
    canNavigate: true,
    canContinue: false,
    route: '/dashboard/code-snippets/view/1'
  },
  {
    id: 3,
    title: '上传了技术文档',
    description: 'TypeScript高级类型体操实战指南.pdf',
    category: '文档',
    type: 'default',
    time: '2天前 18:45',
    details: null,
    expanded: false,
    canNavigate: true,
    canContinue: false,
    route: '/document/view/1'
  },
  {
    id: 4,
    title: '添加了新的书签',
    description: 'Vue3组合式API完全指南 - https://vuejs.org/guide/extras/composition-api-faq.html',
    category: '书签',
    type: 'info',
    time: '3天前 09:20',
    details: null,
    expanded: false,
    canNavigate: true,
    canContinue: false,
    route: '/dashboard/bookmarks'
  },
  {
    id: 5,
    title: '开始学习 TypeScript 类型体操',
    description: '完成了基础类型部分，计划继续学习高级类型',
    category: '学习记录',
    type: 'warning',
    time: '4天前 16:10',
    details: '<p>今天学习了TypeScript的以下内容：</p><ul><li>基础类型系统</li><li>接口与类型别名</li><li>泛型入门</li><li>类型断言与类型守卫</li></ul><p>下一步计划学习：条件类型、映射类型、类型推断等高级特性。</p>',
    expanded: false,
    canNavigate: false,
    canContinue: true,
    route: '/learning-tracks'
  }
]);

// 获取活动图标
const getActivityIcon = (category) => {
  switch (category) {
    case '文档':
      return 'icon-wendang1';
    case '代码片段':
      return 'icon-code';
    case '书签':
      return 'icon-bookmark';
    case '学习记录':
      return 'icon-xuexi';
    default:
      return 'icon-notification';
  }
};

// 获取活动颜色
const getActivityColor = (category) => {
  switch (category) {
    case '文档':
      return 'var(--primary-color)';
    case '代码片段':
      return 'var(--info-color)';
    case '书签':
      return 'var(--success-color)';
    case '学习记录':
      return 'var(--warning-color)';
    default:
      return 'var(--text-color-tertiary)';
  }
};

// 获取分类标签类型
const getCategoryTagType = (category) => {
  switch (category) {
    case '文档':
      return 'primary';
    case '代码片段':
      return 'info';
    case '书签':
      return 'success';
    case '学习记录':
      return 'warning';
    default:
      return 'default';
  }
};

// 刷新活动列表
const refreshActivities = () => {
  message.success('活动列表已刷新');
  // 在实际应用中，这里应该从API获取最新的活动
};

// 加载更多活动
const loadMoreActivities = () => {
  currentPage.value++;

  // 模拟加载更多数据
  const moreActivities = [
    {
      id: 6,
      title: '添加了Docker容器化部署笔记',
      description: '记录了Docker常用命令与多容器编排配置',
      category: '文档',
      type: 'default',
      time: '5天前 11:30',
      details: null,
      expanded: false,
      canNavigate: true,
      canContinue: false,
      route: '/document/view/2'
    },
    {
      id: 7,
      title: '更新了学习进度',
      description: 'Java后端开发路径进度 35% → 42%',
      category: '学习记录',
      type: 'info',
      time: '1周前 13:45',
      details: null,
      expanded: false,
      canNavigate: false,
      canContinue: true,
      route: '/learning-tracks'
    }
  ];

  activities.value = [...activities.value, ...moreActivities];

  // 设置是否还有更多数据
  if (currentPage.value >= 2) {
    hasMoreActivities.value = false;
  }
};

// 导航到内容
const navigateToContent = (activity) => {
  router.push(activity.route);
};

// 继续活动
const continueActivity = (activity) => {
  router.push(activity.route);
};
</script>

<style scoped>
.recent-activity-card {
  height: 100%;
}

.activity-stream {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
  margin-right: -10px;
}

.activity-content {
  padding: 0 0 16px 0;
}

.activity-header {
  margin-bottom: 4px;
}

.activity-title {
  font-weight: 500;
  color: var(--text-color-base);
}

.activity-description {
  margin: 8px 0;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.activity-details {
  margin-top: 4px;
}

.activity-details-content {
  margin: 8px 0;
}

.details-card {
  background-color: var(--body-color);
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: 13px;
}

.activity-footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px dashed var(--divider-color);
}

:deep(.n-timeline .n-timeline-item-content) {
  margin-bottom: 16px;
}

:deep(.n-timeline) {
  padding-left: 12px;
}

/* 自定义滚动条 */
.activity-stream::-webkit-scrollbar {
  width: 6px;
}

.activity-stream::-webkit-scrollbar-thumb {
  background-color: var(--divider-color);
  border-radius: 3px;
}

.activity-stream::-webkit-scrollbar-thumb:hover {
  background-color: var(--border-color);
}

.activity-stream::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>