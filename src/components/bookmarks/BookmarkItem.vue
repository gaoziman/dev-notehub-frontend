<template>
  <div class="bookmark-item knowledge-card p-0">
    <div class="bookmark-content p-4">
      <div class="bookmark-header flex justify-between items-start">
        <div class="bookmark-info flex-1">
          <div class="bookmark-title-row flex items-start gap-2">
            <!-- 平台图标 -->
            <div class="platform-icon flex items-center justify-center">
              <icon-font :type="getPlatformIcon(bookmark.platform)" class="text-secondary" :size="20" />
            </div>

            <!-- 标题和链接 -->
            <div class="flex-1">
              <h3 class="bookmark-title text-lg font-bold mb-1 flex items-center">
                <a :href="getFullUrl(bookmark.url)" target="_blank" class="hover:text-primary">
                  {{ bookmark.title }}
                </a>
                <n-button
                    quaternary
                    circle
                    size="small"
                    class="ml-2"
                    @click="$emit('toggle-star', bookmark)"
                    :class="{ 'text-warning': bookmark.starred }"
                >
                  <icon-font :type="bookmark.starred ? 'icon-star-filled' : 'icon-star'" />
                </n-button>
              </h3>
              <div class="bookmark-url text-sm text-tertiary mb-2">
                {{ bookmark.url }}
              </div>
            </div>
          </div>

          <!-- 描述 -->
          <p class="bookmark-description text-secondary mb-3">{{ bookmark.description }}</p>

          <!-- 标签和时间信息 -->
          <div class="bookmark-meta flex justify-between items-center">
            <div class="bookmark-tags">
              <n-tag
                  v-for="tag in bookmark.tags"
                  :key="tag"
                  size="small"
                  class="mr-2"
                  :color="getTagColor(tag)"
              >
                {{ tag }}
              </n-tag>
            </div>
            <div class="bookmark-time text-sm text-tertiary">
              {{ bookmark.createdTime }}
            </div>
          </div>
        </div>

        <!-- 操作按钮区 -->
        <div class="bookmark-actions ml-4">
          <n-dropdown trigger="click" :options="actionOptions" @select="handleAction">
            <n-button quaternary circle>
              <icon-font type="icon-more" />
            </n-button>
          </n-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, defineProps, defineEmits, computed } from 'vue';
import { NDropdown, NButton, NTag } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  bookmark: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'toggle-star']);

// 下拉菜单选项
const actionOptions = computed(() => [
  {
    label: '编辑',
    key: 'edit',
    icon: () => h(IconFont, { type: 'icon-edit', size: 16 })
  },
  {
    label: '复制链接',
    key: 'copy',
    icon: () => h(IconFont, { type: 'icon-copy', size: 16 })
  },
  {
    label: '删除',
    key: 'delete',
    icon: () => h(IconFont, { type: 'icon-delete', size: 16 })
  }
]);

// 处理操作
function handleAction(key) {
  switch (key) {
    case 'edit':
      emit('edit', props.bookmark);
      break;
    case 'copy':
      copyToClipboard(props.bookmark.url);
      break;
    case 'delete':
      emit('delete', props.bookmark);
      break;
  }
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    window.$message?.success('链接已复制到剪贴板');
  }).catch(() => {
    window.$message?.error('复制失败');
  });
}

// 获取完整URL
function getFullUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

// 获取平台图标
function getPlatformIcon(platform) {
  const iconMap = {
    'github': 'icon-icon_github',
    'juejin': 'icon-juejin',
    'csdn': 'icon-csdn1',
    'wechat': 'icon-weixingongzhonghao',
    'zhihu': 'icon-zhihu',
    'other': 'icon-link1'
  };

  return iconMap[platform] || 'icon-link1';
}

// 获取标签颜色
function getTagColor(tag) {
  const colorMap = {
    'Java': { color: '#2080f0', textColor: '#fff' },
    'Spring': { color: '#18a058', textColor: '#fff' },
    'SpringBoot': { color: '#18a058', textColor: '#fff' },
    'MySQL': { color: '#d03050', textColor: '#fff' },
    'Redis': { color: '#d03050', textColor: '#fff' },
    'JVM': { color: '#2080f0', textColor: '#fff' },
    '性能优化': { color: '#f0a020', textColor: '#fff' },
    '微服务': { color: '#8a2be2', textColor: '#fff' },
    '分布式': { color: '#8a2be2', textColor: '#fff' },
    '消息中间件': { color: '#f0a020', textColor: '#fff' },
    '数据库': { color: '#d03050', textColor: '#fff' },
    'RocketMQ': { color: '#f0a020', textColor: '#fff' }
  };

  return colorMap[tag] || null;
}
</script>

<style scoped>
.bookmark-item {
  transition: all 0.3s ease;
  overflow: hidden;
}

.bookmark-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-2);
}

.platform-icon {
  width: 24px;
  height: 24px;
}

.bookmark-title {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.bookmark-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.bookmark-item:hover .bookmark-actions {
  opacity: 1;
}

/* 自定义过渡效果 */
:deep(.n-tag) {
  transition: all 0.3s ease;
}

:deep(.n-tag:hover) {
  transform: translateY(-1px);
}
</style>