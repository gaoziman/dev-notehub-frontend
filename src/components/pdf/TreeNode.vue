<template>
  <div class="tree-node-wrapper" :style="nodeStyles">
    <!-- 节点内容 -->
    <div
        class="node-content"
        :class="{ 'is-active': isActive }"
        @click="handleClick"
    >
      <!-- 展开/折叠图标 -->
      <span
          v-if="hasChildren"
          class="expand-icon"
          @click.stop="toggleExpand"
      >
        <icon-font :type="isExpanded ? 'icon-down' : 'icon-right'" />
      </span>
      <span v-else class="indent-space"></span>

      <!-- 书签图标 -->
      <span class="bookmark-icon">
        <icon-font type="icon-bookmark" />
      </span>

      <!-- 节点标签 -->
      <span class="node-label">{{ node.label }}</span>
    </div>

    <!-- 子节点 - 递归渲染 -->
    <div v-if="hasChildren && isExpanded" class="node-children">
      <div
          v-for="child in node.children"
          :key="child.id"
          class="child-node"
      >
        <tree-node
            :node="child"
            @node-click="handleNodeClick"
            :default-expand="defaultExpand"
            :level="level + 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  defaultExpand: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['node-click']);

// 获取全局展开状态
const defaultExpandAll = inject('defaultExpandAll', false);

// 状态
const isExpanded = ref(props.defaultExpand || defaultExpandAll);
const isActive = ref(false);

// 计算当前节点是否有子节点
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

// 计算样式
const nodeStyles = computed(() => {
  return {
    paddingLeft: `${props.level * 16}px`,
  };
});

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 处理节点点击
const handleClick = () => {
  isActive.value = true;
  emit('node-click', props.node);

  // 如果点击的节点有子节点，自动展开
  if (hasChildren.value && !isExpanded.value) {
    isExpanded.value = true;
  }

  // 重置active状态
  setTimeout(() => {
    isActive.value = false;
  }, 500);
};

// 传递子节点的点击事件
const handleNodeClick = (node) => {
  emit('node-click', node);
};
</script>

<style scoped>
.tree-node-wrapper {
  width: 100%;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-content:hover {
  background-color: rgba(99, 102, 241, 0.08);
}

.node-content.is-active {
  background-color: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.expand-icon {
  margin-right: 4px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.indent-space {
  width: 16px;
  margin-right: 4px;
}

.bookmark-icon {
  margin-right: 8px;
  color: #6366f1;
  opacity: 0.8;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-children {
  margin-left: 0;
}

/* 暗色模式 */
:global(.dark-mode) .node-content:hover {
  background-color: rgba(129, 140, 248, 0.15);
}

:global(.dark-mode) .node-content.is-active {
  background-color: rgba(129, 140, 248, 0.25);
  color: #a5b4fc;
}

:global(.dark-mode) .bookmark-icon {
  color: #818cf8;
}

:global(.dark-mode) .expand-icon {
  color: #9ca3af;
}
</style>