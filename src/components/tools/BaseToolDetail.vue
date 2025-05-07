<template>
  <div class="tool-detail-container">
    <div class="tool-header">
      <div class="tool-header-left">
        <div class="tool-icon">
          <icon-font :type="iconType" :size="32" :color="iconColor" />
        </div>
        <div class="tool-meta">
          <h1 class="tool-title">{{ title }}</h1>
          <p class="tool-description">{{ description }}</p>
        </div>
      </div>
      <div class="tool-actions">
        <n-space>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button circle secondary @click="toggleFavorite">
                <icon-font :type="isFavorite ? 'icon-star-fill' : 'icon-star'" :size="16" :color="isFavorite ? '#f0a020' : undefined" />
              </n-button>
            </template>
            {{ isFavorite ? '取消收藏' : '添加到收藏' }}
          </n-tooltip>

          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button circle secondary @click="showHelp = true">
                <icon-font type="icon-help" :size="16" />
              </n-button>
            </template>
            使用帮助
          </n-tooltip>

          <n-dropdown trigger="hover" :options="moreOptions" @select="handleMoreAction">
            <n-button circle secondary>
              <icon-font type="icon-more" :size="16" />
            </n-button>
          </n-dropdown>

          <n-button type="primary" @click="goBack">
            <template #icon>
              <icon-font type="icon-back" :size="16" />
            </template>
            返回工具集
          </n-button>
        </n-space>
      </div>
    </div>

    <n-divider />

    <div class="tool-content">
      <slot></slot>
    </div>

    <n-modal v-model:show="showHelp" preset="card" title="使用帮助" style="max-width: 600px">
      <div class="help-content">
        <h3>{{ title }} 使用指南</h3>
        <slot name="help-content">
          <p>这是默认帮助内容，可以通过插槽自定义。</p>
        </slot>
      </div>
      <template #footer>
        <n-button type="primary" @click="showHelp = false">我知道了</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: undefined
  }
});

const router = useRouter();
const message = useMessage();

const isFavorite = ref(false);
const showHelp = ref(false);

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  message.success(isFavorite.value ? '已添加到收藏' : '已从收藏中移除');
};

const moreOptions = [
  {
    label: '分享工具',
    key: 'share',
    icon: () => h(IconFont, { type: 'icon-share', size: 16 })
  },
  {
    label: '报告问题',
    key: 'report',
    icon: () => h(IconFont, { type: 'icon-report', size: 16 })
  },
  {
    label: '切换主题',
    key: 'theme',
    icon: () => h(IconFont, { type: 'icon-theme', size: 16 })
  }
];

const handleMoreAction = (key) => {
  switch (key) {
    case 'share':
      navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制到剪贴板');
      break;
    case 'report':
      message.info('问题报告功能正在开发中');
      break;
    case 'theme':
      message.info('主题切换功能正在开发中');
      break;
  }
};

const goBack = () => {
  router.push('/tools');
};
</script>

<style scoped>
.tool-detail-container {
  padding: 16px;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-1);
  min-height: calc(100vh - var(--header-height) - var(--content-padding) * 2 - var(--footer-height));
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.tool-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background-color: rgba(99, 102, 241, 0.1);
  flex-shrink: 0;
}

.tool-meta {
  flex: 1;
}

.tool-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 500;
}

.tool-description {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.tool-content {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .tool-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tool-actions {
    align-self: stretch;
    display: flex;
    justify-content: flex-end;
  }
}
</style>